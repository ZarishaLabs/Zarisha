import { z } from 'zod';

export const AnimeTypeSchema = z.enum(['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music', 'Unknown']);

const STATUS_VALUES = ['Airing', 'Completed', 'Upcoming', 'Unknown'] as const;
export type AnimeStatus = (typeof STATUS_VALUES)[number];

function normalizeStatus(val: unknown): AnimeStatus {
  const s = String(val ?? '').trim();
  if (STATUS_VALUES.includes(s as AnimeStatus)) return s as AnimeStatus;
  const lower = s.toLowerCase();
  if (lower.includes('finished') || lower.includes('completed')) return 'Completed';
  if (lower.includes('airing') && !lower.includes('finished')) return 'Airing';
  if (lower.includes('upcoming') || lower.includes('not yet')) return 'Upcoming';
  return 'Unknown';
}
export const AnimeStatusSchema = z.string().transform(normalizeStatus);

export const SearchResultItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: AnimeTypeSchema,
  episodes: z.number(),
  status: AnimeStatusSchema,
  year: z.number().nullable().optional(),
  score: z.string().optional(),
  poster: z.string().optional(),
  session: z.string(),
});

export const SearchResponseSchema = z.object({
  total: z.number(),
  last_page: z.number(),
  current_page: z.number(),
  per_page: z.number(),
  data: z.array(SearchResultItemSchema),
});

export const EpisodeSchema = z.object({
  id: z.number(),
  episode: z.number(),
  title: z.string(),
  snapshot: z.string().optional(),
  session: z.string(),
  filler: z.boolean().optional().default(false),
});

export const AnimeDetailsSchema = z.object({
  id: z.string(),
  title: z.string(),
  japanese_title: z.string().optional(),
  type: AnimeTypeSchema,
  episodes: z.number(),
  status: AnimeStatusSchema,
  aired: z.string().optional(),
  season: z.string().optional(),
  year: z.number().nullable().optional(),
  score: z.string().optional(),
  poster: z.string().optional(),
  synopsis: z.string().optional(),
  genres: z.array(z.string()).optional().default([]),
  studio: z.string().optional(),
  episodes_list: z.array(EpisodeSchema).optional().default([]),
  recommendations: z.array(SearchResultItemSchema).optional().default([]),
  relations: z.array(SearchResultItemSchema).optional().default([]),
});

export const StreamSourceSchema = z.object({
  quality: z.string(),
  url: z.string(),
  audio: z.string().optional(),
  size: z.string().optional(),
  type: z.string().optional(),
});

export const EpisodeStreamDataSchema = z.object({
  episode: z.number(),
  title: z.string(),
  streams: z.array(StreamSourceSchema).optional().default([]),
  direct_links: z.array(StreamSourceSchema).optional().default([]),
});

export const ErrorResponseSchema = z.object({
  error: z.boolean(),
  message: z.string(),
  code: z.string().optional(),
  status: z.number().optional(),
});

export type AnimeType = z.infer<typeof AnimeTypeSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;
export type AnimeDetails = z.infer<typeof AnimeDetailsSchema>;
export type StreamSource = z.infer<typeof StreamSourceSchema>;
export type EpisodeStreamData = z.infer<typeof EpisodeStreamDataSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export function isAnimeDetails(data: unknown): data is AnimeDetails {
  return AnimeDetailsSchema.safeParse(data).success;
}

export function isSearchResponse(data: unknown): data is SearchResponse {
  return SearchResponseSchema.safeParse(data).success;
}

export function isEpisodeStreamData(data: unknown): data is EpisodeStreamData {
  return EpisodeStreamDataSchema.safeParse(data).success;
}

export function isErrorResponse(data: unknown): data is ErrorResponse {
  return ErrorResponseSchema.safeParse(data).success;
}
