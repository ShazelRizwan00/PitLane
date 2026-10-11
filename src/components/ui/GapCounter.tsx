import { useEffect, useState } from 'react';

interface GapCounterProps {
  targetValue: number;
  durationMs?: number;
  className?: string;
}

export function GapCounter({
  targetValue,
  durationMs = 900,
  className = '',
}: GapCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || targetValue === 0) {
      setDisplayValue(targetValue);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic formula
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeOut * targetValue);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, durationMs]);

  return (
    <span className={`tabular-nums font-variant-numeric:tabular-nums ${className}`}>
      +{displayValue}
    </span>
  );
}
