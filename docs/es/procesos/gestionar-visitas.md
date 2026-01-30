# Gestionar visitas

Agendar visitas como comprador y gestionar solicitudes como vendedor.

## Requisitos previos

- Perfil verificado (imprescindible para agendar).
- Propiedad publicada con disponibilidad configurada (para agendar).

---

## Para compradores: agendar una visita

### 1. Localizar la propiedad

Buscar en el catálogo, filtrar por ubicación, precio, tipo, habitaciones, área. Abrir el detalle y comprobar que esté publicada y con visitas disponibles.

### 2. Abrir el modal de agendamiento

En la ficha de la propiedad, usar "Agendar visita". Se abre el modal con calendario y horarios.

### 3. Elegir fecha y hora

- Navegar por meses. Solo se pueden elegir fechas disponibles (según `property_availability` y `blocked_dates`).
- Restricciones típicas: antelación mínima (p. ej. 24 h), no mismo día ni fechas pasadas.
- Tras elegir fecha, elegir hora dentro de los slots ofrecidos.

### 4. Aceptar NDA y pagar

- Leer y aceptar el acuerdo de confidencialidad (NDA). Es obligatorio.
- Realizar el pago de la visita (p. ej. 49.000 COP) por el método disponible (tarjeta, etc.).

### 5. Confirmación

Recibir confirmación por correo y en la plataforma. La visita aparece en "Mis visitas" con estado "pending" hasta que el vendedor confirme.

### 6. Asistir y feedback

Acudir en la fecha y hora acordadas. Tras la visita, se puede enviar feedback y valoración. Según las reglas del sistema, ello puede desbloquear documentos adicionales de la propiedad.

---

## Para vendedores: gestionar solicitudes

### 1. Recibir la solicitud

Llegan notificación por email y en la app. Incluyen: propiedad, comprador, fecha y hora solicitada, datos de contacto.

### 2. Revisar en el dashboard

En "Visitas" o "Visitas pendientes" aparecen las solicitudes. Revisar perfil del comprador, verificación y que la fecha/hora esté dentro de la disponibilidad configurada.

### 3. Decidir acción

- **Confirmar**: Aceptar fecha y hora. El comprador recibe confirmación.
- **Rechazar**: Indicar motivo si se desea. El comprador recibe notificación.
- **Reagendar**: Proponer otra fecha u hora. El comprador puede aceptar o rechazar.

### 4. Coordinación y realización

Tras confirmar, coordinar logística (dirección, acceso). Después de la visita, añadir notas internas si aplica. El visitante puede dejar feedback y valoración.

### 5. Desbloqueo de documentos

Si está configurado, al completar la visita y, en su caso, recibir feedback, se desbloquean documentos adicionales para el visitante.

---

## Resultado

- **Comprador**: Visita agendada, confirmada y (opcionalmente) completada con feedback; posible acceso a más documentos.
- **Vendedor**: Solicitudes confirmadas, rechazadas o reagendadas; historial de visitas por propiedad.

## Temas relacionados

- [Negociación](negociacion) — Ofertas tras la visita
- [API — Visitas](../referencia/api/visitas)
- [Conceptos](../guia/conceptos) — Visitas
