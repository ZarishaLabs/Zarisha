import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';
import AnimePahe from '@consumet/extensions/dist/providers/anime/animepahe';
import { extractFromKwikPage } from '@/lib/extractors/kwik-fallback';

export const dynamic = 'force-dynamic';

const ANIMEPAHE_BASE = 'https://animepahe.si';

function isKwikError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('Kwik');
}

async function fetchEpisodeSourcesFallback(episodeId: string): Promise<{
  sources: Array<{ quality: string; url: string; isDub?: boolean }>;
  title?: string;
} | null> {
  const [animeId, session] = episodeId.split('/');
  if (!animeId || !session) return null;

  const playUrl = `${ANIMEPAHE_BASE}/play/${animeId}/${session}`;
  let html: string;
  try {
    const res = await fetch(playUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': `${ANIMEPAHE_BASE}/anime/${animeId}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  if (!html || html.includes('DDoS-Guard') || html.includes('ddos-guard')) return null;

  const $ = load(html);
  const links: Array<{ url: string; quality: string; audio?: string }> = [];

  $('div#resolutionMenu > button').each((_, el) => {
    const url = $(el).attr('data-src');
    const quality = $(el).text().trim() || 'default';
    const audio = $(el).attr('data-audio');
    if (url) links.push({ url, quality, audio });
  });

  if (!links.length) return null;

  const sources: Array<{ quality: string; url: string; isDub?: boolean }> = [];

  for (const link of links) {
    try {
      const streamUrl = await extractFromKwikPage(link.url);
      if (streamUrl) {
        sources.push({
          quality: link.quality,
          url: streamUrl,
          isDub: link.audio === 'eng',
        });
        break;
      }
    } catch {
      continue;
    }
  }

  if (!sources.length) return null;

  const title = $('div.anime-title').first().text().trim();
  return { sources, title };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ animeId: string; episodeNumber: string }> }
) {
  const { animeId, episodeNumber } = await params;
  const epNum = parseInt(episodeNumber);

  if (!animeId || !episodeNumber || isNaN(epNum)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  try {
    const animepahe = new AnimePahe();
    const animeInfo = await animepahe.fetchAnimeInfo(animeId);

    if (!animeInfo?.episodes?.length) {
      return NextResponse.json({ error: 'No episodes found' }, { status: 404 });
    }
    const episodeData = animeInfo.episodes.find((e: { number: number }) => e.number === epNum);
    if (!episodeData) {
      return NextResponse.json({ error: `Episode ${epNum} not found` }, { status: 404 });
    }

    const episodeId = episodeData.id; // Format: animeId/session
    let sources: Array<{ quality?: string; url: string; isDub?: boolean }> | null = null;
    let episodeTitle = episodeData.title;
    try {
      const consumetSources = await animepahe.fetchEpisodeSources(episodeId);
      if (consumetSources?.sources?.length) {
        sources = consumetSources.sources;
      }
    } catch (consumetErr) {
      if (isKwikError(consumetErr)) {
        console.warn('Consumet Kwik failed, trying fallback:', (consumetErr as Error).message);
        const fallback = await fetchEpisodeSourcesFallback(episodeId);
        if (fallback?.sources.length) {
          sources = fallback.sources;
          if (fallback.title) episodeTitle = fallback.title;
        }
      }
      if (!sources) throw consumetErr;
    }

    if (!sources?.length) {
      return NextResponse.json({ error: 'No streaming sources found for this episode' }, { status: 404 });
    }
    const mappedStreams = sources.map((s) => ({
      quality: s.quality || 'default',
      url: s.url,
      audio: s.isDub ? 'eng' : 'jpn',
      size: '',
      type: s.url?.includes('.m3u8') ? 'm3u8' : 'mp4',
    }));

    return NextResponse.json({
      episode: epNum,
      title: episodeTitle || `Episode ${epNum}`,
      streams: mappedStreams,
      direct_links: mappedStreams,
    });
  } catch (error) {
    console.error('Episode Source API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch episode source' }, { status: 500 });
  }
}
