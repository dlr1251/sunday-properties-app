# Sunday Properties - Project Management Hub

**Fecha de Actualización:** Enero 2026
**Estado del Proyecto:** Pre-producción / Alpha Testing
**Versión:** 0.9.0

---

## Quick Links

| Documento | Descripción |
|-----------|-------------|
| [ROADMAP.md](./ROADMAP.md) | Plan de desarrollo y fases |
| [CHECKLIST.md](./CHECKLIST.md) | Tareas priorizadas por módulo |
| [DEMO_PREP.md](./DEMO_PREP.md) | Guía para preparar demos |
| [docs/](./docs/) | Documentación técnica completa |

---

## Estado Actual del Proyecto

### Resumen Ejecutivo

Sunday Properties es una plataforma inmobiliaria que permite a usuarios en Medellín enlistar, encontrar y negociar propiedades de forma segura, respaldada por abogados de Capital M. La aplicación ofrece:

- **Publicación de propiedades** con wizard paso a paso
- **Sistema de negociación avanzado** con ofertas/contraofertas y IA
- **Generación de documentos legales** automatizada
- **Gestión de visitas** con calendario y pagos
- **Dashboards especializados** por rol (comprador, vendedor, agente, abogado, admin)

### Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| **Build** | Vite 6, SWC |
| **Pagos** | Stripe |
| **IA** | XAI SDK (Grok) |
| **Colaboración** | Yjs + TipTap (edición en tiempo real) |
| **Testing** | Vitest |

### Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Archivos TypeScript/React | 445+ |
| Componentes UI | 26 (shadcn) + 80+ custom |
| Tablas de BD | 25+ |
| Migraciones SQL | 11 |
| Custom Hooks | 20+ |
| Servicios de Negocio | 13 |
| Usuarios de Prueba | 14 |
| Propiedades de Prueba | 15 |

---

## Funcionalidades Implementadas

### Core (100%)

- [x] **Autenticación** - Login/Registro con Supabase Auth
- [x] **Verificación de Usuario** - Wizard multi-paso con documento de identidad
- [x] **Gestión de Perfiles** - Datos personales y configuración
- [x] **Roles Dinámicos** - user, agent, lawyer, admin, super_admin

### Propiedades (95%)

- [x] **Wizard de Publicación** - 6 pasos (básico, ubicación, media, precio, docs, review)
- [x] **Galería de Imágenes** - Subida múltiple con preview
- [x] **Geolocalización** - Google Maps integration
- [x] **Búsqueda y Filtros** - Por precio, área, habitaciones, ubicación
- [x] **Favoritos** - Guardar y comparar propiedades
- [ ] **Tours Virtuales** - Pendiente integración Matterport

### Negociación (100%)

- [x] **Sistema de Ofertas** - Formulario inteligente con validaciones
- [x] **Contraofertas** - Negociación bidireccional
- [x] **Cálculo NPV** - Valor presente neto de ofertas
- [x] **Condiciones Estructuradas** - 14 tipos de condiciones
- [x] **Timeline de Negociación** - Historial visual completo
- [x] **Comparación de Ofertas** - Radar chart y tabla comparativa
- [x] **Sugerencias con IA** - Grok para recomendaciones

### Legal (90%)

- [x] **Asignación Automática de Abogado** - Trigger en BD
- [x] **Generación de Documentos** - Promesa, intención, contrato
- [x] **Gestión de Casos** - CRUD completo
- [x] **Chat por Caso** - Comunicación multi-parte
- [ ] **Firma Digital** - Pendiente integración DocuSign

### Visitas (85%)

- [x] **Configuración de Disponibilidad** - Por día y horario
- [x] **Reserva de Visitas** - Calendario interactivo
- [x] **Pago de Visita** - $49,000 COP (Stripe)
- [x] **Feedback Post-visita** - Encuesta de satisfacción
- [ ] **Recordatorios** - Notificaciones push pendientes

### Comunicación (80%)

- [x] **Chat en Tiempo Real** - Mensajería con Supabase Realtime
- [x] **Notificaciones** - Sistema de alertas
- [ ] **Video Llamadas** - Pendiente integración Jitsi
- [ ] **Templates de Email** - Pendiente

### Admin (90%)

- [x] **Dashboard de Métricas** - KPIs principales
- [x] **Gestión de Usuarios** - CRUD completo
- [x] **Aprobación de Propiedades** - Workflow draft → pending → published
- [x] **Verificación de Identidad** - Panel de revisión
- [x] **Configuración de Plataforma** - Feature flags
- [ ] **Logs de Auditoría** - UI pendiente (datos en BD)

---

## Próximos Pasos Inmediatos

### Para Demo/Presentación

1. **Verificar que el build compila** - `npm run build`
2. **Preparar datos de demo** - Ejecutar seeds
3. **Revisar flujos críticos** - Login → Property → Offer → Negotiation
4. **Documentar credenciales** - Usuarios de prueba

### Para Producción

1. **Testing E2E** - Implementar suite con Playwright
2. **Performance** - Lazy loading, optimización de queries
3. **Security Audit** - Revisar RLS policies
4. **Monitoring** - Setup de Sentry/similar

---

## Documentación de Referencia

### Notion (Lógica de Negocio)

- [Sunday Properties Hub](https://www.notion.so/1df0a3cd15e3802989e8fcdee39483d4)
- [Business Logic](https://www.notion.so/1e60a3cd15e380eb94cacd9fb5578253)
- [User Stories](https://www.notion.so/1e70a3cd15e380a786f3ca3ae7ba231c)
- [Features](https://www.notion.so/1f80a3cd15e380bb862cfd4e05dc72b2)

### Repositorio Local

- `docs/` - Documentación técnica
- `docs/roadmap.md` - Plan de desarrollo detallado
- `docs/implementation/` - Estado de implementación
- `docs/testing/` - Guías y escenarios de testing
- `supabase/migrations/` - Esquema de BD

---

## Usuarios de Prueba

**Contraseña universal:** `password123`

| Rol | Email | Descripción |
|-----|-------|-------------|
| Super Admin | admin@sunday.com | Control total |
| Admin | admin2@sunday.com | Administración |
| Abogado | laura.fernandez@sunday.com | Gestión de casos |
| Agente | andrea.villa@sunday.com | Gestión de propiedades |
| Vendedor | juan.perez.test@mailinator.com | Usuario verificado con propiedades |
| Comprador | maria.garcia.test@mailinator.com | Usuario verificado |

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Servidor de desarrollo (puerto 3000)
npm run build                  # Build de producción
npm run test                   # Ejecutar tests

# Base de Datos
npx supabase start            # Iniciar Supabase local
npx supabase db reset         # Reset completo de BD
npm run seed:users            # Seed de usuarios
npm run seed:properties       # Seed de propiedades

# Colaboración en Tiempo Real
npm run yjs:server            # Servidor WebSocket (puerto 1234)
```

---

## Estructura del Proyecto

```
sunday_proto/
├── src/
│   ├── components/           # Componentes React
│   │   ├── auth/            # Autenticación
│   │   ├── dashboards/      # Dashboards por rol
│   │   ├── negotiation/     # Sistema de negociación
│   │   ├── properties/      # Gestión de propiedades
│   │   ├── visits/          # Sistema de visitas
│   │   ├── lawyer/          # Gestión legal
│   │   ├── chat/            # Comunicación
│   │   └── ui/              # Componentes base (shadcn)
│   ├── hooks/               # Custom hooks
│   ├── services/            # Servicios de negocio
│   ├── lib/                 # Utilidades y repositorios
│   ├── contexts/            # React contexts
│   └── types/               # TypeScript definitions
├── supabase/
│   ├── migrations/          # Migraciones SQL
│   ├── seeds/               # Datos de prueba
│   └── functions/           # Edge functions
├── docs/                    # Documentación
└── scripts/                 # Scripts de automatización
```

---

**Última actualización:** 2026-01-26
