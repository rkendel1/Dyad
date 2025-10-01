#!/usr/bin/env node

/**
 * HTTP API Integration Test Script
 *
 * Tests the Dyad HTTP API endpoints to verify functionality
 */

const BASE_URL = "http://localhost:3000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`→ ${message}`, colors.blue);
}

async function testEndpoint(name, url, options = {}) {
  try {
    logInfo(`Testing ${name}...`);
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();

    if (!response.ok) {
      logError(`${name} failed with status ${response.status}`);
      console.log("Response:", data);
      return null;
    }

    logSuccess(`${name} passed`);
    return data;
  } catch (error) {
    logError(`${name} failed: ${error.message}`);
    return null;
  }
}

async function runTests() {
  log("\n=== Dyad HTTP API Integration Tests ===\n", colors.yellow);

  // Test 1: Health Check
  log("\n1. Health & Status Endpoints", colors.yellow);
  const health = await testEndpoint("GET /api/health", "/api/health");
  if (health?.data) {
    console.log(`   Status: ${health.data.status}`);
    console.log(`   Version: ${health.data.version}`);
    console.log(`   Uptime: ${health.data.uptime}s`);
  }

  await testEndpoint("GET /api/version", "/api/version");
  await testEndpoint("GET /api/status", "/api/status");

  // Test 2: Applications
  log("\n2. Application Endpoints", colors.yellow);
  const appsResult = await testEndpoint("GET /api/apps", "/api/apps");

  if (appsResult?.data?.apps?.length > 0) {
    const app = appsResult.data.apps[0];
    console.log(`   Found ${appsResult.data.apps.length} app(s)`);
    console.log(`   First app: ${app.name} (ID: ${app.id})`);

    // Test getting specific app
    await testEndpoint(`GET /api/apps/${app.id}`, `/api/apps/${app.id}`);

    // Test getting app settings
    await testEndpoint(
      `GET /api/apps/${app.id}/settings`,
      `/api/apps/${app.id}/settings`,
    );

    // Test 3: Chats
    log("\n3. Chat Endpoints", colors.yellow);

    // List chats
    const chatsResult = await testEndpoint(
      `GET /api/apps/${app.id}/chats`,
      `/api/apps/${app.id}/chats`,
    );

    // Create a new chat
    const newChat = await testEndpoint(
      `POST /api/apps/${app.id}/chats`,
      `/api/apps/${app.id}/chats`,
      { method: "POST", headers: { "Content-Type": "application/json" } },
    );

    if (newChat?.data) {
      const chatId = newChat.data.id;
      console.log(`   Created chat with ID: ${chatId}`);

      // Get chat details
      await testEndpoint(`GET /api/chats/${chatId}`, `/api/chats/${chatId}`);

      // Update chat title
      await testEndpoint(`PUT /api/chats/${chatId}`, `/api/chats/${chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test Chat from API" }),
      });

      // Test 4: Messages
      log("\n4. Message Endpoints", colors.yellow);

      // Create a message
      const newMessage = await testEndpoint(
        `POST /api/chats/${chatId}/messages`,
        `/api/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Hello from the integration test!",
            role: "user",
          }),
        },
      );

      if (newMessage?.data) {
        console.log(`   Created message: "${newMessage.data.content}"`);
      }

      // List messages
      await testEndpoint(
        `GET /api/chats/${chatId}/messages`,
        `/api/chats/${chatId}/messages`,
      );

      // Clean up: delete the test chat
      await testEndpoint(
        `DELETE /api/chats/${chatId}`,
        `/api/chats/${chatId}`,
        { method: "DELETE" },
      );
    }
  } else {
    log(
      "   No apps found. Create an app in Dyad Desktop first.",
      colors.yellow,
    );
  }

  // Test 5: Error Handling
  log("\n5. Error Handling", colors.yellow);
  const notFound = await testEndpoint(
    "GET /api/nonexistent",
    "/api/nonexistent",
  );
  if (notFound?.success === false) {
    logSuccess("404 error handling works correctly");
  }

  const invalidId = await testEndpoint(
    "GET /api/apps/999999",
    "/api/apps/999999",
  );
  if (invalidId?.success === false) {
    logSuccess("Invalid ID error handling works correctly");
  }

  log("\n=== Tests Complete ===\n", colors.yellow);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === "undefined") {
  console.error(
    "This script requires Node.js 18 or higher for native fetch support.",
  );
  console.error("Or run: npm install node-fetch");
  process.exit(1);
}

// Run tests
runTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});
