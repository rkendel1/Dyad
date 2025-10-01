/**
 * Chat Controller
 * 
 * HTTP endpoints for chat and message management
 */

import type { Response } from 'express';
import type { ApiRequest, ApiResponse, ChatListResponse, MessageListResponse } from '../types';
import { asyncHandler, HttpApiError } from '../middleware/errorHandler';
import { ChatService } from '../../services/chat.service';
import { z } from 'zod';

const chatService = new ChatService();

/**
 * GET /api/apps/:appId/chats
 * List all chats for an application
 */
export const listChats = asyncHandler(async (req: ApiRequest, res: Response) => {
  const appId = parseInt(req.params.appId, 10);
  
  if (isNaN(appId)) {
    throw new HttpApiError('Invalid app ID', 400, 'INVALID_APP_ID');
  }

  const chats = await chatService.listChats(appId);
  
  const response: ApiResponse<ChatListResponse> = {
    success: true,
    data: {
      chats,
      total: chats.length,
    },
  };

  res.json(response);
});

/**
 * POST /api/apps/:appId/chats
 * Create a new chat for an application
 */
export const createChat = asyncHandler(async (req: ApiRequest, res: Response) => {
  const appId = parseInt(req.params.appId, 10);
  
  if (isNaN(appId)) {
    throw new HttpApiError('Invalid app ID', 400, 'INVALID_APP_ID');
  }

  const chat = await chatService.createChat(appId);

  const response: ApiResponse = {
    success: true,
    data: chat,
  };

  res.status(201).json(response);
});

/**
 * GET /api/chats/:id
 * Get a specific chat by ID
 */
export const getChat = asyncHandler(async (req: ApiRequest, res: Response) => {
  const chatId = parseInt(req.params.id, 10);
  
  if (isNaN(chatId)) {
    throw new HttpApiError('Invalid chat ID', 400, 'INVALID_CHAT_ID');
  }

  const chat = await chatService.getChat(chatId);
  
  if (!chat) {
    throw new HttpApiError('Chat not found', 404, 'CHAT_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    data: chat,
  };

  res.json(response);
});

/**
 * DELETE /api/chats/:id
 * Delete a chat
 */
export const deleteChat = asyncHandler(async (req: ApiRequest, res: Response) => {
  const chatId = parseInt(req.params.id, 10);
  
  if (isNaN(chatId)) {
    throw new HttpApiError('Invalid chat ID', 400, 'INVALID_CHAT_ID');
  }

  await chatService.deleteChat(chatId);

  const response: ApiResponse = {
    success: true,
    data: {
      message: 'Chat deleted successfully',
      chatId,
    },
  };

  res.json(response);
});

/**
 * PUT /api/chats/:id
 * Update a chat (e.g., title)
 */
export const updateChat = asyncHandler(async (req: ApiRequest, res: Response) => {
  const chatId = parseInt(req.params.id, 10);
  
  if (isNaN(chatId)) {
    throw new HttpApiError('Invalid chat ID', 400, 'INVALID_CHAT_ID');
  }

  const { title } = req.body;

  const chat = await chatService.updateChatTitle(chatId, title);

  const response: ApiResponse = {
    success: true,
    data: chat,
  };

  res.json(response);
});

/**
 * GET /api/chats/:id/messages
 * Get all messages for a chat
 */
export const getChatMessages = asyncHandler(async (req: ApiRequest, res: Response) => {
  const chatId = parseInt(req.params.id, 10);
  
  if (isNaN(chatId)) {
    throw new HttpApiError('Invalid chat ID', 400, 'INVALID_CHAT_ID');
  }

  const messages = await chatService.getChatMessages(chatId);

  const response: ApiResponse<MessageListResponse> = {
    success: true,
    data: {
      messages,
      total: messages.length,
      chatId,
    },
  };

  res.json(response);
});

/**
 * POST /api/chats/:id/messages
 * Create a new message in a chat
 */
export const createMessage = asyncHandler(async (req: ApiRequest, res: Response) => {
  const chatId = parseInt(req.params.id, 10);
  
  if (isNaN(chatId)) {
    throw new HttpApiError('Invalid chat ID', 400, 'INVALID_CHAT_ID');
  }

  const { content, role } = req.body;

  const message = await chatService.createMessage(chatId, {
    content,
    role: role || 'user',
  });

  const response: ApiResponse = {
    success: true,
    data: message,
  };

  res.status(201).json(response);
});

/**
 * Validation schemas
 */
export const updateChatSchema = z.object({
  title: z.string().min(1).max(255),
});

export const createMessageSchema = z.object({
  content: z.string().min(1),
  role: z.enum(['user', 'assistant']).optional(),
});
