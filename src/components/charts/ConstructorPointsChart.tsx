import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ConstructorStanding } from '../../api/types';
import { getTeamColor } from '../../lib/teamColors';

interface ConstructorPointsChartProps {
  standings: ConstructorStanding[];
}

export function ConstructorPointsChart({ standings }: ConstructorPointsChartProps) {
  const leaderPoints = standings[0]?.points ?? 0;

  const chartData = standings.map((c) => {
    const gap = leaderPoints - c.points;
    return {
      id: c.constructor.id,
      name: c.constructor.name,
      points: c.points,
      wins: c.wins,
      gapToLeader: gap === 0 ? 'LEADER' : `-${gap} PTS`,
      color: getTeamColor(c.constructor.id),
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs font-display uppercase tracking-wider text-[var(--text-dim)]">
        No constructor classification data available.
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Constructors Championship points bar chart"
      tabIndex={0}
      className="w-full h-80 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 24, left: 20, bottom: 10 }}
        >
          <XAxis
            type="number"
            tick={{ fill: '#F7EBE8', fontSize: 11, fontFamily: 'IBM Plex Sans' }}
            axisLine={{ stroke: '#444140' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#F7EBE8', fontSize: 11, fontFamily: 'Schibsted Grotesk', fontWeight: 700 }}
            axisLine={{ stroke: '#444140' }}
            tickLine={false}
            width={120}
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
                      <span className="text-sm">{item.name}</span>
                    </div>

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
          <Bar dataKey="points" radius={[0, 0, 0, 0]} maxBarSize={20}>
            {chartData.map((entry) => (
              <Cell key={`cell-constructor-${entry.id}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
