/**
 * API Types
 * 
 * Type definitions for API requests, responses, and parameters.
 */

/**
 * Base API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
 * API error details
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Chat stream parameters
 */
export interface ChatStreamParams {
  chatId: number;
  prompt: string;
  redo?: boolean;
  attachments?: Array<{
    name: string;
    type: string;
    data: string;
    attachmentType: "upload-to-codebase" | "chat-context";
  }>;
  selectedComponent: any | null; // ComponentSelection
}

/**
 * Chat response end event
 */
export interface ChatResponseEnd {
  chatId: number;
  updatedFiles: boolean;
  extraFiles?: string[];
  extraFilesError?: string;
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
  app: {
    id: number;
    name: string;
    path: string;
    createdAt: string;
    updatedAt: string;
  };
  chatId: number;
}

/**
 * Import app parameters
 */
export interface ImportAppParams {
  path: string;
  appName: string;
  installCommand?: string;
  startCommand?: string;
}

/**
 * Import app from GitHub parameters
 */
export interface ImportAppFromGithubParams {
  repoUrl: string;
  appName: string;
  installCommand?: string;
  startCommand?: string;
}

/**
 * Import app result
 */
export interface ImportAppResult {
  appId: number;
  chatId: number;
}

/**
 * List apps response
 */
export interface ListAppsResponse {
  apps: any[]; // App[]
  appBasePath: string;
}

/**
 * Approval result
 */
export interface ApproveProposalResult {
  extraFiles?: string[];
  extraFilesError?: string;
}

/**
 * Edit app file return type
 */
export interface EditAppFileReturnType {
  warning?: string;
}

/**
 * Upload file to codebase parameters
 */
export interface UploadFileToCodebaseParams {
  appId: number;
  filePath: string;
  fileData: string;
  fileName: string;
}

/**
 * Upload file to codebase result
 */
export interface UploadFileToCodebaseResult {
  success: boolean;
  filePath: string;
}
