# Feature Overview: App-Level Settings and CLI Popout

## What Was Implemented

### 1. App-Level Package Manager Settings

- **Location**: Configure tab > App Settings section
- **Purpose**: Override package manager for specific apps
- **Options**: Auto-detect, npm, yarn, pnpm, bun
- **Priority**: App-level > Global > Project-detected > System default

### 2. App-Level Preview URL Settings

- **Location**: Configure tab > App Settings section
- **Purpose**: Override preview URL for specific apps
- **Features**: URL validation, clear button, fallback to global/auto-detect
- **Priority**: App-level > Global > Auto-detected

### 3. CLI Popout Component

- **Access**: Click External Link icon (↗) in System Messages header
- **Features**:
  - Floating window in bottom-right corner
  - Real-time terminal output (stdout, stderr, errors)
  - Command history (last 50 commands)
  - Minimize/maximize functionality
  - Built-in commands (help, clear)
  - Keyboard shortcuts (Enter, ↑/↓, Esc)

## UI Changes

### Configure Panel

```
┌─────────────────────────────────────┐
│ Environment Variables (Local)        │
│ [+ Add New] [Existing vars...]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ App Settings                    [NEW]│
│                                      │
│ Package Manager:                     │
│ [Auto-detect ▼]                     │
│ Override package manager for this    │
│ app...                              │
│                                      │
│ Preview URL:                         │
│ [http://localhost:3000] [Save] [X]  │
│ Override preview URL for this app... │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Neon Database Configuration          │
│ ...                                  │
└─────────────────────────────────────┘
```

### System Messages Header

```
┌─────────────────────────────────────┐
│ 📋 System Messages (5) ⚠️ 2 errors  │
│ Latest: npm run dev started...      │
│                    [↗] [▼]     [NEW]│
└─────────────────────────────────────┘
                       ↑
            Opens CLI Popout
```

### CLI Popout

```
┌────────────────────────────┐
│ 💻 CLI Terminal (App #1)   │
│                      [−][✕]│
├────────────────────────────┤
│ [Terminal Output Area]     │
│ 14:23:45 [STDOUT] Server   │
│          started on :3000  │
│ 14:23:46 [STDERR] Warning  │
│ ...                        │
├────────────────────────────┤
│ 💻 [command input] [?][⏱][→]│
└────────────────────────────┘
```

### Minimized CLI Popout

```
┌──────────────────────┐
│ 💻 CLI  5 messages   │
│           [⬜][✕]    │
└──────────────────────┘
```

## Key Workflows

### Workflow 1: Set App-Level Package Manager

1. Select app in sidebar
2. Click Configure tab
3. Scroll to "App Settings"
4. Select package manager from dropdown
5. Setting saved automatically

### Workflow 2: Set App-Level Preview URL

1. Select app in sidebar
2. Click Configure tab
3. Scroll to "App Settings"
4. Enter custom URL in Preview URL field
5. Click Save
6. (Optional) Click X to clear

### Workflow 3: Use CLI Popout

1. Start an app
2. Click ↗ icon in System Messages header
3. Floating CLI appears
4. Type commands and press Enter
5. View output in popout
6. Click − to minimize
7. Click ✕ to close

## Technical Architecture

### Data Flow: Package Manager

```
User selects PM in UI
    ↓
IPC: update-app-settings
    ↓
Database: apps.preferred_package_manager
    ↓
package_manager_utils.ts
    ↓
getBestPackageManagerForProject()
    ↓
Checks: App-level → Global → Project → System
    ↓
Returns selected PM for use
```

### Data Flow: Preview URL

```
User enters URL in UI
    ↓
IPC: update-app-settings
    ↓
Database: apps.preview_url
    ↓
useRunApp hook
    ↓
processProxyServerOutput()
    ↓
Checks: App-level → Global → Auto-detected
    ↓
Sets preview panel URL
```

### Data Flow: CLI Popout

```
User clicks ↗ icon
    ↓
PreviewPanel state: isCliPopoutOpen = true
    ↓
CliPopout component renders
    ↓
Syncs with appOutputAtom (global state)
    ↓
User types command
    ↓
IPC: respond-to-app-input
    ↓
App receives stdin
    ↓
Output → appOutputAtom → CliPopout
```

## Benefits

### For Users

- **Flexibility**: Different settings for different apps
- **Workspace Organization**: CLI doesn't disrupt code view
- **Quick Access**: Easy override without changing global settings
- **Transparency**: Clear priority order for settings

### For Developers

- **Backwards Compatible**: All changes are additive
- **Well Documented**: Clear documentation and implementation summary
- **Type Safe**: Full TypeScript support
- **Tested**: Linting passed, no TypeScript errors

## Migration Notes

- Database migration: `0013_add_app_settings.sql`
- Adds 2 nullable columns to `apps` table
- Existing apps work without changes
- No data migration needed
