# @dyad-sh/react

React hooks for Dyad - AI App Builder

## Installation

```bash
npm install @dyad-sh/react @dyad-sh/core
```

## Usage

```typescript
import { createHttpClient } from "@dyad-sh/core";
import { useApps, useChats, useMessages } from "@dyad-sh/react";

const client = createHttpClient({
  baseUrl: "http://localhost:3000",
});

function MyComponent() {
  const { apps, isLoading, error, createApp } = useApps(client);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {apps.map((app) => (
        <div key={app.id}>{app.name}</div>
      ))}
    </div>
  );
}
```

## Available Hooks

- `useDyadClient(client)` - Use Dyad client with connection status
- `useApps(client)` - Fetch and manage apps
- `useApp(client, appId)` - Fetch a single app
- `useChats(client, appId)` - Fetch and manage chats
- `useMessages(client, chatId)` - Fetch messages
- `useMessagesPolling(client, chatId, intervalMs)` - Auto-polling messages

## License

MIT
