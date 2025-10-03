# Output Destination Editing - Visual Guide

## UI Changes Overview

This document provides a visual representation of the new output destination editing feature.

## Desktop App - Configuration Panel

### Before (Read-Only)

```
┌───────────────────────────────────────────────────────────────┐
│                    Configuration Panel                         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Package Manager                                               │
│  ┌──────────────────────┐                                     │
│  │ npm                ▼ │                                     │
│  └──────────────────────┘                                     │
│                                                                │
│  Preview URL                                                   │
│  ┌─────────────────────────────────────┐                     │
│  │ http://localhost:3000               │                     │
│  └─────────────────────────────────────┘                     │
│                                                                │
│  Output Destination                                            │
│  ┌─────────────────────────────────────┐  ┌────┐            │
│  │ /Users/dev/Projects/my-app          │  │ 📁 │            │
│  └─────────────────────────────────────┘  └────┘            │
│  The folder where your app files are stored.                  │
│  Click the folder icon to open it in your file manager.       │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### After (Editable) - Normal View

```
┌───────────────────────────────────────────────────────────────┐
│                    Configuration Panel                         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Package Manager                                               │
│  ┌──────────────────────┐                                     │
│  │ npm                ▼ │                                     │
│  └──────────────────────┘                                     │
│                                                                │
│  Preview URL                                                   │
│  ┌─────────────────────────────────────────┐                 │
│  │ http://localhost:3000               │                     │
│  └─────────────────────────────────────┘                     │
│                                                                │
│  Output Destination                                            │
│  ┌─────────────────────────────────────┐  ┌────┐  ┌────┐    │
│  │ /Users/dev/Projects/my-app          │  │ ✏️ │  │ 📁 │    │
│  └─────────────────────────────────────┘  └────┘  └────┘    │
│  The folder where your app files are stored.                  │
│  Click the edit icon to change the location.                  │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### After (Editable) - Edit Mode

```
┌───────────────────────────────────────────────────────────────┐
│                    Configuration Panel                         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Package Manager                                               │
│  ┌──────────────────────┐                                     │
│  │ npm                ▼ │                                     │
│  └──────────────────────┘                                     │
│                                                                │
│  Preview URL                                                   │
│  ┌─────────────────────────────────────────┐                 │
│  │ http://localhost:3000               │                     │
│  └─────────────────────────────────────┘                     │
│                                                                │
│  Output Destination                                            │
│  ┌─────────────────────────────────────┐  ┌────┐  ┌────┐    │
│  │ /Users/dev/NewProjects/my-app  ___  │  │ ✓  │  │ ✗  │    │
│  └─────────────────────────────────────┘  └────┘  └────┘    │
│  Enter the new path for your app files.                       │
│  The files will be moved to this location.                    │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### After (Editable) - Saving State

```
┌───────────────────────────────────────────────────────────────┐
│                    Configuration Panel                         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Package Manager                                               │
│  ┌──────────────────────┐                                     │
│  │ npm                ▼ │                                     │
│  └──────────────────────┘                                     │
│                                                                │
│  Preview URL                                                   │
│  ┌─────────────────────────────────────────┐                 │
│  │ http://localhost:3000               │                     │
│  └─────────────────────────────────────┘                     │
│                                                                │
│  Output Destination                                            │
│  ┌─────────────────────────────────────┐  ┌──────────────┐   │
│  │ /Users/dev/NewProjects/my-app       │  │  Saving... ⟳ │   │
│  └─────────────────────────────────────┘  └──────────────┘   │
│  Moving files to new location...                              │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## Web App - App Details

### Before (Path Display Only)

```
┌───────────────────────────────────────────────────────────────┐
│  ← Back                                                        │
│                                                                │
│  My App                                                        │
│  /Users/dev/Projects/my-app                                   │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│  [Chat] [Files]                                               │
│                                                                │
│  ...                                                           │
└───────────────────────────────────────────────────────────────┘
```

### After (With Output Destination Component)

```
┌───────────────────────────────────────────────────────────────┐
│  ← Back                                                        │
│                                                                │
│  My App                                                        │
│  /Users/dev/Projects/my-app                                   │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Output Destination                                       │ │
│  │ ┌───────────────────────────────────┐  ┌────┐          │ │
│  │ │ /Users/dev/Projects/my-app        │  │ ✏️ │          │ │
│  │ └───────────────────────────────────┘  └────┘          │ │
│  │ The folder where your app files are stored.             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│  [Chat] [Files]                                               │
│                                                                │
│  ...                                                           │
└───────────────────────────────────────────────────────────────┘
```

## User Flow Diagram

```
┌─────────────┐
│   Start     │
│ View Config │
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│ See Current Path │ ←──────┐
│ with Edit Button │        │
└──────┬───────────┘        │
       │                    │
       │ Click Edit (✏️)    │
       ↓                    │
┌──────────────────┐        │
│   Edit Mode      │        │
│ Input Field +    │        │
│ Save/Cancel      │        │
└──────┬───────────┘        │
       │                    │
       ├─→ Click Cancel (✗) ┘
       │
       ↓ Click Save (✓)
       │
┌──────────────────┐
│   Validation     │
└──────┬───────────┘
       │
       ├─→ Invalid ─→ Show Error ─┐
       │                           │
       ↓ Valid                     │
┌──────────────────┐               │
│  Desktop: Move   │               │
│  Files + Update  │               │
│  Database        │               │
│                  │               │
│  Web: Update     │               │
│  Database Only   │               │
└──────┬───────────┘               │
       │                           │
       ↓                           │
┌──────────────────┐               │
│  Success!        │               │
│  Show Toast      │               │
│  Refresh Data    │               │
└──────┬───────────┘               │
       │                           │
       ↓                           │
┌──────────────────┐               │
│  View Updated    │ ←─────────────┘
│  Path            │
└──────────────────┘
```

## Interaction States

### 1. Initial State (View Mode)
- **Display**: Read-only path in styled div
- **Buttons**: Edit (✏️), Open Folder (📁 - desktop only)
- **Cursor**: Default
- **Actions**: Click edit or open folder

### 2. Edit State (Edit Mode)
- **Display**: Editable input field with current path
- **Buttons**: Save (✓), Cancel (✗)
- **Cursor**: Text cursor in input
- **Actions**: Type new path, save, or cancel
- **Focus**: Auto-focus on input field

### 3. Saving State
- **Display**: Input disabled, loading indicator
- **Buttons**: Disabled
- **Message**: "Moving files..." (desktop) or "Updating..." (web)
- **Actions**: None (wait for completion)

### 4. Success State
- **Display**: New path shown
- **Toast**: Green success message
- **Transition**: Back to view mode
- **Data**: Refreshed from server

### 5. Error State
- **Display**: Original path restored
- **Toast**: Red error message with details
- **Transition**: Back to edit mode
- **Focus**: Remains on input

## Button Visual Guide

### Edit Button (✏️)
```
┌────┐
│ ✏️ │  Edit path
└────┘
```
- **Purpose**: Enable editing mode
- **Active**: When not editing
- **Disabled**: When path not loaded

### Open Folder Button (📁)
```
┌────┐
│ 📁 │  Open folder
└────┘
```
- **Purpose**: Open in file manager
- **Active**: When path exists
- **Desktop Only**: Not shown in web

### Save Button (✓)
```
┌────┐
│ ✓  │  Save
└────┘
```
- **Purpose**: Save changes
- **Active**: When path changed
- **Disabled**: When saving or empty

### Cancel Button (✗)
```
┌────┐
│ ✗  │  Cancel
└────┘
```
- **Purpose**: Discard changes
- **Active**: When editing
- **Disabled**: When saving

## Color Scheme

### Normal Mode
- **Background**: Light gray (#F3F4F6) / Dark gray (#1F2937)
- **Text**: Dark gray (#374151) / Light gray (#D1D5DB)
- **Border**: Gray (#D1D5DB) / Dark border (#374151)

### Edit Mode
- **Input**: White background with blue border focus
- **Save Button**: Primary color (blue/green)
- **Cancel Button**: Outline style

### States
- **Success Toast**: Green (#10B981)
- **Error Toast**: Red (#EF4444)
- **Loading**: Blue spinner (#3B82F6)

## Responsive Behavior

### Desktop (Large Screens)
```
[Path________________] [✏️] [📁]
```

### Mobile/Small Screens
```
[Path_____________]
[✏️] [📁]
```

## Accessibility

- **Keyboard Navigation**: Tab through buttons
- **Screen Readers**: Descriptive labels for all buttons
- **Focus Indicators**: Clear blue outline
- **Error Messages**: Announced to screen readers
- **Success Messages**: Announced to screen readers

## Animation

### Transitions
- **Edit Mode**: Smooth 200ms transition
- **Button States**: 150ms hover effect
- **Toast Notifications**: Slide in from top
- **Loading Spinner**: Continuous rotation

### Example CSS
```css
.edit-button {
  transition: all 200ms ease-in-out;
}

.edit-button:hover {
  transform: scale(1.05);
}

.input-field {
  transition: border-color 200ms;
}

.input-field:focus {
  border-color: #3B82F6;
}
```

## Error Scenarios

### Path Conflict
```
┌────────────────────────────────────────┐
│  ⚠️  Error                             │
│                                        │
│  An app with the path                 │
│  '/Users/dev/NewPath'                 │
│  already exists                       │
│                                        │
│  [OK]                                 │
└────────────────────────────────────────┘
```

### Permission Error
```
┌────────────────────────────────────────┐
│  ⚠️  Error                             │
│                                        │
│  Failed to move files:                │
│  Permission denied                    │
│                                        │
│  [OK]                                 │
└────────────────────────────────────────┘
```

### Network Error (Web)
```
┌────────────────────────────────────────┐
│  ⚠️  Error                             │
│                                        │
│  Failed to update:                    │
│  Network request failed               │
│                                        │
│  [Retry] [Cancel]                     │
└────────────────────────────────────────┘
```
