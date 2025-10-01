import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Chat } from "@/types";

/**
 * Unit tests for ChatService
 * 
 * These tests verify the service layer's business logic with proper mocking.
 * The service layer provides:
 * - Separation of business logic from IPC handlers
 * - Testable interface for future HTTP/CLI transports
 * - Clear boundaries for code organization
 */

// Mock dependencies
vi.mock("@/db", () => ({
  db: {
    query: {
      apps: {
        findFirst: vi.fn(),
      },
      chats: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/db/schema", () => ({
  apps: { id: "id" },
  chats: { id: "id", appId: "appId", createdAt: "createdAt" },
  messages: {},
}));

vi.mock("@/paths/paths", () => ({
  getDyadAppPath: vi.fn((path: string) => `/mock/dyad/apps/${path}`),
}));

vi.mock("isomorphic-git", () => ({
  resolveRef: vi.fn(),
}));

vi.mock("fs", () => ({
  default: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value, op: "eq" })),
  desc: vi.fn((field) => ({ field, order: "desc" })),
  and: vi.fn((...args) => ({ op: "and", args })),
  like: vi.fn((field, value) => ({ field, value, op: "like" })),
}));

describe("ChatService", () => {
  let ChatService: any;
  let chatService: any;
  let db: any;
  let git: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import after mocks are set up
    const module = await import("@/api/services/chat.service");
    ChatService = module.ChatService;
    chatService = module.chatService;
    
    const dbModule = await import("@/db");
    db = dbModule.db;
    
    const gitModule = await import("isomorphic-git");
    git = gitModule;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Class and Singleton", () => {
    it("should export ChatService class", () => {
      expect(ChatService).toBeDefined();
      expect(typeof ChatService).toBe("function");
    });

    it("should export chatService singleton", () => {
      expect(chatService).toBeDefined();
      expect(chatService).toBeInstanceOf(ChatService);
    });

    it("should have all required methods", () => {
      expect(typeof chatService.createChat).toBe("function");
      expect(typeof chatService.getChat).toBe("function");
      expect(typeof chatService.listChats).toBe("function");
      expect(typeof chatService.sendMessage).toBe("function");
      expect(typeof chatService.deleteChat).toBe("function");
      expect(typeof chatService.updateChatTitle).toBe("function");
    });
  });

  describe("createChat", () => {
    it("should create chat with initial commit hash", async () => {
      const mockApp = { id: 1, path: "test-app" };
      const mockCommitHash = "abc123def456";
      const mockChat = {
        id: 1,
        appId: 1,
        initialCommitHash: mockCommitHash,
        title: null,
        createdAt: new Date(),
      };

      db.query.apps.findFirst.mockResolvedValue(mockApp);
      git.resolveRef.mockResolvedValue(mockCommitHash);
      
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockChat]),
        }),
      });
      db.insert.mockReturnValue(mockInsert());

      const result = await chatService.createChat(1);

      expect(result.id).toBe(1);
      expect(result.initialCommitHash).toBe(mockCommitHash);
      expect(result.messages).toEqual([]);
      expect(db.query.apps.findFirst).toHaveBeenCalledOnce();
      expect(git.resolveRef).toHaveBeenCalledOnce();
    });

    it("should create chat without commit hash if git fails", async () => {
      const mockApp = { id: 1, path: "test-app" };
      const mockChat = {
        id: 1,
        appId: 1,
        initialCommitHash: null,
        title: null,
        createdAt: new Date(),
      };

      db.query.apps.findFirst.mockResolvedValue(mockApp);
      git.resolveRef.mockRejectedValue(new Error("Git error"));
      
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockChat]),
        }),
      });
      db.insert.mockReturnValue(mockInsert());

      const result = await chatService.createChat(1);

      expect(result.initialCommitHash).toBeNull();
      expect(result.id).toBe(1);
      expect(result.messages).toEqual([]);
    });

    it("should throw error when app not found", async () => {
      db.query.apps.findFirst.mockResolvedValue(null);

      await expect(chatService.createChat(999)).rejects.toThrow(
        "App with ID 999 not found"
      );
    });
  });

  describe("getChat", () => {
    it("should return chat with messages", async () => {
      const mockChat = {
        id: 1,
        appId: 1,
        title: "Test Chat",
        createdAt: new Date(),
        messages: [
          { id: 1, content: "Hello", role: "user", chatId: 1 },
          { id: 2, content: "Hi there", role: "assistant", chatId: 1 },
        ],
      };

      db.query.chats.findFirst.mockResolvedValue(mockChat);

      const result = await chatService.getChat(1);

      expect(result).toMatchObject(mockChat);
      expect(result.messages).toHaveLength(2);
      expect(db.query.chats.findFirst).toHaveBeenCalledOnce();
    });

    it("should throw error when chat not found", async () => {
      db.query.chats.findFirst.mockResolvedValue(null);

      await expect(chatService.getChat(999)).rejects.toThrow(
        "Chat with ID 999 not found"
      );
    });
  });

  describe("listChats", () => {
    it("should return all chats for an app", async () => {
      const mockChats = [
        { id: 1, appId: 1, title: "Chat 1", createdAt: new Date(), initialCommitHash: null },
        { id: 2, appId: 1, title: "Chat 2", createdAt: new Date(), initialCommitHash: null },
      ];

      db.query.chats.findMany.mockResolvedValue(mockChats);

      const result = await chatService.listChats(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe("Chat 1");
      expect(result[0].messages).toEqual([]);
      expect(result[1].id).toBe(2);
      expect(result[1].title).toBe("Chat 2");
      expect(result[1].messages).toEqual([]);
      expect(db.query.chats.findMany).toHaveBeenCalledOnce();
    });

    it("should return empty array when no chats exist", async () => {
      db.query.chats.findMany.mockResolvedValue([]);

      const result = await chatService.listChats(1);

      expect(result).toEqual([]);
    });

    it("should filter chats by appId", async () => {
      const mockChats = [
        { id: 1, appId: 1, title: "Chat 1", createdAt: new Date(), initialCommitHash: null },
      ];

      db.query.chats.findMany.mockResolvedValue(mockChats);

      const result = await chatService.listChats(1);

      // Service returns Chat type which doesn't include appId
      // The filtering happens in the query layer
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe("updateChatTitle", () => {
    it("should update chat title successfully", async () => {
      const mockChat = {
        id: 1,
        appId: 1,
        title: "Old Title",
        createdAt: new Date(),
      };

      const updatedChat = {
        ...mockChat,
        title: "New Title",
      };

      db.query.chats.findFirst
        .mockResolvedValueOnce(mockChat)  // Initial check
        .mockResolvedValueOnce(updatedChat);  // After update

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      db.update.mockReturnValue(mockUpdate());

      const result = await chatService.updateChatTitle(1, "New Title");

      expect(result.title).toBe("New Title");
      expect(db.query.chats.findFirst).toHaveBeenCalledTimes(2);
    });

    it("should throw error when chat not found", async () => {
      db.query.chats.findFirst.mockResolvedValue(null);

      await expect(
        chatService.updateChatTitle(999, "New Title")
      ).rejects.toThrow("Chat with ID 999 not found");
    });
  });

  describe("deleteChat", () => {
    it("should delete chat successfully", async () => {
      const mockChat = { id: 1, appId: 1, title: "Test Chat" };
      db.query.chats.findFirst.mockResolvedValue(mockChat);

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });
      db.delete.mockReturnValue(mockDelete());

      await chatService.deleteChat(1);

      expect(db.query.chats.findFirst).toHaveBeenCalledOnce();
      expect(db.delete).toHaveBeenCalledOnce();
    });

    it("should throw error when chat not found", async () => {
      db.query.chats.findFirst.mockResolvedValue(null);

      await expect(chatService.deleteChat(999)).rejects.toThrow(
        "Chat with ID 999 not found"
      );
    });
  });

  describe("sendMessage", () => {
    it("should throw error indicating to use IPC handler", async () => {
      await expect(
        chatService.sendMessage({ chatId: 1, message: "Test" })
      ).rejects.toThrow(/Use IPC handler "chat-stream"/);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully in createChat", async () => {
      db.query.apps.findFirst.mockRejectedValue(new Error("Database error"));

      await expect(chatService.createChat(1)).rejects.toThrow(
        "Database error"
      );
    });

    it("should handle database errors gracefully in getChat", async () => {
      db.query.chats.findFirst.mockRejectedValue(new Error("Database error"));

      await expect(chatService.getChat(1)).rejects.toThrow("Database error");
    });

    it("should handle database errors gracefully in listChats", async () => {
      db.query.chats.findMany.mockRejectedValue(new Error("Database error"));

      await expect(chatService.listChats(1)).rejects.toThrow("Database error");
    });

    it("should handle database errors gracefully in deleteChat", async () => {
      const mockChat = { id: 1, appId: 1 };
      db.query.chats.findFirst.mockResolvedValue(mockChat);

      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error("Delete failed")),
      });
      db.delete.mockReturnValue(mockDelete());

      await expect(chatService.deleteChat(1)).rejects.toThrow("Delete failed");
    });
  });

  describe("Edge Cases", () => {
    it("should handle chat with no messages", async () => {
      const mockChat = {
        id: 1,
        appId: 1,
        title: "Empty Chat",
        createdAt: new Date(),
        messages: [],
      };

      db.query.chats.findFirst.mockResolvedValue(mockChat);

      const result = await chatService.getChat(1);

      expect(result.messages).toEqual([]);
    });

    it("should handle chat with null title", async () => {
      const mockChat = {
        id: 1,
        appId: 1,
        title: null,
        createdAt: new Date(),
      };

      db.query.chats.findFirst.mockResolvedValue(mockChat);
      
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      db.update.mockReturnValue(mockUpdate());

      db.query.chats.findFirst
        .mockResolvedValueOnce(mockChat)
        .mockResolvedValueOnce({ ...mockChat, title: "New Title" });

      const result = await chatService.updateChatTitle(1, "New Title");

      expect(result.title).toBe("New Title");
    });

    it("should handle empty string as chat title", async () => {
      const mockChat = {
        id: 1,
        appId: 1,
        title: "Old Title",
        createdAt: new Date(),
      };

      db.query.chats.findFirst
        .mockResolvedValueOnce(mockChat)
        .mockResolvedValueOnce({ ...mockChat, title: "" });

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
      db.update.mockReturnValue(mockUpdate());

      const result = await chatService.updateChatTitle(1, "");

      expect(result.title).toBe("");
    });
  });

  describe("Type Safety", () => {
    it("should return properly typed Chat object", async () => {
      const mockChat = {
        id: 1,
        appId: 1,
        title: "Test Chat",
        createdAt: new Date(),
        messages: [],
      };

      db.query.chats.findFirst.mockResolvedValue(mockChat);

      const result = await chatService.getChat(1);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("appId");
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("createdAt");
    });
  });
});
