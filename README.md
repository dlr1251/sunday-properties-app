# Sunday Properties

Plataforma inmobiliaria para Medellín: publicación de propiedades, visitas, negociación con ofertas/contraofertas, documentos legales y dashboards por rol.

**Stack:** React 18 · TypeScript · Tailwind · Supabase · Vite · Vercel

---

## Inicio rápido

```bash
git clone https://github.com/dlr1251/sunday-properties-app.git
cd sunday-properties-app
npm install
cp .env.example .env.local   # completar credenciales Supabase y Maps
npm run dev                  # http://localhost:5173
```

Setup local de Supabase (Docker):

```bash
./scripts/setup/setup-local-supabase.sh
npm run db:reset-seed
```

Setup completo (Supabase remoto + Vercel):

```bash
./scripts/setup/setup-complete.sh
```

---

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run test` | Tests (Vitest) |
| `npm run db:reset-seed` | Reset DB + seed local |
| `npm run seed:real-properties` | Cargar propiedades reales |
| `npm run yjs:server` | Servidor WebSocket para edición colaborativa |

---

## Estructura del repositorio

```
/
├── src/              # Aplicación React
├── supabase/         # Migraciones, seeds y edge functions
├── docs/             # Documentación (ES/EN)
├── scripts/          # Automatización (setup, sql, seed, dev)
├── public/           # Assets estáticos servidos por Vite
├── .env.example      # Plantilla de variables de entorno
├── package.json
├── vite.config.ts
└── vercel.json
```

---

## Documentación

| Recurso | Enlace |
|---------|--------|
| Portal de docs | [`docs/index.md`](docs/index.md) → `/docs` en la app |
| Inicio rápido (ES) | [`docs/es/guia/inicio-rapido.md`](docs/es/guia/inicio-rapido.md) |
| Inicio rápido (EN) | [`docs/en/guide/quick-start.md`](docs/en/guide/quick-start.md) |
| Gestión del proyecto | [`docs/project/README.md`](docs/project/README.md) |
| Propiedades reales / SEO | [`docs/project/real-properties.md`](docs/project/real-properties.md) |
| Docs legacy | [`docs/_legacy/`](docs/_legacy/) |

---

## Usuarios de prueba

Contraseña universal: `password123` · dominios `@sunday.com` / `@mailinator.com`

| Rol | Email de ejemplo |
|-----|------------------|
| Admin | admin@sunday.com |
| Vendedor | juan.perez.test@mailinator.com |
| Comprador | maria.garcia.test@mailinator.com |
| Abogado | laura.fernandez@sunday.com |
| Agente | andrea.villa@sunday.com |

Detalle completo en [`docs/_legacy/testing/users.md`](docs/_legacy/testing/users.md).

---

## App de ChatGPT (Daniel)

Sunday expone un servidor MCP de solo lectura en `/mcp` (Apps SDK, streamable HTTP). Las tools `search_listings`, `show_listings`, `listing_stats` y `compare_listings` leen el mismo camino que Sunny (`/api/sunny/listings` → Supabase `prtyuwdkrrqhtwolcrav`, solo `status = published`). No hay captura de leads. Los CTA del widget van a la ficha en [sundayproperties.co](https://www.sundayproperties.co) / Agendar visita.

### Probar en local

```bash
npm run mcp:dev          # http://127.0.0.1:8787/mcp
npx @modelcontextprotocol/inspector@latest
```

En Inspector elige **Streamable HTTP** y pega `http://127.0.0.1:8787/mcp`. Preview de widgets (light/dark): `http://127.0.0.1:8787/api/mcp/preview?kind=listings`.

### Activar la app en ChatGPT

1. En ChatGPT (web), abre **Settings → Apps & connectors** (o **Plugins**).
2. Activa **Developer mode** (a veces está en Settings → Advanced / Apps). Sin eso no puedes pegar un conector propio.
3. **Add custom MCP server** / connector. Nombre: `Sunday Properties`. URL: `https://<tu-preview>.vercel.app/mcp` (incluye `/mcp`). Autenticación: **None**.
4. Acepta el aviso de riesgo y crea el plugin. En un chat de **Work**, escribe `@` y elige Sunday. Prueba: *“Muéstrame listados publicados en Medellín”*, *“¿cuánto cuesta el m² de Brisas?”*, *“compara estos tres arriendos”*.

La URL de preview de Vercel sirve para desarrollo. No uses un túnel (ngrok) para el directorio público.

### Enviar al directorio de ChatGPT

Hace falta un endpoint HTTPS estable (el dominio de producción, no un preview), verificación de dominio (token en `/.well-known/openai-apps-challenge`), una política de privacidad pública, identidad de desarrollador verificada y un ZIP de plugin con el MCP. Guía: [Upload and submit](https://developers.openai.com/plugins/deploy/submission). Esta app es read-only y sin auth; no cambies env de producción ni el esquema para publicarla.

---

## Licencia

MIT — ver archivo `LICENSE` si existe en el repositorio.
