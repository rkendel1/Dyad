# Interactive Launcher

The Dyad Interactive Launcher provides a user-friendly way to start different components of the Dyad system.

## Usage

```bash
npm run start:interactive
```

This command will present you with an interactive menu to choose which components to start.

## Options

### 1. Desktop App (Electron)

- Starts the full-featured Electron desktop application
- Includes the built-in HTTP API server (port 3000)
- Provides the complete Dyad experience with visual interface

### 2. Web App (Next.js)

- Starts the Next.js web application on port 5175
- Provides a browser-based interface to Dyad
- **Note:** Requires the Desktop App to be running for the API backend
- Access at: http://localhost:5175

### 3. Both Desktop and Web App

- Starts both the Desktop App and Web App simultaneously
- Useful for development and testing
- Desktop App starts first, followed by the Web App

## How It Works

The launcher script:

1. Displays a colorful menu with available options
2. Prompts for user input (1, 2, or 3)
3. Starts the selected component(s)
4. Handles graceful shutdown with Ctrl+C

## Example Session

```
═══════════════════════════════════════════════════════
                    🚀 Dyad Launcher
═══════════════════════════════════════════════════════

Please select what you would like to start:

  1. Desktop App (Electron)
     → Full-featured desktop application

  2. Web App (Next.js)
     → Browser-based interface on port 5175

  3. Both Desktop and Web App
     → Run both interfaces simultaneously

Enter your choice (1, 2, or 3):
```

## Error Handling

- Invalid input (not 1, 2, or 3) will display an error message and exit
- Processes are properly cleaned up on Ctrl+C (SIGINT) or termination (SIGTERM)
- If a component fails to start, an error message will be displayed

## Development

The script is located at `scripts/start-dyad.js` and uses:

- Node.js `readline` module for interactive prompts
- Node.js `child_process` module to spawn processes
- ANSI color codes for better user experience

## Testing

A test script is available to verify the launcher functionality:

```bash
node scripts/test-start-dyad.js
```

This will test all menu options and validate the script behavior.
