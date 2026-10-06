# Monitoring

Logs, errors, and system health.

## Application logs

- **Frontend**: Errors and warnings in the browser console. Inspect via devtools.
- **Vercel**: Serverless and deployment logs in the Vercel dashboard (Deployments, Functions).
- **Build**: Output of `npm run build` and CI pipeline.

## Supabase

- **Dashboard**: API, Auth, Realtime, and Database logs in the Supabase project.
- **CLI**: `supabase logs` for linked projects.

Watch for 4xx/5xx errors, Auth failures, and slow queries.

## Audit

The `audit_logs` table records relevant actions (offer creation, status changes, etc.). Useful for support, debugging, and compliance.

## Common issues

- **Supabase connection**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and that the project is active.
- **RLS / permissions**: Errors when reading or writing tables. Check policies and that the user has the expected role.
- **Realtime / WebSocket**: If disabled in development, avoid depending on subscriptions for critical flows. Config in `src/lib/supabase.ts` and env vars.
- **Yjs**: The WebSocket server must be running for collaborative editing. `npm run yjs:server` in development.

## Troubleshooting

For persistent failures:

1. Reproduce locally with `npm run dev` and local Supabase.
2. Check environment variables and Node version.
3. Review Supabase and Vercel logs.
4. See [Deployment](deployment) and [Migrations](migrations).

## Related

- [Deployment](deployment)
- [Database schema](db-schema)
- [Installation](installation)
