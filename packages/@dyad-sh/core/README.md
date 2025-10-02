# @dyad-sh/core

Core library for Dyad - AI App Builder. Provides shared types, interfaces, and client implementations for all platforms (Desktop, Web, CLI).

## Installation

```bash
npm install @dyad-sh/core
```

## Features

- **Universal Types**: Shared TypeScript types for App, Chat, Message entities
- **Client Interface**: Abstract `DyadClient` interface for all implementations
- **HTTP Client**: Ready-to-use HTTP/REST API client
- **Auto-detection**: Automatically detect and connect to available backend
- **Type-safe**: Full TypeScript support with comprehensive type definitions

## Usage

### Quick Start

```typescript
import { createDyadClient } from "@dyad-sh/core";

// Auto-detect backend and create client
const client = await createDyadClient("auto");

// Check health
const health = await client.checkHealth();
console.log("Backend status:", health.status);

// List apps
const apps = await client.apps.listApps();
console.log("Apps:", apps);

// Create a new chat
const chat = await client.chats.createChat({ appId: 1 });
console.log("New chat:", chat);
```

### Using HTTP Client Directly

```typescript
import { createHttpClient } from "@dyad-sh/core";

const client = createHttpClient({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
  apiKey: "your-api-key", // optional
});

await client.connect();
```

### Backend Detection

```typescript
import { detectBackend } from "@dyad-sh/core";

const detection = await detectBackend();

if (detection.available && detection.client) {
  console.log(`Connected via ${detection.type}`);
  const apps = await detection.client.apps.listApps();
} else {
  console.error(`Backend not available: ${detection.error}`);
}
```

## API Reference

### DyadClient Interface

The main client interface provides access to all Dyad functionality:

```typescript
interface DyadClient {
  apps: AppApi;      // Application management
  chats: ChatApi;    // Chat management
  settings: SettingsApi; // Settings management
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

## Configuration

```typescript
interface ClientConfig {
  baseUrl?: string;           // Default: "http://localhost:3000"
  timeout?: number;           // Default: 10000ms
  apiKey?: string;            // Optional API key
  headers?: Record<string, string>; // Custom headers
}
```

## Types

### Core Entities

- `App` - Application entity with metadata
- `Chat` - Chat entity with messages
- `Message` - Individual chat message
- `AppSettings` - Application settings

### API Types

- `ApiResponse<T>` - Standard API response wrapper
- `CreateAppParams` - Parameters for creating an app
- `CreateChatParams` - Parameters for creating a chat
- `SendMessageParams` - Parameters for sending a message
- `HealthResponse` - Health check response

## Architecture

This package is designed to be platform-agnostic and can be used in:

- **Desktop (Electron)**: Via IPC client (coming soon)
- **Web**: Via HTTP client
- **CLI**: Via HTTP client
- **Node.js**: Via HTTP client

The modular design allows for easy extension with new client types while maintaining a consistent interface.

## Development

Build the package:

```bash
npm run build
```

Watch mode:

```bash
npm run watch
```

Clean build artifacts:

```bash
npm run clean
```

## License

MIT
