import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IpcClient } from "@/ipc/ipc_client";
import { showError, showSuccess } from "@/lib/toast";
import { useState, useEffect } from "react";
import { Folder, Pencil, Check, X, FolderOpen } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AppOutputDestinationProps {
  appId: number;
}

export function AppOutputDestination({ appId }: AppOutputDestinationProps) {
  const [appPath, setAppPath] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedPath, setEditedPath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

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
      setEditedPath(app.path);
    }
  }, [app]);

  const handleOpenFolder = async () => {
    try {
      await IpcClient.getInstance().showItemInFolder(appPath);
    } catch (error: any) {
      showError(`Failed to open folder: ${error.message}`);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPath(appPath);
  };

  const handleBrowse = async () => {
    try {
      const result = await IpcClient.getInstance().selectDirectory();
      if (result.path) {
        setEditedPath(result.path);
      }
    } catch (error: any) {
      showError(`Failed to open directory picker: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPath(appPath);
  };

  const handleSave = async () => {
    if (!editedPath.trim() || editedPath === appPath) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await IpcClient.getInstance().renameApp({
        appId,
        appName: app?.name || "",
        appPath: editedPath,
      });
      
      // Invalidate queries to refresh the app data
      await queryClient.invalidateQueries({ queryKey: ["app", appId] });
      
      setAppPath(editedPath);
      setIsEditing(false);
      showSuccess("Output destination updated successfully");
    } catch (error: any) {
      showError(`Failed to update output destination: ${error.message}`);
      setEditedPath(appPath);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Output Destination</Label>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Input
                value={editedPath}
                onChange={(e) => setEditedPath(e.target.value)}
                className="flex-1 text-sm"
                disabled={isSaving}
                autoFocus
              />
              <Button
                onClick={handleBrowse}
                disabled={isSaving}
                size="sm"
                variant="outline"
                title="Browse for directory"
              >
                <FolderOpen size={16} />
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !editedPath.trim()}
                size="sm"
                variant="outline"
                title="Save"
              >
                <Check size={16} />
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isSaving}
                size="sm"
                variant="outline"
                title="Cancel"
              >
                <X size={16} />
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300 truncate border border-gray-200 dark:border-gray-700">
                {appPath || "Loading..."}
              </div>
              <Button
                onClick={handleEdit}
                disabled={!appPath}
                size="sm"
                variant="outline"
                title="Edit path"
              >
                <Pencil size={16} />
              </Button>
              <Button
                onClick={handleOpenFolder}
                disabled={!appPath}
                size="sm"
                variant="outline"
                title="Open folder"
              >
                <Folder size={16} />
              </Button>
            </>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isEditing
            ? "Enter the path manually or click the folder icon to browse. The files will be moved to this location."
            : "The folder where your app files are stored. Click the edit icon to change the location."}
        </div>
      </div>
    </div>
  );
}
