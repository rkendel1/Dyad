"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, FileEdit, FileX } from "lucide-react";

interface FileChange {
  name: string;
  path?: string;
  summary?: string;
  type: "write" | "rename" | "delete";
  isServerFunction?: boolean;
}

interface FileDiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileChange | null;
}

export function FileDiffViewer({ open, onOpenChange, file }: FileDiffViewerProps) {
  if (!file) return null;

  const getFileIcon = (type: string) => {
    switch (type) {
      case "write":
        return <FileEdit className="h-4 w-4" />;
      case "delete":
        return <FileX className="h-4 w-4" />;
      case "rename":
        return <FileEdit className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "write":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "delete":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "rename":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon(file.type)}
            {file.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge className={getTypeBadgeColor(file.type)}>
              {file.type}
            </Badge>
            {file.path && (
              <span className="text-xs font-mono text-muted-foreground">
                {file.path}
              </span>
            )}
            {file.isServerFunction && (
              <Badge variant="outline" className="text-xs">
                Server Function
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          {file.summary && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Summary</p>
              <p className="text-sm text-muted-foreground">{file.summary}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {file.type === "delete" && "This file will be deleted."}
              {file.type === "rename" && "This file will be renamed."}
              {file.type === "write" && "This file will be created or modified."}
            </p>

            {/* Future enhancement: Show actual file diff here */}
            <div className="mt-4 p-4 bg-muted/50 rounded-md border border-dashed">
              <p className="text-xs text-muted-foreground text-center">
                Diff preview coming soon. The full file changes will be applied when you accept the proposal.
              </p>
            </div>

            {/* Placeholder for future diff display */}
            {/* <DiffView before={beforeContent} after={afterContent} /> */}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
