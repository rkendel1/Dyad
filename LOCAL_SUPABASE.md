# Local Supabase Setup

This guide explains how to set up and use local Supabase with Dyad for development.

## 🎉 Multi-Project Support

**NEW**: Each app now gets its own isolated Supabase instance with dedicated containers, ports, and credentials!

See [LOCAL_SUPABASE_MULTI_PROJECT.md](./LOCAL_SUPABASE_MULTI_PROJECT.md) for details on:

- How per-app isolation works
- Port allocation strategy
- Managing multiple instances
- Troubleshooting tips

## Prerequisites

- Docker and Docker Compose installed
- Dyad app running

## Quick Start

### Option 1: Using the Dyad UI (Recommended)

1. Open Dyad and navigate to an app
2. In the integrations section, click **"Use Local Supabase"**
3. Wait for the setup to complete (containers will be created for this specific app)
4. Your app is now connected to its own isolated local Supabase instance!

Each app gets unique:

- Dashboard URL (e.g., http://localhost:3101 for app 1)
- API endpoints (e.g., http://localhost:8100 for app 1)
- Database ports (e.g., 5532 for app 1)
- Credentials automatically synced to `.env.local`

### Option 2: Using npm scripts (Legacy - for shared instance)

```bash
# Start shared local Supabase (not recommended for multi-app development)
npm run supabase:start

# Check status
npm run supabase:status

# Stop shared local Supabase
npm run supabase:stop
```

**Note**: The npm scripts start a shared instance. For better isolation, use the Dyad UI which creates per-app instances.

### Option 3: Using the setup script directly

```bash
# Start local Supabase
node scripts/setup-local-supabase.js start

# Check status with detailed information
node scripts/setup-local-supabase.js status

# View configuration details
node scripts/setup-local-supabase.js config

# Stop local Supabase
node scripts/setup-local-supabase.js stop
```

## What's Included

Local Supabase includes all the core services:

- **PostgreSQL Database** (port 5432)
- **API Gateway** (port 8000) - Main API endpoint (Kong)
- **Auth Service** (GoTrue) - User authentication and authorization
- **Storage Service** - File storage and management
- **Realtime Service** - Real-time subscriptions
- **PostgREST API** - Automatic REST API for your database
- **Dashboard** (port 3001) - Supabase Studio interface

### Enhanced Startup Experience

When you start local Supabase, you'll see:

- 📦 List of services being started
- ⏳ Real-time progress indicators
- ✅ Service-by-service health checks
- 📊 Formatted connection information
- 💡 Next steps and helpful tips

Example output:

```
═══════════════════════════════════════════════════════
🚀 Starting local Supabase...
═══════════════════════════════════════════════════════
📦 Starting services:
   - PostgreSQL Database
   - Kong API Gateway
   - GoTrue Auth
   ...
✅ Local Supabase is ready!
═══════════════════════════════════════════════════════
📊 Dashboard:        http://localhost:3001
🔗 API URL:          http://localhost:8000
🗄️  Database:         localhost:5432
═══════════════════════════════════════════════════════
```

## Configuration

### Default Configuration

- **API URL**: `http://localhost:8000`
- **Dashboard**: `http://localhost:3001`
- **Database**: `postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres`
- **Anonymous Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`

### Environment Variables

When you connect an app to local Supabase, Dyad automatically creates/updates your `.env.local` file with a structured format:

```bash
# ============================================
# LOCAL SUPABASE (Development)
# ============================================
POSTGRES_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ============================================
```

This structured format makes it easy to switch between local and hosted environments.

## Usage in Your App

Once connected, use Supabase in your app as normal:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Use Supabase normally - it will connect to your local instance
const { data, error } = await supabase.from("your_table").select("*");
```

## Managing Your Database

### Using Supabase Studio

1. Open your browser to `http://localhost:3001`
2. Use the visual interface to:
   - Create tables and relationships
   - Manage users and authentication
   - Monitor real-time activity
   - Run SQL queries

### Using SQL

Connect directly to PostgreSQL:

```bash
psql postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres
```

## Data Persistence

- Database data is persisted in Docker volumes
- Data survives container restarts
- To reset completely: `docker-compose -f docker-compose.supabase.yml down -v`

## Troubleshooting

### Docker Issues

**Problem**: "Docker is not installed or not running"
**Solution**: Install Docker Desktop and ensure it's running

**Problem**: "Permission denied" errors
**Solution**: Make sure Docker has the necessary permissions

### Port Conflicts

**Problem**: "Port already in use"
**Solution**: Stop services using ports 5432, 8000, or 3001

```bash
# Check what's using a port
lsof -i :5432
lsof -i :8000
lsof -i :3001

# Kill processes if needed
sudo kill -9 <PID>
```

### Connection Issues

**Problem**: Can't connect to local Supabase
**Solution**:

1. Check if services are running: `npm run supabase:status`
2. Restart services: `npm run supabase:stop && npm run supabase:start`
3. Wait a few seconds for services to initialize

### Database Connection Errors

**Problem**: "Connection refused" when accessing database
**Solution**: Ensure PostgreSQL container is healthy:

```bash
docker-compose -f docker-compose.supabase.yml ps
docker-compose -f docker-compose.supabase.yml logs db
```

## Development Tips

1. **Fast Development**: Local Supabase starts much faster than cloud setup
2. **No Internet Required**: Work offline once containers are pulled
3. **Easy Reset**: Quickly reset your database for testing
4. **Real-time Testing**: Test real-time features without API limits

## Switching Between Local and Cloud

You can easily switch between local and hosted Supabase:

### Using the Environment Switcher (Recommended)

```bash
# Switch to local Supabase
npm run supabase:switch /path/to/your/app local

# Switch to hosted Supabase
npm run supabase:switch /path/to/your/app hosted
```

The switcher automatically manages your `.env.local` file by commenting/uncommenting the appropriate sections.

### Using the Dyad UI

1. **To Hosted**: Click "Disconnect Project" then use "Connect to Supabase"
2. **To Local**: Click "Disconnect Project" then use "Use Local Supabase"

### Manual Method

Edit your `.env.local` file:

- Uncomment the `LOCAL SUPABASE` section for local development
- Uncomment the `HOSTED SUPABASE` section for production/staging

Each app can use a different Supabase instance, so you can have some apps using local and others using hosted.

**📖 For detailed information, see [ENVIRONMENT_SWITCHING.md](./ENVIRONMENT_SWITCHING.md)**

## Production Promotion

When you're ready to move from local development to production, Dyad provides tools to help:

### Using the CLI Tool (Recommended)

```bash
# Start the production promotion process
npm run supabase:promote
```

This interactive tool will guide you through:

- Creating or configuring a production Supabase project
- Migrating your database schema
- Updating environment files with structured format
- Deploying functions
- Providing guidance for data migration

After promotion, your `.env.local` will contain both local and hosted configurations, making it easy to switch between them.

### Using the Dyad UI

1. In your app's Supabase settings, click "Promote to Production"
2. Follow the guided process
3. Enter production project credentials
4. Review and confirm the promotion

### Manual Process

See [PRODUCTION_PROMOTION.md](./PRODUCTION_PROMOTION.md) for detailed manual instructions.

## Production Promotion Features

- **Schema Migration**: Automatically extracts and provides your local database schema for production
- **Environment Configuration**: Updates `.env.local` and creates `.env.production` with production credentials
- **Function Migration**: Guides you through deploying Supabase functions to production
- **Data Migration Guidance**: Provides safe strategies for migrating data if needed
- **Validation Checklist**: Ensures all components are properly configured in production
- **Security Best Practices**: Includes guidance for securing your production environment

## Files Structure

```
├── docker-compose.supabase.yml     # Main Docker Compose configuration
├── scripts/
│   └── setup-local-supabase.js     # Setup script
├── volumes/
│   ├── api/
│   │   └── kong.yml                # API Gateway configuration
│   ├── db/
│   │   ├── jwt.sql                 # JWT functions and roles
│   │   ├── realtime.sql            # Realtime schema
│   │   └── logs.sql                # Logging schema
│   └── storage/                    # File storage (created on first run)
└── LOCAL_SUPABASE.md               # This documentation
```

## Support

If you encounter issues:

1. Check this documentation
2. Verify Docker is running properly
3. Check container logs: `docker-compose -f docker-compose.supabase.yml logs`
4. Open an issue on the Dyad repository
