/**
 * Health Routes
 * 
 * Health check and status endpoints
 */

import { Router } from 'express';
import * as healthController from '../controllers/health.controller';

const router = Router();

/**
 * GET /api/health - Health check
 */
router.get('/health', healthController.getHealth);

/**
 * GET /api/version - Get version info
 */
router.get('/version', healthController.getVersion);

/**
 * GET /api/status - Get system status
 */
router.get('/status', healthController.getStatus);

export default router;
