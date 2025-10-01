/**
 * App Routes
 *
 * Application management endpoints
 */

import { Router } from "express";
import * as appController from "../controllers/app.controller";
import { validateBody } from "../middleware/validation";

const router = Router();

/**
 * GET /api/apps - List all apps
 */
router.get("/", appController.listApps);

/**
 * GET /api/apps/:id - Get app by ID
 */
router.get("/:id", appController.getApp);

/**
 * DELETE /api/apps/:id - Delete app
 */
router.delete("/:id", appController.deleteApp);

/**
 * GET /api/apps/:id/settings - Get app settings
 */
router.get("/:id/settings", appController.getAppSettings);

/**
 * PUT /api/apps/:id/settings - Update app settings
 */
router.put(
  "/:id/settings",
  validateBody(appController.updateAppSettingsSchema),
  appController.updateAppSettings,
);

export default router;
