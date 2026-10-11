import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRaces } from '../hooks/useRaces';
import { useRaceResults } from '../hooks/useRaceResults';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { getTeamColor } from '../lib/teamColors';
import { Calendar, MapPin, Timer, ChevronDown } from 'lucide-react';

export function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const racesState = useRaces(2026);

  const completedRaces = racesState.data?.completedRaces ?? [];

  const urlRoundStr = searchParams.get('round');
  const urlRound = urlRoundStr ? parseInt(urlRoundStr, 10) : null;

  const defaultRound = completedRaces.length > 0
    ? completedRaces[completedRaces.length - 1]!.round
    : null;

  const activeRound = urlRound || defaultRound;

  useEffect(() => {
    if (!urlRound && defaultRound) {
      setSearchParams({ round: defaultRound.toString() }, { replace: true });
    }
  }, [urlRound, defaultRound, setSearchParams]);

  const resultsState = useRaceResults(activeRound, 2026);
  const selectedRace = racesState.data?.races.find((r) => r.round === activeRound);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (racesState.status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-12 border border-[var(--line)] bg-[var(--surface)] animate-pulse" />
        <TableSkeleton rows={10} columns={6} />
      </div>
    );
  }

  if (racesState.status === 'error' || !racesState.data) {
    return (
      <ErrorState
        title="Race Results Unavailable"
        message={racesState.error?.message || 'Could not load completed races from timing feed.'}
        onRetry={racesState.retry}
      />
    );
  }

  return (
    <div className="space-y-6 section-reveal">
      <PageHeader
        title="Results"
        subtitle={`Round ${activeRound} official classification`}
        badge={
          <Badge variant="default">
            2026
          </Badge>
        }
      >
        {/* Race Selector Dropdown */}
        <div className="relative min-w-[260px]">
          <select
            value={activeRound || ''}
            onChange={(e) => setSearchParams({ round: e.target.value })}
            aria-label="Select Grand Prix round"
            className="w-full appearance-none bg-[#19191E] border border-[var(--line)] px-3.5 py-2 text-xs font-mono font-semibold text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] pr-9 cursor-pointer uppercase tracking-wider min-h-[44px]"
          >
            {completedRaces.length === 0 ? (
              <option disabled>No completed races yet</option>
            ) : (
              completedRaces.map((r) => {
                const rName = r.name === 'Bahrain Grand Prix in Malaysia' ? 'Malaysian Grand Prix' : r.name;
                return (
                  <option key={`opt-round-${r.round}`} value={r.round} className="bg-[var(--surface)] text-[var(--text)]">
                    R{r.round}: {rName}
                  </option>
                );
              })
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-[var(--text-dim)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </PageHeader>

      {/* Selected Grand Prix Metadata Card */}
      {selectedRace && (() => {
        const cleanName = selectedRace.name === 'Bahrain Grand Prix in Malaysia' ? 'Malaysian Grand Prix' : selectedRace.name;
        return (
          <div className="surface-panel corner-chamfer p-5 sm:p-6 glow-hover">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1 text-xs font-mono text-[var(--text-dim)]">
                  <span>Round {selectedRace.round}</span>
                  <span>·</span>
                  <span>Classification</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-[var(--text)] tracking-tight leading-tight">
                  {cleanName}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-body text-[var(--text-dim)] mt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    {selectedRace.circuit.name} ({selectedRace.circuit.locality}, {selectedRace.circuit.country})
                  </span>
                  <span className="flex items-center gap-1.5 tabular-nums font-mono text-[var(--text)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                    {formatDate(selectedRace.date)}
                  </span>
                </div>
              </div>

              {resultsState.data?.results && resultsState.data.results.length > 0 && (
                <div className="flex items-center gap-3 border border-[var(--line)] bg-[#19191E] p-3 shrink-0">
                  <div className="chip-skew w-8 h-8 bg-[var(--primary)] border border-[var(--primary)] text-[var(--text)] flex items-center justify-center font-display font-black text-xs shrink-0">
                    <span>P1</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[var(--text-dim)]">
                      Winner
                    </div>
                    <div className="text-xs font-display font-bold text-[var(--text)]">
                      {resultsState.data.results[0]?.driver.fullName}
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)] font-body">
                      {resultsState.data.results[0]?.constructor.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Results Table / State */}
      {resultsState.status === 'loading' ? (
        <TableSkeleton rows={12} columns={6} />
      ) : resultsState.status === 'error' ? (
        <ErrorState
          title={`Unable to Load Results for Round ${activeRound}`}
          message={resultsState.error?.message || 'Race classification could not be verified.'}
          onRetry={resultsState.retry}
        />
      ) : !resultsState.data || resultsState.data.results.length === 0 ? (
        <EmptyState
          title="Classification Pending"
          message={`Classification for Round ${activeRound} is not yet available.`}
        />
      ) : (
        <div className="w-full overflow-x-auto surface-panel">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] font-body uppercase tracking-wider">
                <th className="px-4 py-3 w-14 text-center font-medium">Pos</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Constructor</th>
                <th className="px-4 py-3 text-center w-20 font-medium">Grid</th>
                <th className="px-4 py-3 text-center w-20 font-medium">Laps</th>
                <th className="px-4 py-3 font-medium">Time / Status</th>
                <th className="px-4 py-3 text-right w-20 font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--text)] font-body">
              {resultsState.data.results.map((res, index) => {
                const teamColor = getTeamColor(res.constructor.id);
                const isDnf = !res.timeFormatted && res.status && res.status !== 'Finished' && !res.status.startsWith('+');

                return (
                  <tr
                    key={`res-${res.driver.id}`}
                    style={{ animationDelay: `${index * 15}ms` }}
                    className="animate-row-reveal hover:bg-[var(--line)]/30 transition-colors relative"
                  >
                    {/* Position */}
                    <td className="px-4 py-3 text-center font-display font-black text-xs text-[var(--text-dim)] tabular-nums">
                      {res.positionText}
                    </td>

                    {/* Driver */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-1 h-5 shrink-0"
                          style={{ backgroundColor: teamColor }}
                          aria-hidden="true"
                        />
                        <span className="font-display font-bold text-xs text-[var(--text)] tracking-tight">
                          {res.driver.fullName}
                        </span>
                        <span className="text-xs text-[var(--text-dim)] font-semibold">
                          {res.driver.code}
                        </span>
                        {res.driver.number && (
                          <span className="text-xs text-[var(--text-dim)] tabular-nums">
                            #{res.driver.number}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-4 py-3 text-xs text-[var(--text-dim)]">
                      {res.constructor.name}
                    </td>

                    {/* Grid */}
                    <td className="px-4 py-3 text-center tabular-nums text-xs text-[var(--text-dim)]">
                      P{res.grid}
                    </td>

                    {/* Laps */}
                    <td className="px-4 py-3 text-center tabular-nums text-xs text-[var(--text-dim)]">
                      {res.laps}
                    </td>

                    {/* Time / Status */}
                    <td className="px-4 py-3 tabular-nums text-xs text-[var(--text)]">
                      <div className="flex items-center gap-2">
                        {res.fastestLapRank === 1 && (
                          <span
                            title={`Fastest Lap: ${res.fastestLapTime || ''}`}
                            className="chip-skew px-1.5 py-0.5 border border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)] text-[10px] font-bold"
                          >
                            <span className="flex items-center gap-0.5">
                              <Timer className="w-2.5 h-2.5" />
                              FL {res.fastestLapTime ? `· ${res.fastestLapTime}` : ''}
                            </span>
                          </span>
                        )}
                        {isDnf ? (
                          <span className="chip-skew px-1.5 py-0.5 border border-[var(--loss)]/40 bg-[var(--loss)]/10 text-[var(--loss)] text-[10px] font-bold">
                            <span>▼ DNF · {res.status}</span>
                          </span>
                        ) : (
                          <span>{res.timeFormatted || res.status}</span>
                        )}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-4 py-3 text-right font-display font-bold text-xs text-[var(--text)] tabular-nums">
                      {res.points > 0 ? (
                        <span>+{res.points}</span>
                      ) : (
                        <span className="text-[var(--text-dim)]">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
