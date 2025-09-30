import { describe, it, expect, vi, beforeEach } from "vitest";
import { promises as fs } from "node:fs";
import {
  detectSystemPackageManagers,
  getPreferredSystemPackageManager,
  detectProjectPackageManager,
  getInstallCommand,
  getDevCommand,
  getAddDependencyCommand,
  getAddDevDependencyCommand,
} from "../ipc/utils/package_manager_utils";
import { runShellCommand } from "../ipc/utils/runShellCommand";

// Mock the runShellCommand function
vi.mock("../ipc/utils/runShellCommand");

describe("Package Manager Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detectSystemPackageManagers", () => {
    it("should detect available package managers", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);
      
      // Mock the exact order as called in detectSystemPackageManagers: pnpm, npm, yarn, bun
      mockRunShellCommand
        .mockRejectedValueOnce(new Error("pnpm: command not found")) // pnpm --version
        .mockResolvedValueOnce("10.8.2") // npm --version
        .mockResolvedValueOnce("1.22.22") // yarn --version
        .mockRejectedValueOnce(new Error("bun: command not found")); // bun --version

      const result = await detectSystemPackageManagers();

      expect(result).toHaveLength(4);
      expect(result.find(pm => pm.name === "npm")).toEqual({
        name: "npm",
        version: "10.8.2",
        available: true,
      });
      expect(result.find(pm => pm.name === "yarn")).toEqual({
        name: "yarn",
        version: "1.22.22",
        available: true,
      });
      expect(result.find(pm => pm.name === "pnpm")).toEqual({
        name: "pnpm",
        version: null,
        available: false,
      });
      expect(result.find(pm => pm.name === "bun")).toEqual({
        name: "bun",
        version: null,
        available: false,
      });
    });
  });

  describe("getPreferredSystemPackageManager", () => {
    it("should return pnpm if available (highest priority)", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);
      // Mock all package managers as available, pnpm should be selected
      mockRunShellCommand
        .mockResolvedValueOnce("8.6.1") // pnpm --version
        .mockResolvedValueOnce("10.8.2") // npm --version
        .mockResolvedValueOnce("1.22.22") // yarn --version
        .mockResolvedValueOnce("1.0.0"); // bun --version

      const result = await getPreferredSystemPackageManager();

      expect(result).toEqual({
        name: "pnpm",
        version: "8.6.1",
        available: true,
      });
    });

    it("should return yarn if pnpm not available", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);
      // Mock: pnpm not available, others available, yarn should be selected
      mockRunShellCommand
        .mockRejectedValueOnce(new Error("pnpm: command not found")) // pnpm --version
        .mockResolvedValueOnce("10.8.2") // npm --version
        .mockResolvedValueOnce("1.22.22") // yarn --version
        .mockResolvedValueOnce("1.0.0"); // bun --version

      const result = await getPreferredSystemPackageManager();

      expect(result).toEqual({
        name: "yarn",
        version: "1.22.22",
        available: true,
      });
    });

    it("should return npm as fallback", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);
      // Mock: only npm available
      mockRunShellCommand
        .mockRejectedValueOnce(new Error("pnpm: command not found")) // pnpm --version
        .mockResolvedValueOnce("10.8.2") // npm --version
        .mockRejectedValueOnce(new Error("yarn: command not found")) // yarn --version
        .mockRejectedValueOnce(new Error("bun: command not found")); // bun --version

      const result = await getPreferredSystemPackageManager();

      expect(result).toEqual({
        name: "npm",
        version: "10.8.2",
        available: true,
      });
    });

    it("should return null if no package manager available", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);
      // Mock: no package managers available
      mockRunShellCommand
        .mockRejectedValueOnce(new Error("pnpm: command not found"))
        .mockRejectedValueOnce(new Error("npm: command not found"))
        .mockRejectedValueOnce(new Error("yarn: command not found"))
        .mockRejectedValueOnce(new Error("bun: command not found"));

      const result = await getPreferredSystemPackageManager();

      expect(result).toBeNull();
    });
  });

  describe("detectProjectPackageManager", () => {
    it("should detect pnpm from pnpm-lock.yaml", async () => {
      const mockAccess = vi.spyOn(fs, "access");
      
      // Mock file existence: package.json and pnpm-lock.yaml exist
      mockAccess
        .mockResolvedValueOnce(undefined) // package.json
        .mockResolvedValueOnce(undefined) // pnpm-lock.yaml
        .mockRejectedValueOnce(new Error("ENOENT")) // yarn.lock
        .mockRejectedValueOnce(new Error("ENOENT")) // package-lock.json
        .mockRejectedValueOnce(new Error("ENOENT")); // bun.lockb

      const result = await detectProjectPackageManager("/fake/path");

      expect(result.detected).toBe("pnpm");
      expect(result.hasPackageJson).toBe(true);
      expect(result.hasLockFiles.pnpmLock).toBe(true);
      expect(result.hasLockFiles.yarnLock).toBe(false);
    });

    it("should detect yarn from yarn.lock", async () => {
      const mockAccess = vi.spyOn(fs, "access");
      
      // Mock file existence: package.json and yarn.lock exist
      mockAccess
        .mockResolvedValueOnce(undefined) // package.json
        .mockRejectedValueOnce(new Error("ENOENT")) // pnpm-lock.yaml
        .mockResolvedValueOnce(undefined) // yarn.lock
        .mockRejectedValueOnce(new Error("ENOENT")) // package-lock.json
        .mockRejectedValueOnce(new Error("ENOENT")); // bun.lockb

      const result = await detectProjectPackageManager("/fake/path");

      expect(result.detected).toBe("yarn");
      expect(result.hasPackageJson).toBe(true);
      expect(result.hasLockFiles.yarnLock).toBe(true);
      expect(result.hasLockFiles.pnpmLock).toBe(false);
    });

    it("should detect npm from package-lock.json", async () => {
      const mockAccess = vi.spyOn(fs, "access");
      
      // Mock file existence: package.json and package-lock.json exist
      mockAccess
        .mockResolvedValueOnce(undefined) // package.json
        .mockRejectedValueOnce(new Error("ENOENT")) // pnpm-lock.yaml
        .mockRejectedValueOnce(new Error("ENOENT")) // yarn.lock
        .mockResolvedValueOnce(undefined) // package-lock.json
        .mockRejectedValueOnce(new Error("ENOENT")); // bun.lockb

      const result = await detectProjectPackageManager("/fake/path");

      expect(result.detected).toBe("npm");
      expect(result.hasPackageJson).toBe(true);
      expect(result.hasLockFiles.packageLock).toBe(true);
    });

    it("should return null if no lock files found", async () => {
      const mockAccess = vi.spyOn(fs, "access");
      
      // Mock file existence: only package.json exists
      mockAccess
        .mockResolvedValueOnce(undefined) // package.json
        .mockRejectedValueOnce(new Error("ENOENT")) // pnpm-lock.yaml
        .mockRejectedValueOnce(new Error("ENOENT")) // yarn.lock
        .mockRejectedValueOnce(new Error("ENOENT")) // package-lock.json
        .mockRejectedValueOnce(new Error("ENOENT")); // bun.lockb

      const result = await detectProjectPackageManager("/fake/path");

      expect(result.detected).toBeNull();
      expect(result.hasPackageJson).toBe(true);
    });
  });

  describe("command generation", () => {
    it("should generate correct install commands", () => {
      expect(getInstallCommand({ name: "pnpm", version: "8.6.1", available: true }))
        .toBe("pnpm install");
      expect(getInstallCommand({ name: "yarn", version: "1.22.22", available: true }))
        .toBe("yarn install");
      expect(getInstallCommand({ name: "bun", version: "1.0.0", available: true }))
        .toBe("bun install");
      expect(getInstallCommand({ name: "npm", version: "10.8.2", available: true }))
        .toBe("npm install --legacy-peer-deps");
    });

    it("should generate correct dev commands", () => {
      expect(getDevCommand({ name: "pnpm", version: "8.6.1", available: true }, 3000))
        .toBe("pnpm run dev --port 3000");
      expect(getDevCommand({ name: "yarn", version: "1.22.22", available: true }, 3000))
        .toBe("yarn dev --port 3000");
      expect(getDevCommand({ name: "bun", version: "1.0.0", available: true }, 3000))
        .toBe("bun run dev --port 3000");
      expect(getDevCommand({ name: "npm", version: "10.8.2", available: true }, 3000))
        .toBe("npm run dev -- --port 3000");
    });

    it("should generate correct add dependency commands", () => {
      expect(getAddDependencyCommand({ name: "pnpm", version: "8.6.1", available: true }, ["react", "vue"]))
        .toBe("pnpm add react vue");
      expect(getAddDependencyCommand({ name: "yarn", version: "1.22.22", available: true }, ["react", "vue"]))
        .toBe("yarn add react vue");
      expect(getAddDependencyCommand({ name: "bun", version: "1.0.0", available: true }, ["react", "vue"]))
        .toBe("bun add react vue");
      expect(getAddDependencyCommand({ name: "npm", version: "10.8.2", available: true }, ["react", "vue"]))
        .toBe("npm install --legacy-peer-deps react vue");
    });

    it("should generate correct add dev dependency commands", () => {
      expect(getAddDevDependencyCommand({ name: "pnpm", version: "8.6.1", available: true }, ["@types/node"]))
        .toBe("pnpm add -D @types/node");
      expect(getAddDevDependencyCommand({ name: "yarn", version: "1.22.22", available: true }, ["@types/node"]))
        .toBe("yarn add -D @types/node");
      expect(getAddDevDependencyCommand({ name: "bun", version: "1.0.0", available: true }, ["@types/node"]))
        .toBe("bun add -d @types/node");
      expect(getAddDevDependencyCommand({ name: "npm", version: "10.8.2", available: true }, ["@types/node"]))
        .toBe("npm install --save-dev --legacy-peer-deps @types/node");
    });
  });
});