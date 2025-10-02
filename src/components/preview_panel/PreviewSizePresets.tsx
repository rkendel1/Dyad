import { useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  ChevronDown,
} from "lucide-react";
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

export interface PreviewSize {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const PRESET_SIZES: PreviewSize[] = [
  {
    name: "Mobile (375x667)",
    width: 375,
    height: 667,
    icon: <Smartphone size={14} />,
  },
  {
    name: "Mobile L (414x896)",
    width: 414,
    height: 896,
    icon: <Smartphone size={14} />,
  },
  {
    name: "Tablet (768x1024)",
    width: 768,
    height: 1024,
    icon: <Tablet size={14} />,
  },
  {
    name: "Desktop (1366x768)",
    width: 1366,
    height: 768,
    icon: <Monitor size={14} />,
  },
  {
    name: "Desktop L (1920x1080)",
    width: 1920,
    height: 1080,
    icon: <Monitor size={14} />,
  },
];

interface PreviewSizePresetsProps {
  onSizeChange?: (width: number, height: number) => void;
  disabled?: boolean;
}

export function PreviewSizePresets({
  onSizeChange,
  disabled = false,
}: PreviewSizePresetsProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleSizeSelect = (preset: PreviewSize) => {
    setSelectedPreset(preset.name);
    onSizeChange?.(preset.width, preset.height);
  };

  const handleFullSize = () => {
    setSelectedPreset("Full");
    // Full size - let parent handle this (likely setting to 100% or removing constraints)
    onSizeChange?.(-1, -1);
  };

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 text-xs"
                disabled={disabled}
                data-testid="preview-size-presets-button"
              >
                <Maximize2 size={14} />
                <span className="hidden sm:inline">
                  {selectedPreset || "Size"}
                </span>
                <ChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Preview size presets</p>
            <p className="text-xs text-gray-400">
              Test responsive layouts at common device sizes
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleFullSize}>
          <div className="flex items-center gap-2 w-full">
            <Maximize2 size={14} />
            <span>Full Size</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {PRESET_SIZES.map((preset) => (
          <DropdownMenuItem
            key={preset.name}
            onClick={() => handleSizeSelect(preset)}
          >
            <div className="flex items-center gap-2 w-full">
              {preset.icon}
              <span>{preset.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
