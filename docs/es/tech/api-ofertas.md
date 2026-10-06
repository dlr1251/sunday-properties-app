# API — Ofertas

Acceso a ofertas, contraofertas y condiciones estructuradas mediante Supabase y servicios asociados.

## Resumen

| Campo | Valor |
|-------|--------|
| Tipo | Tablas `offers`, `counter_offers`, `offer_conditions` + repos y servicios |
| Repositorio | `src/lib/db/repositories/offers.repo.ts` |
| Condiciones | `src/services/offerConditions.service.ts` |

## Tablas

### `offers`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `property_id` | UUID | FK a `properties` |
| `buyer_id` | UUID | FK a `profiles` |
| `agent_id` | UUID | FK a `profiles` (opcional) |
| `offer_price` | bigint | Precio ofertado |
| `payment_method` | enum | `cash`, `bank_transfer`, `crypto` |
| `financing_details` | jsonb | Detalle de financiación |
| `conditions` | text[] | Condiciones en texto (legacy) |
| `closing_date` | date | Fecha de cierre propuesta |
| `status` | enum | `pending`, `accepted`, `rejected`, `countered`, `expired`, `cancelled` |
| `calculated_npv`, `risk_adjusted_npv` | numeric | VPN calculado |
| `created_at`, `updated_at` | timestamptz | Auditoría |

### `counter_offers`

Contraofertas asociadas a una oferta. Incluyen precio, condiciones y estado.

### `offer_conditions`

Condiciones estructuradas por oferta: tipo, valor, impacto en VPN, estado (`proposed`, `accepted`, `rejected`, `countered`, `withdrawn`).

## OffersRepository

### Por propiedad

```typescript
import { offersRepository } from '@/lib/db/repositories/offers.repo';

const result = await offersRepository.getOffersByProperty(propertyId, {
  status: 'pending',
  buyerId: userId,
});
// Result<Offer[], AppError>
```

### Por comprador

```typescript
const result = await offersRepository.getOffersByBuyer(userId, filters);
```

### Crear oferta

Se usa el esquema de validación `CreateOfferInput` (Zod). El repositorio o el flujo de negocio insertan en `offers` y, si aplica, crean `offer_conditions` vía el servicio de condiciones.

### Contraofertas y cambio de estado

Métodos para crear contraofertas, aceptar, rechazar y actualizar estado. La lógica puede disparar notificaciones y actualizar VPN.

## Offer Conditions Service

Servicio para condiciones estructuradas:

```typescript
import { offerConditionsService } from '@/services/offerConditions.service';

// Crear condición
const result = await offerConditionsService.createCondition({
  offerId,
  conditionType: 'inspection_contingency',
  conditionKey: 'inspection_contingency',
  conditionValue: { days: 15, required: true },
  conditionDisplayText: 'Inspección técnica en 15 días',
  proposedBy: 'buyer',
  proposerUserId: user.id,
  riskImpact: 15,
  priority: 80,
});

// Por oferta
const conditions = await offerConditionsService.getConditionsByOffer(offerId);

// Actualizar estado
await offerConditionsService.updateConditionStatus({
  conditionId,
  status: 'accepted',
  notes: 'Aceptado por vendedor',
});
```

Tipos de condición típicos: `inspection_contingency`, `financing_contingency`, `notary_costs`, etc.

## Cálculo de VPN

El cálculo de VPN (NPV) se implementa en servicios y/o funciones SQL. Los resultados se persisten en `offers` (`calculated_npv`, `risk_adjusted_npv`, `npv_breakdown`).

## Temas relacionados

- [Esquema de base de datos](db-schema) — `offers`, `counter_offers`, `offer_conditions`
- [Conceptos](concepts) — Ofertas y negociación
