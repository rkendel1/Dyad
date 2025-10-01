/**
 * Health Controller
 * 
 * Health check and status endpoints
 */

import type { Request, Response } from 'express';
import type { ApiResponse, HealthResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import packageJson from '../../../../package.json';

// Track server start time
const serverStartTime = Date.now();

/**
 * GET /api/health
 * Basic health check endpoint
 */
export const getHealth = asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: {
      status: 'ok',
      version: packageJson.version,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    },
  };

  res.json(response);
});

/**
 * GET /api/version
 * Get application version
 */
export const getVersion = asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse<{ version: string; name: string }> = {
    success: true,
    data: {
      version: packageJson.version,
      name: packageJson.name,
    },
  };

  res.json(response);
});

/**
 * GET /api/status
 * Get detailed system status
 */
export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse<{
    status: string;
    version: string;
    uptime: number;
    platform: string;
    nodeVersion: string;
  }> = {
    success: true,
    data: {
      status: 'running',
      version: packageJson.version,
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  res.json(response);
});
