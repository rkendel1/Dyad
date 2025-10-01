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

/**
 * Respond to app input parameters
 */
export interface RespondToAppInputParams {
  appId: number;
  response: string;
}

/**
 * Set app environment variables parameters
 */
export interface SetAppEnvVarsParams {
  appId: number;
  envVars: Array<{ key: string; value: string }>;
}

/**
 * Get app environment variables parameters
 */
export interface GetAppEnvVarsParams {
  appId: number;
}

/**
 * Update app settings parameters
 */
export interface UpdateAppSettingsParams {
  appId: number;
  settings: {
    preferredPackageManager?: string | null;
    previewUrl?: string | null;
  };
}

/**
 * Get app settings parameters
 */
export interface GetAppSettingsParams {
  appId: number;
}

/**
 * Copy app parameters
 */
export interface CopyAppParams {
  appId: number;
  newAppName: string;
  withHistory: boolean;
}

/**
 * Rename branch parameters
 */
export interface RenameBranchParams {
  appId: number;
  oldBranchName: string;
  newBranchName: string;
}

/**
 * Does release note exist parameters
 */
export interface DoesReleaseNoteExistParams {
  version: string;
}

/**
 * Update chat parameters
 */
export interface UpdateChatParams {
  chatId: number;
  title: string;
}

/**
 * Create MCP Server
 */
export interface CreateMcpServer {
  name: string;
  transport: string;
  command?: string | null;
  args?: string[] | null;
  cwd?: string | null;
  envJson?: Record<string, string> | null;
  url?: string | null;
  enabled: boolean;
}

/**
 * MCP Server update
 */
export interface McpServerUpdate {
  id: number;
  name?: string;
  transport?: string;
  command?: string | null;
  args?: string[] | null;
  cwd?: string | null;
  envJson?: Record<string, string> | null;
  url?: string | null;
  enabled?: boolean;
}

/**
 * Start help chat parameters
 */
export interface StartHelpChatParams {
  sessionId: string;
  message: string;
}
