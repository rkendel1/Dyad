/**
 * File Controller
 *
 * HTTP endpoints for file operations within apps
 */

import type { Response } from "express";
import type { ApiRequest, ApiResponse } from "../types";
import { asyncHandler, HttpApiError } from "../middleware/errorHandler";
import { FileService } from "../../services/file.service";
import { z } from "zod";

const fileService = new FileService();

/**
 * GET /api/apps/:id/files
 * List all files in an application
 */
export const listFiles = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const appId = parseInt(req.params.id, 10);

    if (isNaN(appId)) {
      throw new HttpApiError("Invalid app ID", 400, "INVALID_APP_ID");
    }

    const files = await fileService.listFiles(appId);

    const response: ApiResponse = {
      success: true,
      data: {
        files,
      },
    };

    res.json(response);
  },
);

/**
 * GET /api/apps/:id/files/content
 * Get content of a specific file
 * Query parameter: path (relative file path)
 */
export const getFileContent = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const appId = parseInt(req.params.id, 10);
    const filePath = req.query.path as string;

    if (isNaN(appId)) {
      throw new HttpApiError("Invalid app ID", 400, "INVALID_APP_ID");
    }

    if (!filePath) {
      throw new HttpApiError(
        "File path is required",
        400,
        "MISSING_FILE_PATH",
      );
    }

    const content = await fileService.getFileContent(appId, filePath);

    const response: ApiResponse = {
      success: true,
      data: {
        path: filePath,
        content,
      },
    };

    res.json(response);
  },
);

/**
 * PUT /api/apps/:id/files/content
 * Update content of a specific file
 */
export const updateFileContent = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const appId = parseInt(req.params.id, 10);
    const { path: filePath, content } = req.body;

    if (isNaN(appId)) {
      throw new HttpApiError("Invalid app ID", 400, "INVALID_APP_ID");
    }

    if (!filePath) {
      throw new HttpApiError(
        "File path is required",
        400,
        "MISSING_FILE_PATH",
      );
    }

    if (content === undefined) {
      throw new HttpApiError(
        "File content is required",
        400,
        "MISSING_CONTENT",
      );
    }

    await fileService.updateFileContent(appId, filePath, content);

    const response: ApiResponse = {
      success: true,
      data: {
        message: "File updated successfully",
        path: filePath,
      },
    };

    res.json(response);
  },
);

/**
 * Validation schemas
 */
export const updateFileContentSchema = z.object({
  path: z.string().min(1, "File path is required"),
  content: z.string(),
});
