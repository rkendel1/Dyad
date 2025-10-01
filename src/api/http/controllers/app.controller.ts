/**
 * App Controller
 * 
 * HTTP endpoints for application management
 */

import type { Response } from 'express';
import type { ApiRequest, ApiResponse, AppListResponse } from '../types';
import { asyncHandler, HttpApiError } from '../middleware/errorHandler';
import { AppService } from '../../services/app.service';
import { z } from 'zod';

const appService = new AppService();

/**
 * GET /api/apps
 * List all applications
 */
export const listApps = asyncHandler(async (req: ApiRequest, res: Response) => {
  const result = await appService.listApps();
  
  const response: ApiResponse<AppListResponse> = {
    success: true,
    data: {
      apps: result.apps,
      total: result.apps.length,
    },
  };

  res.json(response);
});

/**
 * GET /api/apps/:id
 * Get a specific application by ID
 */
export const getApp = asyncHandler(async (req: ApiRequest, res: Response) => {
  const appId = parseInt(req.params.id, 10);
  
  if (isNaN(appId)) {
    throw new HttpApiError('Invalid app ID', 400, 'INVALID_APP_ID');
  }

  const app = await appService.getApp(appId);
  
  if (!app) {
    throw new HttpApiError('App not found', 404, 'APP_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    data: app,
  };

  res.json(response);
});

/**
 * DELETE /api/apps/:id
 * Delete an application
 */
export const deleteApp = asyncHandler(async (req: ApiRequest, res: Response) => {
  const appId = parseInt(req.params.id, 10);
  
  if (isNaN(appId)) {
    throw new HttpApiError('Invalid app ID', 400, 'INVALID_APP_ID');
  }

  await appService.deleteApp(appId);

  const response: ApiResponse = {
    success: true,
    data: {
      message: 'App deleted successfully',
      appId,
    },
  };

  res.json(response);
});

/**
 * GET /api/apps/:id/settings
 * Get app settings
 */
export const getAppSettings = asyncHandler(async (req: ApiRequest, res: Response) => {
  const appId = parseInt(req.params.id, 10);
  
  if (isNaN(appId)) {
    throw new HttpApiError('Invalid app ID', 400, 'INVALID_APP_ID');
  }

  const settings = await appService.getAppSettings(appId);
  
  const response: ApiResponse = {
    success: true,
    data: settings,
  };

  res.json(response);
});

/**
 * PUT /api/apps/:id/settings
 * Update app settings
 */
export const updateAppSettings = asyncHandler(async (req: ApiRequest, res: Response) => {
  const appId = parseInt(req.params.id, 10);
  
  if (isNaN(appId)) {
    throw new HttpApiError('Invalid app ID', 400, 'INVALID_APP_ID');
  }

  const settings = await appService.updateAppSettings(appId, req.body);

  const response: ApiResponse = {
    success: true,
    data: settings,
  };

  res.json(response);
});

/**
 * Validation schemas
 */
export const updateAppSettingsSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  // Add more fields as needed based on AppSettings type
});
