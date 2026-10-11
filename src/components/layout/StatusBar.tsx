import { useTimezone } from '../../context/TimezoneContext';

interface StatusBarProps {
  onOpenShortcuts?: () => void;
}

export function StatusBar({ onOpenShortcuts }: StatusBarProps) {
  const { timezoneMode, toggleTimezone } = useTimezone();

  return (
    <div className="w-full bg-[var(--color-surface-subtle)] text-[var(--color-text-dim)] px-4 sm:px-6 lg:px-8 py-1.5 text-xs border-b border-[var(--color-line)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Championship Context */}
        <div className="flex items-center gap-2 overflow-hidden text-xs">
          <span className="font-semibold text-[var(--color-text)]">
            2026 Championship
          </span>
          <span className="text-[var(--color-line)]">·</span>
          <span>Round 17 of 24</span>
        </div>

        {/* Right: Timezone Toggle & Shortcuts */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          {/* Timezone toggle button */}
          <button
            type="button"
            onClick={toggleTimezone}
            title="Toggle timezone display (Shortcut: T)"
            className="flex items-center gap-1.5 px-2 py-0.5 border border-[var(--color-line)] bg-[var(--color-surface)] hover:bg-[var(--color-line-subtle)] text-[var(--color-text)] transition-colors text-xs rounded-xs cursor-pointer"
          >
            <span className="text-[var(--color-text-dim)]">Time:</span>
            <span className="font-semibold uppercase text-[var(--color-text)]">{timezoneMode}</span>
          </button>

          {/* Keyboard shortcuts helper trigger */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              title="Keyboard shortcuts (Shortcut: ?)"
              className="px-2 py-0.5 border border-[var(--color-line)] bg-[var(--color-surface)] hover:bg-[var(--color-line-subtle)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors text-xs rounded-xs cursor-pointer"
            >
              ?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
