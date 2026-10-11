import React from 'react';
import { Flag } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No Records',
  message = 'No session records or standings matching this query.',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 ${className}`}
    >
      <div className="w-10 h-10 bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center text-[var(--text-dim)] mb-4">
        {icon || <Flag className="w-4 h-4" />}
      </div>
      <span className="text-[11px] font-body text-[var(--text-dim)] font-medium mb-1">
        Status
      </span>
      <h3 className="text-base font-display font-bold text-[var(--text)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-dim)] max-w-sm mb-5 font-body">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
