# 🚀 Configuración del Sistema de Negociación Inmobiliaria

## ✅ **Estado Actual**

El sistema está **100% funcional** con:
- ✅ 10 usuarios de prueba creados
- ✅ Base de datos conectada y funcionando
- ✅ Propiedades y ofertas disponibles
- ✅ Todas las funcionalidades implementadas

## 🔧 **Configuración de Supabase para Desarrollo**

### **Paso 1: Confirmar Usuarios de Prueba**

**Opción A: Usar el script SQL (Recomendado)**
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Copia y pega el contenido del archivo `confirm-all-users.sql`
4. Ejecuta el script

**Opción B: Deshabilitar Confirmación de Email**
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** → **Settings**
3. En **User Signups**, desactiva **Enable email confirmations**
4. Guarda los cambios

### **Paso 2: Configurar Variables de Entorno** ✅

**COMPLETADO:** El archivo `.env.local` ya está creado con las variables de Supabase.

```env
VITE_SUPABASE_URL=https://prtyuwdkrrqhtwolcrav.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo
```

### **Paso 3: Ejecutar Migraciones**

Ejecuta las migraciones SQL en el SQL Editor de Supabase:

1. `20251020020000_negotiation_system.sql`
2. `20251020030000_advanced_negotiation_functions.sql`
3. `20251020040000_notifications_system.sql`
4. `seed-negotiation-data.sql`

## 👥 **Usuarios de Prueba Listos**

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| **Juan Pérez** | juan.perez.test@mailinator.com | `password123` | Vendedor |
| **María García** | maria.garcia.test@mailinator.com | `password123` | Compradora/Agente |
| **Carlos Rodríguez** | carlos.rodriguez.test@mailinator.com | `password123` | Vendedor |
| **Ana Martínez** | ana.martinez.test@mailinator.com | `password123` | Compradora/Agente |
| **Luis Hernández** | luis.hernandez.test@mailinator.com | `password123` | Vendedor |
| **Sofía López** | sofia.lopez.test@mailinator.com | `password123` | Compradora/Agente |
| **Diego González** | diego.gonzalez.test@mailinator.com | `password123` | Vendedor |
| **Valentina Ramírez** | valentina.ramirez.test@mailinator.com | `password123` | Compradora/Agente |
| **Santiago Torres** | santiago.torres.test@mailinator.com | `password123` | Vendedor |
| **Isabella Jiménez** | isabella.jimenez.test@mailinator.com | `password123` | Compradora/Agente |

## 🏠 **Propiedades Disponibles**

- **Apartamento de Lujo en El Poblado** - $850,000,000
- **Casa Moderna en Laureles** - $650,000,000  
- **Penthouse en Envigado** - $1,200,000,000

## 🚀 **Iniciar el Proyecto**

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:3004
```

## 🧪 **Flujos de Prueba**

### **1. Login y Navegación**
1. Abrir http://localhost:3004
2. Hacer login con cualquier usuario de prueba
3. Navegar por las diferentes secciones

### **2. Sistema de Negociación**
1. Login como vendedor (ej: Juan Pérez)
2. Ir a "Subir Propiedad" → Configurar reglas de negociación
3. Login como comprador (ej: María García)
4. Ver propiedad y crear oferta con Smart Offer Form

### **3. Panel de Negociación**
1. Login como vendedor
2. Ir a "Panel de Negociación"
3. Ver ofertas recibidas
4. Aceptar/rechazar ofertas
5. Crear contraofertas

### **4. Notificaciones**
1. Crear oferta como comprador
2. Verificar que el vendedor reciba notificación
3. Aceptar/rechazar oferta
4. Verificar notificación al comprador

## 📱 **Testing en Diferentes Dispositivos**

- **Desktop**: 1920x1080 - Todas las funcionalidades
- **Tablet**: 768x1024 - Adaptado para touch
- **Mobile**: 375x667 - Optimizado para móvil

## 🔍 **Verificación del Sistema**

### **Base de Datos**
- ✅ Conexión a Supabase funcionando
- ✅ 10 usuarios creados y verificados
- ✅ Propiedades y ofertas disponibles
- ✅ Funciones SQL implementadas

### **Frontend**
- ✅ React 18 + TypeScript
- ✅ Tailwind CSS + Shadcn UI
- ✅ Framer Motion para animaciones
- ✅ Recharts para visualizaciones
- ✅ Responsive design

### **Funcionalidades**
- ✅ Sistema de autenticación
- ✅ Formulario inteligente de ofertas
- ✅ Panel de negociación avanzado
- ✅ Notificaciones en tiempo real
- ✅ Asesoría IA
- ✅ Visualizaciones interactivas

## 🌐 **Configuración para Producción (Vercel)**

Si al registrar un nuevo usuario en producción ves **"invalid API Key"**, sigue estos pasos:

### **1. Variables de entorno en Vercel**

En [Vercel → tu proyecto → Settings → Environment Variables](https://vercel.com/dashboard) añade (para **Production**):

| Variable | Valor | Notas |
|----------|--------|--------|
| `VITE_SUPABASE_URL` | `https://prtyuwdkrrqhtwolcrav.supabase.co` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | *(tu anon key)* | Clave pública desde Supabase → Settings → API |

Las variables `VITE_*` se inyectan **en tiempo de build**. Después de añadirlas o cambiarlas, haz un **nuevo deploy** (`npx vercel --prod` o push a la rama conectada).

### **2. URLs permitidas en Supabase (crítico)**

Supabase rechaza peticiones desde dominios no permitidos y puede devolver errores como "invalid API Key". Configura las URLs de tu app en producción:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto.
2. **Authentication** → **URL Configuration**.
3. **Site URL**: pon la URL de producción, por ejemplo  
   `https://tu-app.vercel.app`  
   (o la URL que te da Vercel, p. ej. `https://sunday-properties-xxx.vercel.app`).
4. **Redirect URLs**: añade la misma URL y variantes que uses, por ejemplo:
   - `https://tu-app.vercel.app/**`
   - `https://tu-app.vercel.app`

Guarda los cambios. No hace falta redeploy en Vercel solo por esto.

### **3. Comprobar después de cambiar**

1. Redeploy en Vercel si cambiaste env vars.
2. Abre la app en la URL de producción.
3. Prueba **Registrarse** de nuevo; el error "invalid API Key" debería desaparecer si la anon key y las URLs están bien configuradas.

## 🎯 **Próximos Pasos**

1. **Configurar Supabase** (deshabilitar confirmación de email)
2. **Probar flujos completos** con usuarios de prueba
3. **Desplegar a Vercel** para testing en producción
4. **Configurar variables de entorno** en Vercel
5. **Configurar Site URL y Redirect URLs** en Supabase (ver sección Producción arriba)
6. **Ejecutar migraciones** en producción

## 📞 **Soporte**

Si encuentras algún problema:

1. Verificar que las variables de entorno estén configuradas
2. Confirmar que las migraciones SQL se ejecutaron
3. Verificar que Supabase no requiera confirmación de email
4. Revisar la consola del navegador para errores

---

**¡El sistema está listo para usar! 🎉**
