"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";
import type { Chat } from "@/lib/dyad-client";

interface ChatSidebarProps {
  chats: Chat[] | undefined;
  selectedChatId: number | null;
  isLoading: boolean;
  error: Error | null;
  onSelectChat: (chatId: number) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: number) => void;
  isCreating: boolean;
}

export function ChatSidebar({
  chats,
  selectedChatId,
  isLoading,
  error,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  isCreating,
}: ChatSidebarProps) {
  return (
    <Card className="h-full bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chats</CardTitle>
          <Button
            size="sm"
            onClick={onCreateChat}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
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
                onClick={() => onSelectChat(chat.id)}
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
                      onDeleteChat(chat.id);
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
  );
}
