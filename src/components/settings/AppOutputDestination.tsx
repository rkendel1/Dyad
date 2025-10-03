import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IpcClient } from "@/ipc/ipc_client";
import { showError } from "@/lib/toast";
import { useState, useEffect } from "react";
import { Folder } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AppOutputDestinationProps {
  appId: number;
}

export function AppOutputDestination({ appId }: AppOutputDestinationProps) {
  const [appPath, setAppPath] = useState("");

  const { data: app } = useQuery({
    queryKey: ["app", appId],
    queryFn: async () => {
      return await IpcClient.getInstance().getApp(appId);
    },
    enabled: !!appId,
  });

  useEffect(() => {
    if (app?.path) {
      setAppPath(app.path);
    }
  }, [app]);

  const handleOpenFolder = async () => {
    try {
      await IpcClient.getInstance().showItemInFolder(appPath);
    } catch (error: any) {
      showError(`Failed to open folder: ${error.message}`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Output Destination</Label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300 truncate border border-gray-200 dark:border-gray-700">
            {appPath || "Loading..."}
          </div>
          <Button
            onClick={handleOpenFolder}
            disabled={!appPath}
            size="sm"
            variant="outline"
            title="Open folder"
          >
            <Folder size={16} />
          </Button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          The folder where your app files are stored. Click the folder icon to
          open it in your file manager.
        </div>
      </div>
    </div>
  );
}
