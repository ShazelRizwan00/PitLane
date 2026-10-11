import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Data Feed Interrupted',
  message = 'Timing service link unavailable. Check connection and retry.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`border border-[var(--line)] bg-[var(--surface)] p-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 ${className}`}
      role="alert"
    >
      <div className="w-10 h-10 bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center text-[var(--loss)] mb-4">
        <AlertCircle className="w-5 h-5 text-[var(--loss)]" />
      </div>
      <span className="text-[11px] font-body text-[var(--text-dim)] font-medium mb-1">
        Notice · Feed error
      </span>
      <h3 className="text-lg sm:text-xl font-display font-bold text-[var(--text)] mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-[var(--text-dim)] max-w-md mb-6 font-body">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-[var(--text)] border border-[var(--primary)] font-body text-xs font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[44px]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reconnect timing feed
        </button>
      )}
    </div>
  );
}
