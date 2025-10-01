// Incremental chunk streaming logic for chat responses

import { ChatResponse, Chunk } from "./types";

export class ChatStreamHandler {
  private responseChunks: Chunk[] = [];

  constructor(private chatResponse: ChatResponse) {}

  public streamChunks(): AsyncIterable<Chunk> {
    return this.generateChunks();
  }

  private async *generateChunks(): AsyncIterable<Chunk> {
    for (const chunk of this.chatResponse.chunks) {
      this.responseChunks.push(chunk);
      yield chunk;
      await this.waitForNextChunk(); // Simulate waiting for the next chunk
    }
  }

  private waitForNextChunk(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulates a delay
  }
}

// Usage Example:
// const chatHandler = new ChatStreamHandler(chatResponse);
// for await (const chunk of chatHandler.streamChunks()) {
//     console.log(chunk);
// }
