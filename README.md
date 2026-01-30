# 🏠 Sunday Properties - Plataforma Inmobiliaria Completa

Una plataforma inmobiliaria moderna y completa para Medellín, construida con React, TypeScript, Tailwind CSS y Supabase. Sistema avanzado de negociación con IA, visualizaciones interactivas y notificaciones en tiempo real.

## 📋 Tabla de Contenidos

- [🏠 Información General](#-información-general)
- [✨ Características Principales](#-características-principales)
- [🛠️ Tecnologías y Arquitectura](#️-tecnologías-y-arquitectura)
- [🚀 Setup y Desarrollo](#-setup-y-desarrollo)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🗄️ Base de Datos y Esquemas](#️-base-de-datos-y-esquemas)
- [👥 Usuarios de Prueba](#-usuarios-de-prueba)
- [🧪 Escenarios de Testing](#-escenarios-de-testing)
- [📋 Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [🗺️ Roadmap y Plan de Desarrollo](#️-roadmap-y-plan-de-desarrollo)
- [🔧 Comandos Útiles](#-comandos-útiles)
- [📚 Documentación y Soporte](#-documentación-y-soporte)

---

## 🏠 Información General

**Sunday Properties** es una plataforma inmobiliaria completa diseñada específicamente para el mercado de Medellín, Colombia. Combina las mejores prácticas modernas de desarrollo con funcionalidades avanzadas de negociación asistida por IA, visualizaciones interactivas y un sistema robusto de notificaciones en tiempo real.

### 🎯 Objetivos del Proyecto

- **Democratizar el acceso** a propiedades de calidad en Medellín
- **Optimizar procesos** de compra-venta con IA y automatización
- **Crear confianza** entre compradores y vendedores con contratos digitales
- **Facilitar la labor** de agentes inmobiliarios y abogados
- **Proporcionar herramientas** de análisis financiero avanzado

### 💼 Modelo de Negocio

- **Comisión por transacción** (2-3% del valor de venta)
- **Suscripciones premium** para vendedores
- **Pago por visitas virtuales** ($49.000 COP)
- **Servicios legales integrados** con abogados certificados

---

## ✨ Características Principales

### 🏠 Gestión Integral de Propiedades
- **Publicación inteligente** con wizard paso a paso
- **Gestión completa** del ciclo de vida de propiedades
- **Sistema de verificación** y certificación
- **Multimedia avanzado** (fotos, videos 360°, tours virtuales)

### 🤖 Sistema de Negociación con IA
- **Asesoría inteligente** en tiempo real para compradores y vendedores
- **Validación automática** de ofertas según reglas predefinidas
- **Visualizaciones avanzadas** (radar charts, timelines, progreso)
- **Sistema de contraofertas** con diálogos inteligentes
- **Cartas de intención** generadas automáticamente

### 👥 Roles y Permisos Avanzados
- **Usuarios registrados** - Acceso básico a propiedades
- **Vendedores verificados** - Publicación y gestión de propiedades
- **Agentes inmobiliarios** - Gestión de clientes y transacciones
- **Abogados** - Manejo legal y contratos
- **Administradores** - Control total del sistema

### 📊 Dashboard y Analytics
- **Métricas en tiempo real** por usuario/rol
- **Análisis financiero** (ROI, VPN, TIR)
- **Seguimiento de negociaciones** activas
- **Reportes de rendimiento** por agente

### 💬 Comunicación Integrada
- **Chat en tiempo real** entre partes interesadas
- **Sistema de notificaciones** push y email
- **Documentos legales** compartidos y versionados
- **Feedback de visitas** estructurado

### 🔐 Seguridad y Confianza
- **Row Level Security (RLS)** en todas las tablas
- **Autenticación robusta** con Supabase Auth
- **Auditoría completa** de todas las acciones
- **Backup automático** y recuperación de datos

---

## 🛠️ Tecnologías y Arquitectura

### **Frontend Stack**
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes UI preconstruidos
- **Framer Motion** - Animaciones fluidas
- **Recharts** - Visualizaciones de datos
- **React Hook Form** - Manejo de formularios
- **date-fns** - Utilidades de fechas
- **Yjs + y-websocket** - Edición colaborativa en tiempo real

### **Backend Stack**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Supabase Auth** - Autenticación y autorización
- **Supabase Storage** - Almacenamiento de archivos
- **Supabase Edge Functions** - Funciones serverless
- **PostGIS** - Extensiones geoespaciales

### **Infraestructura y Despliegue**
- **Vercel** - Plataforma de despliegue
- **Supabase Cloud** - Base de datos en producción
- **CDN Global** - Distribución de contenido
- **SSL Automático** - Certificados de seguridad

### **Integraciones Externas**
- **Google Maps API** - Mapas interactivos
- **Stripe/PayPal** - Procesamiento de pagos
- **Crypto APIs** - Pagos con criptomonedas
- **Email Service** - Notificaciones por email

### **Arquitectura de Componentes**
```
src/
├── components/
│   ├── ui/                 # Componentes base (shadcn/ui)
│   ├── auth/              # Autenticación y registro
│   ├── dashboards/        # Dashboards por rol (8 tipos)
│   ├── negotiation/       # Sistema de negociación (8 componentes)
│   ├── properties/        # Gestión de propiedades
│   ├── chat/              # Comunicación y mensajería
│   ├── animations/        # Componentes animados (4 tipos)
│   └── core/              # Componentes del sistema
├── hooks/                 # Lógica reutilizable (8 hooks)
├── contexts/              # Contextos React globales
├── services/              # Integraciones externas
├── types/                 # Definiciones TypeScript
├── utils/                 # Utilidades generales
└── styles/                # Estilos globales
```

---

## 🚀 Setup y Desarrollo

### Opción 1: Setup Automático (Recomendado)

```bash
# Ejecutar script de configuración completa
./setup-complete.sh
```

### Opción 2: Setup Manual

#### 1. Requisitos Previos
```bash
# Node.js 18+
node --version

# Supabase CLI
npm install -g supabase

# Git
git --version
```

#### 2. Clonar y Instalar
```bash
# Clonar repositorio
git clone https://github.com/dlr1251/sunday-properties-app.git
cd sunday-properties-app

# Instalar dependencias
npm install
```

#### 3. Configurar Supabase
```bash
# Login en Supabase
supabase login

# Crear proyecto (desarrollo local)
supabase start

# O conectar proyecto remoto
supabase link --project-ref YOUR_PROJECT_REF
```

#### 4. Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env.local

# Configurar variables requeridas
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

#### 5. Base de Datos (Sistema Consolidado)
```bash
# Sistema de seeding completamente renovado:
# ✅ 6 migraciones consolidadas (vs 46+ antiguas)
# ✅ 1 seed principal para desarrollo local
# ✅ Scripts automatizados para testing rápido

# Reset completo + seed (recomendado para desarrollo)
npm run db:reset-seed

# O setup manual paso a paso:
supabase db reset --local          # Reset database
node scripts/seed-users.mjs        # Create 20 test users
supabase migration up --local      # Apply 6 consolidated migrations
./scripts/seed-complete.sh         # Seed properties + negotiations
./scripts/verify-data-preservation.sh  # Verify data integrity
```

#### 6. Servidor Yjs (Edición Colaborativa)
```bash
# Iniciar servidor WebSocket para edición colaborativa
# (requerido para documentos compartidos y negociación en tiempo real)
npm run yjs:server

# O ejecutar directamente:
npx y-websocket-server --port 1234
```

#### 7. Desarrollo Local
```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:5173
```

#### 8. Supabase Realtime (Opcional)

**Nota sobre Realtime:** El sistema de tiempo real de Supabase está temporalmente deshabilitado en desarrollo local para evitar errores de conexión WebSocket. Esto no afecta la funcionalidad principal de la aplicación.

Para habilitar realtime en desarrollo (si es necesario para funcionalidades específicas):

```bash
# En .env.local
VITE_ENABLE_REALTIME=true
```

O modificar `src/lib/supabase.ts` para incluir configuración de realtime.

#### 9. Despliegue a Producción
```bash
# Build de producción
npm run build

# Desplegar a Vercel
vercel --prod
```

---

## 📁 Estructura del Proyecto

```
/
├── src/
│   ├── components/          # Componentes React organizados por feature
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── auth/           # Autenticación y registro
│   │   ├── dashboards/     # Dashboards por rol (8 tipos)
│   │   ├── negotiation/    # Sistema de negociación (8 componentes)
│   │   ├── properties/     # Gestión de propiedades
│   │   ├── chat/           # Comunicación y mensajería
│   │   ├── animations/     # Componentes animados (4 tipos)
│   │   └── core/           # Componentes del sistema
│   ├── hooks/              # Lógica reutilizable (8 hooks)
│   ├── contexts/           # Contextos React globales
│   ├── services/           # Integraciones externas
│   ├── types/              # Definiciones TypeScript
│   ├── utils/              # Utilidades generales
│   ├── data/               # Datos mock y configuración
│   └── styles/             # Estilos globales
├── supabase/
│   ├── migrations/         # 6 migraciones consolidadas (vs 46+ antiguas)
│   │   ├── 20240101000000_01_base_schema.sql
│   │   ├── 20240101000001_02_rls_policies.sql
│   │   ├── 20240101000002_03_functions_triggers.sql
│   │   ├── 20240101000003_04_negotiations_system.sql
│   │   ├── 20240101000004_05_additional_features.sql
│   │   └── 20240101000005_06_indexes_optimizations.sql
│   ├── seeds/              # Seeds organizados
│   │   ├── seed-local.sql  # Seed principal para desarrollo
│   │   └── seed-negotiation-test-data.sql  # Datos extra de negociación
│   ├── functions/          # Edge functions
│   ├── _archived/          # Migraciones antiguas (preservadas)
│   └── config.toml         # Configuración actualizada
├── public/                 # Assets estáticos
├── scripts/                # Scripts de automatización
└── docs/                   # Documentación adicional
```

---

## 🗄️ Base de Datos y Esquemas

### Arquitectura General

La base de datos sigue una arquitectura relacional normalizada completamente consolidada con **25+ tablas** organizadas en módulos lógicos. Sistema de migraciones completamente renovado: **6 migraciones consolidadas** vs 46+ archivos antiguos.

- **Autenticación**: `auth.users`, `public.profiles`
- **Propiedades**: `properties`, `property_availability`
- **Negociación**: `offers`, `counter_offers`, `negotiation_rules`
- **Legal**: `cases`, `case_documents`, `contracts`
- **Comunicación**: `chat_messages`, `notifications`
- **Sistema**: `audit_logs`, `platform_settings`

### Tablas Principales

| Tabla | Descripción | Relaciones |
|-------|-------------|------------|
| **profiles** | Perfiles extendidos de usuarios | 1:1 con auth.users |
| **properties** | Propiedades inmobiliarias | 1:many con offers, visits |
| **offers** | Ofertas de compra | many:1 con properties/users |
| **negotiation_rules** | Reglas de negociación por propiedad | 1:1 con properties |
| **counter_offers** | Contraofertas en negociaciones | many:1 con offers |
| **cases** | Casos legales | 1:many con case_documents |
| **notifications** | Sistema de notificaciones | many:1 con users |
| **audit_logs** | Logs de auditoría | - |

### Funciones SQL Avanzadas

- **Validación automática** de ofertas
- **Cálculo de progreso** de negociaciones
- **Triggers para notificaciones** en tiempo real
- **Funciones de búsqueda** geoespacial
- **Cálculos financieros** automáticos

### Políticas de Seguridad (RLS)

- **Usuarios**: Solo ven sus propios datos
- **Agentes**: Acceden a propiedades asignadas
- **Abogados**: Gestionan casos asignados
- **Admins**: Acceso completo al sistema

### Diagrama de Entidades (Simplificado)

```
auth.users (Supabase Auth)
    ↓
profiles (extended user info)
    ↓
├── properties (owned/managed)
│   ├── offers (purchase offers)
│   │   └── counter_offers (negotiations)
│   ├── visits (scheduled visits)
│   └── negotiation_rules (auto-validation)
├── cases (legal cases)
│   └── case_documents (legal files)
└── notifications (user notifications)
```

---

## 👥 Usuarios de Prueba

### Información General
- **Contraseña universal**: `password123`
- **Dominio**: `@sunday.com` o `@mailinator.com`
- **Roles**: user, agent, lawyer, admin

### Vendedores (Sellers)

| Usuario | Email | Tipo | Propiedades | Ubicación |
|---------|-------|------|-------------|-----------|
| **Juan Pérez** | juan.perez.test@mailinator.com | verified | 1 | El Poblado |
| **Carlos Rodríguez** | carlos.rodriguez.test@mailinator.com | verified | 1 | Laureles |
| **Luis Hernández** | luis.hernandez.test@mailinator.com | verified | 1 | Envigado |
| **Diego González** | diego.gonzalez.test@mailinator.com | verified | 1 | Sabaneta |
| **Santiago Torres** | santiago.torres.test@mailinator.com | verified | 1 | Rionegro |

### Compradores (Buyers)

| Usuario | Email | Tipo | Ofertas | Actividad |
|---------|-------|------|---------|-----------|
| **María García** | maria.garcia.test@mailinator.com | verified | 2 | Agente profesional |
| **Ana Martínez** | ana.martinez.test@mailinator.com | verified | 1 | Compradora activa |
| **Sofía López** | sofia.lopez.test@mailinator.com | verified | 1 | Primera compra |
| **Valentina Ramírez** | valentina.ramirez.test@mailinator.com | verified | 1 | Inversión |
| **Isabella Jiménez** | isabella.jimenez.test@mailinator.com | verified | 1 | Relocalización |

### Agentes/Abogados (Agents/Lawyers)

| Usuario | Email | Rol | Especialización |
|---------|-------|-----|----------------|
| **Laura Fernandez** | laura.fernandez@sunday.com | lawyer | Contratos |
| **David Morales** | david.morales@sunday.com | lawyer | Due diligence |
| **Andrea Villa** | andrea.villa@sunday.com | agent | El Poblado |
| **Carlos Rengifo** | carlos.rengifo@sunday.com | agent | Zona Norte |

### Administradores

| Usuario | Email | Nivel | Acceso |
|---------|-------|-------|--------|
| **Admin Principal** | admin@sunday.com | superadmin | Completo |
| **Admin Secundario** | admin2@sunday.com | admin | Limitado |

---

## 🧪 Escenarios de Testing

### Flujos de Prueba Recomendados

#### **Flujo 1: Negociación Completa**
1. **Vendedor** configura reglas de negociación
2. **Comprador** crea oferta con Smart Form
3. Sistema valida oferta automáticamente
4. **Vendedor** recibe notificación y analiza
5. **Contraoferta** generada con IA
6. **Carta de intención** creada
7. **Abogado** revisa y aprueba

#### **Flujo 2: Gestión de Visitas**
1. **Usuario** agenda visita pagada
2. **Agente** confirma y coordina
3. **Sistema** genera NDA digital
4. **Usuario** completa visita
5. **Feedback** estructurado registrado
6. **Documentos** desbloqueados

#### **Flujo 3: Panel de Administración**
1. **Admin** revisa métricas globales
2. Gestiona usuarios y roles
3. Aprueba propiedades premium
4. Resuelve reportes/denuncias
5. Configura parámetros globales

### Casos de Prueba por Rol

#### **Usuario Regular**
- ✅ Explorar propiedades públicas
- ✅ Gestionar perfil y favoritos
- ✅ Agendar visitas
- ❌ Gestionar propiedades ajenas

#### **Agente Inmobiliario**
- ✅ Publicar propiedades
- ✅ Gestionar clientes asignados
- ✅ Crear ofertas en nombre de clientes
- ✅ Ver métricas de rendimiento

#### **Abogado**
- ✅ Gestionar casos legales
- ✅ Revisar contratos y documentos
- ✅ Participar en negociaciones
- ✅ Validar términos legales

#### **Administrador**
- ✅ Acceso completo al sistema
- ✅ Gestionar usuarios y permisos
- ✅ Ver logs de auditoría
- ✅ Configurar plataforma

### Métricas de Éxito
- ✅ Login exitoso con todos los usuarios
- ✅ Navegación fluida entre componentes
- ✅ Notificaciones en tiempo real
- ✅ Validación automática de ofertas
- ✅ Visualizaciones renderizando datos
- ✅ Diseño responsive funcional

---

## 📋 Funcionalidades Implementadas

### ✅ Sistema Completo de Negociación
- **8 componentes UI** completamente funcionales
- **Hook personalizado** `useNegotiation` con lógica completa
- **Base de datos extendida** con 15+ nuevas tablas
- **Visualizaciones avanzadas** (radar charts, timelines)
- **Sistema de contraofertas** con diálogos modales
- **Asesoría IA** con 3 niveles de inteligencia

### ✅ Integración Completa
- **PropertyUploadWizard** - Paso de reglas de negociación
- **PropertyDetailView** - Integración SmartOfferForm
- **NegotiationPanelView** - Overhaul completo
- **Sistema de notificaciones** en tiempo real
- **Animaciones fluidas** con Framer Motion

### ✅ Seguridad y Rendimiento
- **Row Level Security** en todas las tablas
- **Auditoría completa** de acciones
- **Optimización de queries** con índices
- **Cache inteligente** de datos

### ✅ Datos de Prueba Completos
- **10 usuarios** de prueba con roles variados
- **5 propiedades** realistas con datos completos
- **7 ofertas** con diferentes estados
- **Historial completo** de negociaciones
- **100+ notificaciones** de ejemplo

---

## 🗺️ Roadmap y Plan de Desarrollo

### 🎯 Fase 1: Core System (Completada ✅)
- [x] Autenticación y autorización
- [x] Gestión básica de propiedades
- [x] Sistema de usuarios y roles
- [x] Base de datos fundamental

### 🚀 Fase 2: Advanced Negotiation (Completada ✅)
- [x] Sistema de negociación con IA
- [x] Visualizaciones avanzadas
- [x] Notificaciones en tiempo real
- [x] Contraofertas inteligentes

### 📈 Fase 3: Business Logic Expansion (En Progreso 🔄)

#### **3.1 Enhanced Property Management**
- [ ] **Sistema de disponibilidad** avanzado por horarios
- [ ] **Integración con tours virtuales** (Matterport)
- [ ] **Sistema de matching** comprador-propiedad con IA
- [ ] **Valoración automática** de propiedades

#### **3.2 Advanced Financial Tools**
- [ ] **Calculadora de hipotecas** integrada
- [ ] **Análisis de mercado** con datos históricos
- [ ] **Predicciones de precio** con ML
- [ ] **Reportes financieros** automatizados

#### **3.3 Communication Enhancement**
- [ ] **Video llamadas** integradas para visitas virtuales
- [ ] **Sistema de broadcast** para agentes
- [ ] **Templates de email** personalizables
- [ ] **Integración WhatsApp** para notificaciones

### 🌟 Fase 4: Scale & Optimization (Planificada 📋)

#### **4.1 Performance & Scale**
- [ ] **Microservicios** para funcionalidades críticas
- [ ] **CDN avanzado** para imágenes y videos
- [ ] **Cache distribuido** (Redis)
- [ ] **Load balancing** automático

#### **4.2 Advanced Analytics**
- [ ] **Dashboard ejecutivo** con KPIs avanzados
- [ ] **Machine Learning** para recomendaciones
- [ ] **Predictive analytics** para mercado inmobiliario
- [ ] **A/B testing** para UI/UX

#### **4.3 Mobile App**
- [ ] **React Native app** para iOS/Android
- [ ] **Offline capabilities** para visitas
- [ ] **Push notifications** nativas
- [ ] **Biometric authentication**

### 🔧 Fase 5: Ecosystem Integration (Futuro 🚀)

#### **5.1 Third-party Integrations**
- [ ] **Integración con bancos** para pre-aprobaciones
- [ ] **API para agentes externos**
- [ ] **Marketplaces** integración (Mercado Libre, etc.)
- [ ] **Blockchain** para contratos inteligentes

#### **5.2 Advanced Features**
- [ ] **VR/AR** para tours inmobiliarios
- [ ] **IoT integration** para smart homes
- [ ] **Sustainability scoring** de propiedades
- [ ] **Community features** y networking

### 📊 Métricas de Éxito por Fase

| Fase | Usuarios Objetivo | Transacciones/Mes | Revenue Target |
|------|-------------------|-------------------|----------------|
| **Fase 1** | 100 | 5-10 | $50K |
| **Fase 2** | 500 | 25-50 | $200K |
| **Fase 3** | 2,000 | 100-200 | $800K |
| **Fase 4** | 10,000 | 500-1,000 | $4M |
| **Fase 5** | 50,000+ | 2,500+ | $20M+ |

---

## 🔧 Comandos Útiles

### Desarrollo Local
```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview de build local
npm run type-check       # Verificación de tipos
```

### Base de Datos
```bash
supabase start           # Iniciar Supabase local
supabase db push         # Aplicar migraciones
supabase db reset        # Reset completo + seed
supabase gen types       # Generar tipos TypeScript
supabase logs            # Ver logs en tiempo real
```

### Testing
```bash
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Reporte de cobertura
```

### Despliegue
```bash
vercel dev               # Desarrollo con Vercel
vercel --prod            # Desplegar a producción
vercel env add           # Agregar variable de entorno
vercel domains add       # Agregar dominio personalizado
```

### Git Workflow
```bash
git checkout -b feature/nueva-funcionalidad
git add .
git commit -m "feat: descripción clara"
git push origin feature/nueva-funcionalidad
# Crear PR en GitHub
```

---

## 📚 Documentación y Soporte

### 📖 Documentación Completa del Usuario

**¡Explora nuestra documentación completa y detallada!**

- **[📚 Documentación Completa](/docs)** - Guía completa de todas las funcionalidades
  - [🚀 Inicio Rápido](/docs/getting-started) - Comienza en 5 minutos
  - [🏠 Subir Propiedades](/docs/properties/upload-property) - Guía paso a paso
  - [👁️ Agendar Visitas](/docs/visits/schedule-visits) - Cómo agendar visitas
  - [💰 Crear Ofertas](/docs/negotiations/create-offers) - Sistema de negociación
  - [⚖️ Casos Legales](/docs/legal/cases) - Proceso legal automatizado
  - [❓ FAQ](/docs/faq) - Preguntas frecuentes
  - [🔧 Solución de Problemas](/docs/troubleshooting) - Ayuda técnica

### Documentos del Proyecto
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de despliegue
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Checklist de testing
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Resumen técnico
- **[README_SETUP.md](README_SETUP.md)** - Setup detallado
- **[README_TEST_USERS.md](README_TEST_USERS.md)** - Usuarios de prueba
- **[README_TEST_SCENARIOS.md](README_TEST_SCENARIOS.md)** - Escenarios de testing

### Documentación Externa
- **[Supabase Docs](https://supabase.com/docs)** - Backend y base de datos
- **[Vercel Docs](https://vercel.com/docs)** - Despliegue y hosting
- **[React Docs](https://react.dev)** - Framework frontend
- **[Tailwind CSS](https://tailwindcss.com)** - Framework de estilos

### Soporte y Comunidad
- **GitHub Issues**: Reportar bugs y solicitar features
- **Discord**: Comunidad de desarrollo
- **Email**: soporte@sundayproperties.com
- **WhatsApp**: +57 300 123 4567

### Contribución
1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. Push rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver archivo `LICENSE` para más detalles.

## 🆘 Soporte Técnico

Si encuentras problemas:

1. **Revisa los logs** en Vercel/Supabase
2. **Verifica configuración** de variables de entorno
3. **Consulta documentación** específica del problema
4. **Revisa issues existentes** en GitHub
5. **Abre nuevo issue** con detalles completos

### Información de Debug
- **Versión Node.js**: `node --version`
- **Versión Supabase CLI**: `supabase --version`
- **Estado Supabase**: `supabase status`
- **Logs de aplicación**: Console del navegador

---

**¡Sunday Properties está revolucionando el mercado inmobiliario en Medellín con tecnología de vanguardia! 🚀**

*Última actualización: Octubre 2025*