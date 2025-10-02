"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Check,
  FileText,
  Loader2,
  Package,
  X,
  Database,
  AlertTriangle,
  FileEdit,
  FileX,
} from "lucide-react";
import type { ProposalResult, CodeProposal } from "@/lib/dyad-client";

interface ProposalDisplayProps {
  proposal: ProposalResult | null;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function ProposalDisplay({
  proposal,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: ProposalDisplayProps) {
  if (!proposal) {
    return null;
  }

  // Only show code proposals for now (action proposals are less relevant in web)
  if (proposal.proposal.type !== "code-proposal") {
    return null;
  }

  const codeProposal = proposal.proposal as CodeProposal;

  // Helper function to get icon for file change type
  const getFileIcon = (type: string) => {
    switch (type) {
      case "write":
        return <FileEdit className="h-3 w-3" />;
      case "delete":
        return <FileX className="h-3 w-3" />;
      case "rename":
        return <FileEdit className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  // Helper function to get color for file change type
  const getFileColor = (type: string) => {
    switch (type) {
      case "write":
        return "text-green-600 dark:text-green-400";
      case "delete":
        return "text-red-600 dark:text-red-400";
      case "rename":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Alert className="mb-4 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertTitle className="flex items-center justify-between">
        <span className="text-orange-900 dark:text-orange-100">{codeProposal.title}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={isApproving || isRejecting}
            className="border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
          >
            {isRejecting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <X className="h-4 w-4 mr-1" />
            )}
            Reject
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isApproving || isRejecting}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Accept
          </Button>
        </div>
      </AlertTitle>
      <AlertDescription>
        <div className="mt-3 space-y-3">
          {codeProposal.filesChanged.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center text-sm">
                <FileText className="h-4 w-4 mr-2" />
                Files Changed ({codeProposal.filesChanged.length})
              </h4>
              <ul className="space-y-1.5 ml-6">
                {codeProposal.filesChanged.map((file, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className={`mt-0.5 ${getFileColor(file.type)}`}>
                      {getFileIcon(file.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium">{file.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          file.type === "write" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
                            : file.type === "delete"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}>
                          {file.type}
                        </span>
                      </div>
                      {file.summary && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {file.summary}
                        </p>
                      )}
                      {file.path && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {file.path}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {codeProposal.packagesAdded.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center text-sm">
                <Package className="h-4 w-4 mr-2" />
                Packages Added ({codeProposal.packagesAdded.length})
              </h4>
              <ul className="space-y-1 ml-6">
                {codeProposal.packagesAdded.map((pkg, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-mono text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                      {pkg}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {codeProposal.sqlQueries.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center text-sm">
                <Database className="h-4 w-4 mr-2" />
                Database Changes ({codeProposal.sqlQueries.length})
              </h4>
              <ul className="space-y-1 ml-6">
                {codeProposal.sqlQueries.map((query, index) => (
                  <li key={index} className="text-sm">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      {query.description || "SQL Query"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
