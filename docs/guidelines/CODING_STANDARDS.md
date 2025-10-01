# Dyad Coding Standards and Guidelines

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Code Organization](#code-organization)
3. [TypeScript Guidelines](#typescript-guidelines)
4. [Naming Conventions](#naming-conventions)
5. [Error Handling](#error-handling)
6. [Testing Standards](#testing-standards)
7. [Documentation Requirements](#documentation-requirements)

## Architecture Principles

### 1. Separation of Concerns

- **Service Layer**: Business logic should be in service classes (`src/api/services/`)
- **Handler Layer**: IPC/API handlers should be thin and delegate to services
- **Type Layer**: All types centralized in `src/types/`
- **UI Layer**: Components should focus on presentation

### 2. Dependency Flow

```
UI Components → Handlers → Services → Database/External APIs
                    ↓
                  Types (imported everywhere)
```

### 3. Module Boundaries

- Each module should have a clear, single responsibility
- Minimize coupling between modules
- Use interfaces for inter-module communication
- Avoid circular dependencies

## Code Organization

### Directory Structure

```
src/
├── api/              # API layer
│   ├── services/     # Business logic services
│   ├── routes/       # Route definitions
│   ├── middleware/   # Request/response middleware
│   └── docs/         # API documentation
├── types/            # Centralized type definitions
│   ├── app.types.ts
│   ├── chat.types.ts
│   ├── user.types.ts
│   └── index.ts
├── refactoring/      # Code quality and refactoring tools
├── components/       # UI components
├── ipc/              # IPC handlers
└── db/               # Database layer
```

### File Organization Rules

1. **One primary export per file** (class, function, or type)
2. **Maximum 300 lines per file** - if exceeded, refactor
3. **Group related functionality** in the same directory
4. **Use index.ts** for clean exports from directories

## TypeScript Guidelines

### 1. Type Safety

```typescript
// ✅ GOOD: Explicit types
function createApp(params: CreateAppParams): Promise<CreateAppResult> {
  // ...
}

// ❌ BAD: Implicit any
function createApp(params): Promise<any> {
  // ...
}
```

### 2. Type Imports

```typescript
// ✅ GOOD: Import from centralized types
import type { App, Chat, Message } from "@/types";

// ❌ BAD: Types scattered across files
import type { App } from "../ipc/ipc_types";
```

### 3. Interface vs Type

- Use **interfaces** for object shapes that might be extended
- Use **type** for unions, intersections, and utility types

### 4. Null Safety

```typescript
// ✅ GOOD: Handle null/undefined explicitly
function getAppName(app: App | null): string {
  return app?.name ?? "Unknown";
}

// ❌ BAD: Unsafe access
function getAppName(app: App): string {
  return app.name; // What if app is null?
}
```

## Naming Conventions

### Files

- **Component files**: PascalCase (e.g., `ChatInput.tsx`)
- **Service files**: kebab-case with `.service.ts` suffix (e.g., `app.service.ts`)
- **Type files**: kebab-case with `.types.ts` suffix (e.g., `app.types.ts`)
- **Utility files**: kebab-case (e.g., `string-utils.ts`)

### Variables and Functions

- **Variables**: camelCase (e.g., `userName`, `chatId`)
- **Functions**: camelCase, verb-based (e.g., `createApp`, `getUserSettings`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `API_BASE_URL`)
- **Private members**: prefix with underscore (e.g., `_internalCache`)

### Types and Interfaces

- **Interfaces**: PascalCase, descriptive (e.g., `App`, `ChatMessage`)
- **Type aliases**: PascalCase (e.g., `UserSettings`, `ApiResponse`)
- **Enums**: PascalCase (e.g., `ChatMode`, `MessageRole`)

## Error Handling

### 1. Service Layer Errors

```typescript
// ✅ GOOD: Throw descriptive errors
class AppService {
  async getApp(appId: number): Promise<App> {
    const app = await db.query.apps.findFirst({ where: eq(apps.id, appId) });
    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
    }
    return app;
  }
}
```

### 2. Handler Layer Errors

```typescript
// ✅ GOOD: Catch and transform errors
async function handleGetApp(event: IpcMainInvokeEvent, appId: number) {
  try {
    return await appService.getApp(appId);
  } catch (error) {
    logger.error("Failed to get app:", error);
    throw new Error(`Failed to get app: ${error.message}`);
  }
}
```

### 3. Error Logging

- Always log errors with context
- Use appropriate log levels (error, warn, info, debug)
- Include relevant identifiers (appId, chatId, etc.)

## Testing Standards

### 1. Test Structure

```typescript
describe("AppService", () => {
  describe("createApp", () => {
    it("should create app with valid params", async () => {
      // Arrange
      const params = { name: "test-app" };

      // Act
      const result = await appService.createApp(params);

      // Assert
      expect(result.app.name).toBe("test-app");
    });
  });
});
```

### 2. Test Coverage

- **Services**: 80%+ coverage
- **Critical paths**: 100% coverage
- **Edge cases**: Always test error conditions

### 3. Test Organization

- One test file per source file
- Name: `*.test.ts` or `*.spec.ts`
- Location: Same directory as source or `__tests__/`

## Documentation Requirements

### 1. API Documentation

Every public API must have:

- JSDoc comment with description
- Parameter descriptions
- Return type description
- Usage example for complex APIs

````typescript
/**
 * Creates a new application with the specified parameters
 *
 * @param params - Application creation parameters
 * @param params.name - Name of the application
 * @param params.templateId - Optional template ID to use
 * @returns Promise resolving to created app and initial chat
 *
 * @example
 * ```typescript
 * const result = await appService.createApp({
 *   name: 'my-app',
 *   templateId: 'react'
 * });
 * ```
 */
async createApp(params: CreateAppParams): Promise<CreateAppResult> {
  // ...
}
````

### 2. Complex Logic

Document complex algorithms and business logic:

```typescript
// Calculate token usage considering context window limits
// We need to ensure total tokens don't exceed the model's context window
// while prioritizing recent messages and important context
function calculateTokenBudget(/* ... */) {
  // ...
}
```

### 3. Architecture Decisions

Document significant architectural decisions in `docs/adr/`

## Code Review Checklist

Before submitting code:

- [ ] Types are properly defined and imported from `src/types/`
- [ ] Services are used for business logic (not in handlers)
- [ ] Error handling is comprehensive
- [ ] Code follows naming conventions
- [ ] Documentation is complete
- [ ] Tests are written and passing
- [ ] No files exceed 300 lines
- [ ] No circular dependencies
- [ ] Linting passes without errors

## Refactoring Guidelines

### When to Refactor

1. **File > 300 lines**: Split into smaller modules
2. **Function > 50 lines**: Extract helper functions
3. **Duplicate code**: Extract to shared utility
4. **Complex conditionals**: Use strategy pattern or lookup tables

### How to Refactor

1. Write tests first (if not present)
2. Make small, incremental changes
3. Run tests after each change
4. Update documentation
5. Get code review

## Patterns to Follow

### 1. Service Pattern

```typescript
export class UserService {
  async getUser(id: number): Promise<User> {
    /* ... */
  }
  async createUser(data: CreateUserData): Promise<User> {
    /* ... */
  }
}

export const userService = new UserService();
```

### 2. Repository Pattern (for data access)

```typescript
export class AppRepository {
  async findById(id: number): Promise<App | null> {
    /* ... */
  }
  async save(app: App): Promise<App> {
    /* ... */
  }
}
```

### 3. Factory Pattern (for complex object creation)

```typescript
export class ChatFactory {
  static createNewChat(appId: number): Chat {
    /* ... */
  }
  static fromDatabase(data: any): Chat {
    /* ... */
  }
}
```

## Anti-Patterns to Avoid

### ❌ God Objects

Don't create classes that do too much. Split responsibilities.

### ❌ Tight Coupling

Avoid direct dependencies between unrelated modules.

### ❌ Magic Numbers/Strings

Always use named constants.

### ❌ Callback Hell

Use async/await instead of nested callbacks.

### ❌ Mutable Globals

Avoid global state; use dependency injection.

## Performance Considerations

1. **Lazy Loading**: Load modules only when needed
2. **Caching**: Cache expensive computations
3. **Debouncing**: For frequent events (search, resize)
4. **Pagination**: For large data sets
5. **Indexing**: Ensure database queries are indexed

## Security Guidelines

1. **Input Validation**: Validate all external input
2. **SQL Injection**: Use parameterized queries
3. **XSS Prevention**: Sanitize user content
4. **Authentication**: Verify user permissions
5. **Secrets**: Never commit secrets; use environment variables

---

For specific architectural decisions, see the [Architecture Decision Records](../adr/).
