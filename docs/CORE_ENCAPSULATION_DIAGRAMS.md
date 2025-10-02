# Core Encapsulation Architecture Diagrams

This document contains detailed architecture diagrams for the Dyad Core Encapsulation design.

---

## Diagram 1: Current Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                     DYAD ELECTRON APPLICATION                      │
│                           (Monolithic)                             │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    RENDERER PROCESS                         │  │
│  │                       (React UI)                            │  │
│  │                                                              │  │
│  │  • App Management UI                                        │  │
│  │  • Chat Interface                                           │  │
│  │  • Code Editor                                              │  │
│  │  • Settings                                                 │  │
│  └──────────────────────┬─────────────────────────────────────┘  │
│                         │                                          │
│                         │ IPC (Electron)                           │
│                         │                                          │
│  ┌──────────────────────▼─────────────────────────────────────┐  │
│  │                    MAIN PROCESS                             │  │
│  │                      (Node.js)                              │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │             IPC HANDLERS                              │  │  │
│  │  │  • app_handlers.ts                                    │  │  │
│  │  │  • chat_handlers.ts                                   │  │  │
│  │  │  • neon_handlers.ts                                   │  │  │
│  │  └─────────────────────┬────────────────────────────────┘  │  │
│  │                        │                                     │  │
│  │  ┌─────────────────────▼────────────────────────────────┐  │  │
│  │  │             SERVICE LAYER                             │  │  │
│  │  │  • AppService      (app management)                   │  │  │
│  │  │  • ChatService     (chat operations)                  │  │  │
│  │  │  • NeonService     (database management)              │  │  │
│  │  │  • PortalService   (migrations)                       │  │  │
│  │  │  • ProService      (pro features)                     │  │  │
│  │  └─────────────────────┬────────────────────────────────┘  │  │
│  │                        │                                     │  │
│  │  ┌─────────────────────▼────────────────────────────────┐  │  │
│  │  │        DATA & INFRASTRUCTURE                          │  │  │
│  │  │  • SQLite Database                                    │  │  │
│  │  │  • File System                                        │  │  │
│  │  │  • Child Processes                                    │  │  │
│  │  │  • External APIs (Neon, Vercel, etc.)                │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    HTTP SERVER (NEW)                         │  │
│  │                  Express.js on port 3000                     │  │
│  │                                                               │  │
│  │  Routes → Same Service Layer (above)                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘

EXTERNAL CLIENTS (NEW):
┌──────────────┐
│   Web App    │──HTTP──→ Dyad Electron (port 3000)
│  (Next.js)   │
└──────────────┘
```

**Key Points**:
- ✅ Service layer exists and is production-ready
- ✅ HTTP server coexists with IPC
- ⚠️ Services embedded in Electron (not standalone)

---

## Diagram 2: Proposed Architecture (Target State)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                  (Multiple Access Points)                            │
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  Desktop   │  │   Web App  │  │  CLI Tool  │  │  VS Code Ext │ │
│  │ (Electron) │  │  (Browser) │  │  (Node.js) │  │   (Remote)   │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘ │
│        │               │               │                 │          │
│        │               │               │                 │          │
│  ┌─────▼───────────────▼───────────────▼─────────────────▼───────┐ │
│  │              UNIFIED CLIENT (@dyad/client)                     │ │
│  │                                                                 │ │
│  │  interface DyadClient {                                        │ │
│  │    apps: AppApi;                                               │ │
│  │    chats: ChatApi;                                             │ │
│  │    settings: SettingsApi;                                      │ │
│  │  }                                                              │ │
│  └────────┬──────────────────────┬─────────────────────────────┘ │
│           │                      │                                  │
│     ┌─────▼──────┐        ┌─────▼──────┐                          │
│     │ IpcClient  │        │ HttpClient │                           │
│     │ (Desktop)  │        │ (Web/CLI)  │                           │
│     └─────┬──────┘        └─────┬──────┘                           │
└───────────┼─────────────────────┼──────────────────────────────────┘
            │                     │
            │ IPC                 │ HTTP/REST
            │                     │
┌───────────▼─────────────────────▼──────────────────────────────────┐
│                       TRANSPORT LAYER                               │
│                                                                      │
│  ┌───────────────────┐         ┌──────────────────────────────┐   │
│  │   IPC Handlers    │         │    HTTP REST API             │   │
│  │   (Electron)      │         │    (Express.js)              │   │
│  │                   │         │                               │   │
│  │  • Thin wrappers  │         │  • Routes                    │   │
│  │  • Delegate to    │         │  • Middleware                │   │
│  │    services       │         │  • Controllers               │   │
│  └────────┬──────────┘         └──────────┬───────────────────┘   │
│           │                               │                         │
│           └───────────────┬───────────────┘                         │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                      CORE LAYER                                      │
│                   (@dyad/core package)                               │
│                     STANDALONE & REUSABLE                            │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    SERVICE LAYER                               │  │
│  │              (Business Logic - Transport Agnostic)             │  │
│  │                                                                 │  │
│  │  • AppService      - Application CRUD, file operations         │  │
│  │  • ChatService     - Chat management, message handling         │  │
│  │  • NeonService     - Neon database project management          │  │
│  │  • PortalService   - Database migrations                       │  │
│  │  • ProService      - Pro features, billing                     │  │
│  │  • FileService     - File system operations (NEW)              │  │
│  │  • ProcessService  - Child process management (NEW)            │  │
│  │  • GitService      - Git operations (NEW)                      │  │
│  └─────────────────────────────┬─────────────────────────────────┘  │
│                                │                                     │
│  ┌─────────────────────────────▼─────────────────────────────────┐  │
│  │              REPOSITORY / DATA ACCESS LAYER                    │  │
│  │                 (Database Abstraction)                         │  │
│  │                                                                 │  │
│  │  • AppRepository       - Apps table operations                 │  │
│  │  • ChatRepository      - Chats & messages                      │  │
│  │  • SettingsRepository  - App & user settings                   │  │
│  │  • DatabaseManager     - Connection pooling, transactions      │  │
│  └─────────────────────────────┬─────────────────────────────────┘  │
│                                │                                     │
│  ┌─────────────────────────────▼─────────────────────────────────┐  │
│  │                  INFRASTRUCTURE LAYER                          │  │
│  │                  (External Dependencies)                       │  │
│  │                                                                 │  │
│  │  • SQLite Database      - Local data storage                   │  │
│  │  • File System          - Project files, templates             │  │
│  │  • Child Processes      - Dev servers, builds                  │  │
│  │  • External APIs        - Neon, Vercel, Supabase, etc.        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘

DEPLOYMENT OPTIONS:

Option 1: Desktop Bundle (Electron + Core)
┌──────────────────────┐
│  Dyad Desktop        │
│  ├─ Electron UI      │
│  ├─ IPC Layer        │
│  ├─ HTTP Server      │
│  └─ @dyad/core       │
└──────────────────────┘

Option 2: Standalone Service (@dyad/service)
┌──────────────────────┐
│  Dyad Service        │
│  ├─ Node.js          │
│  ├─ HTTP Server      │
│  └─ @dyad/core       │
└──────────────────────┘
          ↑
          │ HTTP
          │
┌─────────┴────────┐
│  Web App / CLI   │
└──────────────────┘
```

**Key Benefits**:
- ✅ Core is standalone and reusable
- ✅ Clients are loosely coupled
- ✅ Multiple deployment options
- ✅ Easy to test and maintain

---

## Diagram 3: Communication Flow - Desktop App

```
┌─────────────────────────────────────────────────────────────────┐
│  DESKTOP APPLICATION FLOW (Using IPC)                           │
└─────────────────────────────────────────────────────────────────┘

USER ACTION: Click "Create New App"
     │
     ▼
┌──────────────────────────────┐
│   React Component            │
│   (Renderer Process)         │
│                              │
│   const client = useDyad();  │
│   await client.apps.create() │
└──────────────┬───────────────┘
               │
               │ @dyad/client detects Electron environment
               │ Uses IpcClient implementation
               ▼
┌──────────────────────────────┐
│   IpcClient                  │
│   (@dyad/client)             │
│                              │
│   apps.create() →            │
│   ipcRenderer.invoke(        │
│     'create-app', params)    │
└──────────────┬───────────────┘
               │
               │ Electron IPC
               │ (Inter-Process Communication)
               │ Latency: < 1ms
               ▼
┌──────────────────────────────┐
│   IPC Handler                │
│   (Main Process)             │
│                              │
│   ipcMain.handle(            │
│     'create-app',            │
│     async (event, params) => │
│       appService.createApp() │
│   )                          │
└──────────────┬───────────────┘
               │
               │ Method call
               ▼
┌──────────────────────────────┐
│   AppService                 │
│   (@dyad/core)               │
│                              │
│   async createApp(params) {  │
│     // Git init              │
│     // Create files          │
│     // Save to DB            │
│     return result;           │
│   }                          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Database & File System     │
│   • SQLite insert            │
│   • Create directories       │
│   • Initialize git repo      │
└──────────────────────────────┘

Total Latency: < 100ms (including I/O)
```

---

## Diagram 4: Communication Flow - Web App

```
┌─────────────────────────────────────────────────────────────────┐
│  WEB APPLICATION FLOW (Using HTTP)                              │
└─────────────────────────────────────────────────────────────────┘

USER ACTION: Click "Create New App" in browser
     │
     ▼
┌──────────────────────────────┐
│   React Component            │
│   (Browser)                  │
│                              │
│   const client = useDyad();  │
│   await client.apps.create() │
└──────────────┬───────────────┘
               │
               │ @dyad/client detects browser environment
               │ Uses HttpClient implementation
               ▼
┌──────────────────────────────┐
│   HttpClient                 │
│   (@dyad/client)             │
│                              │
│   apps.create() →            │
│   axios.post('/api/apps',    │
│              params)         │
└──────────────┬───────────────┘
               │
               │ HTTP POST
               │ localhost:3000/api/apps
               │ Latency: 5-20ms
               ▼
┌──────────────────────────────┐
│   Express.js HTTP Server     │
│   (Dyad Desktop or Service)  │
│                              │
│   app.post('/api/apps',      │
│     appController.create)    │
└──────────────┬───────────────┘
               │
               │ Middleware Pipeline:
               │ • CORS check
               │ • Body parsing
               │ • Validation (Zod)
               │ • Auth (optional)
               ▼
┌──────────────────────────────┐
│   App Controller             │
│                              │
│   async create(req, res) {   │
│     const result =           │
│       await appService       │
│         .createApp(params);  │
│     res.json(result);        │
│   }                          │
└──────────────┬───────────────┘
               │
               │ Method call
               ▼
┌──────────────────────────────┐
│   AppService                 │
│   (@dyad/core)               │
│                              │
│   async createApp(params) {  │
│     // Git init              │
│     // Create files          │
│     // Save to DB            │
│     return result;           │
│   }                          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Database & File System     │
│   • SQLite insert            │
│   • Create directories       │
│   • Initialize git repo      │
└──────────────────────────────┘

Total Latency: < 200ms (including network + I/O)
```

---

## Diagram 5: Deployment Scenarios Comparison

```
┌────────────────────────────────────────────────────────────────────┐
│  SCENARIO 1: DESKTOP ONLY (CURRENT)                                │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│  User's Computer             │
│                              │
│  ┌────────────────────────┐  │
│  │   Dyad Desktop         │  │
│  │   (Electron)           │  │
│  │                        │  │
│  │   • Renderer UI        │  │
│  │   • Main Process       │  │
│  │   • Service Layer      │  │
│  │   • SQLite DB          │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

Pros: Full features, fast, offline
Cons: Large install, desktop only


┌────────────────────────────────────────────────────────────────────┐
│  SCENARIO 2: WEB + DESKTOP (CURRENT)                               │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│  User's Computer             │
│                              │
│  ┌────────────────────────┐  │
│  │   Browser              │  │
│  │   (Web App)            │  │
│  │                        │  │──HTTP──┐
│  │   • React UI           │  │        │
│  │   • @dyad/client       │  │        │
│  └────────────────────────┘  │        │
└──────────────────────────────┘        │
                                        │
┌──────────────────────────────┐        │
│  Same Computer               │        │
│                              │        │
│  ┌────────────────────────┐  │◄───────┘
│  │   Dyad Desktop         │  │
│  │   (Electron)           │  │
│  │                        │  │
│  │   • HTTP Server :3000  │  │
│  │   • Service Layer      │  │
│  │   • SQLite DB          │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

Pros: Browser access, single install
Cons: Desktop must be running


┌────────────────────────────────────────────────────────────────────┐
│  SCENARIO 3: WEB + STANDALONE SERVICE (PROPOSED)                   │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│  User's Computer             │
│                              │
│  ┌────────────────────────┐  │
│  │   Browser              │  │
│  │   (Web App)            │  │
│  │                        │  │──HTTP──┐
│  │   • React UI           │  │        │
│  │   • @dyad/client       │  │        │
│  └────────────────────────┘  │        │
└──────────────────────────────┘        │
                                        │
┌──────────────────────────────┐        │
│  Same Computer (Background)  │        │
│                              │        │
│  ┌────────────────────────┐  │◄───────┘
│  │   Dyad Service         │  │
│  │   (@dyad/service)      │  │
│  │                        │  │
│  │   • Node.js            │  │
│  │   • HTTP Server :3000  │  │
│  │   • @dyad/core         │  │
│  │   • SQLite DB          │  │
│  └────────────────────────┘  │
│  (systemd/launchd service)   │
└──────────────────────────────┘

Pros: Lighter, browser-focused, no Electron
Cons: Service setup required


┌────────────────────────────────────────────────────────────────────┐
│  SCENARIO 4: MULTI-CLIENT (PROPOSED)                               │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐
│  Computer 1          │  │  Computer 2          │  │  Computer 3  │
│                      │  │                      │  │              │
│  ┌────────────────┐  │  │  ┌────────────────┐  │  │  ┌────────┐  │
│  │    Browser     │  │  │  │   CLI Tool     │  │  │  │ VS Code│  │
│  │   (Web App)    │  │  │  │   (dyad-cli)   │  │  │  │  Ext.  │  │
│  └────────┬───────┘  │  │  └────────┬───────┘  │  │  └───┬────┘  │
└───────────┼──────────┘  └───────────┼──────────┘  └──────┼───────┘
            │                         │                     │
            └─────────────HTTP────────┴──────────HTTP───────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  Server / Cloud                 │
                    │                                  │
                    │  ┌────────────────────────────┐ │
                    │  │   Dyad Service             │ │
                    │  │   (@dyad/service)          │ │
                    │  │                            │ │
                    │  │   • HTTP Server :3000      │ │
                    │  │   • @dyad/core             │ │
                    │  │   • Shared SQLite/Postgres │ │
                    │  └────────────────────────────┘ │
                    └─────────────────────────────────┘

Pros: Centralized, multi-access, team-friendly
Cons: Requires server setup, network dependency
```

---

## Diagram 6: Package Structure

```
MONOREPO STRUCTURE (PROPOSED)

dyad/
├── packages/
│   │
│   ├── @dyad/core/                    ← NEW: Core business logic
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── services/              ← Moved from src/api/services/
│   │   │   │   ├── app.service.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── neon.service.ts
│   │   │   │   ├── portal.service.ts
│   │   │   │   ├── pro.service.ts
│   │   │   │   ├── file.service.ts    ← NEW
│   │   │   │   ├── process.service.ts ← NEW
│   │   │   │   └── git.service.ts     ← NEW
│   │   │   ├── repositories/          ← NEW: Data access layer
│   │   │   │   ├── app.repository.ts
│   │   │   │   ├── chat.repository.ts
│   │   │   │   └── settings.repository.ts
│   │   │   ├── types/                 ← Moved from src/types/
│   │   │   │   ├── app.types.ts
│   │   │   │   ├── chat.types.ts
│   │   │   │   └── api.types.ts
│   │   │   ├── db/                    ← Moved from src/db/
│   │   │   │   ├── schema.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts               ← Public exports
│   │   └── README.md
│   │
│   ├── @dyad/client/                  ← NEW: Unified client interface
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── types.ts               ← DyadClient interface
│   │   │   ├── ipc-client.ts          ← IPC implementation
│   │   │   ├── http-client.ts         ← HTTP implementation
│   │   │   ├── auto-detect.ts         ← Backend detection
│   │   │   └── index.ts
│   │   └── README.md
│   │
│   └── @dyad/service/                 ← NEW: Standalone service
│       ├── package.json
│       ├── src/
│       │   ├── index.ts               ← Main entry point
│       │   ├── server.ts              ← HTTP server setup
│       │   ├── config.ts              ← Configuration
│       │   └── cli.ts                 ← CLI for service control
│       ├── bin/
│       │   └── dyad-service           ← Executable
│       ├── scripts/
│       │   ├── install.sh             ← Installation script
│       │   └── systemd/               ← System service files
│       └── README.md
│
├── src/                               ← EXISTING: Main Electron app
│   ├── ipc/
│   │   └── handlers/                  ← Thin wrappers (delegate to @dyad/core)
│   ├── api/
│   │   └── http/                      ← HTTP routes (delegate to @dyad/core)
│   ├── components/                    ← UI components
│   └── main.ts                        ← Electron main process
│
├── web-app/                           ← EXISTING: Next.js web app
│   ├── src/
│   │   ├── lib/
│   │   │   └── client.ts              ← Update to use @dyad/client
│   │   └── app/
│   └── package.json
│
└── package.json                       ← Root package.json

DEPENDENCIES FLOW:

┌──────────────────┐     ┌──────────────────┐
│  Electron App    │     │    Web App       │
│   (src/)         │     │   (web-app/)     │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         └────────┬───────────────┘
                  │
                  │ depends on
                  │
         ┌────────▼─────────┐
         │   @dyad/client   │
         └────────┬─────────┘
                  │
                  │ depends on
                  │
         ┌────────▼─────────┐
         │    @dyad/core    │
         │                  │
         │  (Standalone,    │
         │   no external    │
         │   dependencies   │
         │   on Electron)   │
         └──────────────────┘
```

---

## Diagram 7: Migration Path

```
PHASE-BY-PHASE MIGRATION

┌─────────────────────────────────────────────────────────────────┐
│  CURRENT STATE (Week 0)                                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  Electron App                                              ││
│  │  ├─ UI (Renderer)                                          ││
│  │  ├─ IPC Handlers (Main) ──┐                               ││
│  │  ├─ HTTP Routes (Main)    ├──→ Services (embedded)        ││
│  │  └─ Services              ─┘   └─ Database                ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PHASE 1: Extract Core (Weeks 1-2)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AFTER PHASE 1                                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  Electron App                                              ││
│  │  ├─ UI (Renderer)                                          ││
│  │  ├─ IPC Handlers ──┐                                       ││
│  │  └─ HTTP Routes    ├──→ import from @dyad/core            ││
│  └────────────────────┴────────────────────────────────────────┘│
│                           │                                     │
│  ┌────────────────────────▼────────────────────────────────────┐│
│  │  @dyad/core (NEW)                                          ││
│  │  └─ Services ──→ Database                                  ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PHASE 2: Add Client (Weeks 3-4)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AFTER PHASE 2                                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  Electron App                                              ││
│  │  ├─ UI uses @dyad/client (IpcClient)                       ││
│  │  ├─ IPC Handlers ──┐                                       ││
│  │  └─ HTTP Routes    ├──→ @dyad/core                         ││
│  └────────────────────┴────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  @dyad/client (NEW)                                        ││
│  │  ├─ IpcClient                                              ││
│  │  └─ HttpClient                                             ││
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                        │
│  ┌──────▼────────────────────────────────────────────────────┐ │
│  │  @dyad/core                                                │ │
│  │  └─ Services ──→ Database                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PHASE 3: Standalone Service (Weeks 5-6)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AFTER PHASE 3                                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  Electron App                                              ││
│  │  ├─ UI uses @dyad/client                                   ││
│  │  ├─ IPC Handlers ──┐                                       ││
│  │  └─ HTTP Routes    ├──→ @dyad/core                         ││
│  └────────────────────┴────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  @dyad/service (NEW) - Can run standalone!                ││
│  │  ├─ HTTP Server :3000                                      ││
│  │  └─ Uses @dyad/core                                        ││
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                        │
│  ┌──────▼────────────────────────────────────────────────────┐ │
│  │  @dyad/client                                              │ │
│  │  ├─ IpcClient ──→ Electron App                            │ │
│  │  └─ HttpClient ──→ @dyad/service OR Electron HTTP         │ │
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                        │
│  ┌──────▼────────────────────────────────────────────────────┐ │
│  │  @dyad/core                                                │ │
│  │  └─ Services ──→ Database                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PHASE 4: Complete API (Weeks 7-8)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FINAL STATE                                                    │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Desktop   │  │   Web App  │  │  CLI Tool  │               │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘               │
│        └────────────────┼────────────────┘                      │
│                         │                                       │
│  ┌──────────────────────▼────────────────────────────────────┐ │
│  │  @dyad/client                                              │ │
│  │  ├─ IpcClient     (for Desktop)                           │ │
│  │  ├─ HttpClient    (for Web/CLI)                           │ │
│  │  └─ Auto-detect   (smart backend discovery)               │ │
│  └──────┬──────────────────────────────────────────────────────┘│
│         │                                                        │
│         ├──→ IPC ──→ Electron App ──→ @dyad/core               │
│         │                                                        │
│         └──→ HTTP ──→ @dyad/service ──→ @dyad/core             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  @dyad/core (Standalone, Reusable)                         ││
│  │  └─ All business logic, services, database access          ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

*These diagrams accompany the [Core Encapsulation Design Study](./CORE_ENCAPSULATION_DESIGN.md)*

*Last Updated: January 2025*
