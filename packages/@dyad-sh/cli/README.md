# @dyad-sh/cli

Command-line interface for Dyad - AI App Builder. Interact with Dyad from your terminal.

## Installation

```bash
npm install -g @dyad-sh/cli
```

Or use with npx:

```bash
npx @dyad-sh/cli <command>
```

## Prerequisites

The Dyad backend must be running and accessible. By default, the CLI connects to `http://localhost:3000`. You can override this with the `DYAD_API_URL` environment variable.

## Usage

```bash
dyad <command> [options]
```

## Commands

### App Management

```bash
# List all applications
dyad apps list

# Get details of a specific app
dyad apps get <appId>

# Delete an application
dyad apps delete <appId>
```

### Chat Management

```bash
# List all chats for an app
dyad chats list <appId>

# Get details of a specific chat
dyad chats get <chatId>

# Create a new chat for an app
dyad chats create <appId>

# Delete a chat
dyad chats delete <chatId>
```

### Messaging

```bash
# List messages in a chat
dyad messages <chatId>

# Send a message to a chat
dyad send <chatId> "Your message here"
```

### System

```bash
# Check backend health
dyad health

# Show help message
dyad help
```

## Configuration

The CLI can be configured using environment variables:

- `DYAD_API_URL`: Backend API URL (default: `http://localhost:3000`)
- `DYAD_API_KEY`: API key for authentication (optional)

### Example

```bash
export DYAD_API_URL=http://localhost:3000
export DYAD_API_KEY=your-api-key-here

dyad apps list
```

## Examples

### List all apps

```bash
$ dyad apps list

Found 2 app(s):

  [1] my-nextjs-app
      Path: /Users/me/dyad-apps/my-nextjs-app
      Created: 1/15/2024, 10:30:00 AM

  [2] react-dashboard
      Path: /Users/me/dyad-apps/react-dashboard
      Created: 1/16/2024, 2:15:00 PM
```

### Get app details

```bash
$ dyad apps get 1

App Details:

  ID: 1
  Name: my-nextjs-app
  Path: /Users/me/dyad-apps/my-nextjs-app
  Created: 1/15/2024, 10:30:00 AM
  Updated: 1/15/2024, 3:45:00 PM
  Package Manager: npm
```

### Create a new chat

```bash
$ dyad chats create 1
Chat created successfully: 5
```

### Send a message

```bash
$ dyad send 5 "Add a new homepage component"
Message sent successfully: 42
```

### Check health

```bash
$ dyad health
Backend Status: ok
Version: 0.22.0-beta.1
Uptime: 3600s
```

## Development

Build the CLI:

```bash
npm run build
```

Watch mode:

```bash
npm run watch
```

Test locally:

```bash
node dist/cli.js apps list
```

## Architecture

The CLI uses the `@dyad-sh/core` package which provides a unified HTTP client for interacting with the Dyad backend. This ensures consistency across all Dyad interfaces (Desktop, Web, CLI).

## License

MIT
