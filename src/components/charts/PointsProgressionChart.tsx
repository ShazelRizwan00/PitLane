import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SeasonRoundResult } from '../../api/races';
import { DriverStanding } from '../../api/types';
import { getTeamColor } from '../../lib/teamColors';

interface PointsProgressionChartProps {
  roundResults: SeasonRoundResult[];
  topDrivers: DriverStanding[];
}

export function PointsProgressionChart({
  roundResults,
  topDrivers,
}: PointsProgressionChartProps) {
  const driversToTrack = topDrivers.slice(0, 5);
  if (driversToTrack.length === 0 || roundResults.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs font-display uppercase tracking-wider text-[var(--text-dim)]">
        No progression data available yet.
      </div>
    );
  }

  // Running sum of points for each driver
  const runningTotals: Record<string, number> = {};
  driversToTrack.forEach((d) => {
    runningTotals[d.driver.id] = 0;
  });

  const chartData = roundResults.map((roundData) => {
    roundData.results.forEach((res) => {
      if (res.driver.id in runningTotals) {
        runningTotals[res.driver.id] = (runningTotals[res.driver.id] ?? 0) + res.points;
      }
    });

    const point: Record<string, number | string> = {
      round: `R${roundData.round}`,
      raceName: roundData.raceName,
    };

    driversToTrack.forEach((d) => {
      point[d.driver.code || d.driver.familyName] = runningTotals[d.driver.id] ?? 0;
    });

    return point;
  });

  return (
    <div
      role="region"
      aria-label="Championship points progression line chart"
      tabIndex={0}
      className="w-full h-80 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: -20, bottom: 10 }}
        >
          <XAxis
            dataKey="round"
            tick={{ fill: '#F7EBE8', fontSize: 11, fontFamily: 'Schibsted Grotesk', fontWeight: 700 }}
            axisLine={{ stroke: '#444140' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#F7EBE8', fontSize: 11, fontFamily: 'IBM Plex Sans' }}
            axisLine={{ stroke: '#444140' }}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const raceInfo = chartData.find((d) => d.round === label);
                return (
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-3 shadow-xl text-xs space-y-1.5 min-w-[190px]">
                    <div className="font-display font-bold uppercase text-[var(--text)] border-b border-[var(--line)] pb-1 flex justify-between gap-4">
                      <span>{raceInfo?.raceName || label}</span>
                      <span className="tabular-nums text-[var(--text-dim)]">{label}</span>
                    </div>
                    {payload.map((entry) => (
                      <div
                        key={`prog-${entry.name}`}
                        className="flex items-center justify-between gap-6 text-xs"
                      >
                        <span className="flex items-center gap-1.5 text-[var(--text)] font-display uppercase font-bold">
                          <span
                            className="w-2 h-2 shrink-0"
                            style={{ backgroundColor: entry.color }}
                            aria-hidden="true"
                          />
                          {entry.name}
                        </span>
                        <span className="tabular-nums font-bold text-[var(--text)]">{entry.value} pts</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '12px', fontSize: '11px', fontFamily: 'Schibsted Grotesk', textTransform: 'uppercase', fontWeight: 700 }}
            iconType="square"
          />
          {driversToTrack.map((d) => {
            const key = d.driver.code || d.driver.familyName;
            const color = getTeamColor(d.constructor.id);
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={d.driver.fullName}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 2.5, fill: color }}
                activeDot={{ r: 4.5 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
