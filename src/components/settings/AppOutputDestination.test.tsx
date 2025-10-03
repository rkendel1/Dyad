import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AppOutputDestination } from "@/components/settings/AppOutputDestination";
import { IpcClient } from "@/ipc/ipc_client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the IpcClient
vi.mock("@/ipc/ipc_client", () => ({
  IpcClient: {
    getInstance: vi.fn(() => ({
      getApp: vi.fn(),
      showItemInFolder: vi.fn(),
      renameApp: vi.fn(),
      selectDirectory: vi.fn(),
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
      renameApp: vi.fn(),
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

  it("should display edit and folder buttons", async () => {
    const mockGetApp = vi.fn().mockResolvedValue({
      id: 1,
      name: "Test App",
      path: "/path/to/test/app",
    });

    const mockIpcClient = {
      getApp: mockGetApp,
      showItemInFolder: vi.fn(),
      renameApp: vi.fn(),
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
      const editButton = screen.getByRole("button", { name: /edit path/i });
      const folderButton = screen.getByRole("button", { name: /open folder/i });
      expect(editButton).toBeInTheDocument();
      expect(folderButton).toBeInTheDocument();
    });
  });

  it("should allow editing the path", async () => {
    const mockGetApp = vi.fn().mockResolvedValue({
      id: 1,
      name: "Test App",
      path: "/path/to/test/app",
    });

    const mockRenameApp = vi.fn().mockResolvedValue(undefined);

    const mockIpcClient = {
      getApp: mockGetApp,
      showItemInFolder: vi.fn(),
      renameApp: mockRenameApp,
    };

    vi.mocked(IpcClient.getInstance).mockReturnValue(
      mockIpcClient as any,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AppOutputDestination appId={1} />
      </QueryClientProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("/path/to/test/app")).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole("button", { name: /edit path/i });
    fireEvent.click(editButton);

    // Check that input is visible
    await waitFor(() => {
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  it("should allow browsing for directory", async () => {
    const mockGetApp = vi.fn().mockResolvedValue({
      id: 1,
      name: "Test App",
      path: "/path/to/test/app",
    });

    const mockSelectDirectory = vi.fn().mockResolvedValue({
      path: "/new/path/to/app",
    });

    const mockIpcClient = {
      getApp: mockGetApp,
      showItemInFolder: vi.fn(),
      renameApp: vi.fn(),
      selectDirectory: mockSelectDirectory,
    };

    vi.mocked(IpcClient.getInstance).mockReturnValue(
      mockIpcClient as any,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AppOutputDestination appId={1} />
      </QueryClientProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("/path/to/test/app")).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole("button", { name: /edit path/i });
    fireEvent.click(editButton);

    // Wait for browse button to appear
    await waitFor(() => {
      const browseButton = screen.getByRole("button", { name: /browse for directory/i });
      expect(browseButton).toBeInTheDocument();
    });

    // Click browse button
    const browseButton = screen.getByRole("button", { name: /browse for directory/i });
    fireEvent.click(browseButton);

    // Check that selectDirectory was called
    await waitFor(() => {
      expect(mockSelectDirectory).toHaveBeenCalled();
    });

    // Check that the input value was updated
    await waitFor(() => {
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("/new/path/to/app");
    });
  });
});
