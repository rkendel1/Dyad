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

  return (
    <Alert className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{codeProposal.title}</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={isApproving || isRejecting}
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
              <h4 className="font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Files Changed ({codeProposal.filesChanged.length})
              </h4>
              <ul className="space-y-1 ml-6">
                {codeProposal.filesChanged.map((file, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-mono text-xs">{file.name}</span>
                    {file.summary && (
                      <span className="text-muted-foreground ml-2">
                        - {file.summary}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {codeProposal.packagesAdded.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Packages Added ({codeProposal.packagesAdded.length})
              </h4>
              <ul className="space-y-1 ml-6">
                {codeProposal.packagesAdded.map((pkg, index) => (
                  <li key={index} className="text-sm font-mono text-xs">
                    {pkg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {codeProposal.sqlQueries.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Database Changes ({codeProposal.sqlQueries.length})
              </h4>
              <ul className="space-y-1 ml-6">
                {codeProposal.sqlQueries.map((query, index) => (
                  <li key={index} className="text-sm">
                    {query.description || "SQL Query"}
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
