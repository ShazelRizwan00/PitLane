import { Link } from 'react-router-dom';
import { Flag, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 section-reveal">
      <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--text-dim)] mb-4">
        <Flag className="w-5 h-5" />
      </div>
      <span className="text-xs font-body text-[var(--text-dim)] mb-1">
        Notice · Code 404
      </span>
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text)] tracking-tight">
        Route not found
      </h1>
      <p className="text-sm text-[var(--text-dim)] max-w-md mt-2 mb-6 font-body">
        The requested resource is not available in the Pitlane 2026 classification records.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-[var(--text)] border border-[var(--primary)] font-body font-medium text-xs transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to overview
      </Link>
    </div>
  );
}
