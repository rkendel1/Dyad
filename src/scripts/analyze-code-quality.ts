#!/usr/bin/env ts-node
/**
 * Analyze Code Quality
 *
 * This script analyzes the codebase for quality metrics and generates a report.
 */

import {
  analyzeProject,
  generateRefactoringReport,
} from "../refactoring/code-metrics";
import * as path from "path";

const projectPath = path.join(__dirname, "../../");

async function main() {
  console.log("Analyzing code quality...\n");

  try {
    const metrics = await analyzeProject(projectPath);
    const report = generateRefactoringReport(metrics);

    console.log(report);

    if (metrics.filesNeedingRefactoring > 0) {
      console.log(
        `\n⚠️  ${metrics.filesNeedingRefactoring} files need refactoring`,
      );
      process.exit(1);
    } else {
      console.log("\n✓ All files meet quality standards");
      process.exit(0);
    }
  } catch (error) {
    console.error("✗ Failed to analyze code:", error);
    process.exit(1);
  }
}

main();
