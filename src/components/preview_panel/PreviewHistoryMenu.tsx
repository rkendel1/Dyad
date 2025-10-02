import { History, Clock, Trash2 } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  previewHistoryAtom,
  clearPreviewHistoryAtom,
} from "@/atoms/previewHistoryAtoms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PreviewHistoryMenuProps {
  appId: number | null;
  onNavigate: (url: string) => void;
  disabled?: boolean;
}

export function PreviewHistoryMenu({
  appId,
  onNavigate,
  disabled = false,
}: PreviewHistoryMenuProps) {
  const history = useAtomValue(previewHistoryAtom);
  const clearHistory = useSetAtom(clearPreviewHistoryAtom);

  // Filter history for current app
  const appHistory = appId
    ? history.filter((item) => item.appId === appId).slice(0, 10)
    : [];

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Show path and query if present, otherwise just the host
      const path = urlObj.pathname + urlObj.search;
      return path && path !== "/" ? path : urlObj.host;
    } catch {
      return url;
    }
  };

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
                disabled={disabled || appHistory.length === 0}
                data-testid="preview-history-button"
                title="Preview history"
              >
                <History size={16} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Preview history</p>
            <p className="text-xs text-gray-400">
              Recent URLs for this app ({appHistory.length})
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-72">
        {appHistory.length === 0 ? (
          <DropdownMenuItem disabled>
            <span className="text-gray-500">No history</span>
          </DropdownMenuItem>
        ) : (
          <>
            {appHistory.map((item, index) => (
              <DropdownMenuItem
                key={`${item.url}-${index}`}
                onClick={() => onNavigate(item.url)}
                className="flex flex-col items-start gap-1 py-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <Clock size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-mono truncate flex-1">
                    {getDisplayUrl(item.url)}
                  </span>
                </div>
                <span className="text-xs text-gray-400 ml-5">
                  {formatTimestamp(item.timestamp)}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                clearHistory();
              }}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 size={14} className="mr-2" />
              Clear history
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
