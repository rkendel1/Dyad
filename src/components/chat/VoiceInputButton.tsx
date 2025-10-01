/**
 * VoiceInputButton - Component for triggering voice input in chat
 */
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceInputButtonProps {
  onTranscriptChange: (transcript: string) => void;
  onEmotionDetected?: (emotionState: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInputButton({
  onTranscriptChange,
  onEmotionDetected,
  disabled = false,
  className = "",
}: VoiceInputButtonProps) {
  const [voiceState, voiceActions] = useVoiceInput();

  // Update parent component when transcript changes
  useEffect(() => {
    if (voiceState.transcript) {
      onTranscriptChange(voiceState.transcript);
    }
  }, [voiceState.transcript, onTranscriptChange]);

  // Notify parent about emotion state
  useEffect(() => {
    if (onEmotionDetected && voiceState.emotionAnalysis) {
      onEmotionDetected(voiceState.emotionState);
    }
  }, [voiceState.emotionState, voiceState.emotionAnalysis, onEmotionDetected]);

  const handleClick = () => {
    if (voiceState.isListening) {
      voiceActions.stopListening();
    } else {
      voiceActions.clearTranscript();
      voiceActions.startListening();
    }
  };

  if (!voiceState.isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={true}
              className={`opacity-50 ${className}`}
            >
              <MicOff size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice input not supported in this browser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getButtonContent = () => {
    if (voiceState.isListening) {
      return (
        <>
          <Mic size={20} className="text-red-500 animate-pulse" />
          {voiceState.interimTranscript && (
            <span className="ml-2 text-xs text-muted-foreground">
              {voiceState.interimTranscript.slice(0, 30)}
              {voiceState.interimTranscript.length > 30 ? "..." : ""}
            </span>
          )}
        </>
      );
    }

    return <Mic size={20} />;
  };

  const getTooltipText = () => {
    if (voiceState.isListening) {
      return "Stop listening (click to finish)";
    }
    if (voiceState.error) {
      return voiceState.error;
    }
    return "Start voice input";
  };

  const getEmotionIndicator = () => {
    if (!voiceState.emotionAnalysis) return null;

    const emotionColors = {
      frustrated: "text-red-500",
      negative: "text-orange-500",
      positive: "text-green-500",
      neutral: "text-gray-500",
    };

    const color = emotionColors[voiceState.emotionState] || "text-gray-500";

    if (voiceState.frustrationLevel > 0.6) {
      return (
        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${color} animate-pulse`} />
      );
    }

    return null;
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={voiceState.isListening ? "default" : "ghost"}
              size="icon"
              onClick={handleClick}
              disabled={disabled}
              className={className}
            >
              {getButtonContent()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
            {voiceState.emotionAnalysis && (
              <p className="text-xs mt-1">
                Emotion: {voiceState.emotionState}
                {voiceState.frustrationLevel > 0.6 && " (frustrated)"}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {getEmotionIndicator()}
    </div>
  );
}
