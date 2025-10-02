import { Camera } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { showSuccess, showError } from "@/lib/toast";

interface PreviewScreenshotButtonProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  disabled?: boolean;
  appId?: number | null;
}

export function PreviewScreenshotButton({
  iframeRef,
  disabled = false,
  appId,
}: PreviewScreenshotButtonProps) {
  const handleScreenshot = async () => {
    try {
      if (!iframeRef.current) {
        showError("Preview not ready for screenshot");
        return;
      }

      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) {
        showError("Cannot access preview content");
        return;
      }

      // Use html2canvas or similar if available, otherwise try the Clipboard API
      // For now, we'll use the browser's built-in screenshot via canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        showError("Canvas not supported");
        return;
      }

      // Get the iframe dimensions
      const rect = iframe.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Try to capture using the Clipboard API if available
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          // Create a blob from the iframe
          const blob = await new Promise<Blob>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Failed to create blob"));
                }
              }, "image/png");
            };
            img.onerror = reject;
            img.src = iframe.src || "";
          });

          // Copy to clipboard
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          showSuccess("Screenshot copied to clipboard");
          return;
        } catch (clipboardError) {
          console.warn("Clipboard API failed, trying download:", clipboardError);
        }
      }

      // Fallback: Download as file
      canvas.toBlob((blob) => {
        if (!blob) {
          showError("Failed to create screenshot");
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `preview-${appId || "app"}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccess("Screenshot downloaded");
      }, "image/png");
    } catch (error) {
      console.error("Screenshot error:", error);
      showError(
        "Screenshot failed. Try using your browser's built-in screenshot feature.",
      );
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleScreenshot}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
            disabled={disabled}
            data-testid="preview-screenshot-button"
            title="Take screenshot"
          >
            <Camera size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Take screenshot</p>
          <p className="text-xs text-gray-400">
            Capture current preview state
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
