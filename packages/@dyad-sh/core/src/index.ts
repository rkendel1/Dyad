/**
 * @dyad-sh/core
 * 
 * Core library for Dyad - AI App Builder
 * Provides shared types, interfaces, and client implementations for all platforms
 */

// Export types
export * from "./types";

// Export interfaces
export * from "./interfaces/client.interface";

// Export clients
export { HttpClient } from "./clients/http.client";
export {
  detectBackend,
  createDyadClient,
  createHttpClient,
  type ClientDetectionResult,
} from "./clients/factory";
