# VS Code Extension Development Guide

## Overview

This is the Dyad VS Code extension that allows users to run Dyad CLI commands and API calls directly from VS Code, with a sidebar for quick actions.

## File Structure

```
vscode-extension/
├── package.json          # Extension manifest and configuration
├── tsconfig.json         # TypeScript compiler configuration
├── .gitignore           # Git ignore patterns for build artifacts
├── .vscodeignore        # Files to exclude from the extension package
├── README.md            # User-facing documentation
├── media/
│   └── icon.svg         # Extension icon
└── src/
    ├── extension.ts     # Main extension entry point
    ├── dyadCli.ts       # CLI command wrapper functions
    ├── dyadApi.ts       # API interaction functions
    └── views/
        └── sidebar.ts   # Sidebar view provider
```

## Components

### 1. extension.ts
The main entry point for the VS Code extension. It:
- Activates the extension on startup
- Registers all commands (create app, run app, stop app, etc.)
- Initializes the sidebar view
- Handles command execution and user interactions

### 2. dyadCli.ts
Provides wrapper functions for Dyad CLI commands:
- `createApp()` - Create a new Dyad app
- `runApp()` - Run a Dyad app
- `stopApp()` - Stop a running app
- `openConsole()` - Open the Dyad console
- `sendCommand()` - Send arbitrary CLI commands
- `listApps()` - List all apps
- `getHelp()` - Get CLI help
- `clearConsole()` - Clear console output

### 3. dyadApi.ts
Handles API interactions with the Dyad backend:
- `getApps()` - Fetch all apps
- `getApp()` - Get a specific app
- `createApp()` - Create a new app via API
- `deleteApp()` - Delete an app
- `getChats()` - Get chats for an app
- `sendMessage()` - Send a message to a chat
- `getMessages()` - Get messages from a chat
- `runApp()` - Run an app via API
- `stopApp()` - Stop an app via API
- `getAppStatus()` - Get app running status

### 4. sidebar.ts
Implements the sidebar tree view provider:
- Displays apps in a hierarchical view
- Shows quick action buttons
- Updates dynamically when apps change
- Provides visual indicators for running apps

## Commands

The extension contributes the following commands:

1. **dyad.createApp** - Create a new Dyad app
2. **dyad.runApp** - Run a Dyad app
3. **dyad.stopApp** - Stop a running app
4. **dyad.openConsole** - Open the Dyad console
5. **dyad.sendCliCommand** - Send a CLI command
6. **dyad.refreshSidebar** - Refresh the sidebar view

## Views

The extension adds a new activity bar item with two tree views:

1. **Apps** - Shows all Dyad apps with their status
2. **Quick Actions** - Provides shortcuts to common actions

## Development

### Building the Extension

```bash
cd vscode-extension
npm install
npm run compile
```

### Testing the Extension

1. Open the `vscode-extension` folder in VS Code
2. Press F5 to launch the Extension Development Host
3. Test the commands and sidebar functionality

### Packaging the Extension

```bash
npm run package
```

This creates a `.vsix` file that can be installed in VS Code.

## Configuration

The extension currently uses default values:
- Dyad CLI path: `dyad` (assumed to be in PATH)
- API base URL: `http://localhost:3000`

These can be made configurable in future versions through VS Code settings.

## Dependencies

- **vscode**: VS Code extension API
- **axios**: HTTP client for API calls
- **TypeScript**: Language and compiler

## Future Enhancements

Potential improvements:
- Configuration settings for Dyad path and API URL
- Real-time status updates for running apps
- Integrated terminal for CLI output
- Chat interface within VS Code
- Code snippets for Dyad development
- Debugging integration
