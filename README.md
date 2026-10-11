# PitLane — 2026 Formula 1 Dashboard

A modern, responsive, portfolio-ready Formula 1 analytics dashboard built specifically for the 2026 season. Designed with an independent SaaS telemetry aesthetic inspired by motorsport telemetry displays.

> **Important**: This is a **frontend-only** Single Page Application (SPA). There is **no backend, database, server proxy, authentication, or custom backend service**. All data is fetched directly from the browser to the public F1 API over client-side REST requests.

---

## Overview

**PitLane** gives motorsport fans and telemetry enthusiasts a comprehensive real-time view into the 2026 Formula 1 World Championship. It delivers clean data visualizations, complete race calendars, detailed race classifications, and driver & constructor standings.

Key highlights:
- **Zero Mock Data**: If live data cannot be retrieved, a clean, resilient error state with a manual **Retry** action is presented instead of fabricating data.
- **Strict TypeScript**: Built with strict mode enabled (`strict: true`, `noUncheckedIndexedAccess: true`), guaranteeing type safety across domain models and API transforms.
- **Client-Side In-Memory Cache**: Prevents redundant network requests while navigating routes, respecting public API rate limits while allowing on-demand user cache invalidation via manual retry.
- **Zero Polling**: Data is fetched on-demand upon page load without aggressive background polling.

---

## Features

1. **Season Overview Dashboard (`/`)**
   - 2026 Championship title, season progress bar, and completion stats.
   - Drivers' Championship and Constructors' Championship leader spotlights with liveries and point margins.
   - Latest completed Grand Prix and next upcoming race spotlight cards with direct classification links.
   - Live season statistics: title lead margin, constructor margin, different GP winners count, and most victories.
   - Interactive Recharts visualization with tab switching between **Top 10 Driver Standings Bar** and **Multi-Round Points Progression Line**.
   - Top 5 preview tables for drivers and constructors with deep navigation links.
   - Latest Grand Prix classification preview with finishing positions, race time/status, fastest lap indicators, and points.

2. **Race Calendar (`/races`)**
   - Complete 2026 FIA Formula 1 World Championship schedule (all 23 Grands Prix).
   - Round number, Grand Prix name, circuit details, locality, country, and UTC scheduled dates/times.
   - Clear visual differentiation between **Completed** (green badge/border) and **Upcoming** (blue badge/border) rounds.
   - Interactive filters: All Races, Completed Only, Upcoming Only.
   - Instant search bar filtering by Grand Prix, circuit, locality, or country.

3. **Grand Prix Results (`/results`)**
   - Interactive selector dropdown to inspect any completed 2026 Grand Prix.
   - Deep-linking via query parameters (e.g. `/results?round=1`).
   - Circuit information, event date, and Grand Prix winner spotlight.
   - Complete finishing classification: Finishing position (with gold/silver/bronze podium badges), driver full name, permanent number, team livery indicator, constructor, starting grid position, laps completed, race time or retirement status, fastest lap (`FL`) indicator, and championship points awarded.
   - Graceful handling for pending or unlogged results.

4. **Driver Standings (`/drivers`)**
   - Official 2026 Drivers' World Championship classification.
   - Interactive horizontal Recharts distribution showing point totals across top drivers.
   - Full standings table with position badges, driver nationality, team livery colors, Grand Prix victories, point gap to P1 leader, and championship points.

5. **Constructor Standings (`/teams`)**
   - Official 2026 Constructors' World Championship classification.
   - Horizontal bar chart comparing constructor points with team livery colors.
   - Full team table with championship ranking, constructor name, nationality, Grand Prix wins, margin to leader, and total points.

---

## Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode: `strict: true`, `noUncheckedIndexedAccess`, `noUnusedLocals`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router 6](https://reactrouter.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: Native browser `fetch` API with `AbortController` and custom error classification

---

## Project Structure

```
pitlane/
├── .env                     # Local environment variables
├── .env.example             # Example environment variables template
├── index.html               # Main HTML entry with motorsport fonts
├── package.json             # NPM dependencies and scripts
├── tsconfig.json            # Root TypeScript project references
├── tsconfig.app.json        # Strict application TypeScript configuration
├── tsconfig.node.json       # Node TypeScript configuration for Vite
├── vite.config.ts           # Vite bundler config with React & Tailwind plugins
└── src/
    ├── main.tsx             # DOM root & React Router provider
    ├── App.tsx              # Application route definitions
    ├── index.css            # Tailwind theme tokens & typography
    ├── env.d.ts             # Vite environment typings
    ├── api/
    │   ├── client.ts        # Resilient fetch wrapper with cache & typed errors
    │   ├── types.ts         # Raw Ergast/Jolpica response types & domain models
    │   ├── mappers.ts       # Safe transformers from raw API to domain types
    │   ├── races.ts         # Calendar, single race results & season results endpoints
    │   ├── drivers.ts       # Driver standings endpoint
    │   └── constructors.ts  # Constructor standings endpoint
    ├── hooks/
    │   ├── useAsync.ts              # Core async hook with retry, state & abort signals
    │   ├── useRaces.ts              # Calendar & upcoming/completed race derivations
    │   ├── useRaceResults.ts        # Round-specific race results hook
    │   ├── useSeasonResults.ts      # Multi-round season results aggregation hook
    │   ├── useDriverStandings.ts    # Driver championship standings hook
    │   ├── useConstructorStandings.ts # Constructor standings hook
    │   └── useDashboardData.ts      # Parallel dashboard orchestrator hook
    ├── lib/
    │   └── teamColors.ts    # 2026 constructor livery lookup with neutral fallback
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx # Global responsive layout with topbar & footer
    │   │   └── Sidebar.tsx  # Desktop fixed sidebar & mobile slide drawer
    │   ├── ui/
    │   │   ├── Card.tsx       # Reusable dark surface card container
    │   │   ├── Badge.tsx      # Status, podium & round badges
    │   │   ├── StatCard.tsx   # Telemetry metric cards with color accent
    │   │   ├── PageHeader.tsx # Standardized page title & actions
    │   │   ├── DataTable.tsx  # Horizontally scrollable responsive table
    │   │   ├── Skeleton.tsx   # Loading placeholders for cards, tables & charts
    │   │   ├── ErrorState.tsx # User-friendly error box with Retry action
    │   │   └── EmptyState.tsx # Empty / filtered state presentation
    │   ├── dashboard/
    │   │   ├── SeasonHero.tsx       # Season title & completion progress
    │   │   ├── LeaderCards.tsx      # Championship leaders spotlight
    │   │   ├── SeasonStats.tsx      # High-level championship telemetry stats
    │   │   ├── RaceSpotlight.tsx    # Latest completed & next upcoming race
    │   │   ├── StandingsPreview.tsx # Top 5 standings side-by-side
    │   │   └── RecentResults.tsx    # Recent Grand Prix top 10 classification
    │   └── charts/
    │       ├── DriverPointsChart.tsx       # Driver points bar chart
    │       ├── ConstructorPointsChart.tsx  # Constructor points horizontal bar chart
    │       └── PointsProgressionChart.tsx  # Multi-round line chart
    └── pages/
        ├── DashboardPage.tsx # Route: /
        ├── RacesPage.tsx     # Route: /races
        ├── ResultsPage.tsx   # Route: /results
        ├── DriversPage.tsx   # Route: /drivers
        ├── TeamsPage.tsx     # Route: /teams
        └── NotFoundPage.tsx  # Route: *
```

---

## API

PitLane consumes the community-maintained [Jolpica F1 API](https://github.com/jolpica/jolpica-f1), an Ergast-compatible public REST API supporting CORS client-side requests:

| Endpoint | Method | Purpose |
|---|---|---|
| `/{season}/races.json?limit=100` | GET | Full 2026 season race calendar |
| `/{season}/{round}/results.json?limit=100` | GET | Official classification for a specific Grand Prix |
| `/{season}/results.json?limit=100&offset={offset}` | GET | Paginated multi-round results for championship progression |
| `/{season}/driverstandings.json` | GET | 2026 Drivers' World Championship standings |
| `/{season}/constructorstandings.json` | GET | 2026 Constructors' World Championship standings |

---

## Environment Variables

PitLane relies on standard Vite client-side environment variables prefixed with `VITE_`.

Create a `.env` file in the root directory (or copy `.env.example`):

```bash
# Public F1 API base URL (CORS-enabled, client-accessible)
VITE_F1_API_URL=https://api.jolpi.ca/ergast/f1
```

> **Security Note**: Never place API keys, private tokens, or secrets in this project. The client calls public read-only endpoints directly.

---

## Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later, tested with v24)
- [npm](https://www.npmjs.com/) (v9 or later)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd "F1 FanRouter"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Build & Deployment

To verify TypeScript types and create an optimized production bundle:

```bash
# Type check and build bundle
npm run build
```

This outputs static HTML, CSS, and JS files to the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

### Static Hosting Notes
Since PitLane is a client-side Single Page Application (SPA) using React Router HTML5 History mode:
- On **Vercel**: Deploy with standard Vite preset.
- On **Netlify**: Ensure `/* /index.html 200` rewrite is configured.
- On **GitHub Pages / Cloudflare Pages / AWS S3**: Configure all 404 routes to redirect to `index.html`.

---

## Screenshots

*(Place screenshots of Dashboard, Calendar, Race Results, Drivers and Constructors views here)*

---

## License & Attribution

- Built as an independent portfolio project.
- Formula 1, F1, Grand Prix, and related marks are trade marks of Formula One Licensing B.V., a Formula 1 company. This project is not associated in any way with Formula One Group.
