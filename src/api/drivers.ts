import { fetchFromApi, FetchOptions, ApiError } from './client';
import { RawMRData, DriverStanding, StandingsSummary } from './types';
import { mapRawDriverStanding } from './mappers';

export async function fetchDriverStandings(
  season = 2026,
  options?: FetchOptions
): Promise<StandingsSummary<DriverStanding>> {
  const data = await fetchFromApi<RawMRData>(`/${season}/driverstandings.json`, options);
  const standingsList = data.StandingsTable?.StandingsLists?.[0];

  if (!standingsList || !standingsList.DriverStandings) {
    throw new ApiError('No driver standings data available for the 2026 season.', 'invalid');
  }

  const seasonNum = parseInt(standingsList.season, 10) || season;
  const roundNum = parseInt(standingsList.round, 10) || 0;

  return {
    season: seasonNum,
    round: roundNum,
    standings: standingsList.DriverStandings.map(mapRawDriverStanding),
  };
}
