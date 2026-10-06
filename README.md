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
| `npm run copy:ai-food` | Copiar assets de prueba a `public/` |
| `npm run yjs:server` | Servidor WebSocket para edición colaborativa |

---

## Estructura del repositorio

```
/
├── src/              # Aplicación React
├── supabase/         # Migraciones, seeds y edge functions
├── docs/             # Documentación (ES/EN)
├── scripts/          # Automatización (setup, sql, seed, dev)
├── data/ai_food/     # PDFs e imágenes de prueba (copiados a public/ en dev)
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

## Licencia

MIT — ver archivo `LICENSE` si existe en el repositorio.
