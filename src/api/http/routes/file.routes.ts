/**
 * File Routes
 *
 * File operations endpoints for applications
 */

import { Router } from "express";
import * as fileController from "../controllers/file.controller";
import { validateBody } from "../middleware/validation";

const router = Router();

/**
 * GET /api/apps/:id/files - List all files in app
 */
router.get("/:id/files", fileController.listFiles);

/**
 * GET /api/apps/:id/files/content - Get file content
 * Query param: path (relative file path)
 */
router.get("/:id/files/content", fileController.getFileContent);

/**
 * PUT /api/apps/:id/files/content - Update file content
 * Body: { path: string, content: string }
 */
router.put(
  "/:id/files/content",
  validateBody(fileController.updateFileContentSchema),
  fileController.updateFileContent,
);

export default router;
