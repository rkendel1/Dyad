# Package Manager and Preview URL Settings

This document describes the package manager selection and preview URL override features in Dyad.

## Package Manager Selection

### Overview

Dyad now allows you to select your preferred package manager (npm, yarn, pnpm, or bun) from the settings page. This gives you control over which package manager Dyad uses for installing dependencies and running scripts in your projects.

### How It Works

The package manager selection follows this priority order:

1. **User-Preferred (Highest Priority)**: If you've set a preferred package manager in Settings > Workflow Settings, Dyad will use that package manager for all projects (as long as it's installed on your system).

2. **Project-Detected**: If no preference is set, Dyad will detect which package manager your project uses by checking for lock files:
   - `pnpm-lock.yaml` → pnpm
   - `yarn.lock` → yarn
   - `bun.lockb` → bun
   - `package-lock.json` → npm

3. **System Default (Fallback)**: If neither of the above applies, Dyad falls back to the system's preferred package manager based on availability (priority: pnpm > yarn > bun > npm).

### How to Set Your Preferred Package Manager

1. Open **Settings** from the sidebar
2. Navigate to **Workflow Settings**
3. Find the **Package Manager** dropdown
4. Select your preferred package manager (npm, yarn, pnpm, or bun)
5. The setting is saved automatically

### Notes

- The selected package manager must be installed on your system
- If the selected package manager is not available, Dyad will fall back to project detection or system defaults
- This setting applies to all projects unless overridden by project-specific detection

## Preview URL Override

### Overview

The preview URL feature allows you to set a custom URL that Dyad should display in the preview panel, overriding the automatically detected development server URL.

### Use Cases

- **Custom Port**: Your dev server runs on a different port than the auto-detected one
- **Custom Domain**: You're using a custom local domain (e.g., `http://myapp.local`)
- **Remote Development**: You want to preview a remote development server
- **Proxy Setup**: You have a custom proxy or reverse proxy configuration

### How It Works

When you set a custom preview URL in the settings:

1. Dyad will still start your app's development server normally
2. Instead of using the auto-detected URL, the preview panel will display the URL you specified
3. The custom URL is used consistently across all app restarts

If you don't set a custom URL, Dyad will continue to auto-detect the development server URL from your app's output.

### How to Set a Custom Preview URL

1. Open **Settings** from the sidebar
2. Navigate to **Workflow Settings**
3. Find the **Preview URL** input field
4. Enter your custom URL (e.g., `http://localhost:3000`)
5. Click **Save**

### URL Format

- Must be a valid URL with `http://` or `https://` protocol
- Examples:
  - `http://localhost:3000`
  - `http://127.0.0.1:8080`
  - `http://myapp.local:3000`
  - `https://dev.myapp.com`

### Resetting

To go back to auto-detection:
1. Clear the preview URL field
2. Click **Save**

Or click the **Reset** button to immediately clear the custom URL.

## Settings Storage

Both settings are stored in your Dyad user settings file and persist across sessions. They are synced immediately when changed and apply to all future app launches until you change them again.

## Technical Details

### Package Manager Integration

The package manager preference is integrated into the `getBestPackageManagerForProject` function in `src/ipc/utils/package_manager_utils.ts`. This function is used throughout Dyad when:
- Installing dependencies
- Running development servers
- Adding new packages
- Running build scripts

### Preview URL Integration

The preview URL override is integrated into the `useRunApp` hook in `src/hooks/useRunApp.ts`. When the app's development server starts and Dyad detects the proxy URL, it checks if a custom preview URL is set and uses it instead of the auto-detected one.

## Troubleshooting

### Package Manager Not Working

- **Check Installation**: Ensure your preferred package manager is installed and available in your system PATH
- **Check Version**: Run `npm -v`, `yarn -v`, `pnpm -v`, or `bun -v` in your terminal to verify
- **Reset Preference**: Try clearing your package manager preference to use auto-detection

### Preview URL Not Working

- **Check URL Format**: Ensure your URL starts with `http://` or `https://`
- **Check Server Running**: Verify that your development server is actually running on the specified URL
- **Check Network Access**: If using a custom domain or remote URL, ensure it's accessible from your machine
- **Try Reset**: Clear the custom URL to go back to auto-detection

## Related Files

- Settings Schema: `src/lib/schemas.ts`
- Package Manager Selector UI: `src/components/settings/PackageManagerSelector.tsx`
- Preview URL Input UI: `src/components/settings/PreviewUrlInput.tsx`
- Settings Page: `src/pages/settings.tsx`
- Package Manager Utils: `src/ipc/utils/package_manager_utils.ts`
- App Runner Hook: `src/hooks/useRunApp.ts`
