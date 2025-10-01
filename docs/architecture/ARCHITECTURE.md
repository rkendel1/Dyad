# Dyad Architecture Overview

## System Architecture

Dyad is built as an Electron-based desktop application with a modern, modular architecture designed for maintainability, scalability, and extensibility.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                    │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   IPC       │  │   Services   │  │   Integrations    │  │
│  │  Handlers   │→ │   (Business  │→ │   (Vercel, Neon,  │  │
│  │             │  │    Logic)    │  │    Supabase, etc) │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│         ↓                 ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Database Layer (SQLite)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ IPC
┌─────────────────────────────────────────────────────────────┐
│                  Electron Renderer Process                   │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │→ │    Atoms     │→ │  IPC Client  │      │
│  │  Components  │  │   (Jotai)    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Core Layers

### 1. Presentation Layer (Renderer Process)

**Location**: `src/components/`, `src/pages/`, `src/routes/`

**Responsibilities**:

- User interface rendering
- User interaction handling
- State management via Jotai atoms
- Communication with main process via IPC

**Key Components**:

- **Chat Interface**: Real-time chat with AI
- **Code Editor**: Monaco-based editor for file editing
- **Preview Panel**: Live preview of applications
- **Settings UI**: User preferences and configuration

### 2. API/Handler Layer

**Location**: `src/ipc/handlers/`, `src/api/`

**Responsibilities**:

- IPC request handling
- Request validation
- Error handling and logging
- Delegation to service layer

**Pattern**:

```typescript
// Handler is thin, delegates to service
async function handleCreateApp(event, params: CreateAppParams) {
  try {
    return await appService.createApp(params);
  } catch (error) {
    logger.error("Failed to create app:", error);
    throw error;
  }
}
```

### 3. Service Layer

**Location**: `src/api/services/`

**Responsibilities**:

- Business logic implementation
- Transaction management
- Integration orchestration
- Domain model manipulation

**Services**:

- **AppService**: Application lifecycle management
- **ChatService**: Chat and message handling
- **IntegrationService**: Third-party integrations
- **FileService**: File system operations

### 4. Data Layer

**Location**: `src/db/`

**Technology**: SQLite with Drizzle ORM

**Responsibilities**:

- Data persistence
- Schema management
- Migrations
- Query optimization

### 5. Integration Layer

**Location**: `src/supabase_admin/`, `src/neon_admin/`, `src/services/`

**Responsibilities**:

- Third-party API integration
- Authentication flows
- Resource provisioning
- Deployment management

**Integrations**:

- **Vercel**: Deployment and hosting
- **Supabase**: Database and authentication
- **Neon**: PostgreSQL database
- **GitHub**: Version control

## Type System Architecture

### Centralized Types

**Location**: `src/types/`

All type definitions are centralized and organized by domain:

```
types/
├── index.ts          # Central export
├── app.types.ts      # Application domain types
├── chat.types.ts     # Chat domain types
├── user.types.ts     # User and settings types
├── integration.types.ts  # Integration types
├── api.types.ts      # API request/response types
└── shared.types.ts   # Common utility types
```

**Benefits**:

- Single source of truth for types
- Easy to find and update types
- Prevents type duplication
- Facilitates refactoring

## Data Flow

### 1. User Action Flow

```
User Interaction → UI Component → Jotai Atom → IPC Call → Handler → Service → Database
                                                                              ↓
                                                                    External APIs
```

### 2. AI Chat Flow

```
User Message → ChatInput → IPC (chat-stream) → ChatStreamHandler
                                                     ↓
                                    LLM Provider (OpenAI, Anthropic, etc.)
                                                     ↓
                                    Response Processing → File Operations
                                                     ↓
                                    Auto-fix (if enabled) → Problem Detection
```

### 3. Application Preview Flow

```
File Changes → File Watcher → Build Process → Dev Server → Preview Panel
```

## Key Design Patterns

### 1. Service Pattern

Services encapsulate business logic and provide a clean API for handlers.

```typescript
export class AppService {
  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    // Business logic here
  }
}
```

### 2. Repository Pattern

Database access is abstracted through repositories (Drizzle ORM).

```typescript
const app = await db.query.apps.findFirst({
  where: eq(apps.id, appId),
});
```

### 3. Factory Pattern

Complex object creation is handled by factories.

```typescript
export class AppFactory {
  static create(params: CreateAppParams): App {
    // Construction logic
  }
}
```

### 4. Observer Pattern

State changes are observed via Jotai atoms.

```typescript
const [apps, setApps] = useAtom(appsAtom);
```

## Scalability Considerations

### 1. Modular Architecture

- Each module has clear boundaries
- Modules can be developed/tested independently
- Easy to add new features without affecting existing code

### 2. Service Layer Abstraction

- Business logic can be reused across different transports
- Easy to add HTTP API alongside IPC
- Testable without UI or IPC layer

### 3. Type Safety

- Centralized types prevent integration errors
- Compile-time checking reduces runtime errors
- Refactoring is safer with strong typing

### 4. Asynchronous Processing

- File operations are non-blocking
- AI responses stream in real-time
- Build processes run in background

### 5. Caching Strategy

- Code metrics are cached
- File contents are cached during builds
- Token counts are cached to reduce computation

## Extension Points

### 1. New AI Providers

Add to `src/ipc/shared/language_model_constants.ts`

### 2. New Integrations

Create new service in `src/api/services/`

### 3. New Templates

Add to `src/shared/templates.ts`

### 4. New Refactoring Rules

Extend `src/refactoring/code-metrics.ts`

## Security Architecture

### 1. Secret Management

- Secrets encrypted using Electron's safeStorage
- Never committed to version control
- Stored in encrypted settings file

### 2. IPC Security

- All IPC handlers validate input
- Type-safe parameters prevent injection
- Error messages don't leak sensitive info

### 3. File System Access

- All file operations are within user's project directory
- Path traversal is prevented
- File uploads are validated

## Performance Optimization

### 1. Lazy Loading

- UI components load on demand
- Services instantiate when needed
- Large dependencies are split

### 2. Incremental Processing

- Large files are processed in chunks
- AI responses stream incrementally
- File changes trigger partial rebuilds

### 3. Efficient Queries

- Database queries are indexed
- N+1 queries are avoided
- Batch operations where possible

## Testing Strategy

### 1. Unit Tests

- Service layer is fully unit tested
- Utilities have comprehensive tests
- Mock external dependencies

### 2. Integration Tests

- IPC handlers tested with mocks
- Database operations tested with test DB
- End-to-end flows verified

### 3. E2E Tests

- Playwright tests for critical flows
- Real Electron app instance
- User scenarios covered

## Monitoring and Observability

### 1. Logging

- Structured logging with electron-log
- Different log levels (error, warn, info, debug)
- Log files for troubleshooting

### 2. Error Tracking

- Errors captured and logged
- Stack traces preserved
- Context included in error logs

### 3. Metrics

- Code quality metrics tracked
- Performance metrics monitored
- Usage patterns analyzed (with consent)

## Future Enhancements

### 1. HTTP API

The service layer is designed to support both IPC and HTTP, enabling:

- Web-based UI
- CLI tools
- Third-party integrations

### 2. Plugin System

Extension points for:

- Custom AI providers
- Custom templates
- Custom refactoring rules

### 3. Distributed Processing

For larger projects:

- Remote build servers
- Distributed AI inference
- Cloud-based storage

---

For detailed coding standards, see [Coding Standards](../guidelines/CODING_STANDARDS.md).
For architectural decisions, see [ADR Directory](../adr/).
