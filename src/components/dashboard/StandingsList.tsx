import { useState, useMemo, useEffect } from 'react';
import { DriverStanding, ConstructorStanding, RaceResult } from '../../api/types';
import { SeasonRoundResult } from '../../api/races';
import { getTeamColor } from '../../lib/teamColors';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StandingsListProps {
  seasonResults: SeasonRoundResult[];
  currentDriverStandings: DriverStanding[];
  currentConstructorStandings: ConstructorStanding[];
  completedRacesCount: number;
}

interface ComputedDriverRow {
  driverId: string;
  fullName: string;
  familyName: string;
  code: string;
  carNumber: number | null;
  constructorId: string;
  constructorName: string;
  points: number;
  position: number;
  prevPosition: number;
  positionDelta: number;
  gapToLeader: number;
  recentFinishes: { round: number; pos: number; text: string; isDnf: boolean }[];
}

interface ComputedConstructorRow {
  constructorId: string;
  name: string;
  points: number;
  position: number;
  prevPosition: number;
  positionDelta: number;
  gapToLeader: number;
}

export function StandingsList({
  seasonResults,
  currentDriverStandings,
  currentConstructorStandings,
  completedRacesCount,
}: StandingsListProps) {
  const maxRound = Math.max(1, completedRacesCount);
  const [selectedRound, setSelectedRound] = useState<number>(maxRound);
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRound(Math.max(1, completedRacesCount));
  }, [completedRacesCount]);

  useEffect(() => {
    const handlePrev = () => {
      setSelectedRound((prev) => Math.max(1, prev - 1));
    };
    const handleNext = () => {
      setSelectedRound((prev) => Math.min(maxRound, prev + 1));
    };
    window.addEventListener('scrub-round-prev', handlePrev);
    window.addEventListener('scrub-round-next', handleNext);
    return () => {
      window.removeEventListener('scrub-round-prev', handlePrev);
      window.removeEventListener('scrub-round-next', handleNext);
    };
  }, [maxRound]);

  // Compute standings for selectedRound
  const { driverRows, constructorRows } = useMemo(() => {
    if (!seasonResults || seasonResults.length === 0 || selectedRound === completedRacesCount) {
      const leaderPts = currentDriverStandings[0]?.points || 0;
      const cLeaderPts = currentConstructorStandings[0]?.points || 0;

      const dRows: ComputedDriverRow[] = currentDriverStandings.map((d) => ({
        driverId: d.driver.id,
        fullName: d.driver.fullName,
        familyName: d.driver.familyName,
        code: d.driver.code || d.driver.familyName.slice(0, 3).toUpperCase(),
        carNumber: d.driver.number,
        constructorId: d.constructor.id,
        constructorName: d.constructor.name,
        points: d.points,
        position: d.position,
        prevPosition: d.position,
        positionDelta: 0,
        gapToLeader: Math.max(0, leaderPts - d.points),
        recentFinishes: [],
      }));

      const cRows: ComputedConstructorRow[] = currentConstructorStandings.map((c) => ({
        constructorId: c.constructor.id,
        name: c.constructor.name,
        points: c.points,
        position: c.position,
        prevPosition: c.position,
        positionDelta: 0,
        gapToLeader: Math.max(0, cLeaderPts - c.points),
      }));

      return { driverRows: dRows, constructorRows: cRows };
    }

    // Cumulative points map across rounds <= selectedRound
    const driverTotals: Record<
      string,
      {
        driver: DriverStanding['driver'];
        constructor: DriverStanding['constructor'];
        points: number;
        prevPoints: number;
        finishes: { round: number; pos: number; text: string; isDnf: boolean }[];
      }
    > = {};

    const constrTotals: Record<
      string,
      {
        constructor: DriverStanding['constructor'];
        points: number;
        prevPoints: number;
      }
    > = {};

    const sortedRounds = [...seasonResults].sort((a, b) => a.round - b.round);

    sortedRounds.forEach((roundData) => {
      if (roundData.round <= selectedRound) {
        const isCurrentRound = roundData.round === selectedRound;

        roundData.results.forEach((res: RaceResult) => {
          if (!driverTotals[res.driver.id]) {
            driverTotals[res.driver.id] = {
              driver: res.driver,
              constructor: res.constructor,
              points: 0,
              prevPoints: 0,
              finishes: [],
            };
          }

          if (!isCurrentRound) {
            driverTotals[res.driver.id]!.prevPoints += res.points;
          }
          driverTotals[res.driver.id]!.points += res.points;

          const isDnf = !res.timeFormatted && res.status && res.status !== 'Finished' && !res.status.startsWith('+');
          driverTotals[res.driver.id]!.finishes.push({
            round: roundData.round,
            pos: res.position,
            text: res.positionText,
            isDnf: Boolean(isDnf),
          });

          if (!constrTotals[res.constructor.id]) {
            constrTotals[res.constructor.id] = {
              constructor: res.constructor,
              points: 0,
              prevPoints: 0,
            };
          }

          if (!isCurrentRound) {
            constrTotals[res.constructor.id]!.prevPoints += res.points;
          }
          constrTotals[res.constructor.id]!.points += res.points;
        });
      }
    });

    const priorRankedDrivers = Object.entries(driverTotals)
      .map(([id, data]) => ({ id, points: data.prevPoints }))
      .sort((a, b) => b.points - a.points);
    const priorDriverPosMap = new Map<string, number>();
    priorRankedDrivers.forEach((item, index) => {
      priorDriverPosMap.set(item.id, index + 1);
    });

    const rankedDrivers = Object.entries(driverTotals)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.points - a.points);

    const leaderPts = rankedDrivers[0]?.points || 0;

    const dRows: ComputedDriverRow[] = rankedDrivers.map((item, index) => {
      const position = index + 1;
      const prevPosition = selectedRound === 1 ? position : priorDriverPosMap.get(item.id) || position;
      const positionDelta = prevPosition - position;

      return {
        driverId: item.id,
        fullName: item.driver.fullName,
        familyName: item.driver.familyName,
        code: item.driver.code || item.driver.familyName.slice(0, 3).toUpperCase(),
        carNumber: item.driver.number,
        constructorId: item.constructor.id,
        constructorName: item.constructor.name,
        points: item.points,
        position,
        prevPosition,
        positionDelta,
        gapToLeader: Math.max(0, leaderPts - item.points),
        recentFinishes: item.finishes.slice(-5),
      };
    });

    const priorRankedConstr = Object.entries(constrTotals)
      .map(([id, data]) => ({ id, points: data.prevPoints }))
      .sort((a, b) => b.points - a.points);
    const priorConstrPosMap = new Map<string, number>();
    priorRankedConstr.forEach((item, index) => {
      priorConstrPosMap.set(item.id, index + 1);
    });

    const rankedConstr = Object.entries(constrTotals)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.points - a.points);

    const cLeaderPts = rankedConstr[0]?.points || 0;

    const cRows: ComputedConstructorRow[] = rankedConstr.map((item, index) => {
      const position = index + 1;
      const prevPosition = selectedRound === 1 ? position : priorConstrPosMap.get(item.id) || position;
      const positionDelta = prevPosition - position;

      return {
        constructorId: item.id,
        name: item.constructor.name,
        points: item.points,
        position,
        prevPosition,
        positionDelta,
        gapToLeader: Math.max(0, cLeaderPts - item.points),
      };
    });

    return { driverRows: dRows, constructorRows: cRows };
  }, [seasonResults, selectedRound, completedRacesCount, currentDriverStandings, currentConstructorStandings]);

  const currentScrubRace = seasonResults.find((r) => r.round === selectedRound);

  return (
    <div className="space-y-4">
      {/* Round Scrubber Header Bar */}
      <div className="surface-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              Championship Standings
            </h2>
            <span className="text-xs font-mono text-[var(--color-text-dim)] tabular-nums">
              Round {selectedRound} of {maxRound}
            </span>
            {currentScrubRace && (
              <span className="text-xs text-[var(--color-text-dim)] truncate max-w-[220px]">
                ({currentScrubRace.raceName})
              </span>
            )}
          </div>

          {/* Tab Selector & Step Arrows */}
          <div className="flex items-center gap-3">
            {/* Scrubber step buttons */}
            <div className="flex items-center border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-0.5 text-xs font-mono rounded-xs">
              <button
                type="button"
                onClick={() => setSelectedRound((prev) => Math.max(1, prev - 1))}
                disabled={selectedRound <= 1}
                aria-label="Previous round"
                className="px-2 py-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] min-h-[32px] min-w-[32px] flex items-center justify-center rounded-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs text-[var(--color-text)] tabular-nums font-semibold">
                R{String(selectedRound).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => setSelectedRound((prev) => Math.min(maxRound, prev + 1))}
                disabled={selectedRound >= maxRound}
                aria-label="Next round"
                className="px-2 py-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] min-h-[32px] min-w-[32px] flex items-center justify-center rounded-xs"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drivers vs Constructors toggle */}
            <div className="flex items-center border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-0.5 text-xs font-medium rounded-xs">
              <button
                type="button"
                onClick={() => setActiveTab('drivers')}
                className={`px-3 py-1 transition-colors min-h-[32px] cursor-pointer rounded-xs focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                  activeTab === 'drivers'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                Drivers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('constructors')}
                className={`px-3 py-1 transition-colors min-h-[32px] cursor-pointer rounded-xs focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                  activeTab === 'constructors'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                Constructors
              </button>
            </div>
          </div>
        </div>

        {/* Round Scrubber Slider */}
        {maxRound > 1 && (
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min="1"
              max={maxRound}
              value={selectedRound}
              onChange={(e) => setSelectedRound(parseInt(e.target.value, 10))}
              aria-label="Scrub championship rounds"
              className="w-full accent-[var(--color-primary)] bg-[var(--color-line)] h-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
            <div className="flex justify-between text-[11px] text-[var(--color-text-dim)] font-mono tabular-nums">
              <span>R01</span>
              <span>Scrub rounds using arrows or slider</span>
              <span>R{maxRound}</span>
            </div>
          </div>
        )}
      </div>

      {/* Standings Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'drivers' ? (
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] text-[var(--color-text-dim)] font-medium">
                  <th className="py-2.5 px-3 w-12 text-center">Pos</th>
                  <th className="py-2.5 px-3 w-14 text-center">Delta</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Constructor</th>
                  <th className="py-2.5 px-3 text-right">Gap to leader</th>
                  <th className="py-2.5 px-4 text-right w-24">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)] text-[var(--color-text)]">
                {driverRows.slice(0, 15).map((row) => {
                  const teamColor = getTeamColor(row.constructorId);
                  const isExpanded = expandedDriverId === row.driverId;

                  return (
                    <tr
                      key={row.driverId}
                      onClick={() => setExpandedDriverId(isExpanded ? null : row.driverId)}
                      tabIndex={0}
                      role="button"
                      aria-expanded={isExpanded}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedDriverId(isExpanded ? null : row.driverId);
                        }
                      }}
                      className="data-row cursor-pointer select-none"
                    >
                      {/* Position */}
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-[var(--color-text-dim)] tabular-nums">
                        {row.position}
                      </td>

                      {/* Delta since last round */}
                      <td className="py-2.5 px-3 text-center tabular-nums text-xs font-mono">
                        {row.positionDelta > 0 ? (
                          <span className="text-[#00D26A] flex items-center justify-center gap-0.5">
                            ▲ {row.positionDelta}
                          </span>
                        ) : row.positionDelta < 0 ? (
                          <span className="text-red-400 flex items-center justify-center gap-0.5">
                            ▼ {Math.abs(row.positionDelta)}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-dim)]">—</span>
                        )}
                      </td>

                      {/* Driver Name & team color indicator */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-1 h-3.5 shrink-0 rounded-xs"
                            style={{ backgroundColor: teamColor }}
                            aria-hidden="true"
                          />
                          <span className="font-medium text-[var(--color-text)]">
                            {row.fullName}
                          </span>
                          <span className="text-xs text-[var(--color-text-dim)] font-mono">
                            {row.code}
                          </span>
                          {row.carNumber && (
                            <span className="text-[11px] text-[var(--color-text-dim)] tabular-nums font-mono">
                              #{row.carNumber}
                            </span>
                          )}
                        </div>

                        {/* Expanded last finishes */}
                        {isExpanded && row.recentFinishes.length > 0 && (
                          <div className="pt-2 pb-1 flex items-center gap-2 text-[11px] text-[var(--color-text-dim)]">
                            <span>Last {row.recentFinishes.length} races:</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              {row.recentFinishes.map((f) => (
                                <span
                                  key={`finish-${row.driverId}-${f.round}`}
                                  className={`px-1.5 py-0.5 rounded-xs border text-[10px] ${
                                    f.pos === 1
                                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-semibold'
                                      : f.pos <= 3
                                      ? 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] border-[var(--color-line)] font-semibold'
                                      : f.isDnf
                                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                      : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-dim)] border-[var(--color-line)]'
                                  }`}
                                >
                                  {f.isDnf ? 'DNF' : `P${f.pos}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Constructor */}
                      <td className="py-2.5 px-3 text-xs text-[var(--color-text-dim)]">
                        {row.constructorName}
                      </td>

                      {/* Gap to Leader */}
                      <td className="py-2.5 px-3 text-right tabular-nums text-xs text-[var(--color-text-dim)] font-mono">
                        {row.position === 1 ? (
                          <span className="font-semibold text-[var(--color-text)]">Leader</span>
                        ) : (
                          `-${row.gapToLeader} pts`
                        )}
                      </td>

                      {/* Points */}
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-xs text-[var(--color-text)] tabular-nums">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] text-[var(--color-text-dim)] font-medium">
                  <th className="py-2.5 px-3 w-12 text-center">Pos</th>
                  <th className="py-2.5 px-3 w-14 text-center">Delta</th>
                  <th className="py-2.5 px-3">Constructor</th>
                  <th className="py-2.5 px-3 text-right">Gap to leader</th>
                  <th className="py-2.5 px-4 text-right w-24">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)] text-[var(--color-text)]">
                {constructorRows.map((row) => {
                  const teamColor = getTeamColor(row.constructorId);

                  return (
                    <tr
                      key={row.constructorId}
                      className="data-row select-none"
                    >
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-[var(--color-text-dim)] tabular-nums">
                        {row.position}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums text-xs font-mono">
                        {row.positionDelta > 0 ? (
                          <span className="text-[#00D26A] flex items-center justify-center gap-0.5">
                            ▲ {row.positionDelta}
                          </span>
                        ) : row.positionDelta < 0 ? (
                          <span className="text-red-400 flex items-center justify-center gap-0.5">
                            ▼ {Math.abs(row.positionDelta)}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-dim)]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-1 h-3.5 shrink-0 rounded-xs"
                            style={{ backgroundColor: teamColor }}
                            aria-hidden="true"
                          />
                          <span className="font-medium text-xs text-[var(--color-text)]">
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-xs text-[var(--color-text-dim)] font-mono">
                        {row.position === 1 ? 'Leader' : `-${row.gapToLeader} pts`}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-xs text-[var(--color-text)] tabular-nums">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="text-xs text-[var(--color-text-dim)] flex items-center justify-between">
        <span>Click any driver row to inspect recent race finishes.</span>
        <span className="hidden sm:inline">Delta indicates position change compared to previous round.</span>
      </div>
    </div>
  );
}
