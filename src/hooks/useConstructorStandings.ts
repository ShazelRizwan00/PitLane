import { useAsync, AsyncState } from './useAsync';
import { fetchConstructorStandings } from '../api/constructors';
import { ConstructorStanding, StandingsSummary } from '../api/types';

export interface UseConstructorStandingsResult extends StandingsSummary<ConstructorStanding> {
  leader: ConstructorStanding | null;
  runnerUp: ConstructorStanding | null;
}

export function useConstructorStandings(season = 2026): AsyncState<UseConstructorStandingsResult> {
  return useAsync(async (signal, isRetry) => {
    const summary = await fetchConstructorStandings(season, { signal, bypassCache: isRetry });
    return {
      ...summary,
      leader: summary.standings[0] ?? null,
      runnerUp: summary.standings[1] ?? null,
    };
  }, [season]);
}
