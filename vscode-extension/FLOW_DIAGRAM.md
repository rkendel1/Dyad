# VS Code Extension - Feature Flow Diagram

This document provides a visual flow diagram of how the features work.

## Feature 1: AI-Powered Template Selection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER STARTS HERE                              │
│                                                                  │
│  Opens Command Palette: "Dyad: Create App with AI Template      │
│                          Selection"                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 1: DESCRIBE APP                           │
│                                                                  │
│  Input: "I want to build an e-commerce store with payments"     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Extension receives description                            │  │
│  │ Calls: matchTemplates(description)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 2: ANALYZE & SCORE                         │
│                                                                  │
│  Template Matcher analyzes:                                      │
│  • Keywords: "ecommerce", "store", "payments"                    │
│  • Scores each template                                          │
│                                                                  │
│  Results:                                                        │
│  ┌──────────────────────────────────────────────────┐           │
│  │ 1. Stripe E-commerce (Score: 42)                 │           │
│  │ 2. Medusa E-commerce (Score: 26)                 │           │
│  │ 3. SaaS Starter (Score: 18)                      │           │
│  └──────────────────────────────────────────────────┘           │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 3: SHOW SUGGESTIONS                        │
│                                                                  │
│  Quick Pick Menu displays top 5 templates:                       │
│                                                                  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ ✨ Stripe E-commerce Template                           ┃  │
│  ┃    Next.js e-commerce store with Stripe payments...     ┃  │
│  ┃    Relevance score: 42                                  ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃   Medusa E-commerce Template                            ┃  │
│  ┃   Headless commerce template with Medusa backend...     ┃  │
│  ┃   Relevance score: 26                                   ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 4: USER SELECTS                           │
│                                                                  │
│  User chooses: "Stripe E-commerce Template"                      │
│                                                                  │
│  templateId = "stripe-ecommerce"                                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 5: NAME APP                              │
│                                                                  │
│  Input: "my-store"                                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Validation: Letters, numbers, hyphens, underscores only  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 6: CREATE APP                             │
│                                                                  │
│  API Call:                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/apps                                           │  │
│  │ {                                                        │  │
│  │   name: "my-store",                                      │  │
│  │   templateId: "stripe-ecommerce"                         │  │
│  │ }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Dyad Desktop:                                                   │
│  • Creates app directory                                         │
│  • Clones template from GitHub                                   │
│  • Initializes git repository                                    │
│  • Creates initial commit                                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUCCESS ✓                                   │
│                                                                  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ ✓ App "my-store" created successfully with              ┃  │
│  ┃   Stripe E-commerce Template!                           ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                  │
│  Sidebar updated with new app                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Feature 2: Local Supabase Setup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER STARTS HERE                              │
│                                                                  │
│  Opens Command Palette: "Dyad: Setup Local Supabase"            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 1: SELECT APP                             │
│                                                                  │
│  Quick Pick Menu shows all apps:                                 │
│                                                                  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ my-store                                                 ┃  │
│  ┃ /Users/username/dyad-apps/my-store                       ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                  │
│  User selects: "my-store"                                        │
│  appId = 1                                                       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 2: API CALL                               │
│                                                                  │
│  API Request:                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/supabase/setup-local                           │  │
│  │ { appId: 1 }                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               STEP 3: DYAD DESKTOP PROCESSES                     │
│                                                                  │
│  1. Check Docker installed                                       │
│     ├─ Docker Desktop running?                                   │
│     └─ docker-compose available?                                 │
│                                                                  │
│  2. Start Supabase containers                                    │
│     ├─ PostgreSQL database                                       │
│     ├─ Kong API Gateway                                          │
│     ├─ GoTrue Auth                                               │
│     ├─ PostgREST API                                             │
│     └─ Studio Dashboard                                          │
│                                                                  │
│  3. Configure environment                                        │
│     ├─ Create/update .env.local                                  │
│     ├─ Set POSTGRES_URL                                          │
│     ├─ Set SUPABASE_URL                                          │
│     ├─ Set SUPABASE_ANON_KEY                                     │
│     ├─ Set SUPABASE_SERVICE_ROLE_KEY                             │
│     ├─ Set NEXT_PUBLIC_SUPABASE_URL                              │
│     └─ Set NEXT_PUBLIC_SUPABASE_ANON_KEY                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUCCESS ✓                                   │
│                                                                  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ ✓ Local Supabase setup successfully for "my-store"!     ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                  │
│  Access Points:                                                  │
│  🌐 Dashboard: http://localhost:3001                             │
│  📊 API: http://localhost:8000                                   │
│  🔌 Database: postgresql://postgres@localhost:5432/postgres      │
└─────────────────────────────────────────────────────────────────┘
```

## Feature 3: Production Promotion Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER STARTS HERE                              │
│                                                                  │
│  Opens Command Palette: "Dyad: Promote to Production Supabase"  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 1: SELECT APP                             │
│                                                                  │
│  User selects: "my-store"                                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: COLLECT CREDENTIALS                         │
│                                                                  │
│  Sequence of Input Prompts:                                      │
│                                                                  │
│  1️⃣ Project Reference                                            │
│     Input: "abcdefghijklmnop"                                    │
│                                                                  │
│  2️⃣ Supabase URL                                                 │
│     Input: "https://abcdefghijklmnop.supabase.co"                │
│                                                                  │
│  3️⃣ Anon Key                                                     │
│     Input: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."              │
│                                                                  │
│  4️⃣ Service Role Key                                             │
│     Input: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."              │
│                                                                  │
│  5️⃣ Database Password (masked)                                   │
│     Input: "••••••••••••••••"                                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 3: API CALL                               │
│                                                                  │
│  API Request:                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST /api/supabase/promote-to-production                 │  │
│  │ {                                                        │  │
│  │   appId: 1,                                              │  │
│  │   productionProjectRef: "abcdefghijklmnop",              │  │
│  │   supabaseUrl: "https://abcdefghijklmnop.supabase.co",   │  │
│  │   anonKey: "eyJ...",                                     │  │
│  │   serviceRoleKey: "eyJ...",                              │  │
│  │   dbPassword: "***"                                      │  │
│  │ }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               STEP 4: DYAD DESKTOP PROCESSES                     │
│                                                                  │
│  1. Validate local Supabase running                              │
│                                                                  │
│  2. Export database schema                                       │
│     ├─ Run: supabase db dump                                     │
│     └─ Save to: schema.sql                                       │
│                                                                  │
│  3. Update environment variables                                 │
│     ├─ Create/update .env.production                             │
│     ├─ Set production SUPABASE_URL                               │
│     ├─ Set production SUPABASE_ANON_KEY                          │
│     ├─ Set production SUPABASE_SERVICE_ROLE_KEY                  │
│     ├─ Set production POSTGRES_URL                               │
│     ├─ Set production NEXT_PUBLIC_SUPABASE_URL                   │
│     └─ Set production NEXT_PUBLIC_SUPABASE_ANON_KEY              │
│                                                                  │
│  4. Create migration guide                                       │
│     └─ Instructions for applying schema in production            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUCCESS ✓                                   │
│                                                                  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ ✓ Successfully promoted "my-store" to production        ┃  │
│  ┃   Supabase!                                              ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                  │
│  Next Steps:                                                     │
│  1. Review schema.sql                                            │
│  2. Apply schema in production Supabase dashboard                │
│  3. Configure RLS policies                                       │
│  4. Test app with production Supabase                            │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANY COMMAND                                   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │  Check Dyad    │
                        │  Desktop       │
                        └────────┬───────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            ┌───────────────┐         ┌───────────────┐
            │  Connected    │         │  Not Running  │
            └───────┬───────┘         └───────┬───────┘
                    │                         │
                    ▼                         ▼
            ┌───────────────┐         ┌───────────────────────────┐
            │  Execute      │         │  Show Error:              │
            │  Command      │         │  "Dyad Desktop Required"  │
            └───────┬───────┘         │                           │
                    │                 │  Options:                 │
                    ▼                 │  - Open Dyad Website      │
            ┌───────────────┐         │  - Check Connection       │
            │  Success or   │         └───────────────────────────┘
            │  Error        │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │  Log to       │
            │  Output       │
            │  Channel      │
            └───────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      VS CODE EXTENSION                           │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Commands  │  │  Template  │  │    API     │                │
│  │            │  │  Matcher   │  │   Client   │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
│        │               │               │                        │
│        └───────────────┴───────────────┘                        │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ HTTP/IPC
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DYAD DESKTOP                                │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │    IPC     │  │  Template  │  │  Supabase  │                │
│  │  Handlers  │  │   Utils    │  │  Handlers  │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
│        │               │               │                        │
│        └───────────────┴───────────────┘                        │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   GitHub   │  │   Docker   │  │  Supabase  │                │
│  │ (Templates)│  │ (Containers)│  │   Cloud    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

This visual guide shows the complete flow of all features from start to finish!
