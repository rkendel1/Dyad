/**
 * File Controller
 *
 * HTTP endpoints for file operations within applications
 */

import type { Response } from "express";
import type { ApiRequest, ApiResponse } from "../types";
import { asyncHandler, HttpApiError } from "../middleware/errorHandler";
import { z } from "zod";
import { db } from "../../../db";
import { apps } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { getDyadAppPath } from "../../../paths/paths";
import * as fs from "fs/promises";
import * as path from "path";
import { normalizePath } from "../../../../shared/normalizePath";

/**
 * GET /api/apps/:appId/files/:path
 * Read a file's content from an application
 */
export const getFileContent = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const appId = parseInt(req.params.appId, 10);
    const filePath = req.params[0]; // Get the wildcard path parameter

    if (isNaN(appId)) {
      throw new HttpApiError("Invalid app ID", 400, "INVALID_APP_ID");
    }

    if (!filePath) {
      throw new HttpApiError("File path is required", 400, "MISSING_FILE_PATH");
    }

    // Get the app to ensure it exists and get its path
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new HttpApiError("App not found", 404, "APP_NOT_FOUND");
    }

    // Build the absolute file path
    const appPath = getDyadAppPath(app.path);
    const fullFilePath = path.join(appPath, filePath);

    // Security check: Ensure the file is within the app directory
    const normalizedAppPath = path.resolve(appPath);
    const normalizedFilePath = path.resolve(fullFilePath);

    if (!normalizedFilePath.startsWith(normalizedAppPath)) {
      throw new HttpApiError(
        "Access denied: File path outside app directory",
        403,
        "FORBIDDEN_PATH",
      );
    }

    try {
      // Read the file content
      const content = await fs.readFile(fullFilePath, "utf-8");

      const response: ApiResponse = {
        success: true,
        data: {
          path: normalizePath(filePath),
          content,
        },
      };

      res.json(response);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new HttpApiError("File not found", 404, "FILE_NOT_FOUND");
      }
      throw new HttpApiError(
        `Failed to read file: ${(error as Error).message}`,
        500,
        "FILE_READ_ERROR",
      );
    }
  },
);

/**
 * PUT /api/apps/:appId/files/:path
 * Update a file's content in an application
 */
export const updateFileContent = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const appId = parseInt(req.params.appId, 10);
    const filePath = req.params[0]; // Get the wildcard path parameter
    const { content } = req.body;

    if (isNaN(appId)) {
      throw new HttpApiError("Invalid app ID", 400, "INVALID_APP_ID");
    }

    if (!filePath) {
      throw new HttpApiError("File path is required", 400, "MISSING_FILE_PATH");
    }

    if (typeof content !== "string") {
      throw new HttpApiError(
        "File content must be a string",
        400,
        "INVALID_CONTENT",
      );
    }

    // Get the app to ensure it exists and get its path
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    if (!app) {
      throw new HttpApiError("App not found", 404, "APP_NOT_FOUND");
    }

    // Build the absolute file path
    const appPath = getDyadAppPath(app.path);
    const fullFilePath = path.join(appPath, filePath);

    // Security check: Ensure the file is within the app directory
    const normalizedAppPath = path.resolve(appPath);
    const normalizedFilePath = path.resolve(fullFilePath);

    if (!normalizedFilePath.startsWith(normalizedAppPath)) {
      throw new HttpApiError(
        "Access denied: File path outside app directory",
        403,
        "FORBIDDEN_PATH",
      );
    }

    try {
      // Ensure the directory exists
      const dir = path.dirname(fullFilePath);
      await fs.mkdir(dir, { recursive: true });

      // Write the file content
      await fs.writeFile(fullFilePath, content, "utf-8");

      const response: ApiResponse = {
        success: true,
        data: {
          path: normalizePath(filePath),
          message: "File updated successfully",
        },
      };

      res.json(response);
    } catch (error) {
      throw new HttpApiError(
        `Failed to write file: ${(error as Error).message}`,
        500,
        "FILE_WRITE_ERROR",
      );
    }
  },
);

/**
 * Validation schemas
 */
export const updateFileContentSchema = z.object({
  content: z.string(),
});
