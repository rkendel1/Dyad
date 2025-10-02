"use client";

import React, { useState } from "react";
import { FileTree } from "./file-tree";
import { FileViewer } from "./file-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import type { App } from "@/lib/dyad-client";

interface FileBrowserProps {
  app: App | null;
  isLoading: boolean;
  error: Error | null;
}

export function FileBrowser({ app, isLoading, error }: FileBrowserProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading files...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-destructive">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Error Loading Files</p>
              <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!app) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">No application selected</p>
        </CardContent>
      </Card>
    );
  }

  const files = app.files || [];

  if (files.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">No files found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Files</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex overflow-hidden p-0">
        <div className="w-1/3 border-r overflow-auto">
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <FileViewer
            appId={app.id!}
            filePath={selectedFile}
          />
        </div>
      </CardContent>
    </Card>
  );
}
