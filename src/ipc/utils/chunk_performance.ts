import log from "electron-log";

const logger = log.scope("chunk_performance");

interface ChunkPerformanceMetrics {
  totalChunks: number;
  deliveredChunks: number;
  failedChunks: number;
  averageChunkSize: number;
  totalDeliveryTime: number;
  errorRate: number;
  avgDeliveryTimePerChunk: number;
}

interface ChunkDeliverySession {
  chatId: number;
  startTime: number;
  totalChunks: number;
  deliveredChunks: number;
  failedChunks: number;
  chunkSizes: number[];
  deliveryTimes: number[];
  errors: Error[];
}

class ChunkPerformanceTracker {
  private sessions = new Map<number, ChunkDeliverySession>();
  private globalMetrics: ChunkPerformanceMetrics = {
    totalChunks: 0,
    deliveredChunks: 0,
    failedChunks: 0,
    averageChunkSize: 0,
    totalDeliveryTime: 0,
    errorRate: 0,
    avgDeliveryTimePerChunk: 0,
  };

  startSession(chatId: number, totalChunks: number): void {
    const session: ChunkDeliverySession = {
      chatId,
      startTime: Date.now(),
      totalChunks,
      deliveredChunks: 0,
      failedChunks: 0,
      chunkSizes: [],
      deliveryTimes: [],
      errors: [],
    };

    this.sessions.set(chatId, session);
    logger.log(
      `Started chunk delivery session for chat ${chatId} with ${totalChunks} chunks`,
    );
  }

  recordChunkDelivery(
    chatId: number,
    chunkIndex: number,
    chunkSize: number,
    deliveryTime: number,
    success: boolean,
    error?: Error,
  ): void {
    const session = this.sessions.get(chatId);
    if (!session) {
      logger.warn(`No session found for chat ${chatId}`);
      return;
    }

    session.chunkSizes.push(chunkSize);
    session.deliveryTimes.push(deliveryTime);

    if (success) {
      session.deliveredChunks++;
      this.globalMetrics.deliveredChunks++;
    } else {
      session.failedChunks++;
      this.globalMetrics.failedChunks++;
      if (error) {
        session.errors.push(error);
      }
    }

    this.globalMetrics.totalChunks++;

    logger.log(
      `Chunk ${chunkIndex + 1}/${session.totalChunks} for chat ${chatId}: ` +
        `${success ? "delivered" : "failed"} (${chunkSize} chars, ${deliveryTime}ms)`,
    );
  }

  endSession(chatId: number): ChunkPerformanceMetrics | null {
    const session = this.sessions.get(chatId);
    if (!session) {
      logger.warn(`No session found for chat ${chatId}`);
      return null;
    }

    const totalTime = Date.now() - session.startTime;
    const avgChunkSize =
      session.chunkSizes.length > 0
        ? session.chunkSizes.reduce((a, b) => a + b, 0) /
          session.chunkSizes.length
        : 0;
    const avgDeliveryTime =
      session.deliveryTimes.length > 0
        ? session.deliveryTimes.reduce((a, b) => a + b, 0) /
          session.deliveryTimes.length
        : 0;
    const errorRate =
      session.totalChunks > 0 ? session.failedChunks / session.totalChunks : 0;

    const sessionMetrics: ChunkPerformanceMetrics = {
      totalChunks: session.totalChunks,
      deliveredChunks: session.deliveredChunks,
      failedChunks: session.failedChunks,
      averageChunkSize: avgChunkSize,
      totalDeliveryTime: totalTime,
      errorRate: errorRate,
      avgDeliveryTimePerChunk: avgDeliveryTime,
    };

    // Update global metrics
    this.updateGlobalMetrics();

    logger.log(
      `Chunk delivery session completed for chat ${chatId}: ` +
        `${session.deliveredChunks}/${session.totalChunks} delivered ` +
        `(${(errorRate * 100).toFixed(1)}% error rate, ${totalTime}ms total)`,
    );

    // Log performance summary
    if (session.failedChunks > 0) {
      logger.warn(
        `Session had ${session.failedChunks} failed chunks. Error rate: ${(errorRate * 100).toFixed(1)}%`,
      );

      // Log error details if available
      if (session.errors.length > 0) {
        const errorSummary = session.errors.reduce(
          (acc, error) => {
            const key = error.message || "Unknown error";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        logger.warn(`Error summary for chat ${chatId}:`, errorSummary);
      }
    }

    this.sessions.delete(chatId);
    return sessionMetrics;
  }

  private updateGlobalMetrics(): void {
    const allDeliveredChunks = this.globalMetrics.deliveredChunks;
    const allFailedChunks = this.globalMetrics.failedChunks;
    const totalChunks = allDeliveredChunks + allFailedChunks;

    if (totalChunks > 0) {
      this.globalMetrics.errorRate = allFailedChunks / totalChunks;
    }
  }

  getGlobalMetrics(): ChunkPerformanceMetrics {
    return { ...this.globalMetrics };
  }

  getSessionMetrics(chatId: number): Partial<ChunkPerformanceMetrics> | null {
    const session = this.sessions.get(chatId);
    if (!session) {
      return null;
    }

    const avgChunkSize =
      session.chunkSizes.length > 0
        ? session.chunkSizes.reduce((a, b) => a + b, 0) /
          session.chunkSizes.length
        : 0;
    const avgDeliveryTime =
      session.deliveryTimes.length > 0
        ? session.deliveryTimes.reduce((a, b) => a + b, 0) /
          session.deliveryTimes.length
        : 0;
    const errorRate =
      session.totalChunks > 0 ? session.failedChunks / session.totalChunks : 0;

    return {
      totalChunks: session.totalChunks,
      deliveredChunks: session.deliveredChunks,
      failedChunks: session.failedChunks,
      averageChunkSize: avgChunkSize,
      errorRate: errorRate,
      avgDeliveryTimePerChunk: avgDeliveryTime,
    };
  }

  // Method to get recommended chunk size based on performance
  getRecommendedChunkSize(): number {
    const metrics = this.getGlobalMetrics();
    const DEFAULT_SIZE = 8000;

    // If error rate is high, recommend smaller chunks
    if (metrics.errorRate > 0.1) {
      // 10% error rate
      return Math.max(4000, DEFAULT_SIZE * 0.7);
    }

    // If delivery time is slow, recommend smaller chunks
    if (metrics.avgDeliveryTimePerChunk > 5000) {
      // 5 seconds per chunk
      return Math.max(4000, DEFAULT_SIZE * 0.8);
    }

    // If performance is good, can use larger chunks
    if (metrics.errorRate < 0.02 && metrics.avgDeliveryTimePerChunk < 2000) {
      return Math.min(12000, DEFAULT_SIZE * 1.2);
    }

    return DEFAULT_SIZE;
  }
}

// Export singleton instance
export const chunkPerfTracker = new ChunkPerformanceTracker();
