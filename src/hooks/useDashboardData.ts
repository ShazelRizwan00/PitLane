import { useAsync, AsyncState } from './useAsync';
import { fetchRaces, fetchRaceResults, fetchSeasonResults, SeasonRoundResult } from '../api/races';
import { fetchDriverStandings } from '../api/drivers';
import { fetchConstructorStandings } from '../api/constructors';
import { Race, RaceResult, DriverStanding, ConstructorStanding } from '../api/types';

export interface DashboardData {
  season: number;
  totalRaces: number;
  completedRacesCount: number;
  remainingRacesCount: number;
  races: Race[];
  completedRaces: Race[];
  upcomingRaces: Race[];
  nextRace: Race | null;
  latestCompletedRace: Race | null;
  driverLeader: DriverStanding | null;
  driverRunnerUp: DriverStanding | null;
  constructorLeader: ConstructorStanding | null;
  topDrivers: DriverStanding[];
  top10Drivers: DriverStanding[];
  allDriverStandings: DriverStanding[];
  topConstructors: ConstructorStanding[];
  allConstructorStandings: ConstructorStanding[];
  latestRaceResults: RaceResult[];
  seasonResults: SeasonRoundResult[];
  stats: {
    driverPointsGap: number;
    constructorPointsGap: number;
    differentWinnersCount: number;
    totalRacesRan: number;
    mostWinsCount: number;
  };
}

export function useDashboardData(season = 2026): AsyncState<DashboardData> {
  return useAsync(async (signal, isRetry) => {
    // Fetch races calendar, driver standings, constructor standings, and season round results concurrently
    const [races, driverSummary, constructorSummary, seasonResults] = await Promise.all([
      fetchRaces(season, { signal, bypassCache: isRetry }),
      fetchDriverStandings(season, { signal, bypassCache: isRetry }),
      fetchConstructorStandings(season, { signal, bypassCache: isRetry }),
      fetchSeasonResults(season, { signal, bypassCache: isRetry }).catch(() => [] as SeasonRoundResult[]),
    ]);

    const completedRaces = races.filter((r) => r.isCompleted);
    const upcomingRaces = races.filter((r) => !r.isCompleted);
    const nextRace = upcomingRaces[0] ?? null;
    const latestCompletedRace = completedRaces.length > 0 ? completedRaces[completedRaces.length - 1]! : null;

    let latestRaceResults: RaceResult[] = [];
    if (latestCompletedRace) {
      try {
        const res = await fetchRaceResults(latestCompletedRace.round, season, { signal, bypassCache: isRetry });
        latestRaceResults = res.results;
      } catch {
        latestRaceResults = [];
      }
    }

    const driverLeader = driverSummary.standings[0] ?? null;
    const driverRunnerUp = driverSummary.standings[1] ?? null;
    const constructorLeader = constructorSummary.standings[0] ?? null;
    const constructorRunnerUp = constructorSummary.standings[1] ?? null;

    const driverPointsGap =
      driverLeader && driverRunnerUp ? Math.max(0, driverLeader.points - driverRunnerUp.points) : 0;
    const constructorPointsGap =
      constructorLeader && constructorRunnerUp ? Math.max(0, constructorLeader.points - constructorRunnerUp.points) : 0;

    const driversWithWins = driverSummary.standings.filter((d) => d.wins > 0);
    const differentWinnersCount = driversWithWins.length;
    const mostWinsCount = driverLeader?.wins ?? 0;

    return {
      season,
      totalRaces: races.length,
      completedRacesCount: completedRaces.length,
      remainingRacesCount: upcomingRaces.length,
      races,
      completedRaces,
      upcomingRaces,
      nextRace,
      latestCompletedRace,
      driverLeader,
      driverRunnerUp,
      constructorLeader,
      topDrivers: driverSummary.standings.slice(0, 5),
      top10Drivers: driverSummary.standings.slice(0, 10),
      allDriverStandings: driverSummary.standings,
      topConstructors: constructorSummary.standings.slice(0, 5),
      allConstructorStandings: constructorSummary.standings,
      latestRaceResults: latestRaceResults.slice(0, 10),
      seasonResults,
      stats: {
        driverPointsGap,
        constructorPointsGap,
        differentWinnersCount,
        totalRacesRan: completedRaces.length,
        mostWinsCount,
      },
    };
  }, [season]);
}
