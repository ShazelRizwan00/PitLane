import { RawApiResponse, RawMRData } from './types';

export class ApiError extends Error {
  public readonly kind: 'network' | 'http' | 'invalid';
  public readonly status?: number;

  constructor(message: string, kind: 'network' | 'http' | 'invalid', status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

const BASE_URL = (import.meta.env.VITE_F1_API_URL || 'https://api.jolpi.ca/ergast/f1').replace(/\/+$/, '');

// Session in-memory cache of in-flight or completed data promises
const cache = new Map<string, Promise<unknown>>();

export function clearApiCache(): void {
  cache.clear();
}

export function invalidateCacheEntry(url: string): void {
  cache.delete(url);
}

function isRawApiResponse(data: unknown): data is RawApiResponse {
  if (typeof data !== 'object' || data === null) return false;
  const candidate = data as { MRData?: unknown };
  return typeof candidate.MRData === 'object' && candidate.MRData !== null;
}

export interface FetchOptions {
  bypassCache?: boolean;
  signal?: AbortSignal;
}

export async function fetchFromApi<T = RawMRData>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${BASE_URL}${cleanEndpoint}`;

  if (options.bypassCache) {
    cache.delete(fullUrl);
  }

  // Get existing shared promise or create a new one
  let sharedPromise = cache.get(fullUrl) as Promise<T> | undefined;

  if (!sharedPromise) {
    sharedPromise = (async (): Promise<T> => {
      let res: Response;
      try {
        // Use a 15-second timeout controller so requests never hang forever
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), 15000);

        try {
          res = await fetch(fullUrl, {
            signal: timeoutController.signal,
            headers: {
              Accept: 'application/json',
            },
          });
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw new ApiError(
            'Request to Formula 1 data service timed out. Please try again.',
            'network'
          );
        }
        throw new ApiError(
          'Unable to connect to the Formula 1 data service. Check your internet connection.',
          'network'
        );
      }

      if (!res.ok) {
        if (res.status === 429) {
          throw new ApiError('F1 data rate limit exceeded. Please wait a moment.', 'http', 429);
        }
        if (res.status === 404) {
          throw new ApiError('Requested season or race data not found.', 'http', 404);
        }
        throw new ApiError(`Server responded with status ${res.status}.`, 'http', res.status);
      }

      let json: unknown;
      try {
        json = await res.json();
      } catch {
        throw new ApiError('Received an invalid or malformed response from the data service.', 'invalid');
      }

      if (!isRawApiResponse(json)) {
        throw new ApiError('Data service returned an unexpected payload structure.', 'invalid');
      }

      return json.MRData as unknown as T;
    })();

    // Catch rejection to avoid poisoning cache with failed requests
    sharedPromise.catch(() => {
      cache.delete(fullUrl);
    });

    cache.set(fullUrl, sharedPromise);
  }

  // If the caller provided a signal, wrap the shared promise so only THIS caller can abort,
  // without killing the shared underlying network request or poisoning the cache for remounts.
  if (options.signal) {
    const signal = options.signal;
    if (signal.aborted) {
      return Promise.reject(new DOMException('This operation was aborted', 'AbortError'));
    }

    return new Promise<T>((resolve, reject) => {
      const onAbort = () => {
        signal.removeEventListener('abort', onAbort);
        reject(new DOMException('This operation was aborted', 'AbortError'));
      };

      signal.addEventListener('abort', onAbort, { once: true });

      sharedPromise!
        .then((data) => {
          signal.removeEventListener('abort', onAbort);
          resolve(data);
        })
        .catch((err) => {
          signal.removeEventListener('abort', onAbort);
          reject(err);
        });
    });
  }

  return sharedPromise;
}
