import { ERROR_CODES, HTTP_STATUS } from './constants';
import type { ErrorResponse } from '../api/api-types';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleHttpError(status: number, message?: string): ApiError {
  switch (status) {
    case HTTP_STATUS.NOT_FOUND:
      return new ApiError(
        message || 'The requested content was not found. Please try another search.',
        ERROR_CODES.NOT_FOUND,
        status
      );
    
    case HTTP_STATUS.RATE_LIMITED:
      return new ApiError(
        message || 'Too many requests. Please wait a moment before trying again.',
        ERROR_CODES.RATE_LIMITED,
        status
      );
    
    case HTTP_STATUS.GATEWAY_TIMEOUT:
      return new ApiError(
        message || 'Request timed out. Please check your connection and try again.',
        ERROR_CODES.TIMEOUT,
        status
      );
    
    case HTTP_STATUS.SERVER_ERROR:
      return new ApiError(
        message || 'Server error occurred. Please try again later.',
        ERROR_CODES.SCRAPING_FAILED,
        status
      );
    
    default:
      return new ApiError(
        message || 'An unexpected error occurred. Please try again.',
        ERROR_CODES.NETWORK_ERROR,
        status
      );
  }
}

export function handleNetworkError(error: unknown): ApiError {
  if (error instanceof Error) {
    return new ApiError(
      'Network error. Please check your internet connection and try again.',
      ERROR_CODES.NETWORK_ERROR,
      undefined,
      error
    );
  }
  
  return new ApiError(
    'An unknown network error occurred.',
    ERROR_CODES.NETWORK_ERROR,
    undefined,
    error
  );
}

export function parseErrorResponse(errorData: ErrorResponse): ApiError {
  return new ApiError(
    errorData.message,
    errorData.code || ERROR_CODES.NETWORK_ERROR,
    errorData.status
  );
}

export function logError(error: ApiError | Error, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', {
      name: error.name,
      message: error.message,
      ...(error instanceof ApiError && {
        code: error.code,
        status: error.status,
      }),
      context,
    });
  } else {
    console.error('[Production Error]', error.message);
  }
}

export function getUserFriendlyMessage(error: ApiError): string {
  switch (error.code) {
    case ERROR_CODES.NOT_FOUND:
      return 'Content not found. Try searching for something else.';
    
    case ERROR_CODES.RATE_LIMITED:
      return 'Slow down! Too many requests. Please wait a moment.';
    
    case ERROR_CODES.CLOUDFLARE_BLOCKED:
      return 'Service temporarily unavailable. Please try again in a few minutes.';
    
    case ERROR_CODES.SCRAPING_FAILED:
      return 'Failed to load data. The service might be down.';
    
    case ERROR_CODES.TIMEOUT:
      return 'Request timed out. Check your connection and try again.';
    
    case ERROR_CODES.NETWORK_ERROR:
      return 'Network error. Please check your internet connection.';
    
    case ERROR_CODES.INVALID_RESPONSE:
      return 'Invalid response from server. Please try again.';
    
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

export function isRetryableError(error: ApiError): boolean {
  const retryableCodes = [
    ERROR_CODES.RATE_LIMITED,
    ERROR_CODES.TIMEOUT,
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.SCRAPING_FAILED,
  ];
  return retryableCodes.includes(error.code as any);
}
