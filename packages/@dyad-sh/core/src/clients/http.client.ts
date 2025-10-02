/**
 * HTTP Client Implementation
 * 
 * Implements the DyadClient interface using HTTP/REST API
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
  ApiResponse,
  CreateAppParams,
  CreateAppResult,
  CreateChatParams,
  SendMessageParams,
  HealthResponse,
  AppSettings,
} from "../types";

/**
 * HTTP App API implementation
 */
class HttpAppApi implements AppApi {
  constructor(private baseUrl: string, private config: ClientConfig) {}

  async listApps(): Promise<App[]> {
    const response = await fetch(`${this.baseUrl}/api/apps`, {
      headers: this.getHeaders(),
    });
    const data: ApiResponse<{ apps: App[] }> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to fetch apps");
    }
    return data.data.apps;
  }

  async getApp(appId: number): Promise<App> {
    const response = await fetch(`${this.baseUrl}/api/apps/${appId}`, {
      headers: this.getHeaders(),
    });
    const data: ApiResponse<App> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to fetch app");
    }
    return data.data;
  }

  async createApp(params: CreateAppParams): Promise<CreateAppResult> {
    const response = await fetch(`${this.baseUrl}/api/apps`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    const data: ApiResponse<CreateAppResult> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to create app");
    }
    return data.data;
  }

  async deleteApp(appId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/apps/${appId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    const data: ApiResponse<void> = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || "Failed to delete app");
    }
  }

  async getAppSettings(appId: number): Promise<AppSettings> {
    const response = await fetch(`${this.baseUrl}/api/apps/${appId}/settings`, {
      headers: this.getHeaders(),
    });
    const data: ApiResponse<AppSettings> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to fetch app settings");
    }
    return data.data;
  }

  async updateAppSettings(
    appId: number,
    settings: AppSettings
  ): Promise<AppSettings> {
    const response = await fetch(`${this.baseUrl}/api/apps/${appId}/settings`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    const data: ApiResponse<AppSettings> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to update app settings");
    }
    return data.data;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}

/**
 * HTTP Chat API implementation
 */
class HttpChatApi implements ChatApi {
  constructor(private baseUrl: string, private config: ClientConfig) {}

  async listChats(appId: number): Promise<Chat[]> {
    const response = await fetch(`${this.baseUrl}/api/apps/${appId}/chats`, {
      headers: this.getHeaders(),
    });
    const data: ApiResponse<{ chats: Chat[] }> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to fetch chats");
    }
    return data.data.chats;
  }

  async getChat(chatId: number): Promise<Chat> {
    const response = await fetch(`${this.baseUrl}/api/chats/${chatId}`, {
      headers: this.getHeaders(),
    });
    const data: ApiResponse<Chat> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to fetch chat");
    }
    return data.data;
  }

  async createChat(params: CreateChatParams): Promise<Chat> {
    const response = await fetch(
      `${this.baseUrl}/api/apps/${params.appId}/chats`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      }
    );
    const data: ApiResponse<Chat> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to create chat");
    }
    return data.data;
  }

  async deleteChat(chatId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/chats/${chatId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    const data: ApiResponse<void> = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || "Failed to delete chat");
    }
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    const response = await fetch(
      `${this.baseUrl}/api/chats/${chatId}/messages`,
      {
        headers: this.getHeaders(),
      }
    );
    const data: ApiResponse<{ messages: Message[] }> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to fetch messages");
    }
    return data.data.messages;
  }

  async sendMessage(params: SendMessageParams): Promise<Message> {
    const response = await fetch(
      `${this.baseUrl}/api/chats/${params.chatId}/messages`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ content: params.content }),
      }
    );
    const data: ApiResponse<Message> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to send message");
    }
    return data.data;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}

/**
 * HTTP Settings API implementation
 */
class HttpSettingsApi implements SettingsApi {
  constructor(private baseUrl: string, private config: ClientConfig) {}

  async getSettings(): Promise<Record<string, any>> {
    const response = await fetch(`${this.baseUrl}/api/settings`, {
      headers: this.getHeaders(),
    });
    const data: ApiResponse<Record<string, any>> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to fetch settings");
    }
    return data.data;
  }

  async updateSettings(
    settings: Record<string, any>
  ): Promise<Record<string, any>> {
    const response = await fetch(`${this.baseUrl}/api/settings`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    const data: ApiResponse<Record<string, any>> = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error?.message || "Failed to update settings");
    }
    return data.data;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}

/**
 * HTTP Client implementation
 */
export class HttpClient implements DyadClient {
  public apps: AppApi;
  public chats: ChatApi;
  public settings: SettingsApi;

  private baseUrl: string;
  private config: ClientConfig;

  constructor(config: ClientConfig = {}) {
    this.baseUrl = config.baseUrl || "http://localhost:3000";
    this.config = {
      timeout: 10000,
      ...config,
    };

    this.apps = new HttpAppApi(this.baseUrl, this.config);
    this.chats = new HttpChatApi(this.baseUrl, this.config);
    this.settings = new HttpSettingsApi(this.baseUrl, this.config);
  }

  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        headers: this.getHeaders(),
      });
      const data: ApiResponse<HealthResponse> = await response.json();
      if (!data.success || !data.data) {
        return { status: "error" };
      }
      return data.data;
    } catch (error) {
      return { status: "error" };
    }
  }

  async connect(): Promise<void> {
    // HTTP client doesn't need explicit connection
    const health = await this.checkHealth();
    if (health.status !== "ok") {
      throw new Error("Failed to connect to Dyad backend");
    }
  }

  async disconnect(): Promise<void> {
    // HTTP client doesn't need explicit disconnection
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}
