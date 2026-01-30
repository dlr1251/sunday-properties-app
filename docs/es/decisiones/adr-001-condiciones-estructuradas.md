# ADR-001: Condiciones estructuradas

**Estado** | Aceptado  
**Fecha** | 2024-11-02  
**Contexto** | Sustituir condiciones en TEXT[] por un modelo estructurado, versionable y con impacto en VPN.

## Contexto

Las condiciones de las ofertas se almacenaban en un array TEXT[] sin estructura, versionado ni análisis de impacto. No se podía negociar por condición, seguir cambios en el tiempo ni calcular su efecto sobre el valor del negocio.

## Decisión

Implementar un modelo de **condiciones estructuradas** donde cada aspecto de la oferta es una entidad de primera clase: tipo (inspección, financiación, costos notariales, etc.), versionado y relación padre-hijo, impacto en VPN y riesgo, validación de interdependencias y estado (propuesta, aceptada, rechazada, contraofertada, retirada).

## Alternativas consideradas

- **Mantener TEXT[]**: Simple y compatible, pero sin negociación granular ni análisis.
- **Híbrido (TEXT[] + tabla de condiciones)**: Migración gradual, a costa de duplicación y complejidad.
- **Modelo estructurado con soporte dual**: Arquitectura clara y compatible con lo existente; mayor esfuerzo de implementación.

## Consecuencias

**Positivas**: Negociación rica por condición, análisis de impacto, mejor UX, base para funcionalidades avanzadas.

**Negativas**: Mayor complejidad, más tiempo de desarrollo, migraciones y mantenimiento del modo dual.

## Referencias

- `supabase/migrations/20241102000001_create_offer_conditions.sql`
- `src/services/offerConditions.service.ts`
- `src/components/negotiation/StructuredConditionsEditor` (o equivalente)
- [API — Ofertas](../referencia/api/ofertas)
- [Base de datos — Funciones](../referencia/base-de-datos/funciones)
