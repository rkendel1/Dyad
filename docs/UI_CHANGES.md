# UI Changes for API Key Management & Token Usage

## Overview
This document describes the UI changes made to support multi-API key management and enhanced token usage features.

## 1. API Key Configuration Page

### Active Key Display
When you navigate to Settings → AI Models → [Provider], you'll see:

```
┌────────────────────────────────────────────────┐
│  ✓ Active API Key                              │
│                                                │
│  Personal Key                                  │
│  sk-pr...4XYZ                                  │
│  Source: Managed Keys                          │
└────────────────────────────────────────────────┘
```

### Manage API Keys Section
Below the active key display, you'll find the key management interface:

```
┌────────────────────────────────────────────────┐
│  Manage API Keys                        [v]    │
│                                                │
│  API Keys                         [+ Add Key]  │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Personal Key              [Active]       │ │
│  │  sk-pr...4XYZ                             │ │
│  │                          [✓ Activate] [🗑] │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Work Account                             │ │
│  │  sk-wo...8ABC                             │ │
│  │                          [✓ Activate] [🗑] │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### Adding a New Key
When you click "Add Key", a form appears:

```
┌────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────┐ │
│  │  Key name (e.g., 'Personal', 'Work')     │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  ••••••••••••••••••••••                  │ │ (password field)
│  └──────────────────────────────────────────┘ │
│                                                │
│  [Save Key]  [Cancel]                          │
└────────────────────────────────────────────────┘
```

### Legacy Key Display
If you have a legacy key (from before the multi-key feature), it's shown separately:

```
┌────────────────────────────────────────────────┐
│  Legacy Key (Settings)                  [Delete]│
│                                                │
│  sk-leg...5OLD                                 │
│  ⚠️ This is a legacy key. Consider migrating   │
│  to managed keys above.                        │
└────────────────────────────────────────────────┘
```

### Environment Variable Key
Environment keys are shown in a separate section:

```
┌────────────────────────────────────────────────┐
│  API Key from Environment Variable      [v]    │
│                                                │
│  Environment Variable Key (OPENAI_API_KEY)     │
│  sk-en...9ENV                                  │
│  ℹ️ This key is available but not active       │
│  (overridden by managed key).                  │
│                                                │
│  This key is set outside the application...    │
└────────────────────────────────────────────────┘
```

## 2. Token Bar Enhancements

### Token Bar with Help Icon
The token bar at the bottom of the chat now includes a help icon:

```
┌────────────────────────────────────────────────┐
│  Tokens: 45,231    [?]         89% of 128K     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
└────────────────────────────────────────────────┘
```

### Hover Tooltip (Enhanced)
When you hover over the token bar, you see:

```
┌────────────────────────────────────────────────┐
│  Token Usage Breakdown              [?]        │
│                                                │
│  💬 Message History         15,420             │
│  📄 Codebase               25,800             │
│  🔗 Mentioned Apps          1,200             │
│  🤖 System Prompt           1,811             │
│  ✏️  Current Input          1,000             │
│  ────────────────────────────────────────────  │
│  Total                     45,231             │
│                                                │
│  Note: Token usage is calculated per chat      │
│  session, not cumulatively.                    │
│                                                │
│  To reduce usage: start a new chat, clear      │
│  history, minimize codebase context, or        │
│  reduce message history.                       │
└────────────────────────────────────────────────┘
```

### High Usage Warning
When token usage exceeds 80%, a warning appears:

```
┌────────────────────────────────────────────────┐
│  Tokens: 104,857   [?]         82% of 128K     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                │
│  ⚠️ Token usage is high (82%). Consider:       │
│  clearing chat history, starting a new chat,   │
│  or reducing codebase context.                 │
│                           [Clear Chat History] │
└────────────────────────────────────────────────┘
```

## 3. Key Features

### Hot Swapping
- Switch between API keys without restarting the app
- Changes take effect immediately on the next API request
- Visual feedback shows which key is active

### Security
- All keys are encrypted using Electron's safeStorage
- Keys are masked in the UI (showing only first/last 4 characters)
- Never logged or exposed in error messages

### Migration
- Legacy single keys are automatically migrated to multi-key format
- Migration happens transparently on first load
- No data loss or user action required

### Priority System
The system uses keys in this priority order:
1. **Managed Keys** (multi-key with active flag)
2. **Legacy Settings Key** (single key from old system)
3. **Environment Variable** (system-level configuration)

## 4. User Workflows

### Switching Between Free and Paid Keys
1. Navigate to Settings → AI Models → OpenAI
2. See all configured keys in "Manage API Keys"
3. Click "Activate" next to the desired key
4. The change is immediate - next AI request uses the new key

### Adding a Work Key
1. Click "Add Key" in the Manage API Keys section
2. Enter name: "Work Account"
3. Paste the API key
4. Click "Save Key"
5. Optionally activate it immediately

### Reducing Token Usage
1. Notice high token usage in the token bar (>80%)
2. Click "Clear Chat History" in the warning
3. Or start a new chat from the header
4. Or adjust codebase context in settings

## 5. Visual Design Principles

- **Clear hierarchy**: Active key is prominently displayed at the top
- **Color coding**: 
  - Green: Active/successful states
  - Yellow: Warnings and deprecated features
  - Red: Delete actions
  - Blue: Help and information
- **Progressive disclosure**: Advanced options are collapsed by default
- **Immediate feedback**: All actions provide instant visual confirmation
- **Accessibility**: Keyboard navigation supported, clear labels, appropriate contrast

## 6. Implementation Notes

### Components Added/Modified
1. `ApiKeyManager.tsx` - New component for managing multiple keys
2. `ApiKeyConfiguration.tsx` - Enhanced to show active key and integrate manager
3. `TokenBar.tsx` - Enhanced with help tooltip and warnings
4. `ProviderSettingsPage.tsx` - Updated with multi-key handlers

### Utility Functions
1. `getActiveApiKey()` - Determines which key to use
2. `getAllApiKeys()` - Retrieves all keys for a provider
3. `maskApiKey()` - Masks keys for display
4. `migrateLegacyApiKeys()` - Handles automatic migration

### State Management
- Multi-keys stored in `settings.providerSettings[provider].apiKeys[]`
- Each key has: id, name, secret, isActive flag, createdAt timestamp
- Legacy keys remain in `settings.providerSettings[provider].apiKey` for backward compatibility
