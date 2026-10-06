# Sunday Properties - Guía de Despliegue

Esta guía te ayudará a desplegar Sunday Properties en Vercel con Supabase como base de datos.

## 🚀 Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y la clave anónima

### 2. Configurar la base de datos

1. Ve al SQL Editor en tu proyecto de Supabase
2. Ejecuta el script `supabase/schema.sql` para crear las tablas
3. Verifica que todas las tablas se hayan creado correctamente

### 3. Configurar autenticación

1. Ve a Authentication > Settings en Supabase
2. Configura los providers que necesites (Email, Google, etc.)
3. Ajusta las políticas de seguridad según tus necesidades

## 🌐 Despliegue en Vercel

### 1. Preparar el proyecto

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local con tus variables
cp .env.example .env.local
```

### 2. Configurar variables de entorno

Edita `.env.local` con tus valores reales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_APP_NAME=Sunday Properties
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

### 3. Desplegar en Vercel

#### Opción A: Desde la interfaz web

1. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
2. Importa el repositorio de Sunday Properties
3. Configura las variables de entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_NAME`
   - `VITE_APP_VERSION`
   - `VITE_APP_ENV`
4. Haz clic en "Deploy"

#### Opción B: Desde la línea de comandos

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Seguir las instrucciones para configurar el proyecto
```

### 4. Configurar dominio personalizado (opcional)

1. Ve a tu proyecto en Vercel
2. Ve a Settings > Domains
3. Agrega tu dominio personalizado
4. Configura los registros DNS según las instrucciones

## 📊 Configuración adicional

### 1. Analytics (opcional)

Para agregar Google Analytics:

```env
VITE_GOOGLE_ANALYTICS_ID=tu-ga-id
```

### 2. Mapas (opcional)

Para integrar Google Maps:

```env
VITE_MAPS_API_KEY=tu-google-maps-api-key
```

### 3. Pagos (opcional)

Para integrar Stripe:

```env
VITE_STRIPE_PUBLIC_KEY=tu-stripe-public-key
```

## 🔧 Comandos útiles

```bash
# Desarrollo local
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint

# Verificar tipos
npm run type-check
```

## 📝 Estructura del proyecto

```
src/
├── components/          # Componentes React
├── hooks/              # Hooks personalizados
├── lib/                # Configuración de Supabase
├── types/              # Tipos TypeScript
├── data/               # Datos mock
├── utils/              # Utilidades
└── styles/             # Estilos globales

supabase/
└── schema.sql          # Scripts de base de datos

vercel.json             # Configuración de Vercel
.env.example             # Variables de entorno de ejemplo
```

## 🐛 Solución de problemas

### Error de conexión a Supabase

1. Verifica que las variables de entorno estén correctas
2. Asegúrate de que el proyecto de Supabase esté activo
3. Revisa las políticas RLS en Supabase

### Error de build en Vercel

1. Verifica que todas las dependencias estén en `package.json`
2. Revisa los logs de build en Vercel
3. Asegúrate de que no haya errores de TypeScript

### Problemas de autenticación

1. Verifica la configuración de autenticación en Supabase
2. Revisa las políticas de seguridad
3. Asegúrate de que los redirects estén configurados correctamente

## 📞 Soporte

Si tienes problemas con el despliegue:

1. Revisa los logs en Vercel
2. Verifica la configuración en Supabase
3. Consulta la documentación de [Vercel](https://vercel.com/docs) y [Supabase](https://supabase.com/docs)

## 🔄 Actualizaciones

Para actualizar el proyecto:

1. Haz push de los cambios a GitHub
2. Vercel desplegará automáticamente
3. Verifica que todo funcione correctamente

---

¡Tu aplicación Sunday Properties debería estar funcionando en producción! 🎉
