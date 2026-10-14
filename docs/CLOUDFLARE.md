# Cloudflare Pages

Cómo publicar esta SPA (Vite 6 + React 18) en Cloudflare Pages sin romper el deploy de Vercel. `vercel.json` y `api/` siguen siendo la ruta de Vercel.

No mergear ni promover a producción desde este documento. No pegar valores secretos en el dashboard de Pages más que como secretos de runtime, y nunca en el repo.

## Build

En el proyecto de Pages:

| Ajuste | Valor |
|---|---|
| Build command | `npm run build` |
| Output directory | `build` |
| Root directory | raíz del repo |
| `NODE_VERSION` | `20` o superior (hay un `.nvmrc` con `20`) |

`npm run build` ejecuta `copy-docs` y `vite build`. El `postinstall` copia el worker de pdfjs a `public/`.

Preview local del output de Pages (después del build):

```bash
npm run build
npx wrangler pages dev build
```

`wrangler.toml` declara `pages_build_output_dir = "build"`, `compatibility_date` y `nodejs_compat`. No contiene secretos.

`npx wrangler pages dev build` puede avisar que `/* /index.html 200` es un bucle; en local 4.x igual sirve el shell para `/login` y `/about`. En Pages de verdad esa regla es el fallback SPA.

## Qué hace cada pieza

- `functions/properties/[slugOrId].ts` — OG por listing. Carga el shell con `env.ASSETS.fetch('/index.html')` (sigue un redirect si ASSETS no devuelve HTML) y reutiliza `renderListingIndexHtml`. Los slugs con mayúsculas responden 301 a la ruta en minúsculas.
- `functions/api/xai.ts` — proxy de xAI. Lee `XAI_API_KEY` del entorno de la Function. El cliente ya no usa `VITE_XAI_API_KEY`.
- `public/_redirects` — fallback SPA `/* → /index.html` (200), sin tragarse `api/`, `docs/` ni `assets/`.
- `public/_headers` — cache de `/assets/*`. `vercel.json` no define headers propios.

En Vercel no cambia el contrato: `/properties/:slugOrId` sigue reescribiéndose a `/api/listing-html`, y `api/xai.ts` es el equivalente del proxy.

## Variables — solo nombres

Las que empiezan por `VITE_` se incrustan en el bundle en el **build**. Configúralas como variables de build en Pages. Las de runtime de Functions se configuran como secretos/vars de producción y preview, **sin** prefijo `VITE_` cuando son secretas.

### Build (públicas)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ENV`
- `VITE_APP_NAME`
- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_PAYMENT_TEST_MODE`
- `VITE_YJS_WS_URL`
- `VITE_ENABLE_YJS_WEBSOCKET`
- `VITE_ENABLE_REALTIME`
- `VITE_GOOGLE_MAPS_API_KEY` (si se usan mapas)
- `NODE_VERSION`

### Runtime de Functions (Pages)

- `XAI_API_KEY` — solo servidor. Nunca `VITE_XAI_API_KEY`.
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` — también útiles en runtime para el OG y para validar la sesión del proxy xAI. Son la clave **anon** pública.

### Prohibido en Pages

- `SUPABASE_SERVICE_ROLE_KEY` — no configurarla en Cloudflare Pages. No hace falta para OG ni para el proxy xAI. Si se necesita, que viva solo en scripts locales o en Edge Functions de Supabase.
- Cualquier `VITE_*` que sea un secreto (la clave de xAI no puede ir al cliente).

En Vercel, configura el mismo `XAI_API_KEY` (serverless) y deja de inyectar `VITE_XAI_API_KEY`. La clave que estuvo en el bundle hay que **rotarla**.

## Comprobar

1. Home `/` sirve la SPA.
2. Una ruta profunda (`/login`, `/about`) cae al `index.html` y React Router pinta la página.
3. `GET /properties/<slug>` incluye `og:title` / `og:description` / `og:image` del listing publicado, sin dirección, depósito ni nombre del propietario.
4. `GET /properties/<Slug-Con-Mayúsculas>` responde 301 a la versión en minúsculas.
5. `POST /api/xai` sin `Origin` propio o sin sesión de Supabase no llama a xAI.

## Relacionado

- [Despliegue en Vercel](es/operaciones/despliegue.md)
- `.env.example` — plantilla de nombres
