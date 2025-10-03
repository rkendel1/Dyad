import { useState, useEffect } from "react";
import { IpcClient } from "@/ipc/ipc_client";
import type { UserSettings } from "@/lib/schemas";

export function PortRangeSelector() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [minPort, setMinPort] = useState<string>("");
  const [maxPort, setMaxPort] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const ipcClient = IpcClient.getInstance();
        const currentSettings = await ipcClient.getUserSettings();
        setSettings(currentSettings);
        const portRange = currentSettings.portRange || {
          min: 5174,
          max: 5274,
        };
        setMinPort(portRange.min.toString());
        setMaxPort(portRange.max.toString());
      } catch (err) {
        console.error("Failed to read settings:", err);
        setError("Failed to load settings");
      }
    };

    loadSettings();
  }, []);

  const validateAndSave = async () => {
    setError("");

    const min = parseInt(minPort, 10);
    const max = parseInt(maxPort, 10);

    // Validation
    if (isNaN(min) || isNaN(max)) {
      setError("Please enter valid port numbers");
      return;
    }

    if (min < 1000 || min > 65535 || max < 1000 || max > 65535) {
      setError("Port numbers must be between 1000 and 65535");
      return;
    }

    if (min > max) {
      setError("Minimum port must be less than or equal to maximum port");
      return;
    }

    if (max - min > 1000) {
      setError(
        "Port range should not exceed 1000 ports for performance reasons",
      );
      return;
    }

    try {
      const ipcClient = IpcClient.getInstance();
      await ipcClient.setUserSettings({ portRange: { min, max } });
      setSettings((prevSettings) => ({
        ...prevSettings!,
        portRange: { min, max },
      }));
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings");
    }
  };

  const resetToDefault = () => {
    setMinPort("5174");
    setMaxPort("5274");
    setError("");
  };

  if (!settings) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
          Port Range for Dynamic Port Allocation
        </label>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Configure the range of ports that apps can use. Apps will
          automatically find available ports within this range.
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Min:
            </label>
            <input
              type="number"
              value={minPort}
              onChange={(e) => setMinPort(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              min="1000"
              max="65535"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Max:
            </label>
            <input
              type="number"
              value={maxPort}
              onChange={(e) => setMaxPort(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              min="1000"
              max="65535"
            />
          </div>

          <button
            onClick={validateAndSave}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save
          </button>

          <button
            onClick={resetToDefault}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 mt-2">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Current range: {settings.portRange?.min || 5174} -{" "}
          {settings.portRange?.max || 5274}
          <br />
          Apps can now use any available port in this range (default: 5174-5274).
          <br />
          Note: Port 5175 is reserved for the web app and will be excluded from dynamic allocation.
        </div>
      </div>
    </div>
  );
}
