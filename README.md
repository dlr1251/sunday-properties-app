# 🏠 Sunday Properties

Una plataforma inmobiliaria moderna para Medellín, construida con React, TypeScript, Tailwind CSS y Supabase.

## ✨ Características

- 🏠 **Gestión de propiedades** - Publica, edita y gestiona propiedades
- 📱 **Diseño responsive** - Mobile-first, optimizado para todos los dispositivos
- 🔐 **Autenticación segura** - Login con email, Google, Facebook
- 💰 **Análisis financiero** - Calculadoras de ROI, VPN, IRR
- 📊 **Dashboard de métricas** - Estadísticas en tiempo real
- 🗺️ **Integración con mapas** - Visualización geográfica de propiedades
- 💬 **Sistema de ofertas** - Negociación segura entre compradores y vendedores
- 📅 **Gestión de visitas** - Programación y seguimiento de visitas
- 📄 **Contratos digitales** - Generación y firma de contratos

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Despliegue**: Vercel
- **Base de datos**: PostgreSQL con Row Level Security
- **Autenticación**: Supabase Auth
- **Mapas**: Google Maps API
- **Pagos**: Stripe, PayPal, Crypto

## 🚀 Setup Rápido

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar script de configuración completa
./setup-complete.sh
```

### Opción 2: Setup Manual

#### 1. Instalar dependencias
```bash
npm install
```

#### 2. Configurar Supabase
```bash
# Login en Supabase
supabase login

# Crear proyecto
supabase projects create "sunday-properties" --region us-east-1

# Vincular proyecto
supabase link --project-ref YOUR_PROJECT_REF

# Desplegar esquema
supabase db push
```

#### 3. Configurar variables de entorno
```bash
# Crear archivo .env.local
cp env.example .env.local

# Actualizar con tus valores de Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 4. Desplegar a Vercel
```bash
# Login en Vercel
vercel login

# Desplegar
vercel --prod
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI (shadcn)
│   ├── home/           # Componentes de inicio
│   ├── real-estate/    # Componentes inmobiliarios
│   └── ...
├── hooks/              # Hooks personalizados
│   └── useSupabase.ts  # Hooks para Supabase
├── lib/                # Configuración y utilidades
│   └── supabase.ts     # Cliente Supabase
├── types/              # Tipos TypeScript
│   └── database.ts     # Tipos de base de datos
├── data/               # Datos mock
│   └── mockData.ts     # Datos de ejemplo
└── utils/              # Utilidades
    └── imageUtils.ts   # Utilidades de imágenes

supabase/
└── schema.sql          # Scripts de base de datos

vercel.json             # Configuración de Vercel
```

## 🗄️ Base de Datos

### Tablas principales:
- **users** - Usuarios del sistema
- **properties** - Propiedades inmobiliarias
- **visits** - Visitas programadas
- **offers** - Ofertas de compra
- **contracts** - Contratos digitales
- **notifications** - Sistema de notificaciones
- **financial_analysis** - Análisis financiero

### Políticas de seguridad:
- Row Level Security (RLS) habilitado
- Políticas personalizadas por tabla
- Autenticación requerida para operaciones sensibles

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview de producción

# Supabase
supabase start           # Iniciar Supabase local
supabase db push         # Desplegar esquema
supabase gen types       # Generar tipos TypeScript

# Vercel
vercel dev               # Desarrollo con Vercel
vercel --prod            # Desplegar a producción
vercel env add           # Agregar variable de entorno

# Git
git add .                # Agregar cambios
git commit -m "feat: ..." # Commit con mensaje
git push                 # Subir cambios
```

## 🌐 URLs Importantes

- **GitHub**: https://github.com/dlr1251/sunday-properties-app
- **Vercel**: (Se genera automáticamente)
- **Supabase Dashboard**: (Tu proyecto específico)

## 📚 Documentación

- [Guía de Despliegue](DEPLOYMENT.md) - Instrucciones detalladas
- [Supabase Docs](https://supabase.com/docs) - Documentación oficial
- [Vercel Docs](https://vercel.com/docs) - Documentación de Vercel

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel
2. Verifica la configuración en Supabase
3. Consulta la documentación oficial
4. Abre un issue en GitHub

---

**¡Sunday Properties está listo para revolucionar el mercado inmobiliario en Medellín! 🚀**