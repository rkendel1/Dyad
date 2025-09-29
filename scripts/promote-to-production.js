#!/usr/bin/env node

/**
 * Production Promotion Script for Local Supabase
 *
 * This script helps developers promote their local Supabase environment
 * to a production Supabase instance by:
 * 1. Creating a new production project (or using existing)
 * 2. Migrating database schema from local to production
 * 3. Optionally migrating data
 * 4. Updating environment files with production credentials
 * 5. Deploying functions to production
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Configuration for local Supabase (matching existing config)
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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility functions
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const icon =
    {
      info: "📝",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      question: "❓",
    }[type] || "📝";

  console.log(`${icon} [${timestamp}] ${message}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`❓ ${prompt} `, resolve);
  });
}

function checkLocalSupabaseRunning() {
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

function getLocalDatabaseSchema() {
  log("Extracting database schema from local Supabase...");

  try {
    // Use pg_dump for more reliable schema extraction
    const pgDumpCommand = `pg_dump "${LOCAL_SUPABASE_CONFIG.postgresUrl}" --schema-only --no-owner --no-privileges`;
    const schema = execSync(pgDumpCommand, { encoding: "utf8" });

    return schema;
  } catch (error) {
    throw new Error(`Failed to extract database schema: ${error.message}`);
  }
}

function updateEnvironmentFile(filePath, updates) {
  log(`Updating environment file: ${filePath}`);

  let content = "";
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, "utf8");
  }

  // Parse existing environment variables
  const envVars = new Map();
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const equalIndex = trimmedLine.indexOf("=");
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      const value = trimmedLine.substring(equalIndex + 1).trim();
      envVars.set(key, value);
    }
  }

  // Apply updates
  for (const [key, value] of Object.entries(updates)) {
    envVars.set(key, value);
  }

  // Write back to file
  const newContent = Array.from(envVars.entries())
    .map(([key, value]) => {
      // Quote values that contain special characters
      const needsQuotes = /[\s#"'=&?]/.test(value);
      const quotedValue = needsQuotes
        ? `"${value.replace(/"/g, '\\"')}"`
        : value;
      return `${key}=${quotedValue}`;
    })
    .join("\n");

  fs.writeFileSync(filePath, newContent);
  log(`Successfully updated ${filePath}`, "success");
}

async function promptForProjectDetails() {
  log("Gathering production project details...");

  const useExisting = await question(
    "Do you want to use an existing Supabase project? (y/N)",
  );

  if (
    useExisting.toLowerCase() === "y" ||
    useExisting.toLowerCase() === "yes"
  ) {
    const projectRef = await question(
      "Enter your existing project reference ID: ",
    );
    const supabaseUrl = await question(
      "Enter your Supabase URL (e.g., https://your-project.supabase.co): ",
    );
    const anonKey = await question("Enter your anon key: ");
    const serviceRoleKey = await question("Enter your service role key: ");

    return {
      projectRef,
      supabaseUrl,
      anonKey,
      serviceRoleKey,
      isNew: false,
    };
  } else {
    const projectName = await question(
      "Enter a name for your new production project: ",
    );
    const organizationId = await question(
      "Enter your Supabase organization ID: ",
    );
    const region =
      (await question("Enter your preferred region (default: us-east-1): ")) ||
      "us-east-1";
    const dbPassword = await question("Enter a strong database password: ");

    return {
      projectName,
      organizationId,
      region,
      dbPassword,
      isNew: true,
    };
  }
}

async function createProductionProject(projectDetails) {
  log("Creating new production Supabase project...");

  // This would require the Supabase Management API
  // For now, we'll provide instructions for manual creation
  log("To create a production project, please:", "warning");
  log("1. Go to https://supabase.com/dashboard");
  log('2. Click "New Project"');
  log(`3. Name: ${projectDetails.projectName}`);
  log(`4. Organization: ${projectDetails.organizationId}`);
  log(`5. Region: ${projectDetails.region}`);
  log(`6. Database Password: ${projectDetails.dbPassword}`);
  log("7. After creation, return here with the project details");

  await question(
    "Press Enter when you have created the project and have the credentials ready...",
  );

  const projectRef = await question("Enter the project reference ID: ");
  const supabaseUrl = await question("Enter the Supabase URL: ");
  const anonKey = await question("Enter the anon key: ");
  const serviceRoleKey = await question("Enter the service role key: ");

  return {
    projectRef,
    supabaseUrl,
    anonKey,
    serviceRoleKey,
  };
}

async function migrateSchema(productionConfig, schema) {
  log("Migrating database schema to production...");

  try {
    // Write schema to temporary file
    const tempSchemaFile = path.join(__dirname, "../tmp/production-schema.sql");
    fs.mkdirSync(path.dirname(tempSchemaFile), { recursive: true });
    fs.writeFileSync(tempSchemaFile, schema);

    log(
      "Schema written to temporary file. You can now apply it to your production database.",
    );
    log(`Temporary schema file: ${tempSchemaFile}`);
    log("");
    log("To apply the schema manually:", "warning");
    log("1. Go to your Supabase dashboard SQL editor");
    log("2. Copy and paste the schema from the temporary file");
    log("3. Execute the SQL");
    log("");
    log("OR use psql:");
    log(
      `psql "postgresql://postgres:${productionConfig.dbPassword}@db.${productionConfig.projectRef}.supabase.co:5432/postgres" -f ${tempSchemaFile}`,
    );

    const confirmed = await question(
      "Have you successfully applied the schema? (y/N)",
    );
    if (confirmed.toLowerCase() !== "y" && confirmed.toLowerCase() !== "yes") {
      throw new Error(
        "Schema migration was not confirmed. Please apply the schema before continuing.",
      );
    }

    log("Schema migration completed", "success");
  } catch (error) {
    throw new Error(`Schema migration failed: ${error.message}`);
  }
}

async function migrateFunctions(_productionConfig) {
  log("Checking for Supabase functions to migrate...");

  const functionsDir = path.join(process.cwd(), "supabase/functions");
  if (!fs.existsSync(functionsDir)) {
    log("No functions directory found, skipping function migration");
    return;
  }

  const functions = fs.readdirSync(functionsDir).filter((item) => {
    const itemPath = path.join(functionsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  if (functions.length === 0) {
    log("No functions found to migrate");
    return;
  }

  log(
    `Found ${functions.length} function(s) to migrate: ${functions.join(", ")}`,
  );

  for (const functionName of functions) {
    const functionPath = path.join(functionsDir, functionName);
    const indexPath = path.join(functionPath, "index.ts");

    if (fs.existsSync(indexPath)) {
      const _functionCode = fs.readFileSync(indexPath, "utf8");
      log(`Function ${functionName} ready for deployment`);
      log("To deploy manually:", "warning");
      log("1. Go to your Supabase dashboard Functions section");
      log(`2. Create a new function named "${functionName}"`);
      log("3. Copy and paste the function code");
      log("4. Deploy the function");
      log("");
    }
  }

  const confirmed = await question("Have you deployed all functions? (y/N)");
  if (confirmed.toLowerCase() === "y" || confirmed.toLowerCase() === "yes") {
    log("Function migration completed", "success");
  }
}

async function updateEnvironmentFiles(productionConfig, appPath) {
  log("Updating environment files...");

  const envLocalPath = path.join(appPath, ".env.local");
  const envProductionPath = path.join(appPath, ".env.production");

  const productionEnvVars = {
    SUPABASE_URL: productionConfig.supabaseUrl,
    SUPABASE_ANON_KEY: productionConfig.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: productionConfig.serviceRoleKey,
    POSTGRES_URL: `postgresql://postgres:${productionConfig.dbPassword}@db.${productionConfig.projectRef}.supabase.co:5432/postgres`,
    NEXT_PUBLIC_SUPABASE_URL: productionConfig.supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: productionConfig.anonKey,
  };

  // Update .env.local with production values
  updateEnvironmentFile(envLocalPath, productionEnvVars);

  // Create .env.production with production values
  updateEnvironmentFile(envProductionPath, productionEnvVars);

  log("Environment files updated successfully", "success");
}

async function optionalDataMigration() {
  const shouldMigrate = await question(
    "Do you want to migrate data from local to production? (y/N)",
  );

  if (
    shouldMigrate.toLowerCase() === "y" ||
    shouldMigrate.toLowerCase() === "yes"
  ) {
    log("Data migration selected", "warning");
    log("Data migration requires careful consideration:");
    log("1. Ensure your production database is ready");
    log("2. Consider the data size and migration time");
    log("3. Plan for potential downtime");
    log("4. Have a backup strategy");
    log("");
    log("For data migration, we recommend using pg_dump and pg_restore:");
    log(
      `pg_dump "${LOCAL_SUPABASE_CONFIG.postgresUrl}" --data-only --no-owner --no-privileges > data.sql`,
    );
    log("Then apply to production using the SQL editor or psql");
    log("");

    await question(
      "Press Enter when you have completed data migration (or skip if not needed)...",
    );
  }
}

async function performPostMigrationValidation(_productionConfig) {
  log("Performing post-migration validation...");

  log("Please verify the following in your production environment:");
  log("1. Database schema matches your local environment");
  log("2. All required tables and columns exist");
  log("3. Functions are deployed and working");
  log("4. Environment variables are correctly set");
  log("5. Authentication is configured properly");
  log("6. Storage buckets are set up if needed");
  log("");

  const validationPassed = await question(
    "Have you verified all items above? (y/N)",
  );

  if (
    validationPassed.toLowerCase() === "y" ||
    validationPassed.toLowerCase() === "yes"
  ) {
    log("Post-migration validation completed", "success");
    return true;
  } else {
    log("Please complete validation before proceeding", "warning");
    return false;
  }
}

async function showSummary(productionConfig, appPath) {
  log("");
  log("🎉 Production promotion completed successfully!", "success");
  log("");
  log("Production Environment Details:");
  log(`Project Reference: ${productionConfig.projectRef}`);
  log(`Supabase URL: ${productionConfig.supabaseUrl}`);
  log(
    `Dashboard: https://supabase.com/dashboard/project/${productionConfig.projectRef}`,
  );
  log("");
  log("Updated Files:");
  log(`- ${path.join(appPath, ".env.local")}`);
  log(`- ${path.join(appPath, ".env.production")}`);
  log("");
  log("Next Steps:");
  log("1. Test your application with the production environment");
  log("2. Configure your deployment pipeline to use .env.production");
  log("3. Set up monitoring and logging");
  log("4. Configure backups for your production database");
  log("5. Set up proper security policies");
  log("");
  log("Important Security Notes:");
  log(
    "- Keep your service role key secure and never expose it in client-side code",
  );
  log("- Review and configure Row Level Security (RLS) policies");
  log("- Set up proper authentication and authorization");
  log("- Consider setting up database backups");
}

// Main promotion workflow
async function main() {
  try {
    log("🚀 Starting Supabase Production Promotion", "info");
    log("");

    // Verify prerequisites
    log("Checking prerequisites...");

    if (!checkLocalSupabaseRunning()) {
      throw new Error(
        "Local Supabase is not running. Please start it first using: npm run supabase:start",
      );
    }

    log("Local Supabase is running ✓", "success");

    // Find app path (default to current directory)
    const appPath = process.cwd();
    log(`Working with app at: ${appPath}`);

    // Warning and confirmation
    log("");
    log("⚠️  IMPORTANT WARNING:", "warning");
    log(
      "This process will update your environment files and promote your local development to production.",
    );
    log("Make sure you have:");
    log("1. A Supabase account with appropriate permissions");
    log("2. Backed up any important data");
    log("3. Tested your local environment thoroughly");
    log("4. A plan for handling any migration issues");
    log("");

    const confirmed = await question(
      "Do you want to continue with the production promotion? (y/N)",
    );
    if (confirmed.toLowerCase() !== "y" && confirmed.toLowerCase() !== "yes") {
      log("Production promotion cancelled by user");
      return;
    }

    // Get production project details
    const projectDetails = await promptForProjectDetails();

    // Create or use existing project
    let productionConfig;
    if (projectDetails.isNew) {
      productionConfig = await createProductionProject(projectDetails);
    } else {
      productionConfig = projectDetails;
    }

    // Extract local database schema
    const schema = getLocalDatabaseSchema();

    // Migrate schema
    await migrateSchema(productionConfig, schema);

    // Migrate functions
    await migrateFunctions(productionConfig);

    // Optional data migration
    await optionalDataMigration();

    // Update environment files
    await updateEnvironmentFiles(productionConfig, appPath);

    // Post-migration validation
    const validationPassed =
      await performPostMigrationValidation(productionConfig);

    if (validationPassed) {
      // Show summary
      await showSummary(productionConfig, appPath);
    } else {
      log(
        "Production promotion completed with warnings. Please review and validate manually.",
        "warning",
      );
    }
  } catch (error) {
    log(`Production promotion failed: ${error.message}`, "error");
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle command line arguments
function showHelp() {
  console.log(`
Supabase Production Promotion Tool

Usage: node scripts/promote-to-production.js [command]

Commands:
  promote   Start the production promotion process (default)
  help      Show this help message

Examples:
  node scripts/promote-to-production.js
  node scripts/promote-to-production.js promote
  npm run supabase:promote

This tool helps you:
1. Create or configure a production Supabase project
2. Migrate database schema from local to production
3. Deploy functions to production
4. Update environment files with production credentials
5. Provide guidance for data migration and validation

Prerequisites:
- Local Supabase must be running
- Supabase account with appropriate permissions  
- PostgreSQL client tools (pg_dump, psql) installed
  `);
}

// Main execution
const command = process.argv[2] || "promote";

switch (command) {
  case "promote":
    main().catch(console.error);
    break;

  case "help":
  default:
    showHelp();
    break;
}
