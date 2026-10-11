import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  accentBorder?: string;
}

export function Card({
  children,
  className = '',
  accentBorder,
  ...props
}: CardProps) {
  return (
    <div
      className={`surface-card relative ${className}`}
      {...props}
    >
      {accentBorder && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: accentBorder }}
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-4 sm:px-6 py-3 border-b border-[var(--color-line)] bg-[var(--color-surface-subtle)] flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-sm font-semibold text-[var(--color-text)] flex items-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-[var(--color-text-dim)] mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
