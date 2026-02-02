import { apiClient, buildQueryString } from './api-client';
import {
  SearchResponse,
  SearchResponseSchema,
  AnimeDetails,
  AnimeDetailsSchema,
  EpisodeStreamData,
  EpisodeStreamDataSchema,
} from './api-types';
import { cache, generateCacheKey } from '../utils/cache';
import { CACHE_CONFIG } from '../utils/constants';
import { ERROR_CODES } from '../utils/constants';
import { ApiError } from '../utils/error-handler';

export async function searchAnime(
  query: string,
  page: number = 1,
  limit: number = 12
): Promise<SearchResponse> {
  if (!query || query.trim().length === 0) {
    throw new ApiError(
      'Search query cannot be empty',
      ERROR_CODES.INVALID_RESPONSE
    );
  }

  const cacheKey = generateCacheKey('search', query, page, limit);
  const cached = cache.get<SearchResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = buildQueryString({ query: query.trim(), page, limit });
  const data = await apiClient<unknown>(`/search${queryParams}`);
  const parseResult = SearchResponseSchema.safeParse(data);
  
  if (!parseResult.success) {
    console.error('Validation Error:', parseResult.error);
    throw new ApiError(
      `Invalid search response format: ${parseResult.error.message}`,
      ERROR_CODES.INVALID_RESPONSE,
      undefined,
      parseResult.error
    );
  }
  cache.set(cacheKey, parseResult.data, CACHE_CONFIG.SEARCH_TTL);
  return parseResult.data;
}

export async function getAnimeDetails(animeId: string): Promise<AnimeDetails> {
  if (!animeId || animeId.trim().length === 0) {
    throw new ApiError(
      'Anime ID cannot be empty',
      ERROR_CODES.INVALID_RESPONSE
    );
  }

  const cacheKey = generateCacheKey('anime', animeId);
  const cached = cache.get<AnimeDetails>(cacheKey);
  if (cached) return cached;

  const data = await apiClient<unknown>(`/get_full_data/${encodeURIComponent(animeId)}`);
  const parseResult = AnimeDetailsSchema.safeParse(data);
  
  if (!parseResult.success) {
    console.error('Anime Details Validation Error:', {
      animeId,
      error: parseResult.error.format(),
      rawData: data
    });
    throw new ApiError(
      'Invalid anime details response format',
      ERROR_CODES.INVALID_RESPONSE,
      undefined,
      parseResult.error
    );
  }
  cache.set(cacheKey, parseResult.data, CACHE_CONFIG.ANIME_DETAILS_TTL);
  return parseResult.data;
}

export async function getEpisodeSource(
  animeId: string,
  episodeNumber: number
): Promise<EpisodeStreamData> {
  if (!animeId || animeId.trim().length === 0) {
    throw new ApiError(
      'Anime ID cannot be empty',
      ERROR_CODES.INVALID_RESPONSE
    );
  }

  if (episodeNumber < 1) {
    throw new ApiError(
      'Episode number must be greater than 0',
      ERROR_CODES.INVALID_RESPONSE
    );
  }

  const cacheKey = generateCacheKey('episode', animeId, episodeNumber);
  const cached = cache.get<EpisodeStreamData>(cacheKey);
  if (cached) return cached;

  const data = await apiClient<unknown>(
    `/get_episode/${encodeURIComponent(animeId)}/${episodeNumber}`
  );
  const parseResult = EpisodeStreamDataSchema.safeParse(data);
  if (!parseResult.success) {
    throw new ApiError(
      'Invalid episode source response format',
      ERROR_CODES.INVALID_RESPONSE,
      undefined,
      parseResult.error
    );
  }
  cache.set(cacheKey, parseResult.data, CACHE_CONFIG.EPISODE_SOURCE_TTL);
  return parseResult.data;
}

export async function getAnimeEpisodes(animeId: string) {
  const animeDetails = await getAnimeDetails(animeId);
  return animeDetails.episodes_list || [];
}

export async function prefetchAnimeDetails(animeId: string): Promise<void> {
  const cacheKey = generateCacheKey('anime', animeId);
  if (!cache.has(cacheKey)) {
    try {
      await getAnimeDetails(animeId);
    } catch (error) {
      console.warn('Prefetch failed for', animeId, error);
    }
  }
}

export function clearAnimeCache(): void {
  cache.clear();
}
