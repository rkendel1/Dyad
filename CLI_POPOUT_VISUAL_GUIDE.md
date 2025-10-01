# CLI POPOUT VISUAL GUIDE

┌─────────────────────────────────────────────────────────────────┐
│ PREVIEW PANEL │
│ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Preview/Code/Configure │ │
│ │ │ │
│ │ [Your App Running Here] │ │
│ │ │ │
│ └─────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 System Messages (12) ⚠️ 2 errors [↗ Popout] [▼] │◄──┐
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
│
│
Click here to open CLI Popout ─────────────────────────────────┘

# FLOATING CLI POPOUT (500px × 600px)

                                              ┌────────────────────────────────┐
                                              │ 💻 CLI Terminal (App #3)       │
                                              │                      [−] [✕]   │
                                              ├────────────────────────────────┤
                                              │ 14:32:10 [STDOUT] > npm run    │
                                              │          dev                   │
                                              │ 14:32:11 [STDOUT]              │
                                              │ > vite-project@0.0.0 dev       │
                                              │ > vite                         │
                                              │                                │
                                              │ 14:32:12 [STDOUT]              │
                                              │   VITE v5.0.0  ready in 523 ms │
                                              │                                │
                                              │ 14:32:12 [STDOUT]              │
                                              │   ➜  Local:   http://localhost:│
                                              │               5173/            │
                                              │   ➜  Network: use --host       │
                                              │                                │
                                              │ 14:32:13 [STDERR] ⚠️           │
                                              │   Dependency optimization      │
                                              │                                │
                                              ├────────────────────────────────┤
                                              │ 💻 [Type command...] [?][⏱][→] │
                                              └────────────────────────────────┘

# MINIMIZED CLI POPOUT

                                              ┌────────────────────┐
                                              │ 💻 CLI  12 messages│
                                              │         [⬜] [✕]   │
                                              └────────────────────┘

# CONFIGURE PANEL WITH APP SETTINGS

┌──────────────────────────────────────────────────────────────────┐
│ CONFIGURE PANEL │
│ │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Environment Variables (Local) │ │
│ │ │ │
│ │ [+ Add New Variable] │ │
│ │ │ │
│ │ API_KEY=\***\*\*\*\*\*\*\***\*\*\*\***\*\*\*\*\*\*\*** [✎] [🗑️] │ │
│ │ DATABASE_URL=postgresql://... [✎] [🗑️] │ │
│ └────────────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ App Settings [NEW] │ │
│ │ │ │
│ │ Package Manager: │ │
│ │ [Auto-detect ▼] │ │
│ │ Override package manager for this app. If set to │ │
│ │ auto-detect, Dyad will use global setting or detect │ │
│ │ based on lock files. │ │
│ │ │ │
│ │ Preview URL: │ │
│ │ [http://localhost:3000 ] [Save] [✕] │ │
│ │ Override the preview URL for this app. If not set, Dyad │ │
│ │ will use the global setting or auto-detect the URL. │ │
│ └────────────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Neon Database Configuration │ │
│ │ ... │ │
│ └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

# KEY INTERACTIONS

1. System Messages Header:
   - Click [↗] icon → Opens CLI Popout
   - Click [▼] → Toggles console panel

2. CLI Popout:
   - Type command + Enter → Sends to app's stdin
   - Press ↑/↓ → Navigate command history
   - Click [−] → Minimize to compact button
   - Click [✕] → Close popout
   - Click [?] → Show help dialog
   - Click [⏱] → Show command history (last 50)

3. App Settings (Configure Panel):
   - Select Package Manager → Saves automatically
   - Enter Preview URL + Save → Updates app setting
   - Click [✕] on Preview URL → Clears app-level override
