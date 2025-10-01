# Type System and Architecture Refactoring

## Overview

This document describes the type system refactoring and architectural improvements implemented for the Dyad application.

## Centralized Type System

### Location

All type definitions are now centralized in `src/types/` and organized by domain:

```
src/types/
├── index.ts              # Central export point
├── app.types.ts          # Application domain types
├── chat.types.ts         # Chat and messaging types
├── user.types.ts         # User and settings types
├── integration.types.ts  # Third-party integration types
├── api.types.ts          # API request/response types
└── shared.types.ts       # Common utility types
```

### Benefits

1. **Single Source of Truth**: All types are defined once and imported consistently
2. **Easy Discovery**: Types are organized logically by domain
3. **Prevents Duplication**: No more duplicate type definitions across the codebase
4. **Facilitates Refactoring**: Changing a type updates all usages automatically
5. **Better IDE Support**: Autocomplete and type checking work more reliably

### Migration from ipc_types.ts

Previously, types were scattered across the codebase with heavy duplication in `src/ipc/ipc_types.ts`. This file has been refactored to:

1. Re-export all types from the centralized `src/types/` directory
2. Maintain backward compatibility for existing code
3. Preserve Zod validation schemas that need to stay with IPC handlers

**Old approach (duplicated):**

```typescript
// src/ipc/ipc_types.ts
export interface App {
  id: number;
  name: string;
  // ... 30+ fields
}

// src/types/app.types.ts
export interface App {
  id: number;
  name: string;
  // ... 30+ fields (duplicate!)
}
```

**New approach (centralized):**

```typescript
// src/types/app.types.ts
export interface App {
  id: number;
  name: string;
  // ... all fields defined once
}

// src/ipc/ipc_types.ts
export * from "../types"; // Re-export everything
```

### Import Guidelines

**Recommended (new code):**

```typescript
import type { App, Chat, Message } from "@/types";
```

**Deprecated (legacy code):**

```typescript
import type { App, Chat, Message } from "../ipc/ipc_types";
```

The `@/types` import is shorter and makes it clear you're using the centralized type system.

## Database Schema Normalization

### Naming Conventions

The database schema follows a consistent naming convention:

- **Database columns**: `snake_case` (e.g., `supabase_project_id`, `vercel_team_slug`)
- **TypeScript properties**: `camelCase` (e.g., `supabaseProjectId`, `vercelTeamSlug`)
- **Drizzle ORM**: Automatically maps between these conventions

### Example

```typescript
// Database schema (src/db/schema.ts)
export const apps = sqliteTable("apps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  supabaseProjectId: text("supabase_project_id"),
  vercelTeamSlug: text("vercel_team_slug"),
});

// TypeScript usage
const app = await db.query.apps.findFirst({
  where: eq(apps.id, appId),
});
console.log(app.supabaseProjectId); // camelCase in TypeScript
console.log(app.vercelTeamSlug); // camelCase in TypeScript
```

## External API Data Caching

### Problem

Previously, external API data (e.g., Supabase project names, Vercel team slugs) was fetched on every request from the Supabase/Vercel APIs. This caused:

1. Unnecessary API calls
2. Slower response times
3. Potential rate limiting issues

### Solution

We now cache external API data in the database:

#### New Fields Added

- `supabase_project_name` - Cached name from Supabase API
- `vercel_team_slug` - Cached slug from Vercel API

#### Caching Strategy

1. **On First Access**: Fetch from external API and cache in database
2. **On Subsequent Access**: Use cached value from database
3. **On ID Change**: Clear cached value (will be re-fetched on next access)

#### Implementation

```typescript
// In get-app handler
let supabaseProjectName: string | null = app.supabaseProjectName;
if (app.supabaseProjectId && settings.supabase?.accessToken?.value) {
  // Fetch from API if not cached
  if (!supabaseProjectName) {
    supabaseProjectName = await getSupabaseProjectName(app.supabaseProjectId);
    // Cache in database for future requests
    if (supabaseProjectName) {
      await db
        .update(apps)
        .set({ supabaseProjectName })
        .where(eq(apps.id, appId));
    }
  }
}
```

#### When Cached Values Are Cleared

Cached values are automatically cleared when:

1. The integration is disconnected (`supabaseProjectId` set to `null`)
2. The integration ID changes (switching to a different project)
3. This ensures stale data is never served

### Benefits

1. **Performance**: Reduced API calls and faster response times
2. **Reliability**: Less dependent on external API availability
3. **Rate Limits**: Avoids hitting rate limits on external APIs
4. **Offline Support**: Cached data available even if external APIs are down

## Data Flow Architecture

### Application Layer Flow

```
┌─────────────────┐
│   Components    │  React UI components
└────────┬────────┘
         │ IPC calls
         ▼
┌─────────────────┐
│  IPC Handlers   │  Electron IPC handlers (src/ipc/handlers/)
└────────┬────────┘
         │ Business logic
         ▼
┌─────────────────┐
│   Services      │  Business logic layer (src/api/services/)
└────────┬────────┘
         │ Data access
         ▼
┌─────────────────┐
│   Database      │  SQLite with Drizzle ORM (src/db/)
└─────────────────┘
```

### Integration Flow

```
┌─────────────────┐
│   IPC Handler   │
└────────┬────────┘
         │
         ├─── Store integration ID in database
         │
         ├─── Fetch external data (if needed)
         │
         └─── Cache external data in database
```

### Example: Connecting to Vercel

1. User connects to Vercel project via UI
2. `connect-vercel-project` IPC handler is called
3. Handler stores `vercelProjectId` and `vercelTeamId` in database
4. Handler sets `vercelTeamSlug` to `null` (will be cached on next fetch)
5. Next time `get-app` is called:
   - Check if `vercelTeamSlug` is cached
   - If not, fetch from Vercel API
   - Cache the result in database
   - Return app with all data

## API Layer Architecture

### Current State

The API layer has been implemented in `src/api/` with the following structure:

- `services/` - Implemented service layer for business logic
  - `app.service.ts` - Stub for application management (to be fully implemented)
  - `chat.service.ts` - Stub for chat operations (to be fully implemented)
  - `neon.service.ts` - **Fully implemented** Neon database project management
  - `pro.service.ts` - **Fully implemented** Pro/billing operations
  - `portal.service.ts` - **Fully implemented** Database migration management
- `docs/` - OpenAPI specification stubs
- `README.md` - Documentation

### Service Pattern

Services separate business logic from IPC handlers:

```typescript
// src/api/services/neon.service.ts
export class NeonService {
  async createProject(params: CreateNeonProjectParams): Promise<NeonProject> {
    // Business logic here
  }
}

// src/ipc/handlers/neon_handlers.ts
ipcMain.handle("neon:create-project", async (_, params) => {
  return await neonService.createProject(params);
});
```

### Implemented Services

1. **NeonService** - Manages Neon database projects
   - `createProject()` - Creates projects with dev/preview branches
   - `getProject()` - Retrieves project info with branch details
2. **ProService** - Manages Pro features and billing
   - `getUserBudget()` - Fetches user budget from LLM Gateway
3. **PortalService** - Manages database migrations
   - `createMigration()` - Creates migrations with git integration

### Benefits

1. **Reusability**: Services can be used from multiple transports (IPC, HTTP, CLI)
2. **Testability**: Services can be unit tested without Electron
3. **Separation of Concerns**: Business logic separate from transport layer
4. **Maintainability**: Reduced handler code by ~85% through service extraction

### Future Enhancements

1. Complete implementation of AppService and ChatService
2. Add HTTP REST API alongside IPC
3. Generate OpenAPI documentation from types
4. Add service-level caching and validation

## Best Practices

### Type Definitions

1. **Always import from `@/types`**: Use the centralized type system
2. **Organize by domain**: Keep related types together
3. **Use TypeScript interfaces**: For object shapes (more flexible than types)
4. **Use TypeScript types**: For unions, intersections, and aliases
5. **Document complex types**: Add JSDoc comments for non-obvious types

### Database Access

1. **Use Drizzle ORM**: Don't write raw SQL unless necessary
2. **Use transactions**: For operations that must succeed or fail together
3. **Cache external data**: Store fetched API data to reduce external calls
4. **Clear stale caches**: When IDs change, clear associated cached data

### IPC Handlers

1. **Keep handlers thin**: Delegate to services for business logic
2. **Use typed parameters**: Import types from `@/types`
3. **Handle errors gracefully**: Return user-friendly error messages
4. **Log important operations**: Use electron-log for debugging

## Migration Checklist

If you're updating existing code to use the new architecture:

- [ ] Import types from `@/types` instead of `ipc_types`
- [ ] Use consistent camelCase for TypeScript properties
- [ ] Ensure database columns use snake_case
- [ ] Cache external API data in the database
- [ ] Clear cached data when IDs change
- [ ] Add JSDoc comments to new types
- [ ] Update tests to use centralized types

## Related Documentation

- [Production-Ready Infrastructure](./PRODUCTION_READY_INFRASTRUCTURE.md)
- [Coding Standards](./guidelines/CODING_STANDARDS.md)
- [Architecture Overview](./architecture/ARCHITECTURE.md)
- [ADR-001: Centralized Types](./adr/ADR-001-centralized-types.md)
