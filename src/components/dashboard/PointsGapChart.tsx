import { useState, useMemo, useRef } from 'react';
import { RaceResult } from '../../api/types';
import { SeasonRoundResult } from '../../api/races';

interface PointsGapChartProps {
  seasonResults: SeasonRoundResult[];
  totalRaces?: number;
  completedRacesCount: number;
}

interface GapPoint {
  round: number;
  raceName: string;
  leaderName: string;
  chaserName: string;
  leaderPoints: number;
  chaserPoints: number;
  gap: number;
  deltaFromPrev: number;
  isCurrent: boolean;
}

export function PointsGapChart({
  seasonResults,
  totalRaces = 24,
  completedRacesCount,
}: PointsGapChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<GapPoint | null>(null);
  const [crosshairX, setCrosshairX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Calculate cumulative points and P1-P2 gap for each round
  const gapData: GapPoint[] = useMemo(() => {
    if (!seasonResults || seasonResults.length === 0) return [];

    const runningTotals: Record<string, { points: number; name: string; code: string }> = {};
    const pointsList: GapPoint[] = [];

    const sortedRounds = [...seasonResults].sort((a, b) => a.round - b.round);

    let prevGap = 0;

    sortedRounds.forEach((roundData, idx) => {
      roundData.results.forEach((res: RaceResult) => {
        if (!runningTotals[res.driver.id]) {
          runningTotals[res.driver.id] = {
            points: 0,
            name: res.driver.familyName,
            code: res.driver.code || res.driver.familyName.slice(0, 3).toUpperCase(),
          };
        }
        runningTotals[res.driver.id]!.points += res.points;
      });

      const rankedDrivers = Object.values(runningTotals).sort((a, b) => b.points - a.points);
      const leader = rankedDrivers[0] || { name: 'P1', code: 'P1', points: 0 };
      const chaser = rankedDrivers[1] || { name: 'P2', code: 'P2', points: 0 };
      const gap = Math.max(0, leader.points - chaser.points);
      const deltaFromPrev = idx === 0 ? gap : gap - prevGap;
      prevGap = gap;

      pointsList.push({
        round: roundData.round,
        raceName: roundData.raceName,
        leaderName: leader.name,
        chaserName: chaser.name,
        leaderPoints: leader.points,
        chaserPoints: chaser.points,
        gap,
        deltaFromPrev,
        isCurrent: roundData.round === completedRacesCount,
      });
    });

    return pointsList;
  }, [seasonResults, completedRacesCount]);

  const width = 1000;
  const height = 180;
  const paddingX = 40;
  const paddingY = 28;

  const maxGap = useMemo(() => {
    if (gapData.length === 0) return 50;
    const highest = Math.max(...gapData.map((d) => d.gap));
    return Math.max(highest + 10, 30);
  }, [gapData]);

  const getX = (round: number) => {
    if (totalRaces <= 1) return paddingX;
    return paddingX + ((round - 1) / (totalRaces - 1)) * (width - 2 * paddingX);
  };

  const getY = (gap: number) => {
    return height - paddingY - (gap / maxGap) * (height - 2 * paddingY);
  };

  const pathD = useMemo(() => {
    if (gapData.length === 0) return '';
    return gapData.reduce((acc, pt, i) => {
      const x = getX(pt.round);
      const y = getY(pt.gap);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [gapData, maxGap, totalRaces]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || gapData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = width / rect.width;
    const svgX = clientX * scaleX;

    let closest = gapData[0];
    let minDiff = Infinity;

    gapData.forEach((pt) => {
      const px = getX(pt.round);
      const diff = Math.abs(px - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    });

    if (closest) {
      setHoveredPoint(closest);
      setCrosshairX(getX(closest.round));
    }
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
    setCrosshairX(null);
  };

  const futureRegionStartX = getX(Math.max(1, completedRacesCount + 1));

  return (
    <section
      id="gap-chart"
      aria-label="Championship Points Gap Trajectory"
      className="surface-card p-5 mb-8 border border-[var(--color-line)]"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Championship Margin Trajectory
            </h2>
            <span className="text-[var(--color-text-dim)]">· P1 vs P2 gap</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-text-dim)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[var(--color-accent)] inline-block" />
              <span>Completed (1–{completedRacesCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] inline-block" />
              <span>Current</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2 bg-[var(--color-line)] inline-block" />
              <span>Scheduled</span>
            </span>
          </div>
        </div>

        {/* SVG Points-Gap Chart */}
        <div className="relative w-full">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 sm:h-52 touch-none select-none overflow-visible"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* Grid horizontal guidelines */}
            {[0, 0.33, 0.66, 1].map((pct, idx) => {
              const gapVal = Math.round(maxGap * pct);
              const y = getY(gapVal);
              return (
                <g key={`grid-${idx}`}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="var(--color-line)"
                    strokeWidth="1"
                    strokeDasharray={pct === 0 ? undefined : '3,3'}
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="var(--color-text-dim)"
                    fontSize="10"
                    fontFamily="ui-monospace, monospace"
                    className="tabular-nums"
                  >
                    {gapVal}
                  </text>
                </g>
              );
            })}

            {/* Future rounds shaded muted area */}
            {completedRacesCount < totalRaces && (
              <rect
                x={futureRegionStartX}
                y={paddingY}
                width={width - paddingX - futureRegionStartX}
                height={height - 2 * paddingY}
                fill="var(--color-surface-subtle)"
                opacity="0.5"
              />
            )}

            {/* Completed rounds gap line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points for completed rounds */}
            {gapData.map((pt) => {
              const cx = getX(pt.round);
              const cy = getY(pt.gap);
              const isCurrent = pt.round === completedRacesCount;

              return (
                <g key={`pt-${pt.round}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isCurrent ? 4.5 : 3}
                    fill={isCurrent ? 'var(--color-primary)' : 'var(--color-surface)'}
                    stroke={isCurrent ? 'var(--color-primary)' : 'var(--color-accent)'}
                    strokeWidth={isCurrent ? 2 : 1.5}
                  />
                  <text
                    x={cx}
                    y={height - 8}
                    textAnchor="middle"
                    fill={isCurrent ? 'var(--color-primary)' : 'var(--color-text-dim)'}
                    fontSize="9"
                    fontWeight={isCurrent ? '600' : '400'}
                    fontFamily="ui-monospace, monospace"
                    className="tabular-nums"
                  >
                    R{pt.round}
                  </text>
                </g>
              );
            })}

            {/* Interactive Vertical Crosshair */}
            {crosshairX !== null && hoveredPoint && (
              <g>
                <line
                  x1={crosshairX}
                  y1={paddingY}
                  x2={crosshairX}
                  y2={height - paddingY}
                  stroke="var(--color-accent)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <circle
                  cx={crosshairX}
                  cy={getY(hoveredPoint.gap)}
                  r="5"
                  fill="var(--color-accent)"
                />
              </g>
            )}
          </svg>

          {/* Tooltip */}
          {hoveredPoint && crosshairX !== null && (
            <div
              className="absolute top-2 pointer-events-none border border-[var(--color-line)] bg-[var(--color-surface)] p-2.5 text-xs shadow-lg rounded-xs z-20 space-y-1"
              style={{
                left: `${Math.min(Math.max((crosshairX / width) * 100, 10), 85)}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-semibold text-[var(--color-text)] flex items-center justify-between gap-3 border-b border-[var(--color-line)] pb-1">
                <span>R{hoveredPoint.round} · {hoveredPoint.raceName}</span>
                <span className="font-mono text-[var(--color-accent)] font-semibold tabular-nums">+{hoveredPoint.gap} pts</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-xs text-[var(--color-text-dim)] font-mono">
                <span>Leader: {hoveredPoint.leaderName}</span>
                <span className="tabular-nums">{hoveredPoint.leaderPoints} pts</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-xs text-[var(--color-text-dim)] font-mono">
                <span>Chaser: {hoveredPoint.chaserName}</span>
                <span className="tabular-nums">{hoveredPoint.chaserPoints} pts</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-xs pt-1 border-t border-[var(--color-line)] font-mono">
                <span className="text-[var(--color-text-dim)]">Delta from prev:</span>
                <span
                  className={`tabular-nums font-medium ${
                    hoveredPoint.deltaFromPrev > 0
                      ? 'text-[#00D26A]'
                      : hoveredPoint.deltaFromPrev < 0
                      ? 'text-red-400'
                      : 'text-[var(--color-text-dim)]'
                  }`}
                >
                  {hoveredPoint.deltaFromPrev > 0
                    ? `▲ +${hoveredPoint.deltaFromPrev}`
                    : hoveredPoint.deltaFromPrev < 0
                    ? `▼ ${hoveredPoint.deltaFromPrev}`
                    : '0'} pts
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
