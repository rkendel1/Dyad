import {
  DEFAULT_CHUNK_SIZE_CHARS,
  MIN_CHUNK_SIZE_CHARS,
  MAX_CHUNK_SIZE_CHARS,
  CHUNK_OVERLAP_CHARS,
} from "@/constants/settings_constants";
import type { ChunkMetadata } from "../ipc_types";

export interface ChunkingOptions {
  maxChunkSize?: number;
  minChunkSize?: number;
  overlapSize?: number;
  preserveCodeBlocks?: boolean;
  preserveDyadTags?: boolean;
}

export interface TextChunk {
  content: string;
  index: number;
  isComplete: boolean;
  metadata: ChunkMetadata;
}

/**
 * Determines if a response should be chunked based on its length
 */
export function shouldChunkResponse(
  content: string,
  options: ChunkingOptions = {},
): boolean {
  const maxChunkSize = options.maxChunkSize ?? DEFAULT_CHUNK_SIZE_CHARS;
  return content.length > maxChunkSize;
}

/**
 * Finds the best position to split content, avoiding breaking:
 * - Code blocks (```)
 * - Dyad tags (<dyad-*>)
 * - Sentences (preferring periods, then newlines)
 */
function findBestSplitPosition(
  content: string,
  idealPosition: number,
  options: ChunkingOptions = {},
): number {
  const maxSearchDistance = 500; // Maximum distance to search for a good split point
  const searchStart = Math.max(0, idealPosition - maxSearchDistance);
  const searchEnd = Math.min(content.length, idealPosition + maxSearchDistance);

  // Check if we're inside a code block
  if (options.preserveCodeBlocks !== false) {
    const beforeIdeal = content.substring(0, idealPosition);
    const codeBlockMatches = beforeIdeal.match(/```/g);
    const isInsideCodeBlock =
      codeBlockMatches && codeBlockMatches.length % 2 === 1;

    if (isInsideCodeBlock) {
      // Find the end of the code block
      const codeBlockEnd = content.indexOf("```", idealPosition);
      if (codeBlockEnd !== -1 && codeBlockEnd < searchEnd) {
        return codeBlockEnd + 3; // After the closing ```
      }
    }
  }

  // Check if we're inside a dyad tag
  if (options.preserveDyadTags !== false) {
    const beforeIdeal = content.substring(0, idealPosition);
    const lastOpenTag = beforeIdeal.lastIndexOf("<dyad-");
    const lastCloseTag = beforeIdeal.lastIndexOf("</dyad-");

    if (lastOpenTag > lastCloseTag) {
      // We're inside a dyad tag, find its end
      const tagEnd = content.indexOf(
        ">",
        content.indexOf("</dyad-", idealPosition),
      );
      if (tagEnd !== -1 && tagEnd < searchEnd) {
        return tagEnd + 1;
      }
    }
  }

  // Look for good natural split points
  const searchContent = content.substring(searchStart, searchEnd);

  // Priority order: period + newline, period + space, double newline, single newline
  const splitPatterns = [
    /\.\s*\n/g, // Period followed by newline
    /\.\s+/g, // Period followed by space(s)
    /\n\s*\n/g, // Double newline (paragraph break)
    /\n/g, // Single newline
  ];

  for (const pattern of splitPatterns) {
    const matches = Array.from(searchContent.matchAll(pattern));
    if (matches.length > 0) {
      // Find the match closest to our ideal position
      const idealOffset = idealPosition - searchStart;
      let bestMatch = matches[0];
      let bestDistance = Math.abs((bestMatch.index ?? 0) - idealOffset);

      for (const match of matches) {
        const distance = Math.abs((match.index ?? 0) - idealOffset);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = match;
        }
      }

      return searchStart + (bestMatch.index ?? 0) + bestMatch[0].length;
    }
  }

  // Fallback to the ideal position if no good split point found
  return idealPosition;
}

/**
 * Splits content into chunks with proper handling of code blocks and dyad tags
 */
export function chunkResponse(
  content: string,
  options: ChunkingOptions = {},
): TextChunk[] {
  const maxChunkSize = options.maxChunkSize ?? DEFAULT_CHUNK_SIZE_CHARS;
  const minChunkSize = options.minChunkSize ?? MIN_CHUNK_SIZE_CHARS;
  const overlapSize = options.overlapSize ?? CHUNK_OVERLAP_CHARS;

  if (!shouldChunkResponse(content, options)) {
    return [
      {
        content,
        index: 0,
        isComplete: true,
        metadata: {
          chunkIndex: 0,
          totalChunks: 1,
          isChunked: false,
          chunkDeliveryStatus: "completed",
        },
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let currentPosition = 0;
  let chunkIndex = 0;

  while (currentPosition < content.length) {
    const remainingContent = content.length - currentPosition;
    let chunkEnd: number;

    if (remainingContent <= maxChunkSize) {
      // Last chunk - take everything remaining
      chunkEnd = content.length;
    } else {
      // Find the best position to split
      const idealEnd = currentPosition + maxChunkSize - overlapSize;
      chunkEnd = findBestSplitPosition(content, idealEnd, options);

      // Ensure chunk isn't too small
      if (chunkEnd - currentPosition < minChunkSize && chunks.length === 0) {
        chunkEnd = Math.min(content.length, currentPosition + maxChunkSize);
      }
    }

    const chunkContent = content.substring(currentPosition, chunkEnd);

    chunks.push({
      content: chunkContent,
      index: chunkIndex,
      isComplete: chunkEnd >= content.length,
      metadata: {
        chunkIndex,
        totalChunks: 0, // Will be set after we know the total
        isChunked: true,
        chunkDeliveryStatus: "delivering",
      },
    });

    // Move to next chunk with overlap
    currentPosition = Math.max(chunkEnd - overlapSize, chunkEnd);
    chunkIndex++;
  }

  // Update total chunks count in all chunks
  chunks.forEach((chunk) => {
    chunk.metadata.totalChunks = chunks.length;
  });

  return chunks;
}

/**
 * Estimates the optimal chunk size based on error rates and performance metrics
 */
export function calculateOptimalChunkSize(
  errorRate: number,
  avgResponseTime: number,
  baseChunkSize: number = DEFAULT_CHUNK_SIZE_CHARS,
): number {
  // Reduce chunk size if error rate is high
  const errorAdjustment = Math.max(0.5, 1 - errorRate * 2);

  // Adjust based on response time (slower = smaller chunks)
  const timeAdjustment = avgResponseTime > 30000 ? 0.8 : 1.0;

  const adjustedSize = Math.round(
    baseChunkSize * errorAdjustment * timeAdjustment,
  );

  // Ensure it stays within bounds
  return Math.max(
    MIN_CHUNK_SIZE_CHARS,
    Math.min(MAX_CHUNK_SIZE_CHARS, adjustedSize),
  );
}

/**
 * Merges chunks back into a single response for database storage
 */
export function mergeChunks(chunks: TextChunk[]): string {
  if (chunks.length === 0) return "";
  if (chunks.length === 1) return chunks[0].content;

  // Sort chunks by index to ensure correct order
  const sortedChunks = [...chunks].sort((a, b) => a.index - b.index);

  let mergedContent = sortedChunks[0].content;

  for (let i = 1; i < sortedChunks.length; i++) {
    const currentChunk = sortedChunks[i];
    const overlapSize = CHUNK_OVERLAP_CHARS;

    // Remove overlap from the beginning of the current chunk
    const chunkContent = currentChunk.content;
    const deduplicatedContent = chunkContent.substring(
      Math.min(overlapSize, chunkContent.length),
    );

    mergedContent += deduplicatedContent;
  }

  return mergedContent;
}
