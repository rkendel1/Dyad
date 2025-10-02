# Integration Examples

This document provides examples of how to integrate the modular Dyad API into different platforms.

## Web Application Integration

### Example: Migrating Existing Web App

The existing `web-app/src/lib/api-client.ts` can be replaced with the core package.

#### Before (Current Implementation)

```typescript
// web-app/src/lib/api-client.ts
import axios, { AxiosInstance } from "axios";

export interface DyadApp {
  id: number;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export class DyadApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
      timeout: 10000,
    });
  }

  async getApps(): Promise<DyadApp[]> {
    const response = await this.client.get<{
      success: boolean;
      data: { apps: DyadApp[] };
    }>("/apps");
    if (response.data.success) {
      return response.data.data.apps;
    }
    throw new Error("Failed to fetch apps");
  }

  // ... more methods
}

export const dyadApiClient = new DyadApiClient();
```

#### After (Using Core Package)

```typescript
// web-app/src/lib/dyad-client.ts
import { createHttpClient, type DyadClient } from "@dyad-sh/core";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const dyadClient = createHttpClient({
  baseUrl: API_BASE_URL,
  timeout: 10000,
});

// Export type for convenience
export type { DyadClient };
```

#### Usage in Components

```typescript
// Before
import { dyadApiClient } from "@/lib/api-client";
const apps = await dyadApiClient.getApps();

// After
import { dyadClient } from "@/lib/dyad-client";
const apps = await dyadClient.apps.listApps();
```

### React Hooks Example

Create custom hooks for better integration:

```typescript
// web-app/src/hooks/useDyadApps.ts
import { useState, useEffect } from "react";
import { dyadClient } from "@/lib/dyad-client";
import type { App } from "@dyad-sh/core";

export function useDyadApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchApps() {
      try {
        setLoading(true);
        const apps = await dyadClient.apps.listApps();
        if (mounted) {
          setApps(apps);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch apps"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchApps();

    return () => {
      mounted = false;
    };
  }, []);

  return { apps, loading, error };
}
```

```typescript
// web-app/src/hooks/useDyadChats.ts
import { useState, useEffect } from "react";
import { dyadClient } from "@/lib/dyad-client";
import type { Chat } from "@dyad-sh/core";

export function useDyadChats(appId: number) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchChats() {
      try {
        setLoading(true);
        const chats = await dyadClient.chats.listChats(appId);
        if (mounted) {
          setChats(chats);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch chats"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchChats();

    return () => {
      mounted = false;
    };
  }, [appId]);

  return { chats, loading, error };
}
```

### React Query Integration

```typescript
// web-app/src/queries/apps.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dyadClient } from "@/lib/dyad-client";
import type { App, CreateAppParams } from "@dyad-sh/core";

export function useApps() {
  return useQuery({
    queryKey: ["apps"],
    queryFn: () => dyadClient.apps.listApps(),
  });
}

export function useApp(appId: number) {
  return useQuery({
    queryKey: ["apps", appId],
    queryFn: () => dyadClient.apps.getApp(appId),
    enabled: !!appId,
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateAppParams) => dyadClient.apps.createApp(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}

export function useDeleteApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: number) => dyadClient.apps.deleteApp(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
    },
  });
}
```

### Component Example

```typescript
// web-app/src/components/AppsList.tsx
import { useApps, useDeleteApp } from "@/queries/apps";

export function AppsList() {
  const { data: apps, isLoading, error } = useApps();
  const deleteApp = useDeleteApp();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Applications</h2>
      {apps?.map((app) => (
        <div key={app.id}>
          <h3>{app.name}</h3>
          <p>{app.path}</p>
          <button
            onClick={() => deleteApp.mutate(app.id)}
            disabled={deleteApp.isPending}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Desktop Application Integration (Electron)

### Future IPC Client Implementation

```typescript
// packages/@dyad-sh/core/src/clients/ipc.client.ts
import type { DyadClient, AppApi, ChatApi, SettingsApi } from "../interfaces/client.interface";
import type { App, Chat, Message } from "../types";

// Will be implemented when needed
export class IpcClient implements DyadClient {
  public apps: AppApi;
  public chats: ChatApi;
  public settings: SettingsApi;

  constructor() {
    this.apps = new IpcAppApi();
    this.chats = new IpcChatApi();
    this.settings = new IpcSettingsApi();
  }

  async checkHealth() {
    return window.electron.ipcRenderer.invoke("check-health");
  }

  async connect() {
    // IPC is always connected in Electron
  }

  async disconnect() {
    // No explicit disconnect needed
  }
}

class IpcAppApi implements AppApi {
  async listApps() {
    return window.electron.ipcRenderer.invoke("list-apps");
  }

  async getApp(appId: number) {
    return window.electron.ipcRenderer.invoke("get-app", { appId });
  }

  // ... more methods
}
```

### Auto-Detection Example

```typescript
// Desktop app can auto-detect and use appropriate client
import { detectBackend } from "@dyad-sh/core";

async function initializeClient() {
  const detection = await detectBackend();

  if (detection.type === "ipc" && detection.client) {
    console.log("Using IPC client (Electron)");
    return detection.client;
  }

  if (detection.type === "http" && detection.client) {
    console.log("Using HTTP client");
    return detection.client;
  }

  throw new Error("No backend available");
}
```

## Node.js Script Integration

```typescript
#!/usr/bin/env node
// scripts/my-dyad-tool.ts

import { createHttpClient } from "@dyad-sh/core";

async function main() {
  const client = createHttpClient({
    baseUrl: process.env.DYAD_API_URL || "http://localhost:3000",
  });

  // Check connection
  const health = await client.checkHealth();
  if (health.status !== "ok") {
    console.error("Dyad backend is not healthy");
    process.exit(1);
  }

  // List all apps
  const apps = await client.apps.listApps();
  console.log(`Found ${apps.length} apps`);

  // Create a new chat for the first app
  if (apps.length > 0) {
    const chat = await client.chats.createChat({ appId: apps[0].id });
    console.log(`Created chat ${chat.id}`);

    // Send a message
    const message = await client.chats.sendMessage({
      chatId: chat.id,
      content: "Create a simple homepage",
    });
    console.log(`Sent message: ${message.id}`);
  }
}

main().catch(console.error);
```

## VS Code Extension Integration

```typescript
// vscode-extension/src/dyadClient.ts
import { createHttpClient, type DyadClient } from "@dyad-sh/core";

export class DyadExtensionClient {
  private client: DyadClient;

  constructor(apiUrl: string) {
    this.client = createHttpClient({
      baseUrl: apiUrl,
      timeout: 30000, // Longer timeout for VS Code
    });
  }

  async initialize() {
    const health = await this.client.checkHealth();
    if (health.status !== "ok") {
      throw new Error("Cannot connect to Dyad backend");
    }
  }

  async listApps() {
    return this.client.apps.listApps();
  }

  async createChat(appId: number) {
    return this.client.chats.createChat({ appId });
  }

  async sendMessage(chatId: number, content: string) {
    return this.client.chats.sendMessage({ chatId, content });
  }
}
```

## GitHub Action Integration

```yaml
# .github/workflows/dyad-deploy.yml
name: Deploy with Dyad

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install Dyad CLI
        run: npm install -g @dyad-sh/cli

      - name: Deploy to Dyad
        env:
          DYAD_API_URL: ${{ secrets.DYAD_API_URL }}
          DYAD_API_KEY: ${{ secrets.DYAD_API_KEY }}
        run: |
          dyad health
          dyad apps list
```

## Testing with Mock Client

```typescript
// tests/mocks/mockDyadClient.ts
import type { DyadClient, AppApi, ChatApi, SettingsApi } from "@dyad-sh/core";
import type { App, Chat, Message } from "@dyad-sh/core";

export class MockDyadClient implements DyadClient {
  public apps: AppApi;
  public chats: ChatApi;
  public settings: SettingsApi;

  constructor(private mockData: {
    apps?: App[];
    chats?: Chat[];
    messages?: Message[];
  } = {}) {
    this.apps = new MockAppApi(mockData.apps || []);
    this.chats = new MockChatApi(mockData.chats || [], mockData.messages || []);
    this.settings = new MockSettingsApi();
  }

  async checkHealth() {
    return { status: "ok" as const, version: "test" };
  }

  async connect() {
    // Mock connection
  }

  async disconnect() {
    // Mock disconnection
  }
}

class MockAppApi implements AppApi {
  constructor(private apps: App[]) {}

  async listApps() {
    return this.apps;
  }

  async getApp(appId: number) {
    const app = this.apps.find(a => a.id === appId);
    if (!app) throw new Error("App not found");
    return app;
  }

  async createApp() {
    throw new Error("Not implemented in mock");
  }

  async deleteApp() {
    throw new Error("Not implemented in mock");
  }

  async getAppSettings() {
    return { preferredPackageManager: null, previewUrl: null };
  }

  async updateAppSettings() {
    return { preferredPackageManager: null, previewUrl: null };
  }
}

// Use in tests
import { MockDyadClient } from "./mocks/mockDyadClient";

describe("MyComponent", () => {
  it("should render apps", async () => {
    const mockClient = new MockDyadClient({
      apps: [
        { id: 1, name: "Test App", path: "/test", createdAt: new Date(), updatedAt: new Date() },
      ],
    });

    // Test with mock client
  });
});
```

## Summary

The modular architecture provides:

1. **Consistent API** across all platforms
2. **Type Safety** with shared TypeScript types
3. **Easy Testing** with mock implementations
4. **Flexibility** to add new client types
5. **Better DX** with auto-completion and documentation

Each platform can use the same core package, ensuring consistency and reducing code duplication.
