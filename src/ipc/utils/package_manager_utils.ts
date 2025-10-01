import { runShellCommand } from "./runShellCommand";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import log from "electron-log";
import { readSettings } from "@/main/settings";

const logger = log.scope("package_manager_utils");

export interface PackageManagerInfo {
  name: "pnpm" | "npm" | "yarn" | "bun";
  version: string | null;
  available: boolean;
}

export interface ProjectPackageManagerInfo {
  detected: "pnpm" | "npm" | "yarn" | "bun" | null;
  hasPackageJson: boolean;
  hasLockFiles: {
    pnpmLock: boolean;
    yarnLock: boolean;
    packageLock: boolean;
    bunLock: boolean;
  };
}

/**
 * Detect available package managers on the system
 */
export async function detectSystemPackageManagers(): Promise<
  PackageManagerInfo[]
> {
  const packageManagers: PackageManagerInfo[] = [];

  // Check for each package manager
  const managers = [
    { name: "pnpm" as const, command: "pnpm --version" },
    { name: "npm" as const, command: "npm --version" },
    { name: "yarn" as const, command: "yarn --version" },
    { name: "bun" as const, command: "bun --version" },
  ];

  for (const manager of managers) {
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
  }

  return packageManagers;
}

/**
 * Get the preferred package manager for the system
 * Priority order: pnpm > yarn > bun > npm
 */
export async function getPreferredSystemPackageManager(): Promise<PackageManagerInfo | null> {
  const managers = await detectSystemPackageManagers();

  // Priority order
  const preferenceOrder: Array<"pnpm" | "npm" | "yarn" | "bun"> = [
    "pnpm",
    "yarn",
    "bun",
    "npm",
  ];

  for (const preferred of preferenceOrder) {
    const manager = managers.find((m) => m.name === preferred && m.available);
    if (manager) {
      logger.info(`Using preferred system package manager: ${manager.name}`);
      return manager;
    }
  }

  logger.warn("No package manager found on system");
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
    fs.access(path.join(projectPath, "pnpm-lock.yaml")),
    fs.access(path.join(projectPath, "yarn.lock")),
    fs.access(path.join(projectPath, "package-lock.json")),
    fs.access(path.join(projectPath, "bun.lockb")),
  ]);

  const hasPackageJson = checks[0].status === "fulfilled";
  const hasPnpmLock = checks[1].status === "fulfilled";
  const hasYarnLock = checks[2].status === "fulfilled";
  const hasPackageLock = checks[3].status === "fulfilled";
  const hasBunLock = checks[4].status === "fulfilled";

  let detected: "pnpm" | "npm" | "yarn" | "bun" | null = null;

  // Detect based on lock files
  if (hasPnpmLock) {
    detected = "pnpm";
  } else if (hasYarnLock) {
    detected = "yarn";
  } else if (hasBunLock) {
    detected = "bun";
  } else if (hasPackageLock) {
    detected = "npm";
  }

  logger.debug(`Project ${projectPath} detected package manager: ${detected}`);

  return {
    detected,
    hasPackageJson,
    hasLockFiles: {
      pnpmLock: hasPnpmLock,
      yarnLock: hasYarnLock,
      packageLock: hasPackageLock,
      bunLock: hasBunLock,
    },
  };
}

/**
 * Get the best package manager for a project
 * Prioritizes app-level preference, then user-selected preference, then project-detected manager, then falls back to system preference
 */
export async function getBestPackageManagerForProject(
  projectPath: string,
  appPreferredPackageManager?: "npm" | "yarn" | "pnpm" | "bun" | null,
): Promise<PackageManagerInfo | null> {
  const settings = readSettings();
  const systemManagers = await detectSystemPackageManagers();

  // First priority: App-level preferred package manager
  if (appPreferredPackageManager) {
    const appPreferredManager = systemManagers.find(
      (m) => m.name === appPreferredPackageManager && m.available,
    );
    if (appPreferredManager) {
      logger.info(
        `Using app-level preferred package manager: ${appPreferredManager.name}`,
      );
      return appPreferredManager;
    } else {
      logger.warn(
        `App prefers ${appPreferredPackageManager} but it's not available on system`,
      );
    }
  }

  // Second priority: User's preferred package manager from settings
  if (settings.preferredPackageManager) {
    const preferredManager = systemManagers.find(
      (m) => m.name === settings.preferredPackageManager && m.available,
    );
    if (preferredManager) {
      logger.info(
        `Using user-preferred package manager from settings: ${preferredManager.name}`,
      );
      return preferredManager;
    } else {
      logger.warn(
        `User prefers ${settings.preferredPackageManager} but it's not available on system`,
      );
    }
  }

  // Third priority: Project-detected package manager
  const projectInfo = await detectProjectPackageManager(projectPath);
  if (projectInfo.detected) {
    const systemManager = systemManagers.find(
      (m) => m.name === projectInfo.detected && m.available,
    );
    if (systemManager) {
      logger.info(
        `Using project-detected package manager: ${systemManager.name}`,
      );
      return systemManager;
    } else {
      logger.warn(
        `Project prefers ${projectInfo.detected} but it's not available on system`,
      );
    }
  }

  // Fall back to system preference
  const systemPreferred = await getPreferredSystemPackageManager();
  if (systemPreferred) {
    logger.info(
      `Falling back to system preferred package manager: ${systemPreferred.name}`,
    );
    return systemPreferred;
  }

  return null;
}

/**
 * Generate install command for a package manager
 */
export function getInstallCommand(manager: PackageManagerInfo): string {
  switch (manager.name) {
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn install";
    case "bun":
      return "bun install";
    case "npm":
    default:
      return "npm install --legacy-peer-deps";
  }
}

/**
 * Generate dev server command for a package manager
 */
export function getDevCommand(
  manager: PackageManagerInfo,
  port?: number,
): string {
  const portArg = port ? ` --port ${port}` : "";

  switch (manager.name) {
    case "pnpm":
      return `pnpm run dev${portArg}`;
    case "yarn":
      return `yarn dev${portArg}`;
    case "bun":
      return `bun run dev${portArg}`;
    case "npm":
    default:
      return `npm run dev${port ? ` -- --port ${port}` : ""}`;
  }
}

/**
 * Generate add dev dependency command for a package manager
 */
export function getAddDevDependencyCommand(
  manager: PackageManagerInfo,
  packages: string[],
): string {
  const packageStr = packages.join(" ");

  switch (manager.name) {
    case "pnpm":
      return `pnpm add -D ${packageStr}`;
    case "yarn":
      return `yarn add -D ${packageStr}`;
    case "bun":
      return `bun add -d ${packageStr}`;
    case "npm":
    default:
      return `npm install --save-dev --legacy-peer-deps ${packageStr}`;
  }
}
/**
 * Generate add dependency command for a package manager
 */
export function getAddDependencyCommand(
  manager: PackageManagerInfo,
  packages: string[],
): string {
  const packageStr = packages.join(" ");

  switch (manager.name) {
    case "pnpm":
      return `pnpm add ${packageStr}`;
    case "yarn":
      return `yarn add ${packageStr}`;
    case "bun":
      return `bun add ${packageStr}`;
    case "npm":
    default:
      return `npm install --legacy-peer-deps ${packageStr}`;
  }
}

/**
 * Generate a full command with fallbacks for multiple package managers
 * This creates a command that tries the preferred manager first, then falls back to others
 */
export async function generateCommandWithFallbacks(
  projectPath: string,
  commandType: "install" | "dev" | "addDependency" | "addDevDependency",
  options: {
    port?: number;
    packages?: string[];
    appPreferredPackageManager?: "npm" | "yarn" | "pnpm" | "bun" | null;
  } = {},
): Promise<string> {
  const systemManagers = await detectSystemPackageManagers();
  const availableManagers = systemManagers.filter((m) => m.available);

  if (availableManagers.length === 0) {
    throw new Error("No package manager available on system");
  }

  const projectManager = await getBestPackageManagerForProject(
    projectPath,
    options.appPreferredPackageManager,
  );

  // Create fallback commands in priority order
  const commands: string[] = [];

  if (projectManager) {
    // Add the preferred/detected manager first
    if (commandType === "install") {
      commands.push(getInstallCommand(projectManager));
    } else if (commandType === "dev") {
      commands.push(getDevCommand(projectManager, options.port));
    } else if (commandType === "addDependency" && options.packages) {
      commands.push(getAddDependencyCommand(projectManager, options.packages));
    } else if (commandType === "addDevDependency" && options.packages) {
      commands.push(
        getAddDevDependencyCommand(projectManager, options.packages),
      );
    }
  }

  // Add fallbacks for other available managers
  const fallbackOrder: Array<"pnpm" | "yarn" | "bun" | "npm"> = [
    "pnpm",
    "yarn",
    "bun",
    "npm",
  ];

  for (const managerName of fallbackOrder) {
    const manager = availableManagers.find((m) => m.name === managerName);
    if (manager && (!projectManager || manager.name !== projectManager.name)) {
      if (commandType === "install") {
        commands.push(getInstallCommand(manager));
      } else if (commandType === "dev") {
        commands.push(getDevCommand(manager, options.port));
      } else if (commandType === "addDependency" && options.packages) {
        commands.push(getAddDependencyCommand(manager, options.packages));
      } else if (commandType === "addDevDependency" && options.packages) {
        commands.push(getAddDevDependencyCommand(manager, options.packages));
      }
    }
  }

  // Join commands with OR operator for fallback behavior
  return commands.join(" || ");
}
