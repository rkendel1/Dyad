import { describe, it, expect } from "vitest";
import { localTemplatesData } from "../shared/templates";

describe("Template UI Integration", () => {
  it("should have templates properly structured for UI display", () => {
    localTemplatesData.forEach((template) => {
      // Check all required UI fields are present
      expect(template.id).toBeDefined();
      expect(template.title).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.imageUrl).toBeDefined();

      // Check field types
      expect(typeof template.id).toBe("string");
      expect(typeof template.title).toBe("string");
      expect(typeof template.description).toBe("string");
      expect(typeof template.imageUrl).toBe("string");
      expect(typeof template.isOfficial).toBe("boolean");

      // Check field lengths for UI display
      expect(template.title.length).toBeGreaterThan(0);
      expect(template.title.length).toBeLessThan(100);
      expect(template.description.length).toBeGreaterThan(10);
      expect(template.description.length).toBeLessThan(500);

      // Check image URL format
      expect(template.imageUrl).toMatch(/^https?:\/\/.+/);
    });
  });

  it("should have diverse template categories for UI grouping", () => {
    const templates = localTemplatesData;

    // Group templates by category based on description keywords
    const categories = {
      ecommerce: templates.filter(
        (t) =>
          t.description.toLowerCase().includes("ecommerce") ||
          t.description.toLowerCase().includes("commerce") ||
          t.description.toLowerCase().includes("store") ||
          t.description.toLowerCase().includes("stripe"),
      ),
      blog: templates.filter(
        (t) =>
          t.description.toLowerCase().includes("blog") ||
          t.description.toLowerCase().includes("content") ||
          t.description.toLowerCase().includes("mdx"),
      ),
      saas: templates.filter(
        (t) =>
          t.description.toLowerCase().includes("saas") ||
          t.description.toLowerCase().includes("auth") ||
          t.description.toLowerCase().includes("subscription"),
      ),
      dashboard: templates.filter(
        (t) =>
          t.description.toLowerCase().includes("dashboard") ||
          t.description.toLowerCase().includes("admin") ||
          t.description.toLowerCase().includes("chart"),
      ),
      basic: templates.filter((t) => t.id === "react" || t.id === "next"),
    };

    // Verify we have templates in each major category
    expect(categories.ecommerce.length).toBeGreaterThan(0);
    expect(categories.blog.length).toBeGreaterThan(0);
    expect(categories.saas.length).toBeGreaterThan(0);
    expect(categories.dashboard.length).toBeGreaterThan(0);
    expect(categories.basic.length).toBeGreaterThan(0);
  });

  it("should have consistent naming conventions", () => {
    localTemplatesData.forEach((template) => {
      // Template IDs should be kebab-case
      expect(template.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);

      // Titles should be title case and end with "Template"
      expect(template.title).toMatch(/Template$/);

      // Descriptions should be sentence case and descriptive
      expect(template.description).toMatch(/^[A-Z].+\.$/);
    });
  });

  it("should provide good variety for user selection", () => {
    const templates = localTemplatesData;

    // Should have at least 8 templates (significant expansion)
    expect(templates.length).toBeGreaterThanOrEqual(8);

    // Should have templates with different tech stacks
    const techStacks = new Set();
    templates.forEach((template) => {
      const desc = template.description.toLowerCase();

      if (desc.includes("stripe")) techStacks.add("stripe");
      if (desc.includes("contentful")) techStacks.add("contentful");
      if (desc.includes("medusa")) techStacks.add("medusa");
      if (desc.includes("clerk")) techStacks.add("clerk");
      if (desc.includes("saas")) techStacks.add("saas");
      if (desc.includes("mdx")) techStacks.add("mdx");
      if (desc.includes("dashboard")) techStacks.add("dashboard");
    });

    // Should have at least 5 different tech stack integrations
    expect(techStacks.size).toBeGreaterThanOrEqual(5);
  });

  it("should maintain backward compatibility", () => {
    // Original templates should still exist
    const originalTemplateIds = ["react", "next", "portal-mini-store"];

    originalTemplateIds.forEach((id) => {
      const template = localTemplatesData.find((t) => t.id === id);
      expect(template).toBeDefined();
      expect(template?.isOfficial).toBe(true);
    });

    // Default template should still be React
    const defaultTemplate = localTemplatesData.find((t) => t.id === "react");
    expect(defaultTemplate).toBeDefined();
    expect(defaultTemplate?.title).toBe("React.js Template");
  });
});
