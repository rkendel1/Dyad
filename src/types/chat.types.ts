/**
 * Chat Domain Types
 * 
 * Type definitions related to chats, messages, and chat interactions.
 */

/**
 * Metadata for chunked message delivery
 */
export interface ChunkMetadata {
  chunkIndex: number;
  totalChunks: number;
  isChunked: boolean;
  chunkDeliveryStatus: "delivering" | "completed" | "failed";
  filesDelivered?: number;
  filesPending?: number;
}

/**
 * Chat message entity
 */
export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  approvalState?: "approved" | "rejected" | null;
  commitHash?: string | null;
  dbTimestamp?: string | null;
  createdAt?: Date | string;
  chunkMetadata?: ChunkMetadata;
}

/**
 * Chat entity with messages
 */
export interface Chat {
  id: number;
  title: string;
  messages: Message[];
  initialCommitHash?: string | null;
  dbTimestamp?: string | null;
}

/**
 * Chat logs data for debugging
 */
export interface ChatLogsData {
  debugInfo: any; // SystemDebugInfo
  chat: Chat;
  codebase: string;
}

/**
 * File attachment for chat
 */
export interface FileAttachment {
  file: File;
  type: "upload-to-codebase" | "chat-context";
}
