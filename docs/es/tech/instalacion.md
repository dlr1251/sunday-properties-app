# Instalación

Guía de configuración rápida para comenzar a trabajar con Sunday Properties.

## Requisitos previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/your-org/sunday-properties-app.git
cd sunday-properties-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

## Configuración

1. **Supabase**: Crea un proyecto en [supabase.com](https://supabase.com)
2. **Variables de entorno**: Configura las siguientes variables en `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY` (opcional)

## Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Próximos pasos

- [Conceptos](concepts) — Entiende el modelo de dominio
- [Arquitectura](architecture) — Explora el stack técnico
- [Esquema de base de datos](db-schema) — Tablas y relaciones
