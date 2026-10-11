import { createContext, useContext, useState, ReactNode } from 'react';

export type TimezoneMode = 'local' | 'utc' | 'track';

interface TimezoneContextValue {
  timezoneMode: TimezoneMode;
  toggleTimezone: () => void;
  setTimezoneMode: (mode: TimezoneMode) => void;
  formatSessionTime: (isoDateTime?: string, dateStr?: string, timeStr?: string) => {
    date: string;
    time: string;
    label: string;
  };
}

const TimezoneContext = createContext<TimezoneContextValue | null>(null);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>('local');

  const toggleTimezone = () => {
    setTimezoneMode((prev) => {
      if (prev === 'local') return 'utc';
      if (prev === 'utc') return 'track';
      return 'local';
    });
  };

  const formatSessionTime = (isoDateTime?: string, dateStr?: string, timeStr?: string) => {
    if (!isoDateTime && !dateStr) {
      return { date: 'TBA', time: '', label: '' };
    }

    try {
      const targetIso = isoDateTime || (timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T12:00:00Z`);
      const d = new Date(targetIso);

      if (timezoneMode === 'utc') {
        const utcDate = d.toLocaleDateString('en-GB', {
          timeZone: 'UTC',
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
        const hours = String(d.getUTCHours()).padStart(2, '0');
        const mins = String(d.getUTCMinutes()).padStart(2, '0');
        return {
          date: utcDate,
          time: `${hours}:${mins} UTC`,
          label: 'UTC',
        };
      }

      if (timezoneMode === 'track' || !isoDateTime) {
        // Track/Circuit scheduled time in UTC venue alignment
        const trackDate = d.toLocaleDateString('en-GB', {
          timeZone: 'UTC',
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
        const trackTime = timeStr ? `${timeStr.slice(0, 5)} Track` : 'Time TBA';
        return {
          date: trackDate,
          time: trackTime,
          label: 'Track',
        };
      }

      // User's Local Time
      const localDate = d.toLocaleDateString([], {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      const localTime = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return {
        date: localDate,
        time: `${localTime} Local`,
        label: 'Local',
      };
    } catch {
      return {
        date: dateStr || 'TBA',
        time: timeStr ? `${timeStr.slice(0, 5)} Track` : '',
        label: 'Track',
      };
    }
  };

  return (
    <TimezoneContext.Provider
      value={{
        timezoneMode,
        toggleTimezone,
        setTimezoneMode,
        formatSessionTime,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone(): TimezoneContextValue {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}
