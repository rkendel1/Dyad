import log from "electron-log";

import { createTestOnlyLoggedHandler } from "./safe_handle";
import { handleNeonOAuthReturn } from "../../neon_admin/neon_return_handler";
import {
  CreateNeonProjectParams,
  NeonProject,
  GetNeonProjectParams,
  GetNeonProjectResponse,
  NeonBranch,
} from "../ipc_types";
import { ipcMain } from "electron";
import { neonService } from "../../api/services/neon.service";

export const logger = log.scope("neon_handlers");

const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerNeonHandlers() {
  // Do not use log handler because there's sensitive data in the response
  ipcMain.handle(
    "neon:create-project",
    async (
      _,
      { name, appId }: CreateNeonProjectParams,
    ): Promise<NeonProject> => {
      return await neonService.createProject({ name, appId });
    },
  );

  ipcMain.handle(
    "neon:get-project",
    async (
      _,
      { appId }: GetNeonProjectParams,
    ): Promise<GetNeonProjectResponse> => {
      return await neonService.getProject({ appId });
    },
  );

  testOnlyHandle("neon:fake-connect", async (event) => {
    // Call handleNeonOAuthReturn with fake data
    handleNeonOAuthReturn({
      token: "fake-neon-access-token",
      refreshToken: "fake-neon-refresh-token",
      expiresIn: 3600, // 1 hour
    });
    logger.info("Called handleNeonOAuthReturn with fake data during testing.");

    // Simulate the deep link event
    event.sender.send("deep-link-received", {
      type: "neon-oauth-return",
      url: "https://oauth.dyad.sh/api/integrations/neon/login",
    });
    logger.info("Sent fake neon deep-link-received event during testing.");
  });
}
