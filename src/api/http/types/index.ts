/**
 * HTTP API Type Definitions
 * 
 * Type definitions for HTTP API requests and responses
 */

import type { Request, Response, NextFunction } from 'express';
import type { App, Chat, Message } from '../../../types';

/**
 * Extended Express Request with optional authentication
 */
export interface ApiRequest extends Request {
  user?: {
    id: string;
    name?: string;
  };
}

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * API Error Response
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  timestamp: string;
  uptime: number;
}

/**
 * App list response
 */
export interface AppListResponse {
  apps: App[];
  total: number;
}

/**
 * Chat list response
 */
export interface ChatListResponse {
  chats: Chat[];
  total: number;
}

/**
 * Message list response
 */
export interface MessageListResponse {
  messages: Message[];
  total: number;
  chatId: number;
}

/**
 * Create app request body
 */
export interface CreateAppRequest {
  name: string;
  description?: string;
  template?: string;
  framework?: string;
}

/**
 * Create chat request body
 */
export interface CreateChatRequest {
  appId: number;
}

/**
 * Send message request body
 */
export interface SendMessageRequest {
  content: string;
  role?: 'user' | 'assistant';
}

/**
 * Express middleware type
 */
export type ApiMiddleware = (
  req: ApiRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Express route handler type
 */
export type ApiHandler = (
  req: ApiRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
