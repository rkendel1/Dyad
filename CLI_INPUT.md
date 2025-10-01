# CLI Input Feature

The Dyad console includes a built-in CLI (Command Line Interface) input feature that allows you to interact directly with your running applications through the console panel or a floating popout window.

## Overview

The CLI input component is integrated into the Console component and can also be opened as a floating popout. It provides an interactive terminal-like experience for sending commands and input to your running applications.

## Features

### 🎯 Core Functionality

- **Direct App Input**: Send commands directly to your running app's stdin
- **Command History**: Navigate through previously executed commands using arrow keys
- **Keyboard Shortcuts**: Fast command execution with keyboard shortcuts
- **Built-in Commands**: Helpful utility commands built into the CLI
- **Help System**: Contextual help available at any time
- **Popout Window**: Open CLI in a floating window for flexible workspace layout
- **Real-time Output**: See all terminal output (stdout, stderr, errors) in real-time
- **Minimize/Maximize**: Keep the CLI popout accessible but out of the way

### ⌨️ Keyboard Shortcuts

| Shortcut         | Action                                  |
| ---------------- | --------------------------------------- |
| `Enter`          | Execute the current command             |
| `↑` (Arrow Up)   | Navigate to previous command in history |
| `↓` (Arrow Down) | Navigate to next command in history     |
| `Esc`            | Clear input field or close help dialog  |

### 📝 Built-in Commands

#### `help`

Shows the help dialog with all available commands and keyboard shortcuts.

```bash
help
```

#### `clear`

Clears the console output (equivalent to clicking the clear button).

```bash
clear
```

## How to Use

### Using the Inline CLI (Console Panel)

1. The console is located at the bottom of the preview panel
2. Click on the "System Messages" header to expand/collapse the console
3. The CLI input field is always visible at the bottom of the console

### Using the CLI Popout

1. Start an app in the preview panel
2. Click the **External Link** icon (↗) in the System Messages header
3. A floating CLI terminal window will appear in the bottom-right corner
4. The popout shows the same terminal output as the inline console
5. Click the **minimize** icon to minimize the popout to a compact button
6. Click the **X** icon to close the popout

**Benefits of the Popout:**

- Keep the CLI accessible while working on code
- See terminal output without expanding the console panel
- Flexible positioning and minimize/maximize options
- Same functionality as the inline CLI

### Sending Commands

1. Ensure your app is running (indicated by the status in the preview panel)
2. Click on the CLI input field or press any key to focus it
3. Type your command or input
4. Press `Enter` to send the command to your running app

### Using Command History

1. Press `↑` (Arrow Up) to navigate to previous commands
2. Press `↓` (Arrow Down) to navigate to newer commands
3. The last 50 commands are stored in the history
4. Command history is shared between inline and popout CLI

### Getting Help

1. Type `help` and press `Enter`, OR
2. Click the help button (❓ icon) in the CLI input area

## Security

The CLI input feature includes several security measures:

- **App Context**: Commands are only sent to the currently selected running app
- **Input Validation**: Commands are validated before being sent to the app
- **Safe Environment**: Commands execute in the app's sandboxed environment
- **No System Access**: The CLI cannot directly execute system-level commands

## Examples

### Interactive CLI Tools

If your app includes an interactive CLI tool that prompts for input:

```bash
# Your app output:
? What is your name?

# You can respond via CLI input:
John Doe
```

### Responding to Prompts

Many build tools and package managers have interactive prompts:

```bash
# App prompts:
? Do you want to continue? (y/n)

# Respond:
y
```

### Testing App Features

Send test commands to your running application:

```bash
# If your app has a CLI interface:
status
config --show
test --verbose
```

## Limitations

- **App Must Be Running**: You can only send commands when an app is actively running
- **Stdin Only**: Commands are sent to the app's stdin - not all apps support stdin input
- **No Shell Execution**: The CLI doesn't execute shell commands directly; it sends input to your app
- **History Per Session**: Command history is stored per session and cleared when you close Dyad

## Troubleshooting

### Commands Not Working

**Problem**: Typed commands don't seem to have any effect.

**Solutions**:

- Ensure your app is running (check the preview panel status)
- Verify your app accepts stdin input
- Check the console output for any error messages

### No Response from App

**Problem**: App doesn't respond to input.

**Solutions**:

- Some apps only respond to specific commands
- Check if your app requires a specific command format
- Review your app's documentation for supported commands

### Command History Not Working

**Problem**: Arrow keys don't navigate history.

**Solutions**:

- Ensure the CLI input field is focused
- Try clicking on the input field first
- History is only available for commands you've executed in the current session

## Advanced Usage

### Command Chaining

While the CLI doesn't support shell-style command chaining directly, you can:

1. Execute commands sequentially by pressing Enter after each
2. Use your app's built-in command chaining if it supports it

### Automation

For automated testing or scripting:

1. The CLI input works with the existing IPC mechanism
2. You can programmatically send commands via the `respondToAppInput` IPC handler
3. See the source code in `src/ipc/handlers/app_handlers.ts` for details

## API Reference

For developers looking to extend or integrate with the CLI input:

### Component Props

```typescript
interface CliInputProps {
  onCommandExecute?: (command: string) => void;
}
```

### IPC Interface

```typescript
interface RespondToAppInputParams {
  appId: number;
  response: string;
}
```

## Contributing

Found a bug or have a feature request? Please contribute!

1. Check existing issues at [GitHub Issues](https://github.com/rkendel1/Dyad/issues)
2. Submit a pull request with your improvements
3. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines

## Related Features

- **Console Output**: View real-time output from your running applications
- **Error Filtering**: Filter console output to show only errors or warnings
- **Log Export**: Export console logs to a file for debugging

## Future Enhancements

Planned improvements for the CLI feature:

- [ ] Tab completion for commands
- [ ] Multi-line command support
- [ ] Command aliases
- [ ] Scripting support
- [ ] Command templates
- [ ] Persistent history across sessions
- [ ] Custom command plugins
