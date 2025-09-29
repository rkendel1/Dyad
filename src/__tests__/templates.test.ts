import { describe, it, expect } from "vitest";
import { localTemplatesData, DEFAULT_TEMPLATE_ID } from "../shared/templates";

describe("Templates", () => {
  it("should have the default template", () => {
    const defaultTemplate = localTemplatesData.find(t => t.id === DEFAULT_TEMPLATE_ID);
    expect(defaultTemplate).toBeDefined();
    expect(defaultTemplate?.title).toBe("React.js Template");
  });

  it("should have all required template properties", () => {
    localTemplatesData.forEach(template => {
      expect(template.id).toBeDefined();
      expect(template.title).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.imageUrl).toBeDefined();
      expect(typeof template.isOfficial).toBe("boolean");
    });
  });

  it("should have unique template IDs", () => {
    const ids = localTemplatesData.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it("should include new Stripe template", () => {
    const stripeTemplate = localTemplatesData.find(t => t.id === "stripe-ecommerce");
    expect(stripeTemplate).toBeDefined();
    expect(stripeTemplate?.title).toBe("Stripe E-commerce Template");
    expect(stripeTemplate?.description).toContain("Stripe");
  });

  it("should include new SaaS template", () => {
    const saasTemplate = localTemplatesData.find(t => t.id === "saas-starter");
    expect(saasTemplate).toBeDefined();
    expect(saasTemplate?.title).toBe("SaaS Starter Template");
    expect(saasTemplate?.description).toContain("SaaS");
  });

  it("should include new blog template", () => {
    const blogTemplate = localTemplatesData.find(t => t.id === "blog-mdx");
    expect(blogTemplate).toBeDefined();
    expect(blogTemplate?.title).toBe("MDX Blog Template");
    expect(blogTemplate?.description).toContain("blog");
  });

  it("should include new auth template", () => {
    const authTemplate = localTemplatesData.find(t => t.id === "auth-clerk");
    expect(authTemplate).toBeDefined();
    expect(authTemplate?.title).toBe("Authentication Template");
    expect(authTemplate?.description).toContain("authentication");
  });

  it("should include new dashboard template", () => {
    const dashboardTemplate = localTemplatesData.find(t => t.id === "dashboard-admin");
    expect(dashboardTemplate).toBeDefined();
    expect(dashboardTemplate?.title).toBe("Admin Dashboard Template");
    expect(dashboardTemplate?.description).toContain("dashboard");
  });

  it("should include new contentful blog template", () => {
    const contentfulTemplate = localTemplatesData.find(t => t.id === "contentful-blog");
    expect(contentfulTemplate).toBeDefined();
    expect(contentfulTemplate?.title).toBe("Contentful Blog Template");
    expect(contentfulTemplate?.description).toContain("Contentful");
  });

  it("should include new medusa ecommerce template", () => {
    const medusaTemplate = localTemplatesData.find(t => t.id === "medusa-ecommerce");
    expect(medusaTemplate).toBeDefined();
    expect(medusaTemplate?.title).toBe("Medusa E-commerce Template");
    expect(medusaTemplate?.description).toContain("Medusa");
  });

  it("should have valid GitHub URLs for new templates", () => {
    const newTemplates = localTemplatesData.filter(t => 
      ["stripe-ecommerce", "saas-starter", "blog-mdx", "auth-clerk", "dashboard-admin", "contentful-blog", "medusa-ecommerce"].includes(t.id)
    );
    
    newTemplates.forEach(template => {
      expect(template.githubUrl).toBeDefined();
      expect(template.githubUrl).toMatch(/^https:\/\/github\.com\/.+/);
    });
  });

  it("should have increased template count", () => {
    // Original templates: react, next, portal-mini-store (3)
    // New templates: 7 additional
    // Total should be 10
    expect(localTemplatesData.length).toBe(10);
  });
});