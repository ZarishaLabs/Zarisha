import { NextRequest, NextResponse } from 'next/server';
import AnimePahe from '@consumet/extensions/dist/providers/anime/animepahe';
import { cache, generateCacheKey } from '@/lib/utils/cache';
import { CACHE_CONFIG } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';

const POPULAR_SEARCHES = [
  'solo leveling',
  'one piece', 
  'jujutsu kaisen',
  'demon slayer',
  'attack on titan',
  'chainsaw man',
  'spy x family',
  'blue lock',
  'my hero academia',
  'dragon ball',
  'naruto',
  'bleach',
  'one punch man',
  'mob psycho',
  'vinland saga',
  'frieren',
  'oshi no ko',
  'mushoku tensei',
];

export async function GET(request: NextRequest) {
  const cacheKey = generateCacheKey('proxy_popular', 'v1');
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const animepahe = new AnimePahe();
    const allResults: any[] = [];
    const seenIds = new Set<string>();
    for (const term of POPULAR_SEARCHES.slice(0, 10)) {
      try {
        const searchResults = await animepahe.search(term);
        for (const item of searchResults.results || []) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            allResults.push({
              id: item.id,
              title: item.title,
              type: item.type || 'TV',
              episodes: item.episodes || 0,
              status: item.status || 'Unknown',
              year: item.releaseDate ? parseInt(item.releaseDate) : 0,
              score: item.rating ? String(item.rating) : undefined,
              poster: item.image ? `/api/proxy/image?url=${encodeURIComponent(item.image)}` : '',
              session: item.id,
            });
          }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        continue;
      }
    }
    const sortedResults = allResults
      .sort((a, b) => {
        const scoreA = a.score ? parseFloat(a.score) : 0;
        const scoreB = b.score ? parseFloat(b.score) : 0;
        return scoreB - scoreA;
      })
      .slice(0, 30);

    const response = {
      total: sortedResults.length,
      last_page: 1,
      current_page: 1,
      per_page: sortedResults.length,
      data: sortedResults,
    };
    cache.set(cacheKey, response, 3600000);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Popular API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch popular anime' }, { status: 500 });
  }
}
