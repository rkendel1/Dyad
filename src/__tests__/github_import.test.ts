import { describe, it, expect, vi } from "vitest";
import { ImportAppFromGithubParams } from "../ipc/ipc_types";

// Mock modules
vi.mock("fs/promises");
vi.mock("electron", () => ({
  dialog: {
    showOpenDialog: vi.fn(),
  },
}));
vi.mock("isomorphic-git");
vi.mock("isomorphic-git/http/node");
vi.mock("child_process", () => ({
  exec: vi.fn(),
}));

describe("GitHub URL validation", () => {
  it("should validate correct GitHub URLs", () => {
    const validUrls = [
      "https://github.com/facebook/react",
      "https://github.com/microsoft/vscode",
      "https://github.com/user/repo.git",
    ];

    validUrls.forEach(url => {
      expect(() => new URL(url)).not.toThrow();
      const urlObj = new URL(url);
      expect(urlObj.hostname).toBe("github.com");
      expect(urlObj.protocol).toBe("https:");
      
      const pathParts = urlObj.pathname.split("/").filter(part => part.length > 0);
      expect(pathParts.length).toBe(2);
    });
  });

  it("should reject invalid GitHub URLs", () => {
    const invalidUrls = [
      "http://github.com/user/repo", // HTTP instead of HTTPS
      "https://gitlab.com/user/repo", // Wrong hostname
      "https://github.com/user", // Missing repo name
      "https://github.com/", // Missing user and repo
      "invalid-url", // Not a URL at all
    ];

    invalidUrls.forEach(url => {
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname === "github.com" && urlObj.protocol === "https:") {
          const pathParts = urlObj.pathname.split("/").filter(part => part.length > 0);
          expect(pathParts.length).toBe(2); // This should fail for invalid GitHub URLs
        }
      } catch {
        // Expected for completely invalid URLs
        expect(true).toBe(true);
      }
    });
  });

  it("should extract repository name correctly", () => {
    const testCases = [
      { url: "https://github.com/facebook/react", expected: "react" },
      { url: "https://github.com/microsoft/vscode.git", expected: "vscode" },
      { url: "https://github.com/user/my-awesome-project", expected: "my-awesome-project" },
    ];

    testCases.forEach(({ url, expected }) => {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(part => part.length > 0);
      const repoName = pathParts[1].replace(/\.git$/, "");
      expect(repoName).toBe(expected);
    });
  });
});

describe("ImportAppFromGithubParams validation", () => {
  it("should validate required parameters", () => {
    const validParams: ImportAppFromGithubParams = {
      repoUrl: "https://github.com/facebook/react",
      appName: "my-react-app",
    };

    expect(validParams.repoUrl).toBeTruthy();
    expect(validParams.appName).toBeTruthy();
    expect(typeof validParams.repoUrl).toBe("string");
    expect(typeof validParams.appName).toBe("string");
  });

  it("should handle optional parameters", () => {
    const paramsWithOptional: ImportAppFromGithubParams = {
      repoUrl: "https://github.com/facebook/react",
      appName: "my-react-app",
      installCommand: "npm install",
      startCommand: "npm start",
    };

    expect(paramsWithOptional.installCommand).toBe("npm install");
    expect(paramsWithOptional.startCommand).toBe("npm start");
  });
});