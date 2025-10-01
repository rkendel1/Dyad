/**
 * Integration Types
 *
 * Type definitions for third-party integrations (Vercel, Neon, Supabase, GitHub).
 */

/**
 * Vercel deployment information
 */
export interface VercelDeployment {
  uid: string;
  url: string;
  state: string;
  createdAt: number;
  target: string;
  readyState: string;
}

/**
 * Vercel project information
 */
export interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
}

/**
 * Neon project information
 */
export interface NeonProject {
  id: string;
  name: string;
  connectionString: string;
  branchId: string;
}

/**
 * Neon branch information
 */
export interface NeonBranch {
  type: "production" | "development" | "snapshot" | "preview";
  branchId: string;
  branchName: string;
  lastUpdated: string;
  parentBranchId?: string;
  parentBranchName?: string;
}

/**
 * Local Supabase status
 */
export interface LocalSupabaseStatus {
  isRunning: boolean;
  url?: string;
  dashboardUrl?: string;
  anonKey?: string;
  serviceRoleKey?: string;
}

/**
 * Production promotion status for Supabase
 */
export interface ProductionPromotionStatus {
  success: boolean;
  message: string;
  productionProjectRef?: string;
  schemaExported?: boolean;
  envFilesUpdated?: boolean;
  error?: string;
}

/**
 * GitHub repository analysis result
 */
export interface AnalyzeGithubRepoResult {
  repository: {
    name: string;
    full_name: string;
    description: string;
    language: string;
    topics: string[];
    stars: number;
    forks: number;
  };
  analysis: {
    mainTechnology: string;
    framework: string;
    dependencies: string[];
    complexity: "simple" | "moderate" | "complex";
    integrationApproaches: {
      recreate: {
        feasible: boolean;
        effort: "low" | "medium" | "high";
        description: string;
      };
      integrate: {
        feasible: boolean;
        effort: "low" | "medium" | "high";
        description: string;
      };
      tailor: {
        feasible: boolean;
        effort: "low" | "medium" | "high";
        description: string;
      };
    };
    recommendation: "recreate" | "integrate" | "tailor";
    reasoning: string;
  };
}

/**
 * GitHub repo integration result
 */
export interface IntegrateGithubRepoResult {
  success: boolean;
  message: string;
  changedFiles?: string[];
}

/**
 * Analyze GitHub repo parameters
 */
export interface AnalyzeGithubRepoParams {
  repoUrl: string;
  targetAppId: number;
}

/**
 * Integrate GitHub repo parameters
 */
export interface IntegrateGithubRepoParams {
  repoUrl: string;
  targetAppId: number;
  approach: "recreate" | "integrate" | "tailor";
  analysisResult: AnalyzeGithubRepoResult;
}

/**
 * Connect to existing Vercel project parameters
 */
export interface ConnectToExistingVercelProjectParams {
  projectId: string;
  appId: number;
}

/**
 * Is Vercel project available response
 */
export interface IsVercelProjectAvailableResponse {
  available: boolean;
  reason?: string;
}

/**
 * Create Vercel project parameters
 */
export interface CreateVercelProjectParams {
  name: string;
  appId: number;
}

/**
 * Get Vercel deployments parameters
 */
export interface GetVercelDeploymentsParams {
  appId: number;
}

/**
 * Disconnect Vercel project parameters
 */
export interface DisconnectVercelProjectParams {
  appId: number;
}

/**
 * Is Vercel project available parameters
 */
export interface IsVercelProjectAvailableParams {
  name: string;
}

/**
 * Save Vercel access token parameters
 */
export interface SaveVercelAccessTokenParams {
  token: string;
}

/**
 * Create Neon project parameters
 */
export interface CreateNeonProjectParams {
  name: string;
  appId: number;
}

/**
 * Get Neon project parameters
 */
export interface GetNeonProjectParams {
  appId: number;
}

/**
 * Get Neon project response
 */
export interface GetNeonProjectResponse {
  projectId: string;
  projectName: string;
  orgId: string;
  branches: NeonBranch[];
}

/**
 * Revert version parameters
 */
export interface RevertVersionParams {
  appId: number;
  previousVersionId: string;
}

/**
 * Revert version response
 */
export type RevertVersionResponse =
  | { successMessage: string }
  | { warningMessage: string };

/**
 * Setup local Supabase parameters
 */
export interface SetupLocalSupabaseParams {
  appId: number;
}

/**
 * Stop local Supabase parameters
 */
export interface StopLocalSupabaseParams {
  appId: number;
}

/**
 * Production promotion parameters
 */
export interface ProductionPromotionParams {
  appId: number;
  productionProjectRef: string;
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  dbPassword: string;
}
