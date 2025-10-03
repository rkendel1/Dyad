# Web App Advanced Features - Visual Guide

## 🎨 UI Components Overview

### Home Page (/)
```
┌─────────────────────────────────────────────────────────────┐
│ 🚀 Dyad Web Interface          [Browse Templates] [Status]  │
│ Manage your AI applications from the browser                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │  App 1    │  │  App 2    │  │  App 3    │               │
│  │           │  │           │  │           │               │
│  │  Details  │  │  Details  │  │  Details  │               │
│  │ [Open App]│  │ [Open App]│  │ [Open App]│               │
│  └───────────┘  └───────────┘  └───────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Features:
✅ Status badges (Connected/Connecting/Disconnected)
✅ Browse Templates button
✅ Grid layout for apps
✅ Open App navigation
```

### App Details Page (/app/[id])
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back]  My App Name                              [Delete] │
│           /path/to/app                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Chat] [Files] ← Tabs                                      │
│                                                               │
│  ┌──────────┬─────────────────────────────────────────┐    │
│  │  Chats   │  Chat Messages                           │    │
│  │  [+New]  │  ┌────────────────────────────────────┐  │    │
│  │          │  │ User: Hello                         │  │    │
│  │ Chat 1   │  │ AI: How can I help?                 │  │    │
│  │ Chat 2   │  │ ...                                 │  │    │
│  │          │  └────────────────────────────────────┘  │    │
│  │          │  [Type message...] [Send]                │    │
│  └──────────┴─────────────────────────────────────────┘    │
│                                                               │
│  OR when Files tab is selected:                             │
│                                                               │
│  ┌──────────┬─────────────────────────────────────────┐    │
│  │ Files    │  src/App.tsx              [Save] [•]     │    │
│  │ ├─ src   │  ┌────────────────────────────────────┐  │    │
│  │ │  └─App │  │ import React from 'react'          │  │    │
│  │ ├─ public│  │ ...                                 │  │    │
│  │ └─ ...   │  │ Monaco Editor with syntax highlight │  │    │
│  │          │  └────────────────────────────────────┘  │    │
│  └──────────┴─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Features:
✅ Tab navigation (Chat/Files)
✅ File tree with expand/collapse
✅ Monaco editor with syntax highlighting
✅ Unsaved changes indicator (•)
✅ Save button
✅ Toast notifications for actions
```

### Templates Page (/templates)
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back to Apps]  App Templates                              │
│                   Choose a template to start your project    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ [Image]    │  │ [Image]    │  │ [Image]    │            │
│  │ React.js   │  │ Next.js    │  │ Portal     │            │
│  │ Template   │  │ Template   │  │ Mini Store │            │
│  │            │  │            │  │            │            │
│  │ Uses Vite, │  │ Uses Next, │  │ Uses Neon, │            │
│  │ Shadcn...  │  │ React...   │  │ Payload... │            │
│  │            │  │            │  │            │            │
│  │ [Official] │  │ [Official] │  │ [Official] │            │
│  │            │  │            │  │ [Experimental]          │
│  │            │  │            │  │ [Neon DB]  │            │
│  │            │  │            │  │            │            │
│  │[Use Template]│[Use Template]│[Use Template]│            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Features:
✅ Template cards with images
✅ Template descriptions
✅ Category badges (Official, Experimental, Neon DB)
✅ GitHub links (external icon)
✅ Use Template button
✅ Grid responsive layout
```

## 🎯 UI Components

### 1. StatusBadge
```typescript
<StatusBadge variant="success">Connected</StatusBadge>
<StatusBadge variant="error">Disconnected</StatusBadge>
<StatusBadge variant="loading">Processing...</StatusBadge>
<StatusBadge variant="warning">Warning</StatusBadge>
<StatusBadge variant="info">Info</StatusBadge>
```

Visual:
```
[✓ Connected]        - Green background, green text
[✗ Disconnected]     - Red background, red text
[⟳ Processing...]    - Gray background, spinning icon
[⚠ Warning]          - Orange background, orange text
[ℹ Info]             - Blue background, blue text
```

### 2. Spinner
```typescript
<Spinner size="sm" />   // Small spinner
<Spinner size="md" />   // Medium spinner (default)
<Spinner size="lg" />   // Large spinner
```

Visual:
```
⟳  - Small (h-4 w-4)
⟳  - Medium (h-8 w-8)
⟳  - Large (h-12 w-12)
```

### 3. Toast Notifications
```typescript
toast.success("File saved successfully")
toast.error("Failed to save file")
toast.info("Processing...")
toast.warning("Unsaved changes")
```

Visual:
```
┌─────────────────────────────────┐
│ ✓ File saved successfully       │  Top-right corner
└─────────────────────────────────┘  Auto-dismiss after 3s
                                     Rich colors based on type
```

### 4. Tabs
```typescript
<Tabs defaultValue="chat">
  <TabsList>
    <TabsTrigger value="chat">Chat</TabsTrigger>
    <TabsTrigger value="files">Files</TabsTrigger>
  </TabsList>
  <TabsContent value="chat">...</TabsContent>
  <TabsContent value="files">...</TabsContent>
</Tabs>
```

Visual:
```
┌────────┬────────┐
│ [Chat] │  Files │  - Active tab: white bg, shadow
└────────┴────────┘  - Inactive: transparent
```

### 5. FileTree
```typescript
<FileTree 
  files={["src/App.tsx", "src/utils/helpers.ts"]}
  onFileSelect={(path) => console.log(path)}
  selectedFile="src/App.tsx"
/>
```

Visual:
```
├─ src
│  ├─ 📄 App.tsx        (highlighted if selected)
│  └─ utils
│     └─ 📄 helpers.ts
└─ 📁 public
```

### 6. FileEditor
```typescript
<FileEditor
  filePath="src/App.tsx"
  content="..."
  onSave={async (content) => { ... }}
/>
```

Visual:
```
┌────────────────────────────────────────┐
│ src/App.tsx                [Save] [•]  │  ← Breadcrumb + status
├────────────────────────────────────────┤
│ 1 │ import React from 'react'          │
│ 2 │ ...                                │  ← Monaco editor
│ 3 │                                    │  ← Line numbers
└────────────────────────────────────────┘  ← Syntax highlighting
```

## 🎨 Color Scheme

```
Primary Colors:
- Blue: #3b82f6 (buttons, links, selected states)
- Purple: #a855f7 (accents, gradients)
- Violet: #8b5cf6 (backgrounds)

Semantic Colors:
- Success: #22c55e (green)
- Error: #ef4444 (red)
- Warning: #f59e0b (orange)
- Info: #3b82f6 (blue)

Backgrounds:
- Light: Gradient from violet-100 via purple-50 to fuchsia-100
- Dark: Gradient from violet-950 via purple-950 to fuchsia-950
```

## 📱 Responsive Design

All components are responsive and work on:
- Desktop (1920x1080 and above)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

Key responsive features:
- Grid layouts adjust column count
- Sidebar becomes drawer on mobile
- Touch-friendly tap targets (44x44px minimum)
- Scrollable content areas
- Collapsible sections

## 🎭 Animations

- Smooth transitions (300ms ease-in-out)
- Hover effects on cards and buttons
- Loading spinner rotation
- Tab switching animations
- Toast slide-in from top-right
- Status badge pulse for loading state

## 🔗 Navigation Flow

```
Home (/)
  ↓
  → Browse Templates → /templates → Select Template (TODO: create app)
  ↓
  → Open App → /app/[id]
                 ↓
                 → Chat Tab (default)
                 → Files Tab → Select File → Edit → Save
                                                      ↓
                                                      Toast notification
```

## 💡 User Feedback Moments

Every user action gets feedback:

1. **Click "Open App"** → Navigate with loading state → Page loads
2. **Select File** → Loading spinner → File content displays
3. **Edit File** → Unsaved indicator (•) appears
4. **Save File** → Button shows "Saving..." → Success toast
5. **Create Chat** → Loading button → Success toast → Chat appears
6. **Send Message** → Optimistic UI → Message sent → Auto-refresh
7. **Delete Action** → Confirmation (TODO) → Loading → Success toast

## 🎯 Key Improvements Over Previous Version

1. **Before:** Static file list
   **After:** Interactive file tree with Monaco editor

2. **Before:** No template browsing
   **After:** Full template library with cards and metadata

3. **Before:** Basic error messages
   **After:** Toast notifications with context

4. **Before:** Inconsistent loading states
   **After:** Unified Spinner component throughout

5. **Before:** Text-based status
   **After:** Visual StatusBadge components

6. **Before:** Single view for app details
   **After:** Tabbed interface (Chat/Files)
