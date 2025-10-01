/**
 * Pro Service
 *
 * Business logic for Pro/billing operations.
 * This service provides a clean abstraction layer for managing
 * Dyad Pro features and user budget information.
 */

import fetch from "node-fetch";
import log from "electron-log";
import { readSettings } from "../../main/settings";
import { UserBudgetInfo, UserBudgetInfoSchema } from "../../ipc/ipc_types";
import { IS_TEST_BUILD } from "../../ipc/utils/test_utils";

const logger = log.scope("pro_service");

const CONVERSION_RATIO = (10 * 3) / 2;

/**
 * Service class for managing Pro/billing operations
 */
export class ProService {
  /**
   * Get user budget information from the LLM Gateway
   * This method avoids throwing errors because this is auxiliary
   * information and isn't critical to using the app
   */
  async getUserBudget(): Promise<UserBudgetInfo | null> {
    if (IS_TEST_BUILD) {
      // Avoid spamming the API in E2E tests.
      return null;
    }
    logger.info("Attempting to fetch user budget information.");

    const settings = readSettings();

    const apiKey = settings.providerSettings?.auto?.apiKey?.value;

    if (!apiKey) {
      logger.error("LLM Gateway API key (Dyad Pro) is not configured.");
      return null;
    }

    const url = "https://llm-gateway.dyad.sh/user/info";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    try {
      // Use native fetch if available, otherwise node-fetch will be used via import
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(
          `Failed to fetch user budget. Status: ${response.status}. Body: ${errorBody}`,
        );
        return null;
      }

      const data = await response.json();
      const userInfoData = data["user_info"];
      logger.info("Successfully fetched user budget information.");
      return UserBudgetInfoSchema.parse({
        usedCredits: userInfoData["spend"] * CONVERSION_RATIO,
        totalCredits: userInfoData["max_budget"] * CONVERSION_RATIO,
        budgetResetDate: new Date(userInfoData["budget_reset_at"]),
      });
    } catch (error: any) {
      logger.error(`Error fetching user budget: ${error.message}`, error);
      return null;
    }
  }
}

/**
 * Singleton instance for easy access
 */
export const proService = new ProService();
