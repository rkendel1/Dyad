import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IpcClient } from "@/ipc/ipc_client";
import { showError, showSuccess } from "@/lib/toast";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AppPreviewUrlInputProps {
  appId: number;
}

export function AppPreviewUrlInput({ appId }: AppPreviewUrlInputProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await IpcClient.getInstance().getAppSettings(appId);
        setPreviewUrl(settings.previewUrl || "");
      } catch (error: any) {
        console.error("Failed to load app settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [appId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate URL if provided
      if (previewUrl && previewUrl.trim()) {
        try {
          new URL(previewUrl.trim());
        } catch {
          showError("Please enter a valid URL (e.g., http://localhost:3000)");
          return;
        }
      }

      await IpcClient.getInstance().updateAppSettings({
        appId,
        settings: {
          previewUrl: previewUrl.trim() || null,
        },
      });
      
      showSuccess(previewUrl.trim() ? "Preview URL updated" : "Preview URL cleared");
    } catch (error: any) {
      showError(`Failed to update preview URL: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      setSaving(true);
      setPreviewUrl("");
      await IpcClient.getInstance().updateAppSettings({
        appId,
        settings: {
          previewUrl: null,
        },
      });
      showSuccess("Preview URL cleared");
    } catch (error: any) {
      showError(`Failed to clear preview URL: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-sm font-medium" htmlFor="app-preview-url">
          Preview URL
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            id="app-preview-url"
            type="text"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="http://localhost:3000"
            disabled={loading || saving}
            className="flex-1"
          />
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            size="sm"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          {previewUrl && (
            <Button
              onClick={handleClear}
              disabled={loading || saving}
              size="sm"
              variant="ghost"
              title="Clear preview URL"
            >
              <X size={16} />
            </Button>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Override the preview URL for this app. If not set, Dyad will use the global setting or auto-detect the URL.
        </div>
      </div>
    </div>
  );
}
