import { describe, it, expect } from "vitest";

// Helper function to extract owner and repo from GitHub URL
function parseGitHubUrl(repoUrl: string): { owner: string; repo: string } {
  try {
    const url = new URL(repoUrl);
    const pathParts = url.pathname.split("/").filter((part) => part.length > 0);
    if (pathParts.length < 2) {
      throw new Error("Invalid GitHub repository URL format");
    }
    return {
      owner: pathParts[0],
      repo: pathParts[1].replace(/\.git$/, ""),
    };
  } catch {
    throw new Error("Invalid GitHub repository URL");
  }
}

// Helper function to analyze repository complexity
function analyzeComplexity(
  language: string,
  fileCount: number,
  dependencies: string[]
): "simple" | "moderate" | "complex" {
  if (fileCount < 10 && dependencies.length < 5) return "simple";
  if (fileCount < 50 && dependencies.length < 20) return "moderate";
  return "complex";
}

describe("GitHub Repository Analysis", () => {
  describe("parseGitHubUrl", () => {
    it("should parse valid GitHub URLs correctly", () => {
      const result = parseGitHubUrl("https://github.com/facebook/react");
      expect(result).toEqual({ owner: "facebook", repo: "react" });
    });

    it("should handle URLs with .git extension", () => {
      const result = parseGitHubUrl("https://github.com/vercel/next.js.git");
      expect(result).toEqual({ owner: "vercel", repo: "next.js" });
    });

    it("should throw error for invalid URLs", () => {
      expect(() => parseGitHubUrl("invalid-url")).toThrow("Invalid GitHub repository URL");
    });

    it("should throw error for non-GitHub URLs", () => {
      expect(() => parseGitHubUrl("https://gitlab.com/user/repo")).toThrow("Invalid GitHub repository URL");
    });

    it("should throw error for URLs with insufficient path parts", () => {
      expect(() => parseGitHubUrl("https://github.com/user")).toThrow("Invalid GitHub repository URL format");
    });
  });

  describe("analyzeComplexity", () => {
    it("should classify small repositories as simple", () => {
      const result = analyzeComplexity("TypeScript", 5, ["react", "vite"]);
      expect(result).toBe("simple");
    });

    it("should classify medium repositories as moderate", () => {
      const result = analyzeComplexity("JavaScript", 25, ["react", "redux", "axios", "lodash"]);
      expect(result).toBe("moderate");
    });

    it("should classify large repositories as complex", () => {
      const result = analyzeComplexity("TypeScript", 100, Array(30).fill(0).map((_, i) => `dep-${i}`));
      expect(result).toBe("complex");
    });

    it("should handle edge cases correctly", () => {
      expect(analyzeComplexity("Python", 10, ["flask"])).toBe("moderate");
      expect(analyzeComplexity("Go", 9, ["gin", "gorm", "testify", "cobra"])).toBe("simple");
    });
  });
});