import { describe, it, expect, beforeEach } from "vitest";
import {
  EmotionDetectionService,
  EmotionState,
} from "@/services/emotion/EmotionDetectionService";

describe("EmotionDetectionService", () => {
  let service: EmotionDetectionService;

  beforeEach(() => {
    service = new EmotionDetectionService();
  });

  describe("analyzeMessage", () => {
    it("should detect neutral emotion for simple messages", () => {
      const analysis = service.analyzeMessage("Hello, how are you?");
      expect(analysis.state).toBe(EmotionState.NEUTRAL);
    });

    it("should detect positive emotion with positive keywords", () => {
      const analysis = service.analyzeMessage("This is great! I love it!");
      expect(analysis.state).toBe(EmotionState.POSITIVE);
      expect(analysis.indicators).toContain("positive: great");
      expect(analysis.indicators).toContain("positive: love");
    });

    it("should detect negative emotion with negative keywords", () => {
      const analysis = service.analyzeMessage("This is terrible and bad");
      expect(analysis.state).toBe(EmotionState.NEGATIVE);
      expect(analysis.indicators).toContain("negative: terrible");
      expect(analysis.indicators).toContain("negative: bad");
    });

    it("should detect frustration with frustration keywords", () => {
      const analysis = service.analyzeMessage("This is broken and doesn't work again");
      expect(analysis.state).toBe(EmotionState.FRUSTRATED);
      expect(analysis.indicators).toContain("frustration: broken");
      expect(analysis.indicators).toContain("frustration: doesn't work");
    });

    it("should detect frustration from repeated similar messages", () => {
      service.analyzeMessage("Fix the login bug");
      service.analyzeMessage("Fix the login bug");
      service.analyzeMessage("Fix the login bug");
      const analysis = service.analyzeMessage("Fix the login bug");
      
      expect(analysis.state).toBe(EmotionState.FRUSTRATED);
      expect(analysis.indicators.some(i => i.includes("repetition"))).toBe(true);
    });
  });

  describe("trackError", () => {
    it("should trigger frustration after multiple errors", () => {
      let frustrationLevel = 0;
      service.onFrustrationDetected((level) => {
        frustrationLevel = level;
      });

      service.trackError();
      expect(frustrationLevel).toBe(0); // First error doesn't trigger

      service.trackError();
      expect(frustrationLevel).toBe(0.7); // Second error triggers frustration
    });
  });

  describe("generateAdaptivePrompt", () => {
    it("should modify prompt for frustrated state", () => {
      const prompt = "How do I fix this?";
      const adapted = service.generateAdaptivePrompt(prompt, EmotionState.FRUSTRATED);
      
      expect(adapted).toContain("frustrated");
      expect(adapted).toContain("step-by-step");
      expect(adapted).toContain(prompt);
    });

    it("should modify prompt for negative state", () => {
      const prompt = "I need help";
      const adapted = service.generateAdaptivePrompt(prompt, EmotionState.NEGATIVE);
      
      expect(adapted).toContain("additional guidance");
      expect(adapted).toContain(prompt);
    });

    it("should not modify prompt for positive or neutral state", () => {
      const prompt = "This looks good";
      
      const adaptedPositive = service.generateAdaptivePrompt(prompt, EmotionState.POSITIVE);
      expect(adaptedPositive).toBe(prompt);

      const adaptedNeutral = service.generateAdaptivePrompt(prompt, EmotionState.NEUTRAL);
      expect(adaptedNeutral).toBe(prompt);
    });
  });

  describe("context management", () => {
    it("should maintain message history", () => {
      service.analyzeMessage("Message 1");
      service.analyzeMessage("Message 2");
      service.analyzeMessage("Message 3");

      const context = service.getContext();
      expect(context.messageHistory).toHaveLength(3);
      expect(context.messageHistory).toContain("Message 1");
    });

    it("should limit message history to 10 messages", () => {
      for (let i = 1; i <= 15; i++) {
        service.analyzeMessage(`Message ${i}`);
      }

      const context = service.getContext();
      expect(context.messageHistory).toHaveLength(10);
      expect(context.messageHistory[0]).toBe("Message 6");
    });

    it("should reset context correctly", () => {
      service.analyzeMessage("Test message");
      service.trackError();
      
      service.resetContext();
      
      const context = service.getContext();
      expect(context.messageHistory).toHaveLength(0);
      expect(context.errorCount).toBe(0);
      expect(context.repetitionCount).toBe(0);
      expect(context.lastEmotionState).toBe(EmotionState.NEUTRAL);
    });
  });

  describe("callbacks", () => {
    it("should trigger emotion detection callbacks", () => {
      let capturedAnalysis = null;
      service.onEmotionDetected((analysis) => {
        capturedAnalysis = analysis;
      });

      service.analyzeMessage("This is great!");
      
      expect(capturedAnalysis).not.toBeNull();
      expect(capturedAnalysis?.state).toBe(EmotionState.POSITIVE);
    });

    it("should trigger frustration callbacks", () => {
      let capturedLevel = 0;
      service.onFrustrationDetected((level) => {
        capturedLevel = level;
      });

      service.analyzeMessage("This is broken and doesn't work");
      
      expect(capturedLevel).toBeGreaterThan(0);
    });

    it("should cleanup callbacks", () => {
      let callbackCalled = false;
      service.onEmotionDetected(() => {
        callbackCalled = true;
      });

      service.cleanup();
      service.analyzeMessage("Test");

      expect(callbackCalled).toBe(false);
    });
  });
});
