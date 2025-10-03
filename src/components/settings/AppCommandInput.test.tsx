import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AppCommandInput } from "@/components/settings/AppCommandInput";
import { IpcClient } from "@/ipc/ipc_client";

// Mock the IpcClient
vi.mock("@/ipc/ipc_client", () => ({
  IpcClient: {
    getInstance: vi.fn(() => ({
      getAppSettings: vi.fn(),
      updateAppSettings: vi.fn(),
    })),
  },
}));

// Mock toast
vi.mock("@/lib/toast", () => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
}));

describe("AppCommandInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render install and start command inputs", async () => {
    const mockGetAppSettings = vi.fn().mockResolvedValue({
      installCommand: null,
      startCommand: null,
      preferredPackageManager: null,
      previewUrl: null,
    });

    const mockIpcClient = {
      getAppSettings: mockGetAppSettings,
      updateAppSettings: vi.fn(),
    };

    vi.mocked(IpcClient.getInstance).mockReturnValue(
      mockIpcClient as any,
    );

    render(<AppCommandInput appId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Install Command")).toBeInTheDocument();
      expect(screen.getByLabelText("Start Command")).toBeInTheDocument();
    });

    expect(mockGetAppSettings).toHaveBeenCalledWith(1);
  });

  it("should load existing commands", async () => {
    const mockGetAppSettings = vi.fn().mockResolvedValue({
      installCommand: "npm install",
      startCommand: "npm run dev",
      preferredPackageManager: null,
      previewUrl: null,
    });

    const mockIpcClient = {
      getAppSettings: mockGetAppSettings,
      updateAppSettings: vi.fn(),
    };

    vi.mocked(IpcClient.getInstance).mockReturnValue(
      mockIpcClient as any,
    );

    render(<AppCommandInput appId={1} />);

    await waitFor(() => {
      const installInput = screen.getByLabelText("Install Command") as HTMLInputElement;
      const startInput = screen.getByLabelText("Start Command") as HTMLInputElement;
      
      expect(installInput.value).toBe("npm install");
      expect(startInput.value).toBe("npm run dev");
    });
  });
});
