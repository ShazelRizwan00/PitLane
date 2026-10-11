import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DriverStanding } from '../../api/types';
import { getTeamColor } from '../../lib/teamColors';

interface DriverPointsChartProps {
  standings: DriverStanding[];
  limit?: number | null;
  sortBy?: 'points' | 'name';
}

export function DriverPointsChart({
  standings,
  limit = null,
  sortBy = 'points',
}: DriverPointsChartProps) {
  const leaderPoints = standings[0]?.points ?? 0;

  const chartData = useMemo(() => {
    let list = limit ? standings.slice(0, limit) : [...standings];

    if (sortBy === 'name') {
      list.sort((a, b) => a.driver.familyName.localeCompare(b.driver.familyName));
    } else {
      list.sort((a, b) => b.points - a.points);
    }

    return list.map((d) => {
      const gap = leaderPoints - d.points;
      return {
        id: d.driver.id,
        code: d.driver.code || d.driver.familyName.slice(0, 3).toUpperCase(),
        fullName: d.driver.fullName,
        team: d.constructor.name,
        points: d.points,
        wins: d.wins,
        gapToLeader: gap === 0 ? 'LEADER' : `-${gap} PTS`,
        color: getTeamColor(d.constructor.id),
      };
    });
  }, [standings, limit, sortBy, leaderPoints]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs font-display uppercase tracking-wider text-[var(--text-dim)]">
        No driver classification data available.
      </div>
    );
  }

  const minWidth = Math.max(chartData.length * 36, 340);

  return (
    <div
      role="region"
      aria-label="Drivers Championship points bar chart"
      tabIndex={0}
      className="w-full overflow-x-auto focus-visible:ring-2 focus-visible:ring-[var(--accent)] pb-1"
    >
      <div style={{ minWidth: `${minWidth}px` }} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 24 }}
          >
            <XAxis
              dataKey="code"
              tick={{ fill: '#F7EBE8', fontSize: 11, fontFamily: 'Schibsted Grotesk', fontWeight: 700 }}
              axisLine={{ stroke: '#444140' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fill: '#F7EBE8', fontSize: 11, fontFamily: 'IBM Plex Sans' }}
              axisLine={{ stroke: '#444140' }}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0]?.payload as (typeof chartData)[number] | undefined;
                  if (!item) return null;
                  return (
                    <div className="border border-[var(--line)] bg-[var(--surface)] p-3 shadow-xl text-xs space-y-1.5 min-w-[190px]">
                      <div className="font-display font-bold text-[var(--text)] flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 shrink-0"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <span className="text-sm">{item.fullName}</span>
                        <span className="text-[var(--text-dim)] font-normal">
                          ({item.code})
                        </span>
                      </div>
                      <div className="text-[11px] font-body text-[var(--text-dim)]">{item.team}</div>

                      <div className="pt-2 border-t border-[var(--line)] space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-[var(--text-dim)] font-body">Points:</span>
                          <span className="font-display font-bold text-sm text-[var(--text)] tabular-nums">
                            {item.points} PTS
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 tabular-nums text-[11px]">
                          <span className="text-[var(--text-dim)]">Gap to P1:</span>
                          <span className="font-semibold text-[var(--text)]">
                            {item.gapToLeader}
                          </span>
                        </div>
                        {item.wins > 0 && (
                          <div className="flex justify-between gap-4 text-[var(--text)] font-body text-[11px]">
                            <span>Wins:</span>
                            <span className="font-semibold tabular-nums">{item.wins}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="points" radius={[0, 0, 0, 0]} maxBarSize={32}>
              {chartData.map((entry) => (
                <Cell key={`bar-${entry.id}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
