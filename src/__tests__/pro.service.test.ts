import { describe, it, expect } from "vitest";

/**
 * Integration tests for ProService
 * 
 * These tests verify the service layer exists and has the correct interface.
 * Full unit testing would require mocking Electron dependencies which is complex.
 * The service layer provides:
 * - Separation of business logic from IPC handlers
 * - Testable interface for future HTTP/CLI transports
 * - Clear boundaries for code organization
 */
describe("ProService", () => {
  it("should export ProService class", async () => {
    const { ProService } = await import("@/api/services/pro.service");
    expect(ProService).toBeDefined();
    expect(typeof ProService).toBe("function");
  });

  it("should export proService singleton", async () => {
    const { proService } = await import("@/api/services/pro.service");
    expect(proService).toBeDefined();
    expect(typeof proService.getUserBudget).toBe("function");
  });

  it("should have getUserBudget method with correct signature", async () => {
    const { ProService } = await import("@/api/services/pro.service");
    const service = new ProService();
    expect(service.getUserBudget).toBeDefined();
    expect(typeof service.getUserBudget).toBe("function");
    expect(service.getUserBudget.length).toBe(0); // No parameters
  });
});

