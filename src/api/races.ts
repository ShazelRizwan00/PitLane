import { fetchFromApi, FetchOptions, ApiError } from './client';
import { RawMRData, Race, RaceResult } from './types';
import { mapRawRace, mapRawResult } from './mappers';

export async function fetchRaces(season = 2026, options?: FetchOptions): Promise<Race[]> {
  const data = await fetchFromApi<RawMRData>(`/${season}/races.json?limit=100`, options);
  const rawRaces = data.RaceTable?.Races;

  if (!rawRaces || !Array.isArray(rawRaces)) {
    throw new ApiError('No race calendar data found for the 2026 season.', 'invalid');
  }

  return rawRaces.map(mapRawRace);
}

export async function fetchRaceResults(
  round: number,
  season = 2026,
  options?: FetchOptions
): Promise<{ race: Race; results: RaceResult[] }> {
  const data = await fetchFromApi<RawMRData>(`/${season}/${round}/results.json?limit=100`, options);
  const raceTable = data.RaceTable;
  const rawRace = raceTable?.Races?.[0];

  if (!rawRace) {
    throw new ApiError(`No results found for round ${round}.`, 'http', 404);
  }

  const race = mapRawRace(rawRace);
  const results = rawRace.Results ? rawRace.Results.map(mapRawResult) : [];

  return { race, results };
}

export interface SeasonRoundResult {
  round: number;
  raceName: string;
  results: RaceResult[];
}

/**
 * Fetch all available race results for the season (used for charts and multi-round analysis).
 * Jolpica paginates results at max limit=100.
 */
export async function fetchSeasonResults(
  season = 2026,
  options?: FetchOptions
): Promise<SeasonRoundResult[]> {
  const firstPage = await fetchFromApi<RawMRData>(`/${season}/results.json?limit=100&offset=0`, options);
  const total = parseInt(firstPage.total, 10) || 0;
  const allRaces = [...(firstPage.RaceTable?.Races || [])];

  if (total > 100) {
    const pagesNeeded = Math.ceil(total / 100);
    const pagePromises: Promise<RawMRData>[] = [];
    for (let page = 1; page < pagesNeeded; page++) {
      const offset = page * 100;
      pagePromises.push(
        fetchFromApi<RawMRData>(`/${season}/results.json?limit=100&offset=${offset}`, options)
      );
    }

    const subsequentPages = await Promise.all(pagePromises);
    for (const pageData of subsequentPages) {
      if (pageData.RaceTable?.Races) {
        allRaces.push(...pageData.RaceTable.Races);
      }
    }
  }

  // Group by round
  const roundMap = new Map<number, SeasonRoundResult>();

  for (const rawRace of allRaces) {
    const round = parseInt(rawRace.round, 10) || 1;
    const existing = roundMap.get(round);
    const raceResults = rawRace.Results ? rawRace.Results.map(mapRawResult) : [];

    if (existing) {
      existing.results.push(...raceResults);
    } else {
      roundMap.set(round, {
        round,
        raceName: rawRace.raceName,
        results: raceResults,
      });
    }
  }

  return Array.from(roundMap.values()).sort((a, b) => a.round - b.round);
}
