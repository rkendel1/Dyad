#!/usr/bin/env node

/**
 * Test script for start-dyad.js
 *
 * This script tests the interactive launcher by simulating user input
 */

const { spawn } = require("child_process");
const path = require("path");

function testOption(option, optionName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing option ${option}: ${optionName}`);
    console.log("─".repeat(50));

    const scriptPath = path.join(__dirname, "start-dyad.js");
    const proc = spawn("node", [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: path.join(__dirname, ".."),
    });

    let output = "";
    let errorOutput = "";

    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    proc.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    // Send the option after a short delay
    setTimeout(() => {
      proc.stdin.write(`${option}\n`);

      // Kill the process after 1 second to avoid actually starting apps
      setTimeout(() => {
        proc.kill("SIGTERM");
      }, 1000);
    }, 500);

    proc.on("close", (code) => {
      const success = output.includes("🚀 Dyad Launcher");

      if (success) {
        console.log("✅ Header displayed correctly");
      } else {
        console.log("❌ Header not found in output");
      }

      if (option === "1" && output.includes("Desktop App")) {
        console.log("✅ Desktop App option recognized");
      } else if (option === "2" && output.includes("Web App")) {
        console.log("✅ Web App option recognized");
      } else if (option === "3" && output.includes("Both")) {
        console.log("✅ Both apps option recognized");
      } else if (option === "4") {
        if (output.includes("Invalid choice")) {
          console.log("✅ Invalid option correctly rejected");
        } else {
          console.log("❌ Invalid option not handled correctly");
        }
      }

      console.log(`Exit code: ${code}`);
      resolve();
    });

    proc.on("error", (error) => {
      console.error("❌ Process error:", error.message);
      reject(error);
    });
  });
}

async function runTests() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("     Testing Dyad Interactive Launcher Script");
  console.log("═══════════════════════════════════════════════════════\n");

  try {
    await testOption("1", "Desktop App");
    await testOption("2", "Web App");
    await testOption("3", "Both Apps");
    await testOption("4", "Invalid Option");

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("✅ All tests completed");
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

runTests();
