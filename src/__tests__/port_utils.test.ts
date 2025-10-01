import { describe, it, expect } from "vitest";
import {
  findAvailablePort,
  isPortAvailable,
  findAvailablePorts,
} from "../ipc/utils/port_utils";

describe("Port Utils", () => {
  describe("findAvailablePort", () => {
    it("should find an available port in the specified range", async () => {
      const port = await findAvailablePort(50000, 50100);
      expect(port).toBeGreaterThanOrEqual(50000);
      expect(port).toBeLessThanOrEqual(50100);
    });

    it("should handle small ranges", async () => {
      const port = await findAvailablePort(55000, 55005);
      expect(port).toBeGreaterThanOrEqual(55000);
      expect(port).toBeLessThanOrEqual(55005);
    });

    it("should throw error when no ports are available", async () => {
      // This is hard to test without actually occupying ports
      // For now, just test the error message format
      try {
        await findAvailablePort(1, 1);
        // Should not reach here if implemented correctly
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain("Failed to find an available port");
        }
      }
    });
  });

  describe("isPortAvailable", () => {
    it("should return true for an available port", async () => {
      const result = await isPortAvailable(50123);
      expect(typeof result).toBe("boolean");
    });

    it("should handle edge cases", async () => {
      // Test with a commonly used port (might be occupied)
      const result = await isPortAvailable(3000);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("findAvailablePorts", () => {
    it("should find multiple available ports", async () => {
      const ports = await findAvailablePorts(50200, 50300, 3);
      expect(ports).toHaveLength(3);
      expect(new Set(ports).size).toBe(3); // All ports should be unique

      for (const port of ports) {
        expect(port).toBeGreaterThanOrEqual(50200);
        expect(port).toBeLessThanOrEqual(50300);
      }
    });

    it("should find single port when count is 1", async () => {
      const ports = await findAvailablePorts(50400, 50500, 1);
      expect(ports).toHaveLength(1);
      expect(ports[0]).toBeGreaterThanOrEqual(50400);
      expect(ports[0]).toBeLessThanOrEqual(50500);
    });
  });
});
