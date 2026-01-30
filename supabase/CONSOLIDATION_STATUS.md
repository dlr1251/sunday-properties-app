# Estado de Consolidación - Migraciones y Seeds

**Fecha de creación:** 2025-01-31  
**Estado:** En progreso - Fase 1: Análisis y Backup

## Estado Actual de la Base de Datos

### Conteo de Datos (Antes de Consolidación)

| Tabla | Conteo |
|-------|--------|
| `auth.users` | 1 |
| `profiles` | 1 |
| `negotiations` | 1 |
| `negotiation_offers` | 1 |
| `negotiation_documents` | 1 |

### Tablas Existentes en Schema Public

1. `profiles` - Perfiles de usuario
2. `negotiations` - Negociaciones activas
3. `negotiation_offers` - Ofertas dentro de negociaciones
4. `negotiation_documents` - Documentos de negociaciones

### Observaciones

- La base de datos actual tiene solo datos mínimos (1 usuario, 1 negociación)
- Faltan los 20 usuarios de prueba mencionados en el plan
- No existe la tabla `properties` pero está referenciada en seeds
- Muchas migraciones han sido aplicadas pero faltan datos de seed

## Migraciones Actuales

- **Total de migraciones:** 46 archivos
- **Ubicación:** `supabase/migrations/`
- **Estado:** Serán movidas a `_archived/` después de consolidación

## Seeds Actuales

- `supabase/seed-consolidated.sql` - Seed consolidado parcialmente
- `supabase/seed-production-data-fixed.sql` - Backup
- `supabase/seed.sql` - Vacío
- `supabase/seeds/seed-negotiation-data.sql` - Datos de negociaciones

## Proceso de Consolidación

### Fase 1: Análisis y Backup ✅
- [x] Verificar datos existentes
- [x] Crear backup de datos
- [x] Documentar estado actual

### Fase 2: Consolidación de Migraciones (En progreso)
- [ ] Crear carpeta `_archived/`
- [ ] Mover migraciones existentes
- [ ] Crear migraciones consolidadas (6 archivos)

### Fase 3: Consolidación de Seeds (Pendiente)
- [ ] Crear `seed-local.sql` principal
- [ ] Actualizar `config.toml`
- [ ] Crear scripts de seeding

### Fase 4-6: Validación y Documentación (Pendiente)

## Backup

El backup de datos se encuentra en: `supabase/backup_data_before_consolidation.sql`

**Nota:** Este backup contiene solo los datos existentes antes de la consolidación. Los 20 usuarios de prueba deberán ser creados usando `scripts/seed-users.mjs` después de aplicar las migraciones consolidadas.

