# AGENT.MD

Guidance for coding agents working inside `0-web`.

## Scope

- This file applies to the `0-web` subproject only.
- Do not modify root CLI behavior in `../src` unless explicitly requested.

## Project Overview

`0-web` is the web port of TF2 First Play Date Finder.

- Frontend: Vite + React + TypeScript + Tailwind.
- Backend: Bun server exposing `/api/*`.
- Data pipeline: build-time Steam metadata generation for achievements.
- Visual style: TF2/cooler-hud inspired.

## Core Commands

Run from `0-web/`:

```bash
bun install
bun run dev
bun run dev:web
bun run dev:api
bun run test
bun run build
bun run build:web
bun run build:data
bun run assets:badges
```

## Runtime Endpoints

- `GET /api/health`
- `POST /api/lookup` with body:

```json
{ "input": "steam64|vanity|profileUrl" }
```

## Current UX Behavior

- Starter screen shows centered lookup panel.
- User page is route-like via URL suffix: `/user/<steamId-or-input>`.
- Starter panel and user page are mutually exclusive.
- Back-to-lookup control exists in profile header as an icon button.

When changing routing logic, preserve browser back/forward behavior (`popstate`).

## Time Display Rule

- Achievement timeline and badge hire date must both use UTC/GMT formatting.
- Do not mix local-time formatting with GMT formatting in user-visible timestamps.

## Asset Rules

- Badge assets are one-time/manual update flow:
  - `scripts/fetch-badge-icons.ts`
  - `scripts/generate-unknown-badge.ts`
- `unknown.png` is generated from `mercenary.png` using ImageMagick + TF2 Build font.
- Keep `public/images/badges/*` paths stable unless intentionally migrating all references.
- Back icon currently comes from converted cooler-hud `.vtf` output (`public/images/icons/back.png`).

## Data Pipeline Rule

- Achievement metadata is Steam-only (no wiki scraping for achievement names/icons).
- Generated files:
  - `data/achievement-metadata.generated.json`
  - `data/scrape-report.generated.json`

## File Map

- Frontend app shell: `src/App.tsx`
- API client/types/date helpers: `src/lib/*`
- UI components: `src/components/*`
- API server entry: `server/index.ts`
- API route handlers: `server/routes/*`
- Steam/business logic: `server/lib/*`
- Build/data scripts: `scripts/*`

## Coding Expectations

- Use TypeScript strict-friendly code.
- Keep API responses partial/fault-tolerant rather than all-or-nothing.
- Keep UI copy concise and functional.
- Prefer minimal, targeted changes.
- Run `bun run test` and (when possible) `bun run build:web` before handoff.

## Environment

Required in `0-web/.env`:

```env
STEAM_API_KEY=...
API_PORT=3001
```

Never commit real API keys.
