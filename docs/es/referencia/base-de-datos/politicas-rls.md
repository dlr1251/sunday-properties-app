# Base de datos — Políticas RLS

Row Level Security: reglas de acceso por tabla y rol.

## Resumen

RLS está habilitado en las tablas públicas. Las políticas determinan qué filas puede seleccionar, insertar, actualizar o eliminar cada usuario según `auth.uid()` y, en su caso, el rol en JWT.

Las políticas se definen en `supabase/migrations/20240101000001_02_rls_policies.sql` y migraciones posteriores.

## Perfiles (`profiles`)

| Política | Operación | Condición |
|----------|-----------|-----------|
| Users can view their own profile | SELECT | `auth.uid() = id` |
| Users can update their own profile | UPDATE | `auth.uid() = id` |
| Users can insert their own profile | INSERT | `auth.uid() = id` |
| Admins can view/update/insert all profiles | SELECT, UPDATE, INSERT | `auth.jwt() ->> 'role'` en `admin`, `super_admin` |
| Service role | ALL | `true` (bypass para seeding y operaciones de backend) |

## Propiedades (`properties`)

| Política | Operación | Condición |
|----------|-----------|-----------|
| Anyone can view published properties | SELECT | `status = 'published'` |
| Owners can manage their properties | ALL | `auth.uid() = owner_id` |
| Authenticated users can manage properties | ALL | Usuario autenticado (uso para agentes y flujos específicos) |

La combinación permite lectura pública de publicadas y gestión restringida a propietarios o agentes según otras reglas de negocio.

## Visitas (`visits`)

| Política | Operación | Condición |
|----------|-----------|-----------|
| Users can view their own visits | SELECT | `auth.uid() = visitor_id` |
| Owners can view visits to their properties | SELECT | El usuario es `owner_id` de la propiedad de la visita |
| Users can create visits | INSERT | `auth.uid() = visitor_id` |
| Users can update their own visits | UPDATE | `auth.uid() = visitor_id` |

Solo el visitante y el dueño de la propiedad acceden a la visita.

## Ofertas (`offers`)

| Política | Operación | Condición |
|----------|-----------|-----------|
| Participants can view their offers | SELECT | `auth.uid() = buyer_id` o usuario es propietario de la propiedad |
| Users can create offers | INSERT | Usuario autenticado (validación de comprador en lógica de negocio) |
| Otras políticas | UPDATE, etc. | Restricción por participante (comprador, vendedor, agente) según migraciones |

## Otras tablas

Políticas análogas para `counter_offers`, `offer_conditions`, `notifications`, `cases`, `case_documents`, `audit_logs`, etc.: acceso por propietario del recurso, participante de la negociación o rol admin. El servicio con **service role** omite RLS cuando se usan scripts o Edge Functions con clave de servicio.

## Buenas prácticas

- No exponer la service role key en el frontend.
- Revisar nuevas políticas al añadir tablas o columnas sensibles.
- Usar `auth.jwt() ->> 'role'` solo si el rol se persiste correctamente en el JWT (p. ej. vía `profiles` o custom claims).

## Temas relacionados

- [Esquema](esquema)
- [API — Autenticación](../api/autenticacion)
- [Conceptos](../../guia/conceptos)
