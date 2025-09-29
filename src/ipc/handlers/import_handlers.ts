import { dialog } from "electron";
import fs from "fs/promises";
import path from "path";
import { createLoggedHandler } from "./safe_handle";
import log from "electron-log";
import { getDyadAppPath } from "../../paths/paths";
import { apps } from "@/db/schema";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq } from "drizzle-orm";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import { exec } from "child_process";
import { promisify } from "util";
import { readSettings } from "../../main/settings";

import {
  ImportAppParams,
  ImportAppResult,
  ImportAppFromGithubParams,
} from "../ipc_types";
import { copyDirectoryRecursive } from "../utils/file_utils";
import { gitCommit } from "../utils/git_utils";

const execAsync = promisify(exec);

const logger = log.scope("import-handlers");
const handle = createLoggedHandler(logger);

// Helper function to detect package manager from repository
async function detectPackageManager(repoPath: string): Promise<{
  hasPackageJson: boolean;
  hasYarnLock: boolean;
  hasPnpmLock: boolean;
  hasNodeModules: boolean;
}> {
  const checks = await Promise.allSettled([
    fs.access(path.join(repoPath, "package.json")),
    fs.access(path.join(repoPath, "yarn.lock")),
    fs.access(path.join(repoPath, "pnpm-lock.yaml")),
    fs.access(path.join(repoPath, "node_modules")),
  ]);

  return {
    hasPackageJson: checks[0].status === "fulfilled",
    hasYarnLock: checks[1].status === "fulfilled",
    hasPnpmLock: checks[2].status === "fulfilled",
    hasNodeModules: checks[3].status === "fulfilled",
  };
}

export function registerImportHandlers() {
  // Handler for selecting an app folder
  handle("select-app-folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select App Folder to Import",
    });

    if (result.canceled) {
      return { path: null, name: null };
    }

    const selectedPath = result.filePaths[0];
    const folderName = path.basename(selectedPath);

    return { path: selectedPath, name: folderName };
  });

  // Handler for checking if AI_RULES.md exists
  handle("check-ai-rules", async (_, { path: appPath }: { path: string }) => {
    try {
      await fs.access(path.join(appPath, "AI_RULES.md"));
      return { exists: true };
    } catch {
      return { exists: false };
    }
  });

  // Handler for checking if an app name is already taken
  handle("check-app-name", async (_, { appName }: { appName: string }) => {
    // Check filesystem
    const appPath = getDyadAppPath(appName);
    try {
      await fs.access(appPath);
      return { exists: true };
    } catch {
      // Path doesn't exist, continue checking database
    }

    // Check database
    const existingApp = await db.query.apps.findFirst({
      where: eq(apps.name, appName),
    });

    return { exists: !!existingApp };
  });

  // Handler for importing an app
  handle(
    "import-app",
    async (
      _,
      {
        path: sourcePath,
        appName,
        installCommand,
        startCommand,
      }: ImportAppParams,
    ): Promise<ImportAppResult> => {
      // Validate the source path exists
      try {
        await fs.access(sourcePath);
      } catch {
        throw new Error("Source folder does not exist");
      }

      const destPath = getDyadAppPath(appName);

      // Check if the app already exists
      const errorMessage = "An app with this name already exists";
      try {
        await fs.access(destPath);
        throw new Error(errorMessage);
      } catch (error: any) {
        if (error.message === errorMessage) {
          throw error;
        }
      }
      // Copy the app folder to the Dyad apps directory.
      // Why not use fs.cp? Because we want stable ordering for
      // tests.
      await copyDirectoryRecursive(sourcePath, destPath);

      const isGitRepo = await fs
        .access(path.join(destPath, ".git"))
        .then(() => true)
        .catch(() => false);
      if (!isGitRepo) {
        // Initialize git repo and create first commit
        await git.init({
          fs: fs,
          dir: destPath,
          defaultBranch: "main",
        });

        // Stage all files
        await git.add({
          fs: fs,
          dir: destPath,
          filepath: ".",
        });

        // Create initial commit
        await gitCommit({
          path: destPath,
          message: "Init Dyad app",
        });
      }

      // Create a new app
      const [app] = await db
        .insert(apps)
        .values({
          name: appName,
          // Use the name as the path for now
          path: appName,
          installCommand: installCommand ?? null,
          startCommand: startCommand ?? null,
        })
        .returning();

      // Create an initial chat for this app
      const [chat] = await db
        .insert(chats)
        .values({
          appId: app.id,
        })
        .returning();
      return { appId: app.id, chatId: chat.id };
    },
  );

  // Handler for importing an app from GitHub
  handle(
    "import-app-from-github",
    async (
      _,
      {
        repoUrl,
        appName,
        installCommand,
        startCommand,
      }: ImportAppFromGithubParams,
    ): Promise<ImportAppResult> => {
      // Validate and parse GitHub URL
      let orgName: string;
      let repoName: string;

      try {
        // Handle various GitHub URL formats and clean them up
        let cleanUrl = repoUrl.trim();

        // Handle github.com URLs without protocol
        if (cleanUrl.startsWith("github.com/")) {
          cleanUrl = "https://" + cleanUrl;
        }

        // Handle SSH URLs by converting to HTTPS
        if (cleanUrl.startsWith("git@github.com:")) {
          cleanUrl = cleanUrl.replace("git@github.com:", "https://github.com/");
        }

        const url = new URL(cleanUrl);
        if (url.protocol !== "https:") {
          throw new Error("Repository URL must use HTTPS.");
        }
        if (url.hostname !== "github.com") {
          throw new Error("Repository URL must be a github.com URL.");
        }

        // Pathname will be like "/org/repo" or "/org/repo.git"
        const pathParts = url.pathname
          .split("/")
          .filter((part) => part.length > 0);

        if (pathParts.length !== 2) {
          throw new Error(
            "Invalid repository URL format. Expected 'https://github.com/org/repo'",
          );
        }

        orgName = pathParts[0];
        repoName = path.basename(pathParts[1], ".git"); // Remove .git suffix if present

        if (!orgName || !repoName) {
          throw new Error(
            "Failed to parse organization or repository name from URL.",
          );
        }

        logger.info(
          `Parsed GitHub URL: ${orgName}/${repoName} from ${repoUrl}`,
        );
      } catch (error: any) {
        if (error.message.includes("Invalid URL")) {
          throw new Error(
            `Invalid GitHub repository URL format. Please use format: https://github.com/owner/repo`,
          );
        }
        throw error;
      }

      logger.info(
        `Importing GitHub repo: ${orgName}/${repoName} as app: ${appName}`,
      );

      // Check GitHub authentication first
      const settings = readSettings();
      const githubToken = settings.githubAccessToken?.value;

      // Check if repository is accessible via GitHub API
      try {
        const apiUrl = `https://api.github.com/repos/${orgName}/${repoName}`;
        const headers: Record<string, string> = {
          "User-Agent": "Dyad",
          Accept: "application/vnd.github.v3+json",
        };

        // Add authentication if available
        if (githubToken) {
          headers["Authorization"] = `Bearer ${githubToken}`;
        }

        const response = await http.request({
          url: apiUrl,
          method: "GET",
          headers,
        });

        if (response.statusCode === 401) {
          throw new Error(
            `GitHub authentication failed. Please connect your GitHub account in Settings to access repositories.`,
          );
        } else if (response.statusCode === 403) {
          if (!githubToken) {
            throw new Error(
              `Repository ${orgName}/${repoName} requires authentication. Please connect your GitHub account in Settings to access private repositories.`,
            );
          } else {
            throw new Error(
              `Access denied to repository ${orgName}/${repoName}. You may not have permission to access this repository.`,
            );
          }
        } else if (response.statusCode === 404) {
          if (!githubToken) {
            throw new Error(
              `Repository ${orgName}/${repoName} not found. If this is a private repository, please connect your GitHub account in Settings.`,
            );
          } else {
            throw new Error(
              `Repository ${orgName}/${repoName} not found or you don't have access to it.`,
            );
          }
        } else if (response.statusCode !== 200) {
          throw new Error(
            `Failed to access repository: ${response.statusCode} ${response.statusMessage}`,
          );
        }

        logger.info(`Repository ${orgName}/${repoName} is accessible`);
      } catch (error: any) {
        if (
          error.message.includes("authentication") ||
          error.message.includes("access") ||
          error.message.includes("not found")
        ) {
          throw error;
        }
        throw new Error(
          `Network error: Unable to access GitHub repository. ${error.message}`,
        );
      }

      const destPath = getDyadAppPath(appName);

      // Check if the app already exists
      const errorMessage = "An app with this name already exists";
      try {
        await fs.access(destPath);
        throw new Error(errorMessage);
      } catch (error: any) {
        if (error.message === errorMessage) {
          throw error;
        }
      }

      // Clone the repository directly to the destination
      logger.info(`Cloning ${repoUrl} to ${destPath}`);
      try {
        const cloneOptions: any = {
          fs,
          http,
          dir: destPath,
          url: repoUrl,
          singleBranch: true,
          depth: 1,
        };

        // Add authentication if available
        if (githubToken) {
          cloneOptions.headers = {
            Authorization: `Bearer ${githubToken}`,
          };
        }

        await git.clone(cloneOptions);
        logger.info(`Successfully cloned ${repoUrl} to ${destPath}`);
      } catch (err: any) {
        logger.error(`Failed to clone ${repoUrl} to ${destPath}: `, err);
        // Clean up partial clone if it exists
        try {
          await fs.rm(destPath, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }

        // Provide better error messages
        if (
          err.message.includes("authentication") ||
          err.message.includes("401") ||
          err.message.includes("403")
        ) {
          throw new Error(
            `Authentication failed while cloning repository. Please ensure your GitHub token has the necessary permissions.`,
          );
        } else if (err.message.includes("404")) {
          throw new Error(
            `Repository not found during cloning. The repository may have been deleted or made private.`,
          );
        } else {
          throw new Error(`Failed to clone repository: ${err.message}`);
        }
      }

      // Remove .git directory to avoid conflicts
      try {
        await fs.rm(path.join(destPath, ".git"), {
          recursive: true,
          force: true,
        });
      } catch {
        // Ignore if .git doesn't exist
      }

      // Initialize new git repo and create first commit
      await git.init({
        fs: fs,
        dir: destPath,
        defaultBranch: "main",
      });

      // Stage all files
      await git.add({
        fs: fs,
        dir: destPath,
        filepath: ".",
      });

      // Create initial commit
      await gitCommit({
        path: destPath,
        message: `Import from GitHub: ${orgName}/${repoName}`,
      });

      // Detect project characteristics for better setup
      const packageInfo = await detectPackageManager(destPath);

      // Automatically set install/start commands if not provided and package.json exists
      let finalInstallCommand = installCommand;
      let finalStartCommand = startCommand;

      if (packageInfo.hasPackageJson && !finalInstallCommand) {
        if (packageInfo.hasPnpmLock) {
          finalInstallCommand = "pnpm install";
          if (!finalStartCommand) finalStartCommand = "pnpm dev";
        } else if (packageInfo.hasYarnLock) {
          finalInstallCommand = "yarn install";
          if (!finalStartCommand) finalStartCommand = "yarn dev";
        } else {
          finalInstallCommand = "npm install";
          if (!finalStartCommand) finalStartCommand = "npm run dev";
        }
        logger.info(
          `Auto-detected package manager and set commands: install="${finalInstallCommand}", start="${finalStartCommand}"`,
        );
      }

      // Run post-import setup if install command is provided or detected
      if (finalInstallCommand && packageInfo.hasPackageJson) {
        logger.info(
          `Running post-import setup command: ${finalInstallCommand}`,
        );
        try {
          await execAsync(finalInstallCommand, {
            cwd: destPath,
            timeout: 300000,
          }); // 5 minute timeout
          logger.info(`Successfully completed post-import setup`);
        } catch (error: any) {
          logger.warn(
            `Post-import setup failed (continuing anyway): ${error.message}`,
          );
          // Don't throw error here - the app import is still successful even if setup fails
        }
      }

      // Create a new app
      const [app] = await db
        .insert(apps)
        .values({
          name: appName,
          path: appName,
          installCommand: finalInstallCommand ?? null,
          startCommand: finalStartCommand ?? null,
        })
        .returning();

      // Create an initial chat for this app
      const [chat] = await db
        .insert(chats)
        .values({
          appId: app.id,
        })
        .returning();

      logger.info(
        `Successfully imported GitHub app: ${appName} (ID: ${app.id})`,
      );
      return { appId: app.id, chatId: chat.id };
    },
  );

  logger.debug("Registered import IPC handlers");
}
