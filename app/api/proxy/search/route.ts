import { NextRequest, NextResponse } from 'next/server';
import AnimePahe from '@consumet/extensions/dist/providers/anime/animepahe';
import { mapSearchToLocal } from '@/lib/api/mappers';
import { cache, generateCacheKey } from '@/lib/utils/cache';
import { CACHE_CONFIG } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';

const MAX_RESULTS = 120;
const UPSTREAM_PAGE_SIZE = 8;

type UpstreamPage = { total: number; last_page: number; data: { id: string; title: string; type: string; episodes: number; status: string; year: number; score?: string; poster: string; session: string }[] };

function mapUpstreamItem(item: Record<string, unknown>): UpstreamPage['data'][0] {
  return {
    id: String(item.session ?? ''),
    title: String(item.title ?? ''),
    type: String(item.type ?? 'TV'),
    episodes: Number(item.episodes ?? 0),
    status: String(item.status ?? 'Unknown'),
    year: Number(item.year ?? 0),
    score: item.score != null ? String(item.score) : undefined,
    poster: item.poster ? `/api/proxy/image?url=${encodeURIComponent(String(item.poster))}` : '',
    session: String(item.session ?? ''),
  };
}

interface AnimePaheProvider {
  client: { get: (url: string, opts: { headers: Record<string, string> }) => Promise<{ data: { data?: unknown[]; total?: number; last_page?: number } }> };
  Headers: (sessionId: boolean | string) => Record<string, string>;
  baseUrl: string;
}

async function fetchOneUpstreamPage(
  provider: AnimePaheProvider,
  query: string,
  page: number
): Promise<UpstreamPage> {
  const cacheKey = generateCacheKey('proxy_search_upstream', `${query}_${page}`);
  const cached = cache.get<UpstreamPage>(cacheKey);
  if (cached) return cached;

  const url = `${provider.baseUrl}/api?m=search&q=${encodeURIComponent(query)}&page=${page}`;
  const { data: rawData } = await provider.client.get(url, { headers: provider.Headers(false) });
  if (!rawData || typeof rawData !== 'object' || !Array.isArray(rawData.data)) {
    throw new Error('Invalid upstream response (e.g. DDoS-Guard HTML)');
  }
  const data = rawData.data.map((item) => mapUpstreamItem(item as Record<string, unknown>));
  const result: UpstreamPage = {
    total: typeof rawData.total === 'number' ? rawData.total : data.length,
    last_page: typeof rawData.last_page === 'number' ? rawData.last_page : 1,
    data,
  };
  cache.set(cacheKey, result, CACHE_CONFIG.SEARCH_TTL);
  return result;
}

const UPSTREAM_RETRIES = 2;

async function fetchUpstreamPage(
  provider: AnimePaheProvider,
  query: string,
  page: number
): Promise<UpstreamPage | null> {
  for (let attempt = 0; attempt < UPSTREAM_RETRIES; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 300));
      return await fetchOneUpstreamPage(provider, query, page);
    } catch {
      // retry
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(120, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const cacheKey = generateCacheKey('proxy_search', `${query}_${page}_${limit}`);
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const provider = new AnimePahe() as unknown as AnimePaheProvider;
    const startIndex = (page - 1) * limit;
    const pagesToFetch = Math.min(
      Math.ceil((startIndex + limit) / UPSTREAM_PAGE_SIZE),
      Math.ceil(MAX_RESULTS / UPSTREAM_PAGE_SIZE)
    );
    
    const pages: UpstreamPage[] = [];
    const seen = new Set<string>();
    const allResults: UpstreamPage['data'] = [];
    let noNewResultsCount = 0;
    for (let upstreamPage = 1; upstreamPage <= pagesToFetch; upstreamPage++) {
      const result = await fetchUpstreamPage(provider, query, upstreamPage);
      if (!result || result.data.length === 0) break;
      
      pages.push(result);
      const beforeCount = allResults.length;
      for (const item of result.data) {
        if (!seen.has(item.session)) {
          seen.add(item.session);
          allResults.push(item);
        }
      }
      if (allResults.length >= startIndex + limit) break;
      if (allResults.length === beforeCount) {
        noNewResultsCount++;
        if (noNewResultsCount >= 2) break;
      } else {
        noNewResultsCount = 0;
      }
      if (result.last_page > 0 && upstreamPage >= result.last_page) break;
    }
    
    if (allResults.length === 0) {
      const emptyResponse = {
        total: 0,
        last_page: 1,
        current_page: page,
        per_page: limit,
        data: [],
      };
      cache.set(cacheKey, emptyResponse, CACHE_CONFIG.SEARCH_TTL);
      return NextResponse.json(emptyResponse);
    }
    const total = Math.min(allResults.length, MAX_RESULTS);
    const lastPage = Math.max(1, Math.ceil(total / limit));
    const localStart = Math.min(startIndex, allResults.length);
    const sliced = allResults.slice(localStart, localStart + limit);

    const response = {
      total,
      last_page: lastPage,
      current_page: page,
      per_page: limit,
      data: sliced,
    };

    cache.set(cacheKey, response, CACHE_CONFIG.SEARCH_TTL);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API Error:', error);

    try {
      const animepahe = new AnimePahe();
      const results = await animepahe.search(query);
      const rawResults = results?.results ?? [];
      const mappedData = rawResults.map(mapSearchToLocal);
      const total = Math.min(mappedData.length, MAX_RESULTS);
      const lastPage = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      const response = {
        total,
        last_page: lastPage,
        current_page: page,
        per_page: limit,
        data: mappedData.slice(start, start + limit),
      };
      return NextResponse.json(response);
    } catch (fallbackError) {
      console.error('Fallback search API Error:', fallbackError);
      return NextResponse.json({ error: 'Failed to search anime' }, { status: 500 });
    }
  }
}
