"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { dyadClient, type App, type Chat, type Message } from "@/lib/dyad-client";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Loader2,
  Bot,
  FileText,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileBrowser } from "@/components/file-browser";

export function AppDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const appId = params?.id ? parseInt(params.id as string, 10) : null;
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Fetch app details
  const {
    data: app,
    isLoading: appLoading,
    error: appError,
  } = useQuery<App, Error>({
    queryKey: ["app", appId],
    queryFn: () => dyadClient.apps.getApp(appId!),
    enabled: appId !== null,
  });

  // Fetch chats for this app
  const {
    data: chats,
    isLoading: chatsLoading,
    error: chatsError,
  } = useQuery<Chat[], Error>({
    queryKey: ["chats", appId],
    queryFn: () => dyadClient.chats.listChats(appId!),
    enabled: appId !== null,
  });

  // Fetch messages for selected chat
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery<Message[], Error>({
    queryKey: ["messages", selectedChatId],
    queryFn: () => dyadClient.chats.getChatMessages(selectedChatId!),
    enabled: selectedChatId !== null,
    refetchInterval: 2000, // Poll for new messages every 2 seconds
  });

  // Create chat mutation
  const createChatMutation = useMutation({
    mutationFn: () => dyadClient.chats.createChat({ appId: appId! }),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats", appId] });
      setSelectedChatId(newChat.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      dyadClient.chats.sendMessage({ chatId: selectedChatId!, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
      setMessageInput("");
    },
  });

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: (chatId: number) => dyadClient.chats.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", appId] });
      if (selectedChatId) {
        setSelectedChatId(null);
      }
    },
  });

  // Delete app mutation
  const deleteAppMutation = useMutation({
    mutationFn: () => dyadClient.apps.deleteApp(appId!),
    onSuccess: () => {
      router.push("/");
    },
  });

  // Auto-scroll to bottom when new messages arrive, unless user is scrolling up
  useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserScrolling]);

  // Listen for user scroll to disable auto-scroll
  const chatContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chatContentRef.current;
    if (!el) return;
    const handleScroll = () => {
      // If user is near the bottom, auto-scroll is enabled
      const threshold = 120;
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setIsUserScrolling(!atBottom);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Select first chat if available
  useEffect(() => {
    if (chats && chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedChatId) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleCreateChat = () => {
    createChatMutation.mutate();
  };

  const handleDeleteChat = (chatId: number) => {
    if (confirm("Are you sure you want to delete this chat?")) {
      deleteChatMutation.mutate(chatId);
    }
  };

  const handleDeleteApp = () => {
    if (
      confirm(
        `Are you sure you want to delete "${app?.name}"? This action cannot be undone.`
      )
    ) {
      deleteAppMutation.mutate();
    }
  };

  // --- Streaming/Batching UI logic ---
  // If the last assistant message is empty or changing, show a typing indicator
  const isAssistantTyping = (() => {
    if (!messages || messages.length === 0) return false;
    const last = messages[messages.length - 1];
    // If the last message is from assistant and is empty or just whitespace, or if the previous message is from user and the last is assistant with short content
    if (last.role === "assistant" && (!last.content || last.content.trim() === "")) {
      return true;
    }
    // If the last assistant message is very short and the previous message is from user, treat as streaming
    if (
      last.role === "assistant" &&
      last.content &&
      last.content.length < 5 &&
      messages.length > 1 &&
      messages[messages.length - 2].role === "user"
    ) {
      return true;
    }
    return false;
  })();

  if (appLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (appError || !app) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950 flex items-center justify-center">
        <Card className="border-destructive bg-destructive/10 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              {appError?.message || "Application not found"}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apps
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {app.name}
                </h1>
                <p className="text-sm text-muted-foreground">{app.path}</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteApp}
              disabled={deleteAppMutation.isPending}
            >
              {deleteAppMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-88px)]">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="files">
              <FileText className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Chat List Sidebar */}
          <div className="col-span-3">
            <Card className="h-full bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Chats</CardTitle>
                  <Button
                    size="sm"
                    onClick={handleCreateChat}
                    disabled={createChatMutation.isPending}
                  >
                    {createChatMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {chatsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {chatsError && (
                  <div className="text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Failed to load chats
                  </div>
                )}
                {chats && chats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No chats yet. Create one to start!
                  </div>
                )}
                {chats && chats.length > 0 && (
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all group ${
                          selectedChatId === chat.id
                            ? "bg-primary/10 border-2 border-primary"
                            : "hover:bg-accent border-2 border-transparent"
                        }`}
                        onClick={() => setSelectedChatId(chat.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {chat.title || `Chat ${chat.id}`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages Area */}
          <div className="col-span-9">
            <Card className="h-full bg-card border-border flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">
                  {selectedChatId
                    ? chats?.find((c) => c.id === selectedChatId)?.title ||
                      `Chat ${selectedChatId}`
                    : "Select a chat"}
                </CardTitle>
              </CardHeader>
              <CardContent
                className="flex-1 overflow-y-auto p-4"
                ref={chatContentRef}
              >
                {!selectedChatId && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a chat to view messages</p>
                    </div>
                  </div>
                )}
                {selectedChatId && messagesLoading && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {selectedChatId && messagesError && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-destructive">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Failed to load messages</p>
                    </div>
                  </div>
                )}
                {selectedChatId && messages && (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <div>
                              {message.content && message.content.length > 500 ? (
                                <div>
                                  <p className="font-semibold text-xs uppercase tracking-wide mb-2 opacity-70">
                                    Summary
                                  </p>
                                  <MarkdownRenderer content={message.content.substring(0, 500) + "..."} />
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-xs text-primary hover:underline">
                                      Show full message
                                    </summary>
                                    <div className="mt-2">
                                      <MarkdownRenderer content={message.content} />
                                    </div>
                                  </details>
                                </div>
                              ) : (
                                <MarkdownRenderer content={message.content || ""} />
                              )}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}
                          <p className="text-xs opacity-70 mt-2">
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Typing indicator for streaming/AI response */}
                    {isAssistantTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg max-w-[60%]">
                          <Bot className="h-4 w-4 animate-bounce text-primary" />
                          <span className="text-sm text-muted-foreground">
                            AI is typing...
                          </span>
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
              {selectedChatId && (
                <CardFooter className="border-t pt-4 bg-card">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex gap-2 w-full"
                  >
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      type="submit"
                      disabled={
                        !messageInput.trim() || sendMessageMutation.isPending
                      }
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-hidden">
            <FileBrowser appId={appId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}