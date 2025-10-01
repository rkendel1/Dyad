# Local Supabase Multi-Project Support

## Overview

Dyad now supports running multiple isolated Supabase instances, one for each app. Each app gets its own dedicated Docker containers with unique ports and credentials, ensuring complete isolation between projects.

## Architecture

### Container Naming

Each app's Supabase instance uses a unique Docker Compose project name:

- Project name: `dyad-supabase-{appId}`
- Example containers: `dyad-supabase-1-db-1`, `dyad-supabase-1-kong-1`, etc.

### Port Allocation

Ports are automatically allocated based on the app ID to avoid conflicts:

| Service    | Base Port | App Port Formula     | Example (App ID 1) |
| ---------- | --------- | -------------------- | ------------------ |
| PostgreSQL | 5432      | 5432 + (appId × 100) | 5532               |
| API (Kong) | 8000      | 8000 + (appId × 100) | 8100               |
| Dashboard  | 3001      | 3001 + (appId × 100) | 3101               |

**Example Port Assignments:**

- App 1: PostgreSQL=5532, API=8100, Dashboard=3101
- App 2: PostgreSQL=5632, API=8200, Dashboard=3201
- App 3: PostgreSQL=5732, API=8300, Dashboard=3301

### Credentials

Each app instance gets unique credentials:

- **JWT Secret**: `your-super-secret-jwt-token-with-at-least-32-characters-long-app-{appId}`
- **Database Password**: `your-super-secret-and-long-postgres-password-app-{appId}`
- **Anon Key**: Standard Supabase demo token (safe for local development)
- **Service Role Key**: Standard Supabase demo token (safe for local development)

These credentials are automatically configured in the app's `.env.local` file.

## Usage

### Setting Up Local Supabase for an App

1. Open your app in Dyad
2. Navigate to the integrations section
3. Click **"Use Local Supabase"**
4. Wait for the containers to start (first time may take a moment to pull images)
5. Your app is now connected with unique credentials!

### Accessing the Dashboard

Each app has its own dashboard URL:

- App 1: http://localhost:3101
- App 2: http://localhost:3201
- App 3: http://localhost:3301

Click the dashboard button in the Supabase integration card to open it directly.

### Stopping an App's Supabase Instance

1. Open the app in Dyad
2. In the Supabase integration card, click **"Stop Local Supabase"**
3. The containers for that specific app will be stopped
4. Other apps' Supabase instances continue running

### Environment Variables

When you set up local Supabase for an app, the following variables are automatically added to `.env.local`:

```env
# LOCAL SUPABASE (Development)
POSTGRES_URL=postgresql://postgres:{unique-password}@localhost:{app-port}/postgres
SUPABASE_URL=http://localhost:{app-port}
SUPABASE_ANON_KEY={anon-key}
SUPABASE_SERVICE_ROLE_KEY={service-role-key}
NEXT_PUBLIC_SUPABASE_URL=http://localhost:{app-port}
NEXT_PUBLIC_SUPABASE_ANON_KEY={anon-key}
```

## Technical Details

### Docker Compose Project Isolation

Docker Compose's `-p` (project name) flag creates isolated:

- Container names
- Network names
- Volume names

This ensures complete separation between apps' Supabase instances.

### Shared Configuration Files

The following files are shared across all instances (read-only):

- `volumes/api/kong.yml` - API Gateway configuration
- `volumes/db/*.sql` - Database initialization scripts

These are read-only mounts and don't cause conflicts between instances.

### Database Storage

Each app's database data is stored in a separate Docker volume:

- Volume name pattern: `dyad-supabase-{appId}_db-data`
- Data persists even when containers are stopped
- To completely remove an app's data, remove the Docker volume

## Troubleshooting

### Port Already in Use

If you see port conflict errors:

1. Check which app IDs are already running
2. Ensure no other services are using the allocated ports
3. Each app uses a 100-port range, so plan accordingly

### Check Running Instances

```bash
# List all Dyad Supabase containers
docker ps --filter "name=dyad-supabase"

# Check specific app's containers
docker ps --filter "name=dyad-supabase-{appId}"
```

### View Container Logs

```bash
# View logs for app's Supabase instance
docker-compose -p dyad-supabase-{appId} logs

# View specific service logs
docker-compose -p dyad-supabase-{appId} logs db
docker-compose -p dyad-supabase-{appId} logs kong
```

### Manually Stop an App's Instance

```bash
docker-compose -f docker-compose.supabase.yml -p dyad-supabase-{appId} down
```

### Remove All Data for an App

```bash
# Stop and remove containers and volumes
docker-compose -f docker-compose.supabase.yml -p dyad-supabase-{appId} down -v
```

## Migration from Shared Instance

If you were previously using a shared Supabase instance (before this update):

1. **Old projects** with `supabaseProjectId: "local-supabase"` will continue to work
2. **New setups** will use `supabaseProjectId: "local-supabase-{appId}"`
3. The old shared instance can be stopped with: `npm run supabase:stop`
4. To migrate an existing app to its own instance:
   - Disconnect the current Supabase connection
   - Click "Use Local Supabase" again
   - The app will get its own isolated instance

## Benefits

✅ **Complete Isolation**: Each app has its own database, credentials, and ports  
✅ **No Conflicts**: Multiple apps can run Supabase simultaneously  
✅ **Independent Development**: Work on multiple projects without interference  
✅ **Easy Cleanup**: Stop or remove instances independently  
✅ **Automatic Configuration**: Credentials sync automatically to `.env.local`  
✅ **Persistent Data**: Each app's data is preserved in separate volumes

## Limitations

⚠️ **Port Range**: Apps use sequential 100-port ranges. Very large app IDs (>900) may conflict with system ports  
⚠️ **Resource Usage**: Each instance runs full Supabase stack (multiple containers)  
⚠️ **Shared Init Scripts**: Database initialization scripts are shared across instances

## Future Improvements

Potential enhancements being considered:

- Dynamic port allocation with conflict detection
- Port range configuration
- Resource limits per instance
- Bulk operations (stop all, restart all)
- Instance health monitoring dashboard
