# Cierre legal

Casos legales, asignación de abogado y documentos tras la aceptación de una oferta.

## Requisitos previos

- Oferta o contraoferta aceptada.
- Propiedad, comprador y vendedor definidos.
- Abogados disponibles en la plataforma (para asignación automática).

---

## Activación del proceso

Al aceptarse una oferta o contraoferta:

1. Se crea un **caso** en la tabla `cases`, vinculado a la propiedad, comprador, vendedor y oferta.
2. Se **asigna un abogado** (p. ej. por disponibilidad y carga de trabajo).
3. Se crea una **conversación de chat** asociada al caso.
4. Se envían **notificaciones** a comprador, vendedor y abogado.

El caso pasa a estado "active". Las partes pueden comunicarse por el chat del caso.

---

## Gestión del caso (abogado)

### Acceso

En el dashboard de abogado, sección "Mis casos" o ruta equivalente. Listado de casos asignados (activos, pendientes, cerrados).

### Información del caso

- **Overview**: Propiedad, partes, oferta aceptada, plazos, estado.
- **Documentos**: Contratos, cartas de intención, certificados, escrituras. Subir, generar o asociar documentos según el tipo de caso.
- **Chat**: Conversación con comprador y vendedor.
- **Tareas**: Seguimiento de hitos (revisión, firma, notaría, etc.).

### Documentos

- Tipos habituales: contrato, promesa, poder, certificado, otros.
- Estados: borrador, pendiente de revisión, aprobado, rechazado, firmado.
- Versionado cuando aplique. Firmas registradas en `signed_by`, `signed_at`.

### Cierre del caso

Cuando se completan trámites, firmas y entrega según el flujo definido, el caso puede marcarse como "completed". Si se cancela la operación, "cancelled".

---

## Para comprador y vendedor

- Recibir notificaciones de avances y documentos.
- Revisar y firmar documentos según indicaciones del abogado.
- Usar el chat del caso para dudas y coordinación.

---

## Resultado

Caso legal tramitado hasta cierre o cancelación. Documentos generados, revisados y firmados según corresponda. Trazabilidad en `case_documents`, `audit_logs` y notificaciones.

## Temas relacionados

- [Negociación](negociacion) — Origen del caso (oferta aceptada)
- [API — Ofertas](../referencia/api/ofertas)
- [Base de datos — Esquema](../referencia/base-de-datos/esquema) — Tablas `cases`, `case_documents`
- [Conceptos](../guia/conceptos) — Casos y documentos legales
