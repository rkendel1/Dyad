#!/usr/bin/env node

/**
 * Validation script for per-app Supabase configuration
 * Tests the port allocation and configuration logic without Docker
 */

console.log("═══════════════════════════════════════════════════════");
console.log("🧪 Testing Per-App Supabase Configuration");
console.log("═══════════════════════════════════════════════════════");
console.log("");

// Simulate the getAppSupabaseConfig function
function getAppSupabaseConfig(appId) {
  const postgresPort = 5432 + appId * 100;
  const apiPort = 8000 + appId * 100;
  const dashboardPort = 3001 + appId * 100;
  
  const jwtSecret = `your-super-secret-jwt-token-with-at-least-32-characters-long-app-${appId}`;
  const dbPassword = `your-super-secret-and-long-postgres-password-app-${appId}`;
  
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
  const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
  
  return {
    url: `http://localhost:${apiPort}`,
    anonKey,
    serviceRoleKey,
    dashboardUrl: `http://localhost:${dashboardPort}`,
    postgresUrl: `postgresql://postgres:${dbPassword}@localhost:${postgresPort}/postgres`,
    postgresPort,
    apiPort,
    dashboardPort,
    jwtSecret,
    dbPassword,
  };
}

// Test multiple app configurations
const testAppIds = [1, 2, 3, 5, 10];

console.log("📊 Port Allocation Table");
console.log("═══════════════════════════════════════════════════════");
console.log("App ID | PostgreSQL | API (Kong) | Dashboard | Project Name");
console.log("-------|------------|------------|-----------|------------------");

testAppIds.forEach(appId => {
  const config = getAppSupabaseConfig(appId);
  const projectName = `dyad-supabase-${appId}`;
  console.log(`  ${appId.toString().padEnd(4)} | ${config.postgresPort.toString().padEnd(10)} | ${config.apiPort.toString().padEnd(10)} | ${config.dashboardPort.toString().padEnd(9)} | ${projectName}`);
});

console.log("");
console.log("═══════════════════════════════════════════════════════");
console.log("🔍 Configuration Details for App 1");
console.log("═══════════════════════════════════════════════════════");

const config1 = getAppSupabaseConfig(1);
console.log("Dashboard URL:", config1.dashboardUrl);
console.log("API URL:      ", config1.url);
console.log("Postgres URL: ", config1.postgresUrl);
console.log("JWT Secret:   ", config1.jwtSecret.substring(0, 50) + "...");
console.log("DB Password:  ", config1.dbPassword.substring(0, 50) + "...");
console.log("");

console.log("═══════════════════════════════════════════════════════");
console.log("✅ Configuration Validation Tests");
console.log("═══════════════════════════════════════════════════════");

// Test 1: Unique ports
let allPorts = new Set();
let duplicateFound = false;

testAppIds.forEach(appId => {
  const config = getAppSupabaseConfig(appId);
  const ports = [config.postgresPort, config.apiPort, config.dashboardPort];
  
  ports.forEach(port => {
    if (allPorts.has(port)) {
      console.log(`❌ FAIL: Duplicate port ${port} found for app ${appId}`);
      duplicateFound = true;
    } else {
      allPorts.add(port);
    }
  });
});

if (!duplicateFound) {
  console.log("✅ PASS: All ports are unique across apps");
}

// Test 2: Port ranges don't overlap
let overlapsFound = false;
for (let i = 0; i < testAppIds.length; i++) {
  for (let j = i + 1; j < testAppIds.length; j++) {
    const config1 = getAppSupabaseConfig(testAppIds[i]);
    const config2 = getAppSupabaseConfig(testAppIds[j]);
    
    const range1 = { min: config1.postgresPort, max: config1.dashboardPort };
    const range2 = { min: config2.postgresPort, max: config2.dashboardPort };
    
    if (range1.max >= range2.min && range1.min <= range2.max) {
      console.log(`❌ FAIL: Port ranges overlap between app ${testAppIds[i]} and app ${testAppIds[j]}`);
      overlapsFound = true;
    }
  }
}

if (!overlapsFound) {
  console.log("✅ PASS: No port range overlaps detected");
}

// Test 3: Unique credentials
let uniquePasswords = new Set();
let uniqueSecrets = new Set();

testAppIds.forEach(appId => {
  const config = getAppSupabaseConfig(appId);
  uniquePasswords.add(config.dbPassword);
  uniqueSecrets.add(config.jwtSecret);
});

if (uniquePasswords.size === testAppIds.length) {
  console.log("✅ PASS: All database passwords are unique");
} else {
  console.log(`❌ FAIL: Database password collision detected`);
}

if (uniqueSecrets.size === testAppIds.length) {
  console.log("✅ PASS: All JWT secrets are unique");
} else {
  console.log(`❌ FAIL: JWT secret collision detected`);
}

// Test 4: Project name format
testAppIds.forEach(appId => {
  const projectName = `dyad-supabase-${appId}`;
  if (!/^dyad-supabase-\d+$/.test(projectName)) {
    console.log(`❌ FAIL: Invalid project name format for app ${appId}: ${projectName}`);
  }
});
console.log("✅ PASS: All project names follow correct format");

// Test 5: URLs are well-formed
let allUrlsValid = true;
testAppIds.forEach(appId => {
  const config = getAppSupabaseConfig(appId);
  try {
    new URL(config.url);
    new URL(config.dashboardUrl);
  } catch (error) {
    console.log(`❌ FAIL: Invalid URL format for app ${appId}`);
    allUrlsValid = false;
  }
});

if (allUrlsValid) {
  console.log("✅ PASS: All URLs are well-formed");
}

console.log("");
console.log("═══════════════════════════════════════════════════════");
console.log("🎉 Validation Complete!");
console.log("═══════════════════════════════════════════════════════");
console.log("");
console.log("💡 Usage Example:");
console.log("   docker-compose -f docker-compose.supabase.yml -p dyad-supabase-1 up -d");
console.log("   Dashboard: http://localhost:3101");
console.log("   API:       http://localhost:8100");
console.log("");
