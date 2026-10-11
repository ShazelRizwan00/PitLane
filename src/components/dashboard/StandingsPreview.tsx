import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DriverStanding, ConstructorStanding } from '../../api/types';
import { getTeamColor } from '../../lib/teamColors';

interface StandingsPreviewProps {
  topDrivers: DriverStanding[];
  topConstructors: ConstructorStanding[];
}

export function StandingsPreview({
  topDrivers,
  topConstructors,
}: StandingsPreviewProps) {
  const driverP1Points = topDrivers[0]?.points || 1;
  const constructorP1Points = topConstructors[0]?.points || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Driver Standings Timing Tower */}
      <div className="surface-panel corner-chamfer overflow-hidden glow-hover">
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between">
          <h3 className="text-xs font-display font-black uppercase tracking-wider text-[var(--text)]">
            Drivers Top 5
          </h3>
          <Link
            to="/drivers"
            className="text-xs font-display uppercase tracking-wider text-[var(--accent)] hover:underline flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span>Full order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topDrivers.length === 0 ? (
          <div className="p-6 text-center text-xs font-body text-[var(--text-dim)]">
            No driver classifications recorded for the 2026 season.
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {topDrivers.map((item, index) => {
              const teamColor = getTeamColor(item.constructor.id);
              const gapToLeader = item.position === 1 ? 'LEADER' : `-${driverP1Points - item.points} PTS`;

              return (
                <div
                  key={item.driver.id}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="animate-row-reveal flex items-center justify-between px-4 sm:px-5 py-2.5 hover:bg-[var(--line)]/30 transition-colors relative font-body text-xs"
                >
                  {/* Left team livery edge bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: teamColor }}
                    aria-hidden="true"
                  />

                  {/* Left: Position and Driver Info */}
                  <div className="flex items-center gap-3 pl-1">
                    <span className="w-5 text-center font-display font-black text-xs text-[var(--text-dim)] tabular-nums">
                      P{item.position}
                    </span>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold uppercase text-sm text-[var(--text)] tracking-tight">
                          {item.driver.fullName}
                        </span>
                        <span className="text-xs text-[var(--text-dim)] font-semibold">
                          {item.driver.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)]">
                        {item.constructor.name}
                      </div>
                    </div>
                  </div>

                  {/* Right: Gap & Points */}
                  <div className="text-right flex items-center gap-4">
                    <span className="text-[11px] text-[var(--text-dim)] tabular-nums hidden sm:inline">
                      {gapToLeader}
                    </span>

                    <div className="min-w-[50px]">
                      <div className="text-sm font-display font-black text-[var(--text)] leading-none tabular-nums">
                        {item.points} <span className="text-[10px] font-body text-[var(--text-dim)] uppercase font-normal">pts</span>
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5 tabular-nums">
                        {item.wins > 0 ? `${item.wins} W` : '0 W'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Constructor Standings Timing Tower */}
      <div className="surface-panel corner-chamfer overflow-hidden glow-hover">
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between">
          <h3 className="text-xs font-display font-black uppercase tracking-wider text-[var(--text)]">
            Teams Top 5
          </h3>
          <Link
            to="/teams"
            className="text-xs font-display uppercase tracking-wider text-[var(--accent)] hover:underline flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span>Full order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topConstructors.length === 0 ? (
          <div className="p-6 text-center text-xs font-body text-[var(--text-dim)]">
            No constructor classifications recorded for the 2026 season.
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {topConstructors.map((item, index) => {
              const teamColor = getTeamColor(item.constructor.id);
              const gapToLeader = item.position === 1 ? 'LEADER' : `-${constructorP1Points - item.points} PTS`;

              return (
                <div
                  key={item.constructor.id}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="animate-row-reveal flex items-center justify-between px-4 sm:px-5 py-2.5 hover:bg-[var(--line)]/30 transition-colors relative font-body text-xs"
                >
                  {/* Left team livery edge bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: teamColor }}
                    aria-hidden="true"
                  />

                  {/* Left: Position and Constructor Name */}
                  <div className="flex items-center gap-3 pl-1">
                    <span className="w-5 text-center font-display font-black text-xs text-[var(--text-dim)] tabular-nums">
                      P{item.position}
                    </span>

                    <div>
                      <div className="font-display font-bold uppercase text-sm text-[var(--text)] tracking-tight">
                        {item.constructor.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)]">
                        {item.constructor.nationality}
                      </div>
                    </div>
                  </div>

                  {/* Right: Gap & Points */}
                  <div className="text-right flex items-center gap-4">
                    <span className="text-[11px] text-[var(--text-dim)] tabular-nums hidden sm:inline">
                      {gapToLeader}
                    </span>

                    <div className="min-w-[50px]">
                      <div className="text-sm font-display font-black text-[var(--text)] leading-none tabular-nums">
                        {item.points} <span className="text-[10px] font-body text-[var(--text-dim)] uppercase font-normal">pts</span>
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5 tabular-nums">
                        {item.wins > 0 ? `${item.wins} W` : '0 W'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
