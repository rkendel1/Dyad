import { describe, it, expect } from "vitest";
import { findAvailablePort, findAvailablePorts } from "./port_utils";

describe("Port Utils", () => {
  describe("findAvailablePort", () => {
    it("should not return port 5175 (reserved for web app)", async () => {
      // Try to find a port multiple times to increase chances of hitting 5175
      const ports = new Set<number>();
      
      for (let i = 0; i < 50; i++) {
        const port = await findAvailablePort(5170, 5180);
        ports.add(port);
      }
      
      // Port 5175 should never be returned
      expect(ports.has(5175)).toBe(false);
    });

    it("should find an available port within range", async () => {
      const port = await findAvailablePort(5200, 5210);
      expect(port).toBeGreaterThanOrEqual(5200);
      expect(port).toBeLessThanOrEqual(5210);
      expect(port).not.toBe(5175); // Should never be 5175
    });
  });

  describe("findAvailablePorts", () => {
    it("should not include port 5175 in results", async () => {
      const ports = await findAvailablePorts(5170, 5180, 5);
      
      // None of the returned ports should be 5175
      expect(ports.includes(5175)).toBe(false);
    });

    it("should find multiple available ports", async () => {
      const ports = await findAvailablePorts(5200, 5250, 3);
      
      expect(ports).toHaveLength(3);
      expect(new Set(ports).size).toBe(3); // All ports should be unique
      ports.forEach(port => {
        expect(port).toBeGreaterThanOrEqual(5200);
        expect(port).toBeLessThanOrEqual(5250);
        expect(port).not.toBe(5175);
      });
    });
  });
});
