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

import { ImportAppParams, ImportAppResult, ImportAppFromGithubParams } from "../ipc_types";
import { copyDirectoryRecursive } from "../utils/file_utils";
import { gitCommit } from "../utils/git_utils";

const logger = log.scope("import-handlers");
const handle = createLoggedHandler(logger);

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
        const url = new URL(repoUrl);
        if (url.protocol !== "https:") {
          throw new Error("Repository URL must use HTTPS.");
        }
        if (url.hostname !== "github.com") {
          throw new Error("Repository URL must be a github.com URL.");
        }

        // Pathname will be like "/org/repo" or "/org/repo.git"
        const pathParts = url.pathname.split("/").filter((part) => part.length > 0);

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
      } catch (error: any) {
        if (error.message.includes("Invalid URL")) {
          throw new Error("Invalid GitHub repository URL format.");
        }
        throw error;
      }

      logger.info(`Importing GitHub repo: ${orgName}/${repoName} as app: ${appName}`);

      // Check if repository is accessible via GitHub API
      try {
        const apiUrl = `https://api.github.com/repos/${orgName}/${repoName}`;
        const response = await http.request({
          url: apiUrl,
          method: "GET",
          headers: {
            "User-Agent": "Dyad",
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (response.statusCode === 404) {
          throw new Error(
            `Repository ${orgName}/${repoName} not found or is private. Please check the URL and ensure the repository is public.`
          );
        } else if (response.statusCode !== 200) {
          throw new Error(
            `Failed to access repository: ${response.statusCode} ${response.statusMessage}`
          );
        }
      } catch (error: any) {
        if (error.message.includes("not found or is private")) {
          throw error;
        }
        throw new Error(`Network error: Unable to access GitHub repository. ${error.message}`);
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
        await git.clone({
          fs,
          http,
          dir: destPath,
          url: repoUrl,
          singleBranch: true,
          depth: 1,
        });
        logger.info(`Successfully cloned ${repoUrl} to ${destPath}`);
      } catch (err: any) {
        logger.error(`Failed to clone ${repoUrl} to ${destPath}: `, err);
        // Clean up partial clone if it exists
        try {
          await fs.rm(destPath, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
        throw new Error(`Failed to clone repository: ${err.message}`);
      }

      // Remove .git directory to avoid conflicts
      try {
        await fs.rm(path.join(destPath, ".git"), { recursive: true, force: true });
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

      // Create a new app
      const [app] = await db
        .insert(apps)
        .values({
          name: appName,
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

      logger.info(`Successfully imported GitHub app: ${appName} (ID: ${app.id})`);
      return { appId: app.id, chatId: chat.id };
    },
  );

  logger.debug("Registered import IPC handlers");
}
