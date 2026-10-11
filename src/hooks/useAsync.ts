import { useState, useEffect, useCallback, useRef } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  retry: () => void;
}

export function useAsync<T>(
  asyncFn: (signal: AbortSignal, isRetry: boolean) => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> {
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const asyncFnRef = useRef(asyncFn);
  asyncFnRef.current = asyncFn;

  const retry = useCallback(() => {
    setStatus('loading');
    setError(null);
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const controller = new AbortController();
    const isRetry = retryCount > 0;

    setStatus('loading');
    setError(null);

    asyncFnRef
      .current(controller.signal, isRetry)
      .then((result) => {
        if (!isCurrent) return;
        setData(result);
        setStatus('success');
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, ...deps]);

  return { status, data, error, retry };
}
