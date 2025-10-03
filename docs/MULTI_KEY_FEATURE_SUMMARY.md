# Multi-API Key Management & Token Usage Enhancement - Implementation Summary

## Summary

This PR implements comprehensive multi-API key management and token usage enhancement features for Dyad, allowing users to:
- Store and manage multiple API keys per provider
- Hot-swap between keys without restarting the app
- View detailed token usage breakdowns with helpful documentation
- Clear chat history to reduce token usage
- Get warnings when approaching context limits

## Features Implemented

### 1. Multi-API Key Storage & Management

#### Schema Updates
- Extended `RegularProviderSettingSchema` to support `apiKeys` array
- Added `ApiKeyWithMetadataSchema` with fields:
  - `id`: Unique identifier
  - `name`: User-friendly name (e.g., "Personal", "Work")
  - `secret`: Encrypted API key value
  - `isActive`: Boolean flag indicating the active key
  - `createdAt`: Timestamp for key creation

#### Key Management UI
- **ApiKeyManager Component**: Full CRUD interface for managing multiple keys
  - Add new keys with custom names
  - Delete inactive keys
  - Activate/switch between keys
  - Visual indication of active key

- **Active Key Display**: Shows which key is currently in use
  - Key name (for managed keys)
  - Masked key value (first 4 + last 4 characters)
  - Source indicator (Managed Keys, Legacy Settings, or Environment Variable)

#### Key Priority System
1. **Managed Keys** (highest priority): Multi-key system with active flag
2. **Legacy Settings Key**: Single key from old system (backward compatible)
3. **Environment Variable** (lowest priority): System-level configuration

### 2. Hot-Swapping API Keys

Users can now switch API keys while the app is running:
- No restart required
- Next AI request uses the new active key
- Useful for:
  - Switching between free/paid tiers
  - Avoiding rate limits
  - Changing billing accounts
  - Testing different keys

### 3. Automatic Key Migration

Legacy single keys are automatically migrated to the new multi-key format:
- Migration happens transparently on settings load
- No data loss or user action required
- Legacy key preserved for backward compatibility
- Migrated key becomes the active key

### 4. Token Usage Enhancements

#### Enhanced Token Bar
- **Help Icon**: Links to comprehensive token usage documentation
- **Detailed Tooltip**: Shows breakdown of token usage:
  - Message History (blue)
  - Codebase (green)
  - Mentioned Apps (orange)
  - System Prompt (purple)
  - Current Input (yellow)

#### Token Usage Documentation
- Explains per-session (not cumulative) calculation
- Strategies to reduce usage:
  - Start new chat
  - Clear chat history
  - Minimize codebase context
  - Reduce message history
  - Limit app mentions
  - Use Dyad Pro Smart Context

#### High Usage Warnings
- Alert appears when usage exceeds 80% of context window
- Provides actionable suggestions
- Quick "clear chat history" button

#### Clear Chat History
- One-click button to reset token usage
- Removes all messages from current chat
- Helps users stay within token limits

### 5. Utility Functions & API

#### `api-key-utils.ts`
```typescript
// Get the active API key (handles priority logic)
getActiveApiKey(provider, settings, envVars, envVarName): ActiveKeyInfo | null

// Get all API keys for a provider
getAllApiKeys(provider, settings): ApiKeyWithMetadata[]

// Mask API key for display
maskApiKey(key): string
```

#### `migrate-api-keys.ts`
```typescript
// Automatically migrate legacy keys to multi-key format
migrateLegacyApiKeys(settings): UserSettings
```

### 6. Integration with AI Providers

Updated these files to use the new key system:
- `src/ipc/utils/get_model_client.ts` - Language model initialization
- `src/ipc/handlers/help_bot_handlers.ts` - Help chat feature
- `src/main/settings.ts` - Settings encryption/decryption

## Files Changed

### New Files
- `src/lib/api-key-utils.ts` - API key utility functions
- `src/lib/migrate-api-keys.ts` - Legacy key migration
- `src/components/settings/ApiKeyManager.tsx` - Key management UI
- `src/lib/__tests__/api-key-utils.test.ts` - Comprehensive unit tests
- `docs/API_KEY_MANAGEMENT.md` - User documentation for key management
- `docs/TOKEN_USAGE.md` - User documentation for token usage
- `docs/UI_CHANGES.md` - Visual documentation of UI changes
- `docs/MULTI_KEY_FEATURE_SUMMARY.md` - This file

### Modified Files
- `src/lib/schemas.ts` - Added multi-key schema definitions
- `src/components/settings/ApiKeyConfiguration.tsx` - Enhanced with multi-key UI
- `src/components/settings/ProviderSettingsPage.tsx` - Added multi-key handlers
- `src/components/chat/TokenBar.tsx` - Enhanced with help tooltip and warnings
- `src/main/settings.ts` - Added multi-key encryption/decryption and migration
- `src/ipc/utils/get_model_client.ts` - Use new key retrieval function
- `src/ipc/handlers/help_bot_handlers.ts` - Use new key retrieval function

## Testing

### Unit Tests
Added comprehensive test suite for API key utilities:
- ✅ Active key selection with multi-keys
- ✅ Legacy key fallback
- ✅ Environment variable fallback
- ✅ Priority ordering (multi-key > legacy > env)
- ✅ Get all keys for a provider
- ✅ Key masking for display

All tests passing: **9/9** ✓

## Security Considerations

1. **Encryption**: All API keys are encrypted using Electron's `safeStorage`
2. **Display**: Keys are masked in UI (only first 4 and last 4 characters shown)
3. **Logging**: Keys are never logged or exposed in error messages
4. **Storage**: Keys stored in encrypted user settings file
5. **Migration**: Encryption is preserved during migration

## Backward Compatibility

- ✅ Existing single keys continue to work
- ✅ Legacy keys are automatically migrated to multi-key format
- ✅ Old settings structure is preserved alongside new multi-key structure
- ✅ Environment variables still work as fallback
- ✅ No breaking changes to existing APIs

## Documentation

### User Documentation
1. **API_KEY_MANAGEMENT.md**: Complete guide to managing multiple API keys
2. **TOKEN_USAGE.md**: Comprehensive token usage guide
3. **UI_CHANGES.md**: Visual documentation of UI changes

### Developer Documentation
- Inline code comments
- TypeScript types and interfaces
- Utility function documentation
- Migration logic explanation

## Use Cases

### 1. Multiple Accounts
Store separate keys for personal, work, and different billing accounts

### 2. Free vs Paid Tiers
Easily switch between free tier and paid API keys

### 3. Testing and Development
Use different keys for production, staging, and development

### 4. Rate Limit Management
Switch keys when hitting rate limits
