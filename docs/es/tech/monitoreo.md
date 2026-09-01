# Monitoreo

Logs, errores y salud del sistema.

## Logs de aplicación

- **Frontend**: Errores y advertencias en la consola del navegador. Revisar en devtools.
- **Vercel**: Logs de funciones serverless y de despliegue en el panel de Vercel (Deployments, Functions).
- **Build**: Salida de `npm run build` y del pipeline de CI.

## Supabase

- **Dashboard**: Logs de API, Auth, Realtime y Base de datos en el proyecto de Supabase.
- **CLI**: `supabase logs` para proyectos vinculados.

Revisar errores 4xx/5xx, fallos de Auth y consultas lentas.

## Auditoría

La tabla `audit_logs` registra acciones relevantes (creación de ofertas, cambios de estado, etc.). Útil para soporte, depuración y cumplimiento.

## Errores frecuentes

- **Conexión a Supabase**: Verificar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, y que el proyecto esté activo.
- **RLS / permisos**: Errores al leer o escribir tablas. Revisar políticas y que el usuario tenga el rol esperado.
- **Realtime / WebSocket**: Si está deshabilitado en desarrollo, evitar depender de suscripciones para flujos críticos. Configuración en `src/lib/supabase.ts` y en variables de entorno.
- **Yjs**: El servidor WebSocket debe estar en marcha para edición colaborativa. `npm run yjs:server` en desarrollo.

## Solución de problemas

Ante fallos persistentes:

1. Reproducir en local con `npm run dev` y Supabase local.
2. Revisar variables de entorno y versión de Node.
3. Consultar logs de Supabase y Vercel.
4. Revisar [Despliegue](deployment) y [Migraciones](migrations).

## Temas relacionados

- [Despliegue](deployment)
- [Esquema de base de datos](db-schema)
- [Instalación](installation)
