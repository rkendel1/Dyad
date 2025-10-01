# External Preview Feature

This document describes the external preview window feature that allows users to open Dyad's preview in a standalone window with enhanced capabilities.

## Overview

The external preview feature enables users to:

1. Open the app preview in a dedicated, resizable window
2. Access both Dyad component selector and CSS selector in the external window
3. Use keyboard shortcuts within the external window
4. Copy selectors to clipboard with enhanced UI
5. Have a full web browser experience without the constraints of the embedded preview panel

## How to Use

### Opening External Preview

1. **Button Method**: Click the external preview button (square icon) in the preview panel toolbar
2. **Keyboard Shortcut**: Press `Ctrl + Shift + E` (Windows/Linux) or `⌘ + Shift + E` (Mac)

### External Preview Window Features

The external preview window includes:

#### Toolbar

- **Component Selector Button** (📦): Activate Dyad component selection mode
- **CSS Selector Button** (🎯): Activate CSS element selection mode
- **URL Display**: Shows the current preview URL
- **Refresh Button** (🔄): Reload the preview

#### Keyboard Shortcuts

- `Ctrl + Shift + C` / `⌘ + Shift + C`: Toggle component selector
- `Ctrl + Shift + S` / `⌘ + Shift + S`: Toggle CSS selector
- `Escape`: Deactivate current selector and close selector panel

#### Selector Panel

When an element is selected, a floating panel appears with:

- **Selector Value**: The captured component ID or CSS selector
- **Copy Button** (📋): Copy selector to clipboard with visual feedback
- **Close Button** (✕): Close the selector panel

#### Status Indicators

- **Loading Indicator**: Shows when the preview is loading
- **Status Messages**: Provides feedback on selector actions
- **Visual Feedback**: Animations and color coding for better UX

## Advantages Over Embedded Preview

### Enhanced User Experience

- **Larger View**: Dedicated window can be resized for optimal viewing
- **Multi-monitor Support**: Move preview to secondary monitor while working on code
- **Full Browser Features**: Native scroll, zoom, and navigation behavior
- **Better Accessibility**: Larger targets and clearer visual feedback

### Workflow Benefits

- **Side-by-side Development**: Keep preview open while editing code
- **Persistent Selectors**: Selector panel stays visible until dismissed
- **Better Error Handling**: Clear feedback when selectors can't be injected
- **Keyboard Navigation**: Full keyboard support for power users

## Technical Implementation

### Selector Injection

The external preview window automatically injects the same selector scripts used in the embedded preview:

- `dyad-component-selector-client.js`: For Dyad component selection
- `dyad-css-selector-client.js`: For CSS element selection

### Cross-Origin Considerations

- The window attempts to inject selector scripts when the iframe loads
- If CORS restrictions prevent injection, appropriate error messages are shown
- Fallback behavior ensures the window remains functional even without selectors

### Message Passing

The external window communicates with injected scripts using the same message protocol as the embedded preview, ensuring consistent behavior.

## Troubleshooting

### Selectors Not Working

If the component or CSS selectors don't respond:

1. Check if the app URL is accessible
2. Refresh the preview using the refresh button
3. Some third-party sites may block script injection due to security policies

### Window Not Opening

If the external preview window doesn't appear:

1. Check if popup blockers are interfering
2. Ensure the app URL is valid and accessible
3. Check the console for any JavaScript errors

### Performance Considerations

- The external window runs independently of the main Dyad application
- Memory usage is minimal as it only loads the preview HTML and scripts
- Multiple external windows can be opened for different apps simultaneously

## Integration with Dyad Workflow

### Component Selection

When using the component selector in the external window:

1. Selected components are captured with the same format as the embedded preview
2. Component IDs include file path, line, and column information
3. Selectors can be copied and pasted into Dyad's text input for requesting changes

### CSS Selection

When using the CSS selector in the external window:

1. CSS selectors are generated using the same intelligent algorithm
2. Selectors prioritize ID, then class, then path-based selection
3. Generated selectors are optimized for reliability and brevity

### Copy and Paste Workflow

1. Open external preview window
2. Activate desired selector (component or CSS)
3. Click on target element
4. Copy selector from the panel
5. Paste into Dyad's chat input for AI-powered modifications

This creates an efficient workflow for requesting specific changes to UI elements using natural language combined with precise selectors.
