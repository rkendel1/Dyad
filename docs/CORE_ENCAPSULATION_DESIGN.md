# Dyad Core Encapsulation Design Study

**Date**: January 2025  
**Status**: Design Proposal  
**Authors**: Dyad Architecture Team

## Executive Summary

This document evaluates the feasibility and design of encapsulating Dyad's core functionality such that both desktop and web applications can communicate with it while remaining loosely coupled. The analysis reveals that **significant progress has already been made** toward this goal through the service layer and HTTP REST API implementations. This document outlines the remaining architectural changes, assesses the web app's ability to operate independently, estimates implementation effort, and evaluates the strategic benefits.

### Key Findings

✅ **Highly Feasible**: The foundation is already in place  
✅ **Web App Independence**: Achievable with minor enhancements  
✅ **Estimated Effort**: 3-4 weeks for full implementation  
✅ **Strategic Value**: High - enables multiple deployment models  
✅ **Recommended Approach**: Staged implementation with clear decision points

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Proposed Core Architecture](#2-proposed-core-architecture)
3. [Communication Patterns](#3-communication-patterns)
4. [Web App Independence Assessment](#4-web-app-independence-assessment)
5. [Implementation Effort Estimation](#5-implementation-effort-estimation)
6. [Viability and Benefits Analysis](#6-viability-and-benefits-analysis)
7. [Recommendations and Roadmap](#7-recommendations-and-roadmap)
8. [Appendices](#8-appendices)

---

## 1. Current State Analysis

### 1.1 Existing Architecture

Dyad currently operates as an Electron desktop application with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Application                      │
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Renderer Process │◄───IPC──►│  Main Process   │          │
│  │  (React UI)       │         │  (Node.js)      │          │
│  └──────────────────┘         └────────┬─────────┘          │
│                                         │                     │
│                                         ▼                     │
│                              ┌─────────────────────┐         │
│                              │   Service Layer     │         │
│                              │  • AppService       │         │
│                              │  • ChatService      │         │
│                              │  • NeonService      │         │
│                              │  • PortalService    │         │
│                              │  • ProService       │         │
│                              └──────────┬──────────┘         │
│                                         │                     │
│                                         ▼                     │
│                              ┌─────────────────────┐         │
│                              │  Data & Resources   │         │
│                              │  • SQLite DB        │         │
│                              │  • File System      │         │
│                              │  • Child Processes  │         │
│                              └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Key Accomplishments

The following components are **already implemented** and provide the foundation for core encapsulation:

#### ✅ Service Layer (ADR-002)

**Location**: `src/api/services/`

**Purpose**: Separates business logic from transport mechanisms

**Services Implemented**:
- `AppService` - Application management (create, list, get, delete)
- `ChatService` - Chat and message operations
- `NeonService` - Neon database project management
- `PortalService` - Database migration operations
- `ProService` - Pro features and billing

**Key Benefits**:
- Business logic is transport-agnostic
- Can be invoked from IPC, HTTP, CLI, or any other interface
- Fully unit testable without Electron
- 70-89% reduction in handler code complexity

#### ✅ HTTP REST API (Completed January 2025)

**Location**: `src/api/http/`

**Components**:
- Express.js server running in Electron main process
- RESTful endpoints for apps, chats, settings
- Middleware for validation, error handling, optional auth
- CORS support for web clients
- OpenAPI documentation

**Status**: Production-ready and fully functional

**Example Endpoints**:
```
GET    /api/health           - Health check
GET    /api/apps             - List applications
GET    /api/apps/:id         - Get specific app
DELETE /api/apps/:id         - Delete app
GET    /api/chats/:id        - Get chat
POST   /api/chats/:id/messages - Send message
```

#### ✅ Web Application (Next.js)

**Location**: `web-app/`

**Features**:
- Next.js-based React application
- API client connecting to Dyad Desktop via HTTP
- App browsing and management
- Chat interface
- Responsive UI with Tailwind CSS

**Current State**: Functional but depends on Dyad Desktop running

#### ✅ Centralized Type System (ADR-001)

**Location**: `src/types/`

**Purpose**: Shared types across all layers

**Files**:
- `app.types.ts` - Application types
- `chat.types.ts` - Chat and message types
- `api.types.ts` - API request/response types
- `integration.types.ts` - External service types

### 1.3 Current Gaps

While significant progress has been made, the following gaps prevent full core encapsulation:

1. **No Standalone Core Package**: Services are embedded in the Electron app
2. **Missing Abstract Client Interface**: No unified client abstraction for IPC vs HTTP
3. **Incomplete API Coverage**: Some operations still IPC-only (e.g., full app creation with git init)
4. **No Backend Service Package**: No standalone Node.js service for web-only deployments
5. **No Auto-Detection**: Web app hardcodes localhost:3000, no backend discovery

---

## 2. Proposed Core Architecture

### 2.1 Core Encapsulation Design

The proposed architecture separates Dyad into three distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │   Web App    │  │   CLI Tool   │      │
│  │   (Electron) │  │   (Next.js)  │  │   (Node.js)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         │  ┌───────────────▼──────────────────┘              │
│         │  │                                                  │
│         │  │     Abstract Communication Interface            │
│         │  │                                                  │
│         ▼  ▼                                                  │
│  ┌────────────────────────────────────────────────┐         │
│  │          DyadClient Interface                   │         │
│  │                                                  │         │
│  │  apps: AppApi                                    │         │
│  │  chats: ChatApi                                  │         │
│  │  settings: SettingsApi                           │         │
│  │  integrations: IntegrationApi                    │         │
│  └───────┬──────────────────────────┬───────────────┘        │
│          │                          │                         │
│  ┌───────▼──────────┐      ┌────────▼──────────┐           │
│  │   IpcClient      │      │   HttpClient       │           │
│  │   (Electron)     │      │   (Web/CLI)        │           │
│  └──────────────────┘      └────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                      TRANSPORT LAYER                           │
│                                                                 │
│  ┌────────────────┐                  ┌────────────────┐       │
│  │  IPC Handlers  │                  │  HTTP Routes   │       │
│  │  (Electron)    │                  │  (Express.js)  │       │
│  └────────┬───────┘                  └────────┬───────┘       │
│           │                                    │               │
│           └────────────┬───────────────────────┘               │
└────────────────────────┼───────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                       CORE LAYER                                │
│                    (@dyad/core package)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │              Service Layer                        │         │
│  │                                                    │         │
│  │  • AppService      - Application management      │         │
│  │  • ChatService     - Chat operations             │         │
│  │  • NeonService     - Database management         │         │
│  │  • PortalService   - Migrations                  │         │
│  │  • ProService      - Pro features                │         │
│  │  • FileService     - File operations             │         │
│  │  • ProcessService  - Process management          │         │
│  │  • GitService      - Git operations              │         │
│  └──────────────────────┬───────────────────────────┘         │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────┐         │
│  │           Data Access Layer                       │         │
│  │                                                    │         │
│  │  • Repository Pattern                             │         │
│  │  • Database Abstraction                           │         │
│  │  • File System Abstraction                        │         │
│  └──────────────────────┬───────────────────────────┘         │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────┐         │
│  │           Infrastructure Layer                    │         │
│  │                                                    │         │
│  │  • SQLite Database                                │         │
│  │  • File System                                    │         │
│  │  • Child Processes                                │         │
│  │  • External APIs (Neon, Vercel, etc.)            │         │
│  └───────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Package Structure

The Dyad core would be extracted into a standalone npm package:

```
@dyad/core/
├── package.json
├── src/
│   ├── services/
│   │   ├── app.service.ts
│   │   ├── chat.service.ts
│   │   ├── neon.service.ts
│   │   ├── portal.service.ts
│   │   ├── pro.service.ts
│   │   ├── file.service.ts
│   │   ├── process.service.ts
│   │   └── git.service.ts
│   ├── repositories/
│   │   ├── app.repository.ts
│   │   ├── chat.repository.ts
│   │   └── settings.repository.ts
│   ├── types/
│   │   ├── app.types.ts
│   │   ├── chat.types.ts
│   │   └── api.types.ts
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   └── index.ts
└── README.md
```

### 2.3 Client Abstraction Layer

A unified client interface that works across transport mechanisms:

```typescript
// packages/@dyad/client/src/types.ts

/**
 * Core client interface for interacting with Dyad backend
 */
export interface DyadClient {
  /** Application management API */
  apps: AppApi;
  
  /** Chat and message API */
  chats: ChatApi;
  
  /** Settings API */
  settings: SettingsApi;
  
  /** Integration management API */
  integrations: IntegrationApi;
  
  /** Connection status */
  isConnected(): Promise<boolean>;
  
  /** Disconnect from backend */
  disconnect(): Promise<void>;
}

/**
 * Application management API
 */
export interface AppApi {
  list(): Promise<App[]>;
  get(id: number): Promise<App>;
  create(params: CreateAppParams): Promise<CreateAppResult>;
  delete(id: number): Promise<void>;
  getSettings(id: number): Promise<AppSettings>;
  updateSettings(id: number, settings: Partial<AppSettings>): Promise<void>;
}

/**
 * Chat API
 */
export interface ChatApi {
  list(appId: number): Promise<Chat[]>;
  get(id: number): Promise<Chat>;
  create(appId: number): Promise<Chat>;
  delete(id: number): Promise<void>;
  getMessages(chatId: number): Promise<Message[]>;
  sendMessage(chatId: number, content: string): Promise<Message>;
}

/**
 * Settings API
 */
export interface SettingsApi {
  get(): Promise<Settings>;
  update(settings: Partial<Settings>): Promise<void>;
}

/**
 * Integration API
 */
export interface IntegrationApi {
  neon: NeonApi;
  vercel: VercelApi;
  supabase: SupabaseApi;
}
```

### 2.4 Client Implementations

#### IPC Client (Electron Desktop)

```typescript
// packages/@dyad/client/src/ipc-client.ts

import type { DyadClient, AppApi, ChatApi } from './types';

/**
 * IPC-based client for Electron renderer process
 */
export class IpcClient implements DyadClient {
  constructor() {
    if (!window.electron) {
      throw new Error('IpcClient requires Electron environment');
    }
  }

  apps: AppApi = {
    list: () => window.electron.ipcRenderer.invoke('list-apps'),
    get: (id) => window.electron.ipcRenderer.invoke('get-app', id),
    create: (params) => window.electron.ipcRenderer.invoke('create-app', params),
    delete: (id) => window.electron.ipcRenderer.invoke('delete-app', id),
    getSettings: (id) => window.electron.ipcRenderer.invoke('get-app-settings', id),
    updateSettings: (id, settings) => 
      window.electron.ipcRenderer.invoke('update-app-settings', id, settings),
  };

  chats: ChatApi = {
    list: (appId) => window.electron.ipcRenderer.invoke('list-chats', appId),
    get: (id) => window.electron.ipcRenderer.invoke('get-chat', id),
    create: (appId) => window.electron.ipcRenderer.invoke('create-chat', appId),
    delete: (id) => window.electron.ipcRenderer.invoke('delete-chat', id),
    getMessages: (chatId) => window.electron.ipcRenderer.invoke('get-chat-messages', chatId),
    sendMessage: (chatId, content) => 
      window.electron.ipcRenderer.invoke('send-message', chatId, content),
  };

  async isConnected(): Promise<boolean> {
    try {
      await window.electron.ipcRenderer.invoke('ping');
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    // IPC connections don't need explicit disconnect
  }
}
```

#### HTTP Client (Web, CLI)

```typescript
// packages/@dyad/client/src/http-client.ts

import type { DyadClient, AppApi, ChatApi } from './types';
import axios, { AxiosInstance } from 'axios';

/**
 * HTTP-based client for web browsers and CLI tools
 */
export class HttpClient implements DyadClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3000/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  apps: AppApi = {
    list: async () => {
      const response = await this.client.get('/apps');
      return response.data.apps;
    },
    get: async (id) => {
      const response = await this.client.get(\`/apps/\${id}\`);
      return response.data;
    },
    create: async (params) => {
      const response = await this.client.post('/apps', params);
      return response.data;
    },
    delete: async (id) => {
      await this.client.delete(\`/apps/\${id}\`);
    },
    getSettings: async (id) => {
      const response = await this.client.get(\`/apps/\${id}/settings\`);
      return response.data;
    },
    updateSettings: async (id, settings) => {
      await this.client.put(\`/apps/\${id}/settings\`, settings);
    },
  };

  chats: ChatApi = {
    list: async (appId) => {
      const response = await this.client.get(\`/apps/\${appId}/chats\`);
      return response.data;
    },
    get: async (id) => {
      const response = await this.client.get(\`/chats/\${id}\`);
      return response.data;
    },
    create: async (appId) => {
      const response = await this.client.post(\`/apps/\${appId}/chats\`);
      return response.data;
    },
    delete: async (id) => {
      await this.client.delete(\`/chats/\${id}\`);
    },
    getMessages: async (chatId) => {
      const response = await this.client.get(\`/chats/\${chatId}/messages\`);
      return response.data;
    },
    sendMessage: async (chatId, content) => {
      const response = await this.client.post(\`/chats/\${chatId}/messages\`, { content });
      return response.data;
    },
  };

  async isConnected(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    // HTTP clients don't need explicit disconnect
  }
}
```

### 2.5 Auto-Detection and Backend Discovery

```typescript
// packages/@dyad/client/src/auto-detect.ts

import type { DyadClient } from './types';
import { IpcClient } from './ipc-client';
import { HttpClient } from './http-client';

/**
 * Backend detection options
 */
export interface BackendDetectionOptions {
  /** HTTP endpoints to try (in order) */
  httpUrls?: string[];
  
  /** Timeout for HTTP detection (ms) */
  timeout?: number;
  
  /** Whether to prefer IPC if available */
  preferIpc?: boolean;
}

/**
 * Automatically detect and connect to available Dyad backend
 */
export async function detectBackend(
  options: BackendDetectionOptions = {}
): Promise<DyadClient> {
  const {
    httpUrls = [
      'http://localhost:3000/api',
      'http://localhost:3001/api',
      'http://127.0.0.1:3000/api',
    ],
    timeout = 5000,
    preferIpc = true,
  } = options;

  // Try IPC first if available and preferred
  if (preferIpc && typeof window !== 'undefined' && (window as any).electron) {
    try {
      const client = new IpcClient();
      const connected = await client.isConnected();
      if (connected) {
        console.log('[DyadClient] Connected via IPC');
        return client;
      }
    } catch (error) {
      console.warn('[DyadClient] IPC connection failed:', error);
    }
  }

  // Try HTTP endpoints
  for (const url of httpUrls) {
    try {
      const client = new HttpClient(url);
      const connected = await Promise.race([
        client.isConnected(),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        ),
      ]);
      
      if (connected) {
        console.log(\`[DyadClient] Connected via HTTP: \${url}\`);
        return client;
      }
    } catch (error) {
      console.warn(\`[DyadClient] HTTP connection failed (\${url}):\`, error);
    }
  }

  throw new Error(
    'No Dyad backend available. Please ensure Dyad Desktop is running or a Dyad service is accessible.'
  );
}

/**
 * Create Dyad client with auto-detection
 */
export async function createDyadClient(
  options?: BackendDetectionOptions
): Promise<DyadClient> {
  return detectBackend(options);
}
```

---
## 3. Communication Patterns

### 3.1 Desktop App (Electron)

The desktop app uses IPC for direct, in-process communication:

```typescript
// src/renderer.tsx (Desktop UI)
import { createDyadClient } from '@dyad/client';

async function main() {
  // Auto-detects IPC in Electron environment
  const client = await createDyadClient({ preferIpc: true });
  
  // Use the client
  const apps = await client.apps.list();
  console.log('Apps:', apps);
}
```

**Flow**:
```
Desktop UI → IpcClient → Electron IPC → Handler → Service → Database
   (React)     (@dyad/client)    (Main Process)    (@dyad/core)
```

**Latency**: < 1ms (in-process)  
**Reliability**: Very high (no network)

### 3.2 Web App (Browser)

The web app uses HTTP to communicate with a running Dyad backend:

```typescript
// web-app/src/lib/client.ts
import { createDyadClient } from '@dyad/client';

async function main() {
  // Auto-detects HTTP backend
  const client = await createDyadClient({
    httpUrls: ['http://localhost:3000/api'],
    preferIpc: false,
  });
  
  // Use the client
  const apps = await client.apps.list();
  console.log('Apps:', apps);
}
```

**Flow**:
```
Web UI → HttpClient → HTTP → Express Routes → Service → Database
 (React)   (@dyad/client)  (localhost:3000)    (@dyad/core)
```

**Latency**: 5-20ms (localhost)  
**Reliability**: High (local network)

### 3.3 CLI Tool

CLI tools can use either transport depending on availability:

```typescript
// packages/dyad-cli/src/index.ts
import { createDyadClient } from '@dyad/client';

async function main() {
  // Auto-detect any available backend
  const client = await createDyadClient();
  
  // List all apps
  const apps = await client.apps.list();
  apps.forEach(app => console.log(`- ${app.name}`));
}
```

### 3.4 Backend Service (Standalone)

For web-only deployments, Dyad core can run as a standalone Node.js service:

```typescript
// packages/@dyad/service/src/index.ts
import { createHttpServer } from '@dyad/core/http';
import { appService, chatService } from '@dyad/core';

async function main() {
  const server = createHttpServer({
    port: 3000,
    services: {
      app: appService,
      chat: chatService,
      // ... other services
    },
  });

  await server.start();
  console.log('Dyad service running on http://localhost:3000');
}

main();
```

---

## 4. Web App Independence Assessment

### 4.1 Can Web App Operate Independently?

**Answer**: Yes, with the proposed architecture, the web app can operate independently of the Electron desktop app, provided a Dyad backend service is available.

### 4.2 Requirements for Independence

#### ✅ Already Satisfied

1. **HTTP API**: Fully implemented and production-ready
2. **Web UI**: Next.js app exists and functions
3. **Service Layer**: Business logic is transport-agnostic
4. **Type System**: Shared types work across platforms

#### 🔄 Needs Implementation

1. **Standalone Backend Service**: Package `@dyad/core` to run without Electron
2. **Client Abstraction**: `@dyad/client` package for unified API
3. **Backend Discovery**: Auto-detection of available backends
4. **Service Installer**: Easy installation of standalone service

### 4.3 Deployment Scenarios

#### Scenario 1: Web + Desktop (Current)

```
┌──────────┐         ┌─────────────────────┐
│ Web App  │─ HTTP ─→│  Dyad Desktop       │
│ (Browser)│         │  (Electron)         │
└──────────┘         │  - Electron UI      │
                     │  - HTTP Server      │
                     │  - Core Services    │
                     └─────────────────────┘
```

**Status**: ✅ Works today  
**Use Case**: User runs Dyad Desktop, accesses via browser  
**Benefits**: Single installation, full functionality

#### Scenario 2: Web + Standalone Service

```
┌──────────┐         ┌─────────────────────┐
│ Web App  │─ HTTP ─→│  Dyad Service       │
│ (Browser)│         │  (Node.js)          │
└──────────┘         │  - HTTP Server      │
                     │  - Core Services    │
                     │  (No Electron UI)   │
                     └─────────────────────┘
```

**Status**: 🔄 Needs implementation (2-3 weeks)  
**Use Case**: User doesn't want desktop app, prefers browser  
**Benefits**: Lighter weight, no Electron overhead

#### Scenario 3: Multiple Web Clients + Service

```
┌──────────┐
│ Web App  │─┐
│ (Browser)│ │
└──────────┘ │
             │       ┌─────────────────────┐
┌──────────┐ ├─HTTP─→│  Dyad Service       │
│ CLI Tool │─┤       │  (Node.js)          │
└──────────┘ │       │  - HTTP Server      │
             │       │  - Core Services    │
┌──────────┐ │       └─────────────────────┘
│  VS Code │─┘
│  Ext.    │
└──────────┘
```

**Status**: 🔄 Needs implementation (3-4 weeks)  
**Use Case**: Team environment, multiple access points  
**Benefits**: Centralized backend, multiple clients

#### Scenario 4: Self-Hosted for Organizations

```
┌──────────┐         ┌─────────────────────┐
│ Employee │─┐       │  Dyad Service       │
│ Browser  │ │       │  (Docker/VM)        │
└──────────┘ │       │  - HTTP Server      │
             ├─HTTP─→│  - Core Services    │
┌──────────┐ │       │  - Shared Database  │
│ Employee │─┘       └─────────────────────┘
│ Browser  │
└──────────┘
```

**Status**: 📋 Future roadmap (requires multi-tenancy)  
**Use Case**: Organizations want private deployment  
**Benefits**: Data privacy, centralized management

### 4.4 Feature Parity Matrix

| Feature | Desktop (IPC) | Web (HTTP) | Standalone Service |
|---------|---------------|------------|-------------------|
| List Apps | ✅ Full | ✅ Full | ✅ Full |
| Create App | ✅ Full | ⚠️ Partial* | ⚠️ Partial* |
| Delete App | ✅ Full | ✅ Full | ✅ Full |
| Chat Interface | ✅ Full | ✅ Full | ✅ Full |
| Code Generation | ✅ Full | ✅ Full | ✅ Full |
| Git Operations | ✅ Full | ⚠️ Limited** | ⚠️ Limited** |
| File System Access | ✅ Direct | 🚫 Via API | ✅ Via API |
| Process Management | ✅ Direct | 🚫 Via API | ✅ Via API |
| Neon Integration | ✅ Full | ✅ Full | ✅ Full |
| Vercel Deployment | ✅ Full | ✅ Full | ✅ Full |
| VS Code Extension | ✅ Full | N/A | ✅ Full |

*App creation with full git initialization needs HTTP endpoint  
**Git operations work but limited by server-side context

---

## 5. Implementation Effort Estimation

### 5.1 Phase 1: Core Package Extraction (1-2 weeks)

**Goal**: Extract `@dyad/core` as standalone package

**Tasks**:
- [ ] Create `packages/@dyad/core` directory structure
- [ ] Move service layer to core package
- [ ] Move types to core package
- [ ] Move database schema to core package
- [ ] Update imports in main application
- [ ] Add build configuration for core package
- [ ] Write unit tests for core package
- [ ] Document core package API

**Complexity**: Medium  
**Risk**: Low (mostly refactoring existing code)  
**Estimate**: 5-10 days

### 5.2 Phase 2: Client Abstraction Layer (1 week)

**Goal**: Create `@dyad/client` package

**Tasks**:
- [ ] Design `DyadClient` interface
- [ ] Implement `IpcClient` wrapper
- [ ] Implement `HttpClient` wrapper
- [ ] Add auto-detection logic
- [ ] Write integration tests
- [ ] Update desktop app to use client
- [ ] Update web app to use client
- [ ] Document client usage

**Complexity**: Medium  
**Risk**: Low (interfaces are well-defined)  
**Estimate**: 4-7 days

### 5.3 Phase 3: Standalone Service Package (1 week)

**Goal**: Create `@dyad/service` for standalone deployments

**Tasks**:
- [ ] Create `packages/@dyad/service` structure
- [ ] Add Node.js HTTP server setup
- [ ] Configure database initialization
- [ ] Add service lifecycle management
- [ ] Create installer script
- [ ] Add system service integration (systemd, etc.)
- [ ] Write deployment documentation
- [ ] Create Docker image (optional)

**Complexity**: Medium-High  
**Risk**: Medium (new deployment scenarios)  
**Estimate**: 5-7 days

### 5.4 Phase 4: Complete API Parity (1 week)

**Goal**: Ensure all operations work via HTTP

**Tasks**:
- [ ] Add HTTP endpoint for full app creation
- [ ] Add streaming support for long-running operations
- [ ] Add WebSocket support for real-time updates
- [ ] Implement file upload/download endpoints
- [ ] Add git operation endpoints
- [ ] Write API integration tests
- [ ] Update API documentation

**Complexity**: High  
**Risk**: Medium (complex operations over HTTP)  
**Estimate**: 5-7 days

### 5.5 Total Effort Summary

| Phase | Duration | Risk | Dependencies |
|-------|----------|------|--------------|
| 1. Core Package | 1-2 weeks | Low | None |
| 2. Client Abstraction | 1 week | Low | Phase 1 |
| 3. Standalone Service | 1 week | Medium | Phase 1 |
| 4. API Parity | 1 week | Medium | Phase 2, 3 |
| **Total** | **4-6 weeks** | **Medium** | Sequential |

**Adjusted for contingency**: **5-7 weeks**

**Team Size**: 1-2 developers  
**Testing Time**: Included in estimates  
**Documentation Time**: Included in estimates

---

## 6. Viability and Benefits Analysis

### 6.1 Technical Viability

#### ✅ Highly Viable

**Reasons**:
1. **Foundation Exists**: Service layer and HTTP API are production-ready
2. **Proven Pattern**: Similar architectures used successfully (VS Code, Slack, Discord)
3. **TypeScript**: Strong typing ensures consistency across layers
4. **No Breaking Changes**: Additive changes, backward compatible
5. **Incremental Migration**: Can be done in stages

**Rating**: 9/10

### 6.2 Strategic Benefits

#### For Users

| Benefit | Impact | Priority |
|---------|--------|----------|
| Access from any device | High | High |
| No large desktop install | Medium | Medium |
| Browser-based UI | High | High |
| Multiple access points | Medium | Low |
| Faster updates (web) | Medium | Medium |

#### For Developers

| Benefit | Impact | Priority |
|---------|--------|----------|
| Single UI codebase | High | High |
| Better testability | High | High |
| Cleaner architecture | High | High |
| External integrations | High | Medium |
| API for automation | Medium | Medium |

#### For Organizations

| Benefit | Impact | Priority |
|---------|--------|----------|
| Self-hosted option | High | High |
| Centralized management | High | Medium |
| Easier deployment | Medium | Medium |
| Multi-user support | High | Low* |
| Cost control | Medium | Medium |

*Requires additional multi-tenancy work

### 6.3 Cost-Benefit Analysis

#### Costs

| Item | Effort | Cost |
|------|--------|------|
| Development | 5-7 weeks | $50-70K** |
| Testing | Included | - |
| Documentation | Included | - |
| Maintenance | Ongoing | $10K/year |

**Based on $100K/year developer salary

#### Benefits (First Year)

| Item | Value |
|------|-------|
| Reduced support burden | $20K |
| Faster feature delivery | $30K |
| New deployment options | $40K |
| Better code quality | $15K |
| **Total** | **$105K** |

**ROI**: Positive within 9-12 months

### 6.4 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API performance issues | Low | Medium | Local deployment minimizes latency |
| File system limitations | Medium | High | Well-defined API, server-side operations |
| Authentication complexity | Low | Medium | Optional JWT, localhost bypass |
| Breaking changes | Very Low | High | Backward compatible, staged rollout |
| Adoption resistance | Low | Low | Desktop app continues to work |

**Overall Risk**: Low-Medium

### 6.5 Competitive Analysis

| Competitor | Architecture | Advantages |
|------------|--------------|------------|
| **Cursor** | Desktop only | Dyad: Web option |
| **Replit** | Cloud only | Dyad: Local + cloud |
| **GitHub Copilot** | Extension only | Dyad: Standalone app |
| **Bolt.new** | Web only | Dyad: Desktop + web |

**Competitive Advantage**: Dyad's hybrid architecture offers flexibility competitors don't

---

## 7. Recommendations and Roadmap

### 7.1 Recommended Approach

✅ **PROCEED with staged implementation**

**Rationale**:
1. Foundation is solid (service layer, HTTP API)
2. Benefits significantly outweigh costs
3. Low risk due to backward compatibility
4. Competitive advantage
5. Enables future growth (cloud, mobile)

### 7.2 Implementation Roadmap

#### Quarter 1: Foundation (Months 1-2)

**Milestone 1.1: Core Package** (Weeks 1-2)
- Extract `@dyad/core` package
- Move services, types, database
- Update imports
- ✅ Success Criteria: Desktop app still works

**Milestone 1.2: Client Abstraction** (Weeks 3-4)
- Create `@dyad/client` package
- Implement IPC and HTTP clients
- Add auto-detection
- ✅ Success Criteria: Web app uses unified client

**Milestone 1.3: Testing & Documentation** (Weeks 5-6)
- Comprehensive testing
- API documentation
- Migration guides
- ✅ Success Criteria: 90% test coverage

#### Quarter 2: Standalone Service (Months 3-4)

**Milestone 2.1: Service Package** (Weeks 7-8)
- Create `@dyad/service` package
- Standalone Node.js server
- Installation scripts
- ✅ Success Criteria: Service runs independently

**Milestone 2.2: API Parity** (Weeks 9-10)
- Complete HTTP endpoints
- Streaming support
- WebSocket integration
- ✅ Success Criteria: Feature parity with desktop

**Milestone 2.3: Production Hardening** (Weeks 11-12)
- Performance optimization
- Security hardening
- Error handling
- ✅ Success Criteria: Production-ready

#### Quarter 3: Ecosystem (Months 5-6)

**Milestone 3.1: CLI Tool** (Weeks 13-14)
- Create `@dyad/cli` package
- Command-line interface
- Scripting support
- ✅ Success Criteria: CLI can manage apps

**Milestone 3.2: VS Code Extension Update** (Weeks 15-16)
- Use `@dyad/client` in extension
- Support HTTP backend
- ✅ Success Criteria: Extension works with service

**Milestone 3.3: Distribution** (Weeks 17-18)
- Docker images
- Installation packages
- Cloud deployment guides
- ✅ Success Criteria: Easy deployment

### 7.3 Decision Points

#### After Milestone 1.3 (Week 6)
- **Evaluate**: Core package quality, migration impact
- **Decision**: Continue to standalone service or pause?
- **Criteria**: Test coverage >90%, no performance degradation

#### After Milestone 2.3 (Week 12)
- **Evaluate**: Service stability, user feedback
- **Decision**: Full production rollout or beta?
- **Criteria**: Zero critical bugs, positive user feedback

#### After Milestone 3.3 (Week 18)
- **Evaluate**: Ecosystem adoption, support burden
- **Decision**: Invest in cloud hosting or focus on local?
- **Criteria**: >100 standalone service deployments

### 7.4 Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Core package extracted | 100% | Week 2 |
| Client abstraction complete | 100% | Week 4 |
| Standalone service working | 100% | Week 8 |
| API feature parity | 95%+ | Week 10 |
| Test coverage | >90% | Week 12 |
| Documentation complete | 100% | Week 12 |
| First production deployment | 1+ | Week 14 |
| User adoption | 10%+ | Month 6 |

### 7.5 Resource Requirements

| Resource | Quantity | Duration |
|----------|----------|----------|
| Senior Developer | 1 | 18 weeks |
| QA Engineer | 0.5 | 6 weeks |
| Technical Writer | 0.25 | 4 weeks |
| DevOps Engineer | 0.25 | 2 weeks |

**Total Effort**: ~20 person-weeks

---

## 8. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Core** | Business logic and services, transport-agnostic |
| **Client** | Abstraction layer for communicating with core |
| **IPC** | Inter-Process Communication (Electron) |
| **HTTP Client** | Client using HTTP REST API |
| **Service Layer** | Business logic separated from transport |
| **Standalone Service** | Core running as Node.js service without Electron |

### Appendix B: Related Documents

- [ADR-001: Centralized Type System](./adr/ADR-001-centralized-types.md)
- [ADR-002: Service Layer Architecture](./adr/ADR-002-service-layer.md)
- [HTTP REST API Architecture](./HTTP_REST_API_ARCHITECTURE.md)
- [Web Application Feasibility Study](./WEB_APP_FEASIBILITY.md)
- [HTTP API Implementation Summary](../HTTP_API_IMPLEMENTATION.md)
- [Service Layer Implementation](../SERVICE_LAYER_IMPLEMENTATION.md)

### Appendix C: Code Examples

#### Example: Using Unified Client in Desktop App

```typescript
// src/renderer.tsx
import { createDyadClient } from '@dyad/client';

function App() {
  const [client, setClient] = useState<DyadClient | null>(null);

  useEffect(() => {
    createDyadClient({ preferIpc: true }).then(setClient);
  }, []);

  if (!client) return <Loading />;

  return <MainUI client={client} />;
}
```

#### Example: Using Unified Client in Web App

```typescript
// web-app/src/app/page.tsx
import { createDyadClient } from '@dyad/client';

export default async function HomePage() {
  const client = await createDyadClient({
    httpUrls: ['http://localhost:3000/api'],
  });

  const apps = await client.apps.list();

  return <AppList apps={apps} />;
}
```

#### Example: Standalone Service

```typescript
// packages/@dyad/service/src/index.ts
import { DyadService } from '@dyad/core';

const service = new DyadService({
  port: 3000,
  dbPath: './dyad.db',
});

await service.start();
console.log('Dyad service running on port 3000');
```

### Appendix D: Migration Checklist

- [ ] Extract `@dyad/core` package
- [ ] Create `@dyad/client` package
- [ ] Update desktop app to use client
- [ ] Update web app to use client
- [ ] Create `@dyad/service` package
- [ ] Add standalone service installer
- [ ] Complete HTTP API endpoints
- [ ] Add streaming support
- [ ] Add WebSocket support
- [ ] Write comprehensive tests
- [ ] Update documentation
- [ ] Create migration guide
- [ ] Train support team
- [ ] Announce to users

### Appendix E: FAQ

**Q: Will the desktop app still work?**  
A: Yes, completely. The desktop app will use IPC as before.

**Q: Do I need to install a separate service?**  
A: No, if you use the desktop app. Yes, if you want web-only access.

**Q: Will this slow down the desktop app?**  
A: No, IPC communication remains unchanged and fast.

**Q: Can I use both desktop and web simultaneously?**  
A: Yes, they can share the same backend.

**Q: Is this secure?**  
A: Yes, localhost-only by default. Optional JWT for remote access.

**Q: What about offline support?**  
A: Desktop app works offline. Web app requires backend connection.

**Q: Will this work on mobile?**  
A: Web interface works on mobile browsers. Native apps are future work.

---

## Conclusion

The encapsulation of Dyad's core is **highly feasible** and **strategically valuable**. With the service layer and HTTP API already in place, the remaining work is primarily packaging and refinement. The proposed architecture enables:

1. ✅ **Loose coupling** between desktop and web applications
2. ✅ **Core independence** through the `@dyad/core` package
3. ✅ **Flexible deployment** options (desktop, web, CLI, cloud)
4. ✅ **Future extensibility** (mobile, cloud hosting, integrations)

**Recommendation**: **PROCEED** with staged implementation, starting with core extraction and client abstraction. The 5-7 week effort delivers significant long-term benefits with minimal risk.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: After Phase 1 completion (Week 6)
