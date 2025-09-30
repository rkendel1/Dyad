import axios, { AxiosInstance } from 'axios';

export interface DyadApp {
    id: number;
    name: string;
    path: string;
    isRunning?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface DyadChat {
    id: number;
    appId: number;
    messages?: DyadMessage[];
}

export interface DyadMessage {
    id: number;
    chatId: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt?: string;
}

/**
 * DyadApi provides methods to interact with the Dyad API
 */
export class DyadApi {
    private client: AxiosInstance;
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Set the base URL for the API
     */
    setBaseUrl(url: string): void {
        this.baseUrl = url;
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Get all apps
     */
    async getApps(): Promise<DyadApp[]> {
        try {
            const response = await this.client.get<DyadApp[]>('/api/apps');
            return response.data;
        } catch (error) {
            console.error('Failed to get apps:', error);
            return [];
        }
    }

    /**
     * Get a specific app by ID
     */
    async getApp(appId: number): Promise<DyadApp | null> {
        try {
            const response = await this.client.get<DyadApp>(`/api/apps/${appId}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to get app ${appId}:`, error);
            return null;
        }
    }

    /**
     * Create a new app
     */
    async createApp(name: string): Promise<DyadApp | null> {
        try {
            const response = await this.client.post<DyadApp>('/api/apps', { name });
            return response.data;
        } catch (error) {
            console.error('Failed to create app:', error);
            return null;
        }
    }

    /**
     * Delete an app
     */
    async deleteApp(appId: number): Promise<boolean> {
        try {
            await this.client.delete(`/api/apps/${appId}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete app ${appId}:`, error);
            return false;
        }
    }

    /**
     * Get chats for an app
     */
    async getChats(appId: number): Promise<DyadChat[]> {
        try {
            const response = await this.client.get<DyadChat[]>(`/api/apps/${appId}/chats`);
            return response.data;
        } catch (error) {
            console.error(`Failed to get chats for app ${appId}:`, error);
            return [];
        }
    }

    /**
     * Send a message to a chat
     */
    async sendMessage(chatId: number, content: string): Promise<DyadMessage | null> {
        try {
            const response = await this.client.post<DyadMessage>(`/api/chats/${chatId}/messages`, {
                role: 'user',
                content
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to send message to chat ${chatId}:`, error);
            return null;
        }
    }

    /**
     * Get messages for a chat
     */
    async getMessages(chatId: number): Promise<DyadMessage[]> {
        try {
            const response = await this.client.get<DyadMessage[]>(`/api/chats/${chatId}/messages`);
            return response.data;
        } catch (error) {
            console.error(`Failed to get messages for chat ${chatId}:`, error);
            return [];
        }
    }

    /**
     * Run an app
     */
    async runApp(appId: number): Promise<boolean> {
        try {
            await this.client.post(`/api/apps/${appId}/run`);
            return true;
        } catch (error) {
            console.error(`Failed to run app ${appId}:`, error);
            return false;
        }
    }

    /**
     * Stop an app
     */
    async stopApp(appId: number): Promise<boolean> {
        try {
            await this.client.post(`/api/apps/${appId}/stop`);
            return true;
        } catch (error) {
            console.error(`Failed to stop app ${appId}:`, error);
            return false;
        }
    }

    /**
     * Get app status
     */
    async getAppStatus(appId: number): Promise<{ isRunning: boolean } | null> {
        try {
            const response = await this.client.get<{ isRunning: boolean }>(`/api/apps/${appId}/status`);
            return response.data;
        } catch (error) {
            console.error(`Failed to get app status for ${appId}:`, error);
            return null;
        }
    }
}
