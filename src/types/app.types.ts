/**
 * App Domain Types
 * 
 * Type definitions related to applications, files, and app settings.
 */

/**
 * Core application entity
 */
export interface App {
  id: number;
  name: string;
  path: string;
  files: string[];
  createdAt: Date;
  updatedAt: Date;
  githubOrg: string | null;
  githubRepo: string | null;
  githubBranch: string | null;
  supabaseProjectId: string | null;
  supabaseProjectName: string | null;
  neonProjectId: string | null;
  neonDevelopmentBranchId: string | null;
  neonPreviewBranchId: string | null;
  vercelProjectId: string | null;
  vercelProjectName: string | null;
  vercelTeamSlug: string | null;
  vercelDeploymentUrl: string | null;
  installCommand: string | null;
  startCommand: string | null;
  preferredPackageManager: string | null;
  previewUrl: string | null;
}

/**
 * Application settings
 */
export interface AppSettings {
  preferredPackageManager: "npm" | "yarn" | "pnpm" | "bun" | null;
  previewUrl: string | null;
}

/**
 * Application output types
 */
export interface AppOutput {
  type: "stdout" | "stderr" | "info" | "client-error" | "input-requested";
  message: string;
  timestamp: number;
  appId: number;
}

/**
 * App upgrade information
 */
export interface AppUpgrade {
  id: string;
  title: string;
  description: string;
  manualUpgradeUrl: string;
  isNeeded: boolean;
}

/**
 * Environment variable configuration
 */
export interface EnvVar {
  key: string;
  value: string;
}

/**
 * Component selection within an app
 */
export interface ComponentSelection {
  id: string;
  name: string;
  relativePath: string;
  lineNumber: number;
  columnNumber: number;
}

/**
 * Sandbox configuration for web preview
 */
export interface SandboxConfig {
  files: Record<string, string>;
  dependencies: Record<string, string>;
  entry: string;
}
