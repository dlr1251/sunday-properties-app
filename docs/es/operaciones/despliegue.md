# Despliegue

Build, variables de entorno y publicación en Vercel.

## Requisitos

- Cuenta en Vercel y en Supabase.
- Repositorio conectado a Vercel (GitHub u otro).
- Variables de entorno de producción configuradas.

## Build

```bash
npm install
npm run build
```

El build de Vite genera la SPA en `dist/`. Revisar que no haya errores de tipos ni de build.

## Variables de entorno

Configurar en Vercel (o en el entorno de despliegue) las variables que usa la app. Las que empiezan por `VITE_` se embeben en el frontend en tiempo de build.

Mínimas para producción:

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (pública) de Supabase |
| `VITE_APP_ENV` | `production` |
| `VITE_GOOGLE_MAPS_API_KEY` | Clave de Google Maps (si se usan mapas) |

Otras posibles: `VITE_STRIPE_PUBLIC_KEY`, `VITE_YJS_WS_URL` (si hay servidor Yjs en producción), `VITE_PAYMENT_TEST_MODE`, etc. Ver `.env.example`.

No exponer la **service role key** de Supabase en el frontend. Usarla solo en Edge Functions o scripts de backend.

## Vercel

### Desde la web

1. Conectar el repositorio en Vercel.
2. Configurar las variables de entorno en Project Settings.
3. Ejecutar el deploy (manual o por push).

### Desde CLI

```bash
npm i -g vercel
vercel
```

Seguir el asistente. Para producción:

```bash
vercel --prod
```

### Dominio

En Vercel: Settings → Domains. Añadir dominio y configurar DNS según las instrucciones.

## Supabase en producción

- Proyecto en Supabase Cloud (no local).
- Migraciones aplicadas (`supabase db push` o desde el panel).
- Auth configurado (providers, URLs de redirect, etc.).
- RLS y políticas verificadas.

## Comprobar el despliegue

- Cargar la app en la URL de producción.
- Probar login, listado de propiedades y flujos críticos.
- Revisar la consola del navegador y los logs de Vercel/Supabase por errores.

## Temas relacionados

- [Inicio rápido](../guia/inicio-rapido) — Entorno local
- [Migraciones](migraciones)
- [Monitoreo](monitoreo)
