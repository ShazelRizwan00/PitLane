import { fetchFromApi, FetchOptions, ApiError } from './client';
import { RawMRData, ConstructorStanding, StandingsSummary } from './types';
import { mapRawConstructorStanding } from './mappers';

export async function fetchConstructorStandings(
  season = 2026,
  options?: FetchOptions
): Promise<StandingsSummary<ConstructorStanding>> {
  const data = await fetchFromApi<RawMRData>(`/${season}/constructorstandings.json`, options);
  const standingsList = data.StandingsTable?.StandingsLists?.[0];

  if (!standingsList || !standingsList.ConstructorStandings) {
    throw new ApiError('No constructor standings data available for the 2026 season.', 'invalid');
  }

  const seasonNum = parseInt(standingsList.season, 10) || season;
  const roundNum = parseInt(standingsList.round, 10) || 0;

  return {
    season: seasonNum,
    round: roundNum,
    standings: standingsList.ConstructorStandings.map(mapRawConstructorStanding),
  };
}
