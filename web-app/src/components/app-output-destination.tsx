"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { dyadClient } from "@/lib/dyad-client";
import { useQueryClient } from "@tanstack/react-query";

interface AppOutputDestinationProps {
  appId: number;
  currentPath: string;
}

export function AppOutputDestination({
  appId,
  currentPath,
}: AppOutputDestinationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPath, setEditedPath] = useState(currentPath);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setEditedPath(currentPath);
  }, [currentPath]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPath(currentPath);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPath(currentPath);
  };

  const handleSave = async () => {
    if (!editedPath.trim() || editedPath === currentPath) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await dyadClient.apps.updateAppPath(appId, editedPath);

      // Invalidate queries to refresh the app data
      await queryClient.invalidateQueries({ queryKey: ["app", appId] });

      setIsEditing(false);
      toast.success("Output destination updated successfully");
    } catch (error: any) {
      toast.error(`Failed to update output destination: ${error.message}`);
      setEditedPath(currentPath);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2 p-4 border rounded-lg bg-card">
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
              onClick={handleSave}
              disabled={isSaving || !editedPath.trim()}
              size="sm"
              variant="outline"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isSaving}
              size="sm"
              variant="outline"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm truncate border">
              {currentPath}
            </div>
            <Button
              onClick={handleEdit}
              size="sm"
              variant="outline"
              title="Edit path"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {isEditing
          ? "Enter the new path for your app files. The database will be updated with this location."
          : "The folder where your app files are stored. Click the edit icon to change the location."}
      </p>
    </div>
  );
}
