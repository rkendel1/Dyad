# Docker Stack Quick Start Guide

Get up and running with the Dyad development stack in minutes!

## Prerequisites

✅ Docker Desktop installed and running  
✅ At least 4GB free RAM  
✅ Ports available: 3001, 4000, 5000, 5050, 5432, 6379, 8080, 54321-54324

## Quick Start (3 Steps)

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Start the Stack

```bash
docker-compose up -d
```

Wait 30-60 seconds for all services to initialize.

### 3. Access Services

Open these URLs in your browser:

- 🎨 **Supabase Studio**: http://localhost:3001
- 💻 **Code Server**: http://localhost:8080 (password: `dyad123`)
- 🗄️ **pgAdmin**: http://localhost:5050 (email: `admin@dyad.local`, password: `dyad123`)

## Verify Everything Works

Check all services are running:

```bash
docker-compose ps
```

You should see all services with status "Up".

## Next Steps

### Connect Your App to Supabase

Add to your app's `.env`:

```env
SUPABASE_URL=http://localhost:54322
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### Edit Code

1. Place your app in the `app-code/` directory
2. Open Code Server: http://localhost:8080
3. Navigate to `/home/coder/project`

### Manage Databases

**Supabase Database:**
- Open Supabase Studio: http://localhost:3001
- Use the SQL Editor or Table Editor

**PostgreSQL Database:**
- Open pgAdmin: http://localhost:5050
- Add server: Host=`postgres`, Port=`5432`, User=`dyad`, Password=`dyad_password`

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop stack
docker-compose stop

# Restart stack
docker-compose restart

# Stop and remove (keeps data)
docker-compose down

# Remove everything including data
docker-compose down -v
```

## Service Ports Reference

| Service | Port | Usage |
|---------|------|-------|
| Supabase Postgres | 54321 | Database connection |
| Supabase API | 54322 | API & Auth endpoints |
| Supabase Realtime | 54323 | WebSocket subscriptions |
| Supabase Edge Functions | 54324 | Serverless functions |
| Supabase Studio | 3001 | Management GUI |
| Code Server | 8080 | Web IDE |
| Dyad Test Server | 5000 | App testing |
| PostgreSQL | 5432 | Main database |
| pgAdmin | 5050 | DB management |
| Auth Service | 4000 | Authentication |
| Redis | 6379 | Cache/messaging |

## Troubleshooting

**Port conflict error?**
```bash
# Find what's using the port (example for 54321)
lsof -i :54321
# Or change the port in docker-compose.yml
```

**Service won't start?**
```bash
# Check logs
docker-compose logs [service-name]

# Restart Docker Desktop
```

**Need to reset?**
```bash
docker-compose down -v
docker-compose up -d
```

## Learn More

- 📖 Full documentation: [DOCKER_STACK.md](./DOCKER_STACK.md)
- 🏗️ Supabase docs: [LOCAL_SUPABASE.md](./LOCAL_SUPABASE.md)
- 🌐 Supabase website: https://supabase.com/docs

## Support

Having issues? 
1. Check the [troubleshooting section](./DOCKER_STACK.md#troubleshooting)
2. Review logs: `docker-compose logs`
3. Open an issue on GitHub
