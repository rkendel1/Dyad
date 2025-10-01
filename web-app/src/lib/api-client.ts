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

  // Add more API methods here as needed
}

export const dyadApiClient = new DyadApiClient();