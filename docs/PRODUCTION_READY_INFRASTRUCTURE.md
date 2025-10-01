# Production-Ready Code Infrastructure

This document describes the production-ready enhancements added to Dyad for improved code quality, maintainability, and scalability.

## Table of Contents

- [Overview](#overview)
- [Centralized Type System](#centralized-type-system)
- [API Layer Architecture](#api-layer-architecture)
- [OpenAPI Documentation](#openapi-documentation)
- [Autonomous Refactoring](#autonomous-refactoring)
- [Coding Standards](#coding-standards)
- [Usage Guide](#usage-guide)

## Overview

The following enhancements have been implemented to make Dyad production-ready:

1. **Centralized Type System** - All types organized in `src/types/`
2. **Service Layer Architecture** - Business logic separated from handlers
3. **OpenAPI Documentation** - Automated API documentation
4. **Autonomous Refactoring** - Intelligent code quality monitoring
5. **Coding Standards** - Comprehensive guidelines and patterns
6. **Architecture Documentation** - ADRs and architecture guides

## Centralized Type System

### Location

```
src/types/
├── index.ts              # Central export
├── app.types.ts          # Application types
├── chat.types.ts         # Chat and messaging types
├── user.types.ts         # User and settings types
├── integration.types.ts  # Third-party integrations
├── api.types.ts          # API request/response types
└── shared.types.ts       # Common utilities
```

### Usage

```typescript
// Import from centralized location
import type { App, Chat, Message } from "@/types";

// Types are organized by domain
import type { CreateAppParams, CreateAppResult } from "@/types";
```

### Benefits

- Single source of truth for all types
- Prevents type duplication
- Easier refactoring
- Better IDE support

## API Layer Architecture

### Structure

```
src/api/
├── services/             # Business logic layer
│   ├── app.service.ts
│   └── chat.service.ts
├── routes/               # Route definitions (future)
├── middleware/           # Request/response middleware (future)
└── docs/                 # API documentation
    └── openapi-spec.ts
```

### Service Pattern

```typescript
// Service encapsulates business logic
export class AppService {
  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    // Business logic here
  }
}

// Handler delegates to service
ipcMain.handle("create-app", async (event, params) => {
  return await appService.createApp(params);
});
```

### Benefits

- Testable business logic
- Reusable across transports (IPC, HTTP, CLI)
- Clear separation of concerns
- Type-safe contracts

## OpenAPI Documentation

### Generation

```bash
# Generate OpenAPI spec
npm run openapi:generate
```

This creates `openapi.json` with the complete API specification.

### Features

- Programmatic spec generation from types
- Swagger UI integration (future)
- API client generation
- Contract testing

### Specification

The OpenAPI spec includes:

- All API endpoints
- Request/response schemas
- Type definitions
- Examples and descriptions

### Integration

```typescript
// VSCode extension can use the spec
import spec from "./openapi.json";
const client = new OpenAPIClient(spec);
```

## Autonomous Refactoring

### Code Metrics

```bash
# Analyze code quality
npm run quality:analyze

# Generate quality report
npm run quality:report
```

### Features

1. **Automated Quality Metrics**
   - Lines of code per file
   - Cyclomatic complexity
   - Dependency count
   - Function length

2. **Intelligent Refactoring Suggestions**
   - Identifies large files (>300 lines)
   - Detects high complexity
   - Suggests specific improvements
   - Generates refactoring prompts

3. **Integration with AI**
   - Automatic refactoring suggestions during chat
   - AI-generated refactoring prompts
   - Quality-aware code generation

### Configuration

```typescript
// Default thresholds
const config = {
  maxFileLines: 300,
  maxFunctionLines: 50,
  maxComplexity: 10,
  maxDependencies: 10,
};
```

### Enhanced Proposal System

The refactoring engine is integrated with the proposal system:

```typescript
// Automatically suggests refactoring for large files
if (fileLines > 300) {
  actions.push({
    id: "refactor-file",
    path: filePath,
    description: "File is too large and should be refactored",
  });
}
```

## Coding Standards

### Documentation

Comprehensive coding standards are available in:

- [Coding Standards](./docs/guidelines/CODING_STANDARDS.md)
- [Architecture Overview](./docs/architecture/ARCHITECTURE.md)
- [ADRs](./docs/adr/) - Architecture Decision Records

### Key Principles

1. **Type Safety**
   - All code is fully typed
   - Types imported from `@/types`
   - No `any` types without justification

2. **Modularity**
   - Max 300 lines per file
   - Single responsibility per module
   - Clear module boundaries

3. **Testing**
   - Services are unit tested
   - Critical paths have 100% coverage
   - Integration tests for flows

4. **Documentation**
   - JSDoc for public APIs
   - Complex logic is explained
   - ADRs for architectural decisions

### Patterns to Follow

**Service Pattern**

```typescript
export class UserService {
  async getUser(id: number): Promise<User> {
    /* ... */
  }
}
```

**Repository Pattern**

```typescript
export class AppRepository {
  async findById(id: number): Promise<App | null> {
    /* ... */
  }
}
```

**Factory Pattern**

```typescript
export class ChatFactory {
  static create(appId: number): Chat {
    /* ... */
  }
}
```

## Usage Guide

### For Developers

1. **Adding New Types**

   ```typescript
   // Add to appropriate file in src/types/
   export interface NewFeature {
     id: number;
     name: string;
   }

   // Export from index.ts
   export * from "./new-feature.types";
   ```

2. **Creating Services**

   ```typescript
   // Create service in src/api/services/
   export class FeatureService {
     async doSomething(params: Params): Promise<Result> {
       // Business logic
     }
   }
   ```

3. **Checking Code Quality**

   ```bash
   npm run quality:analyze
   ```

4. **Generating API Docs**
   ```bash
   npm run openapi:generate
   ```

### For Code Reviews

Check for:

- [ ] Types defined in `src/types/`
- [ ] Services used for business logic
- [ ] Files under 300 lines
- [ ] Proper error handling
- [ ] Documentation for public APIs
- [ ] Tests for new functionality

### Pre-commit Checklist

```bash
# Format code
npm run prettier

# Lint code
npm run lint

# Type check
npm run ts

# Run tests
npm test

# Check code quality
npm run quality:analyze
```

## Architecture Decision Records

All architectural decisions are documented in [docs/adr/](./docs/adr/):

- [ADR-001: Centralized Type System](./docs/adr/ADR-001-centralized-types.md)
- [ADR-002: Service Layer Architecture](./docs/adr/ADR-002-service-layer.md)
- [ADR-003: OpenAPI Documentation](./docs/adr/ADR-003-openapi-docs.md)
- [ADR-004: Autonomous Refactoring](./docs/adr/ADR-004-autonomous-refactoring.md)

## Future Enhancements

### Planned Features

1. **HTTP API Server** - Expose services via HTTP
2. **Swagger UI** - Interactive API documentation
3. **API Versioning** - Support multiple API versions
4. **Enhanced Metrics** - Visual quality dashboard
5. **Automated Refactoring** - AI-powered code improvements
6. **Plugin System** - Extensible architecture

### Contributing

When adding new features:

1. Follow the coding standards
2. Add types to `src/types/`
3. Use service layer for business logic
4. Update OpenAPI spec
5. Add tests
6. Document architectural decisions in ADRs

## Migration Guide

### Gradual Migration

The new infrastructure is designed for gradual adoption:

1. **Phase 1**: New code uses new patterns
2. **Phase 2**: Refactor high-traffic code
3. **Phase 3**: Complete migration

### Backward Compatibility

Existing code continues to work:

- Old import paths still function
- Handlers can gradually move to services
- No breaking changes required

## Scripts Reference

```bash
# Code quality
npm run quality:analyze      # Analyze codebase
npm run quality:report       # Generate report

# API documentation
npm run openapi:generate     # Generate OpenAPI spec

# Type checking
npm run ts                   # Check all TypeScript

# Linting
npm run lint                 # Lint and auto-fix

# Testing
npm test                     # Run tests
npm run test:watch          # Watch mode
```

## Support

For questions or issues:

- Check [Coding Standards](./docs/guidelines/CODING_STANDARDS.md)
- Review [Architecture Docs](./docs/architecture/ARCHITECTURE.md)
- Read relevant [ADRs](./docs/adr/)
- Open an issue on GitHub

---

**Last Updated**: 2024-10-01
**Version**: 1.0.0
