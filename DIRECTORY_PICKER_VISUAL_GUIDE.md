# Directory Picker UI - Visual Guide

## Desktop App - Before and After

### Before (View Mode)

```
┌─────────────────────────────────────────────────────┐
│ Output Destination                                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ /Users/username/dyad-apps/my-app        [✏️] [📁] │ │
│ └─────────────────────────────────────────────────┘ │
│ The folder where your app files are stored.        │
│ Click the edit icon to change the location.        │
└─────────────────────────────────────────────────────┘
```

- Shows current path in read-only display
- Edit button (✏️) to start editing
- Open folder button (📁) to view in file manager

### After - Edit Mode with Directory Picker

```
┌─────────────────────────────────────────────────────┐
│ Output Destination                                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ /Users/username/dyad-apps/my-app  [📂] [✓] [✗]  │ │
│ └─────────────────────────────────────────────────┘ │
│ Enter the path manually or click the folder icon   │
│ to browse. The files will be moved to this         │
│ location.                                           │
└─────────────────────────────────────────────────────┘
```

- Input field for manual path entry
- **NEW: Browse button (📂)** to open directory picker
- Save button (✓) to apply changes
- Cancel button (✗) to discard changes

### Directory Picker Dialog

When the user clicks the browse button (📂):

```
┌─────────────────────────────────────────────────────┐
│ Select Directory                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📁 Applications                                  │ │
│ │ 📁 Desktop                                       │ │
│ │ 📁 Documents                                     │ │
│ │ 📁 Downloads                                     │ │
│ │ 📁 dyad-apps         ← SELECTED                  │ │
│ │   📁 my-app                                      │ │
│ │   📁 another-app                                 │ │
│ │ 📁 Pictures                                      │ │
│ │ 📁 Music                                         │ │
│ └─────────────────────────────────────────────────┘ │
│                           [Cancel] [Select Folder]  │
└─────────────────────────────────────────────────────┘
```

- Native OS directory picker dialog
- Visual folder browsing
- Select button to confirm selection

## User Flow

### Step 1: View Current Path
```
Current: /Users/username/dyad-apps/my-app
```
User sees the current output destination

### Step 2: Click Edit Button
```
Mode: EDIT
Shows: Input field + Browse + Save + Cancel
```
User clicks the edit (✏️) button

### Step 3: Click Browse Button (NEW FEATURE!)
```
Action: Opens native directory picker
```
User clicks the new browse button (📂)

### Step 4: Select Directory
```
User navigates to: /Users/username/projects/my-new-app
Clicks: Select Folder
```
User browses and selects a new directory

### Step 5: Path Auto-Populated
```
Input field now shows: /Users/username/projects/my-new-app
```
Selected path automatically appears in the input

### Step 6: Save Changes
```
Action: Files moved to new location
Database updated
```
User clicks save (✓) to apply changes

## Key Improvements

### 1. Visual Selection
- **Before**: Type full path manually
- **After**: Browse visually with native dialog

### 2. Error Prevention
- **Before**: Typos in paths common
- **After**: Selected paths are always valid

### 3. Discovery
- **Before**: Need to know exact paths
- **After**: Browse and discover directories

### 4. User Experience
- **Before**: Text-only, error-prone
- **After**: Visual, intuitive, native feel

## Implementation Details

### Component Structure

```typescript
// AppOutputDestination.tsx
export function AppOutputDestination({ appId }: AppOutputDestinationProps) {
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editedPath, setEditedPath] = useState("");
  
  // Directory picker handler
  const handleBrowse = async () => {
    const result = await IpcClient.getInstance().selectDirectory();
    if (result.path) {
      setEditedPath(result.path); // Auto-populate input
    }
  };
  
  return (
    {isEditing ? (
      <>
        <Input value={editedPath} onChange={...} />
        <Button onClick={handleBrowse}> {/* NEW */}
          <FolderOpen size={16} />
        </Button>
        <Button onClick={handleSave}>
          <Check size={16} />
        </Button>
        <Button onClick={handleCancel}>
          <X size={16} />
        </Button>
      </>
    ) : (
      // View mode
    )}
  )
}
```

### IPC Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Renderer   │         │   Preload    │         │     Main     │
│   Process    │         │   Script     │         │   Process    │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │ selectDirectory()      │                        │
       │───────────────────────>│                        │
       │                        │                        │
       │                        │ invoke('select-       │
       │                        │  directory')           │
       │                        │───────────────────────>│
       │                        │                        │
       │                        │                        │ dialog.
       │                        │                        │ showOpenDialog()
       │                        │                        │────┐
       │                        │                        │    │
       │                        │                        │<───┘
       │                        │                        │
       │                        │<───────────────────────│
       │                        │ { path: "/selected" } │
       │<───────────────────────│                        │
       │ { path: "/selected" } │                        │
       │                        │                        │
```

### Security Considerations

1. **Whitelist Validation**: IPC channel in preload whitelist
2. **User Initiated**: Only works when user clicks button
3. **Native Dialog**: Uses OS security model
4. **No Auto-Access**: Requires explicit user selection

## Browser Comparison

### Desktop App (Electron)
✅ Native directory picker
✅ Full file system access
✅ OS-level security
✅ Visual browsing

### Web App (Browser)
❌ No native directory picker
❌ Limited file system access
❌ Security restrictions
⚠️ Manual entry only

## Accessibility

- **Keyboard Navigation**: All buttons accessible via Tab key
- **Screen Readers**: Proper ARIA labels and titles
- **Visual Indicators**: Clear button icons and hover states
- **Error Feedback**: Toast notifications for errors

## Testing Coverage

### Unit Tests
✅ Browse button appears in edit mode
✅ Directory picker opens on click
✅ Selected path updates input
✅ Manual editing still works
✅ Save/Cancel functionality

### Integration Tests
✅ IPC communication works
✅ Dialog returns correct path
✅ Error handling works
✅ UI updates correctly

### Manual Testing
✅ Visual directory browsing
✅ Path selection
✅ File operations
✅ Error scenarios
