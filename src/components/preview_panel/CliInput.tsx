import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Terminal, Send, History, HelpCircle } from "lucide-react";
import { useAtomValue, useAtom } from "jotai";
import { selectedAppIdAtom, cliInputTextAtom } from "@/atoms/appAtoms";
import { IpcClient } from "@/ipc/ipc_client";
import { toast } from "sonner";

interface CliInputProps {
  onCommandExecute?: (command: string) => void;
}

export const CliInput = ({ onCommandExecute }: CliInputProps) => {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const [cliInputText, setCliInputText] = useAtom(cliInputTextAtom);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Insert text from selector into CLI input
  useEffect(() => {
    if (cliInputText) {
      setCommand(cliInputText);
      setCliInputText(null); // Clear after insertion
      inputRef.current?.focus();
    }
  }, [cliInputText, setCliInputText]);

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
      setCommand("");
      addToHistory(trimmedCommand);
      // Clear is handled by parent component
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

      if (onCommandExecute) {
        onCommandExecute(trimmedCommand);
      }
    } catch (error) {
      console.error("Failed to execute command:", error);
      toast.error(
        `Failed to execute command: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsExecuting(false);
    }
  };

  // Add command to history
  const addToHistory = (cmd: string) => {
    setCommandHistory((prev) => {
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
            <li>
              <code className="bg-muted px-1 py-0.5 rounded">help</code> - Show
              this help message
            </li>
            <li>
              <code className="bg-muted px-1 py-0.5 rounded">clear</code> -
              Clear console output
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-1">Keyboard Shortcuts:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">
                Enter
              </kbd>{" "}
              - Execute command
            </li>
            <li>
              <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">↑</kbd>{" "}
              /{" "}
              <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">↓</kbd>{" "}
              - Navigate command history
            </li>
            <li>
              <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">
                Esc
              </kbd>{" "}
              - Clear input or close help
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-1">App Input:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Send text input directly to running app's stdin</li>
            <li>Useful for interactive CLI tools and prompts</li>
            <li>App must be running to send commands</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
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
          placeholder={
            selectedAppId
              ? "Enter command or app input..."
              : "No app running - start an app to send commands"
          }
          disabled={isExecuting}
          className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          title="Show help (help)"
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
            title={`Command history (${commandHistory.length} commands)`}
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
  );
};
