#!/bin/bash

# Script para configurar Sunday Properties
echo "🚀 Configurando Sunday Properties..."

# Crear archivo .env.local
cat > .env.local << EOF
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME=Sunday Properties
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
EOF

echo "✅ Archivo .env.local creado"
echo "📝 Por favor actualiza las variables de entorno en .env.local con tus valores reales de Supabase"
echo ""
echo "🔗 Ve a https://supabase.com para crear un proyecto y obtener:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""
echo "📋 Una vez que tengas los valores, ejecuta:"
echo "   supabase projects list"
echo "   supabase link --project-ref YOUR_PROJECT_REF"
echo "   supabase db push"
