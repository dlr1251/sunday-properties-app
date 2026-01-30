import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  List,
  ChevronRight,
  Home,
  Info,
  Settings,
  Users,
  TestTube,
  Database,
  Code,
  CheckCircle,
  MapPin,
  FileText,
  Shield,
  Smartphone,
  Globe,
  Zap
} from 'lucide-react';

// Simulación del contenido del README (en producción esto vendría de una API o archivo)
const readmeContent = {
  title: "🏠 Sunday Properties - Plataforma Inmobiliaria Completa",
  lastUpdated: "Octubre 2025",
  sections: [
    {
      id: "general",
      title: "🏠 Información General",
      icon: <Info className="w-5 h-5" />,
      content: `
Una plataforma inmobiliaria moderna y completa para Medellín, construida con React, TypeScript, Tailwind CSS y Supabase. Sistema avanzado de negociación con IA, visualizaciones interactivas y notificaciones en tiempo real.

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
      `
    },
    {
      id: "features",
      title: "✨ Características Principales",
      icon: <Zap className="w-5 h-5" />,
      subsections: [
        {
          title: "🏠 Gestión Integral de Propiedades",
          content: "- **Publicación inteligente** con wizard paso a paso\n- **Gestión completa** del ciclo de vida de propiedades\n- **Sistema de verificación** y certificación\n- **Multimedia avanzado** (fotos, videos 360°, tours virtuales)"
        },
        {
          title: "🤖 Sistema de Negociación con IA",
          content: "- **Asesoría inteligente** en tiempo real para compradores y vendedores\n- **Validación automática** de ofertas según reglas predefinidas\n- **Visualizaciones avanzadas** (radar charts, timelines, progreso)\n- **Sistema de contraofertas** con diálogos inteligentes\n- **Cartas de intención** generadas automáticamente"
        },
        {
          title: "👥 Roles y Permisos Avanzados",
          content: "- **Usuarios registrados** - Acceso básico a propiedades\n- **Vendedores verificados** - Publicación y gestión de propiedades\n- **Agentes inmobiliarios** - Gestión de clientes y transacciones\n- **Abogados** - Manejo legal y contratos\n- **Administradores** - Control total del sistema"
        },
        {
          title: "📊 Dashboard y Analytics",
          content: "- **Métricas en tiempo real** por usuario/rol\n- **Análisis financiero** (ROI, VPN, TIR)\n- **Seguimiento de negociaciones** activas\n- **Reportes de rendimiento** por agente"
        },
        {
          title: "💬 Comunicación Integrada",
          content: "- **Chat en tiempo real** entre partes interesadas\n- **Sistema de notificaciones** push y email\n- **Documentos legales** compartidos y versionados\n- **Feedback de visitas** estructurado"
        },
        {
          title: "🔐 Seguridad y Confianza",
          content: "- **Row Level Security (RLS)** en todas las tablas\n- **Autenticación robusta** con Supabase Auth\n- **Auditoría completa** de todas las acciones\n- **Backup automático** y recuperación de datos"
        }
      ]
    },
    {
      id: "tech-stack",
      title: "🛠️ Tecnologías y Arquitectura",
      icon: <Code className="w-5 h-5" />,
      subsections: [
        {
          title: "Frontend Stack",
          content: "- **React 18** - Framework principal\n- **TypeScript** - Tipado estático\n- **Tailwind CSS** - Framework de estilos\n- **shadcn/ui** - Componentes UI preconstruidos\n- **Framer Motion** - Animaciones fluidas\n- **Recharts** - Visualizaciones de datos\n- **React Hook Form** - Manejo de formularios\n- **date-fns** - Utilidades de fechas"
        },
        {
          title: "Backend Stack",
          content: "- **Supabase** - Backend as a Service\n- **PostgreSQL** - Base de datos relacional\n- **Supabase Auth** - Autenticación y autorización\n- **Supabase Storage** - Almacenamiento de archivos\n- **Supabase Edge Functions** - Funciones serverless\n- **PostGIS** - Extensiones geoespaciales"
        },
        {
          title: "Infraestructura y Despliegue",
          content: "- **Vercel** - Plataforma de despliegue\n- **Supabase Cloud** - Base de datos en producción\n- **CDN Global** - Distribución de contenido\n- **SSL Automático** - Certificados de seguridad"
        },
        {
          title: "Integraciones Externas",
          content: "- **Google Maps API** - Mapas interactivos\n- **Stripe/PayPal** - Procesamiento de pagos\n- **Crypto APIs** - Pagos con criptomonedas\n- **Email Service** - Notificaciones por email"
        }
      ]
    },
    {
      id: "setup",
      title: "🚀 Setup y Desarrollo",
      icon: <Settings className="w-5 h-5" />,
      content: `
### Opción 1: Setup Automático (Recomendado)
\`\`\`bash
# Ejecutar script de configuración completa
./setup-complete.sh
\`\`\`

### Opción 2: Setup Manual

#### 1. Requisitos Previos
\`\`\`bash
# Node.js 18+
node --version

# Supabase CLI
npm install -g supabase

# Git
git --version
\`\`\`

#### 2. Clonar y Instalar
\`\`\`bash
# Clonar repositorio
git clone https://github.com/dlr1251/sunday-properties-app.git
cd sunday-properties-app

# Instalar dependencias
npm install
\`\`\`

#### 3. Configurar Supabase
\`\`\`bash
# Login en Supabase
supabase login

# Crear proyecto (desarrollo local)
supabase start

# O conectar proyecto remoto
supabase link --project-ref YOUR_PROJECT_REF
\`\`\`

#### 4. Variables de Entorno
\`\`\`bash
# Copiar archivo de ejemplo
cp env.example .env.local

# Configurar variables requeridas
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
\`\`\`

#### 5. Base de Datos
\`\`\`bash
# Ejecutar migraciones
supabase db push

# Cargar datos de prueba
supabase seed
\`\`\`

#### 6. Desarrollo Local
\`\`\`bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:5173
\`\`\`

#### 7. Despliegue a Producción
\`\`\`bash
# Build de producción
npm run build

# Desplegar a Vercel
vercel --prod
\`\`\`
      `
    },
    {
      id: "architecture",
      title: "📁 Estructura del Proyecto",
      icon: <Database className="w-5 h-5" />,
      content: `
\`\`\`
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
│   ├── migrations/         # Migraciones SQL (25 archivos)
│   ├── functions/          # Edge functions
│   ├── seed.sql            # Datos de prueba
│   └── config.toml         # Configuración Supabase
├── public/                 # Assets estáticos
├── scripts/                # Scripts de automatización
└── docs/                   # Documentación adicional
\`\`\`
      `
    },
    {
      id: "database",
      title: "🗄️ Base de Datos y Esquemas",
      icon: <Database className="w-5 h-5" />,
      subsections: [
        {
          title: "Arquitectura General",
          content: "La base de datos sigue una arquitectura relacional normalizada con **25+ tablas** organizadas en módulos lógicos:\n\n- **Autenticación**: `auth.users`, `public.profiles`\n- **Propiedades**: `properties`, `property_availability`\n- **Negociación**: `offers`, `counter_offers`, `negotiation_rules`\n- **Legal**: `cases`, `case_documents`, `contracts`\n- **Comunicación**: `chat_messages`, `notifications`\n- **Sistema**: `audit_logs`, `platform_settings`"
        },
        {
          title: "Tablas Principales",
          content: "| Tabla | Descripción | Relaciones |\n|-------|-------------|------------|\n| **profiles** | Perfiles extendidos de usuarios | 1:1 con auth.users |\n| **properties** | Propiedades inmobiliarias | 1:many con offers, visits |\n| **offers** | Ofertas de compra | many:1 con properties/users |\n| **negotiation_rules** | Reglas de negociación por propiedad | 1:1 con properties |\n| **counter_offers** | Contraofertas en negociaciones | many:1 con offers |\n| **cases** | Casos legales | 1:many con case_documents |\n| **notifications** | Sistema de notificaciones | many:1 con users |\n| **audit_logs** | Logs de auditoría | - |"
        },
        {
          title: "Funciones SQL Avanzadas",
          content: "- **Validación automática** de ofertas\n- **Cálculo de progreso** de negociaciones\n- **Triggers para notificaciones** en tiempo real\n- **Funciones de búsqueda** geoespacial\n- **Cálculos financieros** automáticos"
        },
        {
          title: "Políticas de Seguridad (RLS)",
          content: "- **Usuarios**: Solo ven sus propios datos\n- **Agentes**: Acceden a propiedades asignadas\n- **Abogados**: Gestionan casos asignados\n- **Admins**: Acceso completo al sistema"
        }
      ]
    },
    {
      id: "test-users",
      title: "👥 Usuarios de Prueba",
      icon: <Users className="w-5 h-5" />,
      subsections: [
        {
          title: "Información General",
          content: "- **Contraseña universal**: `password123`\n- **Dominio**: `@sunday.com` o `@mailinator.com`\n- **Roles**: user, agent, lawyer, admin"
        },
        {
          title: "Vendedores",
          content: "| Usuario | Email | Tipo | Propiedades | Ubicación |\n|---------|-------|------|-------------|-----------|\n| **Juan Pérez** | juan.perez.test@mailinator.com | verified | 1 | El Poblado |\n| **Carlos Rodríguez** | carlos.rodriguez.test@mailinator.com | verified | 1 | Laureles |\n| **Luis Hernández** | luis.hernandez.test@mailinator.com | verified | 1 | Envigado |\n| **Diego González** | diego.gonzalez.test@mailinator.com | verified | 1 | Sabaneta |\n| **Santiago Torres** | santiago.torres.test@mailinator.com | verified | 1 | Rionegro |"
        },
        {
          title: "Compradores",
          content: "| Usuario | Email | Tipo | Ofertas | Actividad |\n|---------|-------|------|---------|-----------|\n| **María García** | maria.garcia.test@mailinator.com | verified | 2 | Agente profesional |\n| **Ana Martínez** | ana.martinez.test@mailinator.com | verified | 1 | Compradora activa |\n| **Sofía López** | sofia.lopez.test@mailinator.com | verified | 1 | Primera compra |\n| **Valentina Ramírez** | valentina.ramirez.test@mailinator.com | verified | 1 | Inversión |\n| **Isabella Jiménez** | isabella.jimenez.test@mailinator.com | verified | 1 | Relocalización |"
        },
        {
          title: "Agentes/Abogados",
          content: "| Usuario | Email | Rol | Especialización |\n|---------|-------|-----|----------------|\n| **Laura Fernandez** | laura.fernandez@sunday.com | lawyer | Contratos |\n| **David Morales** | david.morales@sunday.com | lawyer | Due diligence |\n| **Andrea Villa** | andrea.villa@sunday.com | agent | El Poblado |\n| **Carlos Rengifo** | carlos.rengifo@sunday.com | agent | Zona Norte |"
        },
        {
          title: "Administradores",
          content: "| Usuario | Email | Nivel | Acceso |\n|---------|-------|-------|--------|\n| **Admin Principal** | admin@sunday.com | superadmin | Completo |\n| **Admin Secundario** | admin2@sunday.com | admin | Limitado |"
        }
      ]
    },
    {
      id: "testing",
      title: "🧪 Escenarios de Testing",
      icon: <TestTube className="w-5 h-5" />,
      subsections: [
        {
          title: "Flujos de Prueba Recomendados",
          content: "#### **Flujo 1: Negociación Completa**\n1. **Vendedor** configura reglas de negociación\n2. **Comprador** crea oferta con Smart Form\n3. Sistema valida oferta automáticamente\n4. **Vendedor** recibe notificación y analiza\n5. **Contraoferta** generada con IA\n6. **Carta de intención** creada\n7. **Abogado** revisa y aprueba\n\n#### **Flujo 2: Gestión de Visitas**\n1. **Usuario** agenda visita pagada\n2. **Agente** confirma y coordina\n3. **Sistema** genera NDA digital\n4. **Usuario** completa visita\n5. **Feedback** estructurado registrado\n6. **Documentos** desbloqueados\n\n#### **Flujo 3: Panel de Administración**\n1. **Admin** revisa métricas globales\n2. Gestiona usuarios y roles\n3. Aprueba propiedades premium\n4. Resuelve reportes/denuncias\n5. Configura parámetros globales"
        },
        {
          title: "Casos de Prueba por Rol",
          content: "#### **Usuario Regular**\n- ✅ Explorar propiedades públicas\n- ✅ Gestionar perfil y favoritos\n- ✅ Agendar visitas\n- ❌ Gestionar propiedades ajenas\n\n#### **Agente Inmobiliario**\n- ✅ Publicar propiedades\n- ✅ Gestionar clientes asignados\n- ✅ Crear ofertas en nombre de clientes\n- ✅ Ver métricas de rendimiento\n\n#### **Abogado**\n- ✅ Gestionar casos legales\n- ✅ Revisar contratos y documentos\n- ✅ Participar en negociaciones\n- ✅ Validar términos legales\n\n#### **Administrador**\n- ✅ Acceso completo al sistema\n- ✅ Gestionar usuarios y permisos\n- ✅ Ver logs de auditoría\n- ✅ Configurar plataforma"
        },
        {
          title: "Métricas de Éxito",
          content: "- ✅ Login exitoso con todos los usuarios\n- ✅ Navegación fluida entre componentes\n- ✅ Notificaciones en tiempo real\n- ✅ Validación automática de ofertas\n- ✅ Visualizaciones renderizando datos\n- ✅ Diseño responsive funcional"
        }
      ]
    },
    {
      id: "implemented",
      title: "📋 Funcionalidades Implementadas",
      icon: <CheckCircle className="w-5 h-5" />,
      subsections: [
        {
          title: "Sistema Completo de Negociación",
          content: "- **8 componentes UI** completamente funcionales\n- **Hook personalizado** `useNegotiation` con lógica completa\n- **Base de datos extendida** con 15+ nuevas tablas\n- **Visualizaciones avanzadas** (radar charts, timelines)\n- **Sistema de contraofertas** con diálogos modales\n- **Asesoría IA** con 3 niveles de inteligencia"
        },
        {
          title: "Integración Completa",
          content: "- **PropertyUploadWizard** - Paso de reglas de negociación\n- **PropertyDetailView** - Integración SmartOfferForm\n- **NegotiationPanelView** - Overhaul completo\n- **Sistema de notificaciones** en tiempo real\n- **Animaciones fluidas** con Framer Motion"
        },
        {
          title: "Seguridad y Rendimiento",
          content: "- **Row Level Security** en todas las tablas\n- **Auditoría completa** de acciones\n- **Optimización de queries** con índices\n- **Cache inteligente** de datos"
        },
        {
          title: "Datos de Prueba Completos",
          content: "- **10 usuarios** de prueba con roles variados\n- **5 propiedades** realistas con datos completos\n- **7 ofertas** con diferentes estados\n- **Historial completo** de negociaciones\n- **100+ notificaciones** de ejemplo"
        }
      ]
    },
    {
      id: "roadmap",
      title: "🗺️ Roadmap y Plan de Desarrollo",
      icon: <MapPin className="w-5 h-5" />,
      subsections: [
        {
          title: "Fase 1: Core System (Completada ✅)",
          content: "- [x] Autenticación y autorización\n- [x] Gestión básica de propiedades\n- [x] Sistema de usuarios y roles\n- [x] Base de datos fundamental"
        },
        {
          title: "Fase 2: Advanced Negotiation (Completada ✅)",
          content: "- [x] Sistema de negociación con IA\n- [x] Visualizaciones avanzadas\n- [x] Notificaciones en tiempo real\n- [x] Contraofertas inteligentes"
        },
        {
          title: "Fase 3: Business Logic Expansion (En Progreso 🔄)",
          content: "#### **3.1 Enhanced Property Management**\n- [ ] **Sistema de disponibilidad** avanzado por horarios\n- [ ] **Integración con tours virtuales** (Matterport)\n- [ ] **Sistema de matching** comprador-propiedad con IA\n- [ ] **Valoración automática** de propiedades\n\n#### **3.2 Advanced Financial Tools**\n- [ ] **Calculadora de hipotecas** integrada\n- [ ] **Análisis de mercado** con datos históricos\n- [ ] **Predicciones de precio** con ML\n- [ ] **Reportes financieros** automatizados\n\n#### **3.3 Communication Enhancement**\n- [ ] **Video llamadas** integradas para visitas virtuales\n- [ ] **Sistema de broadcast** para agentes\n- [ ] **Templates de email** personalizables\n- [ ] **Integración WhatsApp** para notificaciones"
        },
        {
          title: "Fase 4: Scale & Optimization (Planificada 📋)",
          content: "#### **4.1 Performance & Scale**\n- [ ] **Microservicios** para funcionalidades críticas\n- [ ] **CDN avanzado** para imágenes y videos\n- [ ] **Cache distribuido** (Redis)\n- [ ] **Load balancing** automático\n\n#### **4.2 Advanced Analytics**\n- [ ] **Dashboard ejecutivo** con KPIs avanzados\n- [ ] **Machine Learning** para recomendaciones\n- [ ] **Predictive analytics** para mercado inmobiliario\n- [ ] **A/B testing** para UI/UX\n\n#### **4.3 Mobile App**\n- [ ] **React Native app** para iOS/Android\n- [ ] **Offline capabilities** para visitas\n- [ ] **Push notifications** nativas\n- [ ] **Biometric authentication**"
        },
        {
          title: "Fase 5: Ecosystem Integration (Futuro 🚀)",
          content: "#### **5.1 Third-party Integrations**\n- [ ] **Integración con bancos** para pre-aprobaciones\n- [ ] **API para agentes externos**\n- [ ] **Marketplaces** integración (Mercado Libre, etc.)\n- [ ] **Blockchain** para contratos inteligentes\n\n#### **5.2 Advanced Features**\n- [ ] **VR/AR** para tours inmobiliarios\n- [ ] **IoT integration** para smart homes\n- [ ] **Sustainability scoring** de propiedades\n- [ ] **Community features** y networking"
        }
      ]
    },
    {
      id: "commands",
      title: "🔧 Comandos Útiles",
      icon: <Settings className="w-5 h-5" />,
      content: `
### Desarrollo Local
\`\`\`bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview de build local
npm run type-check       # Verificación de tipos
\`\`\`

### Base de Datos
\`\`\`bash
supabase start           # Iniciar Supabase local
supabase db push         # Aplicar migraciones
supabase db reset        # Reset completo + seed
supabase gen types       # Generar tipos TypeScript
supabase logs            # Ver logs en tiempo real
\`\`\`

### Testing
\`\`\`bash
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Reporte de cobertura
\`\`\`

### Despliegue
\`\`\`bash
vercel dev               # Desarrollo con Vercel
vercel --prod            # Desplegar a producción
vercel env add           # Agregar variable de entorno
vercel domains add       # Agregar dominio personalizado
\`\`\`

### Git Workflow
\`\`\`bash
git checkout -b feature/nueva-funcionalidad
git add .
git commit -m "feat: descripción clara"
git push origin feature/nueva-funcionalidad
# Crear PR en GitHub
\`\`\`
      `
    }
  ]
};

export const DocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('general');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={index} className="text-md font-medium text-gray-700 mt-4 mb-2">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="text-gray-600 ml-4">{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      if (line.startsWith('|')) {
        // Table row - collect all table rows
        const tableRows: JSX.Element[] = [];
        let tableStart = index;
        let isHeader = true;

        // Collect all table rows starting from current line
        let currentIndex = index;
        while (currentIndex < content.split('\n').length && content.split('\n')[currentIndex].startsWith('|')) {
          const cells = content.split('\n')[currentIndex].split('|').slice(1, -1).map(cell => cell.trim());

          if (isHeader && cells.length > 0) {
            // Header row
            tableRows.push(
              <tr key={currentIndex} className="bg-gray-50">
                {cells.map((cell, cellIndex) => (
                  <th key={cellIndex} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    {cell}
                  </th>
                ))}
              </tr>
            );
            isHeader = false;

            // Skip separator row if it exists
            if (currentIndex + 1 < content.split('\n').length && content.split('\n')[currentIndex + 1].includes('---')) {
              currentIndex++;
            }
          } else if (cells.length > 0) {
            // Data row
            tableRows.push(
              <tr key={currentIndex} className="border-b border-gray-200 hover:bg-gray-50">
                {cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100 last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            );
          }
          currentIndex++;
        }

        // Skip the processed table rows
        index = currentIndex - 1;

        return (
          <div key={tableStart} className="overflow-x-auto my-6">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
              <tbody>
                {tableRows}
              </tbody>
            </table>
          </div>
        );
      }
      if (line.startsWith('```')) {
        return <pre key={index} className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto"><code>{line.replace('```', '')}</code></pre>;
      }
      return <p key={index} className="text-gray-600 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mt-20">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                {sidebarOpen && <h2 className="text-lg font-semibold text-gray-800">Documentación</h2>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4 space-y-2">
              {readmeContent.sections.map((section) => (
                <div key={section.id}>
                  <Button
                    variant={activeSection === section.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.icon}
                    {sidebarOpen && (
                      <>
                        <span className="ml-2 truncate">{section.title}</span>
                        {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </>
                    )}
                  </Button>

                  {sidebarOpen && section.subsections && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.subsections.map((subsection, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left text-sm text-gray-600 hover:text-gray-800"
                          onClick={() => scrollToSection(`${section.id}-${index}`)}
                        >
                          {subsection.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 p-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{readmeContent.title}</h1>
                <p className="text-sm text-gray-600">Última actualización: {readmeContent.lastUpdated}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Documentación Completa
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  v2.0
                </Badge>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-8 max-w-4xl mx-auto">
              {readmeContent.sections.map((section) => (
                <div key={section.id} id={section.id} className="mb-12">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        {section.icon}
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none">
                      {section.content && renderMarkdown(section.content)}

                      {section.subsections && (
                        <div className="space-y-6 mt-6">
                          {section.subsections.map((subsection, index) => (
                            <div key={index} id={`${section.id}-${index}`}>
                              <Separator className="mb-4" />
                              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                {subsection.title}
                              </h3>
                              <div className="text-gray-600 leading-relaxed">
                                {renderMarkdown(subsection.content)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Footer */}
              <Card className="mt-12">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                    <Shield className="w-6 h-6 text-green-600" />
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    ¡Sunday Properties está revolucionando el mercado inmobiliario en Medellín!
                  </h3>
                  <p className="text-gray-600">
                    Tecnología de vanguardia para una experiencia inmobiliaria excepcional.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button variant="outline" size="sm">
                      <Home className="w-4 h-4 mr-2" />
                      Ir al Inicio
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Usuarios de Prueba
                    </Button>
                    <Button size="sm">
                      <TestTube className="w-4 h-4 mr-2" />
                      Empezar Testing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
