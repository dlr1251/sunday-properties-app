# Sunday Properties - Checklist de Tareas

**Última actualización:** 2026-01-26
**Prioridad:** P0 = Crítico, P1 = Alto, P2 = Medio, P3 = Bajo

---

## Estado General

| Módulo | Completado | En Progreso | Pendiente |
|--------|------------|-------------|-----------|
| Autenticación | 95% | 5% | 0% |
| Propiedades | 90% | 5% | 5% |
| Negociación | 95% | 5% | 0% |
| Visitas | 80% | 10% | 10% |
| Legal | 85% | 10% | 5% |
| Admin | 85% | 10% | 5% |
| Testing | 30% | 20% | 50% |
| DevOps | 40% | 20% | 40% |

---

## Fase 0: Estabilización (URGENTE)

### P0 - Build & Compile

- [ ] **Verificar build de producción**
  - Ejecutar `npm run build`
  - Resolver errores de compilación
  - Verificar que no hay warnings críticos

- [ ] **Resolver imports rotos**
  - Revisar archivos eliminados (D en git status)
  - Actualizar imports que referencian archivos eliminados
  - Verificar rutas de alias (@/)

- [ ] **Verificar TypeScript**
  - Ejecutar `npx tsc --noEmit`
  - Corregir errores de tipos
  - Añadir tipos faltantes

### P0 - Base de Datos

- [ ] **Verificar Supabase local**
  - `npx supabase start`
  - Verificar que todas las migraciones aplican
  - Verificar conexión desde la app

- [ ] **Ejecutar seeds**
  - `npm run seed:users`
  - `npm run seed:properties`
  - Verificar datos en Supabase Studio

- [ ] **Verificar RLS policies**
  - Probar acceso con diferentes roles
  - Verificar que no hay brechas de seguridad

### P1 - Flujos Críticos

- [ ] **Login/Registro**
  - Probar login con email/password
  - Probar registro de nuevo usuario
  - Verificar verificación de email

- [ ] **Publicar Propiedad**
  - Completar wizard de 6 pasos
  - Verificar subida de imágenes
  - Verificar guardado en BD

- [ ] **Crear Oferta**
  - Acceder a propiedad
  - Enviar oferta
  - Verificar que llega al vendedor

- [ ] **Negociación**
  - Ver ofertas recibidas
  - Crear contraoferta
  - Aceptar/rechazar

---

## Fase 1: MVP Pulido

### Módulo: Autenticación

- [x] Login con email/password
- [x] Registro de usuarios
- [x] Verificación de email
- [x] Reset de contraseña
- [x] OAuth (Google, Facebook, Microsoft)
- [x] Protección de rutas
- [ ] **P2** - Bloqueo tras intentos fallidos
- [ ] **P3** - 2FA (autenticación de dos factores)

### Módulo: Verificación de Usuario

- [x] Wizard de verificación
- [x] Subida de documento de identidad
- [x] Datos personales
- [x] Aprobación por admin
- [ ] **P2** - Integración con TusDatos.co
- [ ] **P2** - Verificación automática con IA

### Módulo: Propiedades

#### Publicación
- [x] Wizard paso a paso
- [x] Datos básicos (tipo, área, habitaciones)
- [x] Ubicación con mapa
- [x] Subida de fotos
- [x] Subida de documentos
- [x] Precio y condiciones
- [x] Preview antes de publicar
- [x] Guardar como borrador
- [ ] **P2** - Tips de fotografía con IA
- [ ] **P3** - Tours virtuales 360°

#### Discovery
- [x] Listado de propiedades
- [x] Filtros básicos
- [x] Vista de mapa
- [x] Vista de detalle
- [x] Guardar en favoritos
- [x] Comparar propiedades
- [ ] **P1** - Búsqueda por texto
- [ ] **P2** - Filtros avanzados (estrato, antigüedad)
- [ ] **P2** - Propiedades similares

#### Admin
- [x] Aprobar/rechazar propiedades
- [x] Ver propiedades pendientes
- [x] Editar propiedades
- [ ] **P2** - Estadísticas por propiedad

### Módulo: Visitas

- [x] Configurar disponibilidad
- [x] Reservar visita
- [x] Aceptar/rechazar visita (vendedor)
- [x] Reprogramar visita
- [x] Pago de visita (Stripe)
- [x] Feedback post-visita
- [ ] **P1** - Recordatorios por email
- [ ] **P2** - Recordatorios push
- [ ] **P3** - Video visita integrada

### Módulo: Negociación

#### Ofertas
- [x] Formulario de oferta
- [x] Validación contra reglas del vendedor
- [x] Pago para saltarse validación
- [x] Enviar oferta
- [x] Ver ofertas recibidas
- [x] Comparar múltiples ofertas
- [x] Gráfico radar de ofertas
- [ ] **P2** - Sugerencia de precio con IA

#### Contraofertas
- [x] Crear contraoferta
- [x] Historial de ofertas/contraofertas
- [x] Timeline visual
- [x] Aceptar/rechazar
- [ ] **P2** - Negociación automática con IA

#### Métricas Financieras
- [x] Cálculo de NPV
- [x] Comparación de ofertas
- [x] Visualización de métricas
- [ ] **P1** - Exportar comparación a PDF
- [ ] **P2** - ROI esperado
- [ ] **P2** - Análisis de riesgo

#### Condiciones
- [x] 14 tipos de condiciones estructuradas
- [x] Editor de condiciones
- [x] Validación de condiciones
- [ ] **P3** - Condiciones personalizadas

### Módulo: Legal

#### Casos
- [x] Creación automática de caso
- [x] Asignación de abogado
- [x] Dashboard de casos
- [x] Estados del caso
- [ ] **P2** - Notificaciones de cambio de estado

#### Documentos
- [x] Generación de Promesa de Compraventa
- [x] Generación de Carta de Intención
- [x] Preview de documentos
- [x] Descarga de documentos
- [ ] **P1** - Firma digital (DocuSign)
- [ ] **P2** - Versionado de documentos
- [ ] **P3** - Blockchain para integridad

#### Chat
- [x] Chat por caso
- [x] Mensajes en tiempo real
- [x] Participantes múltiples
- [ ] **P2** - Adjuntar archivos
- [ ] **P3** - Menciones (@usuario)

### Módulo: Admin

#### Dashboard
- [x] Métricas principales
- [x] Propiedades por estado
- [x] Usuarios activos
- [ ] **P1** - Gráficos de tendencias
- [ ] **P2** - Exportar reportes

#### Gestión de Usuarios
- [x] Listar usuarios
- [x] Cambiar roles
- [x] Bloquear/desbloquear
- [x] Ver actividad
- [ ] **P2** - Exportar lista

#### Verificaciones
- [x] Ver solicitudes pendientes
- [x] Aprobar/rechazar con comentarios
- [x] Ver documentos subidos
- [ ] **P2** - Verificación en lote

#### Configuración
- [x] Feature flags
- [x] Parámetros globales
- [ ] **P2** - Configuración de emails
- [ ] **P3** - Configuración de pagos

### Módulo: Comunicación

- [x] Sistema de notificaciones
- [x] Chat en tiempo real
- [ ] **P1** - Notificaciones por email
- [ ] **P2** - Push notifications (PWA)
- [ ] **P2** - Templates de email
- [ ] **P3** - SMS notifications

---

## Fase 2: Testing & Quality

### Unit Tests

- [ ] **P1** - Tests de hooks críticos
  - [ ] useAuth
  - [ ] useNegotiation
  - [ ] useOffers
  - [ ] useVisits

- [ ] **P2** - Tests de utilidades
  - [ ] Validaciones
  - [ ] Formatters
  - [ ] Helpers

### Integration Tests

- [ ] **P1** - Flujo de autenticación
- [ ] **P1** - Flujo de publicación
- [ ] **P1** - Flujo de negociación
- [ ] **P2** - Flujo de visitas
- [ ] **P2** - Flujo legal

### E2E Tests (Playwright)

- [ ] **P1** - Happy path completo
- [ ] **P2** - Escenarios de error
- [ ] **P2** - Diferentes roles
- [ ] **P3** - Performance testing

### Security

- [ ] **P1** - Audit de RLS policies
- [ ] **P1** - Validación de inputs
- [ ] **P2** - OWASP Top 10 review
- [ ] **P2** - Penetration testing básico

---

## Fase 3: DevOps & Deployment

### Infraestructura

- [ ] **P1** - Setup de staging environment
- [ ] **P1** - CI/CD pipeline (GitHub Actions)
- [ ] **P2** - Monitoring (Sentry)
- [ ] **P2** - Logging centralizado
- [ ] **P3** - CDN para assets

### Performance

- [ ] **P1** - Lazy loading de rutas
- [ ] **P1** - Optimización de imágenes
- [ ] **P2** - Code splitting
- [ ] **P2** - Caching strategy
- [ ] **P3** - Service worker

### Backup & Recovery

- [ ] **P1** - Backup automático de BD
- [ ] **P2** - Disaster recovery plan
- [ ] **P2** - Rollback procedures

---

## Bugs Conocidos

| ID | Descripción | Prioridad | Estado |
|----|-------------|-----------|--------|
| BUG-001 | Archivos eliminados aún referenciados | P0 | Pendiente |
| BUG-002 | - | - | - |
| BUG-003 | - | - | - |

*Añadir bugs conforme se identifiquen durante testing*

---

## Deuda Técnica

| Item | Descripción | Impacto | Esfuerzo |
|------|-------------|---------|----------|
| DT-001 | Consolidar migraciones SQL | Medio | Alto |
| DT-002 | Documentar APIs internas | Bajo | Medio |
| DT-003 | Refactorizar componentes grandes | Medio | Alto |
| DT-004 | Mejorar manejo de errores | Alto | Medio |
| DT-005 | Añadir logging consistente | Medio | Bajo |

---

## Notas de Implementación

### Decisiones Arquitectónicas Pendientes

1. **Firma Digital:** Evaluar DocuSign vs Adobe Sign vs solución custom
2. **Video Llamadas:** Evaluar Jitsi vs Daily.co vs Twilio
3. **Push Notifications:** PWA vs native app
4. **Analytics:** Evaluar Mixpanel vs Amplitude vs custom

### Dependencias Externas

- **Google Maps API** - Configurado, verificar quota
- **Stripe** - Modo test activo
- **XAI/Grok** - API key configurada
- **TusDatos.co** - Pendiente integración

---

## Contactos y Recursos

### Equipo

| Rol | Nombre | Responsabilidad |
|-----|--------|-----------------|
| Tech Lead | - | Arquitectura, código |
| Product | - | Roadmap, prioridades |
| Design | - | UI/UX |

### Recursos Externos

- **Notion:** Documentación de negocio
- **GitHub:** Repositorio de código
- **Supabase Dashboard:** BD en producción
- **Stripe Dashboard:** Pagos

---

*Este checklist se actualiza semanalmente. Para cambios urgentes, crear issue en GitHub.*
