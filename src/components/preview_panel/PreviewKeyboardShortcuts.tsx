import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const PREVIEW_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ["⌘/Ctrl", "⇧", "C"],
    description: "Toggle component selector",
    category: "Selection",
  },
  {
    keys: ["⌘/Ctrl", "⇧", "E"],
    description: "Open in external window",
    category: "Navigation",
  },
  {
    keys: ["⌘/Ctrl", "R"],
    description: "Refresh preview",
    category: "Navigation",
  },
  {
    keys: ["Esc"],
    description: "Cancel URL edit or deselect component",
    category: "General",
  },
];

export function PreviewKeyboardShortcuts() {
  const groupedShortcuts = PREVIEW_SHORTCUTS.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>,
  );

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                data-testid="preview-keyboard-shortcuts-button"
                title="Keyboard shortcuts"
              >
                <Keyboard size={16} />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Keyboard shortcuts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-200">
          <p className="font-semibold mb-1">Tip:</p>
          <p>
            Use keyboard shortcuts to speed up your workflow. Most shortcuts
            work when the preview is focused.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
