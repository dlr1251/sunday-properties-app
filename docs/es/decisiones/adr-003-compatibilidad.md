# ADR-003: Estrategia de compatibilidad hacia atrás

**Estado** | Aceptado  
**Fecha** | 2024-11-02  
**Contexto** | Refactorizar el sistema de ofertas sin romper datos ni funcionalidad existente.

## Contexto

Los datos en producción usan condiciones en TEXT[]. No se puede romper el comportamiento actual, perder datos, forzar una migración masiva ni interrumpir negociaciones activas.

## Decisión

**Soporte dual**:

1. Las condiciones legacy (TEXT[]) se conservan.
2. Las condiciones estructuradas operan en paralelo.
3. Feature flags deciden qué modo está activo.
4. La migración de datos es opcional y gradual.

## Alternativas consideradas

- **Romper compatibilidad y migrar todo**: Arquitectura limpia, pero riesgo alto y disrupción.
- **Modo dual indefinido**: Sin riesgo inmediato, pero deuda técnica permanente.
- **Periodo de transición y deprecación**: Equilibrio entre ambos; exige planificación.

## Consecuencias

**Positivas**: Despliegue sin downtime, transición gradual, posibilidad de A/B testing y adopción progresiva.

**Negativas**: Mayor complejidad, dos rutas de código, presión para migrar y deuda técnica durante la transición.

## Referencias

- `src/lib/featureFlags.ts`
- `src/lib/db/repositories/offers.repo.ts`
- `src/contexts/FeatureFlagsContext.tsx` (o equivalente)
- [ADR-001 — Condiciones estructuradas](adr-001-condiciones-estructuradas)
