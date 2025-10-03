import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCountTokens } from "@/hooks/useCountTokens";
import {
  MessageSquare,
  Code,
  Bot,
  AlignLeft,
  ExternalLink,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { chatInputValueAtom } from "@/atoms/chatAtoms";
import { useAtom } from "jotai";
import { useSettings } from "@/hooks/useSettings";
import { IpcClient } from "@/ipc/ipc_client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TokenBarProps {
  chatId?: number;
}

export function TokenBar({ chatId }: TokenBarProps) {
  const [inputValue] = useAtom(chatInputValueAtom);
  const { countTokens, result } = useCountTokens();
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();
  useEffect(() => {
    if (!chatId) return;
    // Mark this as used, we need to re-trigger token count
    // when selected model changes.
    void settings?.selectedModel;

    const debounceTimer = setTimeout(() => {
      countTokens(chatId, inputValue).catch((err) => {
        setError("Failed to count tokens");
        console.error("Token counting error:", err);
      });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [chatId, inputValue, countTokens, settings?.selectedModel]);

  if (!chatId || !result) {
    return null;
  }

  const {
    totalTokens,
    messageHistoryTokens,
    codebaseTokens,
    mentionedAppsTokens,
    systemPromptTokens,
    inputTokens,
    contextWindow,
  } = result;

  const percentUsed = Math.min((totalTokens / contextWindow) * 100, 100);
  const isNearLimit = percentUsed > 80;

  // Calculate widths for each token type
  const messageHistoryPercent = (messageHistoryTokens / contextWindow) * 100;
  const codebasePercent = (codebaseTokens / contextWindow) * 100;
  const mentionedAppsPercent = (mentionedAppsTokens / contextWindow) * 100;
  const systemPromptPercent = (systemPromptTokens / contextWindow) * 100;
  const inputPercent = (inputTokens / contextWindow) * 100;

  const handleClearHistory = async () => {
    if (!chatId) return;
    try {
      await IpcClient.getInstance().deleteMessages(chatId);
      window.location.reload(); // Refresh to show cleared state
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  return (
    <div className="px-4 pb-2 text-xs">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                <span>Tokens: {totalTokens.toLocaleString()}</span>
                <span>
                  {Math.round(percentUsed)}% of{" "}
                  {(contextWindow / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
                {/* Message history tokens */}
                <div
                  className="h-full bg-blue-400"
                  style={{ width: `${messageHistoryPercent}%` }}
                />
                {/* Codebase tokens */}
                <div
                  className="h-full bg-green-400"
                  style={{ width: `${codebasePercent}%` }}
                />
                {/* Mentioned apps tokens */}
                <div
                  className="h-full bg-orange-400"
                  style={{ width: `${mentionedAppsPercent}%` }}
                />
                {/* System prompt tokens */}
                <div
                  className="h-full bg-purple-400"
                  style={{ width: `${systemPromptPercent}%` }}
                />
                {/* Input tokens */}
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${inputPercent}%` }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="w-80 p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Token Usage Breakdown</div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          IpcClient.getInstance().openExternalUrl(
                            "https://www.dyad.sh/docs/guides/token-usage",
                          )
                        }
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <HelpCircle size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Learn about token usage
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-[20px_1fr_auto] gap-x-2 items-center text-sm">
                <MessageSquare size={12} className="text-blue-500" />
                <span>Message History</span>
                <span>{messageHistoryTokens.toLocaleString()}</span>

                <Code size={12} className="text-green-500" />
                <span>Codebase</span>
                <span>{codebaseTokens.toLocaleString()}</span>

                <ExternalLink size={12} className="text-orange-500" />
                <span>Mentioned Apps</span>
                <span>{mentionedAppsTokens.toLocaleString()}</span>

                <Bot size={12} className="text-purple-500" />
                <span>System Prompt</span>
                <span>{systemPromptTokens.toLocaleString()}</span>

                <AlignLeft size={12} className="text-yellow-500" />
                <span>Current Input</span>
                <span>{inputTokens.toLocaleString()}</span>
              </div>
              <div className="pt-1 border-t border-border">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{totalTokens.toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                <p className="mb-1">
                  <strong>Note:</strong> Token usage is calculated per chat session, not
                  cumulatively.
                </p>
                <p>
                  To reduce usage: start a new chat, clear history, minimize codebase
                  context, or reduce message history.
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Warning when approaching token limit */}
      {isNearLimit && (
        <Alert className="mt-2 py-2">
          <AlertDescription className="text-xs">
            ⚠️ Token usage is high ({Math.round(percentUsed)}%). Consider:{" "}
            <button
              onClick={handleClearHistory}
              className="text-blue-500 hover:underline font-medium"
            >
              clearing chat history
            </button>
            , starting a new chat, or reducing codebase context.
          </AlertDescription>
        </Alert>
      )}

      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      {(!settings?.enableProSmartFilesContextMode ||
        !settings?.enableDyadPro) && (
        <div className="text-xs text-center text-muted-foreground mt-2">
          Optimize your tokens with{" "}
          <a
            onClick={() =>
              settings?.enableDyadPro
                ? IpcClient.getInstance().openExternalUrl(
                    "https://www.dyad.sh/docs/guides/ai-models/pro-modes#smart-context",
                  )
                : IpcClient.getInstance().openExternalUrl(
                    "https://dyad.sh/pro#ai",
                  )
            }
            className="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline"
          >
            Dyad Pro's Smart Context
          </a>
        </div>
      )}
    </div>
  );
}
