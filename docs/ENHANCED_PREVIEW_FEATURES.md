# Enhanced Preview Features Guide

This document describes the new preview features added to improve usability and developer workflow, especially for multi-plane surface applications.

## Overview

The preview panel has been enhanced with several practical features to improve the developer experience:

1. **Preview Size Presets** - Test responsive layouts at common device sizes
2. **Screenshot Capability** - Capture and share preview states
3. **Preview History** - Quick navigation to recent URLs
4. **Quick Launch Menu** - Fast access to common operations
5. **Keyboard Shortcuts** - Productivity shortcuts and guide

## Features

### 1. Preview Size Presets

Quickly resize the preview to test your application at common device sizes.

#### Available Presets:
- **Mobile (375x667)** - iPhone SE/8
- **Mobile L (414x896)** - iPhone XR/11
- **Tablet (768x1024)** - iPad
- **Desktop (1366x768)** - Common laptop
- **Desktop L (1920x1080)** - Full HD display
- **Full Size** - Use full available space

#### How to Use:
1. Click the **Size** button (📐 icon) in the preview toolbar
2. Select a preset from the dropdown menu
3. The preview iframe will resize to match the selected dimensions
4. The iframe will be centered with scrollbars if needed
5. Select "Full Size" to return to normal mode

#### Benefits:
- Test responsive designs without resizing your browser window
- Quickly switch between mobile, tablet, and desktop views
- Ensure your app works correctly at different breakpoints
- Perfect for multi-plane surface applications that adapt to different screen sizes

### 2. Screenshot Capability

Capture the current state of your preview for documentation or sharing.

#### Features:
- Attempts to copy screenshot to clipboard (when supported)
- Falls back to downloading as PNG file
- Toast notifications for user feedback
- File naming: `preview-{appId}-{timestamp}.png`

#### How to Use:
1. Click the **Camera** button (📷 icon) in the preview toolbar
2. If clipboard is supported, the screenshot will be copied
3. Otherwise, a PNG file will be downloaded
4. You'll see a success/error toast notification

#### Use Cases:
- Document issues or bugs
- Share design progress with team members
- Create documentation screenshots
- Capture specific states for reference

### 3. Preview History

Track and quickly navigate to recently visited URLs in your preview.

#### Features:
- Stores last 20 URLs per app
- Shows timestamp for each visit (e.g., "5m ago", "2h ago")
- Automatically tracks navigation
- Clear history option

#### How to Use:
1. Click the **History** button (🕐 icon) in the preview toolbar
2. Browse recent URLs for the current app
3. Click any URL to navigate back to it
4. Use "Clear history" to remove all entries

#### Storage:
- History is stored in application state (Jotai atoms)
- Persists during the session
- Cleared when app restarts or manually cleared

### 4. Quick Launch Menu

Fast access to common preview operations in one convenient menu.

#### Available Actions:

**Preview Actions:**
- **Refresh Preview** - Reload the current preview
- **Restart App** - Restart the dev server
- **Clean Restart** - Restart and remove node_modules (fresh start)

**Open In:**
- **External Window** - Open in separate preview window with selectors
- **Default Browser** - Open in your system browser

#### How to Use:
1. Click the **Lightning** button (⚡ icon) in the preview toolbar
2. Select the desired action from the menu
3. The action will be executed immediately

#### Benefits:
- Single click access to common operations
- No need to remember multiple button locations
- Organized by category for easy navigation

### 5. Keyboard Shortcuts Guide

Learn and reference keyboard shortcuts for faster workflow.

#### How to Access:
1. Click the **Keyboard** button (⌨️ icon) in the preview toolbar
2. A dialog will open showing all available shortcuts
3. Shortcuts are organized by category

#### Available Shortcuts:

**Selection:**
- `⌘/Ctrl + ⇧ + C` - Toggle component selector

**Navigation:**
- `⌘/Ctrl + ⇧ + E` - Open in external window
- `⌘/Ctrl + R` - Refresh preview

**General:**
- `Esc` - Cancel URL edit or deselect component

## Multi-Plane Surface Support

These features are particularly useful for multi-plane surface applications:

### Responsive Testing
The size presets allow you to quickly test how your application adapts to different screen sizes and orientations, which is essential for applications that run on multiple devices or display surfaces.

### State Capture
Screenshots help document how your application looks at different sizes and states, making it easier to review multi-plane layouts.

### Navigation History
When testing complex multi-plane workflows, the history feature helps you quickly return to specific states or views you've already tested.

### Quick Actions
The quick launch menu consolidates common development tasks, making it faster to iterate on multi-plane layouts and test different configurations.

## Technical Implementation

### Components Created:

1. **PreviewSizePresets.tsx** - Size preset dropdown
2. **PreviewScreenshotButton.tsx** - Screenshot capture
3. **PreviewHistoryMenu.tsx** - History dropdown
4. **PreviewQuickLaunch.tsx** - Quick action menu
5. **PreviewKeyboardShortcuts.tsx** - Keyboard shortcuts dialog

### State Management:

1. **previewHistoryAtoms.ts** - Jotai atoms for history tracking
   - `previewHistoryAtom` - Stores history items
   - `addToPreviewHistoryAtom` - Add item to history
   - `clearPreviewHistoryAtom` - Clear all history

### Integration:

All features are integrated into the existing `PreviewIframe.tsx` component, which maintains backward compatibility while adding the new functionality.

## Future Enhancements

Potential future additions:

1. **Custom Size Presets** - Allow users to save their own custom sizes
2. **Screenshot Annotations** - Add ability to annotate screenshots before saving
3. **History Search** - Search through preview history
4. **Preview Themes** - Test with different theme presets
5. **Performance Metrics** - Show load times and performance data
6. **Multi-Preview** - View multiple sizes simultaneously

## Tips

- Use size presets when testing responsive designs
- Take screenshots before and after making changes
- Use history to quickly test regressions
- Learn keyboard shortcuts to speed up your workflow
- Use the quick launch menu for common restart operations

## Support

If you encounter any issues with these features:

1. Check that your preview is running (URL is loaded)
2. Ensure you have an app selected
3. Try refreshing the preview
4. Check the browser console for errors

For issues specific to screenshots:
- Some browsers may not support clipboard API
- File download fallback should work in all browsers
- Check browser permissions for clipboard access
