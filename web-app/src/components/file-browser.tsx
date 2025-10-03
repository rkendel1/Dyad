"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dyadApiClient } from "@/lib/api-client";
import { FileTree } from "./file-tree";
import { FileEditor } from "./file-editor";
import { Spinner } from "@/components/ui/spinner";
import { FolderOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FileBrowserProps {
  appId: number;
}

export function FileBrowser({ appId }: FileBrowserProps) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Fetch file list
  const {
    data: files,
    isLoading: filesLoading,
    error: filesError,
  } = useQuery<string[], Error>({
    queryKey: ["app-files", appId],
    queryFn: () => dyadApiClient.getAppFiles(appId),
  });

  // Fetch file content
  const {
    data: fileContent,
    isLoading: contentLoading,
    error: contentError,
  } = useQuery<string, Error>({
    queryKey: ["file-content", appId, selectedFile],
    queryFn: () => dyadApiClient.getFileContent(appId, selectedFile!),
    enabled: selectedFile !== null,
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: (content: string) =>
      dyadApiClient.updateFileContent(appId, selectedFile!, content),
    onSuccess: () => {
      // Invalidate file content query to refetch
      queryClient.invalidateQueries({
        queryKey: ["file-content", appId, selectedFile],
      });
      toast.success("File saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save file: ${error.message}`);
    },
  });

  const handleSaveFile = async (content: string) => {
    await saveFileMutation.mutateAsync(content);
  };

  if (filesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (filesError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
        <AlertCircle className="h-12 w-12" />
        <p>Error loading files: {filesError.message}</p>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
        <FolderOpen className="h-12 w-12" />
        <p>No files found in this application</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* File Tree Sidebar */}
      <div className="w-64 border-r dark:border-gray-700 overflow-auto bg-white dark:bg-gray-950">
        <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Files
          </h3>
        </div>
        <div className="p-2">
          <FileTree
            files={files}
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
        </div>
      </div>

      {/* File Editor */}
      <div className="flex-1 overflow-hidden">
        {contentLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : contentError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
            <AlertCircle className="h-12 w-12" />
            <p>Error loading file: {contentError.message}</p>
          </div>
        ) : (
          <FileEditor
            filePath={selectedFile}
            content={fileContent || ""}
            onSave={handleSaveFile}
          />
        )}
      </div>
    </div>
  );
}
