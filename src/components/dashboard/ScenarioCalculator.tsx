import { useState, useMemo } from 'react';
import { DriverStanding, Race } from '../../api/types';
import { getTeamColor } from '../../lib/teamColors';

interface ScenarioCalculatorProps {
  leader: DriverStanding | null;
  chaser: DriverStanding | null;
  remainingRaces: Race[];
}

const POINTS_MAP: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

export function ScenarioCalculator({
  leader,
  chaser,
  remainingRaces,
}: ScenarioCalculatorProps) {
  const [picks, setPicks] = useState<Record<number, { p1Pos: number; p2Pos: number }>>({});

  const remainingRounds = remainingRaces.slice(0, 8);
  const totalRemainingCount = remainingRaces.length;

  const currentGap = leader && chaser ? Math.max(0, leader.points - chaser.points) : 0;

  const applyPreset = (type: 'leaderWins' | 'chaserWins' | 'reset') => {
    const newPicks: Record<number, { p1Pos: number; p2Pos: number }> = {};
    if (type === 'leaderWins') {
      remainingRounds.forEach((r) => {
        newPicks[r.round] = { p1Pos: 1, p2Pos: 2 };
      });
    } else if (type === 'chaserWins') {
      remainingRounds.forEach((r) => {
        newPicks[r.round] = { p1Pos: 2, p2Pos: 1 };
      });
    }
    setPicks(newPicks);
  };

  const { projectedLeaderPts, projectedChaserPts, projectedGap, pointsToClinch } = useMemo(() => {
    const baseLeader = leader?.points || 0;
    const baseChaser = chaser?.points || 0;

    let addedLeader = 0;
    let addedChaser = 0;

    remainingRounds.forEach((r) => {
      const pick = picks[r.round];
      if (pick) {
        addedLeader += POINTS_MAP[pick.p1Pos] || 0;
        addedChaser += POINTS_MAP[pick.p2Pos] || 0;
      }
    });

    const pLeader = baseLeader + addedLeader;
    const pChaser = baseChaser + addedChaser;
    const pGap = pLeader - pChaser;

    const maxChaserPossible = baseChaser + totalRemainingCount * 26;
    const needed = Math.max(0, maxChaserPossible - baseLeader + 1);

    return {
      projectedLeaderPts: pLeader,
      projectedChaserPts: pChaser,
      projectedGap: pGap,
      pointsToClinch: needed,
    };
  }, [leader, chaser, remainingRounds, picks, totalRemainingCount]);

  if (!leader || !chaser || totalRemainingCount === 0) return null;

  const leaderColor = getTeamColor(leader.constructor.id);
  const chaserColor = getTeamColor(chaser.constructor.id);

  return (
    <div className="surface-card p-5 space-y-5 border border-[var(--color-line)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-line)] pb-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            Title Math Simulator
          </h2>
          <p className="text-xs text-[var(--color-text-dim)] mt-0.5">
            Simulate finish positions to test championship outcomes
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => applyPreset('leaderWins')}
            className="px-2.5 py-1 border border-[var(--color-line)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] text-[var(--color-text)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] min-h-[32px] cursor-pointer text-xs rounded-xs"
          >
            {leader.driver.familyName} sweeps
          </button>
          <button
            type="button"
            onClick={() => applyPreset('chaserWins')}
            className="px-2.5 py-1 border border-[var(--color-line)] bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface)] text-[var(--color-text)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] min-h-[32px] cursor-pointer text-xs rounded-xs"
          >
            {chaser.driver.familyName} sweeps
          </button>
          <button
            type="button"
            onClick={() => applyPreset('reset')}
            className="px-2 py-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors cursor-pointer text-xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Outcome Metric Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Current Gap */}
        <div className="border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-3.5 rounded-xs">
          <div className="text-xs font-medium text-[var(--color-text-dim)]">Current gap</div>
          <div className="text-2xl font-mono font-bold text-[var(--color-text)] tabular-nums mt-0.5">
            +{currentGap} PTS
          </div>
          <div className="text-xs font-mono text-[var(--color-text-dim)] mt-0.5">
            {leader.driver.code} {leader.points} vs {chaser.driver.code} {chaser.points}
          </div>
        </div>

        {/* Projected Gap */}
        <div className="border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-3.5 rounded-xs">
          <div className="text-xs font-medium text-[var(--color-text-dim)]">Projected gap</div>
          <div
            className={`text-2xl font-mono font-bold tabular-nums mt-0.5 flex items-center gap-1 ${
              projectedGap > 0 ? 'text-[#00D26A]' : projectedGap < 0 ? 'text-red-400' : 'text-[var(--color-text)]'
            }`}
          >
            {projectedGap > 0 ? `▲ +${projectedGap}` : projectedGap < 0 ? `▼ ${projectedGap}` : '0'} PTS
          </div>
          <div className="text-xs font-mono text-[var(--color-text-dim)] mt-0.5 tabular-nums">
            Projected: {projectedLeaderPts} vs {projectedChaserPts}
          </div>
        </div>

        {/* Clinch Threshold */}
        <div className="border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-3.5 rounded-xs">
          <div className="text-xs font-medium text-[var(--color-text-dim)]">Points to clinch</div>
          <div className="text-2xl font-mono font-bold text-[var(--color-text)] tabular-nums mt-0.5">
            {pointsToClinch > 0 ? `${pointsToClinch} PTS` : 'Clinched'}
          </div>
          <div className="text-xs text-[var(--color-text-dim)] mt-0.5">
            Needed by {leader.driver.familyName}
          </div>
        </div>
      </div>

      {/* Interactive round selectors */}
      <div className="space-y-2 pt-1">
        <div className="text-xs text-[var(--color-text-dim)] font-medium">
          Simulate finish positions ({remainingRounds.length} upcoming rounds):
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {remainingRounds.map((r) => {
            const currentPick = picks[r.round] || { p1Pos: 0, p2Pos: 0 };

            return (
              <div key={`sim-round-${r.round}`} className="border border-[var(--color-line)] bg-[var(--color-surface)] p-2.5 space-y-2 rounded-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--color-text)]">R{r.round} · {r.circuit.locality}</span>
                  <span className="text-[11px] text-[var(--color-text-dim)] font-mono tabular-nums">{r.date.slice(5)}</span>
                </div>

                {/* Leader pick */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-3.5 shrink-0 rounded-xs" style={{ backgroundColor: leaderColor }} />
                    <span className="truncate">{leader.driver.familyName}</span>
                  </span>
                  <select
                    value={currentPick.p1Pos}
                    onChange={(e) => {
                      const pos = parseInt(e.target.value, 10);
                      setPicks((prev) => ({
                        ...prev,
                        [r.round]: { ...(prev[r.round] || { p1Pos: 0, p2Pos: 0 }), p1Pos: pos },
                      }));
                    }}
                    className="border border-[var(--color-line)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] px-1.5 py-0.5 text-xs tabular-nums focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] min-h-[28px] cursor-pointer rounded-xs"
                  >
                    <option value={0}>DNF / 0 pts</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        P{p} ({POINTS_MAP[p]} pts)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chaser pick */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-3.5 shrink-0 rounded-xs" style={{ backgroundColor: chaserColor }} />
                    <span className="truncate">{chaser.driver.familyName}</span>
                  </span>
                  <select
                    value={currentPick.p2Pos}
                    onChange={(e) => {
                      const pos = parseInt(e.target.value, 10);
                      setPicks((prev) => ({
                        ...prev,
                        [r.round]: { ...(prev[r.round] || { p1Pos: 0, p2Pos: 0 }), p2Pos: pos },
                      }));
                    }}
                    className="border border-[var(--color-line)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] px-1.5 py-0.5 text-xs tabular-nums focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] min-h-[28px] cursor-pointer rounded-xs"
                  >
                    <option value={0}>DNF / 0 pts</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        P{p} ({POINTS_MAP[p]} pts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-[var(--color-text-dim)] border-t border-[var(--color-line)] pt-2">
        Calculation assumes standard 25 points for race victory plus 1 bonus point for fastest lap (26 pts maximum per Grand Prix).
      </div>
    </div>
  );
}
