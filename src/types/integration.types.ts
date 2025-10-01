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
    complexity: 'simple' | 'moderate' | 'complex';
    integrationApproaches: {
      recreate: {
        feasible: boolean;
        effort: 'low' | 'medium' | 'high';
        description: string;
      };
      integrate: {
        feasible: boolean;
        effort: 'low' | 'medium' | 'high';
        description: string;
      };
      tailor: {
        feasible: boolean;
        effort: 'low' | 'medium' | 'high';
        description: string;
      };
    };
    recommendation: 'recreate' | 'integrate' | 'tailor';
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
