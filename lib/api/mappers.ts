import type { IAnimeResult, IAnimeInfo } from '@consumet/extensions';
import { SearchResultItem, AnimeDetails, Episode, AnimeStatus, AnimeType } from './api-types';

const proxyImage = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    return `/api/proxy/image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export function mapSearchToLocal(result: IAnimeResult): SearchResultItem {
  return {
    id: result.id, // Consumet ID is string
    title: String(result.title),
    type: (result.type as AnimeType) || 'TV',
    episodes: result.totalEpisodes || 0,
    status: (result.status as AnimeStatus) || 'Unknown',
    year: result.releaseDate ? parseInt(String(result.releaseDate)) : 0,
    score: result.rating ? String(result.rating) : undefined,
    poster: proxyImage(result.image),
    session: result.id, // Use ID as session
  };
}

export function mapDetailsToLocal(info: IAnimeInfo): AnimeDetails {
  const year = info.releaseDate ? parseInt(String(info.releaseDate)) : new Date().getFullYear();

  return {
    id: info.id,
    title: String(info.title),
    japanese_title: typeof info.title === 'object' ? (info.title as any).native : undefined,
    type: (info.type as AnimeType) || 'TV',
    episodes: info.totalEpisodes || info.episodes?.length || 0,
    status: (info.status as AnimeStatus) || 'Unknown',
    year: year,
    score: info.rating ? String(info.rating) : undefined,
    poster: proxyImage(info.image),
    synopsis: info.description || '',
    genres: info.genres || [],
    studio: info.studios?.[0] || undefined,
    episodes_list: info.episodes?.map(mapEpisodeToLocal) || [],
    recommendations: info.recommendations?.map(rec => ({
      id: rec.id!,
      title: String(rec.title),
      type: (rec.type as AnimeType) || 'TV',
      episodes: 0, // Not available in recs
      status: (rec.status as AnimeStatus) || 'Unknown',
      year: 0,
      score: undefined,
      poster: proxyImage(rec.image),
      session: rec.id!,
    })) || [],
    relations: info.relations?.map(rel => ({
      id: rel.id!,
      title: String(rel.title),
      type: (rel.type as AnimeType) || 'TV',
      episodes: 0,
      status: (rel.status as AnimeStatus) || 'Unknown',
      year: 0,
      score: undefined,
      poster: proxyImage(rel.image),
      session: rel.id!,
    })) || [],
  };
}

export function mapEpisodeToLocal(ep: any): Episode {
  return {
    id: ep.number, // Local ID
    episode: ep.number,
    title: ep.title || `Episode ${ep.number}`,
    snapshot: proxyImage(ep.image),
    session: ep.id, // Important for fetching source
    filler: ep.isFiller || false,
  };
}
