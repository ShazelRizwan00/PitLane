import { useMemo } from 'react';
import { Race, RaceResult, DriverStanding } from '../../api/types';
import { SeasonRoundResult } from '../../api/races';
import { getTeamColor } from '../../lib/teamColors';
import { TrackOutline } from '../ui/TrackOutline';
import { SessionCountdown, formatLocalizedSession } from './SessionCountdown';

interface SeasonHeroProps {
  season: number;
  totalRaces: number;
  completedRaces: number;
  remainingRaces: number;
  nextRace?: Race | null;
  driverLeader?: DriverStanding | null;
  driverRunnerUp?: DriverStanding | null;
  latestCompletedRace?: Race | null;
  latestRaceResults?: RaceResult[];
  upcomingRaces?: Race[];
  seasonResults?: SeasonRoundResult[];
}

export function SeasonHero({
  season,
  totalRaces,
  completedRaces,
  remainingRaces,
  nextRace,
  driverLeader,
  driverRunnerUp,
  latestCompletedRace,
  latestRaceResults = [],
  seasonResults = [],
}: SeasonHeroProps) {
  const leaderPoints = driverLeader?.points ?? 0;
  const runnerUpPoints = driverRunnerUp?.points ?? 0;
  const gap = Math.max(0, leaderPoints - runnerUpPoints);
  const leaderName = driverLeader?.driver.familyName ?? 'Leader';
  const runnerUpName = driverRunnerUp?.driver.familyName ?? 'Chaser';
  const leaderTeamColor = getTeamColor(driverLeader?.constructor.id);
  const runnerUpTeamColor = getTeamColor(driverRunnerUp?.constructor.id);

  // Clean race name if malformed
  const cleanCompletedRaceName = latestCompletedRace
    ? latestCompletedRace.name === 'Bahrain Grand Prix in Malaysia'
      ? 'Malaysian Grand Prix'
      : latestCompletedRace.name
    : null;

  const lastPodium = latestRaceResults.slice(0, 3);

  // --------------------------------------------------------------------------
  // Points Progression & Reachable Points Calculation for Inline SVG Chart
  // --------------------------------------------------------------------------
  const chartData = useMemo(() => {
    const leaderId = driverLeader?.driver.id;
    const chaserId = driverRunnerUp?.driver.id;

    // Track running totals
    const pointsHistory: { round: number; leaderPts: number; chaserPts: number }[] = [
      { round: 0, leaderPts: 0, chaserPts: 0 },
    ];

    let runningLeader = 0;
    let runningChaser = 0;

    const sortedRounds = [...seasonResults].sort((a, b) => a.round - b.round);

    if (sortedRounds.length > 0) {
      sortedRounds.forEach((rnd) => {
        if (rnd.round <= completedRaces) {
          const lRes = rnd.results.find((r) => r.driver.id === leaderId);
          const cRes = rnd.results.find((r) => r.driver.id === chaserId);
          runningLeader += lRes?.points ?? 0;
          runningChaser += cRes?.points ?? 0;
          pointsHistory.push({
            round: rnd.round,
            leaderPts: runningLeader,
            chaserPts: runningChaser,
          });
        }
      });
    }

    // Fallback if round-by-round results were empty or truncated
    if (pointsHistory.length <= 1 && completedRaces > 0) {
      for (let r = 1; r <= completedRaces; r++) {
        const factor = r / completedRaces;
        pointsHistory.push({
          round: r,
          leaderPts: Math.round(leaderPoints * factor),
          chaserPts: Math.round(runnerUpPoints * factor),
        });
      }
    }

    // Ensure the latest completed round exactly matches official points
    const lastItem = pointsHistory[pointsHistory.length - 1];
    if (lastItem && pointsHistory.length > 1) {
      lastItem.leaderPts = leaderPoints;
      lastItem.chaserPts = runnerUpPoints;
    }

    return pointsHistory;
  }, [seasonResults, completedRaces, driverLeader, driverRunnerUp, leaderPoints, runnerUpPoints]);

  // Max points available in remaining rounds (26 pts per round: 25 win + 1 FL)
  const maxAvailableRemaining = remainingRaces * 26;
  const maxReachableChaser = runnerUpPoints + maxAvailableRemaining;
  const maxReachableLeader = leaderPoints + maxAvailableRemaining;
  const chartMaxY = Math.max(maxReachableLeader, 450);

  // SVG coordinate scale
  const svgWidth = 640;
  const svgHeight = 150;
  const padLeft = 34;
  const padRight = 24;
  const padTop = 18;
  const padBottom = 24;

  const getX = (round: number) => {
    const total = Math.max(totalRaces, 1);
    return padLeft + (round / total) * (svgWidth - padLeft - padRight);
  };

  const getY = (pts: number) => {
    return svgHeight - padBottom - (pts / chartMaxY) * (svgHeight - padTop - padBottom);
  };

  // Build SVG path strings
  const leaderPath = chartData.reduce((acc, pt, i) => {
    const x = getX(pt.round);
    const y = getY(pt.leaderPts);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const chaserPath = chartData.reduce((acc, pt, i) => {
    const x = getX(pt.round);
    const y = getY(pt.chaserPts);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Reachable points shaded polygon (from current completed round to total races)
  const curX = getX(completedRaces);
  const finalX = getX(totalRaces);
  const curChaserY = getY(runnerUpPoints);
  const maxChaserFinalY = getY(maxReachableChaser);
  const curLeaderY = getY(leaderPoints);
  const maxLeaderFinalY = getY(maxReachableLeader);

  // Polygon connecting current points to maximum reachable trajectory
  const reachablePolygon = `M ${curX} ${curChaserY} L ${finalX} ${maxChaserFinalY} L ${finalX} ${maxLeaderFinalY} L ${curX} ${curLeaderY} Z`;

  return (
    <section
      aria-label="Championship Overview"
      className="surface-card p-5 sm:p-6 mb-8 border border-[var(--color-line)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================================================================= */}
        {/* DOMINANT TITLE FIGHT: Headline, points data, season chart         */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            {/* Meta context */}
            <div className="flex items-center justify-between text-xs text-[var(--color-text-dim)] mb-2">
              <span className="font-semibold uppercase tracking-wider text-[var(--color-text)]">
                Title Fight · {season} Season
              </span>
              <span className="font-mono tabular-nums">
                Round {completedRaces} of {totalRaces}
              </span>
            </div>

            {/* Human copy headline */}
            <h1 className="text-2xl sm:text-3xl font-display tracking-tight text-[var(--color-text)]">
              {leaderName} leads {runnerUpName} by {gap} with {remainingRaces} rounds left.
            </h1>

            {/* Concise numerical interval */}
            <div className="mt-3 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: leaderTeamColor }}
                />
                <span className="font-medium text-[var(--color-text)]">
                  {driverLeader?.driver.fullName}
                </span>
                <span className="font-mono font-semibold text-[var(--color-text)] tabular-nums">
                  {leaderPoints} pts
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: runnerUpTeamColor === leaderTeamColor ? '#94A3B8' : runnerUpTeamColor }}
                />
                <span className="text-[var(--color-text-dim)]">
                  {driverRunnerUp?.driver.fullName}
                </span>
                <span className="font-mono font-semibold text-[var(--color-text-dim)] tabular-nums">
                  {runnerUpPoints} pts
                </span>
              </div>

              <div className="text-xs text-[var(--color-text-dim)] font-mono ml-auto">
                Max {maxAvailableRemaining} pts remaining
              </div>
            </div>
          </div>

          {/* Inline SVG Championship Points Progression Chart */}
          <div className="border border-[var(--color-line-subtle)] bg-[var(--color-surface-subtle)] p-3 rounded-xs">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-dim)] mb-1">
              <span className="font-medium">Points progression &amp; reachable points</span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#27F4D2]" />
                  <span>{leaderName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#94A3B8]" />
                  <span>{runnerUpName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#27F4D2]/20 border border-[#27F4D2]/40" />
                  <span>Reachable zone</span>
                </span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-36 sm:h-40 overflow-visible select-none"
              aria-hidden="true"
            >
              {/* Horizontal gridlines */}
              {[100, 200, 300, 400].map((level) => {
                const y = getY(level);
                return (
                  <g key={`lvl-${level}`}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="var(--color-line)"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                    <text
                      x={padLeft - 6}
                      y={y + 3}
                      textAnchor="end"
                      fill="var(--color-text-subtle)"
                      fontSize="9"
                      fontFamily="ui-monospace, monospace"
                      className="tabular-nums"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Vertical boundary line at current completed race */}
              <line
                x1={curX}
                y1={padTop}
                x2={curX}
                y2={svgHeight - padBottom}
                stroke="var(--color-line)"
                strokeWidth="1"
              />

              {/* Reachable points shaded polygon */}
              {remainingRaces > 0 && (
                <path
                  d={reachablePolygon}
                  fill="rgba(39, 244, 210, 0.08)"
                  stroke="rgba(39, 244, 210, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}

              {/* Chaser path */}
              {chaserPath && (
                <path
                  d={chaserPath}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Leader path */}
              {leaderPath && (
                <path
                  d={leaderPath}
                  fill="none"
                  stroke="#27F4D2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Markers at current round */}
              <circle
                cx={curX}
                cy={curLeaderY}
                r="4"
                fill="#27F4D2"
              />
              <circle
                cx={curX}
                cy={curChaserY}
                r="3.5"
                fill="#94A3B8"
              />

              {/* X-axis labels */}
              <text
                x={getX(1)}
                y={svgHeight - 6}
                textAnchor="start"
                fill="var(--color-text-subtle)"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
              >
                R1
              </text>
              <text
                x={curX}
                y={svgHeight - 6}
                textAnchor="middle"
                fill="var(--color-text)"
                fontSize="9"
                fontWeight="600"
                fontFamily="ui-monospace, monospace"
              >
                R{completedRaces}
              </text>
              <text
                x={finalX}
                y={svgHeight - 6}
                textAnchor="end"
                fill="var(--color-text-subtle)"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
              >
                R{totalRaces}
              </text>
            </svg>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECONDARY INFO: Sits flat, separated by hairlines & whitespace     */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 flex flex-col space-y-6 lg:border-l lg:border-[var(--color-line)] lg:pl-8">
          {/* UP NEXT SECTION */}
          {nextRace ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-dim)]">
                <span className="font-semibold uppercase tracking-wider text-[var(--color-text)]">
                  Up next
                </span>
                <span>
                  {nextRace.circuit.locality}, {nextRace.circuit.country}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display text-[var(--color-text)]">
                    {nextRace.name}
                  </h2>
                  <p className="text-xs text-[var(--color-text-dim)] mt-0.5">
                    {nextRace.circuit.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-dim)] mt-1 font-mono">
                    {formatLocalizedSession(nextRace.isoDateTime)}
                  </p>
                </div>

                {/* Circuit Track Outline */}
                <div className="w-24 h-16 shrink-0 opacity-40 text-[var(--color-text-dim)]">
                  <TrackOutline circuitId={nextRace.circuit.id} />
                </div>
              </div>

              {/* Isolated Leaf Countdown */}
              <div className="pt-2 border-t border-[var(--color-line)] flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-dim)]">Countdown</span>
                <SessionCountdown isoDateTime={nextRace.isoDateTime} />
              </div>
            </div>
          ) : (
            <div className="text-xs text-[var(--color-text-dim)]">
              Season concluded · All rounds complete.
            </div>
          )}

          {/* LAST TIME OUT PODIUM */}
          {latestCompletedRace && lastPodium.length > 0 && (
            <div className="pt-5 border-t border-[var(--color-line)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-dim)]">
                <span className="font-semibold uppercase tracking-wider text-[var(--color-text)]">
                  Last time out
                </span>
                <span className="font-mono">{cleanCompletedRaceName}</span>
              </div>

              <div className="space-y-2 text-xs">
                {lastPodium.map((podium) => {
                  const teamColor = getTeamColor(podium.constructor.id);
                  return (
                    <div
                      key={`podium-${podium.driver.id}`}
                      className="data-row flex items-center justify-between py-1.5 px-2 rounded-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-1 h-3.5 shrink-0 rounded-xs"
                          style={{ backgroundColor: teamColor }}
                        />
                        <span className="font-mono text-[var(--color-text-dim)] tabular-nums">
                          P{podium.position}
                        </span>
                        <span className="font-medium text-[var(--color-text)] truncate">
                          {podium.driver.fullName}
                        </span>
                      </div>
                      <span className="font-mono text-[var(--color-text-dim)] tabular-nums shrink-0">
                        {podium.timeFormatted || `${podium.points} pts`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
