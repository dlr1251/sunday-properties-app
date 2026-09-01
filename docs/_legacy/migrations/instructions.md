# 📋 Instrucciones para Ejecutar Migraciones SQL

## 🚀 **Pasos para Ejecutar las Migraciones**

### **1. Ir al SQL Editor de Supabase**
1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral

### **2. Ejecutar Migraciones en Orden**

#### **Migración 1: Sistema de Negociación Básico**
- **Archivo**: `supabase/migrations/20251020020000_negotiation_system.sql`
- **Descripción**: Crea las tablas básicas del sistema de negociación
- **Tiempo estimado**: 2-3 minutos

#### **Migración 2: Funciones Avanzadas**
- **Archivo**: `supabase/migrations/20251020030000_advanced_negotiation_functions.sql`
- **Descripción**: Crea las funciones SQL avanzadas para validación y cálculos
- **Tiempo estimado**: 1-2 minutos

#### **Migración 3: Sistema de Notificaciones**
- **Archivo**: `supabase/migrations/20251020040000_notifications_system.sql`
- **Descripción**: Crea el sistema de notificaciones en tiempo real
- **Tiempo estimado**: 1 minuto

#### **Migración 4: Datos de Prueba**
- **Archivo**: `supabase/seed-negotiation-data.sql`
- **Descripción**: Inserta datos de prueba para testing
- **Tiempo estimado**: 1-2 minutos

### **3. Verificar Ejecución**
Después de cada migración, deberías ver:
- ✅ **"Success. No rows returned"** (para CREATE TABLE)
- ✅ **"Success. 1 row affected"** (para INSERT)
- ✅ **"Success. No rows returned"** (para CREATE FUNCTION)

### **4. Verificar Tablas Creadas**
Ejecuta esta consulta para verificar que todas las tablas fueron creadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'offer_history', 'negotiation_rules', 'intent_letters', 
  'offer_comparisons', 'knowledge_base', 'advisory_sessions',
  'public_offers', 'payment_plans', 'fiscal_simulations',
  'legal_documents', 'property_deliveries', 'administrative_transitions',
  'notifications'
)
ORDER BY table_name;
```

### **5. Verificar Funciones Creadas**
Ejecuta esta consulta para verificar las funciones:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'validate_offer_against_rules', 'calculate_negotiation_progress',
  'generate_ai_advisory', 'send_negotiation_notification'
)
ORDER BY routine_name;
```

## ⚠️ **Notas Importantes**

- **Ejecuta las migraciones en orden** (1, 2, 3, 4)
- **No saltes ninguna migración**
- **Si hay errores**, revisa la consola de Supabase para detalles
- **Las migraciones son idempotentes** (se pueden ejecutar múltiples veces)

## 🎯 **Después de Ejecutar las Migraciones**

Una vez completadas todas las migraciones:
1. ✅ **Sistema de negociación** completamente funcional
2. ✅ **Base de datos** con todas las tablas y funciones
3. ✅ **Datos de prueba** listos para usar
4. ✅ **Sistema listo** para testing en http://localhost:3004

---

**¿Necesitas ayuda?** Revisa los archivos SQL individuales en la carpeta `supabase/migrations/` para ver el contenido exacto de cada migración.
