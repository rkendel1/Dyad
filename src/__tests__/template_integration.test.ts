import { describe, it, expect, vi } from "vitest";
import {
  getAllTemplates,
  getTemplateOrThrow,
} from "../ipc/utils/template_utils";
import { localTemplatesData } from "../shared/templates";

// Mock the fetch function for API templates
global.fetch = vi.fn();

describe("Template Integration", () => {
  it("should return local templates when API fails", async () => {
    // Mock fetch to fail
    vi.mocked(fetch).mockRejectedValue(new Error("API failed"));

    const templates = await getAllTemplates();

    // Should fallback to local templates
    expect(templates.length).toBeGreaterThanOrEqual(localTemplatesData.length);
    expect(templates).toEqual(expect.arrayContaining(localTemplatesData));
  });

  it("should find new templates by ID", async () => {
    const stripeTemplate = await getTemplateOrThrow("stripe-ecommerce");
    expect(stripeTemplate.id).toBe("stripe-ecommerce");
    expect(stripeTemplate.title).toBe("Stripe E-commerce Template");

    const blogTemplate = await getTemplateOrThrow("blog-mdx");
    expect(blogTemplate.id).toBe("blog-mdx");
    expect(blogTemplate.title).toBe("MDX Blog Template");
  });

  it("should throw error for non-existent template", async () => {
    await expect(getTemplateOrThrow("non-existent-template")).rejects.toThrow(
      "Template non-existent-template not found",
    );
  });

  it("should have valid template structure for all new templates", async () => {
    const newTemplateIds = [
      "stripe-ecommerce",
      "blog-mdx",
      "auth-clerk",
      "dashboard-admin",
      "contentful-blog",
      "medusa-ecommerce",
    ];

    for (const templateId of newTemplateIds) {
      const template = await getTemplateOrThrow(templateId);

      // Check required fields
      expect(template.id).toBe(templateId);
      expect(template.title).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.imageUrl).toBeDefined();
      expect(template.githubUrl).toBeDefined();
      expect(template.isOfficial).toBe(true);

      // Check GitHub URL format
      expect(template.githubUrl).toMatch(/^https:\/\/github\.com\/.+\/.+$/);
    }
  });

  it("should maintain template diversity", async () => {
    const templates = await getAllTemplates();

    // Check we have templates covering different use cases
    const hasEcommerce = templates.some(
      (t) =>
        t.description.toLowerCase().includes("ecommerce") ||
        t.description.toLowerCase().includes("commerce") ||
        t.description.toLowerCase().includes("stripe"),
    );

    const hasBlog = templates.some(
      (t) =>
        t.description.toLowerCase().includes("blog") ||
        t.description.toLowerCase().includes("mdx") ||
        t.description.toLowerCase().includes("contentful"),
    );

    const hasSaas = templates.some(
      (t) =>
        t.description.toLowerCase().includes("subscription") ||
        t.description.toLowerCase().includes("auth"),
    );

    const hasDashboard = templates.some(
      (t) =>
        t.description.toLowerCase().includes("dashboard") ||
        t.description.toLowerCase().includes("admin"),
    );

    expect(hasEcommerce).toBe(true);
    expect(hasBlog).toBe(true);
    expect(hasSaas).toBe(true);
    expect(hasDashboard).toBe(true);
  });
});
