#!/bin/bash

# 🌟 Sunday Properties - Production Data Seeding Script
# Run this script to populate the database with comprehensive production-like data

set -e  # Exit on any error

echo "🌟 Sunday Properties - Production Data Seeding"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Error: Supabase CLI is not installed. Please install it first:${NC}"
    echo "npm install -g supabase"
    exit 1
fi

# Check if Supabase is running
echo -e "${BLUE}🔍 Checking Supabase status...${NC}"
if ! supabase status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase is not running. Starting local Supabase...${NC}"
    supabase start

    # Wait for Supabase to be ready
    echo -e "${BLUE}⏳ Waiting for Supabase to be ready...${NC}"
    sleep 10
fi

echo -e "${GREEN}✅ Supabase is running${NC}"

# Check database connection
echo -e "${BLUE}🔍 Checking database connection...${NC}"
if ! supabase db ping &> /dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to database${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Confirm before proceeding
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will populate your database with production-like data.${NC}"
echo -e "${YELLOW}   This includes 15+ properties, users, offers, visits, and legal cases.${NC}"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}ℹ️  Operation cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 Starting data seeding process...${NC}"

# Enable required extensions first
echo -e "${BLUE}🔧 Enabling required PostgreSQL extensions...${NC}"
if psql "$(supabase status | grep 'Connection string' | awk '{print $3}')" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" -c "CREATE EXTENSION IF NOT EXISTS \"postgis\";" 2>/dev/null; then
    echo -e "${GREEN}✅ Extensions enabled successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Extensions may already be enabled, continuing...${NC}"
fi

# Reset local database and apply migrations
echo -e "${BLUE}🔄 Resetting local database...${NC}"
if supabase db reset --local; then
    echo -e "${GREEN}✅ Local database reset successful${NC}"
else
    echo -e "${YELLOW}⚠️  Reset failed, trying to apply migrations directly...${NC}"
fi

# Apply migrations to local database
echo -e "${BLUE}📊 Applying database migrations to local database...${NC}"
if supabase db push --local; then
    echo -e "${GREEN}✅ Database migrations applied successfully${NC}"

    # Wait a moment for the schema to be applied
    sleep 3

    # Create auth users
    echo -e "${BLUE}👥 Creating auth users...${NC}"
    if node scripts/seed-auth-users.mjs; then
        echo -e "${GREEN}✅ Auth users created successfully${NC}"

        # Create profiles with correct roles
        echo -e "${BLUE}👤 Creating user profiles with correct roles...${NC}"
        DB_URL="postgresql://postgres:postgres@127.0.0.1:54326/postgres"
        psql "$DB_URL" -c "
        INSERT INTO public.profiles (id, email, full_name, role, status)
        SELECT
          au.id,
          au.email,
          COALESCE(au.raw_user_meta_data->>'full_name', au.email),
          CASE
            WHEN au.email = 'admin1@sunday.local' THEN 'super_admin'
            WHEN au.email = 'admin2@sunday.local' THEN 'admin'
            WHEN au.email LIKE 'lawyer%@sunday.local' THEN 'lawyer'
            WHEN au.email LIKE 'agent%@sunday.local' THEN 'agent'
            ELSE 'user'
          END as role,
          'active'
        FROM auth.users au
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          status = EXCLUDED.status;
        " 2>/dev/null

        echo -e "${GREEN}✅ User profiles created successfully${NC}"

        # Execute the production seed data
        echo -e "${BLUE}🌱 Loading production seed data...${NC}"
        if psql "$DB_URL" -f supabase/seed-production-data.sql 2>/dev/null; then
            echo -e "${GREEN}✅ Production seed data loaded successfully!${NC}"
        else
            echo -e "${RED}❌ Error: Failed to load production seed data${NC}"
            echo -e "${YELLOW}💡 Tip: Try running the seeding again, some data might have been inserted${NC}"
        fi
    else
        echo -e "${RED}❌ Error: Failed to create auth users${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Error: Failed to push database schema${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Seeding completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Data Summary:${NC}"
echo "   • 15 Properties across Medellín neighborhoods"
echo "   • 14 Test users (sellers, buyers, agents, lawyers, admins)"
echo "   • 7 Active offers with various statuses"
echo "   • 4 Scheduled visits (some completed)"
echo "   • 1 Active legal case with documents"
echo "   • 25+ Notifications across all users"
echo "   • Chat messages and negotiation history"
echo "   • Property availability schedules"
echo "   • Platform settings and blog content"
echo ""
echo -e "${BLUE}🚀 Your application now simulates a live production environment!${NC}"
echo ""
echo -e "${YELLOW}🔍 Verifying user profiles...${NC}"
AUTH_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM auth.users;" | tr -d ' ')
PROFILE_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM public.profiles;" | tr -d ' ')
MATCHED_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM auth.users au JOIN public.profiles p ON au.id = p.id;" | tr -d ' ')

if [ "$AUTH_COUNT" = "$PROFILE_COUNT" ] && [ "$AUTH_COUNT" = "$MATCHED_COUNT" ]; then
    echo -e "${GREEN}✅ Profile verification: $AUTH_COUNT/$AUTH_COUNT users have profiles${NC}"
else
    echo -e "${RED}⚠️ Profile verification: $MATCHED_COUNT/$AUTH_COUNT users have profiles (some missing!)${NC}"
fi

echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Start the development server: npm run dev"
echo "   2. Visit /testing-users to login with test accounts"
echo "   3. Explore /docs for complete documentation"
echo "   4. Test negotiation flows with different user types"
echo ""

# Optional: Start the dev server
read -p "Would you like to start the development server now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Starting development server...${NC}"
    npm run dev
fi
