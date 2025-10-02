#!/usr/bin/env node

/**
 * Dyad CLI
 * 
 * Command-line interface for Dyad - AI App Builder
 */

import { createHttpClient, type DyadClient } from "@dyad-sh/core";

/**
 * CLI Configuration
 */
interface CliConfig {
  baseUrl: string;
  apiKey?: string;
}

/**
 * Load CLI configuration from environment or defaults
 */
function loadConfig(): CliConfig {
  return {
    baseUrl: process.env.DYAD_API_URL || "http://localhost:3000",
    apiKey: process.env.DYAD_API_KEY,
  };
}

/**
 * Format date for display
 */
function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
Dyad CLI - AI App Builder

Usage:
  dyad <command> [options]

Commands:
  apps list              List all applications
  apps get <appId>       Get details of a specific app
  apps delete <appId>    Delete an application
  
  chats list <appId>     List all chats for an app
  chats get <chatId>     Get details of a specific chat
  chats create <appId>   Create a new chat for an app
  chats delete <chatId>  Delete a chat
  
  messages <chatId>      List messages in a chat
  send <chatId> <text>   Send a message to a chat
  
  health                 Check backend health
  help                   Show this help message

Environment Variables:
  DYAD_API_URL          Backend API URL (default: http://localhost:3000)
  DYAD_API_KEY          API key for authentication (optional)

Examples:
  dyad apps list
  dyad chats create 1
  dyad send 5 "Hello, how can I help?"
`);
}

/**
 * Handle errors and display user-friendly messages
 */
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error("An unexpected error occurred");
  }
  process.exit(1);
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "help") {
    showHelp();
    return;
  }

  const config = loadConfig();
  const client = createHttpClient(config);

  try {
    const command = args[0];
    const subcommand = args[1];

    switch (command) {
      case "health": {
        const health = await client.checkHealth();
        console.log("Backend Status:", health.status);
        if (health.version) {
          console.log("Version:", health.version);
        }
        if (health.uptime) {
          console.log("Uptime:", `${Math.floor(health.uptime / 1000)}s`);
        }
        break;
      }

      case "apps": {
        switch (subcommand) {
          case "list": {
            const apps = await client.apps.listApps();
            console.log(`\nFound ${apps.length} app(s):\n`);
            apps.forEach((app) => {
              console.log(`  [${app.id}] ${app.name}`);
              console.log(`      Path: ${app.path}`);
              console.log(`      Created: ${formatDate(app.createdAt)}`);
              console.log();
            });
            break;
          }

          case "get": {
            const appId = parseInt(args[2]);
            if (isNaN(appId)) {
              throw new Error("Invalid app ID");
            }
            const app = await client.apps.getApp(appId);
            console.log(`\nApp Details:\n`);
            console.log(`  ID: ${app.id}`);
            console.log(`  Name: ${app.name}`);
            console.log(`  Path: ${app.path}`);
            console.log(`  Created: ${formatDate(app.createdAt)}`);
            console.log(`  Updated: ${formatDate(app.updatedAt)}`);
            if (app.preferredPackageManager) {
              console.log(`  Package Manager: ${app.preferredPackageManager}`);
            }
            if (app.previewUrl) {
              console.log(`  Preview URL: ${app.previewUrl}`);
            }
            console.log();
            break;
          }

          case "delete": {
            const appId = parseInt(args[2]);
            if (isNaN(appId)) {
              throw new Error("Invalid app ID");
            }
            await client.apps.deleteApp(appId);
            console.log(`App ${appId} deleted successfully`);
            break;
          }

          default:
            console.error(`Unknown apps subcommand: ${subcommand}`);
            showHelp();
            process.exit(1);
        }
        break;
      }

      case "chats": {
        switch (subcommand) {
          case "list": {
            const appId = parseInt(args[2]);
            if (isNaN(appId)) {
              throw new Error("Invalid app ID");
            }
            const chats = await client.chats.listChats(appId);
            console.log(`\nFound ${chats.length} chat(s) for app ${appId}:\n`);
            chats.forEach((chat) => {
              console.log(`  [${chat.id}] ${chat.title}`);
              console.log(`      Messages: ${chat.messages.length}`);
              console.log();
            });
            break;
          }

          case "get": {
            const chatId = parseInt(args[2]);
            if (isNaN(chatId)) {
              throw new Error("Invalid chat ID");
            }
            const chat = await client.chats.getChat(chatId);
            console.log(`\nChat Details:\n`);
            console.log(`  ID: ${chat.id}`);
            console.log(`  Title: ${chat.title}`);
            console.log(`  Messages: ${chat.messages.length}`);
            console.log();
            break;
          }

          case "create": {
            const appId = parseInt(args[2]);
            if (isNaN(appId)) {
              throw new Error("Invalid app ID");
            }
            const chat = await client.chats.createChat({ appId });
            console.log(`Chat created successfully: ${chat.id}`);
            break;
          }

          case "delete": {
            const chatId = parseInt(args[2]);
            if (isNaN(chatId)) {
              throw new Error("Invalid chat ID");
            }
            await client.chats.deleteChat(chatId);
            console.log(`Chat ${chatId} deleted successfully`);
            break;
          }

          default:
            console.error(`Unknown chats subcommand: ${subcommand}`);
            showHelp();
            process.exit(1);
        }
        break;
      }

      case "messages": {
        const chatId = parseInt(args[1]);
        if (isNaN(chatId)) {
          throw new Error("Invalid chat ID");
        }
        const messages = await client.chats.getChatMessages(chatId);
        console.log(`\nMessages in chat ${chatId}:\n`);
        messages.forEach((msg) => {
          console.log(`  [${msg.role}] ${formatDate(msg.createdAt)}`);
          console.log(`  ${msg.content.substring(0, 100)}...`);
          console.log();
        });
        break;
      }

      case "send": {
        const chatId = parseInt(args[1]);
        if (isNaN(chatId)) {
          throw new Error("Invalid chat ID");
        }
        const content = args.slice(2).join(" ");
        if (!content) {
          throw new Error("Message content is required");
        }
        const message = await client.chats.sendMessage({ chatId, content });
        console.log(`Message sent successfully: ${message.id}`);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    handleError(error);
  }
}

// Run the CLI
main().catch(handleError);
