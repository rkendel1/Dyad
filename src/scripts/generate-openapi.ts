#!/usr/bin/env ts-node
/**
 * Generate OpenAPI Specification
 *
 * This script generates the OpenAPI specification and saves it to a JSON file.
 * Run this script before building or deploying.
 */

import { saveOpenApiSpec } from "../api/docs/openapi-spec";
import * as path from "path";

const outputPath = path.join(__dirname, "../../openapi.json");

async function main() {
  console.log("Generating OpenAPI specification...");

  try {
    await saveOpenApiSpec(outputPath);
    console.log(`✓ OpenAPI spec generated successfully: ${outputPath}`);
  } catch (error) {
    console.error("✗ Failed to generate OpenAPI spec:", error);
    process.exit(1);
  }
}

main();
