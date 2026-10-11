import { useAsync, AsyncState } from './useAsync';
import { fetchSeasonResults, SeasonRoundResult } from '../api/races';

export function useSeasonResults(season = 2026, enabled = true): AsyncState<SeasonRoundResult[]> {
  return useAsync(async (signal, isRetry) => {
    if (!enabled) {
      return [];
    }
    return fetchSeasonResults(season, { signal, bypassCache: isRetry });
  }, [season, enabled]);
}
