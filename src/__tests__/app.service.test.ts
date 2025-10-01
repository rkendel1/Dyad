import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { App, AppSettings } from "@/types";

/**
 * Unit tests for AppService
 * 
 * These tests verify the service layer's business logic with proper mocking.
 * The service layer provides:
 * - Separation of business logic from IPC handlers
 * - Testable interface for future HTTP/CLI transports
 * - Clear boundaries for code organization
 */

// Mock dependencies
vi.mock("@/db", () => ({
  db: {
    query: {
      apps: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/db/schema", () => ({
  apps: { id: "id", createdAt: "createdAt" },
  chats: {},
  messages: {},
}));

vi.mock("@/paths/paths", () => ({
  getDyadAppPath: vi.fn((path: string) => `/mock/dyad/apps/${path}`),
}));

vi.mock("@/ipc/utils/file_utils", () => ({
  getFilesRecursively: vi.fn(() => ["file1.ts", "file2.ts"]),
}));

vi.mock("../../../shared/normalizePath", () => ({
  normalizePath: vi.fn((path: string) => path),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value, op: "eq" })),
  desc: vi.fn((field) => ({ field, order: "desc" })),
}));

describe("AppService", () => {
  let AppService: any;
  let appService: any;
  let db: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import after mocks are set up
    const module = await import("@/api/services/app.service");
    AppService = module.AppService;
    appService = module.appService;
    
    const dbModule = await import("@/db");
    db = dbModule.db;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Class and Singleton", () => {
    it("should export AppService class", () => {
      expect(AppService).toBeDefined();
      expect(typeof AppService).toBe("function");
    });

    it("should export appService singleton", () => {
      expect(appService).toBeDefined();
      expect(appService).toBeInstanceOf(AppService);
    });

    it("should have all required methods", () => {
      expect(typeof appService.createApp).toBe("function");
      expect(typeof appService.listApps).toBe("function");
      expect(typeof appService.getApp).toBe("function");
      expect(typeof appService.updateAppSettings).toBe("function");
      expect(typeof appService.deleteApp).toBe("function");
      expect(typeof appService.importApp).toBe("function");
    });
  });

  describe("listApps", () => {
    it("should return all apps with base path", async () => {
      const mockApps = [
        { id: 1, name: "App1", path: "app1", createdAt: new Date() },
        { id: 2, name: "App2", path: "app2", createdAt: new Date() },
      ];

      db.query.apps.findMany.mockResolvedValue(mockApps);

      const result = await appService.listApps();

      expect(result).toEqual({
        apps: mockApps,
        appBasePath: "/mock/dyad/apps/$APP_BASE_PATH",
      });
      expect(db.query.apps.findMany).toHaveBeenCalledOnce();
    });

    it("should return empty array when no apps exist", async () => {
      db.query.apps.findMany.mockResolvedValue([]);

      const result = await appService.listApps();

      expect(result.apps).toEqual([]);
      expect(result.appBasePath).toBeDefined();
    });
  });

  describe("getApp", () => {
    it("should return app with files when app exists", async () => {
      const mockApp = {
        id: 1,
        name: "TestApp",
        path: "test-app",
        createdAt: new Date(),
      };

      db.query.apps.findFirst.mockResolvedValue(mockApp);

      const result = await appService.getApp(1);

      expect(result).toMatchObject(mockApp);
      expect(result.files).toEqual(["file1.ts", "file2.ts"]);
      expect(db.query.apps.findFirst).toHaveBeenCalledOnce();
    });

    it("should throw error when app not found", async () => {
      db.query.apps.findFirst.mockResolvedValue(null);

      await expect(appService.getApp(999)).rejects.toThrow(
        "App with ID 999 not found"
      );
    });

    it("should return app with empty files array on file read error", async () => {
      const mockApp = {
        id: 1,
        name: "TestApp",
        path: "test-app",
        createdAt: new Date(),
      };

      db.query.apps.findFirst.mockResolvedValue(mockApp);
      
      // Mock file reading to throw error
      const { getFilesRecursively } = await import("@/ipc/utils/file_utils");
      vi.mocked(getFilesRecursively).mockImplementation(() => {
        throw new Error("File read error");
      });

      const result = await appService.getApp(1);

      expect(result).toMatchObject(mockApp);
      expect(result.files).toEqual([]);
    });
  });

  describe("updateAppSettings", () => {
    it("should update app settings successfully", async () => {
      const mockApp = {
        id: 1,
        name: "TestApp",
        path: "test-app",
        preferredPackageManager: "npm" as const,
        previewUrl: "http://localhost:3000",
      };

      const updatedApp = {
        ...mockApp,
        preferredPackageManager: "pnpm" as const,
        previewUrl: "http://localhost:5000",
      };

      db.query.apps.findFirst
        .mockResolvedValueOnce(mockApp)  // Initial check
        .mockResolvedValueOnce(updatedApp);  // After update

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      db.update.mockReturnValue(mockUpdate());

      const newSettings: Partial<AppSettings> = {
        preferredPackageManager: "pnpm",
        previewUrl: "http://localhost:5000",
      };

      const result = await appService.updateAppSettings(1, newSettings);

      expect(result).toEqual({
        preferredPackageManager: "pnpm",
        previewUrl: "http://localhost:5000",
      });
      expect(db.query.apps.findFirst).toHaveBeenCalledTimes(2);
    });

    it("should throw error when app not found", async () => {
      db.query.apps.findFirst.mockResolvedValue(null);

      await expect(
        appService.updateAppSettings(999, { previewUrl: "http://test.com" })
      ).rejects.toThrow("App with ID 999 not found");
    });

    it("should handle partial settings update", async () => {
      const mockApp = {
        id: 1,
        name: "TestApp",
        preferredPackageManager: "npm" as const,
        previewUrl: null,
      };

      db.query.apps.findFirst
        .mockResolvedValueOnce(mockApp)
        .mockResolvedValueOnce({ ...mockApp, previewUrl: "http://localhost:3000" });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      db.update.mockReturnValue(mockUpdate());

      const result = await appService.updateAppSettings(1, {
        previewUrl: "http://localhost:3000",
      });

      expect(result.previewUrl).toBe("http://localhost:3000");
      expect(result.preferredPackageManager).toBe("npm");
    });
  });

  describe("deleteApp", () => {
    it("should delete app successfully", async () => {
      const mockApp = { id: 1, name: "TestApp", path: "test-app" };
      db.query.apps.findFirst.mockResolvedValue(mockApp);

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      db.delete.mockReturnValue(mockDelete());

      await appService.deleteApp(1);

      expect(db.query.apps.findFirst).toHaveBeenCalledOnce();
      expect(db.delete).toHaveBeenCalledOnce();
    });

    it("should throw error when app not found", async () => {
      db.query.apps.findFirst.mockResolvedValue(null);

      await expect(appService.deleteApp(999)).rejects.toThrow(
        "App with ID 999 not found"
      );
    });
  });

  describe("createApp", () => {
    it("should throw error indicating to use IPC handler", async () => {
      await expect(
        appService.createApp({ name: "TestApp" })
      ).rejects.toThrow(/Use IPC handler "create-app"/);
    });
  });

  describe("importApp", () => {
    it("should throw error indicating to use IPC handler", async () => {
      await expect(
        appService.importApp({
          path: "/test/path",
          appName: "TestApp",
        })
      ).rejects.toThrow(/Use IPC handler "import-app"/);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully in listApps", async () => {
      db.query.apps.findMany.mockRejectedValue(new Error("Database error"));

      await expect(appService.listApps()).rejects.toThrow("Database error");
    });

    it("should handle database errors gracefully in getApp", async () => {
      db.query.apps.findFirst.mockRejectedValue(new Error("Database error"));

      await expect(appService.getApp(1)).rejects.toThrow("Database error");
    });

    it("should handle database errors gracefully in deleteApp", async () => {
      const mockApp = { id: 1, name: "TestApp" };
      db.query.apps.findFirst.mockResolvedValue(mockApp);

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error("Delete failed")),
      });
      db.delete.mockReturnValue(mockDelete());

      await expect(appService.deleteApp(1)).rejects.toThrow("Delete failed");
    });
  });

  describe("Type Safety", () => {
    it("should return properly typed AppSettings", async () => {
      const mockApp = {
        id: 1,
        preferredPackageManager: "pnpm" as const,
        previewUrl: "http://localhost:3000",
      };

      db.query.apps.findFirst
        .mockResolvedValueOnce(mockApp)
        .mockResolvedValueOnce(mockApp);

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      db.update.mockReturnValue(mockUpdate());

      const result = await appService.updateAppSettings(1, {
        preferredPackageManager: "pnpm",
      });

      expect(result).toHaveProperty("preferredPackageManager");
      expect(result).toHaveProperty("previewUrl");
    });
  });
});
