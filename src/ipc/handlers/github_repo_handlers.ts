import { createLoggedHandler } from "./safe_handle";
import log from "electron-log";
import { readSettings } from "../../main/settings";
import {
  AnalyzeGithubRepoParams,
  AnalyzeGithubRepoResult,
  IntegrateGithubRepoParams,
  IntegrateGithubRepoResult,
} from "../ipc_types";
import { db } from "@/db";
import { apps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getDyadAppPath } from "../../paths/paths";
import fs from "fs/promises";
import path from "path";

const logger = log.scope("github-repo-handlers");
const handle = createLoggedHandler(logger);

const GITHUB_API_BASE = "https://api.github.com";

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
  dependencies: string[],
): "simple" | "moderate" | "complex" {
  if (fileCount < 10 && dependencies.length < 5) return "simple";
  if (fileCount < 50 && dependencies.length < 20) return "moderate";
  return "complex";
}

// Helper function to determine integration approaches
function determineIntegrationApproaches(
  repoInfo: any,
  targetAppPath: string,
  complexity: "simple" | "moderate" | "complex",
) {
  const approaches = {
    recreate: {
      feasible: true,
      effort:
        complexity === "simple"
          ? "low"
          : complexity === "moderate"
            ? "medium"
            : "high",
      description:
        "Analyze the repository and recreate similar functionality using your app's existing technology stack.",
    },
    integrate: {
      feasible: true,
      effort:
        complexity === "simple"
          ? "low"
          : complexity === "moderate"
            ? "medium"
            : "high",
      description:
        "Add the repository as a dependency or submodule and integrate it directly into your app.",
    },
    tailor: {
      feasible: true,
      effort: complexity === "simple" ? "medium" : "high",
      description:
        "Extract specific components or features from the repository and adapt them to fit your app's architecture.",
    },
  } as const;

  // Determine recommendation based on language compatibility and complexity
  let recommendation: "recreate" | "integrate" | "tailor";
  if (complexity === "simple") {
    recommendation = "recreate";
  } else if (complexity === "moderate") {
    recommendation = "tailor";
  } else {
    recommendation = "integrate";
  }

  return { approaches, recommendation };
}

export function registerGithubRepoHandlers() {
  handle(
    "analyze-github-repo",
    async (
      _,
      { repoUrl, targetAppId }: AnalyzeGithubRepoParams,
    ): Promise<AnalyzeGithubRepoResult> => {
      logger.info(
        `Analyzing GitHub repository: ${repoUrl} for app ${targetAppId}`,
      );

      // Get GitHub access token
      const settings = readSettings();
      const githubToken = settings.githubAccessToken?.value;

      // Parse GitHub URL
      const { owner, repo } = parseGitHubUrl(repoUrl);

      // Get target app info
      const targetApp = await db.query.apps.findFirst({
        where: eq(apps.id, targetAppId),
      });

      if (!targetApp) {
        throw new Error("Target app not found");
      }

      const targetAppPath = getDyadAppPath(targetApp.path);

      // Fetch repository information from GitHub API
      try {
        const headers: Record<string, string> = {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Dyad-App",
        };

        if (githubToken) {
          headers["Authorization"] = `Bearer ${githubToken}`;
        }

        // Get repository basic info
        const repoResponse = await fetch(
          `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
          { headers },
        );

        if (!repoResponse.ok) {
          if (repoResponse.status === 404) {
            throw new Error("Repository not found or private");
          } else if (repoResponse.status === 403) {
            throw new Error(
              "Access denied. You may need to authenticate with GitHub.",
            );
          } else {
            throw new Error(`GitHub API error: ${repoResponse.status}`);
          }
        }

        const repoData = await repoResponse.json();

        // Get repository contents to analyze structure
        const contentsResponse = await fetch(
          `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents`,
          { headers },
        );

        let fileCount = 0;
        let dependencies: string[] = [];
        let mainTechnology = repoData.language || "Unknown";
        let framework = "Unknown";

        if (contentsResponse.ok) {
          const contents = await contentsResponse.json();
          fileCount = Array.isArray(contents) ? contents.length : 0;

          // Look for package.json, requirements.txt, etc. to identify dependencies
          const packageFiles = Array.isArray(contents)
            ? contents.filter((file: any) =>
                [
                  "package.json",
                  "requirements.txt",
                  "Gemfile",
                  "pom.xml",
                  "build.gradle",
                ].includes(file.name),
              )
            : [];

          // Try to fetch and parse package.json for more details
          if (packageFiles.length > 0) {
            try {
              const packageFile = packageFiles.find(
                (f: any) => f.name === "package.json",
              );
              if (packageFile) {
                const packageResponse = await fetch(packageFile.download_url);
                if (packageResponse.ok) {
                  const packageData = await packageResponse.json();
                  const deps = {
                    ...packageData.dependencies,
                    ...packageData.devDependencies,
                  };
                  dependencies = Object.keys(deps || {});

                  // Try to detect framework
                  if (deps.react) framework = "React";
                  else if (deps.vue) framework = "Vue";
                  else if (deps.angular) framework = "Angular";
                  else if (deps.express) framework = "Express";
                  else if (deps.fastify) framework = "Fastify";
                  else if (deps.next) framework = "Next.js";
                  else if (deps.nuxt) framework = "Nuxt.js";
                }
              }
            } catch (error) {
              logger.warn("Failed to parse package file:", error);
            }
          }
        }

        const complexity = analyzeComplexity(
          mainTechnology,
          fileCount,
          dependencies,
        );
        const { approaches, recommendation } = determineIntegrationApproaches(
          repoData,
          targetAppPath,
          complexity,
        );

        const reasoning = `Based on the repository's ${complexity} complexity and ${mainTechnology} technology stack, ${
          recommendation === "recreate"
            ? "recreating the functionality would give you the most control and ensure it fits perfectly with your existing codebase"
            : recommendation === "integrate"
              ? "integrating the repository as-is would be the most efficient approach given its complexity"
              : "tailoring specific components would balance customization with development effort"
        }.`;

        const result: AnalyzeGithubRepoResult = {
          repository: {
            name: repoData.name,
            full_name: repoData.full_name,
            description: repoData.description || "",
            language: repoData.language || "Unknown",
            topics: repoData.topics || [],
            stars: repoData.stargazers_count || 0,
            forks: repoData.forks_count || 0,
          },
          analysis: {
            mainTechnology,
            framework,
            dependencies: dependencies.slice(0, 10), // Limit to first 10 for display
            complexity,
            integrationApproaches: approaches,
            recommendation,
            reasoning,
          },
        };

        logger.info(`Successfully analyzed repository ${owner}/${repo}`);
        return result;
      } catch (error: any) {
        logger.error(`Failed to analyze repository ${owner}/${repo}:`, error);
        throw new Error(`Failed to analyze repository: ${error.message}`);
      }
    },
  );

  handle(
    "integrate-github-repo",
    async (
      _,
      {
        repoUrl,
        targetAppId,
        approach,
        analysisResult,
      }: IntegrateGithubRepoParams,
    ): Promise<IntegrateGithubRepoResult> => {
      logger.info(
        `Integrating GitHub repository: ${repoUrl} into app ${targetAppId} using ${approach} approach`,
      );

      // Get target app info
      const targetApp = await db.query.apps.findFirst({
        where: eq(apps.id, targetAppId),
      });

      if (!targetApp) {
        throw new Error("Target app not found");
      }

      const targetAppPath = getDyadAppPath(targetApp.path);

      try {
        // For now, we'll create a placeholder implementation
        // In a real implementation, this would handle the different integration approaches

        let message = "";
        const changedFiles: string[] = [];

        switch (approach) {
          case "recreate":
            // Create a markdown file documenting what should be recreated
            const recreateDocPath = path.join(
              targetAppPath,
              "GITHUB_REPO_ANALYSIS.md",
            );
            const recreateContent = `# GitHub Repository Analysis: ${analysisResult.repository.name}

## Original Repository
- **Repository**: ${analysisResult.repository.full_name}
- **Description**: ${analysisResult.repository.description}
- **Language**: ${analysisResult.repository.language}
- **Framework**: ${analysisResult.analysis.framework}

## Integration Approach: Recreate Functionality

This repository has been analyzed for recreation in your app. The functionality should be recreated using your app's existing technology stack.

## Key Dependencies to Consider
${analysisResult.analysis.dependencies.map((dep) => `- ${dep}`).join("\n")}

## Complexity Level
${analysisResult.analysis.complexity.toUpperCase()}

## Next Steps
1. Review the original repository at: ${repoUrl}
2. Identify the core functionality you want to replicate
3. Implement similar features using your app's architecture
4. Test the implementation thoroughly

## AI Assistant Notes
You can ask the AI to help implement specific features from this repository by referencing this analysis.
`;
            await fs.writeFile(recreateDocPath, recreateContent);
            changedFiles.push("GITHUB_REPO_ANALYSIS.md");
            message =
              "Created analysis document. You can now ask the AI to help recreate specific functionality from the repository.";
            break;

          case "integrate":
            // Create integration notes and potentially modify package.json
            const integrateDocPath = path.join(
              targetAppPath,
              "INTEGRATION_NOTES.md",
            );
            const integrateContent = `# Integration Notes: ${analysisResult.repository.name}

## Repository Integration
- **Source**: ${repoUrl}
- **Integration Date**: ${new Date().toISOString()}

## Integration Approach: Direct Integration

This repository will be integrated directly into your app. Consider the following:

## Dependencies Added
${analysisResult.analysis.dependencies
  .slice(0, 5)
  .map((dep) => `- ${dep}`)
  .join("\n")}

## Integration Steps Completed
1. ✅ Repository analysis completed
2. ⏳ Dependencies need to be installed
3. ⏳ Code integration pending

## Manual Steps Required
1. Install required dependencies
2. Import necessary modules
3. Update your app's configuration as needed
4. Test the integration

## Repository Details
- **Language**: ${analysisResult.repository.language}
- **Framework**: ${analysisResult.analysis.framework}
- **Stars**: ${analysisResult.repository.stars}
`;
            await fs.writeFile(integrateDocPath, integrateContent);
            changedFiles.push("INTEGRATION_NOTES.md");
            message =
              "Created integration notes. Manual steps are required to complete the integration.";
            break;

          case "tailor":
            // Create tailoring guidelines
            const tailorDocPath = path.join(
              targetAppPath,
              "TAILORING_GUIDE.md",
            );
            const tailorContent = `# Tailoring Guide: ${analysisResult.repository.name}

## Repository Overview
- **Source**: ${repoUrl}
- **Original Purpose**: ${analysisResult.repository.description}

## Tailoring Approach

This guide helps you extract and adapt specific components from the repository to fit your app's needs.

## Repository Structure Analysis
- **Main Technology**: ${analysisResult.analysis.mainTechnology}
- **Framework**: ${analysisResult.analysis.framework}
- **Complexity**: ${analysisResult.analysis.complexity}

## Key Components to Consider
${analysisResult.analysis.dependencies
  .slice(0, 8)
  .map((dep) => `- ${dep} - Consider if this fits your app's architecture`)
  .join("\n")}

## Recommended Tailoring Strategy
1. **Review** the original repository structure
2. **Extract** components that align with your use case
3. **Adapt** the code to match your app's patterns
4. **Test** each component individually
5. **Integrate** gradually

## Topics and Features
${analysisResult.repository.topics.map((topic) => `- ${topic}`).join("\n")}

## AI Assistant Integration
You can reference this guide when asking the AI to help implement specific features or adapt components from the original repository.
`;
            await fs.writeFile(tailorDocPath, tailorContent);
            changedFiles.push("TAILORING_GUIDE.md");
            message =
              "Created tailoring guide. You can now work with the AI to extract and adapt specific components.";
            break;
        }

        logger.info(
          `Successfully integrated repository using ${approach} approach`,
        );
        return {
          success: true,
          message,
          changedFiles,
        };
      } catch (error: any) {
        logger.error(`Failed to integrate repository:`, error);
        throw new Error(`Integration failed: ${error.message}`);
      }
    },
  );
}
