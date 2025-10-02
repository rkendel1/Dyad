"use client";

import React from "react";
import { AlertCircle, Bot, Loader2, MessageSquare, CheckCircle, XCircle, GitCommit, RotateCcw } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/lib/dyad-client";

interface MessagesDisplayProps {
  messages: Message[] | undefined;
  selectedChatId: number | null;
  isLoading: boolean;
  error: Error | null;
  isAssistantTyping: boolean;
  chatContentRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function MessagesDisplay({
  messages,
  selectedChatId,
  isLoading,
  error,
  isAssistantTyping,
  chatContentRef,
  messagesEndRef,
  onRetry,
  isRetrying = false,
}: MessagesDisplayProps) {
  if (!selectedChatId) {
    return (
      <CardContent className="flex-1 overflow-y-auto p-4" ref={chatContentRef}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a chat to view messages</p>
          </div>
        </div>
      </CardContent>
    );
  }

  if (isLoading) {
    return (
      <CardContent className="flex-1 overflow-y-auto p-4" ref={chatContentRef}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CardContent>
    );
  }

  if (error) {
    return (
      <CardContent className="flex-1 overflow-y-auto p-4" ref={chatContentRef}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load messages</p>
          </div>
        </div>
      </CardContent>
    );
  }

  // Find the last user message for retry functionality
  const lastUserMessage = messages && messages.length > 0 
    ? [...messages].reverse().find(m => m.role === "user")
    : null;

  return (
    <CardContent
      className="flex-1 overflow-y-auto p-4"
      ref={chatContentRef}
    >
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages && messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages && messages.map((message) => (
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
                  
                  {/* Show approval state and commit info for assistant messages */}
                  {message.approvalState && (
                    <div className="mt-3 pt-2 border-t border-border/40 flex items-center gap-2 text-xs">
                      {message.approvalState === "approved" ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <span className="text-green-600 dark:text-green-400">Approved</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                          <span className="text-red-600 dark:text-red-400">Rejected</span>
                        </>
                      )}
                      {message.commitHash && (
                        <>
                          <span className="mx-1">·</span>
                          <GitCommit className="h-3 w-3" />
                          <span className="font-mono opacity-70">
                            {message.commitHash.substring(0, 7)}
                          </span>
                        </>
                      )}
                    </div>
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
        
        {/* Retry button - shown if there are messages and a retry handler */}
        {lastUserMessage && onRetry && !isAssistantTyping && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Retry Last Message
                </>
              )}
            </Button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </CardContent>
  );
}
