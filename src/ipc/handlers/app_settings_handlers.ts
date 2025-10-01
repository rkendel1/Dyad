import { ipcMain } from "electron";
import { db } from "../../db";
import { apps } from "../../db/schema";
import { eq } from "drizzle-orm";
import log from "electron-log";
import {
  GetAppSettingsParams,
  UpdateAppSettingsParams,
  AppSettings,
} from "../ipc_types";

const logger = log.scope("app_settings_handlers");

export function registerAppSettingsHandlers() {
  // Handler to get app settings
  ipcMain.handle(
    "get-app-settings",
    async (event, { appId }: GetAppSettingsParams): Promise<AppSettings> => {
      try {
        const app = await db.query.apps.findFirst({
          where: eq(apps.id, appId),
        });

        if (!app) {
          throw new Error("App not found");
        }

        return {
          preferredPackageManager:
            (app.preferredPackageManager as
              | "npm"
              | "yarn"
              | "pnpm"
              | "bun"
              | null) || null,
          previewUrl: app.previewUrl || null,
        };
      } catch (error) {
        logger.error("Error getting app settings:", error);
        throw new Error(
          `Failed to get app settings: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  );

  // Handler to update app settings
  ipcMain.handle(
    "update-app-settings",
    async (
      event,
      { appId, settings }: UpdateAppSettingsParams,
    ): Promise<AppSettings> => {
      try {
        const app = await db.query.apps.findFirst({
          where: eq(apps.id, appId),
        });

        if (!app) {
          throw new Error("App not found");
        }

        // Build update object with only provided fields
        const updateData: any = {};
        if (settings.preferredPackageManager !== undefined) {
          updateData.preferredPackageManager = settings.preferredPackageManager;
        }
        if (settings.previewUrl !== undefined) {
          updateData.previewUrl = settings.previewUrl;
        }

        // Update the app
        await db.update(apps).set(updateData).where(eq(apps.id, appId));

        logger.info(`Updated settings for app ${appId}:`, updateData);

        // Return updated settings
        const updatedApp = await db.query.apps.findFirst({
          where: eq(apps.id, appId),
        });

        return {
          preferredPackageManager:
            (updatedApp?.preferredPackageManager as
              | "npm"
              | "yarn"
              | "pnpm"
              | "bun"
              | null) || null,
          previewUrl: updatedApp?.previewUrl || null,
        };
      } catch (error) {
        logger.error("Error updating app settings:", error);
        throw new Error(
          `Failed to update app settings: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
  );
}
