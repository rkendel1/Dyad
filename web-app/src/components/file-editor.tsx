"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface FileEditorProps {
  filePath: string | null;
  content: string;
  onSave: (content: string) => Promise<void>;
  readOnly?: boolean;
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
    java: "java",
    go: "go",
    rs: "rust",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    sql: "sql",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    sh: "shell",
    bash: "shell",
  };
  return languageMap[ext || ""] || "plaintext";
}

export function FileEditor({
  filePath,
  content,
  onSave,
  readOnly = false,
}: FileEditorProps) {
  const [value, setValue] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<any>(null);

  // Update value when content prop changes
  useEffect(() => {
    setValue(content);
    setHasUnsavedChanges(false);
  }, [content]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (newValue: string | undefined) => {
    setValue(newValue || "");
    setHasUnsavedChanges(newValue !== content);
  };

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(value);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving file:", error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, isSaving, onSave, value]);

  // Handle Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb and save button */}
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {filePath}
          </span>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 dark:text-orange-400">
              (unsaved)
            </span>
          )}
        </div>
        {!readOnly && (
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            size="sm"
            variant="default"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getLanguage(filePath)}
          value={value}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            fontFamily: "monospace",
            fontSize: 13,
            lineNumbers: "on",
            readOnly: readOnly,
          }}
        />
      </div>
    </div>
  );
}
