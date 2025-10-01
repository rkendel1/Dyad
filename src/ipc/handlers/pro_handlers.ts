import log from "electron-log";
import { createLoggedHandler } from "./safe_handle";
import { UserBudgetInfo } from "../ipc_types";
import { proService } from "../../api/services/pro.service";

const logger = log.scope("pro_handlers");
const handle = createLoggedHandler(logger);

export function registerProHandlers() {
  // This method should try to avoid throwing errors because this is auxiliary
  // information and isn't critical to using the app
  handle("get-user-budget", async (): Promise<UserBudgetInfo | null> => {
    return await proService.getUserBudget();
  });
}
