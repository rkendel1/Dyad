/**
 * Template Controller
 *
 * HTTP endpoints for template browsing and selection
 */

import type { Response } from "express";
import type { ApiRequest, ApiResponse } from "../types";
import { asyncHandler } from "../middleware/errorHandler";
import { TemplateService } from "../../services/template.service";

const templateService = new TemplateService();

/**
 * GET /api/templates
 * List all available templates
 */
export const listTemplates = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const templates = await templateService.listTemplates();

    const response: ApiResponse = {
      success: true,
      data: {
        templates,
      },
    };

    res.json(response);
  },
);

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 */
export const getTemplate = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const templateId = req.params.id;
    const template = await templateService.getTemplate(templateId);

    const response: ApiResponse = {
      success: true,
      data: template,
    };

    res.json(response);
  },
);
