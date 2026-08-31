# Sunday Properties - Guía de Preparación para Demo

**Objetivo:** Preparar el proyecto para una demostración funcional

---

## Pre-requisitos

### 1. Verificar Entorno Local

```bash
# Verificar Node.js (v18+)
node --version

# Verificar npm
npm --version

# Instalar dependencias si es necesario
npm install
```

### 2. Configurar Variables de Entorno

Copiar `.env.example` a `.env.local` y configurar:

```env
# Supabase (Local)
VITE_SUPABASE_URL=http://localhost:54327
VITE_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=<tu-api-key>

# Stripe (Test Mode)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# XAI (para IA)
VITE_XAI_API_KEY=<tu-api-key>
```

### 3. Iniciar Supabase Local

```bash
# Iniciar servicios
npx supabase start

# Ver credenciales
npx supabase status

# Aplicar migraciones (si es necesario)
npx supabase db reset
```

### 4. Cargar Datos de Prueba

```bash
# Usuarios de prueba
npm run seed:users

# Propiedades de prueba
npm run seed:properties

# O todo junto
npm run db:reset-seed
```

---

## Verificación Pre-Demo

### Checklist de Build

```bash
# 1. Verificar que compila
npm run build

# 2. Ejecutar tests (si están configurados)
npm run test

# 3. Verificar TypeScript
npx tsc --noEmit
```

### Checklist de Funcionamiento

- [ ] **Login funciona** con usuario de prueba
- [ ] **Dashboard carga** sin errores
- [ ] **Propiedades se muestran** en el listado
- [ ] **Mapa funciona** (verificar API key de Google)
- [ ] **Crear oferta** no da error
- [ ] **Admin dashboard** accesible con rol admin

---

## Usuarios para Demo

| Rol | Email | Password | Qué mostrar |
|-----|-------|----------|-------------|
| **Comprador** | maria.garcia.test@mailinator.com | password123 | Búsqueda, favoritos, ofertas |
| **Vendedor** | juan.perez.test@mailinator.com | password123 | Propiedades, recibir ofertas |
| **Abogado** | laura.fernandez@sunday.com | password123 | Casos, documentos legales |
| **Admin** | admin@sunday.com | password123 | Dashboard admin, aprobaciones |

---

## Script de Demo (15 minutos)

### Introducción (2 min)

> "Sunday Properties es una plataforma que revoluciona la compra-venta de inmuebles en Medellín. Conectamos compradores, vendedores y abogados en un solo lugar, con herramientas de negociación inteligente y respaldo legal."

### Demo: Flujo de Comprador (5 min)

1. **Login** como comprador (maria.garcia.test@mailinator.com)
2. **Explorar propiedades**
   - Mostrar listado con filtros
   - Mostrar vista de mapa
   - Click en una propiedad para ver detalle
3. **Guardar en favoritos**
   - Click en corazón
   - Mostrar sección de favoritos
4. **Enviar oferta**
   - Abrir formulario de oferta
   - Mostrar validaciones inteligentes
   - Enviar oferta

### Demo: Flujo de Vendedor (4 min)

1. **Login** como vendedor (juan.perez.test@mailinator.com)
2. **Ver ofertas recibidas**
   - Mostrar panel de negociación
   - Mostrar comparación de ofertas (si hay varias)
3. **Crear contraoferta**
   - Modificar términos
   - Enviar contraoferta
4. **Mostrar timeline de negociación**

### Demo: Flujo Legal (2 min)

1. **Login** como abogado (laura.fernandez@sunday.com)
2. **Ver casos asignados**
3. **Generar documento legal**
   - Mostrar generación con IA
   - Preview del documento

### Demo: Admin (2 min)

1. **Login** como admin (admin@sunday.com)
2. **Dashboard de métricas**
3. **Aprobar propiedad pendiente**

### Cierre

> "Sunday Properties simplifica todo el proceso de compra-venta, desde el descubrimiento hasta el cierre legal, todo en una sola plataforma."

---

## Troubleshooting Común

### Error: "Cannot connect to Supabase"

```bash
# Verificar que Supabase está corriendo
npx supabase status

# Si no está corriendo
npx supabase start
```

### Error: "Google Maps not loading"

- Verificar `VITE_GOOGLE_MAPS_API_KEY` en `.env.local`
- Verificar que la API está habilitada en Google Cloud Console
- Verificar restricciones de dominio (localhost debe estar permitido)

### Error: "User not found"

```bash
# Re-ejecutar seeds
npm run seed:users
```

### Error: "No properties found"

```bash
# Re-ejecutar seeds de propiedades
npm run seed:properties
```

### Pantalla en blanco

- Abrir DevTools (F12) → Console
- Buscar errores de JavaScript
- Verificar que `.env.local` tiene todas las variables

---

## Preparación de Ambiente

### Día Antes de la Demo

1. [ ] Verificar que todo funciona localmente
2. [ ] Preparar respaldos de `.env.local`
3. [ ] Tener lista la documentación de usuarios
4. [ ] Ensayar el script completo

### 1 Hora Antes

1. [ ] Reiniciar Supabase local
2. [ ] Ejecutar `npm run dev`
3. [ ] Probar login con cada usuario
4. [ ] Cerrar apps innecesarias
5. [ ] Silenciar notificaciones

### Durante la Demo

- Tener este documento abierto para referencia
- Tener los usuarios/passwords visibles
- Si algo falla, tener plan B (screenshots, video grabado)

---

## Notas para el Presentador

### Puntos Clave a Destacar

1. **Transparencia** - Toda la información estructurada y visible
2. **IA** - Sugerencias inteligentes en ofertas
3. **Legal** - Documentos generados automáticamente
4. **Seguridad** - Verificación de usuarios, respaldo de abogados
5. **UX** - Interfaz moderna y fácil de usar

### Preguntas Frecuentes

**¿Cómo ganan dinero?**
> Comisión del 2.5% sobre ventas cerradas + pago de $49,000 COP por visita

**¿Por qué es diferente a otras plataformas?**
> Negociación inteligente + respaldo legal incluido + todo en un solo lugar

**¿Qué tecnología usan?**
> React, TypeScript, Supabase (PostgreSQL), IA con Grok

**¿Cuándo lanzan?**
> Beta privado en Q1 2026, público en Q2 2026

---

## Contacto de Soporte

Si hay problemas técnicos durante la demo:

- **Técnico:** [Nombre] - [Email/Teléfono]
- **Producto:** [Nombre] - [Email/Teléfono]

---

*Última actualización: 2026-01-26*
