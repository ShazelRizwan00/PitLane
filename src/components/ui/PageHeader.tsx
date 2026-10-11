import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-[var(--line)] mb-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-0.5">
            <span className="w-1.5 h-6 -skew-x-[20deg] bg-[var(--primary)]" />
            <span className="w-1.5 h-6 -skew-x-[20deg] bg-[var(--accent)] ml-0.5" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black uppercase tracking-tight text-[var(--text)]">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1.5 max-w-2xl font-body">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
