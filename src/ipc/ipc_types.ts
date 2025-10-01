/**
 * IPC Types
 *
 * This file re-exports types from the centralized type system for backward compatibility.
 * New code should import directly from @/types instead of this file.
 *
 * @deprecated Use imports from @/types instead
 */

import { z } from "zod";

// Re-export all centralized types
export * from "../types";

// Re-export shared tsc types
export type { ProblemReport, Problem } from "../../shared/tsc_types";

// Zod schemas (these need to stay here for validation)
export const UserBudgetInfoSchema = z.object({
  usedCredits: z.number(),
  totalCredits: z.number(),
  budgetResetDate: z.date(),
});
