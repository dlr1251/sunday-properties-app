# ADR-002: Cálculo de VPN (NPV)

**Estado** | Aceptado  
**Fecha** | 2024-11-02  
**Contexto** | Necesidad de calcular el valor presente neto de las ofertas para apoyar decisiones de negociación.

## Contexto

No existía un mecanismo cuantitativo para comparar ofertas. Los vendedores no podían evaluar de forma consistente el tiempo al cierre, el riesgo de pago, las condiciones especiales y el valor económico total.

## Decisión

Implementar el **cálculo de VPN en base de datos** (función SQL), con:

- Ajustes por método de pago (efectivo, financiación, cripto).
- Valor temporal del dinero según fecha de cierre.
- Ajustes de riesgo por método de pago y contingencias.
- Impacto en VPN de cada condición estructurada.
- Ajuste por inflación para plazos largos (p. ej. > 90 días).

## Alternativas consideradas

- **Cálculo en cliente**: Flexible, pero duplicación de lógica, rendimiento y riesgos de seguridad.
- **Cálculo en base de datos**: Rápido, coherente y seguro; menos flexible para cambiar reglas sin migraciones.
- **Servicio separado**: Aislado y testeable; overhead de red y más complejidad operativa.

## Consecuencias

**Positivas**: Cálculos rápidos, resultados coherentes, ejecución segura, recálculo automático ante cambios.

**Negativas**: Complejidad SQL, pruebas más costosas, reglas de cálculo más fijas.

## Referencias

- `supabase/migrations/20241102000002_create_npv_calculation.sql`
- `src/services/npvCalculation.service.ts` (o equivalente)
- [Base de datos — Funciones](../referencia/base-de-datos/funciones)
- [API — Ofertas](../referencia/api/ofertas)
