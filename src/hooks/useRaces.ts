import { useAsync, AsyncState } from './useAsync';
import { fetchRaces } from '../api/races';
import { Race } from '../api/types';

export interface UseRacesResult {
  races: Race[];
  completedRaces: Race[];
  upcomingRaces: Race[];
  nextRace: Race | null;
  latestCompletedRace: Race | null;
}

export function useRaces(season = 2026): AsyncState<UseRacesResult> {
  return useAsync(async (signal, isRetry) => {
    const races = await fetchRaces(season, { signal, bypassCache: isRetry });

    const completedRaces = races.filter((r) => r.isCompleted);
    const upcomingRaces = races.filter((r) => !r.isCompleted);
    const nextRace = upcomingRaces[0] ?? null;
    const latestCompletedRace = completedRaces.length > 0 ? completedRaces[completedRaces.length - 1]! : null;

    return {
      races,
      completedRaces,
      upcomingRaces,
      nextRace,
      latestCompletedRace,
    };
  }, [season]);
}
