# PitLane — Project Handoff & Session Summary
**Date:** October 6, 2026  
**Project Name:** PitLane (Formula 1 Dashboard)  
**Location:** `E:\Projects\F1 FanRouter`

---

## 1. Current Project State

The project is **100% functional, built, type-checked, and ready to run**.
- **Build Status:** `npm run build` (`tsc -b && vite build`) passes cleanly with **0 errors and 0 warnings**.
- **Strict Mode:** TypeScript `strict: true`, `noUncheckedIndexedAccess: true`, `noUnusedLocals: true` with zero `any` types.
- **Preview Server:** Configured and tested on `http://localhost:5173`.
- **API Status:** Live direct-client integration with Jolpica F1 API (`https://api.jolpi.ca/ergast/f1`) returning live 2026 season data.

---

## 2. Quickstart Commands for Tomorrow

```bash
# 1. Open the project directory
cd "E:\Projects\F1 FanRouter"

# 2. Start the development server (Hot Module Replacement)
npm run dev

# 3. Or build and preview the optimized production bundle
npm run build
npm run preview
```

---

## 3. Architecture & Key File Map

| Purpose | File / Directory | Description |
|---|---|---|
| **Environment** | `.env`, `.env.example` | `VITE_F1_API_URL=https://api.jolpi.ca/ergast/f1` |
| **API Client** | `src/api/client.ts` | Native `fetch` wrapper with typed `ApiError` (`network`/`http`/`invalid`), in-memory session cache, and cache-bypassing on Retry. |
| **Data Types** | `src/api/types.ts` | Raw API response envelopes and clean domain types (`Race`, `Driver`, `Constructor`, `RaceResult`, `DriverStanding`, `ConstructorStanding`). |
| **Mappers** | `src/api/mappers.ts` | Pure functions converting string API fields into strongly typed numbers, dates, and completion status. |
| **API Endpoints** | `src/api/races.ts`, `drivers.ts`, `constructors.ts` | Calendar, single-race classification, paginated multi-round results, and standings. |
| **Custom Hooks** | `src/hooks/` | `useAsync` (core engine with retry and abort signal), `useDashboardData`, `useRaces`, `useRaceResults`, `useSeasonResults`, `useDriverStandings`, `useConstructorStandings`. |
| **Liveries** | `src/lib/teamColors.ts` | 2026 Constructor color palette (11 teams) with neutral fallback. |
| **Layout** | `src/components/layout/` | `AppShell.tsx` (topbar + footer), `Sidebar.tsx` (desktop fixed sidebar + mobile slide drawer). |
| **UI Kit** | `src/components/ui/` | `Card`, `Badge`, `StatCard`, `PageHeader`, `DataTable`, `Skeleton`, `ErrorState` (with Retry), `EmptyState`. |
| **Visualizations** | `src/components/charts/` | `DriverPointsChart.tsx`, `ConstructorPointsChart.tsx`, `PointsProgressionChart.tsx`. |
| **Pages** | `src/pages/` | `DashboardPage`, `RacesPage`, `ResultsPage`, `DriversPage`, `TeamsPage`, `NotFoundPage`. |
| **Routes** | `src/App.tsx` | React Router 6 setup with `React.lazy` code-splitting and fallback skeletons. |

---

## 4. Key Decisions & Technical Boundaries

1. **Frontend-Only**: Strict adherence to no backend, no database, no authentication, and direct browser CORS requests.
2. **Zero Polling & Zero Fake Fallbacks**: Only fetch upon route mount. If an endpoint fails, display a user-friendly `ErrorState` with a manual `Retry` button that clears cache.
3. **2026 Season Real Data**: Calendar features 23 Grands Prix; Driver and Constructor standings reflect real 2026 season championship telemetry.
4. **Optimized Bundle Chunks**: Lazy-loaded pages prevent large chunk warnings and keep the initial JS bundle under 185 kB.

---

## 5. Recommended Ideas / Next Steps to Pick Up Tomorrow

If you want to expand PitLane further:
- **Sprint Race Results**: Add a toggle on `ResultsPage` for Grand Prix vs. Sprint race sessions (`/{round}/sprint.json`).
- **Qualifying Classification**: Add a Qualifying tab on `ResultsPage` displaying Q1, Q2, Q3 lap times (`/{round}/qualifying.json`).
- **Circuit Track Details**: Enhance the `RaceCalendar` cards with circuit length, lap record, and turns count.
- **Head-to-Head Comparison**: Create a teammate comparison tool contrasting points, qualifying battles, and race finishes between drivers of the same team.
- **CI/CD & Deployment**: Add a GitHub Actions workflow to build and deploy to GitHub Pages, Vercel, or Netlify.
