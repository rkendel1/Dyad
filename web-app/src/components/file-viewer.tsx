"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dyadClient } from "@/lib/dyad-client";
import { Button } from "./ui/button";
import { Loader2, Save, AlertCircle, FileText } from "lucide-react";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

interface FileViewerProps {
  appId: number;
  filePath: string | null;
}

// Get language from file extension
function getLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    md: "markdown",
    py: "python",
    sh: "shell",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    sql: "sql",
    go: "go",
    rs: "rust",
    java: "java",
    cpp: "cpp",
    c: "c",
    txt: "plaintext",
  };
  return languageMap[ext || ""] || "plaintext";
}

export function FileViewer({ appId, filePath }: FileViewerProps) {
  const [editorContent, setEditorContent] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  // Fetch file content
  const {
    data: fileContent,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["file-content", appId, filePath],
    queryFn: () => dyadClient.apps.getFileContent(appId, filePath!),
    enabled: filePath !== null,
  });

  // Update file mutation
  const updateFileMutation = useMutation({
    mutationFn: (content: string) =>
      dyadClient.apps.updateFileContent(appId, filePath!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["file-content", appId, filePath],
      });
      setHasChanges(false);
    },
  });

  // Update editor content when file content loads
  useEffect(() => {
    if (fileContent !== undefined) {
      setEditorContent(fileContent);
      setHasChanges(false);
    }
  }, [fileContent]);

  // Reset when file path changes
  useEffect(() => {
    setHasChanges(false);
  }, [filePath]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      setHasChanges(value !== fileContent);
    }
  };

  const handleSave = () => {
    if (filePath && hasChanges) {
      updateFileMutation.mutate(editorContent);
    }
  };

  if (!filePath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          Select a file to view its contents
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <p className="text-sm font-semibold text-destructive mb-2">
          Error Loading File
        </p>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono">{filePath}</span>
          {hasChanges && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">
              Modified
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || updateFileMutation.isPending}
        >
          {updateFileMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getLanguage(filePath)}
          value={editorContent}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            fontSize: 13,
            lineNumbers: "on",
            readOnly: false,
          }}
        />
      </div>
    </div>
  );
}
