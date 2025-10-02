# @dyad-sh/sdk

High-level SDK for Dyad - AI App Builder

## Installation

```bash
npm install @dyad-sh/sdk
```

## Usage

```typescript
import { createDyadSDK } from "@dyad-sh/sdk";

// Create SDK instance
const sdk = createDyadSDK({
  baseUrl: "http://localhost:3000",
  cache: true, // Enable caching
  autoRetry: true, // Auto-retry failed requests
});

// Connect to backend
await sdk.connect();

// Use the SDK
const apps = await sdk.apps.list();
const app = await sdk.apps.get(1);
const result = await sdk.apps.create({ name: "My App" });

const chats = await sdk.chats.list(1);
const messages = await sdk.chats.getMessages(1);
await sdk.chats.sendMessage({ chatId: 1, content: "Hello!" });

// Disconnect
await sdk.disconnect();
```

## Features

- **Auto-detection**: Automatically detects HTTP or IPC connection
- **Caching**: Built-in caching support for improved performance
- **Auto-retry**: Automatic retry of failed requests
- **Type-safe**: Full TypeScript support
- **Simplified API**: High-level interface for common operations

## Configuration

```typescript
const sdk = createDyadSDK({
  // Connection type: "http", "ipc", or "auto"
  clientType: "auto",
  
  // Base URL for HTTP client
  baseUrl: "http://localhost:3000",
  
  // Enable caching
  cache: true,
  
  // Cache options
  cache: {
    ttl: 300000, // 5 minutes
    maxSize: 100,
    storage: "memory",
  },
  
  // Auto-retry configuration
  autoRetry: true,
  maxRetries: 3,
  
  // Request timeout
  timeout: 10000,
});
```

## API Reference

### Apps API

- `sdk.apps.list()` - List all apps
- `sdk.apps.get(appId)` - Get a specific app
- `sdk.apps.create(params)` - Create a new app
- `sdk.apps.delete(appId)` - Delete an app
- `sdk.apps.getSettings(appId)` - Get app settings
- `sdk.apps.updateSettings(appId, settings)` - Update app settings

### Chats API

- `sdk.chats.list(appId)` - List chats for an app
- `sdk.chats.get(chatId)` - Get a specific chat
- `sdk.chats.create(params)` - Create a new chat
- `sdk.chats.delete(chatId)` - Delete a chat
- `sdk.chats.getMessages(chatId)` - Get messages for a chat
- `sdk.chats.sendMessage(params)` - Send a message

### Settings API

- `sdk.settings.get()` - Get settings
- `sdk.settings.update(settings)` - Update settings

## License

MIT
