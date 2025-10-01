# ADR-002: Service Layer Architecture

**Date**: 2024-10-01

**Status**: Accepted

## Context

The current architecture has business logic embedded directly in IPC handlers:

- `src/ipc/handlers/` contains both IPC handling and business logic
- Difficult to test business logic without IPC layer
- Cannot reuse logic from different transports (e.g., HTTP API)
- Tight coupling between communication layer and domain logic

Example problem:

```typescript
// Current: Business logic in handler
ipcMain.handle("create-app", async (event, params) => {
  // DB queries here
  // File operations here
  // Complex logic here
  return result;
});
```

## Decision

Introduce a **Service Layer** to separate business logic from IPC handlers:

```
src/api/services/
├── app.service.ts        # Application management
├── chat.service.ts       # Chat operations
├── integration.service.ts # Third-party integrations
└── file.service.ts       # File operations
```

**Architecture**:

```
IPC Handler → Service → Database/External API
           ↓
         Types
```

**Pattern**:

```typescript
// Service: Pure business logic
export class AppService {
  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    // Business logic here
  }
}

// Handler: Thin wrapper
ipcMain.handle("create-app", async (event, params) => {
  return await appService.createApp(params);
});
```

## Consequences

### Positive

- **Testability**: Services can be unit tested without IPC
- **Reusability**: Same service can serve IPC, HTTP, CLI
- **Separation of Concerns**: Clear boundary between transport and logic
- **Maintainability**: Easier to understand and modify
- **Type Safety**: Strong typing between layers

### Negative

- **More Files**: Additional layer adds files
- **Indirection**: One more hop to trace logic
- **Migration Effort**: Need to refactor existing handlers

### Mitigation

- Services provide clear value, complexity is justified
- Good documentation helps with tracing
- Gradual migration during feature development

## Implementation Guidelines

### Service Structure

```typescript
export class AppService {
  // Constructor can inject dependencies
  constructor(
    private db: Database,
    private logger: Logger
  ) {}

  // Methods are async and return typed results
  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    this.logger.info('Creating app', params);

    // Business logic
    const app = await this.db.apps.create(params);

    return { app, chatId: /* ... */ };
  }
}

// Singleton for easy access
export const appService = new AppService(db, logger);
```

### Handler Pattern

```typescript
// Handler is thin, just error handling and delegation
const handle = createLoggedHandler(logger);

handle("create-app", async (event, params: CreateAppParams) => {
  return await appService.createApp(params);
});
```

### Testing

```typescript
describe("AppService", () => {
  it("should create app", async () => {
    const mockDb = createMockDb();
    const service = new AppService(mockDb, mockLogger);

    const result = await service.createApp({ name: "test" });

    expect(result.app.name).toBe("test");
  });
});
```

## Alternatives Considered

### 1. Keep Logic in Handlers

**Pros**: Simpler, fewer files
**Cons**: Hard to test, can't reuse, poor separation

**Rejected**: Doesn't scale, violates SRP

### 2. Use Classes for Handlers

**Pros**: Object-oriented, can inject dependencies
**Cons**: Still couples to IPC

**Rejected**: Doesn't solve reusability problem

### 3. Functional Services (Not Classes)

**Pros**: Simpler, less ceremony
**Cons**: Harder to mock, no dependency injection

**Rejected**: Classes provide better structure for complex services

## Migration Strategy

### Phase 1: New Features

- All new features use service layer
- Establish patterns and best practices

### Phase 2: High-Value Refactoring

- Refactor complex handlers to services
- Focus on most-changed code

### Phase 3: Complete Migration

- Move remaining handlers to services
- Remove business logic from handlers

## Related Decisions

- [ADR-001: Centralized Type System](./ADR-001-centralized-types.md)
- Services use centralized types for contracts

- [ADR-003: OpenAPI Documentation](./ADR-003-openapi-docs.md)
- Service layer enables HTTP API with OpenAPI
