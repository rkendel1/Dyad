/**
 * Chat Service
 * 
 * Business logic for chat and message operations.
 */

import type {
  Chat,
  Message,
  ChatStreamParams,
  ChatResponseEnd,
} from '@/types';

/**
 * Service class for managing chats and messages
 */
export class ChatService {
  /**
   * Create a new chat
   */
  async createChat(appId: number): Promise<Chat> {
    throw new Error('Not implemented - delegate to existing handler');
  }

  /**
   * Get chat by ID
   */
  async getChat(chatId: number): Promise<Chat> {
    throw new Error('Not implemented - delegate to existing handler');
  }

  /**
   * List chats for an app
   */
  async listChats(appId: number): Promise<Chat[]> {
    throw new Error('Not implemented - delegate to existing handler');
  }

  /**
   * Send a message in a chat
   */
  async sendMessage(params: ChatStreamParams): Promise<ChatResponseEnd> {
    throw new Error('Not implemented - delegate to existing handler');
  }

  /**
   * Delete a chat
   */
  async deleteChat(chatId: number): Promise<void> {
    throw new Error('Not implemented - delegate to existing handler');
  }

  /**
   * Update chat title
   */
  async updateChatTitle(chatId: number, title: string): Promise<Chat> {
    throw new Error('Not implemented - delegate to existing handler');
  }
}

/**
 * Singleton instance for easy access
 */
export const chatService = new ChatService();
