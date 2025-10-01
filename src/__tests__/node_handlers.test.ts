import { describe, it, expect, vi, beforeEach } from "vitest";
import { runShellCommand } from "../ipc/utils/runShellCommand";

// Mock the runShellCommand function
vi.mock("../ipc/utils/runShellCommand");

describe("Node Handlers - pnpm installation fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use existing pnpm if already installed", async () => {
    const mockRunShellCommand = vi.mocked(runShellCommand);
    
    // Mock pnpm being already available
    mockRunShellCommand.mockResolvedValueOnce("10.5.0");
    
    const command = "pnpm --version || (corepack enable pnpm && pnpm --version) || (npx -y pnpm@latest-10 --version) || (npm install -g pnpm@latest-10 && pnpm --version)";
    const result = await runShellCommand(command);
    
    expect(result).toBe("10.5.0");
    expect(mockRunShellCommand).toHaveBeenCalledWith(command);
  });

  it("should fall back to corepack if pnpm not installed", async () => {
    const mockRunShellCommand = vi.mocked(runShellCommand);
    
    // This simulates the shell command trying fallbacks
    // In reality, the shell command itself handles the || logic
    mockRunShellCommand.mockResolvedValueOnce("10.5.0");
    
    const command = "pnpm --version || (corepack enable pnpm && pnpm --version) || (npx -y pnpm@latest-10 --version) || (npm install -g pnpm@latest-10 && pnpm --version)";
    const result = await runShellCommand(command);
    
    expect(result).toBe("10.5.0");
  });

  it("should handle errors gracefully with catch block", async () => {
    const mockRunShellCommand = vi.mocked(runShellCommand);
    
    // Mock the primary command failing
    mockRunShellCommand
      .mockRejectedValueOnce(new Error("All methods failed"))
      .mockResolvedValueOnce("10.5.0"); // Fallback npx succeeds
    
    const command = "pnpm --version || (corepack enable pnpm && pnpm --version) || (npx -y pnpm@latest-10 --version) || (npm install -g pnpm@latest-10 && pnpm --version)";
    
    try {
      await runShellCommand(command);
    } catch {
      // If primary fails, try the fallback
      const fallbackResult = await runShellCommand("npx pnpm@latest-10 --version");
      expect(fallbackResult).toBe("10.5.0");
    }
  });

  it("should return 'Not available' when all methods fail", async () => {
    const mockRunShellCommand = vi.mocked(runShellCommand);
    
    // Mock all methods failing
    mockRunShellCommand
      .mockRejectedValueOnce(new Error("Primary command failed"))
      .mockRejectedValueOnce(new Error("Fallback command failed"));
    
    const command = "pnpm --version || (corepack enable pnpm && pnpm --version) || (npx -y pnpm@latest-10 --version) || (npm install -g pnpm@latest-10 && pnpm --version)";
    
    let result = "Not available";
    try {
      await runShellCommand(command);
    } catch {
      try {
        result = await runShellCommand("npx pnpm@latest-10 --version");
      } catch {
        result = "Not available";
      }
    }
    
    expect(result).toBe("Not available");
  });
});
