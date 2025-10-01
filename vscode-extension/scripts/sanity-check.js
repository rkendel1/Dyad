#!/usr/bin/env node

/**
 * Basic sanity check for the extension
 * Verifies that the compiled code can be loaded and basic structure is correct
 */

const fs = require("fs");
const path = require("path");

console.log("Running extension sanity checks...\n");

let hasErrors = false;

// Check 1: Compiled files exist
console.log("✓ Checking compiled files...");
const requiredFiles = [
  "out/extension.js",
  "out/dyadCli.js",
  "out/dyadApi.js",
  "out/views/sidebar.js",
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, "..", file);
  if (!fs.existsSync(filePath)) {
    console.error(`  ✗ Missing file: ${file}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Found: ${file}`);
  }
}

// Check 2: Package.json is valid
console.log("\n✓ Checking package.json...");
try {
  const packageJson = require("../package.json");

  // Check required fields
  const requiredFields = [
    "name",
    "version",
    "engines",
    "activationEvents",
    "main",
    "contributes",
  ];
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      console.error(`  ✗ Missing required field: ${field}`);
      hasErrors = true;
    } else {
      console.log(`  ✓ Has ${field}`);
    }
  }

  // Check commands
  if (packageJson.contributes.commands) {
    console.log(
      `  ✓ Commands registered: ${packageJson.contributes.commands.length}`,
    );
  }

  // Check views
  if (packageJson.contributes.views) {
    console.log(`  ✓ Views registered`);
  }
} catch (error) {
  console.error(`  ✗ Error reading package.json: ${error.message}`);
  hasErrors = true;
}

// Check 3: Extension can be loaded
console.log("\n✓ Checking extension module...");
try {
  // Note: We can't fully load the extension because it depends on the vscode module
  // which is only available at runtime. We'll just check that the file exists and is valid JS.
  const extensionPath = path.join(__dirname, "..", "out/extension.js");
  const extensionCode = fs.readFileSync(extensionPath, "utf8");

  // Check for key exports
  if (!extensionCode.includes("activate")) {
    console.error("  ✗ activate function not found in code");
    hasErrors = true;
  } else {
    console.log("  ✓ activate() function found");
  }

  if (!extensionCode.includes("deactivate")) {
    console.error("  ✗ deactivate function not found in code");
    hasErrors = true;
  } else {
    console.log("  ✓ deactivate() function found");
  }

  // Check for new features we added
  if (!extensionCode.includes("checkHealth")) {
    console.error("  ✗ checkHealth command not found");
    hasErrors = true;
  } else {
    console.log("  ✓ checkHealth command found");
  }

  if (!extensionCode.includes("outputChannel")) {
    console.error("  ✗ outputChannel not found");
    hasErrors = true;
  } else {
    console.log("  ✓ outputChannel logging found");
  }
} catch (error) {
  console.error(`  ✗ Error checking extension: ${error.message}`);
  hasErrors = true;
}

// Check 4: DyadCli module
console.log("\n✓ Checking DyadCli module...");
try {
  const dyadCli = require("../out/dyadCli.js");
  if (!dyadCli.DyadCli) {
    console.error("  ✗ DyadCli class not exported");
    hasErrors = true;
  } else {
    console.log("  ✓ DyadCli class found");

    // Check for key methods
    const cli = new dyadCli.DyadCli();
    const methods = ["checkCliAvailability", "createApp", "runApp", "stopApp"];
    for (const method of methods) {
      if (typeof cli[method] !== "function") {
        console.error(`  ✗ Method ${method}() not found`);
        hasErrors = true;
      } else {
        console.log(`  ✓ Method ${method}() found`);
      }
    }
  }
} catch (error) {
  console.error(`  ✗ Error loading DyadCli: ${error.message}`);
  hasErrors = true;
}

// Check 5: DyadApi module
console.log("\n✓ Checking DyadApi module...");
try {
  const dyadApi = require("../out/dyadApi.js");
  if (!dyadApi.DyadApi) {
    console.error("  ✗ DyadApi class not exported");
    hasErrors = true;
  } else {
    console.log("  ✓ DyadApi class found");

    // Check for key methods
    const api = new dyadApi.DyadApi();
    const methods = [
      "checkHealth",
      "getApps",
      "createApp",
      "runApp",
      "stopApp",
    ];
    for (const method of methods) {
      if (typeof api[method] !== "function") {
        console.error(`  ✗ Method ${method}() not found`);
        hasErrors = true;
      } else {
        console.log(`  ✓ Method ${method}() found`);
      }
    }
  }
} catch (error) {
  console.error(`  ✗ Error loading DyadApi: ${error.message}`);
  hasErrors = true;
}

// Summary
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.error("✗ Sanity checks FAILED");
  process.exit(1);
} else {
  console.log("✓ All sanity checks PASSED");
  console.log(
    "\nThe extension appears to be correctly built and ready for testing.",
  );
  process.exit(0);
}
