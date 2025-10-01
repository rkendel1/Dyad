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
} from '../../types';
import { db } from '../../db';
import { apps, chats, messages } from '../../db/schema';
import { eq, desc, and, like } from 'drizzle-orm';
import { getDyadAppPath } from '../../paths/paths';
import * as git from 'isomorphic-git';
import * as fs from 'fs';

/**
 * Service class for managing chats and messages
 */
export class ChatService {
  /**
   * Create a new chat
   */
  async createChat(appId: number): Promise<Chat> {
    // Get the app's path first
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
      columns: {
        path: true,
      },
    });

    if (!app) {
      throw new Error(`App with ID ${appId} not found`);
    }

    let initialCommitHash = null;
    try {
      // Get the current git revision of main branch
      initialCommitHash = await git.resolveRef({
        fs,
        dir: getDyadAppPath(app.path),
        ref: 'main',
      });
    } catch (error) {
      console.error('Error getting git revision:', error);
      // Continue without the git revision
    }

    // Create a new chat
    const [chat] = await db
      .insert(chats)
      .values({
        appId,
        initialCommitHash,
      })
      .returning();

    // Return chat with empty messages array to match Chat type
    return {
      id: chat.id,
      title: chat.title || '',
      messages: [],
      initialCommitHash: chat.initialCommitHash,
    };
  }

  /**
   * Get chat by ID
   */
  async getChat(chatId: number): Promise<Chat> {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        messages: {
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        },
      },
    });

    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    return chat as Chat;
  }

  /**
   * List chats for an app
   */
  async listChats(appId: number): Promise<Chat[]> {
    const allChats = await db.query.chats.findMany({
      where: eq(chats.appId, appId),
      columns: {
        id: true,
        title: true,
        createdAt: true,
        appId: true,
        initialCommitHash: true,
      },
      orderBy: [desc(chats.createdAt)],
    });

    // Map to Chat type with empty messages array
    return allChats.map(chat => ({
      id: chat.id,
      title: chat.title || '',
      messages: [],
      initialCommitHash: chat.initialCommitHash,
    }));
  }

  /**
   * Send a message in a chat
   * Note: Message streaming is handled by the IPC handler with AI SDK
   * This service provides the database operations for message management
   */
  async sendMessage(params: ChatStreamParams): Promise<ChatResponseEnd> {
    // The full implementation with AI streaming is complex and tightly coupled
    // to the IPC handler context. This method should be called by the handler.
    throw new Error('Use IPC handler "chat-stream" for full message streaming with AI');
  }

  /**
   * Delete a chat
   */
  async deleteChat(chatId: number): Promise<void> {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });

    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    await db.delete(chats).where(eq(chats.id, chatId));
  }

  /**
   * Update chat title
   */
  async updateChatTitle(chatId: number, title: string): Promise<Chat> {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });

    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    await db.update(chats).set({ title }).where(eq(chats.id, chatId));

    // Return updated chat
    const updatedChat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });

    if (!updatedChat) {
      throw new Error(`Chat with ID ${chatId} not found after update`);
    }

    return {
      id: updatedChat.id,
      title: updatedChat.title || '',
      messages: [],
      initialCommitHash: updatedChat.initialCommitHash,
    };
  }
}

/**
 * Singleton instance for easy access
 */
export const chatService = new ChatService();
