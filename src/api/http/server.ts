/**
 * HTTP REST API Server
 *
 * Express server for HTTP API alongside existing IPC mechanism
 */

import express from "express";
import cors from "cors";
import type { Server } from "http";
import log from "electron-log";

// Routes
import healthRoutes from "./routes/health.routes";
import appRoutes from "./routes/app.routes";
import chatRoutes, {
  listChatsForApp,
  createChatForApp,
} from "./routes/chat.routes";

// Middleware
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { optionalAuth } from "./middleware/auth";

const logger = log.scope("http-server");

/**
 * HTTP Server Configuration
 */
export interface HttpServerConfig {
  enabled: boolean;
  port: number;
  host: string;
  cors: {
    enabled: boolean;
    origins: string[];
  };
}

/**
 * Default server configuration
 */
const DEFAULT_CONFIG: HttpServerConfig = {
  enabled: true,
  port: parseInt(process.env.DYAD_API_PORT || "3000", 10), // Configurable via env var
  host: "localhost",
  cors: {
    enabled: true,
    origins: ["http://localhost:*", "http://127.0.0.1:*"],
  },
};

/**
 * HTTP API Server class
 */
export class HttpApiServer {
  private app: express.Application;
  private server: Server | null = null;
  private config: HttpServerConfig;

  constructor(config: Partial<HttpServerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // CORS
    if (this.config.cors.enabled) {
      this.app.use(
        cors({
          origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl requests, or file:// protocol)
            if (!origin) {
              return callback(null, true);
            }

            // Check if origin matches allowed patterns
            const allowed = this.config.cors.origins.some((pattern) => {
              if (pattern.includes("*")) {
                const regex = new RegExp(
                  "^" + pattern.replace(/\*/g, ".*") + "$",
                );
                return regex.test(origin);
              }
              return pattern === origin;
            });

            if (allowed) {
              callback(null, true);
            } else {
              logger.warn(`CORS: Origin ${origin} not allowed`);
              callback(new Error("Not allowed by CORS"));
            }
          },
          credentials: true,
        }),
      );
    }

    // Body parsing
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    // Optional authentication (can be enabled per route)
    this.app.use(optionalAuth);

    // Request logging
    this.app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check routes (no /api prefix for quick access)
    this.app.use("/", healthRoutes);

    // API routes with /api prefix
    const apiRouter = express.Router();

    // Mount route modules
    apiRouter.use("/apps", appRoutes);
    apiRouter.use("/chats", chatRoutes);

    // App-specific chat routes
    apiRouter.get("/apps/:appId/chats", listChatsForApp);
    apiRouter.post("/apps/:appId/chats", createChatForApp);

    // Mount API router
    this.app.use("/api", apiRouter);

    // Also mount health routes at /api for consistency
    this.app.use("/api", healthRoutes);
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      logger.info("HTTP API server is disabled");
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(
          this.config.port,
          this.config.host,
          () => {
            logger.info(
              `HTTP API server listening on http://${this.config.host}:${this.config.port}`,
            );
            logger.info(
              `API endpoints available at http://${this.config.host}:${this.config.port}/api`,
            );
            resolve();
          },
        );

        this.server.on("error", (error: NodeJS.ErrnoException) => {
          if (error.code === "EADDRINUSE") {
            logger.error(`Port ${this.config.port} is already in use`);
          } else {
            logger.error("Server error:", error);
          }
          reject(error);
        });
      } catch (error) {
        logger.error("Failed to start HTTP server:", error);
        reject(error);
      }
    });
  }

  /**
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.server!.close((error) => {
        if (error) {
          logger.error("Error stopping HTTP server:", error);
          reject(error);
        } else {
          logger.info("HTTP API server stopped");
          this.server = null;
          resolve();
        }
      });
    });
  }

  /**
   * Get the Express app instance (for testing)
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.server !== null;
  }
}

// Export singleton instance
let serverInstance: HttpApiServer | null = null;

/**
 * Get or create the HTTP API server instance
 */
export function getHttpApiServer(
  config?: Partial<HttpServerConfig>,
): HttpApiServer {
  if (!serverInstance) {
    serverInstance = new HttpApiServer(config);
  }
  return serverInstance;
}

/**
 * Start the HTTP API server
 */
export async function startHttpApiServer(
  config?: Partial<HttpServerConfig>,
): Promise<HttpApiServer> {
  const server = getHttpApiServer(config);
  await server.start();
  return server;
}

/**
 * Stop the HTTP API server
 */
export async function stopHttpApiServer(): Promise<void> {
  if (serverInstance) {
    await serverInstance.stop();
    serverInstance = null;
  }
}