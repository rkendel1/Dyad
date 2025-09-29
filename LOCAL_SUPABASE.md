# Local Supabase Setup

This guide explains how to set up and use local Supabase with Dyad for development.

## Prerequisites

- Docker and Docker Compose installed
- Dyad app running

## Quick Start

### Option 1: Using the Dyad UI (Recommended)

1. Open Dyad and navigate to an app
2. In the integrations section, click **"Use Local Supabase"**
3. Wait for the setup to complete
4. Your app is now connected to local Supabase!

### Option 2: Using npm scripts

```bash
# Start local Supabase
npm run supabase:start

# Check status
npm run supabase:status

# Stop local Supabase
npm run supabase:stop
```

### Option 3: Using the setup script directly

```bash
# Start local Supabase
node scripts/setup-local-supabase.js start

# Check status
node scripts/setup-local-supabase.js status

# Stop local Supabase
node scripts/setup-local-supabase.js stop
```

## What's Included

Local Supabase includes all the core services:

- **PostgreSQL Database** (port 5432)
- **API Gateway** (port 8000) - Main API endpoint
- **Auth Service** - User authentication and authorization
- **Storage Service** - File storage and management
- **Realtime Service** - Real-time subscriptions
- **Dashboard** (port 3001) - Supabase Studio interface

## Configuration

### Default Configuration

- **API URL**: `http://localhost:8000`
- **Dashboard**: `http://localhost:3001`
- **Database**: `postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres`
- **Anonymous Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`

### Environment Variables

When you connect an app to local Supabase, Dyad automatically creates/updates your `.env.local` file with:

```bash
POSTGRES_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres
```

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

You can easily switch between local and cloud Supabase:

1. **To Cloud**: Click "Disconnect Project" then use "Connect to Supabase"
2. **To Local**: Click "Disconnect Project" then use "Use Local Supabase"

Each app can use a different Supabase instance, so you can have some apps using local and others using cloud.

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
- Updating environment files
- Deploying functions
- Providing guidance for data migration

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
