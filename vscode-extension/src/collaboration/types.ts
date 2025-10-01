/**
 * Collaboration types and interfaces
 */

export enum UserRole {
  EDITOR = "editor",
  REVIEWER = "reviewer",
  VIEWER = "viewer",
}

export interface CollaborationUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  color: string;
  cursor?: {
    line: number;
    character: number;
  };
  selection?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

export interface CollaborationSession {
  id: string;
  appId: number;
  appName: string;
  ownerId: string;
  ownerName: string;
  users: CollaborationUser[];
  createdAt: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface InlineComment {
  id: string;
  userId: string;
  userName: string;
  line: number;
  text: string;
  timestamp: string;
  resolved: boolean;
}

export interface DocumentChange {
  sessionId: string;
  userId: string;
  timestamp: string;
  type: "insert" | "delete" | "replace";
  position: {
    line: number;
    character: number;
  };
  content?: string;
  length?: number;
}

export interface VersionSnapshot {
  id: string;
  sessionId: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  description?: string;
}

export enum CollaborationEventType {
  USER_JOINED = "user:joined",
  USER_LEFT = "user:left",
  USER_CURSOR_MOVE = "user:cursor:move",
  USER_SELECTION_CHANGE = "user:selection:change",
  DOCUMENT_CHANGE = "document:change",
  CHAT_MESSAGE = "chat:message",
  INLINE_COMMENT_ADD = "inline:comment:add",
  INLINE_COMMENT_RESOLVE = "inline:comment:resolve",
  ROLE_CHANGED = "role:changed",
  LOCK_ACQUIRED = "lock:acquired",
  LOCK_RELEASED = "lock:released",
  VERSION_SNAPSHOT = "version:snapshot",
}

export interface CollaborationEvent {
  type: CollaborationEventType;
  sessionId: string;
  userId: string;
  data: Record<string, unknown>;
  timestamp: string;
}
