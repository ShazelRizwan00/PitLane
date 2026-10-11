import { useAsync, AsyncState } from './useAsync';
import { fetchRaceResults } from '../api/races';
import { Race, RaceResult } from '../api/types';

export interface UseRaceResultsData {
  race: Race;
  results: RaceResult[];
}

export function useRaceResults(round: number | null, season = 2026): AsyncState<UseRaceResultsData | null> {
  return useAsync(async (signal, isRetry) => {
    if (round === null) {
      return null;
    }
    const data = await fetchRaceResults(round, season, { signal, bypassCache: isRetry });
    return data;
  }, [round, season]);
}
