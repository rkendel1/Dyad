/**
 * Shared Types
 *
 * Common type definitions used across multiple domains.
 */

/**
 * Generic ID types
 */
export type ID = number | string;

/**
 * Timestamp types
 */
export type Timestamp = number | string | Date;

/**
 * Git version/commit information
 */
export interface Version {
  oid: string;
  message: string;
  timestamp: number;
  dbTimestamp?: string | null;
}

/**
 * Branch result
 */
export type BranchResult = { branch: string };

/**
 * Problem report from TSC
 */
export interface Problem {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}

/**
 * Problem report collection
 */
export interface ProblemReport {
  problems: Problem[];
}

/**
 * Template information
 */
export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  isOfficial: boolean;
  isExperimental?: boolean;
  requiresNeon?: boolean;
}

/**
 * Prompt DTO
 */
export interface PromptDto {
  id: number;
  title: string;
  description: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create prompt parameters
 */
export interface CreatePromptParamsDto {
  title: string;
  description?: string;
  content: string;
}

/**
 * Update prompt parameters
 */
export interface UpdatePromptParamsDto extends CreatePromptParamsDto {
  id: number;
}

/**
 * MCP Server configuration
 */
export interface McpServer {
  id: number;
  name: string;
  transport: string;
  command?: string | null;
  args?: string[] | null;
  cwd?: string | null;
  envJson?: Record<string, string> | null;
  url?: string | null;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * MCP Tool consent type
 */
export type McpToolConsentType = "ask" | "always" | "denied";

/**
 * MCP Tool information
 */
export interface McpTool {
  name: string;
  description?: string | null;
  consent: McpToolConsentType;
}

/**
 * MCP Tool consent record
 */
export interface McpToolConsent {
  id: number;
  serverId: number;
  toolName: string;
  consent: McpToolConsentType;
  updatedAt: number;
}

/**
 * Help chat types
 */
export interface HelpChatResponseChunk {
  sessionId: string;
  delta: string;
  type: "text";
}

export interface HelpChatResponseReasoning {
  sessionId: string;
  delta: string;
  type: "reasoning";
}

export interface HelpChatResponseEnd {
  sessionId: string;
}

export interface HelpChatResponseError {
  sessionId: string;
  error: string;
}
