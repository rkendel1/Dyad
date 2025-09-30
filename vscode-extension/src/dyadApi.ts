import axios, { AxiosInstance, AxiosError } from 'axios';

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

export interface DyadTemplate {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    githubUrl?: string;
}

export interface SupabaseSetupParams {
    appId: number;
}

export interface SupabasePromotionParams {
    appId: number;
    productionProjectRef: string;
    supabaseUrl: string;
    anonKey: string;
    serviceRoleKey: string;
    dbPassword: string;
}

/**
 * DyadApi provides methods to interact with the Dyad API
 * Note: Dyad Desktop may need to be running for API calls to work.
 * This class includes health checks and better error handling.
 */
export class DyadApi {
    private client: AxiosInstance;
    private baseUrl: string;
    private healthCheckCache: { isHealthy: boolean; timestamp: number } | null = null;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private readonly HEALTH_CHECK_TTL = 30000; // 30 seconds

    constructor(baseUrl: string = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor for better error handling
        this.client.interceptors.response.use(
            response => response,
            (error: AxiosError) => {
                if (error.code === 'ECONNREFUSED') {
                    console.error('Cannot connect to Dyad Desktop. Is it running?');
                    throw new Error('Cannot connect to Dyad Desktop. Please make sure Dyad Desktop is running.');
                }
                if (error.code === 'ETIMEDOUT') {
                    console.error('Connection to Dyad Desktop timed out');
                    throw new Error('Connection to Dyad Desktop timed out. Please check if Dyad Desktop is responding.');
                }
                throw error;
            }
        );
    }

    /**
     * Set the base URL for the API
     */
    setBaseUrl(url: string): void {
        this.baseUrl = url;
        this.healthCheckCache = null; // Reset health check cache
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Check if the API is healthy and accessible
     */
    async checkHealth(): Promise<boolean> {
        // Use cached result if still valid
        if (this.healthCheckCache && Date.now() - this.healthCheckCache.timestamp < this.HEALTH_CHECK_TTL) {
            return this.healthCheckCache.isHealthy;
        }

        try {
            // Try a simple request to check connectivity
            await this.client.get('/api/apps', { timeout: 5000 });
            this.healthCheckCache = { isHealthy: true, timestamp: Date.now() };
            return true;
        } catch (error) {
            console.log('Dyad Desktop API health check failed:', error instanceof Error ? error.message : String(error));
            this.healthCheckCache = { isHealthy: false, timestamp: Date.now() };
            return false;
        }
    }

    /**
     * Get all apps
     */
    async getApps(): Promise<DyadApp[]> {
        try {
            const response = await this.client.get<DyadApp[]>('/api/apps');
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to get apps:', error.message);
            } else {
                console.error('Failed to get apps:', error);
            }
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
            if (error instanceof Error) {
                console.error(`Failed to get app ${appId}:`, error.message);
            } else {
                console.error(`Failed to get app ${appId}:`, error);
            }
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
            if (error instanceof Error) {
                console.error('Failed to create app:', error.message);
            } else {
                console.error('Failed to create app:', error);
            }
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
            if (error instanceof Error) {
                console.error(`Failed to delete app ${appId}:`, error.message);
            } else {
                console.error(`Failed to delete app ${appId}:`, error);
            }
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
            if (error instanceof Error) {
                console.error(`Failed to get chats for app ${appId}:`, error.message);
            } else {
                console.error(`Failed to get chats for app ${appId}:`, error);
            }
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
            if (error instanceof Error) {
                console.error(`Failed to send message to chat ${chatId}:`, error.message);
            } else {
                console.error(`Failed to send message to chat ${chatId}:`, error);
            }
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
            if (error instanceof Error) {
                console.error(`Failed to get messages for chat ${chatId}:`, error.message);
            } else {
                console.error(`Failed to get messages for chat ${chatId}:`, error);
            }
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
            if (error instanceof Error) {
                console.error(`Failed to run app ${appId}:`, error.message);
            } else {
                console.error(`Failed to run app ${appId}:`, error);
            }
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
            if (error instanceof Error) {
                console.error(`Failed to stop app ${appId}:`, error.message);
            } else {
                console.error(`Failed to stop app ${appId}:`, error);
            }
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
            if (error instanceof Error) {
                console.error(`Failed to get app status for ${appId}:`, error.message);
            } else {
                console.error(`Failed to get app status for ${appId}:`, error);
            }
            return null;
        }
    }

    /**
     * Get available templates
     */
    async getTemplates(): Promise<DyadTemplate[]> {
        try {
            const response = await this.client.get<DyadTemplate[]>('/api/templates');
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to get templates:', error.message);
            } else {
                console.error('Failed to get templates:', error);
            }
            return [];
        }
    }

    /**
     * Create app with specific template
     */
    async createAppWithTemplate(name: string, templateId: string): Promise<DyadApp | null> {
        try {
            const response = await this.client.post<DyadApp>('/api/apps', { 
                name,
                templateId 
            });
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to create app with template:', error.message);
            } else {
                console.error('Failed to create app with template:', error);
            }
            return null;
        }
    }

    /**
     * Setup local Supabase for an app
     */
    async setupLocalSupabase(params: SupabaseSetupParams): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await this.client.post<{ success: boolean; message?: string }>('/api/supabase/setup-local', params);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to setup local Supabase:', error.message);
                return { success: false, message: error.message };
            } else {
                console.error('Failed to setup local Supabase:', error);
                return { success: false, message: String(error) };
            }
        }
    }

    /**
     * Promote app to production Supabase
     */
    async promoteToProduction(params: SupabasePromotionParams): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await this.client.post<{ success: boolean; message?: string }>('/api/supabase/promote-to-production', params);
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to promote to production:', error.message);
                return { success: false, message: error.message };
            } else {
                console.error('Failed to promote to production:', error);
                return { success: false, message: String(error) };
            }
        }
    }
}
