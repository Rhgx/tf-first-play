# tf-first-play

TF2 First Play Date Finder web port with:
- Bun API server (`/api/lookup`)
- Vite + React + TypeScript frontend
- Tailwind + cooler-hud inspired styling
- Build-time Steam achievement metadata pipeline

## Setup

```bash
bun install
cp .env.example .env
# add STEAM_API_KEY
```

## Development

```bash
bun run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

## Build

```bash
bun run build
```

`build` runs:
1. `scripts/fetch-fonts.ts`
2. `scripts/scrape-achievement-metadata.ts`
3. `vite build`

## Data Outputs

- `data/achievement-metadata.generated.json`
- `data/scrape-report.generated.json`

## API Contract

`POST /api/lookup`

Request:
```json
{ "input": "steam64|vanity|profileUrl" }
```

Response includes profile summary, badge state, chronological unlocked achievements, privacy flags, and warnings.

## License

GPL v3 - see [LICENSE](LICENSE).
