#!/usr/bin/env node

/**
 * Dyad Interactive Startup Script
 *
 * Prompts the user to select which components to start:
 * - Desktop app
 * - Web app
 * - Both
 */

const { spawn } = require("child_process");
const readline = require("readline");
const path = require("path");
// Add this for browser launching (install with: npm install open)
const open = require("open");

// ANSI color codes for better UX
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function print(message, color = "") {
  console.log(`${color}${message}${colors.reset}`);
}

function printHeader() {
  console.log("");
  print("════════════════════════════════════════════════════════════════════════", colors.cyan);
  print(
    "                    🚀 Dyad Launcher                   ",
    colors.bright + colors.cyan,
  );
  print("════════════════════════════════════════════════════════════════════════", colors.cyan);
  console.log("");
}

function printOptions() {
  print("Please select what you would like to start:", colors.bright);
  console.log("");
  print("  1. Desktop App (Electron)", colors.green);
  print("     → Full-featured desktop application", colors.reset);
  console.log("");
  print("  2. Web App (Next.js)", colors.blue);
  print("     → Browser-based interface on port 5175", colors.reset);
  console.log("");
  print("  3. Both Desktop and Web App", colors.yellow);
  print("     → Run both interfaces simultaneously", colors.reset);
  console.log("");
}

function startDesktopApp() {
  print("Starting Desktop App...", colors.green);
  const desktopProcess = spawn("npm", ["start"], {
    stdio: "inherit",
    shell: true,
    cwd: path.join(__dirname, ".."),
  });

  desktopProcess.on("error", (error) => {
    console.error("Failed to start Desktop App:", error.message);
  });

  return desktopProcess;
}

function startWebApp({ launchBrowser = false } = {}) {
  print("Starting Web App...", colors.blue);
  const webProcess = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
    cwd: path.join(__dirname, "..", "web-app"),
  });

  webProcess.on("error", (error) => {
    console.error("Failed to start Web App:", error.message);
  });

  if (launchBrowser) {
    // Wait for the dev server to start, then open Chrome
    setTimeout(() => {
      open("http://localhost:5175", { app: { name: open.apps.chrome } });
    }, 6000); // Adjust delay if your dev server is slower/faster
  }

  return webProcess;
}

async function promptUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter your choice (1, 2, or 3): ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  printHeader();
  printOptions();

  const choice = await promptUser();
  console.log("");

  const processes = [];

  switch (choice) {
    case "1":
      print(
        "════════════════════════════════════════════════════════════════════════",
        colors.cyan,
      );
      print("Starting Desktop App...", colors.bright + colors.green);
      print(
        "════════════════════════════════════════════════════════════════════════",
        colors.cyan,
      );
      console.log("");
      processes.push(startDesktopApp());
      break;

    case "2":
      print(
        "════════════════════════════════════════════════════════════════════════",
        colors.cyan,
      );
      print("Starting Web App...", colors.bright + colors.blue);
      print(
        "════════════════════════════════════════════════════════════════════════",
        colors.cyan,
      );
      console.log("");
      print("Web app will be available at: http://localhost:5175", colors.blue);
      print(
        "Make sure the Dyad Desktop app is running for the API backend.",
        colors.yellow,
      );
      console.log("");
      processes.push(startWebApp({ launchBrowser: true }));
      break;

    case "3":
      print(
        "════════════════════════════════════════════════════════════════════════",
        colors.cyan,
      );
      print("Starting Both Apps...", colors.bright + colors.yellow);
      print(
        "════════════════════════════════════════════════════════════════════════",
        colors.cyan,
      );
      console.log("");
      print("Desktop app starting...", colors.green);
      print("Web app will be available at: http://localhost:5175", colors.blue);
      console.log("");
      processes.push(startDesktopApp());
      setTimeout(() => {
        processes.push(startWebApp({ launchBrowser: true }));
      }, 2000);
      break;

    default:
      print(
        "Invalid choice. Please run the script again and select 1, 2, or 3.",
        colors.yellow,
      );
      process.exit(1);
  }

  // Handle graceful shutdown
  const cleanup = () => {
    print("\nShutting down...", colors.yellow);
    processes.forEach((proc) => {
      if (proc && !proc.killed) {
        proc.kill("SIGTERM");
      }
    });
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

// Run the script
main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
