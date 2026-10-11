import { useState, useMemo } from 'react';
import { useDriverStandings } from '../hooks/useDriverStandings';
import { useSeasonResults } from '../hooks/useSeasonResults';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { DriverPointsChart } from '../components/charts/DriverPointsChart';
import { PointsProgressionChart } from '../components/charts/PointsProgressionChart';
import { getTeamColor } from '../lib/teamColors';
import { BarChart3, LineChart as LineIcon, ArrowUpDown } from 'lucide-react';

export function DriversPage() {
  const { status, data, error, retry } = useDriverStandings(2026);
  const [activeChart, setActiveChart] = useState<'points' | 'progression'>('points');
  const [chartView, setChartView] = useState<'top10' | 'all'>('top10');
  const [sortBy, setSortBy] = useState<'points' | 'name'>('points');
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  const seasonResultsState = useSeasonResults(2026, true);

  // Compute position delta since last round from seasonResults
  const driverDeltas = useMemo(() => {
    if (!seasonResultsState.data || seasonResultsState.data.length < 2) return new Map<string, number>();

    const sortedRounds = [...seasonResultsState.data].sort((a, b) => a.round - b.round);
    const prevRound = sortedRounds[sortedRounds.length - 2];
    if (!prevRound) return new Map<string, number>();

    const prevPoints: Record<string, number> = {};
    sortedRounds.forEach((r) => {
      if (r.round <= prevRound.round) {
        r.results.forEach((res) => {
          prevPoints[res.driver.id] = (prevPoints[res.driver.id] || 0) + res.points;
        });
      }
    });

    const rankedPrev = Object.entries(prevPoints).sort((a, b) => b[1] - a[1]);
    const prevPosMap = new Map<string, number>();
    rankedPrev.forEach(([id], idx) => prevPosMap.set(id, idx + 1));

    const deltaMap = new Map<string, number>();
    if (data?.standings) {
      data.standings.forEach((d) => {
        const prevPos = prevPosMap.get(d.driver.id) || d.position;
        deltaMap.set(d.driver.id, prevPos - d.position);
      });
    }

    return deltaMap;
  }, [seasonResultsState.data, data?.standings]);

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-12 border border-[var(--line)] bg-[var(--surface)] animate-pulse" />
        <ChartSkeleton />
        <TableSkeleton rows={15} columns={6} />
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <ErrorState
        title="Driver Standings Unavailable"
        message={error?.message || 'Could not fetch driver championship standings.'}
        onRetry={retry}
      />
    );
  }

  if (!data.standings || data.standings.length === 0) {
    return (
      <EmptyState
        title="No Driver Standings Recorded"
        message="Standings will appear after the first race of the championship."
      />
    );
  }

  const leaderPoints = data.leader?.points ?? 1;
  const totalDrivers = data.standings.length;

  return (
    <div className="space-y-6 section-reveal">
      <PageHeader
        title="Drivers"
        subtitle={`Round ${data.round} classification · ${totalDrivers} drivers`}
        badge={
          <Badge variant="default">
            2026 Season
          </Badge>
        }
      />

      {/* Visualizations Container */}
      <div className="surface-panel corner-chamfer">
        <div className="px-4 sm:px-6 py-3 border-b border-[var(--line)] bg-[#19191E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-xs font-display font-black uppercase tracking-wider text-[var(--text)]">
              {activeChart === 'points'
                ? `Points distribution · ${chartView === 'all' ? `All ${totalDrivers}` : 'Top 10'}`
                : 'Season trajectory'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeChart === 'points' && (
              <div className="flex items-center gap-2 text-xs">
                {/* View toggle (Top 10 vs All) */}
                <div className="flex items-center border border-[var(--line)] bg-[var(--bg)] p-0.5 font-body">
                  <button
                    type="button"
                    onClick={() => setChartView('top10')}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors min-h-[32px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                      chartView === 'top10'
                        ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--primary)]'
                        : 'text-[var(--text-dim)] hover:text-[var(--accent)]'
                    }`}
                  >
                    Top 10
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartView('all')}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors min-h-[32px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                      chartView === 'all'
                        ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--primary)]'
                        : 'text-[var(--text-dim)] hover:text-[var(--accent)]'
                    }`}
                  >
                    All ({totalDrivers})
                  </button>
                </div>

                {/* Sort toggle */}
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy === 'points' ? 'name' : 'points')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[var(--bg)] border border-[var(--line)] text-[var(--text)] font-body text-xs hover:bg-[var(--surface)] hover:text-[var(--accent)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[32px] cursor-pointer"
                  title="Toggle sort order"
                >
                  <ArrowUpDown className="w-3 h-3 text-[var(--text-dim)]" />
                  <span>{sortBy === 'points' ? 'By points' : 'A–Z'}</span>
                </button>
              </div>
            )}

            {/* Chart Type Tab (Points vs Progression) */}
            <div className="flex items-center border border-[var(--line)] bg-[var(--bg)] p-0.5 text-xs font-body">
              <button
                type="button"
                onClick={() => setActiveChart('points')}
                className={`flex items-center gap-1.5 px-2.5 py-1 font-medium transition-colors min-h-[32px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  activeChart === 'points'
                    ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--primary)]'
                    : 'text-[var(--text-dim)] hover:text-[var(--accent)]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Points</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChart('progression')}
                className={`flex items-center gap-1.5 px-2.5 py-1 font-medium transition-colors min-h-[32px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  activeChart === 'progression'
                    ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--primary)]'
                    : 'text-[var(--text-dim)] hover:text-[var(--accent)]'
                }`}
              >
                <LineIcon className="w-3.5 h-3.5" />
                <span>Progression</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeChart === 'points' ? (
            <DriverPointsChart
              standings={data.standings}
              limit={chartView === 'top10' ? 10 : null}
              sortBy={sortBy}
            />
          ) : seasonResultsState.status === 'loading' ? (
            <div className="h-72 flex items-center justify-center text-[var(--text-dim)] text-xs font-body">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                <span>Loading progression data...</span>
              </div>
            </div>
          ) : seasonResultsState.status === 'error' || !seasonResultsState.data ? (
            <div className="p-6 text-center text-xs font-body text-[var(--text-dim)]">
              <p>Unable to calculate round progression data.</p>
              <button
                type="button"
                onClick={seasonResultsState.retry}
                className="mt-2 text-[var(--accent)] font-medium underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <PointsProgressionChart
              roundResults={seasonResultsState.data}
              topDrivers={data.standings}
            />
          )}
        </div>
      </div>

      {/* Standings Dense Timing Tower */}
      <div className="w-full overflow-x-auto surface-panel">
        <table className="w-full text-left text-xs border-collapse min-w-[680px]">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] font-body uppercase tracking-wider">
              <th className="px-3 py-3 w-12 text-center font-medium">Pos</th>
              <th className="px-3 py-3 w-14 text-center font-medium">Delta</th>
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Constructor</th>
              <th className="px-4 py-3 text-center w-20 font-medium">Wins</th>
              <th className="px-4 py-3 text-right w-40 font-medium">Gap to Leader</th>
              <th className="px-4 py-3 text-right w-24 font-medium">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--text)] font-body">
            {data.standings.map((item, index) => {
              const teamColor = getTeamColor(item.constructor.id);
              const isLeader = item.position === 1;
              const gapToLeader = isLeader ? 'Leader' : `-${leaderPoints - item.points} pts`;
              const relativePct = Math.round((item.points / leaderPoints) * 100);
              const delta = driverDeltas.get(item.driver.id) || 0;
              const isExpanded = expandedDriverId === item.driver.id;

              return (
                <tr
                  key={`standing-${item.driver.id}`}
                  style={{ animationDelay: `${index * 15}ms` }}
                  onClick={() => setExpandedDriverId(isExpanded ? null : item.driver.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedDriverId(isExpanded ? null : item.driver.id);
                    }
                  }}
                  className="group hover:bg-[var(--line)]/30 focus-visible:bg-[var(--line)]/40 transition-colors duration-150 relative cursor-pointer select-none"
                >
                  {/* Position */}
                  <td className="px-3 py-3 text-center font-display font-black text-xs text-[var(--text-dim)] tabular-nums">
                    P{item.positionText}
                  </td>

                  {/* Delta ▲/▼ */}
                  <td className="px-3 py-3 text-center tabular-nums text-[11px] font-semibold">
                    {delta > 0 ? (
                      <span className="text-[var(--gain)] flex items-center justify-center gap-0.5">
                        ▲ {delta}
                      </span>
                    ) : delta < 0 ? (
                      <span className="text-[var(--loss)] flex items-center justify-center gap-0.5">
                        ▼ {Math.abs(delta)}
                      </span>
                    ) : (
                      <span className="text-[var(--text-dim)]">—</span>
                    )}
                  </td>

                  {/* Driver Name & Sliding Livery Bar */}
                  <td className="px-4 py-3 relative">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] group-hover:w-full group-focus:w-full transition-all duration-200 pointer-events-none"
                      style={{ backgroundColor: teamColor, opacity: isExpanded ? 0.16 : undefined }}
                    />
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="font-display font-bold text-xs text-[var(--text)] tracking-tight">
                        {item.driver.fullName}
                      </span>
                      <span className="text-xs text-[var(--text-dim)] font-semibold">
                        {item.driver.code}
                      </span>
                      {item.driver.number && (
                        <span className="text-[11px] text-[var(--text-dim)] tabular-nums">
                          #{item.driver.number}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Constructor */}
                  <td className="px-4 py-3 text-xs text-[var(--text-dim)]">
                    {item.constructor.name}
                  </td>

                  {/* Wins */}
                  <td className="px-4 py-3 text-center font-body text-xs tabular-nums">
                    {item.wins > 0 ? (
                      <span className="font-semibold text-[var(--text)]">
                        {item.wins}
                      </span>
                    ) : (
                      <span className="text-[var(--text-dim)]">0</span>
                    )}
                  </td>

                  {/* Gap to Leader */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="tabular-nums text-xs text-[var(--text)]">
                        {gapToLeader}
                      </span>
                      <div className="h-1 w-20 bg-[var(--line)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)]"
                          style={{ width: `${relativePct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="px-4 py-3 text-right font-display font-bold text-xs text-[var(--text)] tabular-nums">
                    {item.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
