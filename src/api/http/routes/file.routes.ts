/**
 * File Routes
 *
 * File operation endpoints for applications
 */

import { Router } from "express";
import * as fileController from "../controllers/file.controller";
import { validateBody } from "../middleware/validation";

const router = Router();

/**
 * GET /api/apps/:appId/files/*
 * Get file content - uses wildcard to capture full path
 */
router.get("/:appId/files/*", fileController.getFileContent);

/**
 * PUT /api/apps/:appId/files/*
 * Update file content - uses wildcard to capture full path
 */
router.put(
  "/:appId/files/*",
  validateBody(fileController.updateFileContentSchema),
  fileController.updateFileContent,
);

export default router;
