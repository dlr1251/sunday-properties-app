# Quick Start

Set up your development environment in about ten minutes.

## Requirements

- Node.js 18 or higher
- Supabase CLI (`npm install -g supabase`)
- Git
- Docker (for local Supabase)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/dlr1251/sunday-properties-app.git
cd sunday-properties-app
npm install
```

## Supabase

### Local development

```bash
supabase login
supabase start
```

Check status with `supabase status`. Note the API URL and anon key for `.env.local`.

### Remote project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Environment variables

Copy the example file and set values:

```bash
cp env.example .env.local
```

Minimum for local development:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | API URL (local: `http://127.0.0.1:54327`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps key (optional for testing) |

For local Supabase, use the credentials from `supabase status`.

## Database

Full reset and seed (recommended):

```bash
npm run db:reset-seed
```

Or manually:

```bash
supabase db reset --local
node scripts/seed-users.mjs
supabase db push --local
./scripts/seed-complete.sh
```

## Collaborative editing (Yjs)

The collaborative editor and part of real-time negotiation depend on a Yjs WebSocket server:

```bash
npm run yjs:server
```

Or `npx y-websocket-server --port 1234`. Keep it running in a separate terminal.

## Run the application

```bash
npm run dev
```

Open `http://localhost:5173`.

## Quick checks

- **Supabase Studio**: `http://127.0.0.1:54323` (after `supabase start`)
- **Mailpit** (local email): see `supabase status`

For permission or connection errors, see [Deployment](../operations/deployment) or the legacy [FAQ](../../faq) in `docs/`.

## Related

- [Concepts](concepts) — Domain model
- [Architecture](architecture) — Stack and design
- [Deployment](../operations/deployment) — Build and production
