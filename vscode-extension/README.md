# Dyad VS Code Extension

VS Code extension for running Dyad CLI commands and API calls with a sidebar for quick actions.

## Features

- **CLI Commands**: Run Dyad CLI commands directly from VS Code (requires Dyad Desktop)
- **App Management**: Create, run, and stop Dyad apps
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

- `Dyad: Create New App` - Create a new Dyad app
- `Dyad: Run App` - Run a Dyad app
- `Dyad: Stop App` - Stop a running Dyad app
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

### Sending CLI Commands

1. Use the `Dyad: Send CLI Command` command
2. Enter your command in the input box
3. The command will be sent to the Dyad CLI and results will appear in the Output panel

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
- **Report Issues**: [https://github.com/rkendel1/Dyad/issues](https://github.com/rkendel1/Dyad/issues)
- **Community**: Join the discussion at [r/dyadbuilders](https://www.reddit.com/r/dyadbuilders/)

## Configuration

The extension currently uses default values:
- Dyad CLI path: `dyad` (assumed to be in PATH)
- API base URL: `http://localhost:3000`

These can be made configurable in future versions through VS Code settings.

## Known Issues

- The extension requires Dyad Desktop to be running for most features to work
- Some CLI commands may not be available as Dyad is primarily a desktop application
- Real-time status updates require manual refresh (automatic updates coming in future versions)

Please report issues at: [https://github.com/rkendel1/Dyad/issues](https://github.com/rkendel1/Dyad/issues)

## Release Notes

### 0.1.0

Initial release of the Dyad VS Code extension:
- CLI command integration with error handling
- API integration with health checks
- Sidebar with app management and status indicators
- Quick actions panel
- Comprehensive error messages and user guidance
- Troubleshooting documentation

## Contributing

See the [CONTRIBUTING.md](../CONTRIBUTING.md) for details on how to contribute to this extension.

## License

This extension is licensed under the same license as Dyad. See [LICENSE](../LICENSE) for details.
