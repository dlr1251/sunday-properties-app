# Negociación

Flujo de ofertas, contraofertas y cierre.

## Requisitos previos

- Perfil verificado.
- Propiedad visitada (recomendado) antes de ofertar.
- Para crear contraofertas: ser vendedor de la propiedad o comprador que recibió la contraoferta.

---

## Crear una oferta (comprador)

### 1. Acceder al formulario

En la página de la propiedad, usar "Hacer una oferta" o la sección de negociación. Se abre el formulario de oferta (SmartOfferForm).

### 2. Completar datos

- **Precio**: Monto en COP. El sistema valida contra precio de venta, precio mínimo y reglas de negociación. Indicadores visuales informan si la oferta está dentro de rango, en el límite o por debajo.
- **Método de pago**: Efectivo, financiamiento, criptomonedas o mixto. Si hay financiamiento, indicar cuota inicial, plazo y, si aplica, entidad.
- **Fecha de cierre**: Fecha objetivo de cierre. Debe respetar el plazo máximo configurado por el vendedor; si no, la oferta puede rechazarse.
- **Condiciones**: Condiciones adicionales (texto o estructuradas según el modelo de condiciones). Opcional.

### 3. Revisar y enviar

Revisar validación automática y mensajes del sistema. Enviar la oferta. Pasa a estado "pending". El vendedor recibe notificación.

---

## Gestionar ofertas y contraofertas (vendedor)

### 1. Recibir y revisar oferta

Notificación por email y en la app. Revisar en "Ofertas recibidas" o en la ficha de la propiedad: precio, método de pago, plazo, condiciones, perfil del comprador.

### 2. Decidir acción

- **Aceptar**: La oferta y condiciones son aceptables. Se inicia el proceso legal; se asigna abogado y se crea el caso. Todas las partes reciben notificación.
- **Rechazar**: No hay interés en negociar. Opcionalmente indicar motivo. El comprador recibe notificación.
- **Contraoferta**: Ajustar precio, condiciones o plazos. Crear contraoferta con los nuevos términos. El comprador recibe notificación y puede aceptar, rechazar o contraofertar de nuevo.

### 3. Contraofertas sucesivas

El ciclo puede repetirse hasta acuerdo o rechazo. Cada contraoferta queda registrada en el historial de la oferta.

---

## Responder a una contraoferta (comprador)

### 1. Recibir contraoferta

Notificación con los nuevos términos propuestos por el vendedor.

### 2. Decidir

- **Aceptar**: Se cierra el acuerdo. Arranca el proceso legal (caso, abogado, documentos).
- **Rechazar**: Se da por terminada la negociación por esa oferta.
- **Nueva contraoferta**: Enviar otra propuesta. El vendedor vuelve a evaluar.

---

## Cierre y proceso legal

Al aceptar una oferta o contraoferta:

- Se crea un **caso legal** vinculado a la oferta, propiedad, comprador y vendedor.
- Se asigna un **abogado** (automático o manual según configuración).
- Se crea un **chat** del caso y se notifica a las partes.
- Se inician **documentos** (contratos, cartas de intención, etc.). Ver [Cierre legal](cierre-legal).

---

## Resultado

Negociación cerrada por aceptación o por rechazo. Si hay aceptación, el flujo continúa en el proceso legal hasta firma y cierre de la transacción.

## Temas relacionados

- [Cierre legal](cierre-legal) — Casos y documentos
- [API — Ofertas](../referencia/api/ofertas)
- [Conceptos](../guia/conceptos) — Ofertas y negociación
