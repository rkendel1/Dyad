# Dyad VS Code Extension

VS Code extension for running Dyad CLI commands and API calls with a sidebar for quick actions.

## Features

- **CLI Commands**: Run Dyad CLI commands directly from VS Code
- **App Management**: Create, run, and stop Dyad apps
- **Quick Actions Sidebar**: Access common Dyad actions from a dedicated sidebar
- **Console Integration**: Open and interact with the Dyad console
- **API Integration**: Make API calls to Dyad services

## Requirements

- VS Code 1.80.0 or higher
- Dyad installed and running on your system

## Extension Commands

This extension contributes the following commands:

- `Dyad: Create New App` - Create a new Dyad app
- `Dyad: Run App` - Run the current Dyad app
- `Dyad: Stop App` - Stop the running Dyad app
- `Dyad: Open Console` - Open the Dyad console
- `Dyad: Send CLI Command` - Send a command to the Dyad CLI
- `Dyad: Refresh Sidebar` - Refresh the sidebar view

## Usage

### Using the Sidebar

1. Click on the Dyad icon in the Activity Bar to open the sidebar
2. View your apps in the "Apps" section
3. Use the "Quick Actions" section for common tasks

### Running Commands

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Dyad" to see all available commands
3. Select the command you want to run

### Sending CLI Commands

1. Use the `Dyad: Send CLI Command` command
2. Enter your command in the input box
3. The command will be sent to the Dyad CLI

## Configuration

This extension does not currently have any configurable settings.

## Known Issues

Please report issues at: https://github.com/rkendel1/Dyad/issues

## Release Notes

### 0.1.0

Initial release of the Dyad VS Code extension:
- CLI command integration
- API integration
- Sidebar with app management
- Quick actions panel

## Contributing

See the [CONTRIBUTING.md](../CONTRIBUTING.md) for details on how to contribute to this extension.

## License

This extension is licensed under the same license as Dyad. See [LICENSE](../LICENSE) for details.
