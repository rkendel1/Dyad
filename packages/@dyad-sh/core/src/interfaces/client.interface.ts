/**
 * Dyad Client Interface
 * 
 * Abstract interface for all Dyad client implementations.
 * This interface defines the contract that all clients (IPC, HTTP, CLI) must implement.
 */

import type {
  App,
  Chat,
  Message,
  ApiResponse,
  CreateAppParams,
  CreateAppResult,
  ListAppsResponse,
  CreateChatParams,
  SendMessageParams,
  HealthResponse,
  AppSettings,
} from "../types";

/**
 * App API interface
 * Methods for managing applications
 */
export interface AppApi {
  /**
   * List all applications
   */
  listApps(): Promise<App[]>;

  /**
   * Get a specific application by ID
   */
  getApp(appId: number): Promise<App>;

  /**
   * Create a new application
   */
  createApp(params: CreateAppParams): Promise<CreateAppResult>;

  /**
   * Delete an application
   */
  deleteApp(appId: number): Promise<void>;

  /**
   * Get application settings
   */
  getAppSettings(appId: number): Promise<AppSettings>;

  /**
   * Update application settings
   */
  updateAppSettings(appId: number, settings: AppSettings): Promise<AppSettings>;

  /**
   * Update application path
   */
  updateAppPath(appId: number, path: string): Promise<App>;
}

/**
 * Chat API interface
 * Methods for managing chats and messages
 */
export interface ChatApi {
  /**
   * List all chats for an application
   */
  listChats(appId: number): Promise<Chat[]>;

  /**
   * Get a specific chat by ID
   */
  getChat(chatId: number): Promise<Chat>;

  /**
   * Create a new chat
   */
  createChat(params: CreateChatParams): Promise<Chat>;

  /**
   * Delete a chat
   */
  deleteChat(chatId: number): Promise<void>;

  /**
   * Get messages for a chat
   */
  getChatMessages(chatId: number): Promise<Message[]>;

  /**
   * Send a message to a chat
   */
  sendMessage(params: SendMessageParams): Promise<Message>;
}

/**
 * Settings API interface
 * Methods for managing user settings
 */
export interface SettingsApi {
  /**
   * Get user settings
   */
  getSettings(): Promise<Record<string, any>>;

  /**
   * Update user settings
   */
  updateSettings(settings: Record<string, any>): Promise<Record<string, any>>;
}

/**
 * Main Dyad Client interface
 * Provides access to all API modules
 */
export interface DyadClient {
  /**
   * App management API
   */
  apps: AppApi;

  /**
   * Chat management API
   */
  chats: ChatApi;

  /**
   * Settings management API
   */
  settings: SettingsApi;

  /**
   * Health check
   */
  checkHealth(): Promise<HealthResponse>;

  /**
   * Connect to the backend
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the backend
   */
  disconnect(): Promise<void>;
}

/**
 * Client configuration
 */
export interface ClientConfig {
  /**
   * Base URL for HTTP clients
   */
  baseUrl?: string;

  /**
   * Timeout in milliseconds
   */
  timeout?: number;

  /**
   * API key for authentication
   */
  apiKey?: string;

  /**
   * Custom headers
   */
  headers?: Record<string, string>;
}
