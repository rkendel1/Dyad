"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { dyadClient, type App, type Chat, type Message, type ProposalResult } from "@/lib/dyad-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Trash2,
} from "lucide-react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { MessagesDisplay } from "@/components/messages-display";
import { MessageInput } from "@/components/message-input";
import { ProposalDisplay } from "@/components/proposal-display";

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

  // Fetch messages for selected chat - only when chat is selected and not streaming
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery<Message[], Error>({
    queryKey: ["messages", selectedChatId],
    queryFn: () => dyadClient.chats.getChatMessages(selectedChatId!),
    enabled: selectedChatId !== null,
    refetchInterval: (query) => {
      // Only poll if we have messages and the last message is from assistant (might be streaming)
      const data = query.state.data;
      if (!data || data.length === 0) return false;
      const lastMessage = data[data.length - 1];
      // If last message is from assistant and is short or empty, it might be streaming
      if (lastMessage.role === "assistant" && (!lastMessage.content || lastMessage.content.length < 10)) {
        return 1000; // Poll every 1 second during streaming
      }
      // Otherwise poll less frequently
      return 5000; // Poll every 5 seconds for new messages
    },
  });

  // Fetch proposal for selected chat
  const {
    data: proposal,
  } = useQuery<ProposalResult | null, Error>({
    queryKey: ["proposal", selectedChatId],
    queryFn: () => dyadClient.chats.getProposal(selectedChatId!),
    enabled: selectedChatId !== null,
    refetchInterval: 3000, // Check for proposals every 3 seconds
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
      queryClient.invalidateQueries({ queryKey: ["proposal", selectedChatId] });
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

  // Approve proposal mutation
  const approveProposalMutation = useMutation({
    mutationFn: () => dyadClient.chats.approveProposal(selectedChatId!, proposal!.messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposal", selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
    },
  });

  // Reject proposal mutation
  const rejectProposalMutation = useMutation({
    mutationFn: () => dyadClient.chats.rejectProposal(selectedChatId!, proposal!.messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposal", selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
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

  const handleApproveProposal = () => {
    if (proposal) {
      approveProposalMutation.mutate();
    }
  };

  const handleRejectProposal = () => {
    if (proposal) {
      rejectProposalMutation.mutate();
    }
  };

  // --- Streaming/Batching UI logic ---
  // If the last assistant message is empty or changing, show a typing indicator
  const isAssistantTyping = (() => {
    if (!messages || messages.length === 0) return false;
    const last = messages[messages.length - 1];
    // If the last message is from assistant and is empty or just whitespace
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
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Chat List Sidebar */}
          <div className="col-span-3">
            <ChatSidebar
              chats={chats}
              selectedChatId={selectedChatId}
              isLoading={chatsLoading}
              error={chatsError}
              onSelectChat={setSelectedChatId}
              onCreateChat={handleCreateChat}
              onDeleteChat={handleDeleteChat}
              isCreating={createChatMutation.isPending}
            />
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
              
              {/* Proposal Display */}
              {proposal && selectedChatId && (
                <div className="p-4 border-b">
                  <ProposalDisplay
                    proposal={proposal}
                    onApprove={handleApproveProposal}
                    onReject={handleRejectProposal}
                    isApproving={approveProposalMutation.isPending}
                    isRejecting={rejectProposalMutation.isPending}
                  />
                </div>
              )}

              <MessagesDisplay
                messages={messages}
                selectedChatId={selectedChatId}
                isLoading={messagesLoading}
                error={messagesError}
                isAssistantTyping={isAssistantTyping}
                chatContentRef={chatContentRef}
                messagesEndRef={messagesEndRef}
              />
              
              {selectedChatId && (
                <MessageInput
                  value={messageInput}
                  onChange={setMessageInput}
                  onSubmit={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  isLoading={sendMessageMutation.isPending}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}