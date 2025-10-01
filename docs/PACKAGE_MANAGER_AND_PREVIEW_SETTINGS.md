# Package Manager and Preview URL Settings

This document describes the package manager selection and preview URL override features in Dyad, both at the global and app-specific levels.

## Package Manager Selection

### Overview

Dyad allows you to select your preferred package manager (npm, yarn, pnpm, or bun) from the settings page (global) or per-app in the Configure panel. This gives you control over which package manager Dyad uses for installing dependencies and running scripts in your projects.

### How It Works

The package manager selection follows this priority order:

1. **App-Level Preference (Highest Priority)**: If you've set a preferred package manager for a specific app in the Configure panel, Dyad will use that package manager for that app.

2. **User-Preferred (Global)**: If no app-level preference is set, and you've set a preferred package manager in Settings > Workflow Settings, Dyad will use that package manager for all projects (as long as it's installed on your system).

3. **Project-Detected**: If no global or app-level preference is set, Dyad will detect which package manager your project uses by checking for lock files:
   - `pnpm-lock.yaml` → pnpm
   - `yarn.lock` → yarn
   - `bun.lockb` → bun
   - `package-lock.json` → npm

4. **System Default (Fallback)**: If none of the above applies, Dyad falls back to the system's preferred package manager based on availability (priority: pnpm > yarn > bun > npm).

### How to Set Your Preferred Package Manager

#### Global Setting (All Apps)

1. Open **Settings** from the sidebar
2. Navigate to **Workflow Settings**
3. Find the **Package Manager** dropdown
4. Select your preferred package manager (npm, yarn, pnpm, or bun)
5. The setting is saved automatically

#### App-Level Setting (Specific App)

1. Select an app in the sidebar
2. Open the **Configure** tab in the preview panel
3. Scroll to the **App Settings** section
4. Find the **Package Manager** dropdown
5. Select your preferred package manager or choose "Auto-detect" to use global/project detection
6. The setting is saved automatically

### Notes

- The selected package manager must be installed on your system
- If the selected package manager is not available, Dyad will fall back to the next priority level
- App-level settings override global settings
- Setting to "Auto-detect" at the app level will use global or project detection

## Preview URL Override

### Overview

The preview URL feature allows you to set a custom URL that Dyad should display in the preview panel, overriding the automatically detected development server URL. This can be set globally or per-app.

### Use Cases

- **Custom Port**: Your dev server runs on a different port than the auto-detected one
- **Custom Domain**: You're using a custom local domain (e.g., `http://myapp.local`)
- **Remote Development**: You want to preview a remote development server
- **Proxy Setup**: You have a custom proxy or reverse proxy configuration
- **Different Apps, Different URLs**: Set different preview URLs for different apps in your workspace

### How It Works

When you set a custom preview URL:

1. Dyad will still start your app's development server normally
2. Instead of using the auto-detected URL, the preview panel will display the URL you specified
3. The custom URL is used consistently across all app restarts
4. App-level URLs override global URLs

The priority order is:

1. **App-Level Preview URL (Highest Priority)**: Set in Configure panel for specific app
2. **Global Preview URL**: Set in Settings > Workflow Settings
3. **Auto-detected URL (Fallback)**: Detected from server output

### How to Set a Custom Preview URL

#### Global Setting (All Apps)

1. Open **Settings** from the sidebar
2. Navigate to **Workflow Settings**
3. Find the **Preview URL** input field
4. Enter your custom URL (e.g., `http://localhost:3000`)
5. Click **Save**

#### App-Level Setting (Specific App)

1. Select an app in the sidebar
2. Open the **Configure** tab in the preview panel
3. Scroll to the **App Settings** section
4. Find the **Preview URL** input field
5. Enter your custom URL (e.g., `http://localhost:3000`)
6. Click **Save**

### URL Format

- Must be a valid URL with `http://` or `https://` protocol
- Examples:
  - `http://localhost:3000`
  - `http://127.0.0.1:8080`
  - `http://myapp.local:3000`
  - `https://dev.myapp.com`

### Resetting

To go back to auto-detection:

#### Global Setting

1. Clear the preview URL field in Settings
2. Click **Save**

#### App-Level Setting

1. Clear the preview URL field in Configure panel
2. Click **Save**
3. Or click the **X** button to immediately clear

## CLI Popout

### Overview

Dyad now includes a CLI popout feature that allows you to interact with your running applications through a floating terminal window.

### How to Use

1. Start an app in the preview panel
2. Click the **External Link** icon (↗) in the System Messages header
3. A floating CLI terminal will appear in the bottom-right corner
4. Type commands and press Enter to send them to your running app
5. Minimize the popout by clicking the minimize icon
6. Close the popout by clicking the X icon

### Features

- **Real-time Terminal Output**: See all stdout, stderr, and system messages
- **Command History**: Navigate previous commands with ↑/↓ arrow keys
- **Built-in Commands**:
  - `help` - Show CLI help
  - `clear` - Clear terminal output
- **Minimize/Maximize**: Keep the CLI accessible but out of the way
- **Keyboard Shortcuts**: Same as the inline CLI (Enter to execute, Esc to clear)

### Use Cases

- Send input to interactive CLI tools in your app
- Respond to prompts from package managers or build tools
- Test CLI features of your application
- Monitor app output in a separate window while working on code

## Settings Storage

- **Global settings** are stored in your Dyad user settings file and persist across sessions
- **App-level settings** are stored in the database per app and persist across sessions
- All settings are synced immediately when changed

## Technical Details

### Package Manager Integration

The package manager preference is integrated into the `getBestPackageManagerForProject` function in `src/ipc/utils/package_manager_utils.ts`. This function now accepts an optional app-level preference parameter and is used throughout Dyad when:

- Installing dependencies
- Running development servers
- Adding new packages
- Running build scripts

### Preview URL Integration

The preview URL override is integrated into the `useRunApp` hook in `src/hooks/useRunApp.ts`. When the app's development server starts and Dyad detects the proxy URL, it checks for app-level preview URL first, then global preview URL, then uses the auto-detected one.

### Database Schema

App-level settings are stored in the `apps` table with these new columns:

- `preferred_package_manager`: text (nullable)
- `preview_url`: text (nullable)

## Troubleshooting

### Package Manager Not Working

- **Check Installation**: Ensure your preferred package manager is installed and available in your system PATH
- **Check Version**: Run `npm -v`, `yarn -v`, `pnpm -v`, or `bun -v` in your terminal to verify
- **Reset Preference**: Try clearing your package manager preference to use auto-detection
- **Check Priority**: Remember app-level settings override global settings

### Preview URL Not Working

- **Check URL Format**: Ensure your URL starts with `http://` or `https://`
- **Check Server Running**: Verify that your development server is actually running on the specified URL
- **Check Network Access**: If using a custom domain or remote URL, ensure it's accessible from your machine
- **Try Reset**: Clear the custom URL to go back to auto-detection
- **Check Priority**: App-level URLs override global URLs

### CLI Popout Not Responding

- **Check App Running**: Ensure an app is currently running
- **Check Input Support**: Not all apps accept stdin input
- **Try Inline CLI**: Use the inline CLI in the console panel if the popout has issues

## Related Files

- Settings Schema: `src/lib/schemas.ts`
- Database Schema: `src/db/schema.ts`
- Global Package Manager Selector UI: `src/components/settings/PackageManagerSelector.tsx`
- Global Preview URL Input UI: `src/components/settings/PreviewUrlInput.tsx`
- App Package Manager Selector UI: `src/components/settings/AppPackageManagerSelector.tsx`
- App Preview URL Input UI: `src/components/settings/AppPreviewUrlInput.tsx`
- Configure Panel: `src/components/preview_panel/ConfigurePanel.tsx`
- Settings Page: `src/pages/settings.tsx`
- Package Manager Utils: `src/ipc/utils/package_manager_utils.ts`
- App Runner Hook: `src/hooks/useRunApp.ts`
- CLI Popout Component: `src/components/preview_panel/CliPopout.tsx`
- App Settings Handlers: `src/ipc/handlers/app_settings_handlers.ts`
