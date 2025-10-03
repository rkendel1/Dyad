import { UserSettings, ApiKeyWithMetadata } from "./schemas";
import { v4 as uuidv4 } from "uuid";

/**
 * Migrate legacy single API key to multi-key format
 * This should be called when settings are loaded
 */
export function migrateLegacyApiKeys(settings: UserSettings): UserSettings {
  const updatedProviderSettings = { ...settings.providerSettings };
  let hasChanges = false;

  for (const [provider, providerSetting] of Object.entries(updatedProviderSettings)) {
    // Skip Vertex provider (doesn't use regular API keys)
    if (provider === "vertex") continue;

    // Check if this provider has a legacy single key but no multi-keys
    if (
      providerSetting &&
      "apiKey" in providerSetting &&
      providerSetting.apiKey?.value &&
      (!("apiKeys" in providerSetting) || !providerSetting.apiKeys || providerSetting.apiKeys.length === 0)
    ) {
      const legacyKey = providerSetting.apiKey;
      
      // Skip invalid keys
      if (
        legacyKey.value.startsWith("Invalid Key") ||
        legacyKey.value === "Not Set"
      ) {
        continue;
      }

      // Create a multi-key from the legacy key
      const migratedKey: ApiKeyWithMetadata = {
        id: uuidv4(),
        name: "Migrated Key",
        secret: {
          value: legacyKey.value,
          encryptionType: legacyKey.encryptionType,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      // Update the provider settings with the new multi-key
      updatedProviderSettings[provider] = {
        ...providerSetting,
        apiKeys: [migratedKey],
        // Keep the legacy key for backward compatibility (will be removed in a future version)
        apiKey: legacyKey,
      };
      
      hasChanges = true;
    }
  }

  if (hasChanges) {
    return {
      ...settings,
      providerSettings: updatedProviderSettings,
    };
  }

  return settings;
}
