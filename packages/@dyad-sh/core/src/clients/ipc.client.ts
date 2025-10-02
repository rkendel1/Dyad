/**
 * IPC Client Implementation
 * 
 * Implements the DyadClient interface using Electron IPC
 * This client is used in the Electron desktop application
 */

import type {
  DyadClient,
  AppApi,
  ChatApi,
  SettingsApi,
  ClientConfig,
} from "../interfaces/client.interface";
import type {
  App,
  Chat,
  Message,
  CreateAppParams,
  CreateAppResult,
  CreateChatParams,
  SendMessageParams,
  HealthResponse,
  AppSettings,
} from "../types";

/**
 * Type definitions for Electron IPC renderer
 */
interface IpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>;
  on(channel: string, listener: (...args: any[]) => void): void;
  removeAllListeners(channel: string): void;
}

/**
 * IPC App API implementation
 */
class IpcAppApi implements AppApi {
  constructor(private ipcRenderer: IpcRenderer) {}

  async listApps(): Promise<App[]> {
    const response = await this.ipcRenderer.invoke("list-apps");
    return response.apps || [];
  }

  async getApp(appId: number): Promise<App> {
    return this.ipcRenderer.invoke("get-app", appId);
  }

  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    return this.ipcRenderer.invoke("create-app", params);
  }

  async deleteApp(appId: number): Promise<void> {
    await this.ipcRenderer.invoke("delete-app", { appId });
  }

  async getAppSettings(appId: number): Promise<AppSettings> {
    return this.ipcRenderer.invoke("get-app-settings", { appId });
  }

  async updateAppSettings(
    appId: number,
    settings: AppSettings
  ): Promise<AppSettings> {
    return this.ipcRenderer.invoke("update-app-settings", {
      appId,
      settings,
    });
  }
}

/**
 * IPC Chat API implementation
 */
class IpcChatApi implements ChatApi {
  constructor(private ipcRenderer: IpcRenderer) {}

  async listChats(appId: number): Promise<Chat[]> {
    return this.ipcRenderer.invoke("get-chats", appId);
  }

  async getChat(chatId: number): Promise<Chat> {
    return this.ipcRenderer.invoke("get-chat", chatId);
  }

  async createChat(params: CreateChatParams): Promise<Chat> {
    const chatId = await this.ipcRenderer.invoke("create-chat", params.appId);
    // Return a basic chat object - the full chat will be fetched separately if needed
    return {
      id: chatId,
      title: "New Chat",
      messages: [],
      initialCommitHash: null,
    };
  }

  async deleteChat(chatId: number): Promise<void> {
    await this.ipcRenderer.invoke("delete-chat", chatId);
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    const chat = await this.ipcRenderer.invoke("get-chat", chatId);
    return chat.messages || [];
  }

  async sendMessage(params: SendMessageParams): Promise<Message> {
    // Note: This is a simplified implementation
    // The actual desktop app uses streaming via chat:stream
    // This provides a basic non-streaming fallback
    throw new Error(
      "Direct message sending not supported via IPC. Use the streaming API instead."
    );
  }
}

/**
 * IPC Settings API implementation
 */
class IpcSettingsApi implements SettingsApi {
  constructor(private ipcRenderer: IpcRenderer) {}

  async getSettings(): Promise<Record<string, any>> {
    // IPC client doesn't have a direct settings endpoint
    // Return empty object as placeholder
    return {};
  }

  async updateSettings(
    settings: Record<string, any>
  ): Promise<Record<string, any>> {
    // IPC client doesn't have a direct settings endpoint
    // Return the input settings as placeholder
    return settings;
  }
}

/**
 * IPC Client implementation
 */
export class IpcClient implements DyadClient {
  public apps: AppApi;
  public chats: ChatApi;
  public settings: SettingsApi;

  private ipcRenderer: IpcRenderer;

  constructor(config: ClientConfig = {}) {
    // Get IPC renderer from window.electron
    if (typeof window === "undefined" || !(window as any).electron) {
      throw new Error("IPC client can only be used in Electron environment");
    }

    this.ipcRenderer = (window as any).electron.ipcRenderer as IpcRenderer;

    this.apps = new IpcAppApi(this.ipcRenderer);
    this.chats = new IpcChatApi(this.ipcRenderer);
    this.settings = new IpcSettingsApi(this.ipcRenderer);
  }

  async checkHealth(): Promise<HealthResponse> {
    // IPC is always available if the client was constructed
    return { status: "ok" };
  }

  async connect(): Promise<void> {
    // IPC is always connected in Electron
    // No explicit connection needed
  }

  async disconnect(): Promise<void> {
    // IPC doesn't need explicit disconnection
  }
}
