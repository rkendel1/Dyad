# Configuration Panel Enhancement Summary

## Overview

This PR enhances the Dyad web app's Configuration Panel by adding new settings for app-level customization. The implementation builds on existing features and provides developers with advanced configuration and previewing capabilities.

## What Already Existed

The application already had a robust preview and configuration system:

### Preview Panel Features ✅
- **Preview Pane**: Iframe-based preview of the running app
- **CSS Selector Tool**: 
  - Activated with `Shift + Cmd/Ctrl + S`
  - Click on any element to capture its CSS selector
  - Options to copy, send to terminal, or insert into chat
- **Component Selector Tool**:
  - Activated with `Shift + Cmd/Ctrl + C`
  - Select React components from the preview
  - Send to terminal for modification
- **Navigation Controls**: Back/forward, reload, URL editing
- **External Window**: Open preview in separate window with all selector tools

### Configuration Panel Features ✅
- **Environment Variables**: Manage local environment variables
- **Package Manager Selection**: Choose preferred package manager (npm, yarn, pnpm, bun)
- **Preview URL Configuration**: Set custom preview URL for the app
- **Neon Database Configuration**: Database setup and configuration

## New Features Added

### 1. Install and Start Command Configuration ✨

**Purpose**: Allow developers to customize the commands used to install dependencies and start their app.

**Components Created**:
- `AppCommandInput.tsx` - UI component for command configuration
- `AppCommandInput.test.tsx` - Unit tests

**Features**:
- Install command input (e.g., "pnpm install")
- Start command input (e.g., "pnpm dev")
- Both commands must be provided together (validation enforced)
- Clear button to reset to auto-detection
- Helpful description text
- Auto-saves when commands are updated
- Falls back to auto-detected commands when not set

**Technical Implementation**:
- Extended `AppSettings` interface to include `installCommand` and `startCommand`
- Updated `UpdateAppSettingsParams` to accept these fields
- Modified IPC handlers (`app_settings_handlers.ts`) to persist commands
- Updated IPC client (`ipc_client.ts`) to support new parameters

### 2. Output Destination Display & Editing ✨

**Purpose**: Show developers where their app files are stored, provide easy access to the folder, and allow them to update the output path in place.

**Components Created**:
- `AppOutputDestination.tsx` - UI component for output path display and editing (Desktop)
- `AppOutputDestination.test.tsx` - Unit tests
- `app-output-destination.tsx` - UI component for web app

**Features**:
- Editable display of app folder path
- Edit button to modify the path
- "Open folder" button to view in file manager (desktop only)
- Uses existing `renameApp` IPC method to update path
- HTTP API endpoint for web app path updates
- Validation to prevent conflicts
- Clear, user-friendly interface
- Helpful description text

**Technical Implementation**:
- Desktop: Uses existing `renameApp` IPC method to move files and update database
- Web: Uses new HTTP API endpoint `PATCH /api/apps/:id/path` to update path
- Leverages React Query for data fetching and cache invalidation
- Added `updateAppPath` method to AppApi interface
- Implemented in both IPC and HTTP clients
- Service layer handles path conflict validation

## Files Modified

### Type Definitions
- `src/types/app.types.ts` - Added `installCommand` and `startCommand` to `AppSettings`
- `src/types/api.types.ts` - Extended `UpdateAppSettingsParams`

### Backend (IPC & HTTP API)
- `src/ipc/handlers/app_settings_handlers.ts` - Added handling for new settings
- `src/ipc/ipc_client.ts` - Updated client methods
- `src/api/http/controllers/app.controller.ts` - Added `updateAppPath` endpoint
- `src/api/http/routes/app.routes.ts` - Added route for path updates
- `src/api/services/app.service.ts` - Added `updateAppPath` service method
- `packages/@dyad-sh/core/src/clients/http.client.ts` - Added `updateAppPath` method
- `packages/@dyad-sh/core/src/clients/ipc.client.ts` - Added `updateAppPath` method
- `packages/@dyad-sh/core/src/interfaces/client.interface.ts` - Added to AppApi interface

### Frontend Components
- `src/components/preview_panel/ConfigurePanel.tsx` - Added new components to UI
- `src/components/settings/AppCommandInput.tsx` - New component (created)
- `src/components/settings/AppOutputDestination.tsx` - Updated with edit functionality
- `web-app/src/components/app-output-destination.tsx` - New component for web app

### Tests
- `src/components/settings/AppCommandInput.test.tsx` - New test file
- `src/components/settings/AppOutputDestination.test.tsx` - Updated with edit tests

### Documentation
- `FEATURE_OVERVIEW_APP_SETTINGS.md` - Updated with new features

## UI Layout

The Configure Panel now shows:

```
┌─────────────────────────────────────────────┐
│ Environment Variables (Local)                │
│ [+ Add New] [Existing vars...]              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ App Settings                                 │
│                                              │
│ Package Manager:                             │
│ [Auto-detect ▼]                             │
│                                              │
│ Preview URL:                                 │
│ [http://localhost:3000] [Save] [X]          │
│                                              │
│ Install Command:                        [NEW]│
│ [pnpm install]                              │
│                                              │
│ Start Command:                          [NEW]│
│ [pnpm dev]                                  │
│ [Save] [Clear]                              │
│                                              │
│ Output Destination:                     [NEW]│
│ [/path/to/app/folder] [✏️] [📁]             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Neon Database Configuration                  │
│ ...                                          │
└─────────────────────────────────────────────┘
```

## How It Works

### Custom Commands Flow
1. User enters install and start commands in ConfigurePanel
2. Both commands are validated (must be provided together)
3. Commands are saved to database via IPC
4. When app is run, custom commands override auto-detection
5. If commands are cleared, app falls back to auto-detected commands

### Output Destination Flow
1. Component fetches app data via React Query
2. Displays the app's folder path with edit and open folder buttons
3. **Desktop App**:
   - Click edit button to enable inline editing
   - Enter new path and save
   - Uses `renameApp` IPC method to move files and update database
   - Files are physically moved to new location
4. **Web App**:
   - Click edit button to enable inline editing
   - Enter new path and save
   - Uses HTTP API `PATCH /api/apps/:id/path` to update database
   - Path is updated in database (file operations not supported in web)
5. Query cache is invalidated to refresh app data
6. Validation prevents path conflicts with other apps

## Testing

### Unit Tests Added
- **AppCommandInput**: Tests loading, rendering, and saving commands
- **AppOutputDestination**: Tests loading, displaying, and editing app path

### Manual Testing Checklist
- [ ] Open Configure tab with an app selected
- [ ] Verify all new fields are visible
- [ ] Enter custom install and start commands
- [ ] Save and verify they persist
- [ ] Clear commands and verify fallback to auto-detect
- [ ] Click edit icon to modify output destination
- [ ] Enter new path and save
- [ ] Verify path is updated and files are moved (desktop)
- [ ] Click folder icon to open app directory (desktop)
- [ ] Verify validation (both commands required)
- [ ] Verify path conflict validation

## Benefits

1. **Developer Flexibility**: Customize build and start commands per app
2. **Better Visibility**: See exactly where app files are stored
3. **In-Place Path Updates**: Change app location without creating copies
3. **Easy Access**: Quick navigation to app folder from UI
4. **Validation**: Prevents invalid command configurations
5. **Seamless Integration**: Works with existing preview and run features
6. **Documentation**: Clear help text explains each setting

## Backward Compatibility

All changes are backward compatible:
- Existing apps without custom commands use auto-detection
- Database schema already had `installCommand` and `startCommand` fields
- No breaking changes to existing APIs or components
- Existing preview and selector features remain unchanged

## Future Enhancements

Potential improvements for future iterations:
- Command templates for common frameworks
- Validation of command syntax
- Test commands before saving
- Port configuration in start command
- Build command customization
