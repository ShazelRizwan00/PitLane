import { useDashboardData } from '../hooks/useDashboardData';
import { SeasonHero } from '../components/dashboard/SeasonHero';
import { PointsGapChart } from '../components/dashboard/PointsGapChart';
import { StandingsList } from '../components/dashboard/StandingsList';
import { ScenarioCalculator } from '../components/dashboard/ScenarioCalculator';
import { RecentResults } from '../components/dashboard/RecentResults';
import { ErrorState } from '../components/ui/ErrorState';

export function DashboardPage() {
  const { status, data, error, retry } = useDashboardData(2026);

  if (status === 'loading') {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        {/* Hero skeleton */}
        <div className="h-64 border border-[var(--line)] bg-[var(--surface)]" />

        {/* Gap chart skeleton */}
        <div className="h-44 border border-[var(--line)] bg-[var(--surface)]" />

        {/* Dense table skeleton shaped like real rows */}
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
          <div className="h-5 w-44 bg-[var(--line)]" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 bg-[var(--line)]/50 border border-[var(--line)] flex items-center justify-between px-3">
                <div className="h-3 w-8 bg-[var(--line)]" />
                <div className="h-3 w-32 bg-[var(--line)]" />
                <div className="h-3 w-20 bg-[var(--line)]" />
                <div className="h-3 w-12 bg-[var(--line)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent results skeleton */}
        <div className="h-48 border border-[var(--line)] bg-[var(--surface)]" />
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <ErrorState
        title="Timing Feed Interrupted"
        message={
          error?.message ||
          'Could not retrieve championship standings from the timing feed. Check your connection and retry.'
        }
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-8 section-reveal">
      {/* 1. Dominant Hero: Title-Fight Interval & Next Session Countdown */}
      <SeasonHero
        season={data.season}
        totalRaces={data.totalRaces}
        completedRaces={data.completedRacesCount}
        remainingRaces={data.remainingRacesCount}
        nextRace={data.nextRace}
        driverLeader={data.driverLeader}
        driverRunnerUp={data.driverRunnerUp}
        latestCompletedRace={data.latestCompletedRace}
        latestRaceResults={data.latestRaceResults}
        upcomingRaces={data.upcomingRaces}
        seasonResults={data.seasonResults}
      />

      {/* 2. Break-The-Grid Points-Gap Line Chart (Replaces round chips) */}
      <PointsGapChart
        seasonResults={data.seasonResults}
        totalRaces={data.totalRaces}
        completedRacesCount={data.completedRacesCount}
      />

      {/* 3. Standings Timing Tower with Time-Machine Round Scrubber & Row Interactions */}
      <StandingsList
        seasonResults={data.seasonResults}
        currentDriverStandings={data.allDriverStandings}
        currentConstructorStandings={data.allConstructorStandings}
        completedRacesCount={data.completedRacesCount}
      />

      {/* 4. Title-Fight Scenario Calculator */}
      <ScenarioCalculator
        leader={data.driverLeader}
        chaser={data.driverRunnerUp}
        remainingRaces={data.upcomingRaces}
      />

      {/* 5. Latest Grand Prix Classification Sheet */}
      <RecentResults
        race={data.latestCompletedRace}
        results={data.latestRaceResults}
      />
    </div>
  );
}
