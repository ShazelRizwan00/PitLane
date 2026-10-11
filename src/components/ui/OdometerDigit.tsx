import { useEffect, useState } from 'react';

interface OdometerDigitProps {
  value: string | number;
  className?: string;
}

export function OdometerDigit({ value, className = '' }: OdometerDigitProps) {
  const char = String(value);
  const isDigit = /^[0-9]$/.test(char);
  const digitNum = isDigit ? parseInt(char, 10) : 0;

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isDigit || reducedMotion) {
    return (
      <span className={`inline-block tabular-nums font-mono ${className}`}>
        {char}
      </span>
    );
  }

  return (
    <span
      className={`odometer-digit inline-block tabular-nums overflow-hidden leading-none align-baseline rounded-xs ${className}`}
      style={{
        height: '1.05em',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.45), inset 0 -2px 4px rgba(0, 0, 0, 0.45)',
      }}
      aria-hidden="true"
    >
      <span
        className="odometer-strip flex flex-col will-change-transform"
        style={{
          transform: `translateY(-${digitNum * 10}%)`,
          transition: 'transform 0.45s cubic-bezier(0.2, 1, 0.3, 1)',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            style={{ height: '1.05em', lineHeight: '1.05em' }}
            className="text-center font-display font-black"
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

interface OdometerNumberProps {
  value: string;
  className?: string;
  label?: string;
}

export function OdometerNumber({ value, className = '', label }: OdometerNumberProps) {
  return (
    <span className={`inline-flex items-baseline tabular-nums min-w-0 shrink ${className}`}>
      {value.split('').map((ch, idx) => (
        <OdometerDigit key={idx} value={ch} />
      ))}
      {label && (
        <span className="ml-0.5 sm:ml-1 text-[11px] sm:text-xs text-[var(--accent)] font-mono font-bold shrink-0 select-none uppercase">
          {label}
        </span>
      )}
    </span>
  );
}
