# API Key Management

## Overview

Dyad supports multiple API key management strategies, allowing you to store and switch between multiple keys for each AI provider while the app is running.

## Key Storage Options

Dyad supports three ways to configure API keys (in order of priority):

### 1. Managed Keys (Recommended)
- Store multiple named keys per provider
- Switch between keys without restarting
- Keys are encrypted using your system's secure storage
- Set one key as active at a time

### 2. Legacy Settings Key
- Single key stored in settings (older method)
- Still supported for backward compatibility
- Consider migrating to Managed Keys

### 3. Environment Variables
- Set keys outside the application
- Used only if no managed or settings keys are configured
- Requires app restart to detect changes

## Managing Multiple API Keys

### Adding a New Key

1. Go to **Settings → AI Models**
2. Select your provider (e.g., OpenAI, Anthropic)
3. Click **"Manage API Keys"** section
4. Click **"Add Key"**
5. Enter a name (e.g., "Personal", "Work", "Free Tier")
6. Paste your API key
7. Click **"Save Key"**

The first key you add is automatically set as active.

### Switching Between Keys

1. Navigate to your provider's settings page
2. In the **"Manage API Keys"** section, you'll see all your keys
3. Click **"Activate"** next to the key you want to use
4. The change takes effect immediately - no restart needed

### Deleting a Key

1. Find the key in the **"Manage API Keys"** section
2. Click the trash icon next to the key
3. Note: You cannot delete the currently active key
4. Switch to a different key first, then delete

## Active Key Display

The settings page clearly shows which key is currently active:

- **Green badge** - Indicates the active key
- **Active Key alert** - Displays at the top showing:
  - Key name (for managed keys)
  - Masked key value
  - Source (Managed Keys, Legacy, or Environment Variable)

## Environment Variables

To use environment variables:

1. Set the appropriate variable for your provider:
   - OpenAI: `OPENAI_API_KEY`
   - Anthropic: `ANTHROPIC_API_KEY`
   - Google: `GOOGLE_GENERATIVE_AI_API_KEY`
   - etc.

2. Restart the application
3. The key will be used if no managed or settings keys exist

## Security

- All keys are encrypted using Electron's safeStorage
- Keys are stored securely in your user data directory
- Masked display in the UI (shows first 4 and last 4 characters)
- Keys are never logged or exposed in error messages

## Use Cases

### Multiple Accounts
Store separate keys for:
- Personal projects
- Work projects
- Different billing accounts

### Free vs Paid Tiers
Easily switch between:
- Free tier keys (with rate limits)
- Paid API keys (higher limits)
- Different tier levels

### Testing and Development
- Production key
- Staging key  
- Development/testing key

## Hot Swapping Keys

You can switch API keys while the app is running:

1. No restart required
2. Next AI request uses the new active key
3. Current chat continues with new key
4. Useful for:
   - Avoiding rate limits
   - Switching billing accounts
   - Testing different keys

## Troubleshooting

### Key Not Working
1. Verify the key is valid in your provider's dashboard
2. Check that the key has appropriate permissions
3. Ensure you've activated the correct key
4. Try adding it as a new managed key

### Environment Key Not Detected
1. Verify the environment variable is set correctly
2. Restart the application
3. Check that no managed or settings keys override it

### Cannot Delete Active Key
1. Switch to a different key first
2. Then delete the unwanted key
3. Or add a new key before deleting

## Migration Guide

### From Environment Variables to Managed Keys

1. Copy your environment variable value
2. Add it as a managed key with a descriptive name
3. The managed key will take priority automatically
4. You can remove the environment variable if desired

### From Legacy Settings Key to Managed Keys

1. Your legacy key will still work
2. Add new keys via the Managed Keys section
3. Activate a managed key to switch
4. The legacy key remains as backup
5. You can delete it once migrated

## Best Practices

1. **Use descriptive names** - "Work Account", "Personal Free Tier", etc.
2. **Keep backup keys** - Store at least 2 keys for important providers
3. **Rotate keys regularly** - For security, refresh keys periodically
4. **Document key purpose** - Note which key is for what in the name
5. **Test new keys** - Verify keys work before deleting old ones

## FAQs

**Q: Can I use different keys for different chats?**
A: Yes, switch the active key and all new requests will use it.

**Q: What happens to in-progress chats when I switch keys?**
A: The next message will use the new key. Previous messages are unaffected.

**Q: Are my keys synced across devices?**
A: No, keys are stored locally and encrypted per device.

**Q: How many keys can I store per provider?**
A: There's no hard limit, but we recommend 2-5 keys per provider for clarity.

**Q: Can I export my keys?**
A: For security, keys cannot be exported. You'll need to re-add them on new devices.
