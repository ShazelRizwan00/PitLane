import { useConstructorStandings } from '../hooks/useConstructorStandings';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ConstructorPointsChart } from '../components/charts/ConstructorPointsChart';
import { getTeamColor } from '../lib/teamColors';
import { BarChart3 } from 'lucide-react';

export function TeamsPage() {
  const { status, data, error, retry } = useConstructorStandings(2026);

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-12 border border-[var(--line)] bg-[var(--surface)] animate-pulse" />
        <ChartSkeleton />
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <ErrorState
        title="Constructor Standings Unavailable"
        message={error?.message || 'Could not fetch team standings.'}
        onRetry={retry}
      />
    );
  }

  if (!data.standings || data.standings.length === 0) {
    return (
      <EmptyState
        title="No Constructor Standings Recorded"
        message="Team standings will appear after the first race of the championship."
      />
    );
  }

  const leaderPoints = data.leader?.points ?? 1;
  const totalTeams = data.standings.length;

  return (
    <div className="space-y-6 section-reveal">
      <PageHeader
        title="Constructors"
        subtitle={`Round ${data.round} classification · ${totalTeams} teams`}
        badge={
          <Badge variant="default">
            2026 Season
          </Badge>
        }
      />

      {/* Constructor Points Chart Container */}
      <div className="surface-panel corner-chamfer">
        <div className="px-4 sm:px-6 py-3 border-b border-[var(--line)] bg-[#19191E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-xs font-display font-black uppercase tracking-wider text-[var(--text)]">
              Points distribution
            </h3>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <ConstructorPointsChart standings={data.standings} />
        </div>
      </div>

      {/* Dense Standings Table */}
      <div className="w-full overflow-x-auto surface-panel">
        <table className="w-full text-left text-xs border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] font-body uppercase tracking-wider">
              <th className="px-3 py-3 w-14 text-center font-medium">Pos</th>
              <th className="px-4 py-3 font-medium">Constructor</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 text-center w-24 font-medium">Wins</th>
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

              return (
                <tr
                  key={`constructor-row-${item.constructor.id}`}
                  style={{ animationDelay: `${index * 20}ms` }}
                  className="animate-row-reveal group hover:bg-[var(--line)]/30 transition-colors relative"
                >
                  {/* Position */}
                  <td className="px-3 py-3 text-center font-display font-black text-xs text-[var(--text-dim)] tabular-nums">
                    P{item.positionText}
                  </td>

                  {/* Constructor Name with livery color bar */}
                  <td className="px-4 py-3 relative">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] group-hover:w-full transition-all duration-200 pointer-events-none"
                      style={{ backgroundColor: teamColor }}
                    />
                    <span className="relative z-10 font-display font-bold text-xs text-[var(--text)] tracking-tight">
                      {item.constructor.name}
                    </span>
                  </td>

                  {/* Country */}
                  <td className="px-4 py-3 text-xs text-[var(--text-dim)]">
                    {item.constructor.nationality}
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
