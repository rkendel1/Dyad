import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IpcClient } from "@/ipc/ipc_client";
import { showError, showSuccess } from "@/lib/toast";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AppCommandInputProps {
  appId: number;
}

export function AppCommandInput({ appId }: AppCommandInputProps) {
  const [installCommand, setInstallCommand] = useState("");
  const [startCommand, setStartCommand] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await IpcClient.getInstance().getAppSettings(appId);
        setInstallCommand(settings.installCommand || "");
        setStartCommand(settings.startCommand || "");
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

      // Validate that both commands are provided or both are empty
      const hasInstall = installCommand.trim().length > 0;
      const hasStart = startCommand.trim().length > 0;

      if (hasInstall !== hasStart) {
        showError("Both install and start commands must be provided together");
        return;
      }

      await IpcClient.getInstance().updateAppSettings({
        appId,
        settings: {
          installCommand: installCommand.trim() || null,
          startCommand: startCommand.trim() || null,
        },
      });

      showSuccess(
        installCommand.trim() && startCommand.trim()
          ? "Commands updated"
          : "Commands cleared",
      );
    } catch (error: any) {
      showError(`Failed to update commands: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      setSaving(true);
      setInstallCommand("");
      setStartCommand("");
      await IpcClient.getInstance().updateAppSettings({
        appId,
        settings: {
          installCommand: null,
          startCommand: null,
        },
      });
      showSuccess("Commands cleared");
    } catch (error: any) {
      showError(`Failed to clear commands: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const hasCommands = installCommand.trim() || startCommand.trim();

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium" htmlFor="app-install-command">
          Install Command
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            id="app-install-command"
            type="text"
            value={installCommand}
            onChange={(e) => setInstallCommand(e.target.value)}
            placeholder="npm install"
            disabled={loading || saving}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium" htmlFor="app-start-command">
          Start Command
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            id="app-start-command"
            type="text"
            value={startCommand}
            onChange={(e) => setStartCommand(e.target.value)}
            placeholder="npm run dev"
            disabled={loading || saving}
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button onClick={handleSave} disabled={loading || saving} size="sm">
          {saving ? "Saving..." : "Save"}
        </Button>
        {hasCommands && (
          <Button
            onClick={handleClear}
            disabled={loading || saving}
            size="sm"
            variant="ghost"
            title="Clear commands"
          >
            <X size={16} />
            Clear
          </Button>
        )}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Set custom install and start commands for this app. If not set, Dyad
        will use npm commands. Both commands must be provided together.
      </div>
    </div>
  );
}
