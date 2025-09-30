# VS Code Extension Development Guide

## Overview

This is the Dyad VS Code extension that allows users to interact with Dyad Desktop directly from VS Code, with a sidebar for quick actions.

**Important Architecture Notes:**
- Dyad is an **Electron desktop application**, not a CLI tool
- The extension connects to Dyad Desktop via HTTP API (default: `http://localhost:3000`)
- CLI commands are available only if Dyad provides them; otherwise, the extension gracefully handles their absence
- Most functionality requires Dyad Desktop to be running

## File Structure

```
vscode-extension/
├── package.json          # Extension manifest and configuration
├── tsconfig.json         # TypeScript compiler configuration
├── .gitignore           # Git ignore patterns for build artifacts
├── .vscodeignore        # Files to exclude from the extension package
├── README.md            # User-facing documentation
├── DEVELOPMENT.md       # This file - developer documentation
├── media/
│   └── icon.svg         # Extension icon
└── src/
    ├── extension.ts     # Main extension entry point with error handling
    ├── dyadCli.ts       # CLI command wrapper with availability checks
    ├── dyadApi.ts       # API interaction with health checks
    └── views/
        └── sidebar.ts   # Sidebar view provider with error handling
```

## Components

### 1. extension.ts
The main entry point for the VS Code extension. It:
- Activates the extension on startup
- Registers all commands (create app, run app, stop app, etc.)
- Initializes the sidebar view
- Handles command execution and user interactions
- Provides comprehensive error handling and logging
- Includes health checks for Dyad Desktop connection
- Creates an output channel for debugging

**Key Features:**
- Input validation for all user inputs
- Detailed error messages with actionable guidance
- Automatic health check on activation
- Helper dialogs for connection issues

### 2. dyadCli.ts
Provides wrapper functions for Dyad CLI commands:
- `checkCliAvailability()` - Check if CLI is available
- `createApp()` - Create a new Dyad app
- `runApp()` - Run a Dyad app
- `stopApp()` - Stop a running app
- `openConsole()` - Open the Dyad console
- `sendCommand()` - Send arbitrary CLI commands
- `listApps()` - List all apps
- `getHelp()` - Get CLI help
- `clearConsole()` - Clear console output

**Error Handling:**
- Each method checks CLI availability before execution
- Provides clear error messages when CLI is not available
- Includes timeout protection (30 seconds for most operations)
- Distinguishes between warnings and errors in stderr

**Important Note:** Dyad is primarily a desktop application. CLI commands may not be available, and the extension is designed to gracefully handle this scenario.

### 3. dyadApi.ts
Handles API interactions with the Dyad Desktop backend:
- `checkHealth()` - Verify API connectivity
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

**Error Handling:**
- Response interceptor for connection errors (ECONNREFUSED, ETIMEDOUT)
- Health check caching (30-second TTL) to reduce unnecessary requests
- Detailed error logging with context
- Graceful fallbacks for all operations

**API Endpoints:** The extension expects Dyad Desktop to provide REST endpoints like:
- `GET /api/apps` - List apps
- `GET /api/apps/:id` - Get app details
- `POST /api/apps` - Create app
- `POST /api/apps/:id/run` - Run app
- `POST /api/apps/:id/stop` - Stop app
- etc.

### 4. sidebar.ts
Implements the sidebar tree view provider:
- Displays apps in a hierarchical view with status indicators
- Shows quick action buttons
- Updates dynamically when apps change
- Provides visual indicators for running apps (green) and stopped apps (white)
- Displays helpful messages for connection errors
- Includes tooltips with app details

**Error Handling:**
- Gracefully handles API connection failures
- Shows actionable error messages in the tree view
- Provides "Check Connection" and "Retry" options
- Displays helpful guidance when no apps are found

## Commands

The extension contributes the following commands:

1. **dyad.createApp** - Create a new Dyad app
2. **dyad.runApp** - Run a Dyad app
3. **dyad.stopApp** - Stop a running app
4. **dyad.openConsole** - Open the Dyad console
5. **dyad.sendCliCommand** - Send a CLI command
6. **dyad.refreshSidebar** - Refresh the sidebar view
7. **dyad.checkHealth** - Check connection to Dyad Desktop

## Views

The extension adds a new activity bar item "Dyad" with two tree views:

1. **Apps** - Shows all Dyad apps with their status
   - Green icon (🟢) = Running
   - White icon (⚪) = Stopped
   - Includes tooltips with path and creation date
   
2. **Quick Actions** - Provides shortcuts to common actions
   - Create New App
   - Run App
   - Stop App
   - Open Console
   - Send CLI Command
   - Refresh

## Development

### Prerequisites

- Node.js 20 or higher
- VS Code 1.80.0 or higher
- Dyad Desktop (for testing)

### Building the Extension

```bash
cd vscode-extension
npm install
npm run compile
```

### Testing the Extension

1. Open the `vscode-extension` folder in VS Code
2. Press F5 to launch the Extension Development Host
3. Make sure Dyad Desktop is running
4. Test the commands and sidebar functionality

### Debugging

1. **Output Channel**: View → Output → Select "Dyad"
   - All operations are logged here
   - Connection errors are displayed
   - Command results are shown

2. **Developer Tools**: Help → Toggle Developer Tools
   - View console logs
   - Inspect errors
   - Debug extension code

3. **Health Check**: Run `Dyad: Check Connection to Dyad Desktop`
   - Verifies API connectivity
   - Shows connection status
   - Useful for diagnosing issues

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

## Architecture Notes

### Dyad Desktop Communication

The extension communicates with Dyad Desktop through:
1. **HTTP API** (primary method)
   - RESTful endpoints on `http://localhost:3000`
   - JSON request/response format
   - Requires Dyad Desktop to be running

2. **CLI** (optional, may not be available)
   - Executed via child_process
   - Used for certain operations if available
   - Extension works without it by using the API

### Error Handling Strategy

1. **Connection Errors**: 
   - Detect ECONNREFUSED and ETIMEDOUT
   - Show user-friendly messages
   - Provide "Check Connection" action

2. **CLI Unavailable**:
   - Check availability before use
   - Fall back to API when possible
   - Guide users to use Dyad Desktop

3. **User Input**:
   - Validate all inputs
   - Provide clear validation messages
   - Prevent invalid operations

### State Management

- Health check results are cached for 30 seconds
- CLI availability is checked once and cached
- Sidebar refreshes on command execution
- No persistent state between VS Code sessions

## Dependencies

- **vscode**: VS Code extension API
- **axios**: HTTP client for API calls
- **TypeScript**: Language and compiler

## Future Enhancements

Potential improvements:
- Configuration settings for Dyad path and API URL
- Real-time status updates via WebSocket
- Integrated terminal for CLI output
- Chat interface within VS Code
- Code snippets for Dyad development
- Debugging integration
- Auto-refresh sidebar on app changes
- Support for multiple Dyad instances

## Troubleshooting

### Extension Not Working

1. Check Dyad Desktop is running
2. Run `Dyad: Check Connection to Dyad Desktop`
3. View the Output panel (Dyad channel)
4. Check for port conflicts on 3000
5. Restart VS Code and Dyad Desktop

### Commands Failing

1. Verify Dyad Desktop is accessible
2. Check the Output panel for errors
3. Try manual refresh of sidebar
4. Ensure valid app IDs are being used

### Build Errors

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Ensure TypeScript version compatibility
4. Check for syntax errors in code

## Contributing

When contributing to the extension:

1. **Error Handling**: Always add proper error handling
2. **Logging**: Use the output channel for debugging info
3. **User Messages**: Provide clear, actionable error messages
4. **Testing**: Test with and without Dyad Desktop running
5. **Documentation**: Update README.md and DEVELOPMENT.md

## Testing Checklist

Before releasing:

- [ ] Extension activates without errors
- [ ] Health check detects Dyad Desktop correctly
- [ ] All commands work with Dyad Desktop running
- [ ] All commands show appropriate errors when Dyad Desktop is not running
- [ ] Sidebar displays apps correctly
- [ ] Status indicators work properly
- [ ] Error messages are helpful and actionable
- [ ] Output channel provides useful debugging info
- [ ] Extension can be packaged successfully
- [ ] Documentation is up to date
