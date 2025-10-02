/**
 * Client Factory
 * 
 * Auto-detect and create the appropriate Dyad client based on the environment
 */

import type { DyadClient, ClientConfig } from "../interfaces/client.interface";
import { HttpClient } from "./http.client";
import { IpcClient } from "./ipc.client";

/**
 * Client detection result
 */
export interface ClientDetectionResult {
  type: "http" | "ipc" | "unknown";
  available: boolean;
  client?: DyadClient;
  error?: string;
}

/**
 * Detect available Dyad backend
 * 
 * Attempts to detect and connect to a Dyad backend in the following order:
 * 1. Electron IPC (if window.electron is available)
 * 2. HTTP API (try connecting to localhost:3000)
 * 
 * @param config Optional client configuration
 * @returns Detection result with client instance
 */
export async function detectBackend(
  config: ClientConfig = {}
): Promise<ClientDetectionResult> {
  // Check if running in Electron environment
  if (typeof window !== "undefined" && (window as any).electron) {
    try {
      const client = new IpcClient(config);
      await client.connect();
      return {
        type: "ipc",
        available: true,
        client,
      };
    } catch (error) {
      return {
        type: "ipc",
        available: false,
        error: error instanceof Error ? error.message : "IPC client initialization failed",
      };
    }
  }

  // Try HTTP connection
  try {
    const baseUrl = config.baseUrl || "http://localhost:3000";
    const client = new HttpClient({ ...config, baseUrl });
    
    const health = await client.checkHealth();
    if (health.status === "ok") {
      return {
        type: "http",
        available: true,
        client,
      };
    }

    return {
      type: "http",
      available: false,
      error: "Backend health check failed",
    };
  } catch (error) {
    return {
      type: "unknown",
      available: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a Dyad client
 * 
 * Creates a client instance based on the specified type or auto-detects.
 * 
 * @param type Client type to create (or 'auto' to detect)
 * @param config Client configuration
 * @returns Dyad client instance
 * @throws Error if client cannot be created
 */
export async function createDyadClient(
  type: "http" | "ipc" | "auto" = "auto",
  config: ClientConfig = {}
): Promise<DyadClient> {
  if (type === "http") {
    const client = new HttpClient(config);
    await client.connect();
    return client;
  }

  if (type === "ipc") {
    const client = new IpcClient(config);
    await client.connect();
    return client;
  }

  // Auto-detect
  const detection = await detectBackend(config);
  
  if (!detection.available || !detection.client) {
    throw new Error(
      `No Dyad backend available: ${detection.error || "Unknown error"}`
    );
  }

  return detection.client;
}

/**
 * Create HTTP client directly
 * 
 * @param config Client configuration
 * @returns HTTP client instance
 */
export function createHttpClient(config: ClientConfig = {}): DyadClient {
  return new HttpClient(config);
}

/**
 * Create IPC client directly
 * 
 * @param config Client configuration
 * @returns IPC client instance
 */
export function createIpcClient(config: ClientConfig = {}): DyadClient {
  return new IpcClient(config);
}
