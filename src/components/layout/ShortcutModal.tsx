import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutModal({ isOpen, onClose }: ShortcutModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '← / →', desc: 'Scrub championship rounds backwards / forwards' },
    { key: 'G', desc: 'Jump to championship points-gap chart' },
    { key: 'T', desc: 'Toggle session time zone (Track vs Local)' },
    { key: '?', desc: 'Open / close this keyboard shortcuts sheet' },
    { key: 'Esc', desc: 'Close dialog' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-[var(--line)] bg-[var(--surface)] p-6 space-y-5 text-[var(--text)] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <h2 id="shortcut-title" className="text-sm font-display font-bold text-[var(--text)]">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            className="p-1 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 font-body text-xs">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1 border-b border-[var(--line)]/50">
              <span className="text-[var(--text-dim)]">{s.desc}</span>
              <kbd className="px-2 py-0.5 border border-[var(--line)] bg-[var(--bg)] font-display font-bold text-xs text-[var(--accent)] tabular-nums">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-[11px] text-[var(--text-dim)]">
          Press any shortcut key anywhere outside text input fields.
        </div>
      </div>
    </div>
  );
}
