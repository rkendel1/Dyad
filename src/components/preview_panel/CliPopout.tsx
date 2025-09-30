import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Terminal, Send, History, HelpCircle, X, Minimize2, Maximize2 } from "lucide-react";
import { useAtomValue } from "jotai";
import { selectedAppIdAtom, appOutputAtom } from "@/atoms/appAtoms";
import { IpcClient } from "@/ipc/ipc_client";
import { toast } from "sonner";
import { AppOutput } from "@/ipc/ipc_types";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface CliPopoutProps {
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const CliPopout = ({ onClose, isMinimized = false, onToggleMinimize }: CliPopoutProps) => {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [localOutput, setLocalOutput] = useState<AppOutput[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const globalOutput = useAtomValue(appOutputAtom);
  const { copyMessageContent } = useCopyToClipboard();

  // Sync global output to local output
  useEffect(() => {
    setLocalOutput(globalOutput);
  }, [globalOutput]);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (outputRef.current && !isMinimized) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [localOutput, isMinimized]);

  // Focus input on mount and when maximized
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  // Handle command submission
  const handleSubmit = async () => {
    if (!command.trim() || isExecuting) return;
    
    const trimmedCommand = command.trim();
    
    // Handle built-in commands
    if (trimmedCommand === "help") {
      setShowHelp(true);
      addToHistory(trimmedCommand);
      setCommand("");
      return;
    }

    if (trimmedCommand === "clear") {
      setLocalOutput([]);
      setCommand("");
      addToHistory(trimmedCommand);
      return;
    }

    // Check if app is running
    if (!selectedAppId) {
      toast.error("No app is currently running");
      return;
    }

    try {
      setIsExecuting(true);
      
      // Send command to app's stdin
      await IpcClient.getInstance().respondToAppInput({
        appId: selectedAppId,
        response: trimmedCommand,
      });
      
      addToHistory(trimmedCommand);
      setCommand("");
    } catch (error) {
      console.error("Failed to execute command:", error);
      toast.error(`Failed to execute command: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Add command to history
  const addToHistory = (cmd: string) => {
    setCommandHistory(prev => {
      const newHistory = [cmd, ...prev.filter((h: string) => h !== cmd)];
      return newHistory.slice(0, 50); // Keep last 50 commands
    });
    setHistoryIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex] || "");
      } else {
        setHistoryIndex(-1);
        setCommand("");
      }
    } else if (e.key === "Escape") {
      setCommand("");
      setHistoryIndex(-1);
      setShowHelp(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Get message styling based on type and content
  const getMessageStyle = (output: AppOutput) => {
    const hasErrorPattern = /error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION/i.test(output.message);
    const hasWarningPattern = /warn|Warn|WARN|warning|Warning|WARNING/i.test(output.message);
    
    switch (output.type) {
      case "stderr":
        return "text-red-400 bg-red-50 dark:bg-red-950/20 border-l-2 border-red-400 pl-2";
      case "client-error":
        return "text-red-500 bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500 pl-2 font-semibold";
      case "input-requested":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500 pl-2";
      case "info":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400 pl-2";
      case "stdout":
        if (hasErrorPattern) {
          return "text-red-400 bg-red-50 dark:bg-red-950/20 border-l-2 border-red-400 pl-2";
        } else if (hasWarningPattern) {
          return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500 pl-2";
        }
        return "text-foreground";
      default:
        return "text-foreground";
    }
  };

  // Help dialog content
  const helpContent = (
    <div className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-background border border-border rounded-lg shadow-lg z-10 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <HelpCircle size={14} />
          CLI Commands Help
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHelp(false)}
          className="h-6 w-6 p-0"
        >
          ✕
        </Button>
      </div>
      <div className="space-y-2">
        <div>
          <p className="font-medium mb-1">Built-in Commands:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code className="bg-muted px-1 py-0.5 rounded">help</code> - Show this help message</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">clear</code> - Clear console output</li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-1">Keyboard Shortcuts:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">Enter</kbd> - Execute command</li>
            <li><kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">↑</kbd> / <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">↓</kbd> - Navigate command history</li>
            <li><kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">Esc</kbd> - Clear input or close help</li>
          </ul>
        </div>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-xl p-3 flex items-center gap-2">
        <Terminal size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">CLI</span>
        <span className="text-xs text-muted-foreground">
          {localOutput.length} messages
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimize}
          className="h-6 w-6 p-0"
          title="Maximize"
        >
          <Maximize2 size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
          title="Close"
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-xl flex flex-col" style={{ width: '500px', height: '600px', maxHeight: '80vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <Terminal size={16} />
          <span className="font-semibold text-sm">CLI Terminal</span>
          {selectedAppId && (
            <span className="text-xs text-muted-foreground">
              (App #{selectedAppId})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="h-6 w-6 p-0"
            title="Minimize"
          >
            <Minimize2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
            title="Close"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Output area */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-auto font-mono text-xs px-4 py-2 bg-background"
      >
        {localOutput.length === 0 ? (
          <div className="text-muted-foreground italic">
            No output yet... Run an app to see terminal output here.
          </div>
        ) : (
          localOutput.map((output, index) => (
            <div 
              key={index} 
              className={`mb-1 p-1 rounded ${getMessageStyle(output)} hover:bg-muted/50 group`}
            >
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground text-[10px] font-medium min-w-[60px] mt-0.5">
                  {formatTimestamp(output.timestamp)}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-words leading-relaxed">
                  {output.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CLI Input */}
      <div className="relative border-t border-border bg-background">
        {showHelp && helpContent}
        
        <div className="flex items-center gap-2 px-4 py-2">
          <Terminal size={16} className="text-muted-foreground" />
          
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedAppId ? "Enter command or app input..." : "No app running"}
            disabled={isExecuting}
            className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            title="Show help"
            className="h-8 w-8 p-0"
          >
            <HelpCircle size={14} />
          </Button>

          {commandHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (commandHistory.length > 0) {
                  setHistoryIndex(0);
                  setCommand(commandHistory[0]);
                }
              }}
              title={`Command history (${commandHistory.length})`}
              className="h-8 w-8 p-0"
            >
              <History size={14} />
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={!command.trim() || isExecuting}
            title="Execute command (Enter)"
            className="h-8 px-3"
          >
            {isExecuting ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send size={14} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
