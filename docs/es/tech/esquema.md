# Base de datos — Esquema

Tablas, relaciones y tipos principales del modelo de datos.

## Resumen

Modelo relacional sobre PostgreSQL. Migraciones en `supabase/migrations/`. Esquema base en `20240101000000_01_base_schema.sql`; RLS en `20240101000001_02_rls_policies.sql`; funciones y triggers en migraciones posteriores.

## Autenticación y perfiles

| Tabla | Descripción |
|-------|-------------|
| `auth.users` | Supabase Auth: identidad, sesión, credenciales |
| `profiles` | Perfil extendido: `id` (FK a `auth.users`), `full_name`, `email`, `phone`, `role`, `status`, `verification_status`, `avatar_url`, etc. |

Relación 1:1 entre `auth.users` y `profiles`.

## Propiedades

| Tabla | Descripción |
|-------|-------------|
| `properties` | Inmuebles: título, descripción, dirección, precio, tipo, áreas, estado (`draft`–`archived`), `owner_id`, `agent_id` |
| `property_availability` | Franjas semanales de disponibilidad para visitas |
| `blocked_dates` | Fechas bloqueadas por propiedad |
| `negotiation_rules` | Reglas de negociación por propiedad (precio mínimo, plazos, etc.) |

`properties` se relaciona con `offers`, `visits`, `property_availability`, `negotiation_rules`, entre otras.

## Negociación

| Tabla | Descripción |
|-------|-------------|
| `offers` | Ofertas de compra: `property_id`, `buyer_id`, `offer_price`, `payment_method`, `conditions`, `closing_date`, `status`, campos de VPN |
| `counter_offers` | Contraofertas ligadas a una oferta |
| `offer_conditions` | Condiciones estructuradas por oferta (tipadas, versionadas) |
| `offer_history` | Historial de cambios por oferta |
| `negotiation_rules` | Reglas por propiedad (véase arriba) |

## Visitas

| Tabla | Descripción |
|-------|-------------|
| `visits` | Visitas agendadas: `property_id`, `visitor_id`, `scheduled_date`, `scheduled_time`, `status`, `visit_price`, `paid`, `nda_accepted`, etc. |
| `visit_feedback` | Valoración y comentarios tras la visita |

## Legal

| Tabla | Descripción |
|-------|-------------|
| `cases` | Casos legales: `lawyer_id`, `buyer_id`, `seller_id`, `property_id`, `offer_id`, `case_type`, `status` |
| `case_documents` | Documentos del caso (contratos, certificados, etc.) |
| `contracts` | Contratos asociados al flujo |
| `intent_letters` | Cartas de intención por oferta |

## Comunicación y sistema

| Tabla | Descripción |
|-------|-------------|
| `chat_messages` | Mensajes de chat |
| `notifications` | Notificaciones in-app |
| `audit_logs` | Registro de auditoría |
| `platform_settings` | Configuración global y feature flags |

## Relaciones principales

```
auth.users ←→ profiles
profiles ←→ properties (owner_id, agent_id)
properties ←→ offers, visits, property_availability, negotiation_rules
offers ←→ counter_offers, offer_conditions, offer_history, intent_letters
offers ←→ cases
cases ←→ case_documents
```

## Convenciones

- Claves primarias `id` UUID.
- `created_at`, `updated_at` en tablas principales.
- Enums para `status`, `role`, `property_type`, etc., definidos en migraciones.

## Temas relacionados

- [API — Propiedades](api-properties) — Uso desde la aplicación
- [API — Autenticación](api-auth) — Tabla `profiles`
- [Migraciones](migrations)
