/**
 * File Service
 *
 * Business logic for file operations within applications
 */

import { promises as fsPromises } from "node:fs";
import path from "node:path";
import { db } from "../../db";
import { apps } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getDyadAppPath } from "../../paths/paths";
import { getFilesRecursively } from "../../ipc/utils/file_utils";
import { normalizePath } from "../../../shared/normalizePath";

/**
 * Service class for managing files within applications
 */
export class FileService {
  /**
   * List all files in an application
   */
  async listFiles(appId: number): Promise<string[]> {
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
    }

    const appPath = getDyadAppPath(app.path);
    let files: string[] = [];

    try {
      files = getFilesRecursively(appPath, appPath);
      // Normalize the path to use forward slashes
      files = files.map((filePath) => normalizePath(filePath));
    } catch (error) {
      console.error(`Error reading files for app ${appId}:`, error);
      throw new Error(`Failed to read files for app ${appId}`);
    }

    return files;
  }

  /**
   * Get content of a specific file
   */
  async getFileContent(appId: number, filePath: string): Promise<string> {
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
    }

    // Prevent path traversal attacks
    const normalizedPath = normalizePath(filePath);
    if (normalizedPath.includes("..")) {
      throw new Error("Invalid file path");
    }

    const appPath = getDyadAppPath(app.path);
    const fullPath = path.join(appPath, normalizedPath);

    try {
      const content = await fsPromises.readFile(fullPath, "utf-8");
      return content;
    } catch (error) {
      console.error(`Error reading file ${fullPath}:`, error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  /**
   * Update content of a specific file
   */
  async updateFileContent(
    appId: number,
    filePath: string,
    content: string,
  ): Promise<void> {
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
    }

    // Prevent path traversal attacks
    const normalizedPath = normalizePath(filePath);
    if (normalizedPath.includes("..")) {
      throw new Error("Invalid file path");
    }

    const appPath = getDyadAppPath(app.path);
    const fullPath = path.join(appPath, normalizedPath);

    try {
      // Ensure directory exists
      await fsPromises.mkdir(path.dirname(fullPath), { recursive: true });
      
      // Write file content
      await fsPromises.writeFile(fullPath, content, "utf-8");
    } catch (error) {
      console.error(`Error writing file ${fullPath}:`, error);
      throw new Error(`Failed to write file: ${filePath}`);
    }
  }
}
