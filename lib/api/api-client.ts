import { API_CONFIG, RATE_LIMIT } from '../utils/constants';
import {
  ApiError,
  handleHttpError,
  handleNetworkError,
  isRetryableError,
  logError,
} from '../utils/error-handler';

interface RequestOptions extends RequestInit {
  retries?: number;
  timeout?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBackoffDelay(attempt: number): number {
  const delay = API_CONFIG.RETRY_DELAY * Math.pow(RATE_LIMIT.BACKOFF_MULTIPLIER, attempt);
  return Math.min(delay, RATE_LIMIT.MAX_BACKOFF);
}

async function fetchWithTimeout(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { timeout = API_CONFIG.TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out',
        'TIMEOUT',
        undefined,
        error
      );
    }
    
    throw error;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { retries = API_CONFIG.RETRY_ATTEMPTS, ...fetchOptions } = options;
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions);
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        const error = handleHttpError(
          response.status,
          errorData.message || response.statusText
        );
        if (!isRetryableError(error)) {
          logError(error, { url, attempt });
          throw error;
        }

        lastError = error;
        if (attempt < retries) {
          const delay = getBackoffDelay(attempt);
          await sleep(delay);
          continue;
        }

        throw error;
      }
      const data = await response.json();
      return data as T;

    } catch (error) {
      if (!(error instanceof ApiError)) {
        lastError = handleNetworkError(error);
      } else {
        lastError = error;
      }
      if (attempt < retries && isRetryableError(lastError)) {
        const delay = getBackoffDelay(attempt);
        await sleep(delay);
        continue;
      }

      logError(lastError, { url, attempt });
      throw lastError;
    }
  }
  throw lastError || handleNetworkError(new Error('Unknown error'));
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
