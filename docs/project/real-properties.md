# Real Properties + SEO for Rentals (Arriendos)

This document tracks the move from heavy test data to real properties.

## Photo standard (web listings)

- **Format:** WebP, long edge ≤ 1600px
- **Storage:** Supabase bucket `property-photos/`, ASCII object keys only
- **Upload:** `node scripts/upload-listing-photos.mjs --title "<listing title>" --folder <slug>`
- **Published rule:** Amelia (`escorial-701`) published 2026-08-30 with **3 baños** (canon COP $6M/mes).

## The Real Properties (August 2026)

| Key            | Title                                           | Type   | Neighborhood | Owner           | Agent         | Notes |
|----------------|-------------------------------------------------|--------|--------------|-----------------|---------------|-------|
| brisas-estadio | Brisas del Estadio — Apartamento dúplex en venta | sale   | Estadio      | Peter Pichler   | Daniel Luque  | Apto 517 + parqueadero S-24, 75 m² dúplex. Lista **COP $590M** (confirmado 2026-08-30). FincaRaiz [194112531](https://www.fincaraiz.com.co/apartamento-en-venta-en-laureles-medellin/194112531). |
| escorial-701   | El Escorial 701 — Arriendo en Conquistadores    | rental | Conquistadores | Amelia Patiño | Daniel Luque  | 140 m², 4 hab, **3 baños**, biblioteca, balcón. Canon **COP $6.000.000**. **Published** `abd51c41-…`. |
| campo-nuevo    | Apartamento Campo Nuevo — Arriendo              | rental | Campo Nuevo  | Mónica Luque    | Daniel Luque  | 52 m², conjunto con gym/BBQ |
| lauret         | Casa Lauret — Arriendo en Laureles              | rental | Laureles     | Pablo Noreña    | Daniel Luque  | Casa 220 m² |

**Legacy removed:** `Propiedad Peter Pitchler - Venta` (placeholder — replaced by Brisas del Estadio).

## Accounts (seeded)

| Role  | Email                    | Password (if new) |
|-------|--------------------------|-------------------|
| Owner | peter.pichler@sunday.com | RealProp2026!     |
| Owner | amelia.patino@sunday.com | RealProp2026!     |
| Owner | monica.luque@sunday.com  | RealProp2026!     |
| Owner | pablo.norena@sunday.com  | RealProp2026!     |
| Agent | daniel@luquelaw.co       | RealProp2026!     |

## How to seed the real properties

```bash
cp .env.example .env.local
# Fill VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY

npm run seed:real-properties
```

The script upserts by title, assigns `owner_id` + `agent_id`, sets `published`, and configures visit availability.

Optional prune of old test listings:

```bash
npm run prune:test-properties
```

## Notion inventory

- [Propiedades SP](https://www.notion.so/c257cfbb373c44fb9630f8f7b6cc3297)
- [Brisas del Estadio](https://www.notion.so/36ba689f002581359f7af165a58d1beb)
- [El Escorial 701](https://www.notion.so/3bda689f002580f886e8d814e22a7f9b)
- [Peter Pichler — Property Sale](https://www.notion.so/401efffbd8bb445c91272c98f63a4c2b)

## Photos

Replace Unsplash placeholders by uploading Drive photos to Supabase Storage (`property-photos` bucket) and updating `images[]` on each property.

---

Last updated: 2026-08-30
