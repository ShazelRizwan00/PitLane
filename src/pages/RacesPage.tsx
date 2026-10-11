import { useState, useMemo } from 'react';
import { useRaces } from '../hooks/useRaces';
import { useTimezone } from '../context/TimezoneContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, MapPin, CheckCircle2, Clock, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type FilterStatus = 'all' | 'completed' | 'upcoming';

export function RacesPage() {
  const { status, data, error, retry } = useRaces(2026);
  const { formatSessionTime, timezoneMode, toggleTimezone } = useTimezone();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRaces = useMemo(() => {
    if (!data?.races) return [];
    return data.races.filter((race) => {
      // Status filter
      if (filterStatus === 'completed' && !race.isCompleted) return false;
      if (filterStatus === 'upcoming' && race.isCompleted) return false;

      // Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = race.name.toLowerCase().includes(query);
        const matchesCircuit = race.circuit.name.toLowerCase().includes(query);
        const matchesCountry = race.circuit.country.toLowerCase().includes(query);
        const matchesLocality = race.circuit.locality.toLowerCase().includes(query);
        return matchesName || matchesCircuit || matchesCountry || matchesLocality;
      }

      return true;
    });
  }, [data?.races, filterStatus, searchQuery]);

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-12 border border-[var(--line)] bg-[var(--surface)] animate-pulse" />
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <ErrorState
        title="Race Calendar Unavailable"
        message={
          error?.message ||
          'Could not retrieve race calendar from the timing server.'
        }
        onRetry={retry}
      />
    );
  }

  const nextUpcomingRound = data.upcomingRaces?.[0]?.round;

  return (
    <div className="space-y-6 section-reveal">
      <PageHeader
        title="Calendar"
        subtitle={`${data.races.length} Grands Prix · 2026 Season`}
        badge={
          <Badge variant="default">
            2026
          </Badge>
        }
      >
        <button
          type="button"
          onClick={toggleTimezone}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] bg-[#19191E] text-[var(--text)] hover:border-[var(--accent)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)] text-xs font-mono min-h-[40px] cursor-pointer"
        >
          <span className="text-[var(--text-dim)]">TZ:</span>
          <span className="font-bold uppercase text-[var(--accent)]">{timezoneMode}</span>
        </button>
      </PageHeader>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 surface-panel corner-chamfer">
        {/* Status Filter Buttons */}
        <div className="flex items-center border border-[var(--line)] bg-[var(--bg)] p-0.5 text-xs font-body">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 font-medium transition-colors min-h-[36px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              filterStatus === 'all'
                ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--primary)]'
                : 'text-[var(--text-dim)] hover:text-[var(--accent)]'
            }`}
          >
            All ({data.races.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors min-h-[36px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              filterStatus === 'completed'
                ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--primary)]'
                : 'text-[var(--text-dim)] hover:text-[var(--accent)]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Classified ({data.completedRaces.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('upcoming')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors min-h-[36px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              filterStatus === 'upcoming'
                ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--primary)]'
                : 'text-[var(--text-dim)] hover:text-[var(--accent)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Upcoming ({data.upcomingRaces.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-[var(--text-dim)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by race, circuit, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--line)] pl-8 pr-3 py-2 text-xs text-[var(--text)] placeholder-[var(--text-dim)] font-body focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-colors min-h-[44px]"
          />
        </div>
      </div>

      {/* Dense Calendar Schedule Ledger */}
      {filteredRaces.length === 0 ? (
        <EmptyState
          title="No Races Match Filter"
          message="Try adjusting your status filter or search keyword."
          icon={<Filter className="w-5 h-5 text-[var(--text-dim)]" />}
          action={
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setSearchQuery('');
              }}
              className="text-xs font-body font-medium text-[var(--text)] underline cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--signal)] min-h-[44px]"
            >
              Reset filters
            </button>
          }
        />
      ) : (
        <div className="w-full overflow-x-auto surface-panel">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[var(--text-dim)] font-body uppercase tracking-wider">
                <th className="px-4 py-3 w-16 text-center font-medium">Round</th>
                <th className="px-4 py-3 font-medium">Grand Prix &amp; Circuit</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Date &amp; Session Time ({timezoneMode})</th>
                <th className="px-4 py-3 text-right font-medium">Status / Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--text)] font-body">
              {filteredRaces.map((race, index) => {
                const schedule = formatSessionTime(race.isoDateTime, race.date, race.time);
                const isNext = race.round === nextUpcomingRound;

                return (
                  <tr
                    key={`race-row-${race.round}`}
                    style={{ animationDelay: `${index * 15}ms` }}
                    className={`animate-row-reveal hover:bg-[var(--line)]/30 transition-colors relative ${
                      isNext ? 'bg-[var(--line)]/20' : ''
                    }`}
                  >
                    {/* Round */}
                    <td className="px-4 py-3 text-center font-display font-black text-xs tabular-nums">
                      <span className={isNext ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}>
                        R{String(race.round).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Grand Prix & Circuit Name */}
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-display font-bold text-sm text-[var(--text)] tracking-tight flex items-center gap-2">
                          <span>{race.name}</span>
                          {isNext && (
                            <span className="bg-[var(--primary)] text-[var(--text)] text-[10px] font-bold px-1.5 py-0.2">
                              Next
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)] mt-0.5">
                          {race.circuit.name}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-xs text-[var(--text-dim)]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                        <span>
                          {race.circuit.locality}, {race.circuit.country}
                        </span>
                      </div>
                    </td>

                    {/* Date & Session Time */}
                    <td className="px-4 py-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-medium text-[var(--text)] tabular-nums">
                          {schedule.date}
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)] tabular-nums">
                          {schedule.time}
                        </div>
                      </div>
                    </td>

                    {/* Status & Action */}
                    <td className="px-4 py-3 text-right">
                      {race.isCompleted ? (
                        <Link
                          to={`/results?round=${race.round}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--text)] bg-[var(--primary)] hover:brightness-110 border border-[var(--primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[36px]"
                        >
                          <span>Results</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : isNext ? (
                        <span className="text-xs font-body font-medium text-[var(--accent)]">
                          Next race
                        </span>
                      ) : (
                        <span className="text-xs font-body text-[var(--text-dim)]">
                          Scheduled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
