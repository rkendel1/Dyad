# HTTP REST API Architecture Document

## Overview

This document outlines the architecture and implementation plan for adding an HTTP REST API to the Dyad application, alongside the existing IPC mechanism. This enhancement will enable broader integration possibilities and make Dyad accessible from non-Electron contexts.

## Current Architecture

### Existing IPC Communication

- **Protocol**: Electron IPC (Inter-Process Communication)
- **Context**: Main process ↔ Renderer process
- **Handlers**: Located in `src/ipc/handlers/`
- **Client**: Located in `src/ipc/ipc_client.ts`
- **Service Layer**: Located in `src/api/services/` (recently implemented)

### Service Layer Foundation

The service layer has been implemented to separate business logic from transport concerns:

- `AppService` - Application management operations
- `ChatService` - Chat and message operations
- `NeonService` - Neon database integration
- `PortalService` - Portal/deployment operations
- `ProService` - Pro/premium features

## Proposed HTTP REST API Architecture

### Technology Stack

1. **HTTP Framework**: Express.js (Node.js)
   - Well-established and widely used
   - Good TypeScript support
   - Large ecosystem of middleware
   - Easy integration with Electron

2. **API Documentation**: OpenAPI 3.0 / Swagger
   - Auto-generated from TypeScript types
   - Interactive API documentation
   - Client SDK generation support

3. **Authentication**: JWT (JSON Web Tokens)
   - Stateless authentication
   - Token-based access control
   - Support for API keys for programmatic access

4. **Validation**: Zod (already in use)
   - Runtime type validation
   - Consistent with existing codebase
   - TypeScript-first approach

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                HTTP Client                       │
│  (Browser, CLI, External Apps, VS Code Ext)     │
└───────────────┬─────────────────────────────────┘
                │
                │ HTTP/REST
                ▼
┌─────────────────────────────────────────────────┐
│           HTTP REST API Server                   │
│    (Express.js running in Electron Main)        │
│  ┌────────────────────────────────────────────┐ │
│  │    Routes & Controllers                    │ │
│  │  /api/apps, /api/chats, /api/settings     │ │
│  └────────────┬───────────────────────────────┘ │
│               │                                  │
│  ┌────────────▼───────────────────────────────┐ │
│  │    Middleware Layer                        │ │
│  │  • Authentication                          │ │
│  │  • Validation                              │ │
│  │  • Error Handling                          │ │
│  │  • Rate Limiting                           │ │
│  └────────────┬───────────────────────────────┘ │
└───────────────┼─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│            Service Layer                         │
│  AppService, ChatService, NeonService, etc.     │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│      Database & File System                     │
│  SQLite (Drizzle ORM), File Operations         │
└─────────────────────────────────────────────────┘
```

### API Endpoints Structure

#### Application Management

- `GET /api/apps` - List all applications
- `GET /api/apps/:id` - Get specific application
- `POST /api/apps` - Create new application
- `PUT /api/apps/:id` - Update application
- `DELETE /api/apps/:id` - Delete application
- `GET /api/apps/:id/settings` - Get app settings
- `PUT /api/apps/:id/settings` - Update app settings
- `POST /api/apps/:id/run` - Run application
- `POST /api/apps/:id/stop` - Stop application
- `GET /api/apps/:id/status` - Get application status

#### Chat Management

- `GET /api/apps/:appId/chats` - List chats for an app
- `GET /api/chats/:id` - Get specific chat
- `POST /api/apps/:appId/chats` - Create new chat
- `PUT /api/chats/:id` - Update chat (title)
- `DELETE /api/chats/:id` - Delete chat
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message (with streaming support)

#### Health & Status

- `GET /api/health` - Health check endpoint
- `GET /api/version` - Get application version
- `GET /api/status` - Get system status

### Implementation Plan

#### Phase 1: Foundation (Week 1-2)

1. Set up Express.js server in Electron main process
2. Configure CORS and security middleware
3. Implement basic health check endpoint
4. Add OpenAPI/Swagger documentation setup
5. Create base controller and route structure

**Files to Create:**

- `src/api/http/server.ts` - HTTP server setup
- `src/api/http/routes/` - Route definitions
- `src/api/http/controllers/` - Controller implementations
- `src/api/http/middleware/` - Middleware functions
- `src/api/http/docs/` - OpenAPI documentation

#### Phase 2: Core Endpoints (Week 3-4)

1. Implement application management endpoints
2. Add chat management endpoints
3. Implement authentication and authorization
4. Add input validation middleware
5. Implement error handling

**Key Tasks:**

- Create AppController using AppService
- Create ChatController using ChatService
- Implement JWT authentication
- Add request validation using Zod schemas
- Implement consistent error responses

#### Phase 3: Advanced Features (Week 5-6)

1. Add streaming support for chat messages
2. Implement WebSocket support for real-time updates
3. Add rate limiting and throttling
4. Implement API key management
5. Add request logging and monitoring

**Key Tasks:**

- Set up Server-Sent Events (SSE) for streaming
- Configure Socket.IO for WebSocket support
- Implement rate limiting middleware
- Create API key generation and validation
- Add structured logging

#### Phase 4: Testing & Documentation (Week 7-8)

1. Write comprehensive API tests
2. Complete OpenAPI documentation
3. Generate client SDKs
4. Write integration guides
5. Performance testing and optimization

**Key Tasks:**

- Unit tests for controllers
- Integration tests for API endpoints
- Complete API reference documentation
- Create usage examples
- Performance benchmarking

### Security Considerations

#### Authentication Options

1. **Local Development**: No authentication required (localhost only)
2. **Token-Based**: JWT tokens for programmatic access
3. **API Keys**: For external integrations
4. **OAuth**: For third-party app integration (future)

#### Security Measures

- CORS configuration for allowed origins
- Rate limiting per IP/token
- Input sanitization and validation
- SQL injection prevention (via ORM)
- XSS protection
- HTTPS support (with self-signed certs for local)

### Configuration

#### Server Configuration

```typescript
interface HttpServerConfig {
  enabled: boolean;
  port: number;
  host: string; // localhost by default
  cors: {
    enabled: boolean;
    origins: string[];
  };
  auth: {
    enabled: boolean;
    jwtSecret: string;
    tokenExpiry: string;
  };
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}
```

#### Settings UI

Add HTTP API configuration to Dyad Desktop settings:

- Enable/disable HTTP API
- Configure port number
- Manage API keys
- View API documentation link

### Benefits

#### For Users

1. **External Tool Integration**: Connect Dyad to other tools and workflows
2. **CLI Tools**: Build command-line interfaces for Dyad
3. **Remote Access**: Access Dyad from other machines (with proper security)
4. **Automation**: Script complex operations using HTTP API
5. **Monitoring**: Integrate with monitoring and alerting systems

#### For Developers

1. **Language Agnostic**: Use any programming language to interact with Dyad
2. **Standard Protocol**: HTTP/REST is universally understood
3. **Easy Testing**: Use tools like Postman, curl, or HTTPie
4. **API Documentation**: Auto-generated, interactive documentation
5. **Client SDKs**: Generate type-safe client libraries

### Backward Compatibility

The HTTP REST API will be **additive** and will not affect existing functionality:

- IPC handlers remain unchanged
- Existing Dyad Desktop UI continues to use IPC
- VS Code extension can continue using current API or migrate to HTTP
- No breaking changes to existing codebase

### Performance Considerations

1. **Local Network**: Minimal latency on localhost
2. **Connection Pooling**: Reuse database connections
3. **Response Caching**: Cache frequently accessed data
4. **Streaming**: Use streaming for large responses
5. **Compression**: Enable gzip compression for responses

### Migration Path

The service layer already provides the abstraction needed:

**Current:**

```typescript
IPC Handler → Service Method → Database/Business Logic
```

**After HTTP API:**

```typescript
IPC Handler → Service Method → Database/Business Logic
HTTP Controller → Service Method → Database/Business Logic
```

Both IPC and HTTP can coexist, sharing the same service layer.

### Future Enhancements

1. **GraphQL API**: Alternative to REST for complex queries
2. **gRPC Support**: For high-performance internal communication
3. **WebSocket Support**: Real-time bidirectional communication
4. **API Versioning**: Support multiple API versions
5. **SDK Generation**: Auto-generate client SDKs for popular languages

## References

- [Express.js Documentation](https://expressjs.com/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- Existing service layer: `src/api/services/`
- VS Code extension API: `vscode-extension/src/dyadApi.ts`

## Conclusion

Adding an HTTP REST API to Dyad will significantly enhance its integration capabilities while maintaining backward compatibility. The existing service layer provides an excellent foundation for this enhancement, making implementation straightforward and maintainable.
