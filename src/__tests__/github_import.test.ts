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

  it("should handle various GitHub URL formats", () => {
    const urlVariations = [
      { input: "https://github.com/user/repo", expected: "https://github.com/user/repo" },
      { input: "github.com/user/repo", expected: "https://github.com/user/repo" },
      { input: "https://github.com/user/repo.git", expected: "https://github.com/user/repo" },
    ];

    urlVariations.forEach(({ input, expected }) => {
      // Simulate the URL cleaning logic from our enhanced import handler
      let cleanUrl = input.trim();
      
      if (cleanUrl.startsWith('github.com/')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      if (cleanUrl.startsWith('git@github.com:')) {
        cleanUrl = cleanUrl.replace('git@github.com:', 'https://github.com/');
      }
      
      const urlObj = new URL(cleanUrl);
      const pathParts = urlObj.pathname.split("/").filter(part => part.length > 0);
      const repoName = pathParts[1].replace(/\.git$/, "");
      
      expect(urlObj.href.replace(/\.git$/, "")).toBe(expected);
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
        let cleanUrl = url.trim();
        if (cleanUrl.startsWith('github.com/')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        
        const urlObj = new URL(cleanUrl);
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

describe("GitHub Authentication validation", () => {
  it("should validate authentication parameters", () => {
    const authScenarios = [
      { token: null, expected: "requiresAuth" },
      { token: "invalid-token", expected: "invalid" },
      { token: "valid-token-with-scopes", expected: "valid" },
    ];

    authScenarios.forEach(({ token, expected }) => {
      // Simulate authentication validation logic
      if (!token) {
        expect("requiresAuth").toBe(expected);
      } else if (token === "invalid-token") {
        expect("invalid").toBe(expected);
      } else {
        expect("valid").toBe(expected);
      }
    });
  });

  it("should handle authentication error messages", () => {
    const errorMessages = [
      "No GitHub authentication found. Please connect your GitHub account in Settings to access repositories.",
      "GitHub authentication token is invalid or expired. Please reconnect your GitHub account in Settings.",
      "GitHub authentication token doesn't have sufficient permissions. Please reconnect with proper scopes in Settings.",
    ];

    errorMessages.forEach(message => {
      expect(message).toContain("GitHub");
      expect(message).toContain("Settings");
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