import { createLoggedHandler } from "./safe_handle";
import log from "electron-log";
import { portalService } from "../../api/services/portal.service";

const logger = log.scope("portal_handlers");
const handle = createLoggedHandler(logger);

export function registerPortalHandlers() {
  handle(
    "portal:migrate-create",
    async (_, { appId }: { appId: number }): Promise<{ output: string }> => {
      return await portalService.createMigration({ appId });
    },
  );
}
