/**
 * DO NOT USE LOGGER HERE.
 * Environment variables are sensitive and should not be logged.
 */

import { getDyadAppPath } from "@/paths/paths";
import { EnvVar } from "../ipc_types";
import path from "path";
import fs from "fs";
import log from "electron-log";

const logger = log.scope("app_env_var_utils");

export const ENV_FILE_NAME = ".env.local";

function getEnvFilePath({ appPath }: { appPath: string }): string {
  return path.join(getDyadAppPath(appPath), ENV_FILE_NAME);
}

export async function updatePostgresUrlEnvVar({
  appPath,
  connectionUri,
}: {
  appPath: string;
  connectionUri: string;
}) {
  // Given the connection uri, update the env var for POSTGRES_URL
  const envVars = parseEnvFile(await readEnvFile({ appPath }));

  // Find existing POSTGRES_URL or add it if it doesn't exist
  const existingVar = envVars.find((envVar) => envVar.key === "POSTGRES_URL");
  if (existingVar) {
    existingVar.value = connectionUri;
  } else {
    envVars.push({
      key: "POSTGRES_URL",
      value: connectionUri,
    });
  }

  const envFileContents = serializeEnvFile(envVars);
  await fs.promises.writeFile(getEnvFilePath({ appPath }), envFileContents);
}

export async function updateEnvironmentVariables({
  appPath,
  envVars,
}: {
  appPath: string;
  envVars: Record<string, string>;
}) {
  try {
    // Try to read existing env file
    let existingEnvVars: EnvVar[];
    try {
      const content = await readEnvFile({ appPath });
      existingEnvVars = parseEnvFile(content);
    } catch {
      // If file doesn't exist, start with empty array
      existingEnvVars = [];
    }

    // Update or add new environment variables
    for (const [key, value] of Object.entries(envVars)) {
      const existingVar = existingEnvVars.find((envVar) => envVar.key === key);
      if (existingVar) {
        existingVar.value = value;
      } else {
        existingEnvVars.push({ key, value });
      }
    }

    const envFileContents = serializeEnvFile(existingEnvVars);
    await fs.promises.writeFile(getEnvFilePath({ appPath }), envFileContents);

    // Also create .env.production file
    const productionEnvPath = path.join(
      getDyadAppPath(appPath),
      ".env.production",
    );
    await fs.promises.writeFile(productionEnvPath, envFileContents);
  } catch (error) {
    logger.error(
      `Failed to update environment variables for app ${appPath}: ${error}`,
    );
    throw error;
  }
}

/**
 * Update environment variables with support for structured sections
 * This preserves comments and creates organized sections for local vs hosted
 */
export async function updateEnvironmentVariablesWithStructure({
  appPath,
  envVars,
  isLocalSupabase,
}: {
  appPath: string;
  envVars: Record<string, string>;
  isLocalSupabase: boolean;
}) {
  try {
    const envFilePath = getEnvFilePath({ appPath });
    let content = "";

    // Try to read existing file
    try {
      content = await readEnvFile({ appPath });
    } catch {
      // File doesn't exist, create structured template
      content = createStructuredEnvTemplate();
    }

    // Parse and update the content
    const lines = content.split("\n");
    const updatedLines: string[] = [];
    let inLocalSection = false;
    let inHostedSection = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect section markers
      if (trimmed.includes("LOCAL SUPABASE")) {
        inLocalSection = true;
        inHostedSection = false;
        updatedLines.push(line);
        continue;
      } else if (trimmed.includes("HOSTED SUPABASE")) {
        inLocalSection = false;
        inHostedSection = true;
        updatedLines.push(line);
        continue;
      } else if (
        trimmed.startsWith("#") &&
        trimmed.includes("===") &&
        (inLocalSection || inHostedSection)
      ) {
        // End of section
        inLocalSection = false;
        inHostedSection = false;
        updatedLines.push(line);
        continue;
      }

      // Handle variable lines based on current mode
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const equalIndex = trimmed.indexOf("=");
        const key = trimmed.substring(0, equalIndex).trim();

        // Check if this key should be updated
        if (key in envVars) {
          if (
            (isLocalSupabase && inLocalSection) ||
            (!isLocalSupabase && inHostedSection)
          ) {
            // Active section - add uncommented
            const needsQuotes = /[\s#"'=&?]/.test(envVars[key]);
            const quotedValue = needsQuotes
              ? `"${envVars[key].replace(/"/g, '\\"')}"`
              : envVars[key];
            updatedLines.push(`${key}=${quotedValue}`);
            continue;
          } else if (
            (!isLocalSupabase && inLocalSection) ||
            (isLocalSupabase && inHostedSection)
          ) {
            // Inactive section - comment out
            updatedLines.push(`# ${line.replace(/^#\s*/, "")}`);
            continue;
          }
        }
      }

      // Keep line as-is
      updatedLines.push(line);
    }

    // Write the updated content
    const newContent = updatedLines.join("\n");
    await fs.promises.writeFile(envFilePath, newContent);

    // Also update .env.production for hosted
    if (!isLocalSupabase) {
      const productionEnvPath = path.join(
        getDyadAppPath(appPath),
        ".env.production",
      );
      const simpleEnvVars = Object.entries(envVars)
        .map(([key, value]) => {
          const needsQuotes = /[\s#"'=&?]/.test(value);
          const quotedValue = needsQuotes
            ? `"${value.replace(/"/g, '\\"')}"`
            : value;
          return `${key}=${quotedValue}`;
        })
        .join("\n");
      await fs.promises.writeFile(productionEnvPath, simpleEnvVars);
    }
  } catch (error) {
    logger.error(
      `Failed to update environment variables for app ${appPath}: ${error}`,
    );
    throw error;
  }
}

/**
 * Create a structured template for .env.local with clear sections
 */
function createStructuredEnvTemplate(): string {
  return `# ============================================
# Supabase Configuration
# ============================================
# This file supports both local and hosted Supabase.
# Uncomment the section you want to use.
#
# To switch between environments:
# - For local development: uncomment LOCAL SUPABASE section
# - For hosted/production: uncomment HOSTED SUPABASE section

# ============================================
# LOCAL SUPABASE (Development)
# ============================================
# Uncomment these when using local Supabase
POSTGRES_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
# ============================================

# ============================================
# HOSTED SUPABASE (Production/Staging)
# ============================================
# Uncomment these when using hosted Supabase
# POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
# SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# ============================================
`;
}

export async function updateDbPushEnvVar({
  appPath,
  disabled,
}: {
  appPath: string;
  disabled: boolean;
}) {
  try {
    // Try to read existing env file
    let envVars: EnvVar[];
    try {
      const content = await readEnvFile({ appPath });
      envVars = parseEnvFile(content);
    } catch {
      // If file doesn't exist, start with empty array
      envVars = [];
    }

    // Update or add DYAD_DISABLE_DB_PUSH
    const existingVar = envVars.find(
      (envVar) => envVar.key === "DYAD_DISABLE_DB_PUSH",
    );
    if (existingVar) {
      existingVar.value = disabled ? "true" : "false";
    } else {
      envVars.push({
        key: "DYAD_DISABLE_DB_PUSH",
        value: disabled ? "true" : "false",
      });
    }

    const envFileContents = serializeEnvFile(envVars);
    await fs.promises.writeFile(getEnvFilePath({ appPath }), envFileContents);
  } catch (error) {
    logger.error(
      `Failed to update DB push environment variable for app ${appPath}: ${error}`,
    );
    throw error;
  }
}

export async function readPostgresUrlFromEnvFile({
  appPath,
}: {
  appPath: string;
}): Promise<string> {
  const contents = await readEnvFile({ appPath });
  const envVars = parseEnvFile(contents);
  const postgresUrl = envVars.find(
    (envVar) => envVar.key === "POSTGRES_URL",
  )?.value;
  if (!postgresUrl) {
    throw new Error("POSTGRES_URL not found in .env.local");
  }
  return postgresUrl;
}

export async function readEnvFile({
  appPath,
}: {
  appPath: string;
}): Promise<string> {
  return fs.promises.readFile(getEnvFilePath({ appPath }), "utf8");
}

// Helper function to parse .env.local file content
export function parseEnvFile(content: string): EnvVar[] {
  const envVars: EnvVar[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    // Parse key=value pairs
    const equalIndex = trimmedLine.indexOf("=");
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      const value = trimmedLine.substring(equalIndex + 1).trim();

      // Handle quoted values with potential inline comments
      let cleanValue = value;
      if (value.startsWith('"')) {
        // Find the closing quote, handling escaped quotes
        let endQuoteIndex = -1;
        for (let i = 1; i < value.length; i++) {
          if (value[i] === '"' && value[i - 1] !== "\\") {
            endQuoteIndex = i;
            break;
          }
        }
        if (endQuoteIndex !== -1) {
          cleanValue = value.slice(1, endQuoteIndex);
          // Unescape escaped quotes
          cleanValue = cleanValue.replace(/\\"/g, '"');
        }
      } else if (value.startsWith("'")) {
        // Find the closing quote for single quotes
        const endQuoteIndex = value.indexOf("'", 1);
        if (endQuoteIndex !== -1) {
          cleanValue = value.slice(1, endQuoteIndex);
        }
      }
      // For unquoted values, keep everything as-is (including potential # symbols)

      envVars.push({ key, value: cleanValue });
    }
  }

  return envVars;
}

// Helper function to serialize environment variables to .env.local format
export function serializeEnvFile(envVars: EnvVar[]): string {
  return envVars
    .map(({ key, value }) => {
      // Add quotes if value contains spaces or special characters
      const needsQuotes = /[\s#"'=&?]/.test(value);
      const quotedValue = needsQuotes
        ? `"${value.replace(/"/g, '\\"')}"`
        : value;
      return `${key}=${quotedValue}`;
    })
    .join("\n");
}
