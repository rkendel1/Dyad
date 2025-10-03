import { runShellCommand } from "./runShellCommand";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import log from "electron-log";
import { readSettings } from "@/main/settings";

const logger = log.scope("package_manager_utils");

export interface PackageManagerInfo {
  name: "npm";
  version: string | null;
  available: boolean;
}

export interface ProjectPackageManagerInfo {
  detected: "npm" | null;
  hasPackageJson: boolean;
  hasLockFiles: {
    packageLock: boolean;
  };
}

/**
 * Detect available package managers on the system
 */
export async function detectSystemPackageManagers(): Promise<
  PackageManagerInfo[]
> {
  const packageManagers: PackageManagerInfo[] = [];

  // Check for npm only
  const manager = { name: "npm" as const, command: "npm --version" };

  try {
    const version = await runShellCommand(manager.command);
    packageManagers.push({
      name: manager.name,
      version: version?.trim() || null,
      available: true,
    });
    logger.debug(`Found ${manager.name} version: ${version?.trim()}`);
  } catch (error) {
    packageManagers.push({
      name: manager.name,
      version: null,
      available: false,
    });
    logger.debug(`${manager.name} not available: ${error}`);
  }

  return packageManagers;
}

/**
 * Get the preferred package manager for the system
 * Always returns npm
 */
export async function getPreferredSystemPackageManager(): Promise<PackageManagerInfo | null> {
  const managers = await detectSystemPackageManagers();

  const manager = managers.find((m) => m.name === "npm" && m.available);
  if (manager) {
    logger.info(`Using npm as package manager`);
    return manager;
  }

  logger.warn("npm not found on system");
  return null;
}

/**
 * Detect package manager configuration for a specific project
 */
export async function detectProjectPackageManager(
  projectPath: string,
): Promise<ProjectPackageManagerInfo> {
  const checks = await Promise.allSettled([
    fs.access(path.join(projectPath, "package.json")),
    fs.access(path.join(projectPath, "package-lock.json")),
  ]);

  const hasPackageJson = checks[0].status === "fulfilled";
  const hasPackageLock = checks[1].status === "fulfilled";

  let detected: "npm" | null = null;

  // Detect based on lock file
  if (hasPackageLock) {
    detected = "npm";
  } else if (hasPackageJson) {
    detected = "npm"; // Default to npm if package.json exists
  }

  logger.debug(`Project ${projectPath} detected package manager: ${detected}`);

  return {
    detected,
    hasPackageJson,
    hasLockFiles: {
      packageLock: hasPackageLock,
    },
  };
}

/**
 * Get the best package manager for a project
 * Always returns npm
 */
export async function getBestPackageManagerForProject(
  projectPath: string,
  appPreferredPackageManager?: "npm" | null,
): Promise<PackageManagerInfo | null> {
  const systemManagers = await detectSystemPackageManagers();

  // Always use npm
  const npmManager = systemManagers.find(
    (m) => m.name === "npm" && m.available,
  );
  if (npmManager) {
    logger.info(`Using npm as package manager`);
    return npmManager;
  }

  logger.warn("npm not available on system");
  return null;
}

/**
 * Generate install command for a package manager
 */
export function getInstallCommand(manager: PackageManagerInfo): string {
  return "npm install --legacy-peer-deps";
}

/**
 * Generate dev server command for a package manager
 */
export function getDevCommand(
  manager: PackageManagerInfo,
  port?: number,
): string {
  return `npm run dev${port ? ` -- --port ${port}` : ""}`;
}

/**
 * Generate add dev dependency command for a package manager
 */
export function getAddDevDependencyCommand(
  manager: PackageManagerInfo,
  packages: string[],
): string {
  const packageStr = packages.join(" ");
  return `npm install --save-dev --legacy-peer-deps ${packageStr}`;
}
/**
 * Generate add dependency command for a package manager
 */
export function getAddDependencyCommand(
  manager: PackageManagerInfo,
  packages: string[],
): string {
  const packageStr = packages.join(" ");
  return `npm install --legacy-peer-deps ${packageStr}`;
}

/**
 * Generate a full command with fallbacks for multiple package managers
 * Now simplified to use npm only
 */
export async function generateCommandWithFallbacks(
  projectPath: string,
  commandType: "install" | "dev" | "addDependency" | "addDevDependency",
  options: {
    port?: number;
    packages?: string[];
    appPreferredPackageManager?: "npm" | null;
  } = {},
): Promise<string> {
  const systemManagers = await detectSystemPackageManagers();
  const availableManagers = systemManagers.filter((m) => m.available);

  if (availableManagers.length === 0) {
    throw new Error("npm is not available on system");
  }

  const manager = availableManagers[0]; // Will always be npm

  // Generate the command
  if (commandType === "install") {
    return getInstallCommand(manager);
  } else if (commandType === "dev") {
    return getDevCommand(manager, options.port);
  } else if (commandType === "addDependency" && options.packages) {
    return getAddDependencyCommand(manager, options.packages);
  } else if (commandType === "addDevDependency" && options.packages) {
    return getAddDevDependencyCommand(manager, options.packages);
  }

  return "";
}
