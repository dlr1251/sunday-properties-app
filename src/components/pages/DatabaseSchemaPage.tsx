import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Database,
  List,
  ChevronRight,
  Table,
  Key,
  Link,
  Shield,
  Zap,
  FileText,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

const databaseSchemaContent = {
  title: "🗄️ Esquema Completo de Base de Datos - Sunday Properties",
  lastUpdated: "Octubre 2025",
  stats: {
    tables: "25+",
    relations: "50+",
    functions: "20+",
    triggers: "15+",
    policies: "100+"
  },
  sections: [
    {
      id: "overview",
      title: "📊 Resumen Ejecutivo",
      icon: <Database className="w-5 h-5" />,
      content: `
### **Estadísticas de Base de Datos**
- **Total de Tablas:** 25+ tablas principales
- **Relaciones:** 50+ relaciones foreign key
- **Funciones SQL:** 20+ funciones personalizadas
- **Triggers:** 15+ triggers automáticos
- **Políticas RLS:** 100+ políticas de seguridad
- **Índices:** Optimizados para consultas complejas

### **Arquitectura General**
- **Modelo:** Relacional normalizado
- **Autenticación:** Supabase Auth integrado
- **Seguridad:** Row Level Security (RLS) completo
- **Tiempo Real:** Triggers y subscriptions
- **Escalabilidad:** Índices y particionamiento preparado
      `
    },
    {
      id: "architecture",
      title: "🏗️ Arquitectura General",
      icon: <Settings className="w-5 h-5" />,
      content: `
\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                          SUPABASE AUTH                              │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    auth.users                                   │ │
│  │  • id (UUID, PK)                                               │ │
│  │  • email (VARCHAR)                                             │ │
│  │  • encrypted_password                                          │ │
│  │  • email_confirmed_at                                          │ │
│  │  • created_at                                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:1
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          PROFILES                                   │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    public.profiles                              │ │
│  │  • id (UUID, PK, FK→auth.users)                                │ │
│  │  • full_name (VARCHAR)                                         │ │
│  │  • phone (VARCHAR)                                             │ │
│  │  • role (user|agent|lawyer|admin|super_admin)                  │ │
│  │  • status (active|inactive|suspended|pending)                  │ │
│  │  • avatar_url (TEXT)                                           │ │
│  │  • created_at, updated_at                                      │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌─────▼─────┐ ┌──────▼──────┐
            │   PROPERTIES │ │  VISITS   │ │   OFFERS    │
            │               │ │           │ │             │
            └───────────────┘ └───────────┘ └─────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │          CASES                │
                    │  (Casos legales completos)    │
                    └───────────────────────────────┘
\`\`\`
      `
    },
    {
      id: "auth-tables",
      title: "🎯 Sistema de Autenticación",
      icon: <Key className="w-5 h-5" />,
      tables: [
        {
          name: "auth.users",
          description: "Usuarios de Supabase Auth (built-in)",
          columns: [
            "id: UUID (Primary Key)",
            "email: VARCHAR(255) UNIQUE",
            "encrypted_password: TEXT",
            "email_confirmed_at: TIMESTAMPTZ",
            "invited_at: TIMESTAMPTZ",
            "confirmation_token: TEXT",
            "recovery_token: TEXT",
            "email_change_token: TEXT",
            "created_at: TIMESTAMPTZ",
            "updated_at: TIMESTAMPTZ",
            "phone: TEXT",
            "phone_confirmed_at: TIMESTAMPTZ",
            "confirmed_at: TIMESTAMPTZ",
            "last_sign_in_at: TIMESTAMPTZ",
            "raw_user_meta_data: JSONB",
            "raw_app_meta_data: JSONB",
            "is_super_admin: BOOLEAN"
          ]
        },
        {
          name: "public.profiles",
          description: "Perfiles extendidos de usuarios",
          columns: [
            "id: UUID (PK, FK→auth.users.id)",
            "full_name: VARCHAR(255)",
            "phone: VARCHAR(20)",
            "role: ENUM('user', 'agent', 'lawyer', 'admin', 'super_admin')",
            "status: ENUM('active', 'inactive', 'suspended', 'pending')",
            "avatar_url: TEXT",
            "bio: TEXT",
            "company: VARCHAR(255)",
            "license_number: VARCHAR(100)",
            "specializations: TEXT[]",
            "languages: TEXT[]",
            "experience_years: INTEGER",
            "verified_at: TIMESTAMPTZ",
            "created_at: TIMESTAMPTZ",
            "updated_at: TIMESTAMPTZ"
          ],
          relations: "1:1 con auth.users"
        }
      ]
    },
    {
      id: "properties-tables",
      title: "🏠 Sistema de Propiedades",
      icon: <Table className="w-5 h-5" />,
      tables: [
        {
          name: "public.properties",
          description: "Tabla principal de propiedades",
          columns: [
            "id: UUID (Primary Key)",
            "title: VARCHAR(255) NOT NULL",
            "description: TEXT NOT NULL",
            "address: VARCHAR(500) NOT NULL",
            "neighborhood: VARCHAR(100) NOT NULL",
            "city: VARCHAR(100) NOT NULL DEFAULT 'Medellín'",
            "state: VARCHAR(100) DEFAULT 'Antioquia'",
            "country: VARCHAR(100) DEFAULT 'Colombia'",
            "coordinates: JSONB (lat, lng)",
            "property_type: ENUM('apartment', 'house', 'townhouse', 'office', 'commercial')",
            "transaction_type: ENUM('sale', 'rent') DEFAULT 'sale'",
            "price: BIGINT NOT NULL",
            "currency: VARCHAR(3) DEFAULT 'COP'",
            "minimum_offer_price: BIGINT",
            "monthly_costs: INTEGER",
            "area: INTEGER NOT NULL (m²)",
            "bedrooms: INTEGER DEFAULT 0",
            "bathrooms: INTEGER DEFAULT 0",
            "parking: INTEGER DEFAULT 0",
            "floor: INTEGER",
            "total_floors: INTEGER",
            "year_built: INTEGER",
            "strata: INTEGER CHECK (1-6)",
            "features: TEXT[] (pool, gym, security, etc.)",
            "images: TEXT[] (URLs)",
            "virtual_tour: TEXT (URL)",
            "video: TEXT (URL)",
            "floor_plan: TEXT (URL)",
            "status: ENUM('draft', 'pending', 'published', 'sold', 'rented', 'archived')",
            "verified: BOOLEAN DEFAULT FALSE",
            "premium: BOOLEAN DEFAULT FALSE",
            "owner_id: UUID (FK→profiles.id)",
            "agent_id: UUID (FK→profiles.id)",
            "tags: TEXT[]",
            "created_at: TIMESTAMPTZ",
            "updated_at: TIMESTAMPTZ",
            "published_at: TIMESTAMPTZ"
          ],
          relations: "1:many con offers, visits, favorites, reports, cases, contracts, negotiation_rules"
        },
        {
          name: "public.property_availability",
          description: "Horarios de disponibilidad de propiedades",
          columns: [
            "id: UUID (PK)",
            "property_id: UUID (FK→properties.id)",
            "day_of_week: INTEGER (0-6, 0=Sunday)",
            "start_time: TIME",
            "end_time: TIME",
            "is_available: BOOLEAN DEFAULT TRUE",
            "created_at: TIMESTAMPTZ",
            "updated_at: TIMESTAMPTZ"
          ]
        },
        {
          name: "public.blocked_dates",
          description: "Fechas bloqueadas para visitas",
          columns: [
            "id: UUID (PK)",
            "property_id: UUID (FK→properties.id)",
            "blocked_date: DATE",
            "reason: TEXT",
            "created_by: UUID (FK→auth.users.id)",
            "created_at: TIMESTAMPTZ"
          ]
        }
      ]
    },
    {
      id: "negotiation-tables",
      title: "🤝 Sistema de Negociación",
      icon: <Zap className="w-5 h-5" />,
      tables: [
        {
          name: "public.offers",
          description: "Ofertas de compra",
          columns: [
            "id: UUID (Primary Key)",
            "property_id: UUID (FK→properties.id)",
            "buyer_id: UUID (FK→profiles.id)",
            "agent_id: UUID (FK→profiles.id)",
            "lawyer_id: UUID (FK→profiles.id)",
            "offer_price: BIGINT NOT NULL",
            "currency: VARCHAR(3) DEFAULT 'COP'",
            "payment_method: ENUM('cash', 'bank_transfer', 'crypto')",
            "financing: BOOLEAN DEFAULT FALSE",
            "financing_details: JSONB",
            "conditions: TEXT[]",
            "closing_date: DATE",
            "status: ENUM('pending', 'accepted', 'rejected', 'countered', 'expired', 'cancelled')",
            "rejection_reason: TEXT",
            "ai_score: DECIMAL(3,2) (0.00-1.00)",
            "ai_feedback: TEXT",
            "created_at: TIMESTAMPTZ",
            "updated_at: TIMESTAMPTZ"
          ],
          relations: "1:many con counter_offers, offer_history, offer_attachments, intent_letters, contracts, cases"
        },
        {
          name: "public.counter_offers",
          description: "Contraofertas en negociaciones",
          columns: [
            "id: UUID (PK)",
            "offer_id: UUID (FK→offers.id)",
            "proposer_id: UUID (FK→profiles.id)",
            "counter_price: BIGINT NOT NULL",
            "conditions: TEXT[]",
            "reason: TEXT",
            "status: ENUM('pending', 'accepted', 'rejected')",
            "ai_analysis: JSONB",
            "created_at: TIMESTAMPTZ"
          ]
        },
        {
          name: "public.negotiation_rules",
          description: "Reglas de negociación por propiedad",
          columns: [
            "id: UUID (PK)",
            "property_id: UUID (FK→properties.id)",
            "min_price: BIGINT",
            "max_closing_days: INTEGER",
            "required_payment_methods: VARCHAR(20)[]",
            "auto_reject_enabled: BOOLEAN DEFAULT TRUE",
            "manual_review_threshold: BOOLEAN DEFAULT FALSE",
            "special_conditions: TEXT[]",
            "created_at: TIMESTAMPTZ",
            "updated_at: TIMESTAMPTZ"
          ]
        },
        {
          name: "public.intent_letters",
          description: "Cartas de intención (promesas)",
          columns: [
            "id: UUID (PK)",
            "offer_id: UUID (FK→offers.id)",
            "title: VARCHAR(255)",
            "content: TEXT",
            "template_used: VARCHAR(100)",
            "status: ENUM('draft', 'sent', 'accepted', 'rejected')",
            "signed_by_buyer: BOOLEAN DEFAULT FALSE",
            "signed_by_seller: BOOLEAN DEFAULT FALSE",
            "signed_at: TIMESTAMPTZ",
            "created_at: TIMESTAMPTZ",
            "updated_at: TIMESTAMPTZ"
          ]
        }
      ]
    },
    {
      id: "relations-diagram",
      title: "🔗 Diagrama Completo de Relaciones",
      icon: <Link className="w-5 h-5" />,
      content: `
\`\`\`
auth.users (Supabase Auth)
├── 1:1 public.profiles
│   ├── 1:many public.properties (owner_id)
│   ├── 1:many public.offers (buyer_id, agent_id, lawyer_id)
│   ├── 1:many public.visits (visitor_id, agent_id)
│   ├── 1:many public.cases (lawyer_id, buyer_id, seller_id)
│   ├── 1:many public.chat_messages (sender_id, receiver_id)
│   ├── 1:many public.notifications (user_id)
│   ├── 1:many public.favorites (user_id)
│   ├── 1:many public.blog_posts (author_id)
│   ├── 1:many public.audit_logs (user_id)
│   ├── 1:many public.reports (reporter_id, reviewed_by)
│   ├── 1:many public.case_documents (signed_by, modified_by)
│   ├── 1:many public.contracts (buyer_id, seller_id)
│   ├── 1:many public.visit_feedback (user_id)
│   ├── 1:many public.offer_attachments (uploaded_by)
│   ├── 1:many public.blocked_dates (created_by)
│   └── 1:many public.platform_settings (updated_by)

public.properties
├── 1:many public.offers (property_id)
├── 1:many public.visits (property_id)
├── 1:many public.favorites (property_id)
├── 1:many public.property_availability (property_id)
├── 1:many public.blocked_dates (property_id)
├── 1:many public.reports (reported_property_id)
├── 1:many public.cases (property_id)
├── 1:many public.contracts (property_id)
└── 1:1 public.negotiation_rules (property_id)

public.offers
├── 1:many public.counter_offers (offer_id)
├── 1:many public.offer_history (offer_id)
├── 1:many public.offer_attachments (offer_id)
├── 1:1 public.intent_letters (offer_id)
├── 1:1 public.contracts (offer_id)
└── 1:1 public.cases (offer_id)

public.visits
├── 1:1 public.visit_feedback (visit_id)
└── 1:many public.reports (reported_visit_id)

public.cases
├── 1:many public.case_documents (case_id)
└── 1:many public.chat_messages (case_id)
\`\`\`
      `
    },
    {
      id: "security-policies",
      title: "🔐 Políticas de Seguridad (RLS)",
      icon: <Shield className="w-5 h-5" />,
      content: `
### **Principios Generales**
- **Usuarios autenticados** ven solo sus propios datos
- **Agentes** acceden a propiedades y clientes asignados
- **Abogados** gestionan casos asignados
- **Admins** tienen acceso completo
- **Datos sensibles** requieren verificación adicional

### **Políticas por Tabla**

#### **profiles**
\`\`\`sql
-- Users can read all profiles (for contact info)
-- Users can update only their own profile
-- Admins can update any profile
\`\`\`

#### **properties**
\`\`\`sql
-- Anyone can read published properties
-- Agents can create/update properties they own or are assigned to
-- Admins can manage all properties
\`\`\`

#### **offers**
\`\`\`sql
-- Buyers can read/write their own offers
-- Sellers can read offers on their properties
-- Agents can read/write offers they're involved in
-- Lawyers can read offers on their cases
\`\`\`
      `
    },
    {
      id: "functions-triggers",
      title: "⚡ Funciones SQL y Triggers",
      icon: <Zap className="w-5 h-5" />,
      subsections: [
        {
          title: "Funciones de Validación",
          content: `
- \`validate_offer_price()\` - Valida precios según reglas
- \`check_property_availability()\` - Verifica disponibilidad horaria
- \`validate_user_permissions()\` - Verifica permisos por rol
          `
        },
        {
          title: "Funciones de Cálculo",
          content: `
- \`calculate_negotiation_progress()\` - Progreso de negociación
- \`calculate_financial_metrics()\` - Métricas financieras
- \`estimate_property_value()\` - Valoración automática
          `
        },
        {
          title: "Triggers Automáticos",
          content: `
- \`audit_properties_changes\` - Registra cambios en propiedades
- \`audit_offers_changes\` - Registra cambios en ofertas
- \`audit_cases_changes\` - Registra cambios en casos
- \`notify_new_offer\` - Notifica ofertas nuevas
- \`notify_offer_status_change\` - Notifica cambios de estado
- \`validate_offer_before_insert\` - Valida ofertas antes de insertar
          `
        }
      ]
    },
    {
      id: "performance-indexes",
      title: "📊 Índices de Performance",
      icon: <FileText className="w-5 h-5" />,
      content: `
### **Índices Principales**
\`\`\`sql
-- Properties
CREATE INDEX idx_properties_location ON properties USING GIST(ST_Point(longitude, latitude));
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_type_status ON properties(property_type, status);
CREATE INDEX idx_properties_owner ON properties(owner_id);

-- Offers
CREATE INDEX idx_offers_property_status ON offers(property_id, status);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_created_at ON offers(created_at DESC);

-- Cases
CREATE INDEX idx_cases_lawyer_status ON cases(lawyer_id, status);
CREATE INDEX idx_cases_property ON cases(property_id);

-- Notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
\`\`\`

### **Índices de Texto Completo**
\`\`\`sql
-- Properties search
CREATE INDEX idx_properties_search ON properties USING GIN(to_tsvector('spanish', title || ' ' || description));

-- Users search
CREATE INDEX idx_profiles_search ON profiles USING GIN(to_tsvector('spanish', full_name || ' ' || COALESCE(bio, '')));
\`\`\`
      `
    }
  ]
};

export const DatabaseSchemaPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTables, setShowTables] = useState(true);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold text-gray-800 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="text-md font-medium text-gray-700 mt-4 mb-2">
            {line.replace('#### ', '')}
          </h4>
        );
      } else if (line.startsWith('|')) {
        // Table row
        const tableRows: JSX.Element[] = [];
        let tableStart = i;

        // Collect all table rows
        while (i < lines.length && lines[i].startsWith('|')) {
          tableRows.push(
            <tr key={i} className="border-b border-gray-200">
              {lines[i].split('|').slice(1, -1).map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 text-sm text-gray-700 border-r border-gray-200 last:border-r-0">
                  {cell.trim()}
                </td>
              ))}
            </tr>
          );
          i++;
        }

        elements.push(
          <div key={tableStart} className="overflow-x-auto my-4">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <tbody>
                {tableRows}
              </tbody>
            </table>
          </div>
        );
        i--; // Adjust for the outer loop increment
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="text-gray-600 ml-4 mb-1">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<br key={i} />);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <p key={i} className="text-gray-600 leading-relaxed font-semibold">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      } else if (line.startsWith('*') && line.endsWith('*')) {
        elements.push(
          <p key={i} className="text-gray-600 leading-relaxed italic">
            {line.replace(/\*/g, '')}
          </p>
        );
      } else if (line.startsWith('```')) {
        const codeLines: string[] = [];
        i++; // Skip the opening ```
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre key={i} className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto my-4">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
      } else {
        elements.push(
          <p key={i} className="text-gray-600 leading-relaxed">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  const renderTableColumns = (columns: string[]) => (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h5 className="font-medium text-gray-700 mb-2">Columnas:</h5>
      <div className="space-y-1">
        {columns.map((column, index) => (
          <div key={index} className="text-sm font-mono text-gray-600 bg-white px-3 py-1 rounded border">
            {column}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mt-20">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                {sidebarOpen && <h2 className="text-lg font-semibold text-gray-800">Database Schema</h2>}
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
              {databaseSchemaContent.sections.map((section) => (
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

                  {sidebarOpen && section.tables && showTables && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.tables.map((table, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left text-sm text-gray-600 hover:text-gray-800"
                          onClick={() => scrollToSection(`${section.id}-table-${index}`)}
                        >
                          📋 {table.name}
                        </Button>
                      ))}
                    </div>
                  )}

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
                <h1 className="text-2xl font-bold text-gray-900">{databaseSchemaContent.title}</h1>
                <p className="text-sm text-gray-600">Última actualización: {databaseSchemaContent.lastUpdated}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Table className="w-3 h-3" />
                  {databaseSchemaContent.stats.tables} Tables
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Link className="w-3 h-3" />
                  {databaseSchemaContent.stats.relations} Relations
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {databaseSchemaContent.stats.functions} Functions
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTables(!showTables)}
                  className="ml-2"
                >
                  {showTables ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-8 max-w-6xl mx-auto">
              {databaseSchemaContent.sections.map((section) => (
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

                      {section.tables && (
                        <div className="space-y-6 mt-6">
                          {section.tables.map((table, index) => (
                            <div key={index} id={`${section.id}-table-${index}`}>
                              <Separator className="mb-4" />
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                📋 {table.name}
                              </h3>
                              <p className="text-gray-600 mb-4">{table.description}</p>
                              {renderTableColumns(table.columns)}
                              {table.relations && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <Link className="w-4 h-4 inline mr-1" />
                                    <strong>Relaciones:</strong> {table.relations}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {section.subsections && (
                        <div className="space-y-6 mt-6">
                          {section.subsections.map((subsection, index) => (
                            <div key={index} id={`${section.id}-${index}`}>
                              <Separator className="mb-4" />
                              <h3 className="text-lg font-semibold text-gray-800 mb-3">
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
                    <Database className="w-6 h-6 text-blue-600" />
                    <Shield className="w-6 h-6 text-green-600" />
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Base de Datos Completa y Optimizada
                  </h3>
                  <p className="text-gray-600">
                    Arquitectura robusta preparada para producción con Sunday Properties
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Implementation Review
                    </Button>
                    <Button variant="outline" size="sm">
                      <Table className="w-4 h-4 mr-2" />
                      Ver Documentación
                    </Button>
                    <Button size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Ejecutar Seed
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
