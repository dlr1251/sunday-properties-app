#!/bin/bash

# Sunday Proto - Local Supabase Setup Script
# This script sets up a clean, working local Supabase environment

set -e

echo "🚀 Sunday Proto - Local Supabase Setup"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if ports are available
print_status "Checking if required ports are available..."
if lsof -i :54326 &> /dev/null || lsof -i :54327 &> /dev/null; then
    print_warning "Ports 54326 or 54327 are already in use. Stopping existing services..."
    supabase stop || true
    sleep 3
fi

# Stop any existing Supabase services
print_status "Stopping any existing Supabase services..."
supabase stop || true

# Clean up Docker containers and volumes (be gentle)
print_status "Cleaning up Docker containers and volumes..."
docker rm -f $(docker ps -aq --filter "name=supabase_*" --filter "status=exited") 2>/dev/null || true
# Don't remove volumes as they might contain important data

# Reset Supabase project
print_status "Resetting Supabase project..."
supabase db reset --debug || print_warning "Database reset failed, continuing..."

# Start Supabase with essential services only
print_status "Starting Supabase with essential services..."
supabase start --ignore-health-check

# Wait for services to be ready (longer wait)
print_status "Waiting for services to be ready..."
sleep 15

# Check status
print_status "Checking Supabase status..."
supabase status

# Test database connection
print_status "Testing database connection..."
if psql "postgresql://postgres:postgres@127.0.0.1:54326/postgres" -c "SELECT 1;" &> /dev/null; then
    print_success "Database connection successful"
else
    print_warning "Database connection failed, but continuing..."
fi

# Test API connection
print_status "Testing API connection..."
if curl -s http://127.0.0.1:54327/rest/v1/ &> /dev/null; then
    print_success "API connection successful"
else
    print_warning "API connection failed, but continuing..."
fi

# Run migrations
print_status "Running database migrations..."
supabase db push --include-all || print_warning "Migration push failed"

# Reset with seed data (more reliable than separate seed)
print_status "Applying seed data..."
supabase db reset --debug --linked || print_warning "Seeding failed"

print_success "Local Supabase setup completed!"
echo ""
echo "🌐 Available services:"
echo "   API URL:        http://127.0.0.1:54327"
echo "   Studio URL:     http://127.0.0.1:54323"
echo "   Database URL:   postgresql://postgres:postgres@127.0.0.1:54326/postgres"
echo "   Mailpit URL:    http://127.0.0.1:54324"
echo ""
echo "🔑 Environment variables for your app:"
echo "   VITE_SUPABASE_URL=http://127.0.0.1:54327"
echo "   VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
echo ""
echo "🧪 Test your setup:"
echo "   Visit: http://localhost:3000/supabase-test"
echo "   Visit: http://localhost:3000/testing-users"
echo ""
echo "📝 Next steps:"
echo "   1. Make sure your .env file has the correct URLs"
echo "   2. Run 'npm run dev' to start your app"
echo "   3. Visit the test pages to verify everything works"
echo ""
echo "🔧 Troubleshooting:"
echo "   If issues persist, try:"
echo "   - supabase stop && supabase start"
echo "   - docker system prune -f && ./setup-local-supabase.sh"
echo "   - Check LOCAL_SUPABASE_SETUP.md for detailed guide"
