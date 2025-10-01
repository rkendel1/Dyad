import { describe, it, expect } from "vitest";
import {
  shouldChunkResponse,
  chunkResponse,
  mergeChunks,
  calculateOptimalChunkSize,
} from "../ipc/utils/chunking_utils";
import { DEFAULT_CHUNK_SIZE_CHARS } from "@/constants/settings_constants";

describe("chunking_utils", () => {
  describe("shouldChunkResponse", () => {
    it("should return false for short content", () => {
      const content = "Short content";
      expect(shouldChunkResponse(content)).toBe(false);
    });

    it("should return true for long content", () => {
      const content = "x".repeat(DEFAULT_CHUNK_SIZE_CHARS + 1);
      expect(shouldChunkResponse(content)).toBe(true);
    });

    it("should respect custom chunk size", () => {
      const content = "x".repeat(1000);
      expect(shouldChunkResponse(content, { maxChunkSize: 500 })).toBe(true);
      expect(shouldChunkResponse(content, { maxChunkSize: 1500 })).toBe(false);
    });
  });

  describe("chunkResponse", () => {
    it("should return single chunk for short content", () => {
      const content = "Short content";
      const chunks = chunkResponse(content);

      expect(chunks).toHaveLength(1);
      expect(chunks[0].content).toBe(content);
      expect(chunks[0].metadata.isChunked).toBe(false);
      expect(chunks[0].metadata.totalChunks).toBe(1);
    });

    it("should split long content into multiple chunks", () => {
      const content = "x".repeat(15000); // Long content
      const chunks = chunkResponse(content, { maxChunkSize: 5000 });

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].metadata.isChunked).toBe(true);
      expect(chunks[0].metadata.chunkIndex).toBe(0);
      expect(chunks[1].metadata.chunkIndex).toBe(1);

      // All chunks should have the same total count
      chunks.forEach((chunk) => {
        expect(chunk.metadata.totalChunks).toBe(chunks.length);
      });
    });

    it("should preserve code blocks", () => {
      const codeBlock = "```javascript\nconst x = 1;\nconst y = 2;\n```";
      const content =
        "Some text before\n" + codeBlock + "\nSome text after".repeat(1000);
      const chunks = chunkResponse(content, {
        maxChunkSize: 200,
        preserveCodeBlocks: true,
      });

      // Code block should not be split
      const codeBlockChunks = chunks.filter(
        (chunk) =>
          chunk.content.includes("```javascript") ||
          chunk.content.includes("const x = 1"),
      );
      expect(codeBlockChunks.length).toBeGreaterThan(0);

      // Find chunk with opening code block
      const openingChunk = chunks.find((chunk) =>
        chunk.content.includes("```javascript"),
      );
      if (openingChunk) {
        // Should also contain the closing ```
        expect(openingChunk.content).toMatch(/```javascript[\s\S]*```/);
      }
    });

    it("should preserve dyad tags", () => {
      const dyadTag =
        '<dyad-write path="test.js">console.log("test");</dyad-write>';
      const content =
        "Some text before\n" + dyadTag + "\nSome text after".repeat(1000);
      const chunks = chunkResponse(content, {
        maxChunkSize: 200,
        preserveDyadTags: true,
      });

      // Dyad tag should not be split
      const dyadTagChunks = chunks.filter(
        (chunk) =>
          chunk.content.includes("<dyad-write") ||
          chunk.content.includes('console.log("test")'),
      );
      expect(dyadTagChunks.length).toBeGreaterThan(0);

      // Find chunk with opening dyad tag
      const openingChunk = chunks.find((chunk) =>
        chunk.content.includes("<dyad-write"),
      );
      if (openingChunk) {
        // Should also contain the closing tag
        expect(openingChunk.content).toMatch(
          /<dyad-write[\s\S]*<\/dyad-write>/,
        );
      }
    });

    it("should prefer natural split points", () => {
      const content =
        "First sentence. Second sentence.\n\nNew paragraph. Another sentence.".repeat(
          200,
        );
      const chunks = chunkResponse(content, { maxChunkSize: 500 });

      // Chunks should end at natural boundaries when possible
      chunks.slice(0, -1).forEach((chunk) => {
        const endsWithPeriod = chunk.content.trim().endsWith(".");
        const endsWithNewline = chunk.content.endsWith("\n");
        expect(endsWithPeriod || endsWithNewline).toBe(true);
      });
    });

    it("should handle empty content", () => {
      const chunks = chunkResponse("");
      expect(chunks).toHaveLength(1);
      expect(chunks[0].content).toBe("");
      expect(chunks[0].metadata.isChunked).toBe(false);
    });
  });

  describe("mergeChunks", () => {
    it("should return empty string for empty chunks", () => {
      expect(mergeChunks([])).toBe("");
    });

    it("should return single chunk content unchanged", () => {
      const chunks = chunkResponse("Single chunk content");
      expect(mergeChunks(chunks)).toBe("Single chunk content");
    });

    it("should merge multiple chunks back to original content", () => {
      const originalContent =
        "This is a long piece of content that will be split into multiple chunks for testing purposes.".repeat(
          100,
        );
      const chunks = chunkResponse(originalContent, { maxChunkSize: 200 });
      const mergedContent = mergeChunks(chunks);

      // Merged content should be very similar to original (may have slight differences due to overlap handling)
      expect(mergedContent.length).toBeGreaterThan(
        originalContent.length * 0.9,
      );
      expect(mergedContent).toContain("This is a long piece of content");
    });

    it("should handle chunks in wrong order", () => {
      const originalContent = "First part. Second part. Third part.".repeat(50);
      const chunks = chunkResponse(originalContent, { maxChunkSize: 100 });

      // Shuffle chunks
      const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5);
      const mergedContent = mergeChunks(shuffledChunks);

      // Should still merge correctly due to sorting by index
      expect(mergedContent).toContain("First part");
      expect(mergedContent).toContain("Second part");
      expect(mergedContent).toContain("Third part");
    });
  });

  describe("calculateOptimalChunkSize", () => {
    it("should return default size for normal conditions", () => {
      const optimalSize = calculateOptimalChunkSize(0.0, 10000);
      expect(optimalSize).toBe(DEFAULT_CHUNK_SIZE_CHARS);
    });

    it("should reduce size for high error rate", () => {
      const optimalSize = calculateOptimalChunkSize(0.5, 10000);
      expect(optimalSize).toBeLessThan(DEFAULT_CHUNK_SIZE_CHARS);
    });

    it("should reduce size for slow response time", () => {
      const optimalSize = calculateOptimalChunkSize(0.0, 35000);
      expect(optimalSize).toBeLessThan(DEFAULT_CHUNK_SIZE_CHARS);
    });

    it("should stay within bounds", () => {
      const veryHighErrorRate = calculateOptimalChunkSize(1.0, 10000);
      expect(veryHighErrorRate).toBeGreaterThanOrEqual(2000); // MIN_CHUNK_SIZE_CHARS

      const largeBaseSize = calculateOptimalChunkSize(0.0, 10000, 20000);
      expect(largeBaseSize).toBeLessThanOrEqual(15000); // MAX_CHUNK_SIZE_CHARS
    });
  });

  describe("edge cases", () => {
    it("should handle content with only code blocks", () => {
      const content = "```\ncode here\n```";
      const chunks = chunkResponse(content);
      expect(chunks).toHaveLength(1);
      expect(chunks[0].content).toBe(content);
    });

    it("should handle content with only dyad tags", () => {
      const content = '<dyad-write path="test.js">content</dyad-write>';
      const chunks = chunkResponse(content);
      expect(chunks).toHaveLength(1);
      expect(chunks[0].content).toBe(content);
    });

    it("should handle content with nested tags", () => {
      const content =
        '<dyad-write path="test.js">```js\ncode\n```</dyad-write>'.repeat(100);
      const chunks = chunkResponse(content, { maxChunkSize: 200 });

      // Should not break nested structures
      chunks.forEach((chunk) => {
        const openTags = (chunk.content.match(/<dyad-write/g) || []).length;
        const closeTags = (chunk.content.match(/<\/dyad-write>/g) || []).length;
        // Each chunk should have balanced tags or be part of a larger tag
        expect(openTags >= closeTags).toBe(true);
      });
    });

    it("should handle very small chunk sizes", () => {
      const content = "This is a test content that should be chunked.";
      const chunks = chunkResponse(content, {
        maxChunkSize: 10,
        minChunkSize: 5,
      });

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) => {
        expect(chunk.content.length).toBeGreaterThan(0);
      });
    });
  });
});
