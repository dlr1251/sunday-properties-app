# Conceptos

Modelo de dominio de Sunday Properties: entidades principales, relaciones y flujos.

## Resumen

La plataforma une **propiedades**, **usuarios** (con roles), **ofertas y negociaciones**, **visitas** y **casos legales**. Toda la interacción pasa por perfiles verificables y reglas de negocio explícitas.

## Usuarios y perfiles

- **auth.users**: Identidad y sesión (Supabase Auth).
- **profiles**: Perfil extendido (nombre, teléfono, rol, estado, verificación).

Roles: `user`, `agent`, `lawyer`, `admin`, `super_admin`. El rol define permisos y vistas.

La verificación de identidad es obligatoria para agendar visitas, hacer ofertas y publicar propiedades.

## Propiedades

Una **property** representa un inmueble publicado (venta o alquiler). Incluye:

- Datos básicos: título, descripción, dirección, tipo, precio, área, habitaciones, etc.
- Multimedia: imágenes, tour virtual, video, plano.
- Estado: `draft`, `pending`, `published`, `sold`, `rented`, `archived`.
- Vinculación a `owner_id` y, opcionalmente, `agent_id`.

**property_availability**: Horarios semanales en los que se pueden agendar visitas.

**negotiation_rules**: Reglas por propiedad (precio mínimo, condiciones por defecto, etc.) que alimentan la validación de ofertas.

## Ofertas y negociación

- **offers**: Oferta de compra sobre una propiedad. Incluye precio, forma de pago, financiación, condiciones, fecha de cierre deseada y estado (`pending`, `accepted`, `rejected`, `countered`, `expired`, `cancelled`).
- **counter_offers**: Contraofertas ligadas a una oferta. Se negocian precio, condiciones y plazos.
- **offer_conditions**: Modelo estructurado de condiciones (inspección, costos notariales, financiación, etc.) con versionado e impacto en VPN.

El flujo típico: oferta → validación automática → contraoferta(s) → acuerdo → cierre legal.

## Visitas

- **visits**: Visita agendada a una propiedad. Incluye fecha, hora, estado, y opcionalmente pago (por ejemplo 49.000 COP) y aceptación de NDA.
- **property_availability** y **blocked_dates** determinan franjas disponibles.

Solo usuarios verificados pueden agendar. El vendedor o agente gestiona confirmaciones y recordatorios.

## Casos y documentos legales

- **cases**: Caso legal asociado a una negociación (u otro origen). Agrupa documentos y tareas.
- **case_documents**: Documentos del caso (contratos, escrituras, etc.).
- **contracts**: Contratos generados o asociados al flujo.

Los abogados gestionan casos asignados; el sistema soporta generación de documentos y revisión.

## Comunicación y notificaciones

- **chat_messages**: Mensajería entre usuarios (por conversación o contexto).
- **notifications**: Notificaciones in-app (y enlace a email cuando aplique) para ofertas, visitas, cambios de estado y mensajes.

## Auditoría y configuración

- **audit_logs**: Registro de acciones relevantes para trazabilidad y soporte.
- **platform_settings**: Configuración global (feature flags, parámetros de negocio).

## Temas relacionados

- [Arquitectura](architecture) — Stack técnico y diseño
- [Esquema de base de datos](db-schema) — Tablas y relaciones
- [API — Ofertas](api-offers) — Flujo de ofertas y cierre
