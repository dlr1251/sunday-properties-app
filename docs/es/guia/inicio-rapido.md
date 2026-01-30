# Inicio rápido

Configure su entorno de desarrollo en unos diez minutos.

## Requisitos

- Node.js 18 o superior
- Supabase CLI (`npm install -g supabase`)
- Git
- Docker (para Supabase local)

## Instalación

Clone el repositorio e instale dependencias:

```bash
git clone https://github.com/dlr1251/sunday-properties-app.git
cd sunday-properties-app
npm install
```

## Supabase

### Desarrollo local

```bash
supabase login
supabase start
```

Compruebe el estado con `supabase status`. Anote la API URL y la anon key para `.env.local`.

### Proyecto remoto

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Variables de entorno

Copie el ejemplo y ajuste los valores:

```bash
cp env.example .env.local
```

Variables mínimas para desarrollo local:

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | API URL (local: `http://127.0.0.1:54327`) |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `VITE_GOOGLE_MAPS_API_KEY` | Clave de Google Maps (opcional para pruebas) |

Para Supabase local, use las credenciales que muestra `supabase status`.

## Base de datos

Reset completo y seed (recomendado):

```bash
npm run db:reset-seed
```

O de forma manual:

```bash
supabase db reset --local
node scripts/seed-users.mjs
supabase db push --local
./scripts/seed-complete.sh
```

## Edición colaborativa (Yjs)

El editor colaborativo y parte de la negociación en tiempo real dependen de un servidor WebSocket Yjs:

```bash
npm run yjs:server
```

O `npx y-websocket-server --port 1234`. Deje el proceso en ejecución en otra terminal.

## Ejecutar la aplicación

```bash
npm run dev
```

Abra `http://localhost:5173`.

## Comprobaciones rápidas

- **Supabase Studio**: `http://127.0.0.1:54323` (tras `supabase start`)
- **Mailpit** (emails locales): según `supabase status`

Si encuentra errores de permisos o de conexión, consulte [Despliegue](../operaciones/despliegue) o [Monitoreo](../operaciones/monitoreo).

## Temas relacionados

- [Conceptos](conceptos) — Modelo de dominio
- [Arquitectura](arquitectura) — Stack y diseño
- [Despliegue](../operaciones/despliegue) — Build y producción
