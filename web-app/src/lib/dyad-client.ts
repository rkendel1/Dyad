/**
 * Dyad Client for Web App
 * 
 * Uses dyad-sh-core package for consistent API access
 */

import { createHttpClient } from "dyad-sh-core";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Create and export the Dyad client instance
 */
export const dyadClient = createHttpClient({
  baseUrl: API_BASE_URL,
  timeout: 10000,
});

/**
 * Export the DyadClient type for convenience
 */
export type { DyadClient } from "dyad-sh-core";

/**
 * Export commonly used types from dyad-sh-core
 */
export type {
  App,
  Chat,
  Message,
  CreateAppParams,
  CreateAppResult,
  AppSettings,
} from "dyad-sh-core";
