"use client";

import React, { useState } from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";

interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: FileTreeNode[];
}

interface FileTreeProps {
  files: string[];
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
}

// Build tree structure from flat file list
function buildFileTree(files: string[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  files.forEach((filePath) => {
    const parts = filePath.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join("/");

      // Check if node already exists
      const existingNode = currentLevel.find((node) => node.name === part);

      if (existingNode) {
        currentLevel = existingNode.children;
      } else {
        const newNode: FileTreeNode = {
          name: part,
          path: currentPath,
          isDirectory: !isLastPart,
          children: [],
        };
        currentLevel.push(newNode);
        currentLevel = newNode.children;
      }
    });
  });

  return root;
}

// Sort nodes: directories first, then files, both alphabetically
function sortNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name);
    }
    return a.isDirectory ? -1 : 1;
  });
}

// Tree node component
function TreeNode({
  node,
  level,
  onFileSelect,
  selectedFile,
}: {
  node: FileTreeNode;
  level: number;
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
}) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const handleClick = () => {
    if (node.isDirectory) {
      setExpanded(!expanded);
    } else {
      onFileSelect(node.path);
    }
  };

  const isSelected = !node.isDirectory && node.path === selectedFile;

  return (
    <li className="select-none">
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-1 px-2 py-1 rounded cursor-pointer
          hover:bg-gray-100 dark:hover:bg-gray-800
          ${isSelected ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : ""}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.isDirectory ? (
          <>
            <ChevronRight
              size={14}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
            {expanded ? (
              <FolderOpen size={16} className="text-blue-500" />
            ) : (
              <Folder size={16} className="text-blue-500" />
            )}
          </>
        ) : (
          <>
            <div className="w-3.5" /> {/* Spacer for alignment */}
            <File size={16} className="text-gray-500 dark:text-gray-400" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {node.isDirectory && expanded && node.children.length > 0 && (
        <ul>
          {sortNodes(node.children).map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({ files, onFileSelect, selectedFile }: FileTreeProps) {
  const tree = buildFileTree(files);

  return (
    <div className="file-tree overflow-auto">
      <ul>
        {sortNodes(tree).map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            level={0}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
      </ul>
    </div>
  );
}
