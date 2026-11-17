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
 * This file replaces vercel.json (Vercel allows one config source). Listing
 * HTML and SPA fallbacks from the previous vercel.json are preserved below.
 */
export default await withEve({
  installCommand: 'npm install',
  buildCommand: 'npm run build',
  outputDirectory: 'build',
  framework: 'vite',
  functions: {
    'api/listing-html.ts': {
      includeFiles: 'build/index.html',
    },
  },
  rewrites: [
    {
      source: '/properties/:slugOrId',
      destination: '/api/listing-html?slugOrId=:slugOrId',
    },
    {
      source: '/((?!api/|docs/|assets/|eve/|\\.well-known/)(?!.*\\.[a-zA-Z0-9]+$).*)',
      destination: '/index.html',
    },
  ],
  services: {
    web: {
      framework: 'vite',
      root: '.',
      buildCommand: 'npm run build',
      outputDirectory: 'build',
    },
  },
  routes: [
    {
      src: '^(.*)$',
      destination: { type: 'service', service: 'web' },
    },
  ],
});
