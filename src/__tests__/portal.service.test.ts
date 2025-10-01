import { describe, it, expect } from "vitest";

/**
 * Integration tests for PortalService
 * 
 * These tests verify the service layer exists and has the correct interface.
 * Full unit testing would require mocking child processes and git operations.
 * The service layer provides:
 * - Separation of business logic from IPC handlers
 * - Testable interface for future HTTP/CLI transports
 * - Clear boundaries for code organization
 */
describe("PortalService", () => {
  it("should export PortalService class", async () => {
    const { PortalService } = await import("@/api/services/portal.service");
    expect(PortalService).toBeDefined();
    expect(typeof PortalService).toBe("function");
  });

  it("should export portalService singleton", async () => {
    const { portalService } = await import("@/api/services/portal.service");
    expect(portalService).toBeDefined();
    expect(typeof portalService.createMigration).toBe("function");
  });

  it("should have createMigration method with correct signature", async () => {
    const { PortalService } = await import("@/api/services/portal.service");
    const service = new PortalService();
    expect(service.createMigration).toBeDefined();
    expect(typeof service.createMigration).toBe("function");
    expect(service.createMigration.length).toBe(1); // One parameter (params)
  });

  it("should export expected types", async () => {
    const module = await import("@/api/services/portal.service");
    expect(module.PortalService).toBeDefined();
    expect(module.portalService).toBeDefined();
  });
});
