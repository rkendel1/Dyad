import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"; // Dyad Desktop API

export interface DyadApp {
  id: number;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  // Add other app properties as needed
}

export interface Chat {
  id: number;
  title: string;
  messages: Message[];
  initialCommitHash: string | null;
}

export interface Message {
  id: number;
  chatId: number;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
}

export class DyadApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 seconds
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get("/health");
      return response.data.success;
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  async getApps(): Promise<DyadApp[]> {
    try {
      const response = await this.client.get<{
        success: boolean;
        data: { apps: DyadApp[] };
      }>("/apps");
      if (response.data.success) {
        return response.data.data.apps;
      }
      throw new Error("Failed to fetch apps");
    } catch (error: unknown) {
      console.error("Error fetching apps:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch apps"
      );
    }
  }

  async getApp(appId: number): Promise<DyadApp> {
    try {
      const response = await this.client.get<{
        success: boolean;
        data: DyadApp;
      }>(`/apps/${appId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to fetch app");
    } catch (error: unknown) {
      console.error("Error fetching app:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch app"
      );
    }
  }

  async deleteApp(appId: number): Promise<void> {
    try {
      const response = await this.client.delete<{
        success: boolean;
      }>(`/apps/${appId}`);
      if (!response.data.success) {
        throw new Error("Failed to delete app");
      }
    } catch (error: unknown) {
      console.error("Error deleting app:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to delete app"
      );
    }
  }

  async listChats(appId: number): Promise<Chat[]> {
    try {
      const response = await this.client.get<{
        success: boolean;
        data: { chats: Chat[] };
      }>(`/apps/${appId}/chats`);
      if (response.data.success) {
        return response.data.data.chats;
      }
      throw new Error("Failed to fetch chats");
    } catch (error: unknown) {
      console.error("Error fetching chats:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch chats"
      );
    }
  }

  async createChat(appId: number): Promise<Chat> {
    try {
      const response = await this.client.post<{
        success: boolean;
        data: Chat;
      }>(`/apps/${appId}/chats`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to create chat");
    } catch (error: unknown) {
      console.error("Error creating chat:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to create chat"
      );
    }
  }

  async getChat(chatId: number): Promise<Chat> {
    try {
      const response = await this.client.get<{
        success: boolean;
        data: Chat;
      }>(`/chats/${chatId}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to fetch chat");
    } catch (error: unknown) {
      console.error("Error fetching chat:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch chat"
      );
    }
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    try {
      const response = await this.client.get<{
        success: boolean;
        data: { messages: Message[] };
      }>(`/chats/${chatId}/messages`);
      if (response.data.success) {
        return response.data.data.messages;
      }
      throw new Error("Failed to fetch messages");
    } catch (error: unknown) {
      console.error("Error fetching messages:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch messages"
      );
    }
  }

  async sendMessage(chatId: number, content: string): Promise<Message> {
    try {
      const response = await this.client.post<{
        success: boolean;
        data: Message;
      }>(`/chats/${chatId}/messages`, { content, role: "user" });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error("Failed to send message");
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to send message"
      );
    }
  }

  async deleteChat(chatId: number): Promise<void> {
    try {
      const response = await this.client.delete<{
        success: boolean;
      }>(`/chats/${chatId}`);
      if (!response.data.success) {
        throw new Error("Failed to delete chat");
      }
    } catch (error: unknown) {
      console.error("Error deleting chat:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to delete chat"
      );
    }
  }

  // Add more API methods here as needed

  // File operations
  async getAppFiles(appId: number): Promise<string[]> {
    try {
      const response = await this.client.get<{
        success: boolean;
        data: { files: string[] };
      }>(`/apps/${appId}/files`);
      if (response.data.success) {
        return response.data.data.files;
      }
      throw new Error("Failed to fetch files");
    } catch (error: unknown) {
      console.error("Error fetching files:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch files"
      );
    }
  }

  async getFileContent(appId: number, filePath: string): Promise<string> {
    try {
      const response = await this.client.get<{
        success: boolean;
        data: { path: string; content: string };
      }>(`/apps/${appId}/files/content`, {
        params: { path: filePath },
      });
      if (response.data.success) {
        return response.data.data.content;
      }
      throw new Error("Failed to fetch file content");
    } catch (error: unknown) {
      console.error("Error fetching file content:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch file content"
      );
    }
  }

  async updateFileContent(
    appId: number,
    filePath: string,
    content: string
  ): Promise<void> {
    try {
      const response = await this.client.put<{
        success: boolean;
      }>(`/apps/${appId}/files/content`, {
        path: filePath,
        content,
      });
      if (!response.data.success) {
        throw new Error("Failed to update file");
      }
    } catch (error: unknown) {
      console.error("Error updating file:", error);
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      throw new Error(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to update file"
      );
    }
  }
}

export const dyadApiClient = new DyadApiClient();