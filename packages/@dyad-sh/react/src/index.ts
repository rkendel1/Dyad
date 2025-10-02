/**
 * @dyad-sh/react
 * 
 * React hooks for Dyad - AI App Builder
 * Provides convenient hooks for using Dyad clients in React applications
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  DyadClient,
  App,
  Chat,
  Message,
  CreateAppParams,
  CreateChatParams,
  SendMessageParams,
} from "@dyad-sh/core";

/**
 * Hook to use Dyad client instance
 */
export function useDyadClient(client: DyadClient) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await client.checkHealth();
        setIsConnected(health.status === "ok");
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, [client]);

  return {
    client,
    isConnected,
  };
}

/**
 * Hook to fetch and manage apps
 */
export function useApps(client: DyadClient) {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apps = await client.apps.listApps();
      setApps(apps);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch apps"));
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const createApp = useCallback(
    async (params: CreateAppParams) => {
      try {
        const result = await client.apps.createApp(params);
        await fetchApps();
        return result;
      } catch (err) {
        throw err;
      }
    },
    [client, fetchApps]
  );

  const deleteApp = useCallback(
    async (appId: number) => {
      try {
        await client.apps.deleteApp(appId);
        await fetchApps();
      } catch (err) {
        throw err;
      }
    },
    [client, fetchApps]
  );

  return {
    apps,
    isLoading,
    error,
    refresh: fetchApps,
    createApp,
    deleteApp,
  };
}

/**
 * Hook to fetch a single app
 */
export function useApp(client: DyadClient, appId: number | null) {
  const [app, setApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!appId) {
      setApp(null);
      setIsLoading(false);
      return;
    }

    const fetchApp = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const app = await client.apps.getApp(appId);
        setApp(app);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch app"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [client, appId]);

  return {
    app,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch and manage chats for an app
 */
export function useChats(client: DyadClient, appId: number | null) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChats = useCallback(async () => {
    if (!appId) {
      setChats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const chats = await client.chats.listChats(appId);
      setChats(chats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch chats"));
    } finally {
      setIsLoading(false);
    }
  }, [client, appId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createChat = useCallback(
    async (params: CreateChatParams) => {
      try {
        const chat = await client.chats.createChat(params);
        await fetchChats();
        return chat;
      } catch (err) {
        throw err;
      }
    },
    [client, fetchChats]
  );

  const deleteChat = useCallback(
    async (chatId: number) => {
      try {
        await client.chats.deleteChat(chatId);
        await fetchChats();
      } catch (err) {
        throw err;
      }
    },
    [client, fetchChats]
  );

  return {
    chats,
    isLoading,
    error,
    refresh: fetchChats,
    createChat,
    deleteChat,
  };
}

/**
 * Hook to fetch messages for a chat
 */
export function useMessages(client: DyadClient, chatId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const messages = await client.chats.getChatMessages(chatId);
      setMessages(messages);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch messages")
      );
    } finally {
      setIsLoading(false);
    }
  }, [client, chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (params: SendMessageParams) => {
      try {
        const message = await client.chats.sendMessage(params);
        await fetchMessages();
        return message;
      } catch (err) {
        throw err;
      }
    },
    [client, fetchMessages]
  );

  return {
    messages,
    isLoading,
    error,
    refresh: fetchMessages,
    sendMessage,
  };
}

/**
 * Hook for polling messages with auto-refresh
 */
export function useMessagesPolling(
  client: DyadClient,
  chatId: number | null,
  intervalMs: number = 2000
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      const messages = await client.chats.getChatMessages(chatId);
      setMessages(messages);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch messages")
      );
    } finally {
      setIsLoading(false);
    }
  }, [client, chatId]);

  useEffect(() => {
    fetchMessages();

    if (chatId) {
      intervalRef.current = setInterval(fetchMessages, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMessages, chatId, intervalMs]);

  return {
    messages,
    isLoading,
    error,
    refresh: fetchMessages,
  };
}
