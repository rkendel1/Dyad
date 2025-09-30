#!/usr/bin/env node

const { execSync } = require("child_process");

// Configuration for local Supabase
const LOCAL_SUPABASE_CONFIG = {
  url: "http://localhost:8000",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  dashboardUrl: "http://localhost:3001",
};

function checkDockerInstalled() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    execSync("docker-compose --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isSupabaseRunning() {
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

function startSupabase() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🚀 Starting local Supabase...");
  console.log("═══════════════════════════════════════════════════════");

  if (!checkDockerInstalled()) {
    console.error("❌ Docker is not installed or not running");
    console.error("   Please install Docker Desktop and ensure it's running");
    return false;
  }

  try {
    console.log("📦 Starting services:");
    console.log("   - PostgreSQL Database");
    console.log("   - Kong API Gateway");
    console.log("   - GoTrue Auth");
    console.log("   - PostgREST API");
    console.log("   - Realtime Server");
    console.log("   - Storage API");
    console.log("   - Supabase Studio");
    console.log("");

    // Start the services
    execSync("docker-compose -f docker-compose.supabase.yml up -d", {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ Supabase started successfully!");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`📊 Dashboard:        ${LOCAL_SUPABASE_CONFIG.dashboardUrl}`);
    console.log(`🔗 API URL:          ${LOCAL_SUPABASE_CONFIG.url}`);
    console.log(`🗄️  Database:         localhost:5432`);
    console.log("═══════════════════════════════════════════════════════");
    console.log("📝 Connection details:");
    console.log(`   Anon Key: ${LOCAL_SUPABASE_CONFIG.anonKey.substring(0, 50)}...`);
    console.log("═══════════════════════════════════════════════════════");
    console.log("💡 Next steps:");
    console.log("   1. Open the dashboard to manage your database");
    console.log("   2. Connect your app to local Supabase");
    console.log("   3. Use 'npm run supabase:status' to check status");
    console.log("═══════════════════════════════════════════════════════");

    return true;
  } catch (error) {
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ Failed to start Supabase");
    console.error("═══════════════════════════════════════════════════════");
    console.error("Error:", error.message);
    console.error("═══════════════════════════════════════════════════════");
    console.error("💡 Troubleshooting:");
    console.error("   1. Make sure Docker Desktop is running");
    console.error("   2. Check if ports 5432, 8000, 3001 are available");
    console.error("   3. Try 'npm run supabase:stop' first, then start again");
    console.error("═══════════════════════════════════════════════════════");
    return false;
  }
}

function stopSupabase() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🛑 Stopping local Supabase...");
  console.log("═══════════════════════════════════════════════════════");

  try {
    execSync("docker-compose -f docker-compose.supabase.yml down", {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ Supabase stopped successfully!");
    console.log("═══════════════════════════════════════════════════════");
    console.log("💡 All containers stopped");
    console.log("   Data is preserved in Docker volumes");
    console.log("   Run 'npm run supabase:start' to restart");
    console.log("═══════════════════════════════════════════════════════");
    return true;
  } catch (error) {
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ Failed to stop Supabase");
    console.error("═══════════════════════════════════════════════════════");
    console.error("Error:", error.message);
    console.error("═══════════════════════════════════════════════════════");
    return false;
  }
}

function getStatus() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("📊 Local Supabase Status");
  console.log("═══════════════════════════════════════════════════════");

  if (!checkDockerInstalled()) {
    console.log("❌ Docker is not installed or not running");
    console.log("   Please install Docker Desktop and ensure it's running");
    console.log("═══════════════════════════════════════════════════════");
    return false;
  }

  console.log("✅ Docker is installed and running");

  if (isSupabaseRunning()) {
    console.log("✅ Local Supabase is running");
    console.log("═══════════════════════════════════════════════════════");
    console.log("📝 Connection Information:");
    console.log(`   Dashboard:  ${LOCAL_SUPABASE_CONFIG.dashboardUrl}`);
    console.log(`   API URL:    ${LOCAL_SUPABASE_CONFIG.url}`);
    console.log(`   Database:   localhost:5432`);
    console.log("═══════════════════════════════════════════════════════");
    console.log("💡 Available commands:");
    console.log("   npm run supabase:stop     - Stop Supabase");
    console.log("   npm run supabase:promote  - Promote to production");
    console.log("═══════════════════════════════════════════════════════");
    return true;
  } else {
    console.log("⏹️  Local Supabase is not running");
    console.log("═══════════════════════════════════════════════════════");
    console.log("💡 Start Supabase with:");
    console.log("   npm run supabase:start");
    console.log("═══════════════════════════════════════════════════════");
    return false;
  }
}

function showConfig() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("⚙️  Local Supabase Configuration");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`📊 Dashboard:        ${LOCAL_SUPABASE_CONFIG.dashboardUrl}`);
  console.log(`🔗 API URL:          ${LOCAL_SUPABASE_CONFIG.url}`);
  console.log(`🗄️  Database:         localhost:5432`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("📝 API Keys:");
  console.log(`   Anon Key:         ${LOCAL_SUPABASE_CONFIG.anonKey.substring(0, 50)}...`);
  console.log(`   Service Role Key: ${LOCAL_SUPABASE_CONFIG.serviceRoleKey.substring(0, 50)}...`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("💡 These credentials are for local development only");
  console.log("   Use different credentials for production");
  console.log("═══════════════════════════════════════════════════════");
}

function showHelp() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("📚 Local Supabase Setup Script");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("Usage: node setup-local-supabase.js [command]");
  console.log("");
  console.log("Commands:");
  console.log("  start     Start the local Supabase environment");
  console.log("  stop      Stop the local Supabase environment");
  console.log("  status    Check if Supabase is running");
  console.log("  config    Show connection configuration");
  console.log("  help      Show this help message");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("🚀 Production Promotion:");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("To promote your local development to production:");
  console.log("  npm run supabase:promote");
  console.log("");
  console.log("This interactive tool will guide you through:");
  console.log("  • Creating or configuring production project");
  console.log("  • Migrating database schema");
  console.log("  • Updating environment files");
  console.log("  • Deploying functions to production");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("📖 Examples:");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  # Start local Supabase");
  console.log("  npm run supabase:start");
  console.log("");
  console.log("  # Check status");
  console.log("  npm run supabase:status");
  console.log("");
  console.log("  # Promote to production");
  console.log("  npm run supabase:promote");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
}

// Main execution
const command = process.argv[2] || "help";

switch (command) {
  case "start":
    if (!checkDockerInstalled()) {
      console.error(
        "❌ Docker is required but not installed. Please install Docker first.",
      );
      console.error("   Visit: https://docs.docker.com/get-docker/");
      process.exit(1);
    }
    startSupabase();
    break;

  case "stop":
    stopSupabase();
    break;

  case "status":
    getStatus();
    break;

  case "config":
    showConfig();
    break;

  case "help":
  default:
    showHelp();
    break;
}
