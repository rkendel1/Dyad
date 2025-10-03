# Directory Picker UI Feature

## Overview

This feature enhances the Output Destination editor in both the desktop and web apps by adding a visual directory picker UI for path selection. Users can now browse and select directories visually instead of manually typing paths.

## Implementation Date

January 2025

## Desktop App Implementation

### Components Modified

- **`src/components/settings/AppOutputDestination.tsx`**
  - Added directory picker button with folder icon
  - Users can click the folder icon to open a native directory picker dialog
  - Selected directory path is automatically populated in the input field
  - Users can still manually type or edit the path

### Technical Details

**IPC Handler:** `src/ipc/handlers/import_handlers.ts`
- Added `select-directory` handler that uses Electron's `dialog.showOpenDialog()`
- Opens native OS directory picker with `openDirectory` property
- Returns selected directory path or null if cancelled

**IPC Client:** `src/ipc/ipc_client.ts`
- Added `selectDirectory()` method
- Invokes the `select-directory` IPC handler
- Returns Promise with `{ path: string | null }`

**Preload Script:** `src/preload.ts`
- Added `select-directory` to the whitelist of valid IPC channels
- Allows renderer process to invoke the directory picker

### User Experience

1. User clicks "Edit" button on Output Destination
2. Edit mode shows:
   - Text input field for manual path entry
   - **Folder icon button** to open directory picker
   - Save button (checkmark)
   - Cancel button (X)
3. When user clicks the folder icon:
   - Native OS directory picker dialog opens
   - User browses and selects a directory
   - Selected path is automatically populated in the input field
4. User can then:
   - Modify the path manually if needed
   - Click Save to move files to the new location
   - Click Cancel to discard changes

### Benefits

- **Visual Selection**: No need to type or remember full directory paths
- **Native Experience**: Uses the OS's native directory picker dialog
- **Error Prevention**: Reduces typos and invalid paths
- **User Friendly**: Familiar file browsing experience

## Web App Limitation

### Why No Directory Picker in Web App?

The web app (`web-app/src/components/app-output-destination.tsx`) **does not** include the directory picker feature because:

1. **Browser Security Restrictions**: Web browsers do not provide APIs to browse arbitrary file system directories for security reasons
2. **File System API Limitations**: The File System Access API (where available) has significant limitations:
   - Not supported in all browsers
   - Requires explicit user permission
   - Limited to specific directories
   - Cannot access system-wide directories
3. **Server-Side Context**: The web app communicates with a backend server that manages the file system, not the user's local file system

### Web App Behavior

In the web app, users can:
- ✅ View the current output destination path
- ✅ Edit the path by typing manually
- ✅ Save changes (updates database only, no file operations)
- ❌ Cannot browse directories visually (no native directory picker available)

### Alternative Approaches Considered

1. **Server-Side Directory Listing**: Could implement a custom directory browser that queries the server
   - Pros: Works in browsers
   - Cons: Requires additional backend APIs, complex UI, potential security concerns
   
2. **File System Access API**: Modern browser API for file system access
   - Pros: Native browser feature
   - Cons: Limited browser support, restricted access, poor UX

3. **Current Approach**: Manual text entry only
   - Pros: Simple, works everywhere, secure
   - Cons: Less user-friendly, prone to typos

## Files Modified

### Desktop App
- `src/ipc/handlers/import_handlers.ts` - Added `select-directory` IPC handler
- `src/ipc/ipc_client.ts` - Added `selectDirectory()` method
- `src/preload.ts` - Added `select-directory` to whitelist
- `src/components/settings/AppOutputDestination.tsx` - Added directory picker UI

### Tests
- `src/components/settings/AppOutputDestination.test.tsx` - Added test for directory picker

### Documentation
- `DIRECTORY_PICKER_FEATURE.md` - This document

## Testing

### Unit Tests

Added test case in `AppOutputDestination.test.tsx`:
- Verifies browse button appears in edit mode
- Tests that clicking browse calls `selectDirectory()`
- Validates that selected path updates the input field

### Manual Testing Checklist

Desktop App:
- [x] Edit button enables editing mode
- [x] Folder icon button appears in edit mode
- [x] Clicking folder icon opens native directory picker
- [x] Selected directory populates the input field
- [x] Manual path editing still works
- [x] Save button moves files to new location
- [x] Cancel button discards changes

Web App:
- [x] Edit button enables editing mode
- [x] Manual path editing works
- [x] Save button updates database
- [x] No directory picker button (as expected)

## Future Enhancements

Potential improvements for the web app:
1. **Custom Directory Browser**: Build a server-queried directory tree UI
2. **Path Autocomplete**: Suggest paths based on server directory structure
3. **Recent Paths**: Show recently used paths for quick selection
4. **Path Validation**: Real-time validation of paths before saving

## Related Documentation

- `OUTPUT_DESTINATION_EDITING.md` - Original output destination editing feature
- `CONFIGURATION_PANEL_ENHANCEMENT.md` - Configuration panel improvements
- `HTTP_API_IMPLEMENTATION.md` - Web app HTTP API details
