#!/bin/bash

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# Script completo de configuración para Sunday Properties
echo "🚀 Configurando Sunday Properties - Setup Completo"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar dependencias
echo "🔍 Verificando dependencias..."

if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI no está instalado"
    echo "Instala con: brew install supabase/tap/supabase"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI no está instalado"
    echo "Instala con: npm install -g vercel"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI no está instalado"
    echo "Instala con: brew install gh"
    exit 1
fi

print_status "Todas las dependencias están instaladas"

# Verificar login en Supabase
echo ""
echo "🔐 Verificando autenticación..."

if ! supabase projects list &> /dev/null; then
    print_warning "No estás logueado en Supabase"
    echo "Ejecuta: supabase login"
    echo "Presiona Enter para abrir el navegador y hacer login"
    read -p "Presiona Enter cuando hayas completado el login..."
fi

# Listar proyectos existentes
echo ""
echo "📋 Proyectos de Supabase disponibles:"
supabase projects list

echo ""
print_info "¿Quieres crear un nuevo proyecto o usar uno existente?"
echo "1) Crear nuevo proyecto"
echo "2) Usar proyecto existente"
read -p "Selecciona una opción (1 o 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    print_info "Creando nuevo proyecto en Supabase..."
    read -p "Nombre del proyecto (default: sunday-properties): " project_name
    project_name=${project_name:-sunday-properties}
    
    read -p "Región (default: us-east-1): " region
    region=${region:-us-east-1}
    
    echo "Creando proyecto: $project_name en región: $region"
    supabase projects create "$project_name" --region "$region"
    
    if [ $? -eq 0 ]; then
        print_status "Proyecto creado exitosamente"
    else
        print_error "Error al crear proyecto"
        exit 1
    fi
fi

# Vincular proyecto
echo ""
print_info "Vinculando proyecto local con Supabase..."
read -p "Project Reference ID (lo puedes ver en la lista anterior): " project_ref

if [ -z "$project_ref" ]; then
    print_error "Project Reference ID es requerido"
    exit 1
fi

supabase link --project-ref "$project_ref"

if [ $? -eq 0 ]; then
    print_status "Proyecto vinculado exitosamente"
else
    print_error "Error al vincular proyecto"
    exit 1
fi

# Obtener variables de entorno
echo ""
print_info "Obteniendo variables de entorno..."
supabase status

# Crear archivo .env.local con las variables reales
echo ""
print_info "Creando archivo .env.local..."

# Obtener URL y ANON_KEY del proyecto vinculado
PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

cat > .env.local << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$PROJECT_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY

# App Configuration
VITE_APP_NAME=Sunday Properties
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
EOF

print_status "Archivo .env.local creado con variables reales"

# Desplegar esquema
echo ""
print_info "Desplegando esquema de base de datos..."
supabase db push

if [ $? -eq 0 ]; then
    print_status "Esquema desplegado exitosamente"
else
    print_error "Error al desplegar esquema"
    exit 1
fi

# Configurar Vercel
echo ""
print_info "Configurando Vercel..."
read -p "¿Quieres hacer login en Vercel ahora? (y/n): " vercel_login

if [ "$vercel_login" = "y" ]; then
    vercel login
fi

# Desplegar a Vercel
echo ""
print_info "Desplegando a Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_status "Desplegado a Vercel exitosamente"
else
    print_warning "Error al desplegar a Vercel, pero puedes hacerlo manualmente después"
fi

# Configurar variables de entorno en Vercel
echo ""
print_info "Configurando variables de entorno en Vercel..."
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_APP_NAME production
vercel env add VITE_APP_VERSION production
vercel env add VITE_APP_ENV production

print_status "Variables de entorno configuradas en Vercel"

# Commit final
echo ""
print_info "Haciendo commit final..."
git add .
git commit -m "feat: Complete Supabase and Vercel setup"
git push

print_status "Cambios subidos a GitHub"

echo ""
echo "🎉 ¡Configuración completada!"
echo "================================"
echo ""
print_info "Tu aplicación está disponible en:"
echo "📱 GitHub: https://github.com/dlr1251/sunday-properties-app"
echo "🌐 Vercel: (URL se mostrará después del despliegue)"
echo "🗄️  Supabase: $PROJECT_URL"
echo ""
print_info "Próximos pasos:"
echo "1. Ve a tu proyecto en Supabase Dashboard"
echo "2. Configura autenticación (Email, Google, etc.)"
echo "3. Revisa las políticas RLS"
echo "4. Prueba la aplicación en Vercel"
echo ""
print_status "¡Sunday Properties está listo para usar! 🚀"
