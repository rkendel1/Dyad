/**
 * Error Handling Middleware
 * 
 * Centralized error handling for HTTP API
 */

import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, ApiError } from '../types';
import log from 'electron-log';

const logger = log.scope('http-api');

/**
 * Custom API Error class
 */
export class HttpApiError extends Error implements ApiError {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'HttpApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Error handler middleware
 * Catches all errors and formats them consistently
 */
export function errorHandler(
  err: Error | HttpApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Log the error
  logger.error(`API Error: ${err.message}`, {
    path: req.path,
    method: req.method,
    error: err,
  });

  // Determine status code
  const statusCode = err instanceof HttpApiError ? err.statusCode : 500;
  const code = err instanceof HttpApiError ? err.code : 'INTERNAL_ERROR';
  const details = err instanceof HttpApiError ? err.details : undefined;

  // Send error response
  const response: ApiResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code,
      details,
    },
  };

  res.status(statusCode).json(response);
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    },
  };

  res.status(404).json(response);
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
