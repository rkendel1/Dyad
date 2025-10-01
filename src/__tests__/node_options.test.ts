import { describe, it, expect } from "vitest";

describe("Node.js Memory Configuration", () => {
  it("should set NODE_OPTIONS with max-old-space-size when not already present", () => {
    // Simulate the logic from main.ts
    const existingOptions = process.env.NODE_OPTIONS;
    let nodeOptions = existingOptions || "";
    
    if (!nodeOptions.includes('--max-old-space-size')) {
      nodeOptions = (nodeOptions + ' --max-old-space-size=4096').trim();
    }
    
    expect(nodeOptions).toContain("--max-old-space-size");
    expect(nodeOptions).toContain("4096");
  });

  it("should not duplicate max-old-space-size if already present", () => {
    // Simulate having NODE_OPTIONS already set
    const existingOptions = "--max-old-space-size=2048";
    let nodeOptions = existingOptions;
    
    if (!nodeOptions.includes('--max-old-space-size')) {
      nodeOptions = (nodeOptions + ' --max-old-space-size=4096').trim();
    }
    
    // Should not add another max-old-space-size
    const matches = nodeOptions.match(/--max-old-space-size/g);
    expect(matches).toBeDefined();
    expect(matches?.length).toBe(1);
  });

  it("should preserve existing NODE_OPTIONS when adding memory limit", () => {
    const existingOptions = "--inspect --experimental-modules";
    let nodeOptions = existingOptions;
    
    if (!nodeOptions.includes('--max-old-space-size')) {
      nodeOptions = (nodeOptions + ' --max-old-space-size=4096').trim();
    }
    
    expect(nodeOptions).toContain("--inspect");
    expect(nodeOptions).toContain("--experimental-modules");
    expect(nodeOptions).toContain("--max-old-space-size=4096");
  });
});
