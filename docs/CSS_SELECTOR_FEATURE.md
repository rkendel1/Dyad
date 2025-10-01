# CSS Selector Feature

This document describes the new CSS selector feature that allows users to capture CSS selectors from any website element within Dyad's preview panel.

## Overview

The CSS selector feature enables users to:

1. Select any element on a website displayed in Dyad's preview panel
2. Automatically generate an optimal CSS selector for that element
3. Copy the selector to clipboard or insert it directly into the chat
4. Use the captured selectors for styling, automation, or web scraping tasks

## How to Use

### Activating CSS Selector Mode

1. **Button Method**: Click the CSS selector button (code icon, green color) in the preview panel toolbar
2. **Keyboard Shortcut**: Press `Ctrl + Shift + S` (Windows/Linux) or `⌘ + Shift + S` (Mac)

### Selecting Elements

1. Once CSS selector mode is active, hover over any element in the preview
2. Elements will be highlighted with a green border
3. The generated CSS selector will be displayed in a tooltip
4. Click on the desired element to capture its selector

### Using Captured Selectors

After capturing a selector, you'll see a green panel with two options:

1. **Copy to Clipboard**: Click the copy button to copy the selector for use elsewhere
2. **Insert to Chat**: Click the message button to automatically insert the selector into the current chat

### Deactivating CSS Selector Mode

- Click the CSS selector button again
- Press the `Escape` key while in selector mode
- Activate the component selector (they are mutually exclusive)

## CSS Selector Generation Logic

The feature uses intelligent logic to generate optimal CSS selectors:

### Priority Order:

1. **ID Selector**: `#unique-id` (highest priority if element has an ID)
2. **Class Selector**: `.class1.class2` (if classes are unique)
3. **Path Selector**: `div.container > p.text > span:nth-child(2)` (fallback with full path)

### Features:

- Handles multiple classes correctly
- Uses nth-child selectors when needed to ensure uniqueness
- Excludes internal Dyad classes (prefixed with `__dyad`)
- Generates human-readable, maintainable selectors

## Examples

### Element with ID

```html
<h1 id="main-title">Welcome</h1>
```

**Generated Selector**: `#main-title`

### Element with Classes

```html
<div class="card featured">Content</div>
```

**Generated Selector**: `.card.featured` (if unique)

### Nested Element

```html
<div class="container">
  <ul class="nav-list">
    <li>Item 1</li>
    <li>Item 2</li>
    <!-- Selecting this -->
  </ul>
</div>
```

**Generated Selector**: `div.container > ul.nav-list > li:nth-child(2)`

## Visual Indicators

- **Green Border**: Indicates element being hovered (CSS selector mode)
- **Green Overlay**: Shows the captured element
- **Green Button**: CSS selector mode is active
- **Green Panel**: Displays captured selector with action buttons

## Integration with Existing Features

- **Mutually Exclusive**: Only one selector mode (component or CSS) can be active at a time
- **Chat Integration**: Captured selectors can be directly inserted into AI conversations
- **Keyboard Shortcuts**: Works alongside existing Dyad keyboard shortcuts
- **Toast Notifications**: Provides feedback for copy and insert actions

## Technical Implementation

### Files Modified/Created:

- `worker/dyad-css-selector-client.js` - Client-side selector logic
- `worker/proxy_server.js` - Injects CSS selector client into iframes
- `src/components/preview_panel/PreviewIframe.tsx` - UI and state management

### Message Types:

- `dyad-css-selector-initialized` - Client initialization complete
- `dyad-css-selector-selected` - Element selected with selector data
- `dyad-css-selector-cancelled` - Selection cancelled
- `activate-dyad-css-selector` - Activate selector mode
- `deactivate-dyad-css-selector` - Deactivate selector mode

## Use Cases

1. **Web Scraping**: Generate selectors for automated data extraction
2. **UI Testing**: Create selectors for automated testing frameworks
3. **Custom Styling**: Target specific elements for CSS modifications
4. **Web Development**: Quickly identify element selectors for development
5. **Documentation**: Document element structures and selectors

## Limitations

- Only works with elements in the preview iframe
- Requires JavaScript to be enabled in the preview
- Selectors are generated based on current DOM state
- Dynamic content may require regeneration of selectors

## Troubleshooting

### CSS Selector Button Not Working

- Ensure an app is loaded in the preview
- Check that the preview iframe has loaded completely
- Verify JavaScript is enabled

### Generated Selectors Not Unique

- The logic prioritizes readability over uniqueness in some cases
- Test selectors in browser dev tools to verify they target the correct element
- Complex dynamic pages may require manual selector refinement

### No Response When Clicking Elements

- Ensure CSS selector mode is active (green button)
- Check browser console for any JavaScript errors
- Try refreshing the preview panel
