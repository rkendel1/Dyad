# Multi-Project Supabase Architecture Diagram

## Before: Single Shared Instance

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Supabase Instance                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PostgreSQL (5432)  →  Kong (8000)  →  Dashboard (3001)     │
│                                                               │
│  Credentials: Fixed demo credentials                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
         App 1             App 2             App 3
       (shared)          (shared)          (shared)
```

**Problems:**

- ❌ All apps share same database
- ❌ Can't run multiple apps simultaneously
- ❌ Same credentials for all apps
- ❌ Port conflicts when trying multiple instances

---

## After: Per-App Isolated Instances

```
┌──────────────────────────────────────────────────┐
│              App 1 Supabase Instance             │
│          (Project: dyad-supabase-1)              │
├──────────────────────────────────────────────────┤
│  PostgreSQL (5532)  →  Kong (8100)               │
│  Dashboard (3101)                                │
│  DB Password: ...app-1                           │
│  JWT Secret: ...app-1                            │
└──────────────────────────────────────────────────┘
                       ▲
                       │
                    App 1

┌──────────────────────────────────────────────────┐
│              App 2 Supabase Instance             │
│          (Project: dyad-supabase-2)              │
├──────────────────────────────────────────────────┤
│  PostgreSQL (5632)  →  Kong (8200)               │
│  Dashboard (3201)                                │
│  DB Password: ...app-2                           │
│  JWT Secret: ...app-2                            │
└──────────────────────────────────────────────────┘
                       ▲
                       │
                    App 2

┌──────────────────────────────────────────────────┐
│              App 3 Supabase Instance             │
│          (Project: dyad-supabase-3)              │
├──────────────────────────────────────────────────┤
│  PostgreSQL (5732)  →  Kong (8300)               │
│  Dashboard (3301)                                │
│  DB Password: ...app-3                           │
│  JWT Secret: ...app-3                            │
└──────────────────────────────────────────────────┘
                       ▲
                       │
                    App 3
```

**Benefits:**

- ✅ Complete database isolation per app
- ✅ Run multiple apps concurrently
- ✅ Unique credentials per app
- ✅ No port conflicts (automatic allocation)
- ✅ Independent start/stop per app

---

## Port Allocation Strategy

```
Base Ports:
  PostgreSQL: 5432
  Kong API:   8000
  Dashboard:  3001

Formula: base_port + (appId × 100)

┌────────┬────────────┬──────────┬───────────┐
│ App ID │ PostgreSQL │ Kong API │ Dashboard │
├────────┼────────────┼──────────┼───────────┤
│   1    │   5532     │   8100   │   3101    │
│   2    │   5632     │   8200   │   3201    │
│   3    │   5732     │   8300   │   3301    │
│   5    │   5932     │   8500   │   3501    │
│  10    │   6432     │   9000   │   4001    │
└────────┴────────────┴──────────┴───────────┘

Each app gets 100 ports of spacing to prevent conflicts.
```

---

## Container Structure Per App

```
dyad-supabase-{appId}/
├── db                 (PostgreSQL Database)
├── kong               (API Gateway)
├── auth               (GoTrue Auth)
├── rest               (PostgREST API)
├── realtime           (Realtime Server)
├── storage            (Storage API)
├── imgproxy           (Image Processing)
├── meta               (Postgres Meta API)
└── studio             (Supabase Studio Dashboard)

Docker Compose Project: dyad-supabase-{appId}
Network: dyad-supabase-{appId}_default
Volume: dyad-supabase-{appId}_db-data
```

---

## Environment Variable Flow

```
1. User clicks "Use Local Supabase" in App 1

2. Dyad calculates App 1 configuration:
   ┌──────────────────────────────────────┐
   │ PostgreSQL Port: 5532                │
   │ API Port:        8100                │
   │ Dashboard Port:  3101                │
   │ DB Password:     ...app-1            │
   │ JWT Secret:      ...app-1            │
   └──────────────────────────────────────┘

3. Docker Compose starts with environment:
   POSTGRES_PORT=5532
   KONG_PORT=8100
   STUDIO_PORT=3101
   POSTGRES_PASSWORD=...app-1
   JWT_SECRET=...app-1

4. Credentials written to app's .env.local:
   POSTGRES_URL=postgresql://...@localhost:5532/...
   SUPABASE_URL=http://localhost:8100
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:8100
   (and other variables...)

5. App connects to its isolated Supabase instance ✓
```

---

## Data Persistence

```
Each app's data is stored in separate Docker volumes:

┌─────────────────────────────────────┐
│  Docker Host                         │
├─────────────────────────────────────┤
│                                      │
│  dyad-supabase-1_db-data            │
│    └── PostgreSQL data for App 1    │
│                                      │
│  dyad-supabase-2_db-data            │
│    └── PostgreSQL data for App 2    │
│                                      │
│  dyad-supabase-3_db-data            │
│    └── PostgreSQL data for App 3    │
│                                      │
└─────────────────────────────────────┘

Data persists even when containers are stopped.
To completely remove: docker-compose -p dyad-supabase-{appId} down -v
```

---

## Lifecycle Management

```
┌──────────────────────────────────────────────────┐
│            App Lifecycle                         │
├──────────────────────────────────────────────────┤
│                                                   │
│  User Action: "Use Local Supabase"               │
│         │                                         │
│         ▼                                         │
│  Check if app's instance running                 │
│         │                                         │
│    No ──┼── Yes                                  │
│         │      │                                  │
│         ▼      ▼                                  │
│  Start    Wait for ready                        │
│  Containers                                      │
│         │                                         │
│         ▼                                         │
│  Update .env.local with credentials              │
│         │                                         │
│         ▼                                         │
│  Set app.supabaseProjectId = "local-supabase-X"  │
│         │                                         │
│         ▼                                         │
│  App ready to use isolated Supabase ✓            │
│                                                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  User Action: "Stop Local Supabase"              │
│         │                                         │
│         ▼                                         │
│  docker-compose -p dyad-supabase-X down          │
│         │                                         │
│         ▼                                         │
│  Containers stopped (data preserved) ✓           │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **Docker Compose Project Names**:
   - Provides automatic namespace isolation
   - Simple and reliable
   - Built-in Docker feature

2. **Port Allocation Formula (base + appId×100)**:
   - Predictable and deterministic
   - Easy to debug
   - Supports up to ~900 apps before port conflicts

3. **Standard Demo JWT Tokens**:
   - Safe for local development
   - Well-tested by Supabase community
   - Consistent with official Supabase examples

4. **Backward Compatibility**:
   - Old `local-supabase` format still works
   - New `local-supabase-{appId}` format for isolation
   - Gradual migration path for existing users
