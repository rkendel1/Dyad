# Modular API Architecture

This document describes the modular API architecture for Dyad, enabling consistent access to core functionality across Desktop, Web, and CLI interfaces.

## Overview

Dyad's modular architecture separates core functionality into reusable packages that can be consumed by different client types. This enables:

- **Consistent API**: Same interface across all platforms
- **Code Reuse**: Shared types and logic reduce duplication
- **Platform Flexibility**: Easy to add new client types (mobile, browser extensions, etc.)
- **Type Safety**: Full TypeScript support throughout

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │     Web      │  │     CLI      │      │
│  │  (Electron)  │  │   (Browser)  │  │   (Node.js)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴─────────────┐
│                    @dyad-sh/core                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              DyadClient Interface                       │ │
│  │  • apps: AppApi                                        │ │
│  │  • chats: ChatApi                                      │ │
│  │  • settings: SettingsApi                               │ │
│  └────────┬──────────────────────┬────────────────────────┘ │
│           │                      │                           │
│  ┌────────▼────────┐    ┌───────▼────────┐                 │
│  │   IpcClient     │    │   HttpClient    │                 │
│  │  (Future)       │    │  (Implemented)  │                 │
│  └─────────────────┘    └────────────────┘                  │
└───────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Dyad Backend                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               HTTP REST API Server                     │ │
│  │  (Express.js running in Electron Main)                 │ │
│  └────────┬───────────────────────────────────────────────┘ │
│           │                                                  │
│  ┌────────▼───────────────────────────────────────────────┐ │
│  │              Service Layer                              │ │
│  │  AppService, ChatService, NeonService, etc.            │ │
│  └────────┬───────────────────────────────────────────────┘ │
└───────────┼─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│           Database & File System                             │
│  SQLite, File Operations, Git, Process Management            │
└─────────────────────────────────────────────────────────────┘
```

## Packages

### @dyad-sh/core

Core library containing shared types, interfaces, and client implementations.

**Location**: `packages/@dyad-sh/core`

**Exports**:
- Type definitions (`App`, `Chat`, `Message`, `StreamChunk`, `CacheEntry`, `SSEMessage`, etc.)
- Client interface (`DyadClient`, `AppApi`, `ChatApi`, `SettingsApi`)
- HTTP client implementation (`HttpClient`)
- IPC client implementation (`IpcClient`)
- Client factory functions (`createDyadClient`, `createHttpClient`, `createIpcClient`, `detectBackend`)
- Cache implementations (`MemoryCache`, `LocalStorageCache`, `IndexedDBCache`, `createCache`)

**Dependencies**: None (pure TypeScript)

**Usage**:
```typescript
import { createHttpClient, type App } from "@dyad-sh/core";

const client = createHttpClient({
  baseUrl: "http://localhost:3000",
});

const apps: App[] = await client.apps.listApps();
```

### @dyad-sh/cli

Command-line interface for Dyad.

**Location**: `packages/@dyad-sh/cli`

**Provides**: Terminal-based interaction with Dyad

**Dependencies**: `@dyad-sh/core`

**Usage**:
```bash
dyad apps list
dyad apps create "My App"
dyad chats list --app-id 1
```

### @dyad-sh/react

React hooks for Dyad client integration.

**Location**: `packages/@dyad-sh/react`

**Provides**: Convenient React hooks for using Dyad clients

**Dependencies**: `@dyad-sh/core`, `react`

**Usage**:
```typescript
import { createHttpClient } from "@dyad-sh/core";
import { useApps, useChats } from "@dyad-sh/react";

const client = createHttpClient({ baseUrl: "http://localhost:3000" });

function MyComponent() {
  const { apps, isLoading, createApp } = useApps(client);
  
  // Use apps data...
}
```

### @dyad-sh/sdk

High-level SDK for third-party integrations.

**Location**: `packages/@dyad-sh/sdk`

**Provides**: Simplified API with caching and auto-retry

**Dependencies**: `@dyad-sh/core`

**Usage**:
```typescript
import { createDyadSDK } from "@dyad-sh/sdk";

const sdk = createDyadSDK({
  baseUrl: "http://localhost:3000",
  cache: true,
  autoRetry: true,
});

await sdk.connect();
const apps = await sdk.apps.list();
```

```bash
dyad apps list
dyad chats create 1
dyad send 5 "Hello, world!"
```

### Future Packages

- `@dyad-sh/sdk`: High-level SDK for building integrations
- `@dyad-sh/react`: React hooks and components
- `@dyad-sh/mobile`: React Native client

## Client Interface

All clients implement the `DyadClient` interface:

```typescript
interface DyadClient {
  apps: AppApi;
  chats: ChatApi;
  settings: SettingsApi;
  checkHealth(): Promise<HealthResponse>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
```

### App API

```typescript
interface AppApi {
  listApps(): Promise<App[]>;
  getApp(appId: number): Promise<App>;
  createApp(params: CreateAppParams): Promise<CreateAppResult>;
  deleteApp(appId: number): Promise<void>;
  getAppSettings(appId: number): Promise<AppSettings>;
  updateAppSettings(appId: number, settings: AppSettings): Promise<AppSettings>;
}
```

### Chat API

```typescript
interface ChatApi {
  listChats(appId: number): Promise<Chat[]>;
  getChat(chatId: number): Promise<Chat>;
  createChat(params: CreateChatParams): Promise<Chat>;
  deleteChat(chatId: number): Promise<void>;
  getChatMessages(chatId: number): Promise<Message[]>;
  sendMessage(params: SendMessageParams): Promise<Message>;
}
```

## Implementation Guide

### Creating a New Client Type

1. Implement the `DyadClient` interface
2. Implement each API interface (`AppApi`, `ChatApi`, `SettingsApi`)
3. Handle connection lifecycle (`connect()`, `disconnect()`)
4. Add error handling and retries

Example:

```typescript
import type { DyadClient, AppApi, ChatApi, SettingsApi } from "@dyad-sh/core";

export class MyCustomClient implements DyadClient {
  public apps: AppApi;
  public chats: ChatApi;
  public settings: SettingsApi;

  constructor(config: CustomConfig) {
    this.apps = new MyAppApi(config);
    this.chats = new MyChatApi(config);
    this.settings = new MySettingsApi(config);
  }

  async checkHealth() {
    // Implementation
  }

  async connect() {
    // Implementation
  }

  async disconnect() {
    // Implementation
  }
}
```

### Using the Client in Your App

#### Web Application

```typescript
import { createHttpClient } from "@dyad-sh/core";

const client = createHttpClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// Use in React
function MyComponent() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    client.apps.listApps().then(setApps);
  }, []);

  return <div>{/* render apps */}</div>;
}
```

#### Desktop Application (Current)

Currently uses IPC directly. In the future:

```typescript
import { createIpcClient } from "@dyad-sh/core";

const client = createIpcClient();
const apps = await client.apps.listApps();
```

#### Using Caching

```typescript
import { createHttpClient, createCache } from "@dyad-sh/core";

const client = createHttpClient({
  baseUrl: "http://localhost:3000",
});

// Choose cache backend based on environment
// - "memory": Fast, but data lost on page reload
// - "localStorage": Persistent, but limited to ~5MB
// - "indexedDB": Persistent, larger storage capacity

const cache = createCache({
  ttl: 300000, // 5 minutes
  maxSize: 100,
  storage: "indexedDB", // or "memory" or "localStorage"
});

// Cache apps
const cacheKey = "apps:list";
let apps = await cache.get(cacheKey);

if (!apps) {
  apps = await client.apps.listApps();
  await cache.set(cacheKey, apps);
}

// Using different cache backends
const memoryCache = createCache({ storage: "memory" }); // Default
const localStorageCache = createCache({ storage: "localStorage" }); // Browser-only
const indexedDBCache = createCache({ storage: "indexedDB" }); // Browser-only, recommended
```

#### Using React Hooks

```typescript
import { createHttpClient } from "@dyad-sh/core";
import { useApps, useChats, useMessages } from "@dyad-sh/react";

const client = createHttpClient({ baseUrl: "http://localhost:3000" });

function AppsComponent() {
  const { apps, isLoading, error, createApp, deleteApp } = useApps(client);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {apps.map((app) => (
        <div key={app.id}>
          {app.name}
          <button onClick={() => deleteApp(app.id)}>Delete</button>
        </div>
      ))}
      <button onClick={() => createApp({ name: "New App" })}>
        Create App
      </button>
    </div>
  );
}
```

#### Using the SDK

```typescript
import { createDyadSDK } from "@dyad-sh/sdk";

const sdk = createDyadSDK({
  baseUrl: "http://localhost:3000",
  cache: true, // Enable caching
  autoRetry: true, // Auto-retry failed requests
  maxRetries: 3,
});

// Connect to backend
await sdk.connect();

// Use simplified API
const apps = await sdk.apps.list();
const app = await sdk.apps.get(1);
await sdk.apps.create({ name: "My App" });

const chats = await sdk.chats.list(1);
const messages = await sdk.chats.getMessages(1);
await sdk.chats.sendMessage({ chatId: 1, content: "Hello!" });

// Clear cache when needed
await sdk.clearCache();

// Disconnect
await sdk.disconnect();
```

#### CLI Application

```typescript
import { createHttpClient } from "@dyad-sh/core";

const client = createHttpClient({
  baseUrl: process.env.DYAD_API_URL || "http://localhost:3000",
});

const apps = await client.apps.listApps();
apps.forEach(app => console.log(app.name));
```

## Migration Guide

### Existing Desktop App

The desktop app currently uses IPC handlers directly. To migrate to the modular architecture:

1. Keep IPC handlers as-is (no breaking changes)
2. Optionally add HTTP client support for remote access
3. Gradually refactor components to use client interface

### Web App (web-app/)

The existing web app already uses HTTP client pattern:

1. Replace `web-app/src/lib/api-client.ts` with `@dyad-sh/core`
2. Update imports to use the new package
3. Benefit from shared types and better typing

Before:
```typescript
import { dyadApiClient } from "@/lib/api-client";
const apps = await dyadApiClient.getApps();
```

After:
```typescript
import { createHttpClient } from "@dyad-sh/core";
const client = createHttpClient();
const apps = await client.apps.listApps();
```

## Benefits

### For Users

- **Consistent Experience**: Same functionality across all platforms
- **More Options**: Use Dyad from terminal, browser, or desktop
- **Better Integration**: Easy to integrate Dyad into existing workflows

### For Developers

- **Type Safety**: Shared TypeScript types prevent errors
- **Code Reuse**: Write once, use everywhere
- **Easy Testing**: Mock the client interface for testing
- **Documentation**: Single source of truth for API contracts

### For the Project

- **Maintainability**: Changes in one place affect all clients
- **Extensibility**: Easy to add new client types
- **Quality**: Centralized testing and validation
- **Community**: Enable third-party integrations

## Testing

### Unit Tests

```typescript
import { HttpClient } from "@dyad-sh/core";

describe("HttpClient", () => {
  it("should list apps", async () => {
    const client = new HttpClient({ baseUrl: "http://test" });
    const apps = await client.apps.listApps();
    expect(apps).toBeInstanceOf(Array);
  });
});
```

### Integration Tests

```typescript
import { createDyadClient } from "@dyad-sh/core";

describe("Integration", () => {
  it("should connect to backend", async () => {
    const client = await createDyadClient("auto");
    const health = await client.checkHealth();
    expect(health.status).toBe("ok");
  });
});
```

## Roadmap

### Phase 1: Foundation ✅ (Complete)

- [x] Create `@dyad-sh/core` package
- [x] Define `DyadClient` interface
- [x] Implement `HttpClient`
- [x] Create client factory with auto-detection
- [x] Build and test core package

### Phase 2: CLI Implementation ✅ (Complete)

- [x] Create `@dyad-sh/cli` package
- [x] Implement basic CLI commands
- [x] Add configuration support
- [x] Build and test CLI package

### Phase 3: Desktop Integration ✅ (Complete)

- [x] Create `IpcClient` implementation
- [x] Update desktop app to use client interface
- [x] Maintain backward compatibility
- [x] Test both IPC and HTTP modes

### Phase 4: Web App Migration ✅ (Complete)

- [x] Update web-app to use `@dyad-sh/core`
- [x] Remove duplicate type definitions
- [x] Improve error handling
- [x] Web-app builds successfully

### Phase 5: Advanced Features ✅ (Complete)

- [x] WebSocket support interfaces
- [x] Streaming response types
- [x] Offline caching support (MemoryCache)
- [x] SDK for third-party integrations

### Phase 6: Additional Packages ✅ (Complete)

- [x] Create `@dyad-sh/react` package with React hooks
- [x] Create `@dyad-sh/sdk` high-level SDK package
- [x] Add comprehensive documentation

### Phase 7: Real-time and Offline Enhancements ✅ (Complete)

- [x] Server-Sent Events (SSE) type definitions
- [x] LocalStorage cache implementation
- [x] IndexedDB cache implementation
- [x] Unified cache factory with backend selection
- [x] Comprehensive test suite for all cache backends

### Phase 8: Future Enhancements

- [ ] WebSocket client implementation
- [ ] SSE client implementation
- [ ] Mobile client (`@dyad-sh/mobile`)
- [ ] Vue composables package (`@dyad-sh/vue`)
- [ ] Browser extension support

## Contributing

When adding new functionality:

1. Define types in `@dyad-sh/core/src/types`
2. Add methods to appropriate interface
3. Implement in all clients
4. Update documentation
5. Add tests

## License

MIT
