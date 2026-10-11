import React from 'react';

interface PulseBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function PulseBlock({ className = '', ...props }: PulseBlockProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--line)] ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <PulseBlock className="h-3 w-24" />
        <PulseBlock className="h-4 w-4" />
      </div>
      <PulseBlock className="h-8 w-40" />
      <PulseBlock className="h-3 w-28" />
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`border border-[var(--line)] bg-[var(--surface)] overflow-hidden ${className}`}>
      <div className="p-4 border-b border-[var(--line)] bg-[var(--bg)] flex items-center justify-between">
        <PulseBlock className="h-5 w-36" />
        <PulseBlock className="h-4 w-20" />
      </div>
      <div className="p-4 space-y-3">
        {/* Table header skeleton */}
        <div className="flex gap-4 pb-2 border-b border-[var(--line)]">
          {Array.from({ length: columns }).map((_, i) => (
            <PulseBlock
              key={`th-${i}`}
              className={`h-3 ${i === 0 ? 'w-8' : i === 1 ? 'w-36' : 'flex-1'}`}
            />
          ))}
        </div>
        {/* Rows skeleton */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`row-${r}`} className="flex items-center gap-4 py-2.5 border-b border-[var(--line)]/50">
            {Array.from({ length: columns }).map((_, c) => (
              <PulseBlock
                key={`cell-${r}-${c}`}
                className={`h-4 ${c === 0 ? 'w-8' : c === 1 ? 'w-36' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <PulseBlock className="h-5 w-44" />
        <PulseBlock className="h-4 w-24" />
      </div>
      <div className="h-64 w-full flex items-end gap-3 pt-6 px-2">
        {Array.from({ length: 10 }).map((_, i) => {
          const heights = ['60%', '85%', '70%', '95%', '50%', '40%', '30%', '20%', '15%', '10%'];
          return (
            <div
              key={`bar-${i}`}
              className="flex-1 bg-[var(--line)] animate-pulse"
              style={{ height: heights[i % heights.length] }}
            />
          );
        })}
      </div>
    </div>
  );
}
