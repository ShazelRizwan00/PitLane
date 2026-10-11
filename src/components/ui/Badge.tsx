import React from 'react';

type BadgeVariant =
  | 'default'
  | 'completed'
  | 'upcoming'
  | 'signal'
  | 'outline'
  | 'leader'
  | 'fl'
  | 'dnf';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  let variantStyles = 'bg-[var(--color-surface-subtle)] text-[var(--color-text)] border-[var(--color-line)]';

  switch (variant) {
    case 'completed':
      variantStyles = 'bg-[var(--color-surface-subtle)] text-[var(--color-text-dim)] border-[var(--color-line)]';
      break;
    case 'upcoming':
      variantStyles = 'bg-[var(--color-surface-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/30';
      break;
    case 'signal':
    case 'leader':
      variantStyles = 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-semibold';
      break;
    case 'fl':
      variantStyles = 'sector-purple border border-purple-500/20 font-semibold';
      break;
    case 'dnf':
      variantStyles = 'bg-red-500/10 text-red-400 border border-red-500/20 font-semibold';
      break;
    case 'outline':
      variantStyles = 'bg-transparent text-[var(--color-text-dim)] border-[var(--color-line)]';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs border rounded-xs select-none ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
