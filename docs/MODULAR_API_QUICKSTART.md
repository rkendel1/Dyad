# Modular API Quick Start Guide

This guide helps you quickly get started with Dyad's modular API architecture.

## Overview

Dyad now provides modular packages that you can use to build applications, scripts, and integrations:

- **@dyad-sh/core** - Core types and HTTP client for programmatic access
- **@dyad-sh/cli** - Command-line interface for terminal usage

## Prerequisites

- Dyad backend running (Desktop app or standalone server)
- Node.js 20+ installed
- Backend accessible at `http://localhost:3000` (default)

## Quick Start: CLI

### Install CLI

```bash
# From within the Dyad repository
cd packages/@dyad-sh/cli
npm install
npm run build

# Test it
node dist/cli.js help
```

### Basic CLI Usage

```bash
# Check backend health
node dist/cli.js health

# List all apps
node dist/cli.js apps list

# Get app details
node dist/cli.js apps get 1

# List chats for an app
node dist/cli.js chats list 1

# Create a new chat
node dist/cli.js chats create 1

# Send a message
node dist/cli.js send 5 "Create a homepage component"
```

### Configure CLI

Set environment variables:

```bash
export DYAD_API_URL=http://localhost:3000
export DYAD_API_KEY=your-api-key  # Optional

node dist/cli.js apps list
```

## Quick Start: Core Package

### Install Core Package

```bash
# From within the Dyad repository
cd packages/@dyad-sh/core
npm install
npm run build
```

### Use in Your Project

Create a simple script:

```javascript
// my-script.js
const { createHttpClient } = require('@dyad-sh/core');

async function main() {
  // Create client
  const client = createHttpClient({
    baseUrl: 'http://localhost:3000',
  });

  // Check health
  const health = await client.checkHealth();
  console.log('Backend status:', health.status);

  // List apps
  const apps = await client.apps.listApps();
  console.log(`Found ${apps.length} apps`);
  
  apps.forEach(app => {
    console.log(`  - ${app.name} (${app.id})`);
  });

  // Create a chat for the first app
  if (apps.length > 0) {
    const chat = await client.chats.createChat({ appId: apps[0].id });
    console.log(`Created chat: ${chat.id}`);
  }
}

main().catch(console.error);
```

Run it:

```bash
node my-script.js
```

## Quick Start: TypeScript

### Create a TypeScript Project

```bash
mkdir my-dyad-tool
cd my-dyad-tool
npm init -y
npm install typescript @types/node
npm install file:../path/to/Dyad/packages/@dyad-sh/core
```

### TypeScript Script

```typescript
// my-tool.ts
import { createHttpClient, type App, type Chat } from '@dyad-sh/core';

async function main(): Promise<void> {
  const client = createHttpClient({
    baseUrl: process.env.DYAD_API_URL || 'http://localhost:3000',
  });

  // Type-safe operations
  const apps: App[] = await client.apps.listApps();
  
  for (const app of apps) {
    console.log(`App: ${app.name} (${app.id})`);
    
    const chats: Chat[] = await client.chats.listChats(app.id);
    console.log(`  Chats: ${chats.length}`);
  }
}

main().catch(console.error);
```

### Compile and Run

```bash
npx tsc --init
npx tsc my-tool.ts
node my-tool.js
```

## Common Patterns

### Error Handling

```typescript
import { createHttpClient } from '@dyad-sh/core';

const client = createHttpClient();

try {
  const apps = await client.apps.listApps();
  console.log(apps);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to fetch apps:', error.message);
  }
}
```

### Auto-Detection

```typescript
import { detectBackend } from '@dyad-sh/core';

async function initialize() {
  const detection = await detectBackend();
  
  if (!detection.available) {
    throw new Error(`Backend not available: ${detection.error}`);
  }
  
  console.log(`Using ${detection.type} client`);
  return detection.client!;
}

const client = await initialize();
```

### Custom Configuration

```typescript
import { createHttpClient } from '@dyad-sh/core';

const client = createHttpClient({
  baseUrl: 'http://localhost:3000',
  timeout: 30000,  // 30 seconds
  apiKey: process.env.DYAD_API_KEY,
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

## Example Use Cases

### 1. Automated App Creation

```typescript
import { createHttpClient } from '@dyad-sh/core';

const client = createHttpClient();

async function createProject(name: string) {
  // Create app
  const result = await client.apps.createApp({
    name,
    templateId: 'nextjs',
  });
  
  console.log(`Created app ${result.app.id}`);
  console.log(`Initial chat: ${result.chatId}`);
  
  // Send first message
  await client.chats.sendMessage({
    chatId: result.chatId,
    content: 'Create a modern landing page',
  });
  
  return result.app;
}
```

### 2. Batch Operations

```typescript
async function cleanupOldChats(appId: number, keepCount: number) {
  const chats = await client.chats.listChats(appId);
  
  // Sort by creation date (assuming most recent first)
  const chatsToDelete = chats.slice(keepCount);
  
  for (const chat of chatsToDelete) {
    await client.chats.deleteChat(chat.id);
    console.log(`Deleted chat ${chat.id}`);
  }
  
  console.log(`Kept ${keepCount} chats, deleted ${chatsToDelete.length}`);
}
```

### 3. Status Dashboard

```typescript
async function showDashboard() {
  const health = await client.checkHealth();
  const apps = await client.apps.listApps();
  
  console.log('=== Dyad Dashboard ===');
  console.log(`Status: ${health.status}`);
  console.log(`Version: ${health.version}`);
  console.log(`Apps: ${apps.length}`);
  
  for (const app of apps) {
    const chats = await client.chats.listChats(app.id);
    console.log(`  ${app.name}: ${chats.length} chats`);
  }
}
```

### 4. CI/CD Integration

```typescript
// deploy.ts
import { createHttpClient } from '@dyad-sh/core';

async function deploy(appId: number) {
  const client = createHttpClient({
    baseUrl: process.env.DYAD_API_URL!,
    apiKey: process.env.DYAD_API_KEY!,
  });
  
  // Get app details
  const app = await client.apps.getApp(appId);
  console.log(`Deploying ${app.name}...`);
  
  // Create deployment chat
  const chat = await client.chats.createChat({ appId });
  
  // Send deployment instructions
  await client.chats.sendMessage({
    chatId: chat.id,
    content: 'Deploy to production',
  });
  
  console.log('Deployment initiated');
}

// Run: ts-node deploy.ts
```

## API Reference

### Client Creation

```typescript
// HTTP client
const client = createHttpClient(config);

// Auto-detect
const client = await createDyadClient('auto');

// Backend detection
const detection = await detectBackend();
```

### App API

```typescript
client.apps.listApps(): Promise<App[]>
client.apps.getApp(appId): Promise<App>
client.apps.createApp(params): Promise<CreateAppResult>
client.apps.deleteApp(appId): Promise<void>
client.apps.getAppSettings(appId): Promise<AppSettings>
client.apps.updateAppSettings(appId, settings): Promise<AppSettings>
```

### Chat API

```typescript
client.chats.listChats(appId): Promise<Chat[]>
client.chats.getChat(chatId): Promise<Chat>
client.chats.createChat(params): Promise<Chat>
client.chats.deleteChat(chatId): Promise<void>
client.chats.getChatMessages(chatId): Promise<Message[]>
client.chats.sendMessage(params): Promise<Message>
```

### Health Check

```typescript
client.checkHealth(): Promise<HealthResponse>
```

## Troubleshooting

### Backend Not Running

```
Error: Failed to connect to Dyad backend
```

**Solution**: Start the Dyad desktop app or standalone backend server.

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution**: Check if the backend is running on the correct port. Set `DYAD_API_URL` if using a different port.

### TypeScript Errors

```
Cannot find module '@dyad-sh/core'
```

**Solution**: Make sure the core package is built:
```bash
cd packages/@dyad-sh/core
npm run build
```

### Permission Errors

```
Error: EACCES: permission denied
```

**Solution**: Check file permissions or run with appropriate privileges.

## Next Steps

- Read [MODULAR_API_ARCHITECTURE.md](./MODULAR_API_ARCHITECTURE.md) for architecture details
- Check [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) for platform-specific examples
- Review package READMEs for detailed API documentation
- Experiment with the CLI to understand available commands

## Support

For issues or questions:
1. Check the documentation in `docs/`
2. Review package READMEs
3. Look at integration examples
4. Open an issue on GitHub

## Contributing

To contribute to the modular API:

1. Follow the existing patterns in `@dyad-sh/core`
2. Add types to `src/types/index.ts`
3. Update interfaces in `src/interfaces/`
4. Implement in clients
5. Add tests
6. Update documentation

Happy coding! 🚀
