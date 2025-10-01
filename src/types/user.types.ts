/**
 * User and Settings Types
 *
 * Type definitions related to user settings, preferences, and authentication.
 */

/**
 * Language model configuration
 */
export type LanguageModel =
  | {
      id: number;
      apiName: string;
      displayName: string;
      description: string;
      tag?: string;
      maxOutputTokens?: number;
      contextWindow?: number;
      temperature?: number;
      dollarSigns?: number;
      type: "custom";
    }
  | {
      apiName: string;
      displayName: string;
      description: string;
      tag?: string;
      maxOutputTokens?: number;
      contextWindow?: number;
      temperature?: number;
      dollarSigns?: number;
      type: "local" | "cloud";
    };

/**
 * Language model provider configuration
 */
export interface LanguageModelProvider {
  id: string;
  name: string;
  hasFreeTier?: boolean;
  websiteUrl?: string;
  gatewayPrefix?: string;
  secondary?: boolean;
  envVarName?: string;
  apiBaseUrl?: string;
  type: "custom" | "local" | "cloud";
}

/**
 * Local model information
 */
export interface LocalModel {
  provider: "ollama" | "lmstudio";
  modelName: string;
  displayName: string;
}

/**
 * Token usage information
 */
export interface TokenCountResult {
  totalTokens: number;
  messageHistoryTokens: number;
  codebaseTokens: number;
  mentionedAppsTokens: number;
  inputTokens: number;
  systemPromptTokens: number;
  contextWindow: number;
}

/**
 * User budget information
 */
export interface UserBudgetInfo {
  usedCredits: number;
  totalCredits: number;
  budgetResetDate: Date;
}

/**
 * System debug information
 */
export interface SystemDebugInfo {
  nodeVersion: string | null;
  pnpmVersion: string | null;
  nodePath: string | null;
  packageManagerInfo: string | null;
  telemetryId: string;
  telemetryConsent: string;
  telemetryUrl: string;
  dyadVersion: string;
  platform: string;
  architecture: string;
  logs: string;
  selectedLanguageModel: string;
}

/**
 * Node system information
 */
export interface NodeSystemInfo {
  nodeVersion: string | null;
  pnpmVersion: string | null;
  nodeDownloadUrl: string;
}

/**
 * Create custom language model provider parameters
 */
export interface CreateCustomLanguageModelProviderParams {
  id: string;
  name: string;
  apiBaseUrl: string;
  envVarName?: string;
}

/**
 * Create custom language model parameters
 */
export interface CreateCustomLanguageModelParams {
  apiName: string;
  displayName: string;
  providerId: string;
  description?: string;
  maxOutputTokens?: number;
  contextWindow?: number;
}

/**
 * Local model list response
 */
export interface LocalModelListResponse {
  models: LocalModel[];
}
