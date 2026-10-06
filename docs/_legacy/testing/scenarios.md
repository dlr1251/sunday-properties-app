# Sunday Proto - Setup y Usuarios de Prueba

Este documento describe el setup limpio y los usuarios de prueba para el desarrollo local.

## Estado Actual - Setup Limpio

### ✅ Lo que se ha corregido:
- **Esquema estándar de Supabase**: Ahora usa `auth.users` + `public.profiles` en lugar del esquema incorrecto anterior
- **Migraciones lineales**: 2 migraciones limpias que se aplican en orden correcto
- **Seeds idempotentes**: Datos de prueba que se pueden ejecutar múltiples veces sin errores
- **Configuración sin verificación de email**: Perfecto para desarrollo local
- **RLS policies correctas**: Propiedades accesibles para usuarios autenticados

### 📋 Estructura de Base de Datos:
- `auth.users` - Usuarios de autenticación de Supabase
- `public.profiles` - Perfiles extendidos con roles (user, agent, lawyer, admin)
- `public.properties` - Propiedades listadas
- `public.offers` - Ofertas de compra
- `public.cases` - Casos legales
- `public.chat_messages` - Mensajes de chat entre partes
- `public.case_documents` - Documentos legales

---

## Usuarios de Prueba

**Contraseña para todos**: `password123`

### Vendedores (Agents)
- **Andrea Villa** - `seller1@sunday.com`
  - Propiedades: "Moderno Apartamento en El Poblado", "Oficina en WeWork Milla de Oro"

- **Carlos Rengifo** - `seller2@sunday.com`
  - Propiedades: "Casa Campestre en Envigado"

### Compradores (Users)
- **Sofia Gomez** - `buyer1@sunday.com`
- **Mateo Rojas** - `buyer2@sunday.com`

### Abogados (Lawyers)
- **Laura Fernandez** - `lawyer1@sunday.com`
- **David Morales** - `lawyer2@sunday.com`

---

## Escenarios de Prueba

### Escenario 1: Negociación Exitosa
- **Propiedad**: "Moderno Apartamento en El Poblado" (Vendedor: Andrea Villa)
- **Comprador**: Sofia Gomez
- **Abogado**: Laura Fernandez
- **Estado**: Oferta aceptada, caso activo creado
- **Documentos**: Promesa de compraventa subida
- **Chat**: Mensajes entre abogado y comprador

---

## Cómo Usar

### Para Desarrollo Local:
1. Asegúrate de que Supabase esté corriendo: `npx supabase status`
2. Los usuarios pueden hacer login con email/contraseña sin verificación
3. Las propiedades se cargan automáticamente en la página principal
4. Funciona logout desde el menú de usuario

### Para Producción:
1. Conectar a proyecto remoto: `npx supabase link --project-ref prtyuwdkrrqhtwolcrav`
2. Push de migraciones: `npx supabase db push`
3. Habilitar verificación de email en Supabase Dashboard
4. Configurar email/SMTP si es necesario

---

## Comandos Útiles

```bash
# Ver estado de Supabase
npx supabase status

# Ver migraciones aplicadas
npx supabase migration list

# Resetear base de datos local (aplica migraciones + seeds)
npx supabase db reset

# Push a remoto (después de link)
npx supabase db push
```

---

## 🧪 Pruebas E2E por Roles

### **Usuario Regular** (`user1@sunday.local` / `Password123!`)
**Objetivo**: Verificar navegación básica y acceso limitado

**Flujo de Prueba:**
1. **Login** → `user1@sunday.local` / `Password123!`
2. **Navegación**:
   - ✅ Ver propiedades públicas
   - ✅ Ver perfil propio
   - ✅ Favoritos personales
   - ❌ NO ver panel de administración
   - ❌ NO gestionar propiedades ajenas

3. **Propiedades**:
   - ✅ Explorar propiedades disponibles
   - ✅ Agregar/quitar favoritos
   - ✅ Ver detalles completos
   - ❌ NO crear/editar propiedades

4. **Perfil**:
   - ✅ Ver/editar perfil propio
   - ✅ Cambiar configuración
   - ❌ NO ver otros perfiles

### **Agente Inmobiliario** (`agent1@sunday.local` / `Password123!`)
**Objetivo**: Verificar gestión de propiedades y clientes

**Flujo de Prueba:**
1. **Login** → `agent1@sunday.local` / `Password123!`
2. **Propiedades**:
   - ✅ Crear nuevas propiedades
   - ✅ Editar propiedades propias
   - ✅ Gestionar propiedades asignadas
   - ❌ NO editar propiedades de otros agentes

3. **Clientes**:
   - ✅ Ver clientes asignados
   - ✅ Gestionar visitas programadas
   - ✅ Crear ofertas en nombre de clientes

4. **Dashboard**:
   - ✅ Ver métricas de ventas
   - ✅ Gestionar propiedades activas
   - ✅ Historial de transacciones

### **Abogado** (`lawyer1@sunday.local` / `Password123!`)
**Objetivo**: Verificar gestión legal y documentos

**Flujo de Prueba:**
1. **Login** → `lawyer1@sunday.local` / `Password123!`
2. **Casos Legales**:
   - ✅ Crear nuevos casos
   - ✅ Gestionar casos asignados
   - ✅ Revisar documentos legales

3. **Documentos**:
   - ✅ Subir contratos y promesas
   - ✅ Revisar documentos firmados
   - ✅ Gestionar versiones de documentos

4. **Negociaciones**:
   - ✅ Participar en negociaciones activas
   - ✅ Validar términos legales
   - ✅ Aprobar transacciones

### **Administrador** (`admin1@sunday.local` / `Password123!`)
**Objetivo**: Verificar control total del sistema

**Flujo de Prueba:**
1. **Login** → `admin1@sunday.local` / `Password123!`
2. **Panel Admin**:
   - ✅ Ver todos los usuarios
   - ✅ Gestionar roles y permisos
   - ✅ Ver métricas globales

3. **Propiedades**:
   - ✅ Ver todas las propiedades
   - ✅ Gestionar propiedades de cualquier agente
   - ✅ Aprobar/rechazar publicaciones

4. **Sistema**:
   - ✅ Ver logs de auditoría
   - ✅ Gestionar configuraciones globales
   - ✅ Resolver disputas

### **Super Admin** (`admin1@sunday.local` / `Password123!`)
**Objetivo**: Verificar acceso completo al sistema

**Flujo de Prueba:**
1. **Login** → `admin1@sunday.local` / `Password123!`
2. **Control Total**:
   - ✅ Todos los permisos de Admin
   - ✅ Gestionar otros administradores
   - ✅ Acceso a configuraciones críticas
   - ✅ Backup y restauración de datos

### **Pruebas de Seguridad RLS**

**Verificar que RLS funciona correctamente:**

```sql
-- Como usuario regular
SELECT * FROM profiles; -- ❌ Debería fallar (solo ve el propio perfil)
SELECT * FROM properties WHERE status = 'published'; -- ✅ Debería funcionar

-- Como admin
SELECT * FROM profiles; -- ✅ Debería funcionar (ve todos)
SELECT * FROM audit_logs; -- ✅ Debería funcionar
```

### **Escenarios de Error**

1. **Sesión Expirada**: Verificar redirección automática
2. **Permisos Insuficientes**: Verificar mensajes de error apropiados
3. **Datos Inválidos**: Verificar validación de formularios
4. **Conexión Perdida**: Verificar manejo de errores de red

---

## Próximos Pasos

1. ✅ **Base de datos funcional** - Local y remota sincronizadas
2. ✅ **Setup de desarrollo limpio** - Sin dependencias innecesarias
3. ✅ **Pruebas E2E documentadas** - Escenarios por roles definidos
4. 🔄 **Implementación de funcionalidades** - Dashboard, negociaciones, chat
5. ⏳ **Testing automatizado** - Cypress/Playwright para E2E

¡El setup está listo para desarrollo completo con pruebas exhaustivas!