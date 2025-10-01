/**
 * Hook for voice input with integrated emotion detection
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  VoiceInputService,
  VoiceInputState,
  VoiceInputResult,
  voiceInputService,
} from "@/services/voice/VoiceInputService";
import {
  EmotionDetectionService,
  EmotionState,
  EmotionAnalysis,
  emotionDetectionService,
} from "@/services/emotion/EmotionDetectionService";

export interface VoiceInputHookState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  emotionState: EmotionState;
  emotionAnalysis: EmotionAnalysis | null;
  frustrationLevel: number;
}

export interface VoiceInputHookActions {
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  resetEmotion: () => void;
}

export function useVoiceInput(): [VoiceInputHookState, VoiceInputHookActions] {
  const [state, setState] = useState<VoiceInputHookState>({
    isListening: false,
    transcript: "",
    interimTranscript: "",
    error: null,
    isSupported: voiceInputService.isAvailable(),
    emotionState: EmotionState.NEUTRAL,
    emotionAnalysis: null,
    frustrationLevel: 0,
  });

  const finalTranscriptRef = useRef<string>("");

  useEffect(() => {
    // Subscribe to voice input state changes
    const unsubscribeState = voiceInputService.onStateChange((voiceState) => {
      setState((prev) => ({
        ...prev,
        isListening: voiceState === VoiceInputState.LISTENING,
        error: voiceState === VoiceInputState.ERROR ? prev.error : null,
      }));
    });

    // Subscribe to voice input results
    const unsubscribeResult = voiceInputService.onResult((result: VoiceInputResult) => {
      if (result.isFinal) {
        // Final result - add to final transcript
        const newTranscript = finalTranscriptRef.current + result.transcript + " ";
        finalTranscriptRef.current = newTranscript;

        // Analyze emotion for final transcript
        const analysis = emotionDetectionService.analyzeMessage(result.transcript);

        setState((prev) => ({
          ...prev,
          transcript: newTranscript.trim(),
          interimTranscript: "",
          emotionAnalysis: analysis,
          emotionState: analysis.state,
        }));
      } else {
        // Interim result - show as temporary
        setState((prev) => ({
          ...prev,
          interimTranscript: result.transcript,
        }));
      }
    });

    // Subscribe to voice input errors
    const unsubscribeError = voiceInputService.onError((error: string) => {
      setState((prev) => ({
        ...prev,
        error,
      }));
      emotionDetectionService.trackError();
    });

    // Subscribe to emotion detection
    const unsubscribeEmotion = emotionDetectionService.onEmotionDetected(
      (analysis: EmotionAnalysis) => {
        setState((prev) => ({
          ...prev,
          emotionAnalysis: analysis,
          emotionState: analysis.state,
        }));
      }
    );

    // Subscribe to frustration detection
    const unsubscribeFrustration = emotionDetectionService.onFrustrationDetected(
      (level: number) => {
        setState((prev) => ({
          ...prev,
          frustrationLevel: level,
        }));
      }
    );

    return () => {
      unsubscribeState();
      unsubscribeResult();
      unsubscribeError();
      unsubscribeEmotion();
      unsubscribeFrustration();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.",
      }));
      return;
    }

    const success = voiceInputService.startListening({
      continuous: true,
      interimResults: true,
      language: "en-US",
    });

    if (!success) {
      setState((prev) => ({
        ...prev,
        error: "Failed to start voice input. Please check microphone permissions.",
      }));
    }
  }, [state.isSupported]);

  const stopListening = useCallback(() => {
    voiceInputService.stopListening();
  }, []);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimTranscript: "",
      error: null,
    }));
  }, []);

  const resetEmotion = useCallback(() => {
    emotionDetectionService.resetContext();
    setState((prev) => ({
      ...prev,
      emotionState: EmotionState.NEUTRAL,
      emotionAnalysis: null,
      frustrationLevel: 0,
    }));
  }, []);

  return [
    state,
    {
      startListening,
      stopListening,
      clearTranscript,
      resetEmotion,
    },
  ];
}
