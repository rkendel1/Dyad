import { describe, it, expect } from "vitest";
import { getActiveApiKey, getAllApiKeys, maskApiKey } from "../api-key-utils";
import type { UserSettings, ApiKeyWithMetadata } from "../schemas";

describe("API Key Utils", () => {
  describe("getActiveApiKey", () => {
    it("should return active multi-key when available", () => {
      const settings: UserSettings = {
        selectedModel: { name: "test", provider: "openai" },
        providerSettings: {
          openai: {
            apiKeys: [
              {
                id: "1",
                name: "Key 1",
                secret: { value: "sk-test-1" },
                isActive: false,
              },
              {
                id: "2",
                name: "Key 2",
                secret: { value: "sk-test-2" },
                isActive: true,
              },
            ],
          },
        },
        telemetryConsent: "opted_out",
        telemetryUserId: "test",
        hasRunBefore: true,
        experiments: {},
        selectedTemplateId: "default",
        enableAutoUpdate: true,
        releaseChannel: "stable",
      } as UserSettings;

      const result = getActiveApiKey("openai", settings, {}, undefined);

      expect(result).toEqual({
        value: "sk-test-2",
        source: "multi-key",
        keyId: "2",
        keyName: "Key 2",
      });
    });

    it("should return legacy single key when no multi-keys exist", () => {
      const settings: UserSettings = {
        selectedModel: { name: "test", provider: "openai" },
        providerSettings: {
          openai: {
            apiKey: { value: "sk-legacy" },
          },
        },
        telemetryConsent: "opted_out",
        telemetryUserId: "test",
        hasRunBefore: true,
        experiments: {},
        selectedTemplateId: "default",
        enableAutoUpdate: true,
        releaseChannel: "stable",
      } as UserSettings;

      const result = getActiveApiKey("openai", settings, {}, undefined);

      expect(result).toEqual({
        value: "sk-legacy",
        source: "settings",
      });
    });

    it("should return env key when no settings keys exist", () => {
      const settings: UserSettings = {
        selectedModel: { name: "test", provider: "openai" },
        providerSettings: {},
        telemetryConsent: "opted_out",
        telemetryUserId: "test",
        hasRunBefore: true,
        experiments: {},
        selectedTemplateId: "default",
        enableAutoUpdate: true,
        releaseChannel: "stable",
      } as UserSettings;

      const result = getActiveApiKey(
        "openai",
        settings,
        { OPENAI_API_KEY: "sk-env" },
        "OPENAI_API_KEY",
      );

      expect(result).toEqual({
        value: "sk-env",
        source: "env",
      });
    });

    it("should prioritize multi-key over legacy key", () => {
      const settings: UserSettings = {
        selectedModel: { name: "test", provider: "openai" },
        providerSettings: {
          openai: {
            apiKey: { value: "sk-legacy" },
            apiKeys: [
              {
                id: "1",
                name: "Active Key",
                secret: { value: "sk-multi" },
                isActive: true,
              },
            ],
          },
        },
        telemetryConsent: "opted_out",
        telemetryUserId: "test",
        hasRunBefore: true,
        experiments: {},
        selectedTemplateId: "default",
        enableAutoUpdate: true,
        releaseChannel: "stable",
      } as UserSettings;

      const result = getActiveApiKey("openai", settings, {}, undefined);

      expect(result).toEqual({
        value: "sk-multi",
        source: "multi-key",
        keyId: "1",
        keyName: "Active Key",
      });
    });
  });

  describe("getAllApiKeys", () => {
    it("should return all multi-keys for a provider", () => {
      const settings: UserSettings = {
        selectedModel: { name: "test", provider: "openai" },
        providerSettings: {
          openai: {
            apiKeys: [
              {
                id: "1",
                name: "Key 1",
                secret: { value: "sk-test-1" },
                isActive: false,
              },
              {
                id: "2",
                name: "Key 2",
                secret: { value: "sk-test-2" },
                isActive: true,
              },
            ],
          },
        },
        telemetryConsent: "opted_out",
        telemetryUserId: "test",
        hasRunBefore: true,
        experiments: {},
        selectedTemplateId: "default",
        enableAutoUpdate: true,
        releaseChannel: "stable",
      } as UserSettings;

      const result = getAllApiKeys("openai", settings);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Key 1");
      expect(result[1].name).toBe("Key 2");
    });

    it("should return empty array when no multi-keys exist", () => {
      const settings: UserSettings = {
        selectedModel: { name: "test", provider: "openai" },
        providerSettings: {
          openai: {
            apiKey: { value: "sk-legacy" },
          },
        },
        telemetryConsent: "opted_out",
        telemetryUserId: "test",
        hasRunBefore: true,
        experiments: {},
        selectedTemplateId: "default",
        enableAutoUpdate: true,
        releaseChannel: "stable",
      } as UserSettings;

      const result = getAllApiKeys("openai", settings);

      expect(result).toEqual([]);
    });
  });

  describe("maskApiKey", () => {
    it("should mask API key correctly", () => {
      expect(maskApiKey("sk-test1234567890")).toBe("sk-t...7890");
    });

    it("should return Not Set for undefined", () => {
      expect(maskApiKey(undefined)).toBe("Not Set");
    });

    it("should return **** for short keys", () => {
      expect(maskApiKey("short")).toBe("****");
    });
  });
});
