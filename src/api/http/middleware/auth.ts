/**
 * Authentication Middleware
 *
 * JWT-based authentication for HTTP API
 * Note: Authentication is optional for localhost connections
 */

import type { Response, NextFunction } from "express";
import type { ApiRequest } from "../types";
import jwt from "jsonwebtoken";
import { HttpApiError } from "./errorHandler";
import log from "electron-log";

const logger = log.scope("http-auth");

// Secret key for JWT (in production, this should be stored securely)
const JWT_SECRET =
  process.env.DYAD_JWT_SECRET || "dyad-development-secret-change-in-production";

/**
 * Optional authentication middleware
 * Checks for JWT token but doesn't require it
 */
export function optionalAuth(
  req: ApiRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        name?: string;
      };
      req.user = decoded;
      logger.debug("User authenticated:", decoded);
    } catch (error) {
      logger.warn("Invalid token provided:", error);
      // Don't throw error, just continue without user
    }
  }

  next();
}

/**
 * Required authentication middleware
 * Requires a valid JWT token
 */
export function requireAuth(
  req: ApiRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpApiError("Authentication required", 401, "UNAUTHORIZED");
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      name?: string;
    };
    req.user = decoded;
    logger.debug("User authenticated:", decoded);
    next();
  } catch (error) {
    throw new HttpApiError("Invalid or expired token", 401, "UNAUTHORIZED");
  }
}

/**
 * Generate a JWT token
 * Utility function for testing and future use
 */
export function generateToken(userId: string, name?: string): string {
  return jwt.sign({ id: userId, name }, JWT_SECRET, { expiresIn: "7d" });
}
