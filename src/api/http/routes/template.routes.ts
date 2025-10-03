/**
 * Template Routes
 *
 * Template browsing and selection endpoints
 */

import { Router } from "express";
import * as templateController from "../controllers/template.controller";

const router = Router();

/**
 * GET /api/templates - List all templates
 */
router.get("/", templateController.listTemplates);

/**
 * GET /api/templates/:id - Get template by ID
 */
router.get("/:id", templateController.getTemplate);

export default router;
