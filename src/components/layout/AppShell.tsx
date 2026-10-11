import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { TimingTicker } from './TimingTicker';
import { ShortcutModal } from './ShortcutModal';
import { TimezoneProvider, useTimezone } from '../../context/TimezoneContext';

function AppShellContent() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { toggleTimezone } = useTimezone();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTimezone();
      } else if (e.key.toLowerCase() === 'g') {
        const gapChartElem = document.getElementById('gap-chart');
        if (gapChartElem) {
          e.preventDefault();
          gapChartElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (e.key === 'ArrowLeft') {
        window.dispatchEvent(new CustomEvent('scrub-round-prev'));
      } else if (e.key === 'ArrowRight') {
        window.dispatchEvent(new CustomEvent('scrub-round-next'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimezone]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      {/* Top Navigation */}
      <Navbar onOpenShortcuts={() => setShortcutsOpen(true)} />

      {/* Live Sector & Lap Telemetry Ticker Strip */}
      <TimingTicker />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto font-body">
          <Outlet />
        </main>

        {/* Night-race timing printout footer */}
        <footer className="mt-auto border-t border-[var(--line)] bg-[var(--surface)] py-5 px-4 sm:px-8 text-xs text-[var(--text-dim)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-body">
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-0.5">
                <span className="w-1 h-3.5 -skew-x-[20deg] bg-[var(--primary)]" />
                <span className="w-1 h-3.5 -skew-x-[20deg] bg-[var(--accent)] ml-0.5" />
              </div>
              <span className="font-display font-black italic tracking-tight text-sm text-[var(--text)]">PITLANE</span>
              <span className="text-[var(--line)]">·</span>
              <span>Live Timing &amp; Classification</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-dim)]">
              <span>
                Data:{' '}
                <a
                  href="https://api.jolpi.ca/ergast/f1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  Jolpica F1 API
                </a>
              </span>
              <span className="text-[var(--line)]">·</span>
              <button
                type="button"
                onClick={() => setShortcutsOpen(true)}
                className="text-[var(--text-dim)] hover:text-[var(--accent)] underline cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                Keyboard shortcuts (?)
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Discoverable Shortcut Sheet */}
      <ShortcutModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

export function AppShell() {
  return (
    <TimezoneProvider>
      <AppShellContent />
    </TimezoneProvider>
  );
}
