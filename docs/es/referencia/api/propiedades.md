# API — Propiedades

Acceso a propiedades inmobiliarias mediante Supabase y el repositorio `PropertiesRepository`.

## Resumen

| Campo | Valor |
|-------|--------|
| Tipo | Tabla `properties` + repositorio |
| Ubicación | `src/lib/db/repositories/properties.repo.ts` |

Las operaciones usan el cliente Supabase. RLS restringe qué filas puede leer o modificar cada usuario.

## Tabla `properties`

Campos principales:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `owner_id` | UUID | FK a `profiles` |
| `agent_id` | UUID | FK a `profiles` (opcional) |
| `title` | string | Título |
| `description` | text | Descripción |
| `address` | string | Dirección |
| `city` | string | Ciudad |
| `price` | bigint | Precio (COP) |
| `property_type` | enum | `apartment`, `house`, `townhouse`, `office`, `commercial` |
| `bedrooms` | int | Número de habitaciones |
| `bathrooms` | int | Número de baños |
| `area` | int | Área (m²) |
| `parking` | int | Espacios de parqueadero |
| `status` | enum | `draft`, `pending`, `published`, `sold`, `rented`, `archived` |
| `verified` | bool | Certificación |
| `premium` | bool | Destacada |
| `images` | text[] | URLs de imágenes |
| `created_at`, `updated_at` | timestamptz | Auditoría |

## PropertiesRepository

### Obtener propiedades publicadas

```typescript
import { propertiesRepository } from '@/lib/db/repositories/properties.repo';

const result = await propertiesRepository.getPublishedProperties({
  propertyType: 'apartment',
  minPrice: 200_000_000,
  maxPrice: 500_000_000,
  bedrooms: 2,
  city: 'Medellín',
  search: 'Poblado',
  verified: true,
});
// Result<Property[], AppError>
```

Filtros opcionales: `status`, `propertyType`, `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `city`, `search`, `verified`, `premium`, `ownerId`.

### Obtener una propiedad por ID

```typescript
const result = await propertiesRepository.getPropertyById(propertyId);
// Result<Property | null, AppError>
```

### Crear y actualizar

El repositorio expone métodos para crear y actualizar propiedades (p. ej. en el wizard de subida). Las inserciones y actualizaciones deben cumplir RLS (por ejemplo, `owner_id = auth.uid()` o rol `agent`/`admin`).

## Relaciones habituales

En muchas consultas se hace `select` con joins a `profiles` (owner, agent). Ejemplo simplificado:

```typescript
supabase
  .from('properties')
  .select(`
    *,
    owner:profiles!properties_owner_id_fkey (id, name, email)
  `)
  .eq('status', 'published');
```

## Disponibilidad y visitas

- **property_availability**: Franjas semanales para agendar visitas.
- **blocked_dates**: Fechas bloqueadas por propiedad.

No forman parte del repositorio de propiedades pero se usan en el flujo de visitas. Véase [API — Visitas](visitas).

## Temas relacionados

- [Base de datos — Esquema](../base-de-datos/esquema) — `properties` y tablas relacionadas
- [Procesos — Publicar propiedad](../../procesos/publicar-propiedad)
- [Conceptos](../../guia/conceptos) — Propiedades
