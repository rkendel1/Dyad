# CONFIGURATION PANEL VISUAL GUIDE

## Preview Panel with Selectors Active

┌─────────────────────────────────────────────────────────────────────┐
│ PREVIEW PANEL - Component & CSS Selector Tools                      │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [👆] [🎨] [←] [→] [↻] [http://localhost:3000] [✏️] [▼] [⏻] [◻] [↗]│ │
│ │  ^    ^                                                            │ │
│ │  │    └─ CSS Selector (Shift+Cmd/Ctrl+S)                         │ │
│ │  └─ Component Selector (Shift+Cmd/Ctrl+C)                        │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────┐    │ │
│ │  │ 🎨 CSS Selector Captured                              [X]│    │ │
│ │  │                                                           │    │ │
│ │  │  .navbar > .nav-item:nth-child(2) > a.active             │    │ │
│ │  │                                                           │    │ │
│ │  │  [📋 Copy] [💻 Terminal] [💬 Chat]                       │    │ │
│ │  └─────────────────────────────────────────────────────────┘    │ │
│ │                                                                   │ │
│ │          [Your App Preview Here]                                 │ │
│ │          - Click elements with selector active                   │ │
│ │          - Captures CSS selectors or React components            │ │
│ │                                                                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

## Configure Panel - App Settings Section

┌─────────────────────────────────────────────────────────────────────┐
│ CONFIGURE TAB                                                        │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🔧 Environment Variables (Local)                            [?]  │ │
│ │                                                                   │ │
│ │ API_KEY                                                           │ │
│ │ sk-1234...                                           [✏️] [🗑️]   │ │
│ │                                                                   │ │
│ │ DATABASE_URL                                                      │ │
│ │ postgresql://...                                     [✏️] [🗑️]   │ │
│ │                                                                   │ │
│ │ [+ Add Environment Variable]                                     │ │
│ │                                                                   │ │
│ │ [➡️ More app settings]                                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚙️ App Settings                                                  │ │
│ │                                                                   │ │
│ │ Package Manager                                                   │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ [Auto-detect        ▼]                                       │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ Override package manager for this app. If not set, Dyad will    │ │
│ │ auto-detect based on lock files.                                 │ │
│ │                                                                   │ │
│ │ Preview URL                                                       │ │
│ │ ┌──────────────────────────────────────────┐                    │ │
│ │ │ http://localhost:3000                     │ [Save]  [X]       │ │
│ │ └──────────────────────────────────────────┘                    │ │
│ │ Override the preview URL for this app. If not set, Dyad will    │ │
│ │ use the global setting or auto-detect the URL.                   │ │
│ │                                                                   │ │
│ │ Install Command                                            ✨NEW  │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ pnpm install                                                 │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │ Start Command                                              ✨NEW  │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ pnpm dev                                                     │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │ [Save]  [X Clear]                                                │ │
│ │                                                                   │ │
│ │ Set custom install and start commands for this app. If not      │ │
│ │ set, Dyad will auto-detect based on your package manager.       │ │
│ │ Both commands must be provided together.                         │ │
│ │                                                                   │ │
│ │ Output Destination                                         ✨NEW  │ │
│ │ ┌──────────────────────────────────────────────────────────┐    │ │
│ │ │ /Users/dev/projects/my-awesome-app                       │ 📁 │ │
│ │ └──────────────────────────────────────────────────────────┘    │ │
│ │ The folder where your app files are stored. Click the folder    │ │
│ │ icon to open it in your file manager.                            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🗄️ Neon Database Configuration                                   │ │
│ │ ...                                                               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

## User Workflows

### Setting Custom Commands

1. Navigate to Configure tab
2. Select your app from the app list
3. Scroll to "App Settings" section
4. Enter install command (e.g., "pnpm install")
5. Enter start command (e.g., "pnpm dev")
6. Click "Save" button
7. Commands are now used when running the app

### Using CSS Selector Tool

1. Open Preview panel
2. Click the 🎨 CSS Selector button (or press Shift+Cmd/Ctrl+S)
3. Hover over elements in the preview
4. Click on the element you want to select
5. CSS selector is captured and displayed
6. Choose action:
   - 📋 Copy to clipboard
   - 💻 Send to terminal
   - 💬 Insert into chat for AI modifications

### Using Component Selector Tool

1. Open Preview panel
2. Click the 👆 Component Selector button (or press Shift+Cmd/Ctrl+C)
3. Hover over React components in the preview
4. Click on the component you want to select
5. Component info is displayed with file path and line number
6. Component is automatically sent to terminal for modifications

### Accessing App Files

1. Navigate to Configure tab
2. Select your app
3. Scroll to "Output Destination"
4. Click the 📁 folder icon
5. File manager opens showing your app files

## Key Features

✅ **Preview Pane**
   - Live preview of your running app
   - Browser-style navigation (back/forward/reload)
   - URL editing and custom navigation
   - External window support

✅ **CSS Selector Tool**
   - Keyboard shortcut: Shift+Cmd/Ctrl+S
   - Visual element highlighting
   - Copy, send to terminal, or chat
   - Optimal selector generation

✅ **Component Selector Tool**
   - Keyboard shortcut: Shift+Cmd/Ctrl+C
   - React component detection
   - Shows file path and line number
   - Auto-send to terminal

✅ **Package Manager Selection**
   - App-level override
   - Auto-detection fallback
   - npm, yarn, pnpm, bun support

✅ **Preview URL Configuration**
   - Custom URL per app
   - URL validation
   - Clear/reset option

✨ **Install & Start Commands (NEW)**
   - Custom install command
   - Custom start command
   - Both required together
   - Clear to reset

✨ **Output Destination (NEW)**
   - Shows app folder path
   - Quick open in file manager
   - Read-only display

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + Cmd/Ctrl + C` | Activate Component Selector |
| `Shift + Cmd/Ctrl + S` | Activate CSS Selector |
| `Shift + Cmd/Ctrl + E` | Open External Preview Window |
| `Escape` | Deactivate active selector |

## Integration Points

All configuration settings integrate seamlessly:

```
ConfigurePanel
    ↓
IPC Client (updateAppSettings)
    ↓
App Settings Handler
    ↓
Database (apps table)
    ↓
App Execution (runApp/restartApp)
    ↓
Uses configured settings
```

## Benefits

🎯 **For Developers**
- Full control over app execution
- Quick access to app files
- Visual element selection
- CSS modification workflow
- Component editing workflow

🎯 **For Workflows**
- Preview → Select → Modify → Repeat
- Configure → Run → Preview → Iterate
- Custom commands for special needs
- Easy debugging with selectors
