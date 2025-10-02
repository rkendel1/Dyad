"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
}

interface FileTreeProps {
  files: string[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

// Build a tree structure from flat file list
function buildTree(files: string[]): TreeNode[] {
  const root: TreeNode[] = [];
  
  files.forEach((filePath) => {
    const parts = filePath.split("/");
    let currentLevel = root;
    
    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join("/");
      
      let existingNode = currentLevel.find((node) => node.name === part);
      
      if (!existingNode) {
        const newNode: TreeNode = {
          name: part,
          path: currentPath,
          isDirectory: !isLastPart,
          children: [],
        };
        currentLevel.push(newNode);
        existingNode = newNode;
      }
      
      if (!isLastPart) {
        currentLevel = existingNode.children;
      }
    });
  });
  
  return root;
}

// Sort nodes: directories first, then alphabetically
function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name);
    }
    return a.isDirectory ? -1 : 1;
  });
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

function TreeNodeItem({ node, level, selectedFile, onSelectFile }: TreeNodeItemProps) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels
  
  const handleClick = () => {
    if (node.isDirectory) {
      setExpanded(!expanded);
    } else {
      onSelectFile(node.path);
    }
  };
  
  const isSelected = !node.isDirectory && selectedFile === node.path;
  
  return (
    <div>
      <div
        className={`
          flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-accent rounded-sm
          ${isSelected ? "bg-accent font-medium" : ""}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.isDirectory && (
          <span className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        )}
        {!node.isDirectory && <span className="w-4" />}
        <span className="flex-shrink-0">
          {node.isDirectory ? (
            expanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {node.isDirectory && expanded && (
        <div>
          {sortNodes(node.children).map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const tree = buildTree(files);
  
  return (
    <div className="py-2">
      {sortNodes(tree).map((node) => (
        <TreeNodeItem
          key={node.path}
          node={node}
          level={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
