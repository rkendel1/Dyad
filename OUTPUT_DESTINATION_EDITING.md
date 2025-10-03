# Output Destination Editing Feature - Implementation Summary

## Overview

This implementation adds the ability for users to edit and update the output destination (file path) of their apps in both the desktop and web versions of Dyad. Users can now edit the path in place and apply changes to the current location without creating multiple copies of the app.

## Date

January 2025

## Problem Statement

Previously, the output destination displayed in the configuration panel was read-only. Users could see where their app files were stored but couldn't change the location without manually moving files or creating a new copy of the app. This limitation made it difficult to reorganize project structures or relocate apps to different directories.

## Solution

### Desktop App Implementation

**Component:** `src/components/settings/AppOutputDestination.tsx`

**Features:**
- Editable path field with inline editing
- Edit button (✏️) to enable path editing
- Save (✓) and Cancel (✗) buttons when editing
- Open folder button (📁) to view files in system file manager
- Real-time validation and error handling
- Uses existing `renameApp` IPC method to move files and update database

**Technical Details:**
- Leverages React Query for data fetching and cache invalidation
- Uses `IpcClient.getInstance().renameApp()` to update path
- Automatically refreshes app data after successful update
- Validates path to prevent conflicts with existing apps
- Physically moves app files to new location

### Web App Implementation

**Component:** `web-app/src/components/app-output-destination.tsx`

**Features:**
- Editable path field with inline editing
- Edit button to enable path editing
- Save and Cancel buttons when editing
- Database path updates via HTTP API
- Error handling with user-friendly messages

**Technical Details:**
- Uses `dyadClient.apps.updateAppPath()` method
- Connects to HTTP API endpoint `PATCH /api/apps/:id/path`
- Updates database only (no file operations in web context)
- Validates path conflicts on server side

### HTTP API Endpoint

**Route:** `PATCH /api/apps/:id/path`

**Controller:** `src/api/http/controllers/app.controller.ts`
- `updateAppPath` handler with validation
- Zod schema validation for path parameter
- Error handling with structured responses

**Service:** `src/api/services/app.service.ts`
- `updateAppPath` method for database updates
- Path conflict validation
- Returns updated app object

### Client Libraries

**IPC Client:** `packages/@dyad-sh/core/src/clients/ipc.client.ts`
- `updateAppPath` method implementation
- Uses existing `rename-app` IPC handler
- Fetches app, renames with new path, returns updated app

**HTTP Client:** `packages/@dyad-sh/core/src/clients/http.client.ts`
- `updateAppPath` method implementation
- Makes PATCH request to `/api/apps/:id/path`
- Handles errors and returns updated app

**Interface:** `packages/@dyad-sh/core/src/interfaces/client.interface.ts`
- Added `updateAppPath(appId: number, path: string): Promise<App>` to `AppApi` interface

## Key Benefits

1. **In-Place Updates**: Change app location without creating copies
2. **Desktop Integration**: Files are physically moved to new location (desktop app)
3. **Database Updates**: Path updates for web app (no file operations)
4. **Validation**: Prevents path conflicts with other apps
5. **User Experience**: Simple, intuitive interface with clear feedback
6. **Consistency**: Same API interface for both IPC and HTTP clients

## Files Modified

### Core Implementation
- `src/components/settings/AppOutputDestination.tsx` - Desktop component with edit capability
- `web-app/src/components/app-output-destination.tsx` - Web app component (new)
- `src/api/http/controllers/app.controller.ts` - Added updateAppPath endpoint
- `src/api/http/routes/app.routes.ts` - Added PATCH /api/apps/:id/path route
- `src/api/services/app.service.ts` - Added updateAppPath service method

### Client Libraries
- `packages/@dyad-sh/core/src/clients/http.client.ts` - Added updateAppPath method
- `packages/@dyad-sh/core/src/clients/ipc.client.ts` - Added updateAppPath method
- `packages/@dyad-sh/core/src/interfaces/client.interface.ts` - Added to AppApi interface

### Tests
- `src/components/settings/AppOutputDestination.test.tsx` - Updated with edit tests

### Documentation
- `CONFIGURATION_PANEL_ENHANCEMENT.md` - Updated with new features
- `HTTP_API_IMPLEMENTATION.md` - Added new endpoint documentation
- `OUTPUT_DESTINATION_EDITING.md` - This summary document

## Testing

### Unit Tests
- Component renders with current path
- Edit button enables editing mode
- Save button updates path via API
- Cancel button reverts changes
- Validation prevents empty paths

### Manual Testing Checklist
- [ ] Desktop: Edit path and verify files are moved
- [ ] Desktop: Open folder in file manager
- [ ] Web: Edit path and verify database update
- [ ] Verify path conflict validation
- [ ] Verify error handling for invalid paths
- [ ] Verify UI feedback during save operations
- [ ] Verify query cache invalidation works

## Integration with Existing Features

This feature leverages:
- Existing `renameApp` IPC handler for file operations (desktop)
- Existing HTTP API infrastructure for web app
- Existing React Query setup for data management
- Existing validation patterns from app service layer
- Existing error handling and toast notifications

## Future Enhancements

Potential improvements:
1. ~~Directory browser/picker UI for path selection~~ ✅ **IMPLEMENTED - See DIRECTORY_PICKER_FEATURE.md**
2. Path suggestions based on common project locations
3. Batch path updates for multiple apps
4. File system watcher to detect external moves
5. Undo/redo for path changes
