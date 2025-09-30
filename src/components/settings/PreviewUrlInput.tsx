import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { showSuccess, showError } from "@/lib/toast";

export function PreviewUrlInput() {
  const { settings, updateSettings } = useSettings();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (settings?.previewUrl) {
      setUrl(settings.previewUrl);
    }
  }, [settings?.previewUrl]);

  const validateUrl = (value: string): boolean => {
    if (!value) {
      return true; // Empty is valid - means use default
    }

    try {
      const parsed = new URL(value);
      // Allow http and https protocols
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setError("URL must use http:// or https:// protocol");
        return false;
      }
      setError("");
      return true;
    } catch {
      setError("Invalid URL format");
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateUrl(url)) {
      return;
    }

    try {
      await updateSettings({ previewUrl: url || undefined });
      showSuccess("Preview URL updated successfully");
    } catch (error: any) {
      showError(`Failed to update preview URL: ${error.message}`);
    }
  };

  const handleReset = () => {
    setUrl("");
    setError("");
  };

  if (!settings) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-sm font-medium" htmlFor="preview-url-input">
          Preview URL
        </Label>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Set a custom URL for the preview panel. If not set, Dyad will use the
          automatically detected local development server URL.
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="preview-url-input"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              validateUrl(e.target.value);
            }}
            placeholder="e.g., http://localhost:3000"
            className="flex-1 max-w-md"
          />
          <Button
            onClick={handleSave}
            size="sm"
            className="px-4"
            disabled={!!error}
          >
            Save
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="px-4"
          >
            Reset
          </Button>
        </div>
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
            {error}
          </div>
        )}
        {settings.previewUrl && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Current: {settings.previewUrl}
          </div>
        )}
      </div>
    </div>
  );
}
