import type { UserSettings, ApiKeyWithMetadata } from "./schemas";

export interface ActiveKeyInfo {
  value: string;
  source: "settings" | "env" | "multi-key";
  keyId?: string;
  keyName?: string;
}

/**
 * Get the active API key for a provider
 * Priority: multi-key (active) > single key > environment variable
 */
export function getActiveApiKey(
  provider: string,
  settings: UserSettings | null | undefined,
  envVars: Record<string, string | undefined>,
  envVarName?: string,
): ActiveKeyInfo | null {
  const providerSettings = settings?.providerSettings?.[provider];

  // Check multi-key array for active key (only for regular providers, not Vertex)
  if (providerSettings && "apiKeys" in providerSettings && providerSettings.apiKeys) {
    const activeKey = providerSettings.apiKeys.find((k) => k.isActive);
    if (activeKey && activeKey.secret.value) {
      return {
        value: activeKey.secret.value,
        source: "multi-key",
        keyId: activeKey.id,
        keyName: activeKey.name,
      };
    }
  }

  // Check legacy single key (only for regular providers, not Vertex)
  if (providerSettings && "apiKey" in providerSettings) {
    const singleKey = providerSettings.apiKey?.value;
    if (
      singleKey &&
      !singleKey.startsWith("Invalid Key") &&
      singleKey !== "Not Set"
    ) {
      return {
        value: singleKey,
        source: "settings",
      };
    }
  }

  // Check environment variable
  if (envVarName && envVars[envVarName]) {
    return {
      value: envVars[envVarName]!,
      source: "env",
    };
  }

  return null;
}

/**
 * Get all API keys for a provider (both active and inactive)
 */
export function getAllApiKeys(
  provider: string,
  settings: UserSettings | null | undefined,
): ApiKeyWithMetadata[] {
  const providerSettings = settings?.providerSettings?.[provider];
  if (providerSettings && "apiKeys" in providerSettings) {
    return providerSettings.apiKeys || [];
  }
  return [];
}

/**
 * Mask an API key for display
 */
export function maskApiKey(key: string | undefined): string {
  if (!key) return "Not Set";
  if (key.length < 8) return "****";
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}
