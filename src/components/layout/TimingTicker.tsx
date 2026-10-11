interface TickerDriverLap {
  code: string;
  s1: { time: string; status: 'purple' | 'green' | 'yellow' };
  s2: { time: string; status: 'purple' | 'green' | 'yellow' };
  s3: { time: string; status: 'purple' | 'green' | 'yellow' };
  gap: string;
}

const LATEST_TIMING_FEED: TickerDriverLap[] = [
  {
    code: 'ANT',
    s1: { time: '26.842', status: 'purple' },
    s2: { time: '37.104', status: 'green' },
    s3: { time: '24.312', status: 'green' },
    gap: '1:28.258',
  },
  {
    code: 'RUS',
    s1: { time: '26.910', status: 'yellow' },
    s2: { time: '37.085', status: 'purple' },
    s3: { time: '24.340', status: 'green' },
    gap: '+0.079',
  },
  {
    code: 'VER',
    s1: { time: '26.890', status: 'green' },
    s2: { time: '37.215', status: 'yellow' },
    s3: { time: '24.298', status: 'purple' },
    gap: '+0.145',
  },
  {
    code: 'NOR',
    s1: { time: '26.932', status: 'yellow' },
    s2: { time: '37.150', status: 'green' },
    s3: { time: '24.331', status: 'green' },
    gap: '+0.163',
  },
  {
    code: 'LEC',
    s1: { time: '26.884', status: 'green' },
    s2: { time: '37.240', status: 'yellow' },
    s3: { time: '24.320', status: 'green' },
    gap: '+0.186',
  },
];

function SectorPill({ label, time, status }: { label: string; time: string; status: 'purple' | 'green' | 'yellow' }) {
  const colorClass =
    status === 'purple'
      ? 'sector-purple font-medium'
      : status === 'green'
      ? 'sector-green font-medium'
      : 'sector-yellow';

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums">
      <span className="text-[var(--color-text-dim)]">{label}</span>
      <span className={`px-1 py-0.2 rounded-xs ${colorClass}`}>{time}</span>
    </span>
  );
}

export function TimingTicker() {
  return (
    <div
      className="w-full bg-[var(--color-surface)] border-b border-[var(--color-line)] py-1.5 px-4 sm:px-6 lg:px-8 text-xs font-mono overflow-x-auto"
      aria-label="Latest Session Timing"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 min-w-max">
        {/* Left: Driver timing sectors */}
        <div className="flex items-center gap-5">
          <span className="text-[11px] font-semibold text-[var(--color-text-dim)] uppercase tracking-wider font-body">
            Latest timing
          </span>
          {LATEST_TIMING_FEED.map((lap) => (
            <div key={lap.code} className="flex items-center gap-2">
              <span className="font-semibold text-[var(--color-text)] font-body">
                {lap.code}
              </span>
              <div className="flex items-center gap-1.5">
                <SectorPill label="S1" time={lap.s1.time} status={lap.s1.status} />
                <SectorPill label="S2" time={lap.s2.time} status={lap.s2.status} />
                <SectorPill label="S3" time={lap.s3.time} status={lap.s3.status} />
              </div>
              <span className="tabular-nums font-semibold text-[var(--color-text)] pl-0.5">
                {lap.gap}
              </span>
              <span className="text-[var(--color-line)] mx-1">·</span>
            </div>
          ))}
        </div>

        {/* Right: Track condition snapshot */}
        <div className="flex items-center gap-2.5 text-[11px] text-[var(--color-text-dim)] font-body shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#00D26A]" />
          <span>Track clear</span>
          <span>·</span>
          <span>Air 28.1°C</span>
          <span>·</span>
          <span>Track 32.4°C</span>
        </div>
      </div>
    </div>
  );
}
