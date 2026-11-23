# NEXORA

Phase 01 foundation for a premium digital asset exchange interface.

## Requirements

- Node.js 20.9 or newer
- npm

## Getting started

```sh
npm install
npm run dev
```

## Scripts

`npm run build` production build · `npm run lint` ESLint · `npm run typecheck` TypeScript · `npm test` Vitest · `npm run test:e2e` Playwright

## Routes

Public: `/`, `/markets` · Account UI previews: `/login`, `/signup`, `/forgot-password` · Exchange shell: `/dashboard`, `/trade/[pair]`, `/wallet`, `/orders`, `/profile`, `/settings`.

## Phase 01 scope

The exchange dashboard and market snapshots use clearly labeled illustrative data. Authentication, wallet connection, live market feeds, order entry, and account operations are intentionally not connected in this phase. Theme starts in dark mode and supports a light theme. Route groups leave room for the Phase 02 Supabase integration.
