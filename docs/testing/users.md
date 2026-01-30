# 🔐 Usuarios de Prueba - Sistema de Negociación Inmobiliaria

## 📋 **Información de Acceso**

### **Usuarios Vendedores (Sellers)**

| Usuario | Email | Contraseña | Tipo | Propiedades | Descripción |
|---------|-------|------------|------|-------------|-------------|
| **Juan Pérez** | juan.perez.test@mailinator.com | `password123` | verified | 1 propiedad | Vendedor de apartamento en El Poblado |
| **Carlos Rodríguez** | carlos.rodriguez.test@mailinator.com | `password123` | verified | 1 propiedad | Vendedor de casa en Laureles |
| **Luis Hernández** | luis.hernandez.test@mailinator.com | `password123` | verified | 1 propiedad | Vendedor de penthouse en Envigado |
| **Diego González** | diego.gonzalez.test@mailinator.com | `password123` | verified | 1 propiedad | Vendedor de apartamento en Sabaneta |
| **Santiago Torres** | santiago.torres.test@mailinator.com | `password123` | verified | 1 propiedad | Vendedor de casa en Rionegro |

### **Usuarios Compradores (Buyers)**

| Usuario | Email | Contraseña | Tipo | Ofertas | Descripción |
|---------|-------|------------|------|---------|-------------|
| **María García** | maria.garcia.test@mailinator.com | `password123` | verified | 2 ofertas | Compradora activa, agente inmobiliario |
| **Ana Martínez** | ana.martinez.test@mailinator.com | `password123` | verified | 1 oferta | Compradora con oferta rechazada |
| **Sofía López** | sofia.lopez.test@mailinator.com | `password123` | verified | 1 oferta | Compradora con oferta aceptada |
| **Valentina Ramírez** | valentina.ramirez.test@mailinator.com | `password123` | verified | 1 oferta | Compradora con contraoferta |
| **Isabella Jiménez** | isabella.jimenez.test@mailinator.com | `password123` | verified | 1 oferta | Compradora con oferta pendiente |

### **Usuarios Agentes/Abogados**

| Usuario | Email | Contraseña | Tipo | Rol | Descripción |
|---------|-------|------------|------|-----|-------------|
| **María García** | maria.garcia.test@mailinator.com | `password123` | verified | agent | Agente inmobiliario profesional |
| **Ana Martínez** | ana.martinez.test@mailinator.com | `password123` | verified | agent | Agente especializada en El Poblado |
| **Sofía López** | sofia.lopez.test@mailinator.com | `password123` | verified | agent | Agente con experiencia en Laureles |
| **Valentina Ramírez** | valentina.ramirez.test@mailinator.com | `password123` | verified | agent | Agente de lujo en Envigado |
| **Isabella Jiménez** | isabella.jimenez.test@mailinator.com | `password123` | verified | agent | Agente especializada en Sabaneta |

## 🏠 **Propiedades de Prueba**

### **1. Apartamento Moderno en El Poblado**
- **Propietario**: Juan Pérez (juan.perez.test@mailinator.com)
- **Precio**: $450,000,000 COP
- **Estado**: Publicada, con 2 ofertas activas
- **Reglas de Negociación**: Precio mínimo $420M, plazo máximo 90 días
- **Ofertas**:
  - María García: $430,000,000 (Pendiente)
  - Ana Martínez: $440,000,000 (Pendiente)

### **2. Casa Familiar en Laureles**
- **Propietario**: Carlos Rodríguez (carlos.rodriguez.test@mailinator.com)
- **Precio**: $380,000,000 COP
- **Estado**: Vendida (Oferta aceptada)
- **Oferta Aceptada**: Sofía López - $370,000,000

### **3. Penthouse de Lujo en Envigado**
- **Propietario**: Luis Hernández (luis.hernandez.test@mailinator.com)
- **Precio**: $650,000,000 COP
- **Estado**: Con contraoferta activa
- **Oferta**: Valentina Ramírez - $620,000,000 (Contraoferta)

### **4. Apartamento en Sabaneta**
- **Propietario**: Diego González (diego.gonzalez.test@mailinator.com)
- **Precio**: $280,000,000 COP
- **Estado**: Publicada, con 1 oferta pendiente
- **Oferta**: Isabella Jiménez - $275,000,000 (Pendiente)

### **5. Casa en Rionegro**
- **Propietario**: Santiago Torres (santiago.torres.test@mailinator.com)
- **Precio**: $320,000,000 COP
- **Estado**: Publicada, con 1 oferta pendiente
- **Oferta**: María García - $310,000,000 (Pendiente)

## 🔄 **Flujos de Prueba Recomendados**

### **Flujo 1: Vendedor Configurando Reglas**
1. Login como **Juan Pérez** (juan.perez.test@mailinator.com)
2. Ir a "Subir Propiedad" → Paso 6 "Reglas de Negociación"
3. Configurar reglas automáticas
4. Verificar que las ofertas se rechacen automáticamente

### **Flujo 2: Comprador Creando Oferta**
1. Login como **María García** (maria.garcia.test@mailinator.com)
2. Ver propiedad "Apartamento Moderno en El Poblado"
3. Usar "Smart Offer Form" para crear oferta
4. Ver validación en tiempo real y asesoría IA

### **Flujo 3: Negociación Completa**
1. Login como **Carlos Rodríguez** (carlos.rodriguez.test@mailinator.com)
2. Ir a "Panel de Negociación"
3. Ver ofertas recibidas
4. Aceptar/rechazar ofertas
5. Crear contraofertas

### **Flujo 4: Notificaciones en Tiempo Real**
1. Login como **Sofía López** (sofia.lopez.test@mailinator.com)
2. Crear oferta en cualquier propiedad
3. Ver notificaciones en tiempo real
4. Verificar que el vendedor reciba notificación

## 🧪 **Casos de Prueba Específicos**

### **Validación Automática**
- **Usuario**: Ana Martínez
- **Acción**: Crear oferta de $400,000,000 para El Poblado
- **Resultado Esperado**: Oferta rechazada automáticamente (precio mínimo $420M)

### **Asesoría IA**
- **Usuario**: Cualquier comprador
- **Acción**: Usar Smart Offer Form
- **Resultado Esperado**: Consejos personalizados según el contexto

### **Notificaciones**
- **Usuario**: Juan Pérez (vendedor)
- **Acción**: Recibir nueva oferta
- **Resultado Esperado**: Notificación en tiempo real

### **Visualizaciones**
- **Usuario**: Cualquier usuario
- **Acción**: Ir a "Panel de Negociación" → "Comparación"
- **Resultado Esperado**: Radar chart con comparación de ofertas

## 🔧 **Configuración de Desarrollo**

### **Variables de Entorno Requeridas**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Base de Datos**
- Ejecutar todas las migraciones SQL
- Cargar datos de prueba con `seed-negotiation-data.sql`
- Verificar que las funciones SQL estén creadas

## 📱 **Testing en Diferentes Dispositivos**

### **Desktop**
- Resolución: 1920x1080
- Navegador: Chrome/Firefox/Safari
- Funcionalidades: Todas disponibles

### **Tablet**
- Resolución: 768x1024
- Navegador: Chrome/Safari
- Funcionalidades: Adaptadas para touch

### **Mobile**
- Resolución: 375x667
- Navegador: Chrome/Safari
- Funcionalidades: Optimizadas para móvil

## 🚨 **Notas Importantes**

1. **Contraseñas**: Todas las contraseñas son `password123` para facilitar las pruebas
2. **Datos**: Los datos son ficticios y solo para pruebas
3. **Notificaciones**: Requieren conexión a Supabase en tiempo real
4. **Imágenes**: Las URLs de imágenes son ejemplos, reemplazar con URLs reales
5. **Monedas**: Todos los precios están en COP (Pesos Colombianos)

## 🎯 **Métricas de Éxito**

- ✅ **Login exitoso** con todos los usuarios
- ✅ **Navegación fluida** entre componentes
- ✅ **Notificaciones en tiempo real** funcionando
- ✅ **Validación automática** de ofertas
- ✅ **Asesoría IA** respondiendo correctamente
- ✅ **Visualizaciones** renderizando datos
- ✅ **Responsive design** en todos los dispositivos

---

**¡Sistema listo para pruebas! 🚀**
