#!/usr/bin/env node

/**
 * Supabase Environment Switcher
 * 
 * This script helps you switch between local and hosted Supabase environments
 * by managing the .env.local file in your app.
 * 
 * Usage:
 *   node scripts/switch-supabase-env.js <app-path> <local|hosted>
 * 
 * Or use npm scripts:
 *   npm run supabase:switch-local <app-path>
 *   npm run supabase:switch-hosted <app-path>
 */

const fs = require("fs");
const path = require("path");

// Local Supabase configuration
const LOCAL_SUPABASE_CONFIG = {
  POSTGRES_URL:
    "postgresql://postgres:your-super-secret-and-long-postgres-password@localhost:5432/postgres",
  SUPABASE_URL: "http://localhost:8000",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  SUPABASE_SERVICE_ROLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:8000",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
};

function log(message, type = "info") {
  const prefix = {
    info: "ℹ️ ",
    success: "✅",
    error: "❌",
    warning: "⚠️ ",
  }[type];
  console.log(`${prefix} ${message}`);
}

function findEnvFile(appPath) {
  const envPath = path.join(appPath, ".env.local");
  if (fs.existsSync(envPath)) {
    return envPath;
  }

  // Try to find in .dyad subdirectory
  const dyadEnvPath = path.join(appPath, ".dyad", ".env.local");
  if (fs.existsSync(dyadEnvPath)) {
    return dyadEnvPath;
  }

  return null;
}

function parseEnvFile(content) {
  const lines = content.split("\n");
  return lines;
}

function switchToLocal(envPath) {
  console.log("═══════════════════════════════════════════════════════");
  log("Switching to LOCAL Supabase environment...");
  console.log("═══════════════════════════════════════════════════════");

  if (!fs.existsSync(envPath)) {
    log("Creating new .env.local file...");
    const template = createStructuredEnvTemplate(true);
    fs.writeFileSync(envPath, template);
    console.log("═══════════════════════════════════════════════════════");
    log("Successfully switched to LOCAL Supabase", "success");
    console.log("═══════════════════════════════════════════════════════");
    log("Configuration:");
    log(`  URL: ${LOCAL_SUPABASE_CONFIG.SUPABASE_URL}`);
    log("  All local credentials are active");
    console.log("═══════════════════════════════════════════════════════");
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  const lines = parseEnvFile(content);
  const updatedLines = [];

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

    // Handle variable lines based on section
    if (trimmed && trimmed.includes("=")) {
      if (inLocalSection) {
        // Uncomment local variables
        updatedLines.push(line.replace(/^#\s*/, ""));
        continue;
      } else if (inHostedSection) {
        // Comment hosted variables
        if (!line.trim().startsWith("#")) {
          updatedLines.push(`# ${line}`);
        } else {
          updatedLines.push(line);
        }
        continue;
      }
    }

    // Keep line as-is
    updatedLines.push(line);
  }

  fs.writeFileSync(envPath, updatedLines.join("\n"));

  console.log("═══════════════════════════════════════════════════════");
  log("Successfully switched to LOCAL Supabase", "success");
  console.log("═══════════════════════════════════════════════════════");
  log("Configuration:");
  log(`  URL: ${LOCAL_SUPABASE_CONFIG.SUPABASE_URL}`);
  log("  All local credentials are now active");
  console.log("═══════════════════════════════════════════════════════");
  log("Next steps:");
  log("  1. Restart your development server");
  log("  2. Make sure local Supabase is running: npm run supabase:start");
  console.log("═══════════════════════════════════════════════════════");
}

function switchToHosted(envPath) {
  console.log("═══════════════════════════════════════════════════════");
  log("Switching to HOSTED Supabase environment...");
  console.log("═══════════════════════════════════════════════════════");

  if (!fs.existsSync(envPath)) {
    log(
      "No .env.local file found. Please set up hosted Supabase first.",
      "error",
    );
    console.log("═══════════════════════════════════════════════════════");
    log("Use the production promotion tool:", "info");
    log("  npm run supabase:promote");
    console.log("═══════════════════════════════════════════════════════");
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  const lines = parseEnvFile(content);
  const updatedLines = [];

  let inLocalSection = false;
  let inHostedSection = false;
  let foundHostedSection = false;

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
      foundHostedSection = true;
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

    // Handle variable lines based on section
    if (trimmed && trimmed.includes("=")) {
      if (inLocalSection) {
        // Comment local variables
        if (!line.trim().startsWith("#")) {
          updatedLines.push(`# ${line}`);
        } else {
          updatedLines.push(line);
        }
        continue;
      } else if (inHostedSection) {
        // Uncomment hosted variables
        updatedLines.push(line.replace(/^#\s*/, ""));
        continue;
      }
    }

    // Keep line as-is
    updatedLines.push(line);
  }

  if (!foundHostedSection) {
    log(
      "No hosted Supabase configuration found in .env.local",
      "warning",
    );
    console.log("═══════════════════════════════════════════════════════");
    log("Please set up hosted Supabase first using:", "info");
    log("  npm run supabase:promote");
    console.log("═══════════════════════════════════════════════════════");
    return;
  }

  fs.writeFileSync(envPath, updatedLines.join("\n"));

  console.log("═══════════════════════════════════════════════════════");
  log("Successfully switched to HOSTED Supabase", "success");
  console.log("═══════════════════════════════════════════════════════");
  log("Configuration:");
  log("  All hosted credentials are now active");
  log("  Local credentials are commented out");
  console.log("═══════════════════════════════════════════════════════");
  log("Next steps:");
  log("  1. Restart your development server");
  log("  2. Verify connection to your hosted Supabase project");
  console.log("═══════════════════════════════════════════════════════");
}

function createStructuredEnvTemplate(isLocal = true) {
  const localVars = Object.entries(LOCAL_SUPABASE_CONFIG)
    .map(([key, value]) => (isLocal ? `${key}=${value}` : `# ${key}=${value}`))
    .join("\n");

  return `# ============================================
# Supabase Configuration
# ============================================
# This file supports both local and hosted Supabase.
# Use the switch script to toggle between environments:
#   npm run supabase:switch-local <app-path>
#   npm run supabase:switch-hosted <app-path>

# ============================================
# LOCAL SUPABASE (Development)
# ============================================
${localVars}
# ============================================

# ============================================
# HOSTED SUPABASE (Production/Staging)
# ============================================
# POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
# SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# ============================================
`;
}

function showHelp() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("📚 Supabase Environment Switcher");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("Usage: node switch-supabase-env.js <app-path> <local|hosted>");
  console.log("");
  console.log("Arguments:");
  console.log("  app-path  Path to your app directory");
  console.log("  mode      'local' or 'hosted'");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("📖 Examples:");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  # Switch to local Supabase");
  console.log("  node scripts/switch-supabase-env.js ./my-app local");
  console.log("");
  console.log("  # Switch to hosted Supabase");
  console.log("  node scripts/switch-supabase-env.js ./my-app hosted");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "help" || args[0] === "--help") {
    showHelp();
    return;
  }

  if (args.length < 2) {
    log("Error: Missing required arguments", "error");
    showHelp();
    process.exit(1);
  }

  const [appPath, mode] = args;

  if (!fs.existsSync(appPath)) {
    log(`Error: App path does not exist: ${appPath}`, "error");
    process.exit(1);
  }

  const envPath = findEnvFile(appPath);
  if (!envPath && mode === "hosted") {
    log(`Error: No .env.local file found in ${appPath}`, "error");
    log(
      "Please set up your environment first using: npm run supabase:promote",
      "info",
    );
    process.exit(1);
  }

  const finalEnvPath = envPath || path.join(appPath, ".env.local");

  switch (mode.toLowerCase()) {
    case "local":
      switchToLocal(finalEnvPath);
      break;
    case "hosted":
      switchToHosted(finalEnvPath);
      break;
    default:
      log(`Error: Invalid mode '${mode}'. Use 'local' or 'hosted'`, "error");
      showHelp();
      process.exit(1);
  }
}

main();
