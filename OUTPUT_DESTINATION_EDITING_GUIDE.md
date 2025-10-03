# Output Destination Editing - User Guide

## Overview

The Output Destination field in the Configuration Panel now allows you to edit and update where your app files are stored. This guide explains how to use this feature effectively.

## Accessing the Feature

### Desktop App

1. Open your app in Dyad
2. Navigate to the **Configure** tab
3. Scroll to the **Output Destination** section

### Web App

1. Open your app in Dyad Web
2. Navigate to the app details or configuration section
3. Look for the **Output Destination** component

## How to Edit the Output Destination

### Step-by-Step Guide

#### 1. View Current Path

The current output destination is displayed in a read-only field:

```
Output Destination:
[/path/to/current/app] [✏️] [📁]
```

- The path shows where your app files are currently stored
- Click the folder icon (📁) to open the location in your file manager (desktop only)

#### 2. Enable Editing

Click the **Edit** button (✏️) to enable editing mode:

```
Output Destination:
[/path/to/new/location___] [✓] [✗]
```

- The path becomes editable
- Two new buttons appear: Save (✓) and Cancel (✗)

#### 3. Enter New Path

Type the new path where you want your app files to be located:

- Use absolute paths (e.g., `/Users/username/Projects/my-app`)
- On Windows: `C:\Users\username\Projects\my-app`
- On macOS/Linux: `/Users/username/Projects/my-app` or `~/Projects/my-app`

#### 4. Save or Cancel

- **Save (✓)**: Click to apply the changes
  - Desktop: Files will be moved to the new location
  - Web: Database will be updated with the new path
- **Cancel (✗)**: Click to discard changes and exit editing mode

## What Happens When You Save

### Desktop App

1. ✅ **Validation**: System checks if the path is valid and not in use
2. ✅ **File Movement**: All app files are copied to the new location
3. ✅ **Git Preservation**: Your .git directory and history are preserved
4. ✅ **Database Update**: App record is updated with the new path
5. ✅ **Old Directory Cleanup**: Previous location is removed (if possible)
6. ✅ **Confirmation**: Success message is displayed

### Web App

1. ✅ **Validation**: Server checks if the path is valid and not in use
2. ✅ **Database Update**: App record is updated with the new path
3. ✅ **Confirmation**: Success message is displayed

⚠️ **Note**: Web app does not move files - it only updates the database path.

## Important Considerations

### Path Requirements

- ✅ Must be an absolute path
- ✅ Must not conflict with existing app paths
- ✅ Parent directory must exist (or be creatable)
- ✅ Must have write permissions

### Git Integration

Your Git repository is automatically preserved:
- ✅ The `.git` directory moves with your files
- ✅ Remote URLs and configurations are maintained
- ✅ Commit history remains intact
- ✅ No need to reinitialize Git

### When Files Might Not Move (Desktop)

The desktop app attempts to remove the old directory after moving files. However, this may fail if:
- Files are locked by another process
- You don't have deletion permissions
- The directory is in use

**This is not critical** - your files are safely in the new location, and you can manually delete the old directory if needed.

## Error Handling

### Common Errors

#### "An app with the path 'X' already exists"
- **Cause**: Another app is already using that path
- **Solution**: Choose a different path or remove the conflicting app

#### "Failed to move app files"
- **Cause**: File system error during move operation
- **Solution**: Check permissions and disk space, try again

#### "Destination path already exists"
- **Cause**: A directory already exists at the new path
- **Solution**: Choose a different path or remove the existing directory

### Rollback

If an error occurs during the save operation:
- Desktop: The system attempts to rollback file changes
- Web: No files are moved, only database is affected
- Your original path is preserved

## Best Practices

### 1. Choose Organized Paths

Keep your apps organized with a clear structure:
```
~/Projects/
  ├── personal/
  │   ├── blog-app/
  │   └── portfolio/
  └── work/
      ├── client-project/
      └── internal-tool/
```

### 2. Use Version Control

Always commit your changes before moving:
```bash
git add .
git commit -m "Save before moving project"
```

### 3. Backup Important Work

For critical projects, create a backup before moving:
```bash
cp -r /old/path /backup/location
```

### 4. Test After Moving

After updating the path, verify everything works:
- Run your app to ensure it starts correctly
- Check that all dependencies are still accessible
- Verify Git operations still work

## Troubleshooting

### App Won't Start After Move

1. Check if all files were moved successfully
2. Verify dependencies are installed (`npm install`, etc.)
3. Check environment variables and configuration files
4. Restart the app

### Old Directory Still Exists

This is normal on some systems (especially Windows):
1. Close all apps that might be accessing the directory
2. Manually delete the old directory
3. Empty your recycle bin/trash

### Web App Path Update Doesn't Reflect

1. Refresh the page
2. Check browser console for errors
3. Verify the HTTP API is running
4. Check network requests in browser DevTools

## Examples

### Example 1: Reorganizing Projects

**Current Path:** `/Users/john/Desktop/my-app`  
**New Path:** `/Users/john/Projects/apps/my-app`

1. Click Edit (✏️)
2. Enter: `/Users/john/Projects/apps/my-app`
3. Click Save (✓)
4. Files are moved and database is updated
5. Success! App is now organized under Projects

### Example 2: Moving to External Drive

**Current Path:** `/Users/jane/Documents/large-project`  
**New Path:** `/Volumes/ExternalHD/Projects/large-project`

1. Ensure external drive is mounted
2. Click Edit (✏️)
3. Enter: `/Volumes/ExternalHD/Projects/large-project`
4. Click Save (✓)
5. Wait for files to transfer (may take time for large projects)
6. Success! Project is now on external drive

## FAQ

**Q: Can I undo a path change?**  
A: Yes, just edit the path again and set it back to the original location. However, you'll need to manually move files back if using the desktop app.

**Q: Will this break my Git repository?**  
A: No, the .git directory moves with your files, preserving all history and configuration.

**Q: Can I use relative paths?**  
A: No, you must use absolute paths for clarity and consistency.

**Q: Does this work with symbolic links?**  
A: Symbolic links are followed during the move operation.

**Q: What about large projects?**  
A: Large projects may take time to move. The UI will show a loading state during the operation.

**Q: Can I change multiple app paths at once?**  
A: Currently, no. You must update each app individually.

## Support

If you encounter issues:
1. Check the error message for specific guidance
2. Review the console logs for details
3. Ensure you have necessary file system permissions
4. Report bugs on GitHub with error details
