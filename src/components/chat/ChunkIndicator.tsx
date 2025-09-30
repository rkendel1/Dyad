import React from "react";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { ChunkMetadata } from "@/ipc/ipc_types";

interface ChunkIndicatorProps {
  chunkMetadata: ChunkMetadata;
  className?: string;
}

export function ChunkIndicator({ chunkMetadata, className = "" }: ChunkIndicatorProps) {
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
  className = "" 
}: ChunkedMessageIndicatorProps) {
  const { totalChunks, chunkDeliveryStatus } = chunkMetadata;

  if (!chunkMetadata.isChunked) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-md p-3 mb-2 ${className}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-blue-800 font-medium">
            Long Response - Delivered in Chunks
          </div>
          <div className="text-xs text-blue-600 mt-1">
            This response was split into {totalChunks} parts to ensure reliable delivery.
            {chunkDeliveryStatus === "delivering" && " Delivery in progress..."}
            {chunkDeliveryStatus === "failed" && " Some chunks failed to deliver."}
          </div>
        </div>
      </div>
    </div>
  );
}