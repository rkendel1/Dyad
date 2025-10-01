/**
 * EmotionDetectionService provides sentiment and frustration detection
 * Initial implementation uses text-based heuristics
 * Can be extended with ML models in the future
 */

export enum EmotionState {
  NEUTRAL = "neutral",
  POSITIVE = "positive",
  NEGATIVE = "negative",
  FRUSTRATED = "frustrated",
}

export interface EmotionAnalysis {
  state: EmotionState;
  confidence: number;
  indicators: string[];
  timestamp: number;
}

export interface ConversationContext {
  messageHistory: string[];
  repetitionCount: number;
  errorCount: number;
  lastEmotionState: EmotionState;
}

type EmotionCallback = (analysis: EmotionAnalysis) => void;
type FrustrationCallback = (level: number) => void;

export class EmotionDetectionService {
  private emotionCallbacks: EmotionCallback[] = [];
  private frustrationCallbacks: FrustrationCallback[] = [];
  private context: ConversationContext = {
    messageHistory: [],
    repetitionCount: 0,
    errorCount: 0,
    lastEmotionState: EmotionState.NEUTRAL,
  };

  // Keyword patterns for emotion detection
  private readonly FRUSTRATION_KEYWORDS = [
    "frustrated", "annoying", "wrong", "broken", "bug", "issue", "problem",
    "doesn't work", "not working", "failed", "error", "help", "stuck",
    "again", "still", "why", "ugh", "argh", "damn", "wtf", "seriously"
  ];

  private readonly NEGATIVE_KEYWORDS = [
    "bad", "terrible", "awful", "poor", "worse", "horrible", "hate",
    "dislike", "incorrect", "useless", "confusing", "complicated"
  ];

  private readonly POSITIVE_KEYWORDS = [
    "good", "great", "excellent", "perfect", "awesome", "amazing",
    "love", "like", "better", "thanks", "thank you", "helpful", "works"
  ];

  // Patterns for detecting repetition and frustration
  private readonly REPETITION_THRESHOLD = 3;
  private readonly FRUSTRATION_THRESHOLD = 0.6;

  public analyzeMessage(message: string): EmotionAnalysis {
    const lowerMessage = message.toLowerCase();
    const indicators: string[] = [];
    let emotionScore = 0;
    let frustrationLevel = 0;

    // Check for frustration keywords
    const frustrationMatches = this.FRUSTRATION_KEYWORDS.filter(keyword =>
      lowerMessage.includes(keyword)
    );
    if (frustrationMatches.length > 0) {
      indicators.push(...frustrationMatches.map(k => `frustration: ${k}`));
      frustrationLevel += frustrationMatches.length * 0.3;
    }

    // Check for negative sentiment
    const negativeMatches = this.NEGATIVE_KEYWORDS.filter(keyword =>
      lowerMessage.includes(keyword)
    );
    if (negativeMatches.length > 0) {
      indicators.push(...negativeMatches.map(k => `negative: ${k}`));
      emotionScore -= negativeMatches.length * 0.2;
    }

    // Check for positive sentiment
    const positiveMatches = this.POSITIVE_KEYWORDS.filter(keyword =>
      lowerMessage.includes(keyword)
    );
    if (positiveMatches.length > 0) {
      indicators.push(...positiveMatches.map(k => `positive: ${k}`));
      emotionScore += positiveMatches.length * 0.2;
    }

    // Check for repeated similar messages
    const similarity = this.calculateSimilarity(message);
    if (similarity > 0.7) {
      this.context.repetitionCount++;
      indicators.push(`repetition: ${this.context.repetitionCount}`);
      frustrationLevel += this.context.repetitionCount * 0.2;
    } else {
      this.context.repetitionCount = 0;
    }

    // Determine emotion state
    let state: EmotionState;
    if (frustrationLevel >= this.FRUSTRATION_THRESHOLD) {
      state = EmotionState.FRUSTRATED;
    } else if (emotionScore > 0.3) {
      state = EmotionState.POSITIVE;
    } else if (emotionScore < -0.3) {
      state = EmotionState.NEGATIVE;
    } else {
      state = EmotionState.NEUTRAL;
    }

    const analysis: EmotionAnalysis = {
      state,
      confidence: Math.min(Math.abs(emotionScore) + frustrationLevel, 1),
      indicators,
      timestamp: Date.now(),
    };

    // Update context
    this.context.messageHistory.push(message);
    if (this.context.messageHistory.length > 10) {
      this.context.messageHistory.shift();
    }
    this.context.lastEmotionState = state;

    // Notify callbacks
    this.notifyEmotion(analysis);
    if (state === EmotionState.FRUSTRATED) {
      this.notifyFrustration(frustrationLevel);
    }

    return analysis;
  }

  public trackError(): void {
    this.context.errorCount++;
    if (this.context.errorCount >= 2) {
      const analysis: EmotionAnalysis = {
        state: EmotionState.FRUSTRATED,
        confidence: 0.7,
        indicators: [`error_count: ${this.context.errorCount}`],
        timestamp: Date.now(),
      };
      this.notifyEmotion(analysis);
      this.notifyFrustration(0.7);
    }
  }

  public resetContext(): void {
    this.context = {
      messageHistory: [],
      repetitionCount: 0,
      errorCount: 0,
      lastEmotionState: EmotionState.NEUTRAL,
    };
  }

  public getContext(): ConversationContext {
    return { ...this.context };
  }

  public onEmotionDetected(callback: EmotionCallback): () => void {
    this.emotionCallbacks.push(callback);
    return () => {
      this.emotionCallbacks = this.emotionCallbacks.filter(cb => cb !== callback);
    };
  }

  public onFrustrationDetected(callback: FrustrationCallback): () => void {
    this.frustrationCallbacks.push(callback);
    return () => {
      this.frustrationCallbacks = this.frustrationCallbacks.filter(cb => cb !== callback);
    };
  }

  public generateAdaptivePrompt(originalPrompt: string, emotionState: EmotionState): string {
    switch (emotionState) {
      case EmotionState.FRUSTRATED:
        return `[User seems frustrated - provide clear, step-by-step solutions]\n${originalPrompt}`;
      case EmotionState.NEGATIVE:
        return `[User may need additional guidance]\n${originalPrompt}`;
      case EmotionState.POSITIVE:
        return originalPrompt; // No modification needed
      default:
        return originalPrompt;
    }
  }

  private calculateSimilarity(message: string): number {
    if (this.context.messageHistory.length === 0) {
      return 0;
    }

    const lastMessage = this.context.messageHistory[this.context.messageHistory.length - 1];
    const words1 = new Set(message.toLowerCase().split(/\s+/));
    const words2 = new Set(lastMessage.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private notifyEmotion(analysis: EmotionAnalysis): void {
    this.emotionCallbacks.forEach(callback => callback(analysis));
  }

  private notifyFrustration(level: number): void {
    this.frustrationCallbacks.forEach(callback => callback(level));
  }

  public cleanup(): void {
    this.emotionCallbacks = [];
    this.frustrationCallbacks = [];
    this.resetContext();
  }
}

// Export a singleton instance
export const emotionDetectionService = new EmotionDetectionService();
