import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AppOutputDestination } from "@/components/settings/AppOutputDestination";
import { IpcClient } from "@/ipc/ipc_client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the IpcClient
vi.mock("@/ipc/ipc_client", () => ({
  IpcClient: {
    getInstance: vi.fn(() => ({
      getApp: vi.fn(),
      showItemInFolder: vi.fn(),
    })),
  },
}));

// Mock toast
vi.mock("@/lib/toast", () => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
}));

describe("AppOutputDestination", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it("should render output destination path", async () => {
    const mockGetApp = vi.fn().mockResolvedValue({
      id: 1,
      name: "Test App",
      path: "/path/to/test/app",
    });

    const mockIpcClient = {
      getApp: mockGetApp,
      showItemInFolder: vi.fn(),
    };

    vi.mocked(IpcClient.getInstance).mockReturnValue(
      mockIpcClient as any,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AppOutputDestination appId={1} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("/path/to/test/app")).toBeInTheDocument();
    });

    expect(mockGetApp).toHaveBeenCalledWith(1);
  });

  it("should display folder button", async () => {
    const mockGetApp = vi.fn().mockResolvedValue({
      id: 1,
      name: "Test App",
      path: "/path/to/test/app",
    });

    const mockIpcClient = {
      getApp: mockGetApp,
      showItemInFolder: vi.fn(),
    };

    vi.mocked(IpcClient.getInstance).mockReturnValue(
      mockIpcClient as any,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AppOutputDestination appId={1} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const folderButton = screen.getByRole("button", { name: /open folder/i });
      expect(folderButton).toBeInTheDocument();
    });
  });
});
