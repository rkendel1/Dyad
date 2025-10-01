/**
 * Autonomous Refactoring Engine
 *
 * Intelligent refactoring system that can automatically detect and suggest
 * code improvements based on patterns and metrics.
 */

import type {
  FileMetrics,
  ProjectMetrics,
  RefactoringOpportunity,
} from "./code-metrics";
import { analyzeProject, generateRefactoringReport } from "./code-metrics";

/**
 * Refactoring action that can be executed
 */
export interface RefactoringAction {
  type:
    | "split-file"
    | "extract-function"
    | "remove-duplicate"
    | "simplify-complexity";
  targetFile: string;
  description: string;
  automated: boolean;
  prompt?: string; // AI prompt to execute the refactoring
}

/**
 * Refactoring strategy configuration
 */
export interface RefactoringStrategy {
  enableAutomatedRefactoring: boolean;
  enableSuggestions: boolean;
  aggressiveness: "conservative" | "balanced" | "aggressive";
}

/**
 * Default refactoring strategy
 */
const DEFAULT_STRATEGY: RefactoringStrategy = {
  enableAutomatedRefactoring: false,
  enableSuggestions: true,
  aggressiveness: "balanced",
};

/**
 * Autonomous Refactoring Engine
 */
export class RefactoringEngine {
  private strategy: RefactoringStrategy;

  constructor(strategy: Partial<RefactoringStrategy> = {}) {
    this.strategy = { ...DEFAULT_STRATEGY, ...strategy };
  }

  /**
   * Analyze a project and generate refactoring suggestions
   */
  async analyzeAndSuggest(projectPath: string): Promise<{
    metrics: ProjectMetrics;
    actions: RefactoringAction[];
    report: string;
  }> {
    const metrics = await analyzeProject(projectPath);
    const actions = this.generateRefactoringActions(metrics);
    const report = generateRefactoringReport(metrics);

    return { metrics, actions, report };
  }

  /**
   * Generate refactoring actions from opportunities
   */
  private generateRefactoringActions(
    metrics: ProjectMetrics,
  ): RefactoringAction[] {
    const actions: RefactoringAction[] = [];

    for (const opportunity of metrics.refactoringOpportunities) {
      if (opportunity.type === "large-file") {
        actions.push({
          type: "split-file",
          targetFile: opportunity.filePath,
          description: opportunity.description,
          automated:
            this.strategy.enableAutomatedRefactoring &&
            opportunity.severity === "high",
          prompt: this.generateSplitFilePrompt(opportunity),
        });
      }
    }

    return actions;
  }

  /**
   * Generate AI prompt for file splitting
   */
  private generateSplitFilePrompt(opportunity: RefactoringOpportunity): string {
    return `Please refactor the file at ${opportunity.filePath}. 

The file is too large and needs to be split into smaller, more focused modules.

Requirements:
1. Identify logical groupings of functions/components
2. Extract each group into a separate file
3. Maintain all existing functionality
4. Update imports/exports appropriately
5. Follow the project's naming conventions

${opportunity.description}

Suggestion: ${opportunity.suggestion}`;
  }

  /**
   * Check if a file needs refactoring based on current changes
   */
  shouldRefactorFile(filePath: string, lineCount: number): boolean {
    const threshold = this.getThresholdForStrategy();
    return lineCount > threshold;
  }

  /**
   * Get line count threshold based on strategy
   */
  private getThresholdForStrategy(): number {
    switch (this.strategy.aggressiveness) {
      case "conservative":
        return 500;
      case "balanced":
        return 300;
      case "aggressive":
        return 200;
      default:
        return 300;
    }
  }

  /**
   * Generate refactoring prompt for the AI
   */
  generateRefactoringPrompt(filePath: string, metrics: FileMetrics): string {
    const reasons = metrics.refactoringReasons.join("\n- ");

    return `The file ${filePath} needs refactoring due to:
- ${reasons}

Please refactor this file by:
1. Breaking it down into smaller, focused modules
2. Each module should have a single responsibility
3. Maintain all existing functionality
4. Update imports and exports appropriately
5. Follow clean code principles

Current metrics:
- Lines of Code: ${metrics.linesOfCode}
- Functions: ${metrics.functions}
- Dependencies: ${metrics.dependencies}

Create the refactored files with appropriate naming that reflects their purpose.`;
  }
}

/**
 * Singleton instance
 */
export const refactoringEngine = new RefactoringEngine();

/**
 * Integrate with the existing proposal system
 */
export function enhanceProposalWithRefactoring(
  writeTags: Array<{ path: string; content: string }>,
  engine: RefactoringEngine = refactoringEngine,
): RefactoringAction | null {
  // Find large files that were just written
  for (const tag of writeTags) {
    const lineCount = tag.content.split("\n").length;

    if (engine.shouldRefactorFile(tag.path, lineCount)) {
      return {
        type: "split-file",
        targetFile: tag.path,
        description: `File has ${lineCount} lines and should be refactored`,
        automated: false,
        prompt: `The file ${tag.path} you just created/modified has ${lineCount} lines. 
This is quite large. Would you like me to refactor it into smaller, more manageable modules?`,
      };
    }
  }

  return null;
}
