# Docker Development Stack Documentation

This document provides instructions for using the Dyad comprehensive development environment stack.

## Overview

The Dyad development stack includes:

### Supabase Services
- **PostgreSQL Database** (Port 54321) - Supabase's dedicated database
- **Auth API** (Port 54322) - Authentication with email/password, JWT, and OAuth
- **Realtime** (Port 54323) - Real-time subscriptions and pub/sub
- **Edge Functions** (Port 54324) - Serverless functions via Meta API
- **Storage API** - Asset and file storage
- **Supabase Studio** (Port 3001) - Management GUI

### Development Services
- **Code Server** (Port 8080) - Web-based VS Code IDE
- **Dyad Test Server** (Port 5000) - Testing and running applications
- **PostgreSQL** (Port 5432) - Main database for Dyad applications
- **pgAdmin** (Port 5050) - PostgreSQL management interface
- **Auth Service** (Port 4000) - Custom authentication service
- **Redis** (Port 6379) - In-memory cache and message broker

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher
- At least 4GB of free RAM
- Ports 3001, 4000, 5000, 5050, 5432, 6379, 8080, and 54321-54324 available

## Getting Started

### 1. Configure Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables as needed:
- `SUPABASE_POSTGRES_PASSWORD` - Password for Supabase PostgreSQL
- `POSTGRES_PASSWORD` - Password for main PostgreSQL database
- `PGADMIN_PASSWORD` - Password for pgAdmin
- `CODE_SERVER_PASSWORD` - Password for Code Server
- Other service-specific settings

### 2. Start the Stack

Start all services:

```bash
docker-compose up -d
```

Start specific services:

```bash
docker-compose up -d supabase-db supabase-studio
```

### 3. Verify Services

Check that all services are running:

```bash
docker-compose ps
```

Check logs for a specific service:

```bash
docker-compose logs -f supabase-studio
```

## Accessing Services

### Supabase Services

| Service | URL | Description |
|---------|-----|-------------|
| Supabase Studio | http://localhost:3001 | Management dashboard and SQL editor |
| Auth API | http://localhost:54322 | Authentication endpoints |
| Realtime | http://localhost:54323 | WebSocket subscriptions |
| Edge Functions | http://localhost:54324 | Meta API for serverless functions |
| PostgreSQL | localhost:54321 | Direct database access |

**Supabase Connection Details:**
- URL: `http://localhost:54322`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`

### Development Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Code Server | http://localhost:8080 | Password: `dyad123` (default) |
| Dyad Test Server | http://localhost:5000 | N/A |
| pgAdmin | http://localhost:5050 | Email: `admin@dyad.local`, Password: `dyad123` |
| Auth Service | http://localhost:4000 | N/A |
| Redis | localhost:6379 | No authentication |

**PostgreSQL Connection Details:**
- Host: `localhost`
- Port: `5432`
- Database: `dyad_db`
- Username: `dyad`
- Password: `dyad_password` (from .env)

## Using Supabase in Your Apps

### Local Development

Your apps in `/app-code` can connect to Supabase using these environment variables:

```env
SUPABASE_URL=http://localhost:54322
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### Production Promotion

To promote your app to production Supabase:

1. Create a project on [supabase.com](https://supabase.com)
2. Get your production credentials from the Supabase dashboard
3. Update your app's `.env.production` or `.env` file:

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

## Managing the Stack

### Stop Services

Stop all services:

```bash
docker-compose stop
```

Stop specific services:

```bash
docker-compose stop code-server dyad-test-server
```

### Restart Services

Restart all services:

```bash
docker-compose restart
```

Restart specific services:

```bash
docker-compose restart supabase-db
```

### Remove Services

Stop and remove all containers (data persists in volumes):

```bash
docker-compose down
```

Remove containers and volumes (⚠️ deletes all data):

```bash
docker-compose down -v
```

### View Logs

View logs for all services:

```bash
docker-compose logs
```

Follow logs for a specific service:

```bash
docker-compose logs -f supabase-studio
```

View logs for the last 100 lines:

```bash
docker-compose logs --tail=100 supabase-db
```

### Update Images

Pull the latest images:

```bash
docker-compose pull
```

Rebuild and restart:

```bash
docker-compose up -d --build
```

## Persistent Data

All data is stored in Docker volumes and persists across container restarts:

- `supabase-data` - Supabase PostgreSQL database
- `postgres-data` - Main PostgreSQL database
- `redis-data` - Redis data
- `pgadmin-data` - pgAdmin settings
- `code-server-data` - Code Server configuration

### Backup Data

Backup Supabase database:

```bash
docker-compose exec supabase-db pg_dump -U supabase_admin postgres > supabase_backup.sql
```

Backup main PostgreSQL database:

```bash
docker-compose exec postgres pg_dump -U dyad dyad_db > postgres_backup.sql
```

### Restore Data

Restore Supabase database:

```bash
cat supabase_backup.sql | docker-compose exec -T supabase-db psql -U supabase_admin postgres
```

Restore main PostgreSQL database:

```bash
cat postgres_backup.sql | docker-compose exec -T postgres psql -U dyad dyad_db
```

## Troubleshooting

### Port Conflicts

If you get "port already in use" errors:

1. Check what's using the port:
   ```bash
   # On macOS/Linux
   lsof -i :54321
   # On Windows
   netstat -ano | findstr :54321
   ```

2. Stop the conflicting service or change the port in `docker-compose.yml`

### Services Won't Start

1. Check Docker Desktop is running
2. Verify you have enough resources allocated to Docker
3. Check logs: `docker-compose logs [service-name]`
4. Try restarting Docker Desktop

### Database Connection Issues

1. Wait 30 seconds for databases to fully initialize
2. Check the service is running: `docker-compose ps`
3. Verify credentials in `.env` file
4. Check logs: `docker-compose logs supabase-db postgres`

### Reset Everything

To completely reset the stack:

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove any orphaned volumes
docker volume prune

# Start fresh
docker-compose up -d
```

## Development Workflow

### Working with Code Server

1. Access Code Server at http://localhost:8080
2. Enter password (default: `dyad123`)
3. Open `/home/coder/project` to access your apps in `/app-code`
4. Install extensions and configure as needed

### Testing Apps

1. Place your app code in the `app-code` directory
2. The Dyad Test Server will automatically serve apps on port 5000
3. Access your app at http://localhost:5000

### Database Management

**Using Supabase Studio:**
- Navigate to http://localhost:3001
- Use the SQL Editor to run queries
- Manage tables, auth, and storage through the GUI

**Using pgAdmin:**
- Navigate to http://localhost:5050
- Add a new server connection:
  - Host: `postgres`
  - Port: `5432`
  - Database: `dyad_db`
  - Username: `dyad`
  - Password: from `.env` file

## Security Notes

⚠️ **Important:** This stack is configured for local development only.

- Default passwords are not secure and should be changed
- The Supabase JWT secret and keys are demo values
- Never expose these services to the internet
- Never commit your `.env` file with real credentials
- Use production Supabase credentials for deployed applications

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Code Server Documentation](https://github.com/coder/code-server)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

## Support

If you encounter issues:

1. Check this documentation
2. Review the troubleshooting section
3. Check container logs
4. Open an issue on the Dyad repository with:
   - Your OS and Docker version
   - Output of `docker-compose ps`
   - Relevant logs from `docker-compose logs`
