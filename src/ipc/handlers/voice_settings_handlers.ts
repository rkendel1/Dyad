import { ipcMain } from "electron";
import { safeHandle } from "./safe_handle";
import { readSettings, writeSettings } from "@/main/settings";

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  continuousMode: boolean;
  emotionDetection: boolean;
  adaptivePrompts: boolean;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: false,
  language: "en-US",
  continuousMode: false,
  emotionDetection: true,
  adaptivePrompts: true,
};

export function registerVoiceSettingsHandlers() {
  ipcMain.handle(
    "voice:get-settings",
    safeHandle(async () => {
      const settings = readSettings();

      if (!settings.voiceSettings) {
        return DEFAULT_VOICE_SETTINGS;
      }

      return settings.voiceSettings as VoiceSettings;
    }),
  );

  ipcMain.handle(
    "voice:update-settings",
    safeHandle(async (event, voiceSettings: VoiceSettings) => {
      const currentSettings = readSettings();

      writeSettings({
        ...currentSettings,
        voiceSettings,
      });

      return voiceSettings;
    }),
  );
}
