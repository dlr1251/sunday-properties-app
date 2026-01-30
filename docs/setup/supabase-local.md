# Local Supabase Setup Guide

This guide will help you set up a fully working local Supabase environment for Sunday Proto development.

## Prerequisites

- Docker & Docker Compose installed
- Supabase CLI installed: `npm install -g supabase`
- Node.js and npm installed

## Quick Setup

### 1. Clean Setup (Recommended)

Run the automated setup script:

```bash
./setup-local-supabase.sh
```

This script will:
- Stop any existing Supabase services
- Clean up Docker containers and volumes
- Reset the database
- Start all services
- Run migrations
- Seed the database

### 2. Manual Setup (Alternative)

If you prefer to do it step by step:

```bash
# Stop existing services
supabase stop

# Clean up Docker
docker rm -f $(docker ps -aq --filter "name=supabase_*") 2>/dev/null || true
docker volume rm $(docker volume ls -q --filter "name=supabase_*") 2>/dev/null || true

# Reset database
supabase db reset --debug

# Start services
supabase start

# Wait for services to start (10 seconds)
sleep 10

# Check status
supabase status

# Run migrations
supabase db push --include-all

# Reset with seed data
supabase db reset --debug --linked
```

## Environment Configuration

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54327
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Development Settings
VITE_SHOW_DEBUG_LINKS=true
VITE_ENVIRONMENT=development
```

## Available Services

After setup, you'll have these services running:

- **API URL**: http://127.0.0.1:54327
- **Studio URL**: http://127.0.0.1:54323 (Supabase Dashboard)
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54326/postgres
- **Mailpit URL**: http://127.0.0.1:54324 (Email testing)
- **GraphQL URL**: http://127.0.0.1:54327/graphql/v1

## Testing Your Setup

### 1. Start Your App
```bash
npm run dev
```

### 2. Test Pages
Visit these URLs to verify everything works:

- **Supabase Test**: http://localhost:3000/supabase-test
- **Testing Users**: http://localhost:3000/testing-users
- **Supabase Studio**: http://127.0.0.1:54323

### 3. Check Logs
Monitor your Supabase logs:
```bash
supabase logs --follow
```

## Troubleshooting

### Services Not Starting
If services don't start properly:

1. **Check Docker**: Make sure Docker is running
```bash
docker ps
```

2. **Check Ports**: Make sure ports 54321-54327 are available
```bash
lsof -i :54321-54327
```

3. **Clean Restart**:
```bash
supabase stop
docker system prune -f
./setup-local-supabase.sh
```

### Database Connection Issues
If you can't connect to the database:

1. **Check Database Status**:
```bash
supabase status
```

2. **Test Database Connection**:
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54326/postgres" -c "SELECT version();"
```

3. **Reset Database**:
```bash
supabase db reset --debug
```

### Auth Issues
If authentication isn't working:

1. **Check Auth Configuration**:
```bash
supabase status | grep -A 10 auth
```

2. **Test Auth Endpoint**:
```bash
curl http://127.0.0.1:54327/auth/v1/settings
```

3. **Check Seed Data**: Make sure users are seeded properly
```bash
supabase db reset --debug --linked
```

## Development Workflow

### Starting Development
```bash
# Start Supabase (if not running)
./setup-local-supabase.sh

# Start your app
npm run dev

# Open browser
open http://localhost:3000
```

### Making Schema Changes
1. Edit migration files in `supabase/migrations/`
2. Run migrations: `supabase db push`
3. Reset database if needed: `supabase db reset --debug`

### Working with Seed Data
- Edit `supabase/seed-local.sql` for local development data
- Reset to apply changes: `supabase db reset --debug --linked`

## Architecture Overview

```
📁 supabase/
├── 📄 config.toml          # Supabase configuration
├── 📁 migrations/          # Database migrations
├── 📄 seed-local.sql       # Local development seed data
└── 📄 schema.sql           # Database schema export

🔧 Scripts/
├── 📄 setup-local-supabase.sh    # Automated setup
└── 📄 scripts/seed-auth-users.mjs # User seeding

🌐 Services (Local)
├── 🗄️ PostgreSQL Database (Port 54326)
├── 🚀 Supabase API (Port 54327)
├── 🎛️ Supabase Studio (Port 54323)
├── 📧 Mailpit (Port 54324)
└── 📦 Storage API
```

## Performance Tips

1. **Keep Services Minimal**: Only enable needed services in `config.toml`
2. **Use Local Database**: Avoid network calls during development
3. **Monitor Resources**: Supabase can be resource-intensive
4. **Clean Shutdown**: Always stop services when done: `supabase stop`

## Next Steps

Once your local Supabase is working:

1. ✅ Test all pages work correctly
2. ✅ Verify user authentication flows
3. ✅ Check database queries perform well
4. ✅ Test email functionality with Mailpit
5. ✅ Verify file uploads work with Storage

For production deployment, you'll need to:
- Set up a hosted Supabase instance
- Configure production environment variables
- Set up proper backup strategies
- Configure monitoring and logging
