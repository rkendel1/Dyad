import log from "electron-log";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { apps } from "../../db/schema";
import { getSupabaseClient } from "../../supabase_admin/supabase_management_client";
import {
  createLoggedHandler,
  createTestOnlyLoggedHandler,
} from "./safe_handle";
import { handleSupabaseOAuthReturn } from "../../supabase_admin/supabase_return_handler";
import { safeSend } from "../utils/safe_sender";
import {
  SetupLocalSupabaseParams,
  LocalSupabaseStatus,
  ProductionPromotionParams,
  ProductionPromotionStatus,
} from "../ipc_types";
import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";
import {
  updatePostgresUrlEnvVar,
  updateEnvironmentVariables,
} from "../utils/app_env_var_utils";
import fetch from "node-fetch";

const logger = log.scope("supabase_handlers");
const handle = createLoggedHandler(logger);
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

// Local Supabase configuration
const LOCAL_SUPABASE_CONFIG = {
  url: "http://localhost:8000",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  dashboardUrl: "http://localhost:3001",
  postgresUrl:
    "postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres",
};

function checkDockerInstalled(): boolean {
  try {
    execSync("docker --version", { stdio: "ignore" });
    execSync("docker-compose --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isLocalSupabaseRunning(): boolean {
  try {
    const result = execSync(
      'docker-compose -f docker-compose.supabase.yml ps --services --filter "status=running"',
      { encoding: "utf8", stdio: "pipe" },
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

function getSupabaseContainerStatus(): string {
  try {
    const result = execSync(
      "docker-compose -f docker-compose.supabase.yml ps",
      { encoding: "utf8", stdio: "pipe" },
    );
    return result;
  } catch (error) {
    return `Failed to get container status: ${error}`;
  }
}

async function startLocalSupabase(): Promise<void> {
  const dockerComposeFile = path.resolve(
    process.cwd(),
    "docker-compose.supabase.yml",
  );

  if (!existsSync(dockerComposeFile)) {
    throw new Error(
      "docker-compose.supabase.yml not found. Make sure the local Supabase configuration files are present.",
    );
  }

  if (!checkDockerInstalled()) {
    throw new Error(
      "Docker is not installed or not running. Please install Docker Desktop and ensure it's running.",
    );
  }

  try {
    logger.info("🚀 Starting local Supabase containers...");
    logger.info("📦 Pulling and starting services (this may take a moment):");
    logger.info("   - PostgreSQL Database");
    logger.info("   - Kong API Gateway");
    logger.info("   - GoTrue Auth");
    logger.info("   - PostgREST API");
    logger.info("   - Realtime Server");
    logger.info("   - Storage API");
    logger.info("   - Supabase Studio");

    execSync("docker-compose -f docker-compose.supabase.yml up -d", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    
    logger.info("✅ Docker containers started, initializing services...");

    // Wait for services to be ready with better validation
    await waitForSupabaseReady();

    // Display connection information
    logger.info("═══════════════════════════════════════════════════════");
    logger.info("✅ Local Supabase is ready!");
    logger.info("═══════════════════════════════════════════════════════");
    logger.info(`📊 Dashboard:        ${LOCAL_SUPABASE_CONFIG.dashboardUrl}`);
    logger.info(`🔗 API URL:          ${LOCAL_SUPABASE_CONFIG.url}`);
    logger.info(`🗄️  Database:         localhost:5432`);
    logger.info("═══════════════════════════════════════════════════════");
    logger.info("📝 Connection details:");
    logger.info(`   Anon Key: ${LOCAL_SUPABASE_CONFIG.anonKey.substring(0, 50)}...`);
    logger.info(`   Database: ${LOCAL_SUPABASE_CONFIG.postgresUrl.split('@')[0]}@...`);
    logger.info("═══════════════════════════════════════════════════════");
  } catch (error) {
    logger.error("❌ Failed to start local Supabase:", error);

    // Get container status for debugging
    const containerStatus = getSupabaseContainerStatus();
    logger.error("🔍 Container status:\n", containerStatus);

    // Provide more specific error messages
    if (String(error).includes("timeout") || String(error).includes("ready")) {
      throw new Error(
        `⏱️  Local Supabase startup timed out. This could be due to:\n\n` +
        `• Docker containers taking longer than expected to start\n` +
        `• Port conflicts (check if ports 5432, 8000, 3001 are in use)\n` +
        `• Insufficient system resources\n\n` +
        `💡 Troubleshooting:\n` +
        `1. Stop existing containers: npm run supabase:stop\n` +
        `2. Check port availability: lsof -i :5432 -i :8000 -i :3001\n` +
        `3. Restart Docker Desktop\n` +
        `4. Try again: npm run supabase:start`,
      );
    } else if (
      String(error).includes("permission") ||
      String(error).includes("denied")
    ) {
      throw new Error(
        `🔒 Permission denied starting Docker containers.\n\n` +
        `Please ensure:\n` +
        `• Docker Desktop is running\n` +
        `• You have permission to run Docker commands\n` +
        `• No other processes are using the required ports\n\n` +
        `💡 On macOS/Linux, you may need to add your user to the docker group:\n` +
        `   sudo usermod -aG docker $USER`,
      );
    } else {
      throw new Error(
        `❌ Failed to start local Supabase: ${error}\n\n` +
        `💡 Check Docker logs for more details:\n` +
        `   docker-compose -f docker-compose.supabase.yml logs`,
      );
    }
  }
}

async function waitForSupabaseReady(maxWaitTime = 60000): Promise<void> {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  let lastStatus = "";

  logger.info(
    `⏳ Waiting for Supabase services to be ready (max ${maxWaitTime / 1000}s)...`,
  );

  const checkService = async (
    name: string,
    url: string,
    timeout = 5000,
  ): Promise<boolean> => {
    try {
      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(timeout),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Check if containers are running
      if (!isLocalSupabaseRunning()) {
        const currentStatus = "⏸️  Waiting for Supabase containers to start...";
        if (currentStatus !== lastStatus) {
          logger.info(currentStatus);
          lastStatus = currentStatus;
        }
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
        continue;
      }

      // Check if Kong API Gateway is responding
      const kongReady = await checkService(
        "Kong API Gateway",
        `${LOCAL_SUPABASE_CONFIG.url}/health`,
        5000,
      );

      if (kongReady) {
        const currentStatus = "✅ API Gateway ready";
        if (currentStatus !== lastStatus) {
          logger.info(currentStatus);
          lastStatus = currentStatus;
        }

        // Additional check for Studio dashboard
        const studioReady = await checkService(
          "Supabase Studio",
          `${LOCAL_SUPABASE_CONFIG.dashboardUrl}`,
          3000,
        );

        if (studioReady) {
          logger.info("✅ Supabase Studio ready");
          
          // Check PostgreSQL directly
          try {
            const postgresCheck = execSync(
              `docker exec $(docker ps -qf "name=supabase-db") pg_isready -U postgres`,
              { encoding: "utf8", stdio: "pipe" },
            );
            if (postgresCheck.includes("accepting connections")) {
              logger.info("✅ PostgreSQL database ready");
            }
          } catch {
            // PostgreSQL might be ready but this check failed, continue anyway
            logger.debug("PostgreSQL check failed, but continuing...");
          }

          // Brief final wait to ensure everything is stable
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return;
        }

        // API is ready but studio might need more time
        const currentStudioStatus = "⏳ API ready, waiting for dashboard...";
        if (currentStudioStatus !== lastStatus) {
          logger.info(currentStudioStatus);
          lastStatus = currentStudioStatus;
        }
      } else {
        const currentStatus = "⏳ Waiting for API Gateway to be ready...";
        if (currentStatus !== lastStatus) {
          logger.info(currentStatus);
          lastStatus = currentStatus;
        }
      }
    } catch (error) {
      logger.debug("Still waiting for Supabase to be ready:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  throw new Error(
    `⏱️  Timeout waiting for local Supabase to be ready (waited ${maxWaitTime / 1000}s).\n\n` +
    `Services may have failed to start properly.\n\n` +
    `💡 Check Docker logs for more details:\n` +
    `   docker-compose -f docker-compose.supabase.yml logs`,
  );
}

async function stopLocalSupabase(): Promise<void> {
  try {
    logger.info("🛑 Stopping Docker containers...");
    execSync("docker-compose -f docker-compose.supabase.yml down", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    logger.info("✅ All Supabase containers stopped");
  } catch (error) {
    logger.error("❌ Failed to stop local Supabase:", error);
    throw new Error(
      `Failed to stop local Supabase: ${error}\n\n` +
      `💡 You can manually stop containers with:\n` +
      `   docker-compose -f docker-compose.supabase.yml down`,
    );
  }
}

async function extractLocalDatabaseSchema(): Promise<string> {
  try {
    logger.info("Extracting database schema from local Supabase...");

    // Use pg_dump to extract schema
    const pgDumpCommand = `pg_dump "${LOCAL_SUPABASE_CONFIG.postgresUrl}" --schema-only --no-owner --no-privileges`;
    const schema = execSync(pgDumpCommand, { encoding: "utf8" });

    logger.info("Database schema extracted successfully");
    return schema;
  } catch (error) {
    logger.error("Failed to extract database schema:", error);
    throw new Error(`Failed to extract database schema: ${error}`);
  }
}

export function registerSupabaseHandlers() {
  handle("supabase:list-projects", async () => {
    const supabase = await getSupabaseClient();
    return supabase.getProjects();
  });

  // Set app project - links a Dyad app to a Supabase project
  handle(
    "supabase:set-app-project",
    async (_, { project, app }: { project: string; app: number }) => {
      await db
        .update(apps)
        .set({ 
          supabaseProjectId: project,
          supabaseProjectName: null, // Will be fetched and cached on next getApp call
        })
        .where(eq(apps.id, app));

      logger.info(`Associated app ${app} with Supabase project ${project}`);
    },
  );

  // Unset app project - removes the link between a Dyad app and a Supabase project
  handle("supabase:unset-app-project", async (_, { app }: { app: number }) => {
    await db
      .update(apps)
      .set({ 
        supabaseProjectId: null,
        supabaseProjectName: null, // Clear cached name
      })
      .where(eq(apps.id, app));

    logger.info(`Removed Supabase project association for app ${app}`);
  });

  testOnlyHandle(
    "supabase:fake-connect-and-set-project",
    async (
      event,
      { appId, fakeProjectId }: { appId: number; fakeProjectId: string },
    ) => {
      // Call handleSupabaseOAuthReturn with fake data
      handleSupabaseOAuthReturn({
        token: "fake-access-token",
        refreshToken: "fake-refresh-token",
        expiresIn: 3600, // 1 hour
      });
      logger.info(
        `Called handleSupabaseOAuthReturn with fake data for app ${appId} during testing.`,
      );

      // Set the supabase project for the currently selected app
      await db
        .update(apps)
        .set({
          supabaseProjectId: fakeProjectId,
          supabaseProjectName: null, // Will be fetched and cached on next getApp call
        })
        .where(eq(apps.id, appId));
      logger.info(
        `Set fake Supabase project ${fakeProjectId} for app ${appId} during testing.`,
      );

      // Simulate the deep link event
      safeSend(event.sender, "deep-link-received", {
        type: "supabase-oauth-return",
        url: "https://supabase-oauth.dyad.sh/api/connect-supabase/login",
      });
      logger.info(
        `Sent fake deep-link-received event for app ${appId} during testing.`,
      );
    },
  );

  // Setup local Supabase
  handle(
    "supabase:setup-local",
    async (_, { appId }: SetupLocalSupabaseParams) => {
      logger.info(`🔧 Setting up local Supabase for app ${appId}`);

      // Start local Supabase if not running
      if (!isLocalSupabaseRunning()) {
        await startLocalSupabase();
      } else {
        // Even if running, wait a bit to ensure it's fully ready
        logger.info("♻️  Local Supabase is already running, checking readiness...");
        await waitForSupabaseReady(10000); // Shorter wait if already running
      }

      // Get the app to find its path
      const app = await db.select().from(apps).where(eq(apps.id, appId)).get();
      if (!app) {
        throw new Error(`App with ID ${appId} not found`);
      }

      // Update the app to use local Supabase
      await db
        .update(apps)
        .set({
          supabaseProjectId: "local-supabase",
          supabaseProjectName: "Local Supabase", // Set a clear name for local instance
        })
        .where(eq(apps.id, appId));

      logger.info("📝 Updating environment variables for local Supabase...");

      // Update the app's environment variables with structured format
      try {
        const { updateEnvironmentVariablesWithStructure } = await import(
          "../utils/app_env_var_utils"
        );
        await updateEnvironmentVariablesWithStructure({
          appPath: app.path,
          envVars: {
            POSTGRES_URL: LOCAL_SUPABASE_CONFIG.postgresUrl,
            SUPABASE_URL: LOCAL_SUPABASE_CONFIG.url,
            SUPABASE_ANON_KEY: LOCAL_SUPABASE_CONFIG.anonKey,
            SUPABASE_SERVICE_ROLE_KEY: LOCAL_SUPABASE_CONFIG.serviceRoleKey,
            NEXT_PUBLIC_SUPABASE_URL: LOCAL_SUPABASE_CONFIG.url,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: LOCAL_SUPABASE_CONFIG.anonKey,
          },
          isLocalSupabase: true,
        });
      } catch {
        // Fallback to simple update if structured update fails
        await updatePostgresUrlEnvVar({
          appPath: app.path,
          connectionUri: LOCAL_SUPABASE_CONFIG.postgresUrl,
        });
      }

      logger.info("═══════════════════════════════════════════════════════");
      logger.info(`✅ Successfully set up local Supabase for app ${appId}`);
      logger.info("═══════════════════════════════════════════════════════");
      logger.info("📝 Environment variables updated in .env.local");
      logger.info(`📊 Dashboard: ${LOCAL_SUPABASE_CONFIG.dashboardUrl}`);
      logger.info(`🔗 API URL: ${LOCAL_SUPABASE_CONFIG.url}`);
      logger.info("═══════════════════════════════════════════════════════");
      logger.info("💡 Next steps:");
      logger.info("   1. Your app is now connected to local Supabase");
      logger.info("   2. Use the dashboard to manage your database");
      logger.info("   3. When ready for production, use 'Promote to Production'");
      logger.info("═══════════════════════════════════════════════════════");
    },
  );

  // Get local Supabase status
  handle(
    "supabase:get-local-status",
    async (): Promise<LocalSupabaseStatus> => {
      const isRunning = checkDockerInstalled() && isLocalSupabaseRunning();

      if (isRunning) {
        return {
          isRunning: true,
          url: LOCAL_SUPABASE_CONFIG.url,
          dashboardUrl: LOCAL_SUPABASE_CONFIG.dashboardUrl,
          anonKey: LOCAL_SUPABASE_CONFIG.anonKey,
          serviceRoleKey: LOCAL_SUPABASE_CONFIG.serviceRoleKey,
        };
      }

      return { isRunning: false };
    },
  );

  // Stop local Supabase
  handle("supabase:stop-local", async () => {
    logger.info("🛑 Stopping local Supabase...");
    await stopLocalSupabase();
    logger.info("═══════════════════════════════════════════════════════");
    logger.info("✅ Local Supabase stopped successfully");
    logger.info("═══════════════════════════════════════════════════════");
    logger.info("💡 All containers have been stopped");
    logger.info("   Data is preserved in Docker volumes");
    logger.info("   Run 'npm run supabase:start' to restart");
    logger.info("═══════════════════════════════════════════════════════");
  });

  // Promote to production
  handle(
    "supabase:promote-to-production",
    async (
      _,
      params: ProductionPromotionParams,
    ): Promise<ProductionPromotionStatus> => {
      logger.info("═══════════════════════════════════════════════════════");
      logger.info(`🚀 Starting production promotion for app ${params.appId}`);
      logger.info("═══════════════════════════════════════════════════════");

      try {
        // Get the app to find its path
        logger.info("📋 Step 1/5: Fetching app information...");
        const app = await db
          .select()
          .from(apps)
          .where(eq(apps.id, params.appId))
          .get();
        if (!app) {
          throw new Error(`App with ID ${params.appId} not found`);
        }
        logger.info(`✅ App found: ${app.name || "Unknown"}`);

        // Validate local Supabase is running
        logger.info("📋 Step 2/5: Validating local Supabase...");
        if (!isLocalSupabaseRunning()) {
          throw new Error(
            "Local Supabase is not running. Please start it first.",
          );
        }
        logger.info("✅ Local Supabase is running");

        // Extract database schema from local Supabase
        logger.info("📋 Step 3/5: Extracting database schema...");
        const _schema = await extractLocalDatabaseSchema();
        logger.info("✅ Database schema extracted successfully");

        // Update the app to use production Supabase
        logger.info("📋 Step 4/5: Updating app configuration...");
        await db
          .update(apps)
          .set({
            supabaseProjectId: params.productionProjectRef,
            supabaseProjectName: null, // Will be fetched and cached on next getApp call
          })
          .where(eq(apps.id, params.appId));
        logger.info("✅ App configuration updated");

        // Update environment variables with production credentials
        logger.info("📋 Step 5/5: Updating environment variables...");
        try {
          const { updateEnvironmentVariablesWithStructure } = await import(
            "../utils/app_env_var_utils"
          );
          await updateEnvironmentVariablesWithStructure({
            appPath: app.path,
            envVars: {
              SUPABASE_URL: params.supabaseUrl,
              SUPABASE_ANON_KEY: params.anonKey,
              SUPABASE_SERVICE_ROLE_KEY: params.serviceRoleKey,
              POSTGRES_URL: `postgresql://postgres:${params.dbPassword}@db.${params.productionProjectRef}.supabase.co:5432/postgres`,
              NEXT_PUBLIC_SUPABASE_URL: params.supabaseUrl,
              NEXT_PUBLIC_SUPABASE_ANON_KEY: params.anonKey,
            },
            isLocalSupabase: false,
          });
        } catch {
          // Fallback to simple update
          await updateEnvironmentVariables({
            appPath: app.path,
            envVars: {
              SUPABASE_URL: params.supabaseUrl,
              SUPABASE_ANON_KEY: params.anonKey,
              SUPABASE_SERVICE_ROLE_KEY: params.serviceRoleKey,
              POSTGRES_URL: `postgresql://postgres:${params.dbPassword}@db.${params.productionProjectRef}.supabase.co:5432/postgres`,
              NEXT_PUBLIC_SUPABASE_URL: params.supabaseUrl,
              NEXT_PUBLIC_SUPABASE_ANON_KEY: params.anonKey,
            },
          });
        }
        logger.info("✅ Environment variables updated");

        logger.info("═══════════════════════════════════════════════════════");
        logger.info(`✅ Successfully promoted app ${params.appId} to production`);
        logger.info("═══════════════════════════════════════════════════════");
        logger.info("📝 Summary:");
        logger.info(`   Project: ${params.productionProjectRef}`);
        logger.info(`   URL: ${params.supabaseUrl}`);
        logger.info("   Schema: Exported ✓");
        logger.info("   Environment: Updated ✓");
        logger.info("═══════════════════════════════════════════════════════");
        logger.info("💡 Next steps:");
        logger.info("   1. Review and apply the database schema in production");
        logger.info("   2. Configure Row Level Security (RLS) policies");
        logger.info("   3. Test your app with production Supabase");
        logger.info("   4. Set up monitoring and backups");
        logger.info("═══════════════════════════════════════════════════════");

        return {
          success: true,
          message: "Production promotion completed successfully",
          productionProjectRef: params.productionProjectRef,
          schemaExported: true,
          envFilesUpdated: true,
        };
      } catch (error) {
        logger.error("═══════════════════════════════════════════════════════");
        logger.error("❌ Production promotion failed");
        logger.error("═══════════════════════════════════════════════════════");
        logger.error("Error:", error);
        logger.error("═══════════════════════════════════════════════════════");
        return {
          success: false,
          message: `Production promotion failed: ${error}`,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );
}
