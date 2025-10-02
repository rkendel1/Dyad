/**
 * Core Types for Dyad
 * 
 * Shared type definitions used across all Dyad clients (Desktop, Web, CLI)
 */

/**
 * Core application entity
 */
export interface App {
  id: number;
  name: string;
  path: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  preferredPackageManager?: string | null;
  previewUrl?: string | null;
}

/**
 * Chat entity with messages
 */
export interface Chat {
  id: number;
  title: string;
  messages: Message[];
  initialCommitHash?: string | null;
}

/**
 * Chat message entity
 */
export interface Message {
  id: number;
  chatId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string | Date;
}

/**
 * Base API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Create app parameters
 */
export interface CreateAppParams {
  name: string;
  templateId?: string;
}

/**
 * Create app result
 */
export interface CreateAppResult {
  app: App;
  chatId: number;
}

/**
 * List apps response
 */
export interface ListAppsResponse {
  apps: App[];
  appBasePath?: string;
}

/**
 * Chat creation parameters
 */
export interface CreateChatParams {
  appId: number;
}

/**
 * Send message parameters
 */
export interface SendMessageParams {
  chatId: number;
  content: string;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: "ok" | "error";
  version?: string;
  uptime?: number;
}

/**
 * Application settings
 */
export interface AppSettings {
  preferredPackageManager?: "npm" | "yarn" | "pnpm" | "bun" | null;
  previewUrl?: string | null;
}
