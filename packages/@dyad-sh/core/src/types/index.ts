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
  approvalState?: "approved" | "rejected" | null;
  commitHash?: string | null;
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

/**
 * Streaming support types
 */

/**
 * Streaming message chunk
 */
export interface StreamChunk {
  type: "chunk" | "end" | "error";
  content?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Streaming callback options
 */
export interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onMetadata?: (metadata: Record<string, any>) => void;
}

/**
 * WebSocket support types
 */

/**
 * WebSocket connection state
 */
export type WebSocketState = "connecting" | "connected" | "disconnecting" | "disconnected";

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  type: string;
  payload: any;
  id?: string;
  timestamp?: number;
}

/**
 * WebSocket event handlers
 */
export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

/**
 * Server-Sent Events (SSE) support types
 */

/**
 * SSE connection state
 */
export type SSEState = "connecting" | "connected" | "disconnected";

/**
 * SSE message event
 */
export interface SSEMessage {
  data: string;
  id?: string;
  event?: string;
  retry?: number;
}

/**
 * SSE event handlers
 */
export interface SSEEventHandlers {
  onOpen?: () => void;
  onMessage?: (message: SSEMessage) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

/**
 * SSE connection options
 */
export interface SSEOptions {
  withCredentials?: boolean;
  headers?: Record<string, string>;
}

/**
 * Offline caching support types
 */

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
  key: string;
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  storage?: "memory" | "localStorage" | "indexedDB";
}

/**
 * Cache interface
 */
export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Proposal-related types
 */

export interface FileChange {
  name: string;
  path: string;
  summary: string;
  type: "write" | "rename" | "delete";
  isServerFunction: boolean;
}

export interface SqlQuery {
  content: string;
  description?: string;
}

export interface SecurityRisk {
  severity: "low" | "medium" | "high";
  description: string;
}

export interface CodeProposal {
  type: "code-proposal";
  title: string;
  securityRisks: SecurityRisk[];
  filesChanged: FileChange[];
  packagesAdded: string[];
  sqlQueries: SqlQuery[];
}

export type SuggestedAction =
  | { id: "restart-app" }
  | { id: "summarize-in-new-chat" }
  | { id: "write-code-properly" }
  | { id: "refactor-file"; path: string }
  | { id: "rebuild" }
  | { id: "restart" }
  | { id: "refresh" }
  | { id: "keep-going" };

export interface ActionProposal {
  type: "action-proposal";
  actions: SuggestedAction[];
}

export interface TipProposal {
  type: "tip-proposal";
  title: string;
  description: string;
}

export type Proposal = CodeProposal | ActionProposal | TipProposal;

export interface ProposalResult {
  proposal: Proposal;
  chatId: number;
  messageId: number;
}

export interface ApproveProposalResult {
  extraFiles?: string[];
  extraFilesError?: string;
}
