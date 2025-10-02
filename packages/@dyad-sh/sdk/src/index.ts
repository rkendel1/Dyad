/**
 * @dyad-sh/sdk
 * 
 * High-level SDK for Dyad - AI App Builder
 * Provides a simplified API for third-party integrations
 */

import {
  createDyadClient,
  createHttpClient,
  createIpcClient,
  type DyadClient,
  type ClientConfig,
  type App,
  type Chat,
  type Message,
  type CreateAppParams,
  type CreateChatParams,
  type SendMessageParams,
  type AppSettings,
  type Cache,
  createCache,
  type CacheOptions,
} from "dyad-sh-core";

/**
 * SDK Configuration
 */
export interface DyadSDKConfig extends ClientConfig {
  /**
   * Client type to use
   */
  clientType?: "http" | "ipc" | "auto";
  
  /**
   * Enable caching
   */
  cache?: boolean | CacheOptions;
  
  /**
   * Auto-retry failed requests
   */
  autoRetry?: boolean;
  
  /**
   * Max retry attempts
   */
  maxRetries?: number;
}

/**
 * Dyad SDK
 * High-level interface for working with Dyad
 */
export class DyadSDK {
  private client: DyadClient;
  private cache?: Cache;
  private config: DyadSDKConfig;

  constructor(config: DyadSDKConfig = {}) {
    this.config = {
      clientType: config.clientType || "auto",
      cache: config.cache ?? false,
      autoRetry: config.autoRetry ?? true,
      maxRetries: config.maxRetries ?? 3,
      ...config,
    };

    // Initialize cache if enabled
    if (this.config.cache) {
      const cacheOptions = typeof this.config.cache === "object" 
        ? this.config.cache 
        : {};
      this.cache = createCache(cacheOptions);
    }

    // Create client based on type
    if (this.config.clientType === "http") {
      this.client = createHttpClient(config);
    } else if (this.config.clientType === "ipc") {
      this.client = createIpcClient(config);
    } else {
      // Auto-detect will be handled in connect()
      this.client = createHttpClient(config);
    }
  }

  /**
   * Connect to Dyad backend
   */
  async connect(): Promise<void> {
    if (this.config.clientType === "auto") {
      // Auto-detect and create appropriate client
      this.client = await createDyadClient("auto", this.config);
    } else {
      await this.client.connect();
    }
  }

  /**
   * Disconnect from Dyad backend
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Check connection health
   */
  async checkHealth() {
    return this.client.checkHealth();
  }

  /**
   * Apps API
   */
  get apps() {
    return {
      /**
       * List all apps
       */
      list: async () => {
        const cacheKey = "apps:list";
        if (this.cache) {
          const cached = await this.cache.get<App[]>(cacheKey);
          if (cached) return cached;
        }

        const apps = await this.client.apps.listApps();
        
        if (this.cache) {
          await this.cache.set(cacheKey, apps);
        }

        return apps;
      },

      /**
       * Get a specific app
       */
      get: async (appId: number) => {
        const cacheKey = `apps:${appId}`;
        if (this.cache) {
          const cached = await this.cache.get<App>(cacheKey);
          if (cached) return cached;
        }

        const app = await this.client.apps.getApp(appId);
        
        if (this.cache) {
          await this.cache.set(cacheKey, app);
        }

        return app;
      },

      /**
       * Create a new app
       */
      create: async (params: CreateAppParams) => {
        const result = await this.client.apps.createApp(params);
        
        // Invalidate cache
        if (this.cache) {
          await this.cache.delete("apps:list");
        }

        return result;
      },

      /**
       * Delete an app
       */
      delete: async (appId: number) => {
        await this.client.apps.deleteApp(appId);
        
        // Invalidate cache
        if (this.cache) {
          await this.cache.delete("apps:list");
          await this.cache.delete(`apps:${appId}`);
        }
      },

      /**
       * Get app settings
       */
      getSettings: async (appId: number) => {
        return this.client.apps.getAppSettings(appId);
      },

      /**
       * Update app settings
       */
      updateSettings: async (appId: number, settings: AppSettings) => {
        return this.client.apps.updateAppSettings(appId, settings);
      },
    };
  }

  /**
   * Chats API
   */
  get chats() {
    return {
      /**
       * List chats for an app
       */
      list: async (appId: number) => {
        const cacheKey = `chats:${appId}:list`;
        if (this.cache) {
          const cached = await this.cache.get<Chat[]>(cacheKey);
          if (cached) return cached;
        }

        const chats = await this.client.chats.listChats(appId);
        
        if (this.cache) {
          await this.cache.set(cacheKey, chats);
        }

        return chats;
      },

      /**
       * Get a specific chat
       */
      get: async (chatId: number) => {
        const cacheKey = `chats:${chatId}`;
        if (this.cache) {
          const cached = await this.cache.get<Chat>(cacheKey);
          if (cached) return cached;
        }

        const chat = await this.client.chats.getChat(chatId);
        
        if (this.cache) {
          await this.cache.set(cacheKey, chat);
        }

        return chat;
      },

      /**
       * Create a new chat
       */
      create: async (params: CreateChatParams) => {
        const chat = await this.client.chats.createChat(params);
        
        // Invalidate cache
        if (this.cache) {
          await this.cache.delete(`chats:${params.appId}:list`);
        }

        return chat;
      },

      /**
       * Delete a chat
       */
      delete: async (chatId: number) => {
        await this.client.chats.deleteChat(chatId);
        
        // Invalidate cache
        if (this.cache) {
          await this.cache.delete(`chats:${chatId}`);
        }
      },

      /**
       * Get messages for a chat
       */
      getMessages: async (chatId: number) => {
        const cacheKey = `chats:${chatId}:messages`;
        if (this.cache) {
          const cached = await this.cache.get<Message[]>(cacheKey);
          if (cached) return cached;
        }

        const messages = await this.client.chats.getChatMessages(chatId);
        
        if (this.cache) {
          await this.cache.set(cacheKey, messages, 30000); // Cache for 30s
        }

        return messages;
      },

      /**
       * Send a message
       */
      sendMessage: async (params: SendMessageParams) => {
        const message = await this.client.chats.sendMessage(params);
        
        // Invalidate cache
        if (this.cache) {
          await this.cache.delete(`chats:${params.chatId}:messages`);
        }

        return message;
      },
    };
  }

  /**
   * Settings API
   */
  get settings() {
    return {
      /**
       * Get settings
       */
      get: async () => {
        return this.client.settings.getSettings();
      },

      /**
       * Update settings
       */
      update: async (settings: Record<string, any>) => {
        return this.client.settings.updateSettings(settings);
      },
    };
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    if (this.cache) {
      await this.cache.clear();
    }
  }

  /**
   * Get the underlying client
   */
  getClient(): DyadClient {
    return this.client;
  }
}

/**
 * Create a Dyad SDK instance
 */
export function createDyadSDK(config: DyadSDKConfig = {}): DyadSDK {
  return new DyadSDK(config);
}

// Re-export types from core for convenience
export type {
  DyadClient,
  ClientConfig,
  App,
  Chat,
  Message,
  CreateAppParams,
  CreateChatParams,
  SendMessageParams,
  AppSettings,
} from "dyad-sh-core";
