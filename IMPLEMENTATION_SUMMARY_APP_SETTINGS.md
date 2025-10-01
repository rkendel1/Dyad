# Implementation Summary: App-Level Settings and CLI Popout

## Overview

This implementation adds app-level package manager and preview URL settings, plus a new CLI popout component as requested in the issue. These features provide more granular control over project settings and a less intrusive CLI interface.

## Changes Made

### 1. Database Schema Updates

**File: `src/db/schema.ts`**

- Added `preferredPackageManager` field to `apps` table (nullable text)
- Added `previewUrl` field to `apps` table (nullable text)

**Migration: `drizzle/0013_add_app_settings.sql`**

- SQL migration to add the new columns to the apps table

### 2. IPC Layer

**File: `src/ipc/ipc_types.ts`**

- Added `UpdateAppSettingsParams` interface for updating app settings
- Added `GetAppSettingsParams` interface for retrieving app settings
- Added `AppSettings` interface for app settings response
- Updated `App` interface to include `preferredPackageManager` and `previewUrl`

**File: `src/ipc/handlers/app_settings_handlers.ts` (NEW)**

- Created `registerAppSettingsHandlers` function
- Implemented `get-app-settings` handler
- Implemented `update-app-settings` handler

**File: `src/ipc/ipc_host.ts`**

- Registered the new app settings handlers

**File: `src/ipc/ipc_client.ts`**

- Added `getAppSettings` method
- Added `updateAppSettings` method

### 3. Package Manager Utils

**File: `src/ipc/utils/package_manager_utils.ts`**

- Updated `getBestPackageManagerForProject` to accept optional app-level package manager preference
- Modified priority order: App-level > User-level > Project-detected > System default
- Updated `generateCommandWithFallbacks` to support app-level preference

### 4. App Runner Hook

**File: `src/hooks/useRunApp.ts`**

- Updated `processProxyServerOutput` to check app-level preview URL first
- Priority order: App-level preview URL > Global preview URL > Auto-detected URL

### 5. UI Components

**File: `src/components/settings/AppPackageManagerSelector.tsx` (NEW)**

- Created component for app-level package manager selection
- Includes "Auto-detect" option to fall back to global/project detection
- Loads and saves settings via IPC

**File: `src/components/settings/AppPreviewUrlInput.tsx` (NEW)**

- Created component for app-level preview URL configuration
- Includes validation and clear functionality
- Loads and saves settings via IPC

**File: `src/components/preview_panel/CliPopout.tsx` (NEW)**

- Created floating CLI terminal component
- Features:
  - Real-time terminal output display
  - Command history (last 50 commands)
  - Built-in commands (help, clear)
  - Minimize/maximize functionality
  - Keyboard shortcuts support
  - Same IPC integration as inline CLI

**File: `src/components/preview_panel/PreviewPanel.tsx`**

- Added CLI popout state management
- Added external link button to System Messages header to open CLI popout
- Integrated CliPopout component with minimize/maximize functionality

**File: `src/components/preview_panel/ConfigurePanel.tsx`**

- Added imports for app settings components
- Added "App Settings" card with package manager and preview URL settings
- Positioned between environment variables and Neon configuration

### 6. Documentation

**File: `docs/PACKAGE_MANAGER_AND_PREVIEW_SETTINGS.md`**

- Completely updated to document app-level settings
- Added sections for both global and app-level configuration
- Added CLI Popout documentation
- Updated priority orders and troubleshooting guides
- Added technical details about new features

**File: `CLI_INPUT.md`**

- Updated to document CLI popout feature
- Added usage instructions for popout window
- Added benefits and use cases for popout vs inline CLI

## Feature Details

### App-Level Package Manager Settings

**Priority Order:**

1. App-level setting (Configure panel)
2. Global user setting (Settings page)
3. Project-detected (lock files)
4. System default

**UI Locations:**

- Global: Settings > Workflow Settings > Package Manager
- Per-App: Configure tab > App Settings > Package Manager

### App-Level Preview URL Settings

**Priority Order:**

1. App-level preview URL (Configure panel)
2. Global preview URL (Settings page)
3. Auto-detected URL

**UI Locations:**

- Global: Settings > Workflow Settings > Preview URL
- Per-App: Configure tab > App Settings > Preview URL

### CLI Popout Component

**Features:**

- Floating window in bottom-right corner
- Real-time terminal output
- Command history with arrow key navigation
- Minimize/maximize functionality
- Same commands and shortcuts as inline CLI
- Syncs with global app output

**Access:**

- Click External Link icon (↗) in System Messages header
- Available when inline console is open or closed

## Testing Recommendations

1. **Database Migration:**
   - Run the app and verify migration applies successfully
   - Check that existing apps work without the new fields

2. **App-Level Package Manager:**
   - Set app-level package manager and verify it's used for that app
   - Set to "Auto-detect" and verify fallback to global/project detection
   - Test with unavailable package manager and verify fallback works

3. **App-Level Preview URL:**
   - Set app-level preview URL and verify it's used
   - Clear app-level URL and verify fallback to global/auto-detect
   - Test URL validation

4. **CLI Popout:**
   - Open popout and verify terminal output appears
   - Test command execution in popout
   - Test minimize/maximize functionality
   - Test command history
   - Verify it works with different apps

5. **Integration:**
   - Test that app-level settings override global settings
   - Test that multiple apps can have different settings
   - Verify settings persist across app restarts

## Files Changed

### New Files (6):

- `drizzle/0013_add_app_settings.sql`
- `src/ipc/handlers/app_settings_handlers.ts`
- `src/components/settings/AppPackageManagerSelector.tsx`
- `src/components/settings/AppPreviewUrlInput.tsx`
- `src/components/preview_panel/CliPopout.tsx`

### Modified Files (10):

- `src/db/schema.ts`
- `src/ipc/ipc_types.ts`
- `src/ipc/ipc_host.ts`
- `src/ipc/ipc_client.ts`
- `src/ipc/utils/package_manager_utils.ts`
- `src/hooks/useRunApp.ts`
- `src/components/preview_panel/PreviewPanel.tsx`
- `src/components/preview_panel/ConfigurePanel.tsx`
- `docs/PACKAGE_MANAGER_AND_PREVIEW_SETTINGS.md`
- `CLI_INPUT.md`

## Backwards Compatibility

- All new database fields are nullable, so existing apps work without changes
- Existing global settings continue to work as before
- App-level settings only override when explicitly set
- Auto-detect option ensures existing behavior is preserved

## Future Enhancements

Potential improvements for future iterations:

1. Add app-level script selection (choose between npm run dev, npm start, etc.)
2. Add CLI popout position/size persistence
3. Add multiple CLI popout windows for different apps
4. Add CLI command templates/snippets
5. Add CLI output filtering in popout
