# Tareas: Refactorización Módulo de Negociación Ontológico

> Este archivo contiene todas las tareas derivadas del plan de refactorización para importar en Linear

## FASE 1: Fundamentos e Infraestructura (Semanas 1-2)

### 1.1 Sistema de Feature Flags

**Epic**: Feature Flags Infrastructure

#### Tareas Backend
- [ ] **FLAG-001**: Crear tabla `feature_flags` en base de datos
  - Descripción: Migración SQL para crear tabla de feature flags con campos: id, flag_name, enabled_globally, enabled_for_users, enabled_for_roles, metadata, timestamps
  - Estimación: 2 horas
  - Archivo: `supabase/migrations/20241102000000_add_feature_flags.sql`
  
- [ ] **FLAG-002**: Crear enum `FeatureFlag` en TypeScript
  - Descripción: Definir enum con valores: STRUCTURED_CONDITIONS, NPV_CALCULATION, ENHANCED_LAWYER_WORKFLOW, LEGAL_DATA_EXTRACTION
  - Estimación: 1 hora
  - Archivo: `src/lib/featureFlags.ts`

- [ ] **FLAG-003**: Implementar `FeatureFlagService` class
  - Descripción: Clase con métodos: isEnabled(), enableForUser(), enableGlobally()
  - Estimación: 2 horas
  - Archivo: `src/lib/featureFlags.ts`
  - Dependencias: FLAG-001

- [ ] **FLAG-004**: Crear `FeatureFlagsContext` provider
  - Descripción: Context provider de React para acceso a feature flags en frontend
  - Estimación: 2 horas
  - Archivo: `src/contexts/FeatureFlagsContext.tsx`
  - Dependencias: FLAG-003

### 1.2 Tabla de Condiciones Estructuradas

**Epic**: Structured Conditions Database Schema

#### Tareas Base de Datos
- [ ] **COND-001**: Crear tipos ENUM para condiciones
  - Descripción: condition_type, condition_status, condition_proposer
  - Estimación: 1 hora
  - Archivo: `supabase/migrations/20241102000001_create_offer_conditions.sql`

- [ ] **COND-002**: Crear tabla `offer_conditions` completa
  - Descripción: Tabla con todos los campos: id, offer_id, parent_condition_id, condition_type, condition_key, condition_value (JSONB), condition_display_text, status, proposed_by, proposer_user_id, npv_impact, risk_impact, priority, notes, metadata, version, superseded_by, timestamps
  - Estimación: 3 horas
  - Archivo: `supabase/migrations/20241102000001_create_offer_conditions.sql`
  - Dependencias: COND-001

- [ ] **COND-003**: Crear índices para `offer_conditions`
  - Descripción: Índices en: offer_id, condition_type, status, parent_condition_id, proposer_user_id
  - Estimación: 1 hora
  - Archivo: `supabase/migrations/20241102000001_create_offer_conditions.sql`
  - Dependencias: COND-002

- [ ] **COND-004**: Implementar RLS policies para `offer_conditions`
  - Descripción: Policies para SELECT, INSERT, UPDATE basadas en participación en la oferta
  - Estimación: 2 horas
  - Archivo: `supabase/migrations/20241102000001_create_offer_conditions.sql`
  - Dependencias: COND-002

### 1.3 Función SQL para Cálculo VPN

**Epic**: NPV Calculation Engine

#### Tareas Base de Datos
- [ ] **NPV-001**: Crear función helper `calculate_discount_factor`
  - Descripción: Función SQL para calcular factor de descuento basado en días y tasa anual
  - Estimación: 1 hora
  - Archivo: `supabase/migrations/20241102000002_create_npv_calculation.sql`

- [ ] **NPV-002**: Implementar función principal `calculate_offer_npv`
  - Descripción: Función SQL completa que calcula VPN considerando: payment method, time value, risk, conditions, inflation
  - Estimación: 6 horas
  - Archivo: `supabase/migrations/20241102000002_create_npv_calculation.sql`
  - Dependencias: NPV-001, COND-002

- [ ] **NPV-003**: Añadir columnas NPV a tabla `offers`
  - Descripción: Agregar campos: calculated_npv, risk_adjusted_npv, npv_breakdown, npv_calculated_at
  - Estimación: 1 hora
  - Archivo: `supabase/migrations/20241102000002_create_npv_calculation.sql`

- [ ] **NPV-004**: Crear trigger `trigger_calculate_offer_npv`
  - Descripción: Trigger que auto-calcula NPV cuando se inserta/actualiza oferta (solo si feature flag habilitado)
  - Estimación: 2 horas
  - Archivo: `supabase/migrations/20241102000002_create_npv_calculation.sql`
  - Dependencias: NPV-002, NPV-003, FLAG-001

### 1.4 Script de Migración de Datos

**Epic**: Data Migration from Legacy

#### Tareas Backend
- [ ] **MIGR-001**: Crear script de migración de condiciones legacy
  - Descripción: Script Node.js que convierte condiciones TEXT[] a offer_conditions estructuradas
  - Estimación: 4 horas
  - Archivo: `scripts/migrate-legacy-conditions.js`
  - Dependencias: COND-002

- [ ] **MIGR-002**: Implementar parser de condiciones legacy
  - Descripción: Función parseCondition() que identifica tipos de condiciones desde texto libre
  - Estimación: 2 horas
  - Archivo: `scripts/migrate-legacy-conditions.js`
  - Dependencias: MIGR-001

### 1.5 Testing Infrastructure

**Epic**: Testing Setup

#### Tareas Testing
- [ ] **TEST-001**: Crear fixtures de ofertas para testing
  - Descripción: Archivo con datos de prueba para ofertas con diferentes escenarios
  - Estimación: 2 horas
  - Archivo: `src/test/fixtures/offers.ts`

- [ ] **TEST-002**: Crear tests de integración para condiciones estructuradas
  - Descripción: Tests que validan creación, actualización, negociación de condiciones
  - Estimación: 3 horas
  - Archivo: `src/test/integration/offer-conditions.test.ts`
  - Dependencias: COND-002

- [ ] **TEST-003**: Crear tests de integración para cálculo VPN
  - Descripción: Tests que validan cálculo VPN con diferentes escenarios (payment methods, fechas, condiciones)
  - Estimación: 3 horas
  - Archivo: `src/test/integration/npv-calculation.test.ts`
  - Dependencias: NPV-002

- [ ] **TEST-004**: Crear tests para feature flags
  - Descripción: Tests que validan activación/desactivación de feature flags
  - Estimación: 1 hora
  - Archivo: `src/test/integration/feature-flags.test.ts`
  - Dependencias: FLAG-003

---

## FASE 2: Servicios y Lógica de Negocio (Semanas 3-5)

### 2.1 Servicio de Condiciones Estructuradas

**Epic**: Offer Conditions Service

#### Tareas Backend
- [ ] **SVC-001**: Definir interfaces TypeScript para condiciones
  - Descripción: OfferCondition, CreateConditionInput, ConditionTemplate, ValidationResult
  - Estimación: 1 hora
  - Archivo: `src/services/offerConditions.service.ts`

- [ ] **SVC-002**: Implementar método `createCondition`
  - Descripción: Crear condición con validación de interdependencias y cálculo de NPV impact
  - Estimación: 3 horas
  - Archivo: `src/services/offerConditions.service.ts`
  - Dependencias: SVC-001, COND-002

- [ ] **SVC-003**: Implementar método `getConditionsByOffer`
  - Descripción: Obtener todas las condiciones de una oferta
  - Estimación: 1 hora
  - Archivo: `src/services/offerConditions.service.ts`
  - Dependencias: SVC-001

- [ ] **SVC-004**: Implementar método `updateConditionStatus`
  - Descripción: Actualizar status de condición (accept/reject/counter)
  - Estimación: 2 horas
  - Archivo: `src/services/offerConditions.service.ts`
  - Dependencias: SVC-001

- [ ] **SVC-005**: Implementar método `counterCondition`
  - Descripción: Crear contraoferta de una condición (nueva versión vinculada a la original)
  - Estimación: 2 horas
  - Archivo: `src/services/offerConditions.service.ts`
  - Dependencias: SVC-001

- [ ] **SVC-006**: Implementar método `calculateConditionNPVImpact`
  - Descripción: Calcular impacto en VPN de una condición específica
  - Estimación: 3 horas
  - Archivo: `src/services/offerConditions.service.ts`
  - Dependencias: SVC-001, NPV-002

- [ ] **SVC-007**: Implementar método `getConditionHistory`
  - Descripción: Obtener historial completo de versiones de una condición
  - Estimación: 2 horas
  - Archivo: `src/services/offerConditions.service.ts`
  - Dependencias: SVC-001

- [ ] **SVC-008**: Implementar método `validateConditionInterdependencies`
  - Descripción: Validar reglas de interdependencia entre condiciones (fechas, duplicados, etc.)
  - Estimación: 4 horas
  - Archivo: `src/services/offerConditions.service.ts`
  - Dependencias: SVC-001

- [ ] **SVC-009**: Implementar método `getConditionTemplates`
  - Descripción: Obtener plantillas de condiciones según tipo de propiedad
  - Estimación: 2 horas
  - Archivo: `src/services/offerConditions.service.ts`
  - Dependencias: SVC-001

### 2.2 NPV Calculation Service

**Epic**: NPV Calculation Service Layer

#### Tareas Backend
- [ ] **NPVC-001**: Definir interfaces TypeScript para NPV
  - Descripción: NPVCalculationResult, NPVBreakdown, NPVComparison, NPVScenario
  - Estimación: 1 hora
  - Archivo: `src/services/npvCalculation.service.ts`

- [ ] **NPVC-002**: Implementar método `calculateOfferNPV`
  - Descripción: Wrapper TypeScript que llama a función SQL calculate_offer_npv
  - Estimación: 2 horas
  - Archivo: `src/services/npvCalculation.service.ts`
  - Dependencias: NPVC-001, NPV-002

- [ ] **NPVC-003**: Implementar método `calculateConditionImpact`
  - Descripción: Calcular impacto en VPN de una condición individual
  - Estimación: 3 horas
  - Archivo: `src/services/npvCalculation.service.ts`
  - Dependencias: NPVC-001

- [ ] **NPVC-004**: Implementar método `compareOffersNPV`
  - Descripción: Comparar VPN de múltiples ofertas
  - Estimación: 2 horas
  - Archivo: `src/services/npvCalculation.service.ts`
  - Dependencias: NPVC-002

- [ ] **NPVC-005**: Implementar método `simulateNPVScenarios`
  - Descripción: Simular NPV con diferentes escenarios (what-if analysis)
  - Estimación: 3 horas
  - Archivo: `src/services/npvCalculation.service.ts`
  - Dependencias: NPVC-002

- [ ] **NPVC-006**: Implementar método `getNPVSensitivity`
  - Descripción: Análisis de sensibilidad del VPN a cambios en parámetros
  - Estimación: 3 horas
  - Archivo: `src/services/npvCalculation.service.ts`
  - Dependencias: NPVC-002

### 2.3 Abstraction Layer para Dual-Mode

**Epic**: Backward Compatibility Layer

#### Tareas Backend
- [ ] **DUAL-001**: Modificar `OffersRepository` para soporte dual-mode
  - Descripción: Añadir método getOfferWithConditions() que retorna formato según feature flag
  - Estimación: 3 horas
  - Archivo: `src/lib/db/repositories/offers.repo.ts`
  - Dependencias: FLAG-003, SVC-003

- [ ] **DUAL-002**: Implementar método `createOfferWithConditions`
  - Descripción: Crear oferta con condiciones estructuradas si feature flag habilitado, sino usar legacy
  - Estimación: 3 horas
  - Archivo: `src/lib/db/repositories/offers.repo.ts`
  - Dependencias: DUAL-001, SVC-002

- [ ] **DUAL-003**: Asegurar backward compatibility en métodos existentes
  - Descripción: Verificar que métodos legacy sigan funcionando sin feature flags
  - Estimación: 2 horas
  - Archivo: `src/lib/db/repositories/offers.repo.ts`
  - Dependencias: DUAL-001

### 2.4 Extender Lawyer Assignment Trigger

**Epic**: Enhanced Lawyer Assignment

#### Tareas Base de Datos
- [ ] **LAWYER-001**: Modificar función `assign_lawyer_on_offer_acceptance`
  - Descripción: Extender para asignar abogado también en contraofertas (status='countered') y cuando se contraofrece una condición
  - Estimación: 4 horas
  - Archivo: `supabase/migrations/20241103000000_extend_lawyer_assignment.sql`
  - Dependencias: COND-002

- [ ] **LAWYER-002**: Crear trigger en `offer_conditions` para asignación de abogado
  - Descripción: Trigger que actualiza oferta cuando condición es contraofertada, disparando asignación de abogado
  - Estimación: 2 horas
  - Archivo: `supabase/migrations/20241103000000_extend_lawyer_assignment.sql`
  - Dependencias: LAWYER-001

---

## FASE 3: Frontend y Experiencia de Usuario (Semanas 6-8)

### 3.1 Componente de Condiciones Estructuradas

**Epic**: Structured Conditions UI

#### Tareas Frontend
- [ ] **UI-001**: Crear componente `StructuredConditionsEditor`
  - Descripción: Componente principal para visualizar y gestionar condiciones estructuradas
  - Estimación: 4 horas
  - Archivo: `src/components/negotiation/StructuredConditionsEditor.tsx`
  - Dependencias: SVC-003

- [ ] **UI-002**: Implementar carga y visualización de condiciones
  - Descripción: Cargar condiciones desde servicio y mostrar en cards con status, NPV impact, risk
  - Estimación: 3 horas
  - Archivo: `src/components/negotiation/StructuredConditionsEditor.tsx`
  - Dependencias: UI-001, SVC-003

- [ ] **UI-003**: Implementar acciones de condición (aceptar/rechazar/contraofertar)
  - Descripción: Botones y handlers para aceptar, rechazar o contraofertar condiciones
  - Estimación: 3 horas
  - Archivo: `src/components/negotiation/StructuredConditionsEditor.tsx`
  - Dependencias: UI-002, SVC-004, SVC-005

- [ ] **UI-004**: Implementar diálogo para añadir nueva condición
  - Descripción: Modal/formulario para crear nueva condición con templates y validación
  - Estimación: 4 horas
  - Archivo: `src/components/negotiation/AddConditionDialog.tsx`
  - Dependencias: UI-001, SVC-002, SVC-009

- [ ] **UI-005**: Implementar visualización de historial de condición
  - Descripción: Componente para mostrar versiones previas de una condición (historial de negociación)
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/ConditionHistoryDialog.tsx`
  - Dependencias: UI-001, SVC-007

- [ ] **UI-006**: Implementar helpers y utilidades para UI de condiciones
  - Descripción: Funciones helper: getConditionTypeLabel(), getStatusLabel(), getStatusVariant(), getProposerLabel()
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/conditionUtils.ts`
  - Dependencias: UI-001

### 3.2 NPV Calculator Widget

**Epic**: NPV Visualization Widget

#### Tareas Frontend
- [ ] **NPVW-001**: Crear componente `NPVCalculatorWidget`
  - Descripción: Widget que muestra VPN calculado con desglose visual
  - Estimación: 3 horas
  - Archivo: `src/components/negotiation/NPVCalculatorWidget.tsx`
  - Dependencias: NPVC-002

- [ ] **NPVW-002**: Implementar visualización de VPN principal y ajustes
  - Descripción: Mostrar VPN, valor ajustado, VPN ajustado por riesgo con formato de moneda
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/NPVCalculatorWidget.tsx`
  - Dependencias: NPVW-001

- [ ] **NPVW-003**: Implementar desglose detallado de ajustes
  - Descripción: Mostrar breakdown: base value, payment method adjustment, time adjustment, risk adjustment, conditions adjustment, inflation adjustment
  - Estimación: 3 horas
  - Archivo: `src/components/negotiation/NPVCalculatorWidget.tsx`
  - Dependencias: NPVW-002

- [ ] **NPVW-004**: Implementar indicador de confianza del cálculo
  - Descripción: Progress bar y porcentaje de confianza del cálculo VPN
  - Estimación: 1 hora
  - Archivo: `src/components/negotiation/NPVCalculatorWidget.tsx`
  - Dependencias: NPVW-001

### 3.3 Actualizar SmartOfferForm

**Epic**: Enhanced Offer Form

#### Tareas Frontend
- [ ] **FORM-001**: Integrar feature flag check en `SmartOfferForm`
  - Descripción: Verificar si structured_conditions está habilitado y mostrar/seguir sección correspondiente
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/SmartOfferForm.tsx`
  - Dependencias: FLAG-004

- [ ] **FORM-002**: Integrar `StructuredConditionsEditor` en formulario
  - Descripción: Añadir sección de condiciones estructuradas al formulario de oferta
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/SmartOfferForm.tsx`
  - Dependencias: FORM-001, UI-001

- [ ] **FORM-003**: Actualizar handler de submit para condiciones estructuradas
  - Descripción: Modificar handleSubmit para usar createOfferWithConditions() si feature flag habilitado
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/SmartOfferForm.tsx`
  - Dependencias: FORM-002, DUAL-002

- [ ] **FORM-004**: Integrar `NPVCalculatorWidget` en formulario
  - Descripción: Mostrar widget de VPN en tiempo real mientras se completa el formulario
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/SmartOfferForm.tsx`
  - Dependencias: FORM-002, NPVW-001

### 3.4 Panel de Comparación Mejorado

**Epic**: Enhanced Offer Comparison

#### Tareas Frontend
- [ ] **COMP-001**: Integrar comparación por VPN en `OfferComparisonPanel`
  - Descripción: Añadir columna que muestre VPN de cada oferta en el panel de comparación
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/OfferComparisonPanel.tsx`
  - Dependencias: NPVC-004

- [ ] **COMP-002**: Implementar ordenamiento por VPN
  - Descripción: Permitir ordenar ofertas por VPN (ascendente/descendente)
  - Estimación: 1 hora
  - Archivo: `src/components/negotiation/OfferComparisonPanel.tsx`
  - Dependencias: COMP-001

- [ ] **COMP-003**: Mostrar desglose de VPN en tooltip o expandible
  - Descripción: Mostrar breakdown detallado al hover o click en VPN
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/OfferComparisonPanel.tsx`
  - Dependencias: COMP-001

### 3.5 Actualizar CounterOfferDialog

**Epic**: Enhanced Counter Offer Dialog

#### Tareas Frontend
- [ ] **COUNTER-001**: Integrar condiciones estructuradas en `CounterOfferDialog`
  - Descripción: Permitir negociar condiciones individuales desde el diálogo de contraoferta
  - Estimación: 3 horas
  - Archivo: `src/components/negotiation/CounterOfferDialog.tsx`
  - Dependencias: UI-001, SVC-005

- [ ] **COUNTER-002**: Mostrar VPN actualizado en contraoferta
  - Descripción: Mostrar widget de VPN que se actualiza en tiempo real al modificar condiciones
  - Estimación: 2 horas
  - Archivo: `src/components/negotiation/CounterOfferDialog.tsx`
  - Dependencias: COUNTER-001, NPVW-001

---

## FASE 4: Testing, Documentación y Rollout (Semanas 9-12)

### 4.1 Testing Exhaustivo

**Epic**: Comprehensive Testing

#### Tareas Testing
- [ ] **E2E-001**: Test E2E: Flujo completo de oferta con condiciones estructuradas
  - Descripción: Test que valida crear oferta, añadir condiciones, calcular VPN, contraoferta, aceptar/rechazar
  - Estimación: 4 horas
  - Archivo: `test/e2e/structured-conditions.spec.ts`
  - Dependencias: UI-001, SVC-002, NPVW-001

- [ ] **E2E-002**: Test E2E: Dual-mode operation
  - Descripción: Test que valida crear ofertas con feature flag OFF (legacy) y ON (structured)
  - Estimación: 3 horas
  - Archivo: `test/e2e/dual-mode-operation.spec.ts`
  - Dependencias: DUAL-002, FLAG-003

- [ ] **E2E-003**: Test E2E: Lawyer assignment en diferentes escenarios
  - Descripción: Test que valida asignación de abogado en: aceptación, contraoferta, counter de condición
  - Estimación: 3 horas
  - Archivo: `test/e2e/lawyer-assignment.spec.ts`
  - Dependencias: LAWYER-001, LAWYER-002

- [ ] **E2E-004**: Test E2E: NPV calculation con diferentes escenarios
  - Descripción: Test que valida cálculo VPN con diferentes payment methods, fechas, condiciones
  - Estimación: 3 horas
  - Archivo: `test/e2e/npv-calculation.spec.ts`
  - Dependencias: NPV-002, NPVC-002

- [ ] **E2E-005**: Test E2E: Validación de interdependencias de condiciones
  - Descripción: Test que valida que se rechacen condiciones que violan reglas de interdependencia
  - Estimación: 2 horas
  - Archivo: `test/e2e/condition-interdependencies.spec.ts`
  - Dependencias: SVC-008

- [ ] **INT-001**: Suite de tests de integración completa
  - Descripción: Ejecutar y validar todos los tests de integración (TEST-002, TEST-003, TEST-004)
  - Estimación: 2 horas
  - Dependencias: TEST-002, TEST-003, TEST-004

### 4.2 Documentación

**Epic**: Documentation

#### Tareas Documentación
- [ ] **DOC-001**: Crear ADR: Structured Conditions Model
  - Descripción: Architecture Decision Record explicando decisión de modelo de condiciones estructuradas
  - Estimación: 2 horas
  - Archivo: `docs/adr/001-structured-conditions-model.md`

- [ ] **DOC-002**: Crear ADR: NPV Calculation Approach
  - Descripción: Architecture Decision Record explicando enfoque de cálculo VPN (SQL function vs TypeScript)
  - Estimación: 2 horas
  - Archivo: `docs/adr/002-npv-calculation-approach.md`

- [ ] **DOC-003**: Crear ADR: Backward Compatibility Strategy
  - Descripción: Architecture Decision Record explicando estrategia de compatibilidad hacia atrás
  - Estimación: 2 horas
  - Archivo: `docs/adr/003-backward-compatibility-strategy.md`

- [ ] **DOC-004**: Documentar API de condiciones estructuradas
  - Descripción: Documentación completa de endpoints y métodos del servicio de condiciones
  - Estimación: 3 horas
  - Archivo: `docs/api/offer-conditions-api.md`
  - Dependencias: SVC-002, SVC-003, SVC-004, SVC-005

- [ ] **DOC-005**: Documentar API de cálculo VPN
  - Descripción: Documentación completa de métodos y parámetros del servicio de VPN
  - Estimación: 2 horas
  - Archivo: `docs/api/npv-calculation-api.md`
  - Dependencias: NPVC-002, NPVC-004

- [ ] **DOC-006**: Documentar schema de base de datos de condiciones
  - Descripción: Documentación detallada de tabla offer_conditions, tipos, índices, constraints
  - Estimación: 2 horas
  - Archivo: `docs/database/offer-conditions-schema.md`
  - Dependencias: COND-002

- [ ] **DOC-007**: Documentar funciones SQL de VPN
  - Descripción: Documentación de funciones calculate_offer_npv y calculate_discount_factor
  - Estimación: 2 horas
  - Archivo: `docs/database/npv-calculation-functions.md`
  - Dependencias: NPV-002

- [ ] **DOC-008**: Crear guía de usuario: Hacer ofertas con condiciones estructuradas
  - Descripción: Guía paso a paso para usuarios sobre cómo crear ofertas con condiciones estructuradas
  - Estimación: 3 horas
  - Archivo: `docs/user-guide/making-offers-with-conditions.md`

- [ ] **DOC-009**: Crear guía de usuario: Entender el Valor Presente Neto
  - Descripción: Explicación para usuarios no técnicos sobre qué es VPN y cómo interpretarlo
  - Estimación: 3 horas
  - Archivo: `docs/user-guide/understanding-npv.md`

- [ ] **DOC-010**: Crear guía de usuario: Negociar condiciones
  - Descripción: Guía sobre cómo aceptar, rechazar y contraofertar condiciones individuales
  - Estimación: 2 horas
  - Archivo: `docs/user-guide/negotiating-conditions.md`

### 4.3 Rollout Gradual

**Epic**: Phased Rollout

#### Tareas Operacionales
- [ ] **ROLL-001**: Crear script de rollout de feature flags
  - Descripción: Script para habilitar feature flags para porcentaje específico de usuarios
  - Estimación: 2 horas
  - Archivo: `scripts/rollout-structured-conditions.js`
  - Dependencias: FLAG-003

- [ ] **ROLL-002**: Alpha testing interno
  - Descripción: Habilitar feature flags para equipo interno, crear 10 ofertas de prueba, recopilar feedback
  - Estimación: 4 horas
  - Dependencias: ROLL-001, E2E-001, E2E-002

- [ ] **ROLL-003**: Beta testing con usuarios selectos (10%)
  - Descripción: Habilitar para 10% de usuarios (power users), monitorear métricas, recopilar feedback
  - Estimación: 4 horas
  - Dependencias: ROLL-002

- [ ] **ROLL-004**: Rollout gradual 25%
  - Descripción: Expandir a 25% de usuarios, monitorear continuamente
  - Estimación: 2 horas
  - Dependencias: ROLL-003

- [ ] **ROLL-005**: Rollout gradual 50%
  - Descripción: Expandir a 50% de usuarios, monitorear continuamente
  - Estimación: 2 horas
  - Dependencias: ROLL-004

- [ ] **ROLL-006**: Rollout gradual 75%
  - Descripción: Expandir a 75% de usuarios, monitorear continuamente
  - Estimación: 2 horas
  - Dependencias: ROLL-005

- [ ] **ROLL-007**: Full rollout 100%
  - Descripción: Habilitar feature flags globalmente para todos los usuarios, anuncio oficial
  - Estimación: 2 horas
  - Dependencias: ROLL-006

### 4.4 Monitoreo y Métricas

**Epic**: Monitoring and Metrics

#### Tareas Backend/Base de Datos
- [ ] **METRICS-001**: Crear view de métricas de condiciones estructuradas
  - Descripción: Vista SQL que agrega métricas: tasa de adopción, condiciones por oferta, tiempo de cálculo VPN
  - Estimación: 2 horas
  - Archivo: `supabase/migrations/20241104000000_create_metrics_view.sql`

- [ ] **METRICS-002**: Crear dashboard de monitoreo (opcional)
  - Descripción: Dashboard simple para visualizar métricas de adopción y performance
  - Estimación: 4 horas
  - Archivo: `src/components/admin/MetricsDashboard.tsx`
  - Dependencias: METRICS-001

- [ ] **METRICS-003**: Configurar alertas de performance
  - Descripción: Alertas cuando tiempo de cálculo VPN > 2s o queries > 5s
  - Estimación: 2 horas
  - Dependencias: METRICS-001

---

## Plan de Contingencia

### Tareas de Rollback

- [ ] **ROLLBACK-001**: Crear script SQL de rollback de feature flags
  - Descripción: Script para deshabilitar feature flags globalmente
  - Estimación: 1 hora
  - Archivo: `scripts/rollback-feature-flags.sql`

- [ ] **ROLLBACK-002**: Crear script SQL de rollback de NPV data
  - Descripción: Script para limpiar datos de NPV de ofertas en caso de rollback
  - Estimación: 1 hora
  - Archivo: `scripts/rollback-npv-data.sql`

- [ ] **ROLLBACK-003**: Documentar procedimiento de rollback
  - Descripción: Documento con pasos a seguir en caso de necesidad de rollback
  - Estimación: 1 hora
  - Archivo: `docs/rollback-procedure.md`
  - Dependencias: ROLLBACK-001, ROLLBACK-002

---

## Resumen de Tareas

### Por Fase

- **Fase 1**: 24 tareas (40-50 horas estimadas)
- **Fase 2**: 22 tareas (60-70 horas estimadas)
- **Fase 3**: 18 tareas (60-70 horas estimadas)
- **Fase 4**: 23 tareas (80-100 horas estimadas)
- **Contingencia**: 3 tareas (3 horas estimadas)

**Total**: ~90 tareas | ~240-290 horas estimadas

### Por Tipo

- **Base de Datos/SQL**: 15 tareas
- **Backend/Servicios**: 25 tareas
- **Frontend/UI**: 18 tareas
- **Testing**: 8 tareas
- **Documentación**: 10 tareas
- **Operacional/Rollout**: 9 tareas
- **Contingencia**: 3 tareas

### Por Epic

1. Feature Flags Infrastructure (4 tareas)
2. Structured Conditions Database Schema (4 tareas)
3. NPV Calculation Engine (4 tareas)
4. Data Migration from Legacy (2 tareas)
5. Testing Setup (4 tareas)
6. Offer Conditions Service (9 tareas)
7. NPV Calculation Service Layer (6 tareas)
8. Backward Compatibility Layer (3 tareas)
9. Enhanced Lawyer Assignment (2 tareas)
10. Structured Conditions UI (6 tareas)
11. NPV Visualization Widget (4 tareas)
12. Enhanced Offer Form (4 tareas)
13. Enhanced Offer Comparison (3 tareas)
14. Enhanced Counter Offer Dialog (2 tareas)
15. Comprehensive Testing (6 tareas)
16. Documentation (10 tareas)
17. Phased Rollout (7 tareas)
18. Monitoring and Metrics (3 tareas)
19. Rollback Procedures (3 tareas)

---

## Notas para Importación en Linear

1. **Prioridades sugeridas**:
   - Fase 1: Alta prioridad (fundamentos)
   - Fase 2: Alta prioridad (lógica de negocio)
   - Fase 3: Media prioridad (UI)
   - Fase 4: Media prioridad (testing, rollout)

2. **Etiquetas sugeridas**:
   - `backend`, `frontend`, `database`, `testing`, `documentation`, `feature-flag`, `npv`, `structured-conditions`, `rollout`

3. **Equipos sugeridos**:
   - Backend: Base de datos, servicios, lógica de negocio
   - Frontend: Componentes UI, formularios, widgets
   - QA: Testing, E2E
   - Product: Documentación, rollout

4. **Dependencias críticas**:
   - Todas las tareas de Fase 1 deben completarse antes de Fase 2
   - Testing depende de implementación completa
   - Rollout depende de testing completo

