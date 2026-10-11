import { useAsync, AsyncState } from './useAsync';
import { fetchDriverStandings } from '../api/drivers';
import { DriverStanding, StandingsSummary } from '../api/types';

export interface UseDriverStandingsResult extends StandingsSummary<DriverStanding> {
  leader: DriverStanding | null;
  runnerUp: DriverStanding | null;
}

export function useDriverStandings(season = 2026): AsyncState<UseDriverStandingsResult> {
  return useAsync(async (signal, isRetry) => {
    const summary = await fetchDriverStandings(season, { signal, bypassCache: isRetry });
    return {
      ...summary,
      leader: summary.standings[0] ?? null,
      runnerUp: summary.standings[1] ?? null,
    };
  }, [season]);
}
