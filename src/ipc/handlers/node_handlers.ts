import { ipcMain } from "electron";
import { execSync } from "child_process";
import { platform, arch } from "os";
import { NodeSystemInfo } from "../ipc_types";
import fixPath from "fix-path";
import { runShellCommand } from "../utils/runShellCommand";
import log from "electron-log";

const logger = log.scope("node_handlers");

export function registerNodeHandlers() {
  ipcMain.handle("nodejs-status", async (): Promise<NodeSystemInfo> => {
    logger.log(
      "handling ipc: nodejs-status for platform:",
      platform(),
      "and arch:",
      arch(),
    );
    // Run checks in parallel
    const [nodeVersion, npmVersion] = await Promise.all([
      runShellCommand("node --version"),
      runShellCommand("npm --version").catch(async (error) => {
        logger.warn("Failed to get npm version:", error);
        return "Not available";
      }),
    ]);
    // Default to mac download url.
    let nodeDownloadUrl = "https://nodejs.org/dist/v22.14.0/node-v22.14.0.pkg";
    if (platform() == "win32") {
      if (arch() === "arm64" || arch() === "arm") {
        nodeDownloadUrl =
          "https://nodejs.org/dist/v22.14.0/node-v22.14.0-arm64.msi";
      } else {
        // x64 is the most common architecture for Windows so it's the
        // default download url.
        nodeDownloadUrl =
          "https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi";
      }
    }
    return { nodeVersion, pnpmVersion: npmVersion, nodeDownloadUrl };
  });

  ipcMain.handle("reload-env-path", async (): Promise<void> => {
    logger.debug("Reloading env path, previously:", process.env.PATH);
    if (platform() === "win32") {
      const newPath = execSync("cmd /c echo %PATH%", {
        encoding: "utf8",
      }).trim();
      process.env.PATH = newPath;
    } else {
      fixPath();
    }
    logger.debug("Reloaded env path, now:", process.env.PATH);
  });
}
