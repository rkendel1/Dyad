import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IpcClient } from "@/ipc/ipc_client";
import { showError, showSuccess } from "@/lib/toast";
import { useState, useEffect } from "react";

interface AppPackageManagerSelectorProps {
  appId: number;
}

export function AppPackageManagerSelector({
  appId,
}: AppPackageManagerSelectorProps) {
  const [packageManager, setPackageManager] = useState<
    "npm" | "yarn" | "pnpm" | "bun" | "auto"
  >("auto");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await IpcClient.getInstance().getAppSettings(appId);
        setPackageManager(settings.preferredPackageManager || "auto");
      } catch (error: any) {
        console.error("Failed to load app settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [appId]);

  const handlePackageManagerChange = async (
    value: "npm" | "yarn" | "pnpm" | "bun" | "auto",
  ) => {
    try {
      setLoading(true);
      await IpcClient.getInstance().updateAppSettings({
        appId,
        settings: {
          preferredPackageManager: value === "auto" ? null : value,
        },
      });
      setPackageManager(value);
      showSuccess(
        `Package manager updated to ${value === "auto" ? "auto-detect" : value}`,
      );
    } catch (error: any) {
      showError(`Failed to update package manager: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Label
            className="text-sm font-medium"
            htmlFor="app-package-manager-select"
          >
            Package Manager
          </Label>
          <Select
            value={packageManager}
            onValueChange={handlePackageManagerChange}
            disabled={loading}
          >
            <SelectTrigger className="w-48" id="app-package-manager-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="npm">npm</SelectItem>
              <SelectItem value="yarn">yarn</SelectItem>
              <SelectItem value="pnpm">pnpm</SelectItem>
              <SelectItem value="bun">bun</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Override the package manager for this app. If set to auto-detect, Dyad
          will use the global setting or detect based on lock files.
        </div>
      </div>
    </div>
  );
}
