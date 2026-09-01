# Migraciones

Migraciones de Supabase y datos semilla.

## Estructura

Las migraciones viven en `supabase/migrations/`. Nombres con prefijo numérico para orden (p. ej. `20240101000000_01_base_schema.sql`). Las consolidadas cubren esquema, RLS, funciones, triggers, índices, etc.

## Comandos básicos

```bash
# Supabase local
supabase start
supabase db reset --local    # Aplica migraciones y seed
supabase db push --local     # Solo migraciones

# Proyecto remoto (linked)
supabase link --project-ref YOUR_REF
supabase db push             # Aplica migraciones al remoto
```

## Seeds

Los datos iniciales (usuarios de prueba, propiedades, etc.) se cargan con scripts o SQL en `supabase/seeds/` y con scripts en `scripts/` (p. ej. `seed-users.mjs`, `seed-complete.sh`).

```bash
npm run db:reset-seed        # Reset + migraciones + seed (local)
./scripts/seed-complete.sh   # Seed completo
```

## Crear una nueva migración

```bash
supabase migration new nombre_descriptivo
```

Se crea un archivo en `migrations/`. Editar el SQL, luego `supabase db reset --local` o `db push` para aplicar.

## Buenas prácticas

- No modificar migraciones ya aplicadas en producción. Añadir una nueva migración para cambios.
- Revisar que RLS y políticas sigan cumpliendo los requisitos de seguridad.
- Probar en local antes de hacer `db push` al remoto.

## Temas relacionados

- [Esquema de base de datos](db-schema)
- [Instalación](installation)
- [Despliegue](deployment)
