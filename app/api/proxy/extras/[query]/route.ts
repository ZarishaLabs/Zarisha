import { NextRequest, NextResponse } from 'next/server';
import Anilist from '@consumet/extensions/dist/providers/meta/anilist';
import { cache, generateCacheKey } from '@/lib/utils/cache';
import { CACHE_CONFIG } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const cacheKey = generateCacheKey('proxy_extras', query);
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const anilist = new Anilist();
    const results = await anilist.search(query);
    
    if (!results.results.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const bestMatch = results.results[0];
    const details = await anilist.fetchAnimeInfo(bestMatch.id);

    const response = {
      trailer: details.trailer,
      characters: details.characters || [],
      recommendations: details.recommendations || [],
      links: details.mappings || [], // External links
    };

    cache.set(cacheKey, response, CACHE_CONFIG.ANIME_DETAILS_TTL); // Reuse details TTL
    return NextResponse.json(response);

  } catch (error) {
    console.error('Extras API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch extras' }, { status: 500 });
  }
}
