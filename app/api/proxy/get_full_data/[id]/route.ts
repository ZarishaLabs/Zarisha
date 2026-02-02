import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';
import AnimePahe from '@consumet/extensions/dist/providers/anime/animepahe';
import { cache, generateCacheKey } from '@/lib/utils/cache';
import { CACHE_CONFIG } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const cacheKey = generateCacheKey('proxy_details', id);
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const animepahe = new AnimePahe();
    const info = await animepahe.fetchAnimeInfo(id);
    
    if (info && info.title) {
      const mappedData = {
        id: id,
        title: info.title,
        japanese_title: undefined,
        type: info.type || 'TV',
        episodes: info.totalEpisodes || 0,
        status: info.status || 'Unknown',
        aired: undefined,
        season: undefined,
        year: info.releaseDate ? parseInt(info.releaseDate) : null,
        poster: info.image ? `/api/proxy/image?url=${encodeURIComponent(info.image)}` : '',
        synopsis: info.description || '',
        genres: info.genres || [],
        studio: undefined,
        episodes_list: (info.episodes || []).map((ep: any) => ({
          id: ep.number,
          episode: ep.number,
          title: ep.title || `Episode ${ep.number}`,
          snapshot: ep.image ? `/api/proxy/image?url=${encodeURIComponent(ep.image)}` : '',
          session: ep.id,
          filler: false,
        })),
      };

      cache.set(cacheKey, mappedData, CACHE_CONFIG.ANIME_DETAILS_TTL);
      return NextResponse.json(mappedData);
    }
    
    throw new Error('Consumet returned empty data');
  } catch (consumetError) {
    console.error('Consumet failed, trying direct scrape:', consumetError);
    try {
      const episodesUrl = `https://animepahe.si/api?m=release&id=${id}&sort=episode_asc&page=1`;
      const epRes = await fetch(episodesUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://animepahe.si/',
        }
      });

      if (!epRes.ok) throw new Error(`Episodes API returned ${epRes.status}`);
      const epData = await epRes.json();
      const mainUrl = `https://animepahe.si/a/${id}`;
      const mainRes = await fetch(mainUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Referer': 'https://animepahe.si/',
        },
        redirect: 'follow'
      });

      if (!mainRes.ok) {
        console.error(`Main page returned ${mainRes.status} for ${mainUrl}`);
        throw new Error(`Main page returned ${mainRes.status}`);
      }
      const html = await mainRes.text();
      if (html.includes('DDoS-Guard') || html.includes('ddos-guard')) {
        throw new Error('Blocked by DDoS protection');
      }
      
      const $ = load(html);

      const title = $('div.title-wrapper > h1 > span').first().text().trim();
      const poster = $('div.anime-poster a').attr('href') || '';
      const synopsis = $('div.anime-summary').text().trim();
      
      let japanese_title = '';
      let aired = '';
      let season = '';
      let typeText = 'TV';
      let statusText = 'Unknown';
      let studio = '';

      $('div.anime-info p').each((_, el) => {
        const text = $(el).text();
        if (text.includes('Japanese:')) japanese_title = text.replace('Japanese:', '').trim();
        if (text.includes('Aired:')) aired = text.replace('Aired:', '').trim();
        if (text.includes('Season:')) season = text.replace('Season:', '').trim();
        if (text.includes('Type:')) typeText = text.replace('Type:', '').trim();
        if (text.includes('Status:')) statusText = text.replace('Status:', '').trim().toLowerCase();
        if (text.includes('Studio:')) studio = text.replace('Studio:', '').trim();
      });

      let status: string = 'Unknown';
      if (statusText.includes('currently airing')) status = 'Airing';
      else if (statusText.includes('finished airing')) status = 'Completed';
      else if (statusText.includes('upcoming')) status = 'Upcoming';

      let year: number | null = null;
      const yearMatch = aired.match(/\d{4}/) || season.match(/\d{4}/);
      if (yearMatch) {
        year = parseInt(yearMatch[0]);
      }

      const mappedData = {
        id: id,
        title: title || 'Unknown Title',
        japanese_title: japanese_title || undefined,
        type: typeText || 'TV',
        episodes: epData.total || 0,
        status: status,
        aired: aired || undefined,
        season: season || undefined,
        year: year && !isNaN(year) ? year : null,
        poster: poster ? `/api/proxy/image?url=${encodeURIComponent(poster)}` : '',
        synopsis: synopsis,
        genres: $('div.anime-genre ul li').map((_, el) => $(el).find('a').attr('title')).get(),
        studio: studio || undefined,
        episodes_list: (epData.data || []).map((ep: any) => ({
          id: ep.episode,
          episode: ep.episode,
          title: ep.title || `Episode ${ep.episode}`,
          snapshot: ep.snapshot ? `/api/proxy/image?url=${encodeURIComponent(ep.snapshot)}` : '',
          session: ep.session,
          filler: ep.filler === 1,
        })),
      };

      cache.set(cacheKey, mappedData, CACHE_CONFIG.ANIME_DETAILS_TTL);
      return NextResponse.json(mappedData);
    } catch (scrapeError) {
      console.error('Both Consumet and scraping failed:', scrapeError);
      return NextResponse.json({ error: 'Failed to fetch anime details. The source may be temporarily unavailable.' }, { status: 500 });
    }
  }
}
