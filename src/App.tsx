import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Code-split pages for optimized bundle size and fast initial load
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const RacesPage = lazy(() =>
  import('./pages/RacesPage').then((m) => ({ default: m.RacesPage }))
);
const ResultsPage = lazy(() =>
  import('./pages/ResultsPage').then((m) => ({ default: m.ResultsPage }))
);
const DriversPage = lazy(() =>
  import('./pages/DriversPage').then((m) => ({ default: m.DriversPage }))
);
const TeamsPage = lazy(() =>
  import('./pages/TeamsPage').then((m) => ({ default: m.TeamsPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

function RouteLoadingFallback() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="h-28 border border-[var(--color-line)] bg-[var(--color-surface)]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 border border-[var(--color-line)] bg-[var(--color-surface)]" />
        <div className="h-32 border border-[var(--color-line)] bg-[var(--color-surface)]" />
      </div>
      <div className="h-64 border border-[var(--color-line)] bg-[var(--color-surface)]" />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/races"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <RacesPage />
            </Suspense>
          }
        />
        <Route
          path="/results"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <ResultsPage />
            </Suspense>
          }
        />
        <Route
          path="/drivers"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <DriversPage />
            </Suspense>
          }
        />
        <Route
          path="/teams"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <TeamsPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
