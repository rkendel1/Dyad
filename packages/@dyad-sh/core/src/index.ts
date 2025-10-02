/**
 * 
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
export { IpcClient } from "./clients/ipc.client";
export {
  detectBackend,
  createDyadClient,
  createHttpClient,
  createIpcClient,
  type ClientDetectionResult,
} from "./clients/factory";

// Export cache
export { MemoryCache, LocalStorageCache, IndexedDBCache, createCache } from "./cache";
