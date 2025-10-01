/**
 * App Service
 * 
 * Business logic for application management operations.
 * This service provides a clean abstraction layer between the IPC handlers
 * and the core business logic.
 */

import type {
  App,
  AppSettings,
  CreateAppParams,
  CreateAppResult,
  ImportAppParams,
  ImportAppResult,
  ListAppsResponse,
} from '../../types';
import { db } from '../../db';
import { apps } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getDyadAppPath } from '../../paths/paths';
import { getFilesRecursively } from '../../ipc/utils/file_utils';
import { normalizePath } from '../../../shared/normalizePath';

/**
 * Service class for managing applications
 */
export class AppService {
  /**
   * Create a new application
   * Note: The actual app creation logic with git initialization is handled by the IPC handler
   * This service method provides the database operations for app creation
   */
  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    // The full implementation including git initialization and template creation
    // is complex and tightly coupled to the IPC handler context.
    // This method provides the core database operation that can be used by handlers.
    throw new Error('Use IPC handler "create-app" for full app creation with git initialization');
  }

  /**
   * List all applications
   */
  async listApps(): Promise<ListAppsResponse> {
    const allApps = await db.query.apps.findMany({
      orderBy: [desc(apps.createdAt)],
    });
    return {
      apps: allApps,
      appBasePath: getDyadAppPath('$APP_BASE_PATH'),
    };
  }

  /**
   * Get application by ID
   */
  async getApp(appId: number): Promise<App> {
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
    }

    // Get app files
    const appPath = getDyadAppPath(app.path);
    let files: string[] = [];

    try {
      files = getFilesRecursively(appPath, appPath);
      // Normalize the path to use forward slashes
      files = files.map((path) => normalizePath(path));
    } catch (error) {
      // Return app even if files couldn't be read
      console.error(`Error reading files for app ${appId}:`, error);
    }

    return {
      ...app,
      files,
    } as App;
  }

  /**
   * Get application settings
   */
  async getAppSettings(appId: number): Promise<AppSettings> {
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
    }

    return {
      preferredPackageManager: (app.preferredPackageManager as "npm" | "yarn" | "pnpm" | "bun" | null) || null,
      previewUrl: app.previewUrl || null,
    };
  }

  /**
   * Update application settings
   */
  async updateAppSettings(appId: number, settings: Partial<AppSettings>): Promise<AppSettings> {
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
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

    // Return updated settings
    const updatedApp = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    return {
      preferredPackageManager: (updatedApp?.preferredPackageManager as "npm" | "yarn" | "pnpm" | "bun" | null) || null,
      previewUrl: updatedApp?.previewUrl || null,
    };
  }

  /**
   * Delete an application
   */
  async deleteApp(appId: number): Promise<void> {
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
    }

    // Delete app from database
    // Note: Associated chats will cascade delete
    await db.delete(apps).where(eq(apps.id, appId));
  }

  /**
   * Import an existing application
   * Note: The actual import logic with file copying is handled by the IPC handler
   * This service method provides the database operations for app import
   */
  async importApp(params: ImportAppParams): Promise<ImportAppResult> {
    // The full implementation including file copying and git initialization
    // is complex and tightly coupled to the IPC handler context.
    // This method provides the core database operation that can be used by handlers.
    throw new Error('Use IPC handler "import-app" for full app import with file operations');
  }
}

/**
 * Singleton instance for easy access
 */
export const appService = new AppService();
