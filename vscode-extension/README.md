# Dyad VS Code Extension

VS Code extension for running Dyad CLI commands and API calls with a sidebar for quick actions.

## Features

- **CLI Commands**: Run Dyad CLI commands directly from VS Code (requires Dyad Desktop)
- **App Management**: Create, run, and stop Dyad apps
- **AI-Powered Template Selection**: Describe your app in natural language and get intelligent template suggestions
- **One-Click Supabase Setup**: Quickly set up local Supabase integration for your apps
- **Production Promotion**: Seamlessly promote your app from local to production Supabase
- **Real-Time Collaboration**: Work with multiple developers on the same app simultaneously
  - Live cursor tracking and selection highlights
  - Integrated chat and inline comments
  - Role-based access control (Editor, Reviewer, Viewer)
  - Version history and change tracking
- **Quick Actions Sidebar**: Access common Dyad actions from a dedicated sidebar
- **Console Integration**: Open and interact with the Dyad console
- **API Integration**: Make API calls to Dyad Desktop services
- **Real-time Status**: View running apps with status indicators
- **Health Checks**: Verify connection to Dyad Desktop

## Requirements

- VS Code 1.80.0 or higher
- **Dyad Desktop installed and running on your system**
  - Download from: [https://dyad.sh](https://dyad.sh)
  - The extension connects to Dyad Desktop on `http://localhost:3000` by default

## Extension Commands

This extension contributes the following commands:

### App Creation

- `Dyad: Create New App` - Create a new Dyad app (basic)
- `Dyad: Create App with AI Template Selection` - Describe your app and get intelligent template suggestions

### App Management

- `Dyad: Run App` - Run a Dyad app
- `Dyad: Stop App` - Stop a running Dyad app

### Supabase Integration

- `Dyad: Setup Local Supabase` - One-click setup for local Supabase integration
- `Dyad: Promote to Production Supabase` - Promote your app to production Supabase environment

### Collaboration

- `Dyad: Start Collaboration Session` - Create a new collaboration session
- `Dyad: Join Collaboration Session` - Join an existing collaboration session
- `Dyad: Leave Collaboration Session` - Leave the current session
- `Dyad: Show Collaboration Panel` - Display the collaboration chat and user panel
- `Dyad: Add Inline Comment` - Add a comment to the current line

### Utilities

- `Dyad: Open Console` - Open the Dyad console
- `Dyad: Send CLI Command` - Send a command to the Dyad CLI
- `Dyad: Refresh Sidebar` - Refresh the sidebar view
- `Dyad: Check Connection to Dyad Desktop` - Verify connection to Dyad Desktop

## Usage

### Using the Sidebar

1. Click on the Dyad icon in the Activity Bar to open the sidebar
2. View your apps in the "Apps" section with status indicators:
   - 🟢 Green icon = App is running
   - ⚪ White icon = App is stopped
3. Use the "Quick Actions" section for common tasks

### Running Commands

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Dyad" to see all available commands
3. Select the command you want to run

### Creating Apps with AI Template Selection

1. Run `Dyad: Create App with AI Template Selection`
2. Describe your app in natural language (e.g., "an e-commerce store with Stripe payments")
3. The extension will analyze your description and suggest matching templates
4. Select from the suggested templates or choose a different one
5. Enter a name for your app
6. Your app will be created with the selected template

### Setting Up Local Supabase

1. Run `Dyad: Setup Local Supabase`
2. Select the app you want to configure
3. The extension will automatically:
   - Start local Supabase containers (if not running)
   - Configure environment variables
   - Set up database connection

### Promoting to Production Supabase

1. Run `Dyad: Promote to Production Supabase`
2. Select the app to promote
3. Provide your production Supabase credentials:
   - Project reference
   - Supabase URL
   - Anon key
   - Service role key
   - Database password
4. The extension will:
   - Export local database schema
   - Update environment variables
   - Configure production settings

### Sending CLI Commands

1. Use the `Dyad: Send CLI Command` command
2. Enter your command in the input box
3. The command will be sent to the Dyad CLI and results will appear in the Output panel

### Using Real-Time Collaboration

1. **Starting a Collaboration Session**:
   - Run `Dyad: Start Collaboration Session`
   - Select the app to collaborate on
   - Enter your name
   - Copy the Session ID or collaboration link to share with team members

2. **Joining a Collaboration Session**:
   - Get the Session ID from the session owner
   - Run `Dyad: Join Collaboration Session`
   - Enter the Session ID and your name
   - Start collaborating!

3. **Collaboration Features**:
   - See live cursors and selections from all collaborators
   - Chat in real-time using the Collaboration Panel
   - Add inline comments to discuss code changes
   - Track changes with automatic version history

For detailed collaboration documentation, see [COLLABORATION.md](COLLABORATION.md)

## Troubleshooting

### "Cannot connect to Dyad Desktop" Error

**Problem**: The extension cannot connect to Dyad Desktop.

**Solutions**:

1. **Make sure Dyad Desktop is running**
   - Launch the Dyad Desktop application
   - Wait for it to fully start up
2. **Check the connection**
   - Run the `Dyad: Check Connection to Dyad Desktop` command
   - This will verify if the extension can communicate with Dyad Desktop
3. **Verify the port**
   - Dyad Desktop should be running on `http://localhost:3000`
   - Check if another application is using port 3000
4. **Restart both applications**
   - Close VS Code and Dyad Desktop
   - Start Dyad Desktop first, then VS Code

### "Dyad CLI is not available" Error

**Problem**: The extension cannot find the Dyad CLI.

**Context**: Dyad is primarily a desktop application, not a CLI tool. The VS Code extension is designed to work with Dyad Desktop through its API.

**Solutions**:

1. **Use Dyad Desktop instead**
   - Most operations should be performed through Dyad Desktop
   - The extension provides a convenient interface but requires Dyad Desktop to be running
2. **For app management**
   - Create, run, and stop apps using the Dyad Desktop application
   - The extension will display these apps in the sidebar

### Apps Not Showing in Sidebar

**Problem**: The sidebar shows "No apps found" or "Error loading apps"

**Solutions**:

1. **Ensure Dyad Desktop is running**
   - The sidebar requires an active connection to Dyad Desktop
2. **Create an app**
   - Use Dyad Desktop to create your first app
   - Or use the `Dyad: Create New App` command (requires CLI)
3. **Refresh the sidebar**
   - Click the refresh icon or use `Dyad: Refresh Sidebar` command
   - The sidebar will automatically refresh when you perform actions

### Extension Not Activating

**Problem**: The Dyad extension doesn't appear to be working.

**Solutions**:

1. **Check the extension is enabled**
   - Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
   - Search for "Dyad"
   - Make sure it's enabled
2. **Check the Output panel**
   - View → Output
   - Select "Dyad" from the dropdown
   - Look for error messages or warnings
3. **Reload VS Code**
   - Run the `Developer: Reload Window` command

### Getting More Help

- **View Logs**: Check the "Dyad" output channel for detailed logs
- **Collaboration Guide**: See [COLLABORATION.md](COLLABORATION.md) for detailed collaboration documentation
- **Report Issues**: [https://github.com/rkendel1/Dyad/issues](https://github.com/rkendel1/Dyad/issues)
- **Community**: Join the discussion at [r/dyadbuilders](https://www.reddit.com/r/dyadbuilders/)

## Configuration

The extension currently uses default values:

- Dyad CLI path: `dyad` (assumed to be in PATH)
- API base URL: `http://localhost:3000`
- WebSocket server: `ws://localhost:3000` (for collaboration)

These can be made configurable in future versions through VS Code settings.

## Known Issues

- The extension requires Dyad Desktop to be running for most features to work
- Some CLI commands may not be available as Dyad is primarily a desktop application
- Real-time status updates require manual refresh (automatic updates coming in future versions)
- **Collaboration features require WebSocket server support in Dyad Desktop** (backend implementation needed)

Please report issues at: [https://github.com/rkendel1/Dyad/issues](https://github.com/rkendel1/Dyad/issues)

## Release Notes

### 0.2.0 (In Development)

Added real-time collaboration features:

- **Multi-user collaboration**: Work with team members on the same app simultaneously
- **Live cursors and selections**: See where collaborators are editing in real-time
- **Integrated chat**: Communicate with team members without leaving VS Code
- **Inline comments**: Add and discuss comments directly on code
- **Role-based access control**: Manage permissions with Editor, Reviewer, and Viewer roles
- **Version history**: Track changes and revert to previous states
- **Collaboration panel**: Dedicated UI for managing collaboration sessions
- **Session management**: Start, join, and leave collaboration sessions easily

### 0.1.0

Initial release of the Dyad VS Code extension:

- CLI command integration with error handling
- API integration with health checks
- Sidebar with app management and status indicators
- Quick actions panel
- **AI-powered template selection based on natural language descriptions**
- **One-click local Supabase integration setup**
- **Seamless promotion to production Supabase**
- Comprehensive error messages and user guidance
- Troubleshooting documentation

## Contributing

See the [CONTRIBUTING.md](../CONTRIBUTING.md) for details on how to contribute to this extension.

## License

This extension is licensed under the same license as Dyad. See [LICENSE](../LICENSE) for details.
