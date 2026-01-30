# Base de datos — Funciones

Funciones y triggers SQL relevantes para la aplicación.

## Resumen

Funciones en migraciones como `20240101000002_03_functions_triggers.sql`, `20241102000002_create_npv_calculation.sql` y otras. Se usan para validación, notificaciones, auditoría y cálculos (p. ej. VPN).

## Cálculo de VPN (NPV)

### `calculate_offer_npv`

Calcula el valor presente neto de una oferta.

```sql
FUNCTION calculate_offer_npv(
  p_offer_id UUID,
  p_base_discount_rate DECIMAL DEFAULT 0.10
)
RETURNS TABLE (
  npv DECIMAL,
  adjusted_value DECIMAL,
  risk_adjusted_npv DECIMAL,
  breakdown JSONB
)
```

**Uso:**

```sql
SELECT * FROM calculate_offer_npv('offer-uuid', 0.12);
```

`breakdown` incluye ajustes por método de pago, tiempo, riesgo y condiciones.

### `calculate_discount_factor`

Factor de descuento para valoración en el tiempo:

```sql
FUNCTION calculate_discount_factor(days INTEGER, annual_rate DECIMAL DEFAULT 0.10)
RETURNS DECIMAL
```

Fórmula: `(1 + rate)^(-days/365)`.

### Trigger `trigger_calculate_offer_npv`

Se ejecuta tras `INSERT` o `UPDATE` en `offers` cuando cambian `offer_price`, `payment_method`, `closing_date` o `financing_details`. Actualiza `calculated_npv`, `risk_adjusted_npv` y `npv_breakdown` si el feature flag de VPN está activo.

## Otras funciones y triggers

- **Validación de ofertas**: Reglas de negocio (precio mínimo, plazos, métodos de pago) aplicadas en DB o desde servicios.
- **Notificaciones**: Triggers que insertan en `notifications` ante eventos (nueva oferta, contraoferta, cambio de estado).
- **Auditoría**: Triggers que escriben en `audit_logs` para cambios relevantes.
- **Offer conditions**: Lógica asociada a `offer_conditions` (interdependencias, estados). Ver migraciones y [ADR-001](../../decisiones/adr-001-condiciones-estructuradas).

Los nombres exactos y parámetros figuran en las migraciones en `supabase/migrations/`.

## Feature flags

Varias funciones (p. ej. cálculo de VPN) comprueban `platform_settings` o flags similares antes de ejecutar. Permite activar o desactivar comportamiento sin cambiar código.

## Temas relacionados

- [Esquema](esquema)
- [ADR-002 — Cálculo VPN](../../decisiones/adr-002-calculo-vpn)
- [API — Ofertas](../api/ofertas)
