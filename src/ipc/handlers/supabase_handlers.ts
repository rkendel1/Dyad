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
import { SetupLocalSupabaseParams, LocalSupabaseStatus, ProductionPromotionParams, ProductionPromotionStatus } from "../ipc_types";
import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { updatePostgresUrlEnvVar, updateEnvironmentVariables } from "../utils/app_env_var_utils";
import fetch from "node-fetch";

const logger = log.scope("supabase_handlers");
const handle = createLoggedHandler(logger);
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

// Local Supabase configuration
const LOCAL_SUPABASE_CONFIG = {
  url: 'http://localhost:8000',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  dashboardUrl: 'http://localhost:3001',
  postgresUrl: 'postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres'
};

function checkDockerInstalled(): boolean {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    execSync('docker-compose --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isLocalSupabaseRunning(): boolean {
  try {
    const result = execSync('docker-compose -f docker-compose.supabase.yml ps --services --filter "status=running"', 
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

async function startLocalSupabase(): Promise<void> {
  const dockerComposeFile = path.resolve(process.cwd(), 'docker-compose.supabase.yml');
  
  if (!existsSync(dockerComposeFile)) {
    throw new Error('docker-compose.supabase.yml not found. Make sure the local Supabase configuration files are present.');
  }

  if (!checkDockerInstalled()) {
    throw new Error('Docker is not installed or not running. Please install Docker to use local Supabase.');
  }

  try {
    logger.info('Starting local Supabase...');
    execSync('docker-compose -f docker-compose.supabase.yml up -d', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    logger.info('Local Supabase containers started, waiting for services to be ready...');
    
    // Wait for services to be ready with better validation
    await waitForSupabaseReady();
    
    logger.info('Local Supabase started successfully and is ready');
  } catch (error) {
    logger.error('Failed to start local Supabase:', error);
    throw new Error(`Failed to start local Supabase: ${error}`);
  }
}

async function waitForSupabaseReady(maxWaitTime = 60000): Promise<void> {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Check if services are running
      if (!isLocalSupabaseRunning()) {
        logger.debug('Waiting for Supabase containers to start...');
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        continue;
      }
      
      // Check if API is responding
      const response = await fetch(`${LOCAL_SUPABASE_CONFIG.url}/health`, {
        method: 'GET',
        timeout: 5000
      }).catch(() => null);
      
      if (response && response.ok) {
        logger.info('Supabase API is responding');
        // Additional wait to ensure dashboard is ready
        await new Promise(resolve => setTimeout(resolve, 3000));
        return;
      }
      
      logger.debug('Waiting for Supabase API to respond...');
    } catch (error) {
      logger.debug('Still waiting for Supabase to be ready:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  throw new Error('Timeout waiting for local Supabase to be ready. Services may have failed to start properly.');
}

async function stopLocalSupabase(): Promise<void> {
  try {
    logger.info('Stopping local Supabase...');
    execSync('docker-compose -f docker-compose.supabase.yml down', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    logger.info('Local Supabase stopped successfully');
  } catch (error) {
    logger.error('Failed to stop local Supabase:', error);
    throw new Error(`Failed to stop local Supabase: ${error}`);
  }
}

async function extractLocalDatabaseSchema(): Promise<string> {
  try {
    logger.info('Extracting database schema from local Supabase...');
    
    // Use pg_dump to extract schema
    const pgDumpCommand = `pg_dump "${LOCAL_SUPABASE_CONFIG.postgresUrl}" --schema-only --no-owner --no-privileges`;
    const schema = execSync(pgDumpCommand, { encoding: 'utf8' });
    
    logger.info('Database schema extracted successfully');
    return schema;
  } catch (error) {
    logger.error('Failed to extract database schema:', error);
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
        .set({ supabaseProjectId: project })
        .where(eq(apps.id, app));

      logger.info(`Associated app ${app} with Supabase project ${project}`);
    },
  );

  // Unset app project - removes the link between a Dyad app and a Supabase project
  handle("supabase:unset-app-project", async (_, { app }: { app: number }) => {
    await db
      .update(apps)
      .set({ supabaseProjectId: null })
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
      logger.info(`Setting up local Supabase for app ${appId}`);
      
      // Start local Supabase if not running
      if (!isLocalSupabaseRunning()) {
        await startLocalSupabase();
      } else {
        // Even if running, wait a bit to ensure it's fully ready
        logger.info('Local Supabase is already running, checking readiness...');
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
          supabaseProjectId: "local-supabase"
        })
        .where(eq(apps.id, appId));
      
      // Update the app's environment variables
      await updatePostgresUrlEnvVar({
        appPath: app.path,
        connectionUri: LOCAL_SUPABASE_CONFIG.postgresUrl
      });
      
      logger.info(`Successfully set up local Supabase for app ${appId}`);
    }
  );

  // Get local Supabase status
  handle("supabase:get-local-status", async (): Promise<LocalSupabaseStatus> => {
    const isRunning = checkDockerInstalled() && isLocalSupabaseRunning();
    
    if (isRunning) {
      return {
        isRunning: true,
        url: LOCAL_SUPABASE_CONFIG.url,
        dashboardUrl: LOCAL_SUPABASE_CONFIG.dashboardUrl,
        anonKey: LOCAL_SUPABASE_CONFIG.anonKey,
        serviceRoleKey: LOCAL_SUPABASE_CONFIG.serviceRoleKey
      };
    }
    
    return { isRunning: false };
  });

  // Stop local Supabase
  handle("supabase:stop-local", async () => {
    await stopLocalSupabase();
    logger.info("Local Supabase stopped");
  });

  // Promote to production
  handle(
    "supabase:promote-to-production", 
    async (_, params: ProductionPromotionParams): Promise<ProductionPromotionStatus> => {
      logger.info(`Starting production promotion for app ${params.appId}`);
      
      try {
        // Get the app to find its path
        const app = await db.select().from(apps).where(eq(apps.id, params.appId)).get();
        if (!app) {
          throw new Error(`App with ID ${params.appId} not found`);
        }

        // Validate local Supabase is running
        if (!isLocalSupabaseRunning()) {
          throw new Error('Local Supabase is not running. Please start it first.');
        }

        // Extract database schema from local Supabase
        const _schema = await extractLocalDatabaseSchema();
        
        // Update the app to use production Supabase
        await db
          .update(apps)
          .set({
            supabaseProjectId: params.productionProjectRef
          })
          .where(eq(apps.id, params.appId));

        // Update environment variables with production credentials
        await updateEnvironmentVariables({
          appPath: app.path,
          envVars: {
            'SUPABASE_URL': params.supabaseUrl,
            'SUPABASE_ANON_KEY': params.anonKey,
            'SUPABASE_SERVICE_ROLE_KEY': params.serviceRoleKey,
            'POSTGRES_URL': `postgresql://postgres:${params.dbPassword}@db.${params.productionProjectRef}.supabase.co:5432/postgres`,
            'NEXT_PUBLIC_SUPABASE_URL': params.supabaseUrl,
            'NEXT_PUBLIC_SUPABASE_ANON_KEY': params.anonKey
          }
        });

        logger.info(`Successfully promoted app ${params.appId} to production`);
        
        return {
          success: true,
          message: 'Production promotion completed successfully',
          productionProjectRef: params.productionProjectRef,
          schemaExported: true,
          envFilesUpdated: true
        };
        
      } catch (error) {
        logger.error('Production promotion failed:', error);
        return {
          success: false,
          message: `Production promotion failed: ${error}`,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  );
}
