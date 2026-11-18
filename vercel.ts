import { withEve } from 'eve/vercel';

/**
 * Hosting choice: keep `agent/` at the repo root and compose it with the
 * existing Vite SPA via `withEve` (eve/vercel). That is the supported way to
 * run an eve durable runtime next to a plain Vite app on Vercel.
 *
 * Wrapping the agent in `api/*.ts` would skip the eve web service, workflows,
 * and the inert sandbox provider. `api/sunny/anon.ts` stays a thin Turnstile
 * + rate-limit gate; `/eve/v1/*` is the generated eve service.
 *
 * Vercel forbids top-level `framework` / `buildCommand` / `outputDirectory` /
 * `installCommand` / `functions` next to `services`. With `services` present it
 * also skips the zero-config `api/` directory unless a service owns it
 * (`root: 'api'` or `root: '.'` + `entrypoint` under `api/`). The `api` service
 * is a Hono entrypoint (`api/index.ts`) so listing HTML, Sunny anon tickets,
 * public listings, and any later `api/` handlers still deploy. Public `/api/*`
 * and `/properties/:slug` go to that service; `/properties` and `/properties/`
 * stay on `web` for the SPA index. Everything else goes to `web`.
 */
export default await withEve({
  services: {
    web: {
      framework: 'vite',
      root: '.',
      installCommand: 'npm install',
      buildCommand: 'npm run build',
      outputDirectory: 'build',
      rewrites: [
        {
          source: '/((?!api/|docs/|assets/|eve/|\\.well-known/)(?!.*\\.[a-zA-Z0-9]+$).*)',
          destination: '/index.html',
        },
      ],
    },
    api: {
      // Root is the repo so src/ imports and node_modules resolve; entrypoint
      // under api/ is what tells Vercel this service owns the api/ directory.
      // `framework: 'hono'` blocks Vite auto-detection of this same root.
      root: '.',
      framework: 'hono',
      runtime: 'node',
      entrypoint: 'api/index.ts',
      installCommand: 'npm install',
      functions: {
        'api/index.ts': {
          includeFiles: 'build/index.html',
        },
      },
    },
  },
  rewrites: [
    { source: '/api/:path*', destination: { service: 'api' } },
    { source: '/properties/:slug', destination: { service: 'api' } },
  ],
  routes: [
    {
      src: '^/api(?:/.*)?$',
      destination: { type: 'service', service: 'api' },
    },
    {
      src: '^/properties/(.+)$',
      destination: { type: 'service', service: 'api' },
    },
    {
      src: '^(.*)$',
      destination: { type: 'service', service: 'web' },
    },
  ],
});
