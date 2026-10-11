import { Link } from 'react-router-dom';
import { ArrowRight, Timer } from 'lucide-react';
import { RaceResult, Race } from '../../api/types';
import { getTeamColor } from '../../lib/teamColors';

interface RecentResultsProps {
  race: Race | null;
  results: RaceResult[];
}

export function RecentResults({ race, results }: RecentResultsProps) {
  if (!race || results.length === 0) {
    return (
      <div className="surface-card p-6 text-center text-xs font-mono text-[var(--color-text-dim)]">
        No classifications recorded for 2026 yet.
      </div>
    );
  }

  const cleanRaceName =
    race.name === 'Bahrain Grand Prix in Malaysia' ? 'Malaysian Grand Prix' : race.name;

  return (
    <div className="surface-card overflow-hidden">
      {/* Header bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            Round {race.round} Classification · {cleanRaceName}
          </h2>
        </div>
        <Link
          to={`/results?round=${race.round}`}
          className="text-xs font-medium text-[var(--color-text-dim)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] min-h-[36px]"
        >
          <span>Full classification</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[580px]">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-[var(--color-text-dim)] font-medium bg-[var(--color-surface)]">
              <th className="py-2.5 px-4 w-14 text-center">Pos</th>
              <th className="py-2.5 px-4">Driver</th>
              <th className="py-2.5 px-4">Constructor</th>
              <th className="py-2.5 px-4 text-right">Time / Interval</th>
              <th className="py-2.5 px-4 text-right w-20">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)] text-[var(--color-text)]">
            {results.map((res) => {
              const teamColor = getTeamColor(res.constructor.id);
              const isDnf = !res.timeFormatted && res.status && res.status !== 'Finished' && !res.status.startsWith('+');

              return (
                <tr
                  key={`recent-${res.driver.id}`}
                  className="data-row"
                >
                  {/* Position */}
                  <td className="py-2.5 px-4 text-center font-mono font-medium text-[var(--color-text-dim)] tabular-nums">
                    {res.positionText}
                  </td>

                  {/* Driver Name & Livery Bar */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-1 h-3.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: teamColor }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-xs text-[var(--color-text)]">
                        {res.driver.fullName}
                      </span>
                      <span className="text-xs text-[var(--color-text-dim)] font-mono">
                        {res.driver.code}
                      </span>
                    </div>
                  </td>

                  {/* Constructor */}
                  <td className="py-2.5 px-4 text-xs text-[var(--color-text-dim)]">
                    {res.constructor.name}
                  </td>

                  {/* Time / Status */}
                  <td className="py-2.5 px-4 text-right tabular-nums text-xs text-[var(--color-text)] font-mono">
                    <div className="flex items-center justify-end gap-2">
                      {res.fastestLapRank === 1 && (
                        <span
                          title={`Fastest Lap: ${res.fastestLapTime || ''}`}
                          className="sector-purple px-1.5 py-0.5 rounded-xs text-[10px] font-semibold flex items-center gap-0.5"
                        >
                          <Timer className="w-2.5 h-2.5" />
                          FL
                        </span>
                      )}
                      {isDnf ? (
                        <span className="text-red-400 font-mono text-[10px]">
                          DNF · {res.status}
                        </span>
                      ) : (
                        <span>{res.timeFormatted || res.status}</span>
                      )}
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-xs text-[var(--color-text)] tabular-nums">
                    {res.points > 0 ? (
                      <span>+{res.points}</span>
                    ) : (
                      <span className="text-[var(--color-text-dim)]">0</span>
                    )}
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
