/**
 * Code Metrics Analyzer
 *
 * Analyzes code quality metrics to identify refactoring opportunities.
 */

import * as fs from "fs/promises";
import * as path from "path";

/**
 * Code quality metrics for a file
 */
export interface FileMetrics {
  filePath: string;
  linesOfCode: number;
  complexity: number;
  functions: number;
  maxFunctionLength: number;
  dependencies: number;
  needsRefactoring: boolean;
  refactoringReasons: string[];
}

/**
 * Project-wide code metrics
 */
export interface ProjectMetrics {
  totalFiles: number;
  totalLinesOfCode: number;
  averageFileSize: number;
  filesNeedingRefactoring: number;
  refactoringOpportunities: RefactoringOpportunity[];
}

/**
 * Refactoring opportunity
 */
export interface RefactoringOpportunity {
  type: "large-file" | "complex-function" | "high-coupling" | "duplicate-code";
  severity: "low" | "medium" | "high";
  filePath: string;
  description: string;
  suggestion: string;
}

/**
 * Configuration for code metrics thresholds
 */
export interface MetricsConfig {
  maxFileLines: number;
  maxFunctionLines: number;
  maxComplexity: number;
  maxDependencies: number;
}

/**
 * Default metrics configuration
 */
export const DEFAULT_METRICS_CONFIG: MetricsConfig = {
  maxFileLines: 300,
  maxFunctionLines: 50,
  maxComplexity: 10,
  maxDependencies: 10,
};

/**
 * Analyzes a single file for code quality metrics
 */
export async function analyzeFile(
  filePath: string,
  config: MetricsConfig = DEFAULT_METRICS_CONFIG,
): Promise<FileMetrics> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const linesOfCode = lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*")
      );
    }).length;

    // Simple metrics calculation
    const functions = (
      content.match(/function\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>/g) || []
    ).length;
    const imports = (content.match(/^import\s+/gm) || []).length;

    const refactoringReasons: string[] = [];
    let needsRefactoring = false;

    if (linesOfCode > config.maxFileLines) {
      needsRefactoring = true;
      refactoringReasons.push(
        `File is too large (${linesOfCode} lines, recommended max: ${config.maxFileLines})`,
      );
    }

    if (imports > config.maxDependencies) {
      needsRefactoring = true;
      refactoringReasons.push(
        `Too many dependencies (${imports}, recommended max: ${config.maxDependencies})`,
      );
    }

    return {
      filePath,
      linesOfCode,
      complexity: 0, // Simplified - would need proper AST analysis
      functions,
      maxFunctionLength: 0, // Simplified
      dependencies: imports,
      needsRefactoring,
      refactoringReasons,
    };
  } catch (error) {
    throw new Error(`Failed to analyze file ${filePath}: ${error}`);
  }
}

/**
 * Analyzes all TypeScript/JavaScript files in a directory
 */
export async function analyzeProject(
  projectPath: string,
  config: MetricsConfig = DEFAULT_METRICS_CONFIG,
): Promise<ProjectMetrics> {
  const fileMetrics: FileMetrics[] = [];

  async function scanDirectory(dirPath: string) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (
          !["node_modules", "dist", ".git", ".vite", "out"].includes(entry.name)
        ) {
          await scanDirectory(fullPath);
        }
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        try {
          const metrics = await analyzeFile(fullPath, config);
          fileMetrics.push(metrics);
        } catch (error) {
          console.error(`Error analyzing ${fullPath}:`, error);
        }
      }
    }
  }

  await scanDirectory(projectPath);

  const totalLinesOfCode = fileMetrics.reduce(
    (sum, m) => sum + m.linesOfCode,
    0,
  );
  const filesNeedingRefactoring = fileMetrics.filter(
    (m) => m.needsRefactoring,
  ).length;

  const refactoringOpportunities: RefactoringOpportunity[] = fileMetrics
    .filter((m) => m.needsRefactoring)
    .flatMap((m) =>
      m.refactoringReasons.map((reason) => ({
        type: "large-file" as const,
        severity:
          m.linesOfCode > config.maxFileLines * 2
            ? ("high" as const)
            : ("medium" as const),
        filePath: m.filePath,
        description: reason,
        suggestion:
          "Consider breaking this file into smaller, more focused modules",
      })),
    );

  return {
    totalFiles: fileMetrics.length,
    totalLinesOfCode,
    averageFileSize:
      fileMetrics.length > 0 ? totalLinesOfCode / fileMetrics.length : 0,
    filesNeedingRefactoring,
    refactoringOpportunities,
  };
}

/**
 * Generate a refactoring report
 */
export function generateRefactoringReport(metrics: ProjectMetrics): string {
  const report = [
    "# Code Quality and Refactoring Report",
    "",
    "## Summary",
    `- Total Files: ${metrics.totalFiles}`,
    `- Total Lines of Code: ${metrics.totalLinesOfCode}`,
    `- Average File Size: ${Math.round(metrics.averageFileSize)} lines`,
    `- Files Needing Refactoring: ${metrics.filesNeedingRefactoring} (${Math.round((metrics.filesNeedingRefactoring / metrics.totalFiles) * 100)}%)`,
    "",
    "## Refactoring Opportunities",
    "",
  ];

  if (metrics.refactoringOpportunities.length === 0) {
    report.push(
      "No refactoring opportunities identified. Code quality looks good!",
    );
  } else {
    const grouped = metrics.refactoringOpportunities.reduce(
      (acc, opp) => {
        if (!acc[opp.severity]) acc[opp.severity] = [];
        acc[opp.severity].push(opp);
        return acc;
      },
      {} as Record<string, RefactoringOpportunity[]>,
    );

    for (const severity of ["high", "medium", "low"] as const) {
      const opportunities = grouped[severity] || [];
      if (opportunities.length > 0) {
        report.push(
          `### ${severity.toUpperCase()} Priority (${opportunities.length})`,
        );
        report.push("");
        opportunities.forEach((opp) => {
          report.push(`- **${opp.filePath}**`);
          report.push(`  - ${opp.description}`);
          report.push(`  - Suggestion: ${opp.suggestion}`);
          report.push("");
        });
      }
    }
  }

  return report.join("\n");
}
