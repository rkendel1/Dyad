import { describe, it, expect } from "vitest";

/**
 * Integration tests for NeonService
 * 
 * These tests verify the service layer exists and has the correct interface.
 * Full unit testing would require mocking Neon API and database dependencies.
 * The service layer provides:
 * - Separation of business logic from IPC handlers
 * - Testable interface for future HTTP/CLI transports
 * - Clear boundaries for code organization
 */
describe("NeonService", () => {
  it("should export NeonService class", async () => {
    const { NeonService } = await import("@/api/services/neon.service");
    expect(NeonService).toBeDefined();
    expect(typeof NeonService).toBe("function");
  });

  it("should export neonService singleton", async () => {
    const { neonService } = await import("@/api/services/neon.service");
    expect(neonService).toBeDefined();
    expect(typeof neonService.createProject).toBe("function");
    expect(typeof neonService.getProject).toBe("function");
  });

  it("should have createProject method with correct signature", async () => {
    const { NeonService } = await import("@/api/services/neon.service");
    const service = new NeonService();
    expect(service.createProject).toBeDefined();
    expect(typeof service.createProject).toBe("function");
    expect(service.createProject.length).toBe(1); // One parameter (params)
  });

  it("should have getProject method with correct signature", async () => {
    const { NeonService } = await import("@/api/services/neon.service");
    const service = new NeonService();
    expect(service.getProject).toBeDefined();
    expect(typeof service.getProject).toBe("function");
    expect(service.getProject.length).toBe(1); // One parameter (params)
  });

  it("should export expected types", async () => {
    const module = await import("@/api/services/neon.service");
    expect(module.NeonService).toBeDefined();
    expect(module.neonService).toBeDefined();
  });
});
