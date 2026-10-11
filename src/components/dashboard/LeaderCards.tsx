import { DriverStanding, ConstructorStanding } from '../../api/types';
import { getTeamColor } from '../../lib/teamColors';

interface LeaderCardsProps {
  driverLeader: DriverStanding | null;
  driverRunnerUp: DriverStanding | null;
  constructorLeader: ConstructorStanding | null;
  constructorRunnerUp?: ConstructorStanding | null;
}

export function LeaderCards({
  driverLeader,
  driverRunnerUp,
  constructorLeader,
  constructorRunnerUp,
}: LeaderCardsProps) {
  const driverTeamColor = getTeamColor(driverLeader?.constructor.id);
  const constructorColor = getTeamColor(constructorLeader?.constructor.id);

  const driverLeadMargin =
    driverLeader && driverRunnerUp ? Math.max(0, driverLeader.points - driverRunnerUp.points) : 0;
  const constructorMargin =
    constructorLeader && constructorRunnerUp
      ? Math.max(0, constructorLeader.points - constructorRunnerUp.points)
      : 0;

  const p1Points = driverLeader?.points ?? 1;
  const p2Points = driverRunnerUp?.points ?? 0;
  const p2BarPct = p1Points > 0 ? Math.round((p2Points / p1Points) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Drivers Championship Leader — Dominant Element (8 Cols) */}
      <div className="lg:col-span-8 surface-panel corner-chamfer flex flex-col justify-between p-5 sm:p-6 glow-hover">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">
            <span>Drivers · P1 Leader</span>
            {driverLeader?.driver.number && (
              <span className="tabular-nums font-semibold text-[var(--text)]">
                Car #{driverLeader.driver.number}
              </span>
            )}
          </div>

          {driverLeader ? (
            <div className="space-y-4">
              {/* Driver info */}
              <div>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-2xl sm:text-4xl font-display font-black uppercase text-[var(--text)] tracking-tight leading-none">
                    {driverLeader.driver.fullName}
                  </h2>
                  <span className="chip-skew text-xs font-mono font-bold text-[var(--text-dim)] border border-[var(--line)] px-2 py-0.5">
                    <span>{driverLeader.driver.code}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-mono text-[var(--text-dim)]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 shrink-0"
                      style={{ backgroundColor: driverTeamColor }}
                      aria-hidden="true"
                    />
                    <span className="text-[var(--text)] font-medium font-body">{driverLeader.constructor.name}</span>
                  </span>
                  <span>·</span>
                  <span>{driverLeader.driver.nationality}</span>
                  <span>·</span>
                  <span className="tabular-nums">{driverLeader.wins} {driverLeader.wins === 1 ? 'Win' : 'Wins'}</span>
                </div>
              </div>

              {/* Points & Gap to P2 Comparison Panel */}
              <div className="border border-[var(--line)] bg-[#19191E] p-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-[var(--text-dim)] uppercase">Points</div>
                    <div className="text-3xl sm:text-4xl font-display font-black text-[var(--text)] leading-none mt-1 tabular-nums">
                      {driverLeader.points}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-mono text-[var(--text-dim)] uppercase">Margin</div>
                    <div className="text-xl sm:text-2xl font-display font-black text-[var(--accent)] mt-1 tabular-nums">
                      +{driverLeadMargin} <span className="text-xs font-mono font-normal text-[var(--text-dim)]">PTS</span>
                    </div>
                  </div>
                </div>

                {driverRunnerUp && (
                  <div className="space-y-2 pt-3 border-t border-[var(--line)]">
                    <div className="flex justify-between text-xs font-body">
                      <span className="text-[var(--text)] font-medium">
                        P1 · {driverLeader.driver.familyName} ({driverLeader.points} pts)
                      </span>
                      <span className="text-[var(--text-dim)]">
                        P2 · {driverRunnerUp.driver.familyName} ({driverRunnerUp.points} pts)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--line)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] transition-all"
                        style={{ width: `${p2BarPct}%` }}
                      />
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-dim)] text-right tabular-nums">
                      +{driverLeadMargin} pts delta to {driverRunnerUp.driver.familyName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-xs font-mono text-[var(--text-dim)]">
              Standings pending.
            </div>
          )}
        </div>
      </div>

      {/* Constructors Championship Leader — Compact Telemetry Panel (4 Cols) */}
      <div className="lg:col-span-4 surface-panel corner-chamfer-br p-5 sm:p-6 flex flex-col justify-between glow-hover">
        <div className="space-y-4">
          <div className="text-xs font-mono text-[var(--text-dim)] border-b border-[var(--line)] pb-3 uppercase tracking-wider">
            Teams · P1 Leader
          </div>

          {constructorLeader ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 shrink-0"
                    style={{ backgroundColor: constructorColor }}
                    aria-hidden="true"
                  />
                  <h3 className="text-xl sm:text-2xl font-display font-black uppercase text-[var(--text)] tracking-tight">
                    {constructorLeader.constructor.name}
                  </h3>
                </div>
                <div className="text-xs font-mono text-[var(--text-dim)] mt-1">
                  {constructorLeader.constructor.nationality} · {constructorLeader.wins} {constructorLeader.wins === 1 ? 'Win' : 'Wins'}
                </div>
              </div>

              <div className="border border-[var(--line)] bg-[#19191E] p-4 space-y-2">
                <div className="text-[11px] font-mono text-[var(--text-dim)] uppercase">Points</div>
                <div className="text-3xl font-display font-black text-[var(--text)] tabular-nums">
                  {constructorLeader.points}
                </div>
                <div className="text-xs font-mono text-[var(--text-dim)] pt-2 border-t border-[var(--line)] tabular-nums">
                  +{constructorMargin} pts over P2
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-xs font-mono text-[var(--text-dim)]">
              Standings pending.
            </div>
          )}
        </div>

        <div className="text-[11px] font-mono text-[var(--text-dim)] pt-3 border-t border-[var(--line)] uppercase tracking-wider">
          Classification official
        </div>
      </div>
    </div>
  );
}
