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
    it("should detect npm only", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);

      // Mock npm version check
      mockRunShellCommand.mockResolvedValueOnce("10.8.2"); // npm --version

      const result = await detectSystemPackageManagers();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "npm",
        version: "10.8.2",
        available: true,
      });
    });

    it("should return npm as unavailable if not found", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);

      // Mock npm not found
      mockRunShellCommand.mockRejectedValueOnce(new Error("npm: command not found"));

      const result = await detectSystemPackageManagers();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "npm",
        version: null,
        available: false,
      });
    });
  });

  describe("getPreferredSystemPackageManager", () => {
    it("should return npm if available", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);
      // Mock npm as available
      mockRunShellCommand.mockResolvedValueOnce("10.8.2"); // npm --version

      const result = await getPreferredSystemPackageManager();

      expect(result).toEqual({
        name: "npm",
        version: "10.8.2",
        available: true,
      });
    });

    it("should return null if npm not available", async () => {
      const mockRunShellCommand = vi.mocked(runShellCommand);
      // Mock: npm not available
      mockRunShellCommand.mockRejectedValueOnce(new Error("npm: command not found"));

      const result = await getPreferredSystemPackageManager();

      expect(result).toBeNull();
    });
  });

  describe("detectProjectPackageManager", () => {
    it("should detect npm from package-lock.json", async () => {
      const mockAccess = vi.spyOn(fs, "access");

      // Mock file existence: package.json and package-lock.json exist
      mockAccess
        .mockResolvedValueOnce(undefined) // package.json
        .mockResolvedValueOnce(undefined); // package-lock.json

      const result = await detectProjectPackageManager("/fake/path");

      expect(result.detected).toBe("npm");
      expect(result.hasPackageJson).toBe(true);
      expect(result.hasLockFiles.packageLock).toBe(true);
    });

    it("should detect npm if package.json exists even without lock file", async () => {
      const mockAccess = vi.spyOn(fs, "access");

      // Mock file existence: only package.json exists
      mockAccess
        .mockResolvedValueOnce(undefined) // package.json
        .mockRejectedValueOnce(new Error("ENOENT")); // package-lock.json

      const result = await detectProjectPackageManager("/fake/path");

      expect(result.detected).toBe("npm");
      expect(result.hasPackageJson).toBe(true);
      expect(result.hasLockFiles.packageLock).toBe(false);
    });

    it("should return null if no package.json found", async () => {
      const mockAccess = vi.spyOn(fs, "access");

      // Mock file existence: no package.json
      mockAccess
        .mockRejectedValueOnce(new Error("ENOENT")) // package.json
        .mockRejectedValueOnce(new Error("ENOENT")); // package-lock.json

      const result = await detectProjectPackageManager("/fake/path");

      expect(result.detected).toBeNull();
      expect(result.hasPackageJson).toBe(false);
    });
  });

  describe("command generation", () => {
    it("should generate correct install command for npm", () => {
      expect(
        getInstallCommand({ name: "npm", version: "10.8.2", available: true }),
      ).toBe("npm install --legacy-peer-deps");
    });

    it("should generate correct dev command for npm", () => {
      expect(
        getDevCommand(
          { name: "npm", version: "10.8.2", available: true },
          3000,
        ),
      ).toBe("npm run dev -- --port 3000");
    });

    it("should generate correct dev command without port", () => {
      expect(
        getDevCommand({ name: "npm", version: "10.8.2", available: true }),
      ).toBe("npm run dev");
    });

    it("should generate correct add dependency command for npm", () => {
      expect(
        getAddDependencyCommand(
          { name: "npm", version: "10.8.2", available: true },
          ["react", "vue"],
        ),
      ).toBe("npm install --legacy-peer-deps react vue");
    });

    it("should generate correct add dev dependency command for npm", () => {
      expect(
        getAddDevDependencyCommand(
          { name: "npm", version: "10.8.2", available: true },
          ["@types/node"],
        ),
      ).toBe("npm install --save-dev --legacy-peer-deps @types/node");
    });
  });
});
