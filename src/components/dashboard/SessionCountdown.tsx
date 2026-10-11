import { useState, useEffect } from 'react';

interface SessionCountdownProps {
  isoDateTime?: string | null;
}

/**
 * Isolated leaf countdown timer.
 * Re-renders only itself on tick.
 * Automatically halts when tab is hidden (Page Visibility API).
 * Collapses sensibly:
 *  - > 1 day: shows days and hours (no seconds, 30s tick)
 *  - 1 hour to 1 day: shows hours and minutes (no seconds, 30s tick)
 *  - < 1 hour: shows minutes and seconds (1s tick)
 *  - <= 0: shows static session live indicator
 */
export function SessionCountdown({ isoDateTime }: SessionCountdownProps) {
  const [diffSeconds, setDiffSeconds] = useState<number | null>(() => {
    if (!isoDateTime) return null;
    const now = Date.now();
    const target = new Date(isoDateTime).getTime();
    return Math.floor((target - now) / 1000);
  });

  useEffect(() => {
    if (!isoDateTime) {
      setDiffSeconds(null);
      return;
    }

    const calc = () => {
      const now = Date.now();
      const target = new Date(isoDateTime).getTime();
      setDiffSeconds(Math.floor((target - now) / 1000));
    };

    calc();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      if (intervalId) clearInterval(intervalId);
      const now = Date.now();
      const target = new Date(isoDateTime).getTime();
      const diff = Math.floor((target - now) / 1000);
      // High-frequency tick only under 1 hour; lower frequency for days/hours
      const intervalMs = diff <= 3600 && diff > 0 ? 1000 : 30000;
      intervalId = setInterval(calc, intervalMs);
    };

    startTimer();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } else {
        calc();
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isoDateTime]);

  if (diffSeconds === null) {
    return <span className="text-xs text-[var(--color-text-dim)] font-mono">TBD</span>;
  }

  if (diffSeconds <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)]">
        <span className="live-indicator-dot" />
        Session live
      </span>
    );
  }

  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  if (days > 0) {
    return (
      <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-[var(--color-text)]">
        {days}d {hours}h
      </span>
    );
  }

  if (hours > 0) {
    return (
      <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-[var(--color-text)]">
        {hours}h {minutes}m
      </span>
    );
  }

  return (
    <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums text-[var(--color-primary)]">
      {minutes}m {seconds}s
    </span>
  );
}

/**
 * Format timestamp in the user's local timezone & locale conventions.
 */
export function formatLocalizedSession(isoDateTime?: string | null): string {
  if (!isoDateTime) return 'Date TBD';
  try {
    const d = new Date(isoDateTime);
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return isoDateTime;
  }
}
