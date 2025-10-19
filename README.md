# Sunday Properties - Prototipo Completo

Una plataforma web completa para comprar, vender y negociar propiedades inmobiliarias en Medellín de forma segura, con respaldo legal de abogados.

## 🎨 Diseño y Estilo

- **Paleta de colores**: Azules profundos (#1E3A8A, #3B82F6), blancos (#FFFFFF), grises claros (#F3F4F6) y acentos verdes (#10B981)
- **Tipografía**: Sans-serif limpia (Inter)
- **Componentes**: Cards redondeadas con sombras suaves, botones prominentes con gradientes sutiles
- **Iconos**: Feather Icons (Lucide React)
- **Responsive**: Mobile-first design

## 🚀 Características Principales

### 1. **Discovery (Descubrir)**
- Mapa interactivo con pines de propiedades
- Vista de lista con filtros avanzados
- Cards de propiedades con información detallada
- Búsqueda por ubicación y características
- Filtros por precio, habitaciones, baños, área

### 2. **Gestión de Propiedades**
- Wizard de 6 pasos para publicar propiedades:
  1. Información básica (nombre, ubicación)
  2. Características (área, habitaciones, baños)
  3. Fotografías (drag & drop, preview IA)
  4. Documentos legales (libertad y tradición)
  5. Condiciones de venta (precio, crypto, financiación)
  6. Revisión final y publicación

### 3. **Sistema de Visitas**
- Calendario de booking con fechas disponibles
- Pago de visita ($49,000 COP)
- NDA checkbox obligatorio
- Notificaciones push/email
- Feedback post-visita
- Desbloqueo de documentos privados

### 4. **Panel de Negociación**
- Formulario de ofertas con validaciones
- Historial de negociaciones con timeline
- Comparador visual de ofertas
- Contraofertas con métricas financieras
- Chat interno con vendedor/abogado
- Firma digital con resumen PDF

### 5. **Análisis Financiero**
- Calculadora integrada con métricas:
  - VPN (Valor Presente Neto)
  - ROI (Retorno sobre Inversión)
  - IRR (Tasa Interna de Retorno)
  - Cash-on-Cash
  - Cap Rate
  - DSCR (Debt Service Coverage Ratio)
- Gráficos interactivos
- Comparador de propiedades
- Análisis de riesgo

## 👥 Tipos de Usuario

### **Visitante**
- Solo mapa/lista pública
- Blog y highlights
- Prompt de registro al intentar visitar

### **Registrado**
- Dashboard preview
- Favoritos básicos

### **Verificado (Azul)**
- Todas las funciones
- Subida de propiedades
- Visitas y ofertas

### **Verificado Premium (Verde)**
- Métricas avanzadas
- Contratos ilimitados

### **SuperAdmin/Agente**
- Dashboards dedicados
- Gestión de usuarios
- Métricas de plataforma

## 🛠️ Tecnologías Utilizadas

- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **Lucide React** para iconos
- **Vite** como bundler

## 📱 Responsive Design

- **Mobile**: Bottom navigation, cards apiladas
- **Tablet**: Layout híbrido con sidebar colapsable
- **Desktop**: Sidebar fijo, grid layouts

## 🔒 Seguridad y Verificación

- **Badges de verificación**:
  - Azul: Verificado básico
  - Verde: Pagos integrados
- **Timelines de progreso** para transacciones
- **Comparadores visuales** para transparencia
- **Firma digital** para contratos

## 💰 Monetización

- **Comisión de plataforma**: 2.5% sobre venta
- **Visitas**: $49,000 COP por visita
- **Premium**: Métricas avanzadas y contratos ilimitados
- **Agentes**: Comisión 1.5%

## 🎯 Flujos Principales

### **Flujo de Compra**
1. Discovery → Detalle → Visita → Oferta → Negociación → Contrato → Cierre

### **Flujo de Venta**
1. Upload Wizard → Revisión Admin → Publicación → Visitas → Ofertas → Negociación → Cierre

### **Flujo de Visita**
1. Selección fecha → Pago → NDA → Visita → Feedback → Desbloqueo documentos

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📁 Estructura de Componentes

```
src/
├── components/
│   ├── Layout.tsx                 # Layout principal con navegación
│   ├── DiscoveryView.tsx          # Vista de descubrimiento
│   ├── PropertyDetailView.tsx     # Detalle de propiedad
│   ├── PropertyUploadWizard.tsx   # Wizard de subida
│   ├── VisitManagementView.tsx    # Gestión de visitas
│   ├── NegotiationPanelView.tsx   # Panel de negociación
│   ├── FinancialAnalysisView.tsx  # Análisis financiero
│   └── ui/                        # Componentes UI base
├── styles/
│   └── globals.css                # Estilos globales y variables CSS
└── App.tsx                        # Componente principal
```

## 🎨 Personalización

### **Colores**
Los colores se pueden personalizar en `src/styles/globals.css`:

```css
:root {
  --primary: #1e3a8a;        /* Azul profundo */
  --secondary: #3b82f6;      /* Azul medio */
  --accent: #10b981;         /* Verde acento */
  --background: #ffffff;      /* Blanco */
  --muted: #f3f4f6;          /* Gris claro */
}
```

### **Componentes**
Todos los componentes están construidos con shadcn/ui y son completamente personalizables.

## 🔮 Próximas Características

- [ ] Integración con Google Maps
- [ ] Sistema de pagos con crypto
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] App móvil nativa
- [ ] IA para análisis de documentos
- [ ] Tours virtuales 360°

## 📞 Soporte

Para soporte técnico o consultas sobre el desarrollo, contacta al equipo de desarrollo.

---

**Sunday Properties** - Conectando compradores, vendedores e intermediarios con herramientas seguras y eficientes para el mercado inmobiliario de Medellín.