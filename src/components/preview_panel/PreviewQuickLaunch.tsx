import { Play, Zap, GitBranch, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PreviewQuickLaunchProps {
  onRestart?: () => void;
  onCleanRestart?: () => void;
  onRefresh?: () => void;
  onOpenExternal?: () => void;
  onOpenBrowser?: () => void;
  disabled?: boolean;
}

export function PreviewQuickLaunch({
  onRestart,
  onCleanRestart,
  onRefresh,
  onOpenExternal,
  onOpenBrowser,
  disabled = false,
}: PreviewQuickLaunchProps) {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
                disabled={disabled}
                data-testid="preview-quick-launch-button"
                title="Quick actions"
              >
                <Zap size={16} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quick launch menu</p>
            <p className="text-xs text-gray-400">Common preview actions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Preview Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {onRefresh && (
          <DropdownMenuItem onClick={onRefresh}>
            <div className="flex items-center gap-2 w-full">
              <Play size={14} />
              <span>Refresh Preview</span>
            </div>
          </DropdownMenuItem>
        )}

        {onRestart && (
          <DropdownMenuItem onClick={onRestart}>
            <div className="flex items-center gap-2 w-full">
              <GitBranch size={14} />
              <span>Restart App</span>
            </div>
          </DropdownMenuItem>
        )}

        {onCleanRestart && (
          <DropdownMenuItem onClick={onCleanRestart}>
            <div className="flex items-center gap-2 w-full">
              <Package size={14} />
              <span>Clean Restart</span>
              <span className="text-xs text-gray-400 ml-auto">
                (Remove node_modules)
              </span>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Open In...</DropdownMenuLabel>

        {onOpenExternal && (
          <DropdownMenuItem onClick={onOpenExternal}>
            <div className="flex items-center gap-2 w-full">
              <span>External Window</span>
              <span className="text-xs text-gray-400 ml-auto">⌘⇧E</span>
            </div>
          </DropdownMenuItem>
        )}

        {onOpenBrowser && (
          <DropdownMenuItem onClick={onOpenBrowser}>
            <div className="flex items-center gap-2 w-full">
              <span>Default Browser</span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
