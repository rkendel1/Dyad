import { describe, it, expect, vi, beforeEach } from "vitest";
import { IpcClient } from "../ipc/ipc_client";

// Mock the IpcRenderer
const mockIpcRenderer = {
  invoke: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
};

// Mock electron and window object
vi.mock("electron", () => ({
  ipcRenderer: mockIpcRenderer,
}));

// Mock the window object for electron
Object.defineProperty(global, 'window', {
  value: {
    electron: {
      ipcRenderer: mockIpcRenderer,
    },
  },
  writable: true,
});

describe("External Preview Functionality", () => {
  let ipcClient: IpcClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the singleton instance
    (IpcClient as any).instance = null;
    ipcClient = IpcClient.getInstance();
  });

  describe("openExternalPreview", () => {
    it("should invoke the correct IPC method with URL", async () => {
      const testUrl = "http://localhost:3000";
      mockIpcRenderer.invoke.mockResolvedValue(undefined);

      await ipcClient.openExternalPreview(testUrl);

      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "open-external-preview",
        testUrl
      );
    });

    it("should handle IPC errors gracefully", async () => {
      const testUrl = "http://localhost:3000";
      const error = new Error("IPC failed");
      mockIpcRenderer.invoke.mockRejectedValue(error);

      await expect(ipcClient.openExternalPreview(testUrl)).rejects.toThrow(
        "IPC failed"
      );
    });
  });

  describe("existing openExternalUrl method", () => {
    it("should still work correctly", async () => {
      const testUrl = "http://localhost:3000";
      mockIpcRenderer.invoke.mockResolvedValue(undefined);

      await ipcClient.openExternalUrl(testUrl);

      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        "open-external-url",
        testUrl
      );
    });
  });
});