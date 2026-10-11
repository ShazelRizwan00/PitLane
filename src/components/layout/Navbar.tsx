import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { StatusBar } from './StatusBar';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Overview' },
  { to: '/races', label: 'Calendar' },
  { to: '/results', label: 'Results' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/teams', label: 'Constructors' },
];

interface NavbarProps {
  onOpenShortcuts?: () => void;
}

export function Navbar({ onOpenShortcuts }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)] border-b border-[var(--color-line)]">
      {/* Top classification status bar */}
      {!isScrolled && <StatusBar onOpenShortcuts={onOpenShortcuts} />}

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between ${isScrolled ? 'h-12' : 'h-14 sm:h-16'}`}>
          <div className="flex items-center gap-8">
            {/* Simple Clean Wordmark - No slashes, no decorative clutter */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-baseline gap-2 py-1 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <span className="font-display text-2xl tracking-tight text-[var(--color-text)]">
                PITLANE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[var(--color-text)] border-b-2 border-[var(--color-primary)]'
                        : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-line)] min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xs"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <Link
                key={`mobile-${item.to}`}
                to={item.to}
                onClick={closeMobileMenu}
                className={`flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--color-text)] bg-[var(--color-surface-subtle)] border-l-2 border-[var(--color-primary)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
