/**
 * OpenAPI Specification Generator
 *
 * This module generates OpenAPI 3.0 specification from the Dyad API.
 * The specification is automatically generated from JSDoc comments and
 * type definitions.
 */

import type { OpenAPIV3 } from "openapi-types";

/**
 * Base OpenAPI specification for Dyad API
 */
export const openApiSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Dyad API",
    version: "1.0.0",
    description: "API for Dyad - Local, open-source AI app builder",
    contact: {
      name: "Dyad Team",
      url: "https://dyad.sh",
    },
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  paths: {
    "/api/apps": {
      get: {
        summary: "List all applications",
        description: "Returns a list of all applications managed by Dyad",
        tags: ["Apps"],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ListAppsResponse",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError",
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new application",
        description: "Creates a new application with the specified parameters",
        tags: ["Apps"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateAppParams",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Application created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateAppResult",
                },
              },
            },
          },
          "400": {
            description: "Invalid request parameters",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError",
                },
              },
            },
          },
        },
      },
    },
    "/api/apps/{appId}": {
      get: {
        summary: "Get application by ID",
        description: "Returns details of a specific application",
        tags: ["Apps"],
        parameters: [
          {
            name: "appId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Application ID",
          },
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/App",
                },
              },
            },
          },
          "404": {
            description: "Application not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError",
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete an application",
        description: "Deletes the specified application",
        tags: ["Apps"],
        parameters: [
          {
            name: "appId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Application ID",
          },
        ],
        responses: {
          "204": {
            description: "Application deleted successfully",
          },
          "404": {
            description: "Application not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError",
                },
              },
            },
          },
        },
      },
    },
    "/api/chats": {
      post: {
        summary: "Create a new chat",
        description: "Creates a new chat for an application",
        tags: ["Chats"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  appId: {
                    type: "integer",
                    description: "Application ID",
                  },
                },
                required: ["appId"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Chat created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Chat",
                },
              },
            },
          },
        },
      },
    },
    "/api/chats/{chatId}": {
      get: {
        summary: "Get chat by ID",
        description: "Returns details of a specific chat including messages",
        tags: ["Chats"],
        parameters: [
          {
            name: "chatId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Chat ID",
          },
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Chat",
                },
              },
            },
          },
          "404": {
            description: "Chat not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiError",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      App: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          path: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "path"],
      },
      CreateAppParams: {
        type: "object",
        properties: {
          name: { type: "string", description: "Application name" },
          templateId: { type: "string", description: "Template ID (optional)" },
        },
        required: ["name"],
      },
      CreateAppResult: {
        type: "object",
        properties: {
          app: { $ref: "#/components/schemas/App" },
          chatId: { type: "integer" },
        },
      },
      ListAppsResponse: {
        type: "object",
        properties: {
          apps: {
            type: "array",
            items: { $ref: "#/components/schemas/App" },
          },
          appBasePath: { type: "string" },
        },
      },
      Chat: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          messages: {
            type: "array",
            items: { $ref: "#/components/schemas/Message" },
          },
        },
      },
      Message: {
        type: "object",
        properties: {
          id: { type: "integer" },
          role: { type: "string", enum: ["user", "assistant"] },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          details: { type: "object" },
        },
        required: ["code", "message"],
      },
    },
  },
  tags: [
    {
      name: "Apps",
      description: "Application management operations",
    },
    {
      name: "Chats",
      description: "Chat and messaging operations",
    },
  ],
};

/**
 * Generate OpenAPI spec as JSON
 */
export function generateOpenApiSpec(): string {
  return JSON.stringify(openApiSpec, null, 2);
}

/**
 * Save OpenAPI spec to file
 */
export async function saveOpenApiSpec(outputPath: string): Promise<void> {
  const fs = await import("fs/promises");
  const spec = generateOpenApiSpec();
  await fs.writeFile(outputPath, spec, "utf-8");
}
