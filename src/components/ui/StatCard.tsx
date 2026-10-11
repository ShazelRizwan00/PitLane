import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  accentColor?: string;
  badge?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subtext,
  accentColor,
  badge,
}: StatCardProps) {
  return (
    <Card accentBorder={accentColor} className="hover:border-[var(--line)] transition-colors">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs text-[var(--text-dim)] font-body uppercase tracking-wider mb-1.5">
          <span>{label}</span>
          {badge}
        </div>
        <div className="text-2xl sm:text-3xl font-display font-black tracking-tight text-[var(--text)] truncate tabular-nums">
          {value}
        </div>
        {subtext && (
          <div className="mt-1 text-xs text-[var(--text-dim)] truncate font-body">
            {subtext}
          </div>
        )}
      </div>
    </Card>
  );
}
