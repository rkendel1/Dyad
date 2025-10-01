# ADR-003: OpenAPI Documentation

**Date**: 2024-10-01

**Status**: Accepted

## Context

The Dyad API lacks formal documentation:

- No standard API specification
- Developers must read code to understand endpoints
- No automated API testing based on spec
- VSCode extension duplicates type definitions
- Third-party integrations require manual API discovery

Problems:

1. **Lack of Documentation**: API behavior not formally documented
2. **Type Mismatches**: VSCode extension types can drift from main app
3. **No Contract Testing**: Changes can break integrations silently
4. **Manual Discovery**: New developers must explore code

## Decision

Implement **OpenAPI 3.0** specification for the Dyad API:

```
src/api/docs/
├── openapi-spec.ts       # OpenAPI specification
└── schemas/              # Reusable schemas
```

**Features**:

1. Programmatic OpenAPI spec generation
2. Automatic schema sync with TypeScript types
3. Documentation generation from JSDoc
4. API testing based on spec

**Workflow**:

```typescript
// 1. Define types in src/types/
export interface CreateAppParams {
  name: string;
  templateId?: string;
}

// 2. Service uses types
export class AppService {
  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    // ...
  }
}

// 3. OpenAPI spec references types
paths: {
  '/api/apps': {
    post: {
      requestBody: {
        schema: { $ref: '#/components/schemas/CreateAppParams' }
      }
    }
  }
}
```

## Consequences

### Positive

- **Single Source of Truth**: Types → OpenAPI → Documentation
- **Better DX**: Developers can explore API via Swagger UI
- **Contract Testing**: Validate requests/responses against spec
- **Client Generation**: Auto-generate API clients
- **VSCode Extension**: Can import spec instead of duplicating types

### Negative

- **Maintenance Overhead**: Must keep spec in sync with code
- **Build Step**: Need to generate spec during build
- **Learning Curve**: Team needs to learn OpenAPI

### Mitigation

- Generate spec programmatically from types
- Add pre-commit hook to verify spec is up-to-date
- Provide comprehensive examples in spec

## Implementation

### 1. Generate Spec from Types

```typescript
export function generateOpenApiSpec(): OpenAPIV3.Document {
  return {
    openapi: "3.0.0",
    info: {
      title: "Dyad API",
      version: "1.0.0",
    },
    paths: {
      // Auto-generated from service methods
    },
    components: {
      schemas: {
        // Auto-generated from types
      },
    },
  };
}
```

### 2. Build Integration

```json
{
  "scripts": {
    "openapi:generate": "ts-node src/api/docs/generate-spec.ts",
    "openapi:validate": "swagger-cli validate openapi.json",
    "prebuild": "npm run openapi:generate"
  }
}
```

### 3. Documentation Serving

```typescript
// In development mode, serve Swagger UI
if (process.env.NODE_ENV === "development") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
}
```

## Alternatives Considered

### 1. Manual OpenAPI File

**Pros**: Full control, no tooling needed
**Cons**: Hard to keep in sync, prone to errors

**Rejected**: Too error-prone, doesn't scale

### 2. JSDoc to OpenAPI

**Pros**: Documentation in code
**Cons**: Limited type safety, verbose

**Rejected**: TypeScript types are better source of truth

### 3. GraphQL Instead

**Pros**: Better type system, introspection
**Cons**: Requires rewriting API, learning curve

**Rejected**: Too disruptive, REST is sufficient

## Integration with VSCode Extension

The VSCode extension can now:

1. Import OpenAPI spec instead of duplicating types
2. Generate TypeScript client from spec
3. Validate requests against spec
4. Show inline API documentation

```typescript
// vscode-extension/src/api-client.ts
import { OpenAPIClientAxios } from "openapi-client-axios";
import spec from "./openapi.json";

const api = new OpenAPIClientAxios({ definition: spec });
const client = await api.init();

// Fully typed API calls
const result = await client.createApp({ name: "my-app" });
```

## Future Enhancements

1. **HTTP API Server**: Enable HTTP alongside IPC
2. **API Versioning**: Support multiple API versions
3. **Rate Limiting**: Document rate limits in spec
4. **Webhooks**: Document webhook events
5. **SDK Generation**: Auto-generate SDKs for other languages

## Related Decisions

- [ADR-001: Centralized Type System](./ADR-001-centralized-types.md)
- OpenAPI schemas generated from centralized types

- [ADR-002: Service Layer Architecture](./ADR-002-service-layer.md)
- Services provide the API implementation
