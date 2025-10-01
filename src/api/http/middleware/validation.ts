/**
 * Validation Middleware
 *
 * Request validation using Zod schemas
 */

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { HttpApiError } from "./errorHandler";

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HttpApiError(
          "Validation failed",
          400,
          "VALIDATION_ERROR",
          error.errors,
        );
      }
      throw error;
    }
  };
}

/**
 * Validate request params against a Zod schema
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HttpApiError(
          "Invalid parameters",
          400,
          "VALIDATION_ERROR",
          error.errors,
        );
      }
      throw error;
    }
  };
}

/**
 * Validate request query against a Zod schema
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HttpApiError(
          "Invalid query parameters",
          400,
          "VALIDATION_ERROR",
          error.errors,
        );
      }
      throw error;
    }
  };
}
