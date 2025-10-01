import React from "react";
import { Clock, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react";
import type { ChunkMetadata } from "@/ipc/ipc_types";

interface ChunkIndicatorProps {
  chunkMetadata: ChunkMetadata;
  className?: string;
}

export function ChunkIndicator({
  chunkMetadata,
  className = "",
}: ChunkIndicatorProps) {
  const { chunkIndex, totalChunks, chunkDeliveryStatus } = chunkMetadata;

  const getStatusIcon = () => {
    switch (chunkDeliveryStatus) {
      case "delivering":
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (chunkDeliveryStatus) {
      case "delivering":
        return "Delivering...";
      case "completed":
        return "Delivered";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getStatusColor = () => {
    switch (chunkDeliveryStatus) {
      case "delivering":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className="flex items-center gap-1">
        {getStatusIcon()}
        <span className={`font-medium ${getStatusColor()}`}>
          Chunk {chunkIndex + 1} of {totalChunks}
        </span>
      </div>
      <span className="text-gray-500">•</span>
      <span className={`${getStatusColor()}`}>{getStatusText()}</span>
    </div>
  );
}

interface ChunkedMessageIndicatorProps {
  chunkMetadata: ChunkMetadata;
  className?: string;
}

export function ChunkedMessageIndicator({
  chunkMetadata,
  className = "",
}: ChunkedMessageIndicatorProps) {
  const { totalChunks, chunkDeliveryStatus, chunkIndex } = chunkMetadata;

  if (!chunkMetadata.isChunked) {
    return null;
  }

  const getIndicatorIcon = () => {
    switch (chunkDeliveryStatus) {
      case "delivering":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getIndicatorColor = () => {
    switch (chunkDeliveryStatus) {
      case "delivering":
        return "bg-blue-50 border-blue-200";
      case "completed":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTextColor = () => {
    switch (chunkDeliveryStatus) {
      case "delivering":
        return "text-blue-800";
      case "completed":
        return "text-green-800";
      case "failed":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  const getSubtextColor = () => {
    switch (chunkDeliveryStatus) {
      case "delivering":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusMessage = () => {
    const fileInfo =
      chunkMetadata.filesDelivered !== undefined ||
      chunkMetadata.filesPending !== undefined
        ? ` (${chunkMetadata.filesDelivered || 0} file${(chunkMetadata.filesDelivered || 0) !== 1 ? "s" : ""} delivered${chunkMetadata.filesPending ? `, ${chunkMetadata.filesPending} pending` : ""})`
        : "";

    switch (chunkDeliveryStatus) {
      case "delivering":
        return `Chunk ${chunkIndex + 1} of ${totalChunks} is being delivered...${fileInfo}`;
      case "completed":
        return `All ${totalChunks} chunks delivered successfully.${fileInfo}`;
      case "failed":
        return `Chunk ${chunkIndex + 1} failed to deliver. You may see incomplete content.`;
      default:
        return `This response was split into ${totalChunks} parts for reliable delivery.`;
    }
  };

  return (
    <div
      className={`border rounded-md p-3 mb-2 ${getIndicatorColor()} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIndicatorIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${getTextColor()}`}>
            {chunkDeliveryStatus === "failed"
              ? "Chunk Delivery Failed"
              : "Long Response - Chunked Delivery"}
          </div>
          <div className={`text-xs mt-1 ${getSubtextColor()}`}>
            {getStatusMessage()}
          </div>
          {chunkDeliveryStatus === "delivering" &&
            chunkMetadata.filesPending &&
            chunkMetadata.filesPending > 0 && (
              <div className="text-xs mt-2 text-blue-700 bg-blue-100 rounded px-2 py-1">
                <strong>More files incoming:</strong>{" "}
                {chunkMetadata.filesPending} file
                {chunkMetadata.filesPending !== 1 ? "s are" : " is"} still being
                delivered. Please wait...
              </div>
            )}
          {chunkDeliveryStatus === "completed" &&
            chunkMetadata.filesDelivered &&
            chunkMetadata.filesDelivered > 0 && (
              <div className="text-xs mt-2 text-green-700 bg-green-100 rounded px-2 py-1">
                ✓ All files delivered successfully (
                {chunkMetadata.filesDelivered} file
                {chunkMetadata.filesDelivered !== 1 ? "s" : ""})
              </div>
            )}
          {chunkDeliveryStatus === "failed" && (
            <div className="text-xs mt-2 text-red-600">
              <strong>Troubleshooting:</strong> Try refreshing the page or
              retrying your request. If the issue persists, consider breaking
              your request into smaller parts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  current: number;
  total: number;
  status: "delivering" | "completed" | "failed";
  className?: string;
}

export function ChunkProgressBar({
  current,
  total,
  status,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  const getBarColor = () => {
    switch (status) {
      case "delivering":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Chunk Progress</span>
        <span>
          {current}/{total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
