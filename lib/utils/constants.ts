export const API_CONFIG = {
  BASE_URL: (() => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_USE_INTERNAL_PROXY === 'true' ? '' : '/api/proxy';
    }
    const port = process.env.PORT || 3000;
    const baseUrl = process.env.NEXT_PUBLIC_USE_INTERNAL_PROXY === 'true' ? '' : '/api/proxy';
    return `http://localhost:${port}${baseUrl}`;
  })(), 
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const CACHE_CONFIG = {
  SEARCH_TTL: 5 * 60 * 1000,
  ANIME_DETAILS_TTL: 30 * 60 * 1000,
  EPISODES_TTL: 60 * 60 * 1000,
  EPISODE_SOURCE_TTL: 10 * 60 * 1000,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 50,
} as const;

export const COLORS = {
  BACKGROUND: '#000000',
  SURFACE: '#0A0A0A',
  ACCENT: '#FFFFFF',
  SUCCESS: '#00FF88',
  WARNING: '#FFCC00',
  ERROR: '#FF3366',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#666666',
  DIVIDER: '#1A1A1A',
} as const;

export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const RATE_LIMIT = {
  MAX_REQUESTS_PER_SECOND: 10,
  BACKOFF_MULTIPLIER: 2,
  MAX_BACKOFF: 32000,
} as const;

export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  CLOUDFLARE_BLOCKED: 'CLOUDFLARE_BLOCKED',
  SCRAPING_FAILED: 'SCRAPING_FAILED',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  GATEWAY_TIMEOUT: 504,
} as const;
