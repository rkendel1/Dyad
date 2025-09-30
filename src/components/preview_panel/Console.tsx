import { appOutputAtom, clearAppOutputAtom } from "@/atoms/appAtoms";
import { useAtomValue, useSetAtom } from "jotai";
import { useState, useMemo, useRef, useEffect } from "react";
import { Copy, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import type { AppOutput } from "@/ipc/ipc_types";

// Enhanced Console component
export const Console = () => {
  const appOutput = useAtomValue(appOutputAtom);
  const clearAppOutput = useSetAtom(clearAppOutputAtom);
  const [filter, setFilter] = useState<"all" | "stdout" | "stderr" | "errors">("all");
  const { copyMessageContent, copied } = useCopyToClipboard();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [appOutput]);

  // Filter messages based on selected filter
  const filteredOutput = useMemo(() => {
    switch (filter) {
      case "stdout":
        return appOutput.filter(output => output.type === "stdout");
      case "stderr":
        return appOutput.filter(output => output.type === "stderr");
      case "errors":
        return appOutput.filter(output => 
          output.type === "stderr" || 
          output.type === "client-error" ||
          output.message.toLowerCase().includes("error")
        );
      default:
        return appOutput;
    }
  }, [appOutput, filter]);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Get message styling based on type
  const getMessageStyle = (output: AppOutput) => {
    switch (output.type) {
      case "stderr":
        return "text-red-400 bg-red-50 dark:bg-red-950/20 border-l-2 border-red-400 pl-2";
      case "client-error":
        return "text-red-500 bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500 pl-2 font-semibold";
      case "input-requested":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500 pl-2";
      case "info":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400 pl-2";
      default:
        return "text-foreground";
    }
  };

  // Handle copy all logs
  const handleCopyAll = async () => {
    const allLogs = filteredOutput
      .map(output => `[${formatTimestamp(output.timestamp)}] [${output.type.toUpperCase()}] ${output.message}`)
      .join('\n');
    await copyMessageContent(allLogs);
  };

  // Handle export logs
  const handleExportLogs = () => {
    const allLogs = filteredOutput
      .map(output => `[${formatTimestamp(output.timestamp)}] [${output.type.toUpperCase()}] ${output.message}`)
      .join('\n');
    
    const blob = new Blob([allLogs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dyad-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle clear logs
  const handleClearLogs = () => {
    clearAppOutput();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Console toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-muted" : ""}
          >
            All ({appOutput.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter("stdout")}
            className={filter === "stdout" ? "bg-muted" : ""}
          >
            Output ({appOutput.filter(o => o.type === "stdout").length})
          </Button>
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => setFilter("stderr")}
            className={filter === "stderr" ? "bg-muted" : ""}
          >
            Errors ({appOutput.filter(o => o.type === "stderr").length})
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAll}
            disabled={filteredOutput.length === 0}
            title={copied ? "Copied!" : "Copy all logs"}
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm" 
            onClick={handleExportLogs}
            disabled={filteredOutput.length === 0}
            title="Export logs to file"
          >
            <Download size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearLogs}
            disabled={filteredOutput.length === 0}
            title="Clear logs"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Console output */}
      <div 
        ref={scrollRef}
        className="font-mono text-xs px-4 py-2 h-full overflow-auto bg-background"
      >
        {filteredOutput.length === 0 ? (
          <div className="text-muted-foreground italic">
            {filter === "all" ? "No output yet..." : `No ${filter} messages...`}
          </div>
        ) : (
          filteredOutput.map((output, index) => (
            <div 
              key={index} 
              className={`mb-1 p-1 rounded ${getMessageStyle(output)} hover:bg-muted/50 group`}
            >
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground text-[10px] font-medium min-w-[60px] mt-0.5">
                  {formatTimestamp(output.timestamp)}
                </span>
                <span className="text-[10px] font-semibold min-w-[50px] mt-0.5 uppercase">
                  [{output.type}]
                </span>
                <span className="flex-1 whitespace-pre-wrap break-words leading-relaxed">
                  {output.message}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={() => copyMessageContent(`[${formatTimestamp(output.timestamp)}] [${output.type.toUpperCase()}] ${output.message}`)}
                  title="Copy this log entry"
                >
                  <Copy size={10} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
