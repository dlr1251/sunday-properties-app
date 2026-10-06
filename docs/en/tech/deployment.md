# Deployment

Build, environment variables, and publishing to Vercel.

## Requirements

- Vercel and Supabase accounts.
- Repository connected to Vercel (GitHub or similar).
- Production environment variables configured.

## Build

```bash
npm install
npm run build
```

The Vite build produces the SPA in `dist/`. Ensure there are no type or build errors.

## Environment variables

Set in Vercel (or your deployment environment) the variables used by the app. Those prefixed with `VITE_` are embedded in the frontend at build time.

Minimum for production:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_APP_ENV` | `production` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps key (if using maps) |

Others may include `VITE_STRIPE_PUBLIC_KEY`, `VITE_YJS_WS_URL` (if Yjs server in production), `VITE_PAYMENT_TEST_MODE`, etc. See `.env.example`.

Do not expose the Supabase **service role key** in the frontend. Use it only in Edge Functions or backend scripts.

## Vercel

### From the web

1. Connect the repository in Vercel.
2. Set environment variables in Project Settings.
3. Deploy (manually or on push).

### From CLI

```bash
npm i -g vercel
vercel
```

Follow the wizard. For production:

```bash
vercel --prod
```

### Domain

In Vercel: Settings → Domains. Add domain and configure DNS as instructed.

## Supabase in production

- Project on Supabase Cloud (not local).
- Migrations applied (`supabase db push` or from the dashboard).
- Auth configured (providers, redirect URLs, etc.).
- RLS and policies verified.

## Verify deployment

- Load the app at the production URL.
- Test login, property listing, and critical flows.
- Check the browser console and Vercel/Supabase logs for errors.

## Related

- [Installation](installation) — Local environment
- [Migrations](migrations)
- [Monitoring](monitoring)
