/**
 * VoiceInputService handles voice input using the Web Speech API
 * This provides on-device speech recognition for privacy and low latency
 */

export enum VoiceInputState {
  IDLE = "idle",
  LISTENING = "listening",
  PROCESSING = "processing",
  ERROR = "error",
}

export interface VoiceInputResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

type VoiceInputCallback = (result: VoiceInputResult) => void;
type VoiceStateCallback = (state: VoiceInputState) => void;
type VoiceErrorCallback = (error: string) => void;

export class VoiceInputService {
  private recognition: SpeechRecognition | null = null;
  private state: VoiceInputState = VoiceInputState.IDLE;
  private resultCallbacks: VoiceInputCallback[] = [];
  private stateCallbacks: VoiceStateCallback[] = [];
  private errorCallbacks: VoiceErrorCallback[] = [];
  private isSupported: boolean = false;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    // Check for Web Speech API support
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API not supported in this browser");
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognitionAPI();
  }

  public isAvailable(): boolean {
    return this.isSupported && this.recognition !== null;
  }

  public getState(): VoiceInputState {
    return this.state;
  }

  public startListening(options: VoiceInputOptions = {}): boolean {
    if (!this.isAvailable()) {
      this.notifyError("Voice input is not supported in this browser");
      return false;
    }

    if (this.state === VoiceInputState.LISTENING) {
      console.warn("Already listening");
      return false;
    }

    try {
      this.configureRecognition(options);
      this.setupEventHandlers();
      this.recognition!.start();
      this.setState(VoiceInputState.LISTENING);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.notifyError(`Failed to start voice input: ${message}`);
      this.setState(VoiceInputState.ERROR);
      return false;
    }
  }

  public stopListening(): void {
    if (!this.recognition || this.state === VoiceInputState.IDLE) {
      return;
    }

    try {
      this.recognition.stop();
      this.setState(VoiceInputState.IDLE);
    } catch (error) {
      console.error("Error stopping voice input:", error);
    }
  }

  public onResult(callback: VoiceInputCallback): () => void {
    this.resultCallbacks.push(callback);
    return () => {
      this.resultCallbacks = this.resultCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  public onStateChange(callback: VoiceStateCallback): () => void {
    this.stateCallbacks.push(callback);
    return () => {
      this.stateCallbacks = this.stateCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onError(callback: VoiceErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  private configureRecognition(options: VoiceInputOptions): void {
    if (!this.recognition) return;

    this.recognition.lang = options.language || "en-US";
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = options.maxAlternatives ?? 1;
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      this.notifyResult({
        transcript,
        confidence,
        isFinal: result.isFinal,
      });

      if (result.isFinal) {
        this.setState(VoiceInputState.PROCESSING);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.setState(VoiceInputState.ERROR);
      this.notifyError(`Voice input error: ${event.error}`);
    };

    this.recognition.onend = () => {
      if (this.state === VoiceInputState.LISTENING) {
        this.setState(VoiceInputState.IDLE);
      }
    };

    this.recognition.onstart = () => {
      this.setState(VoiceInputState.LISTENING);
    };
  }

  private setState(state: VoiceInputState): void {
    this.state = state;
    this.stateCallbacks.forEach((callback) => callback(state));
  }

  private notifyResult(result: VoiceInputResult): void {
    this.resultCallbacks.forEach((callback) => callback(result));
  }

  private notifyError(error: string): void {
    this.errorCallbacks.forEach((callback) => callback(error));
  }

  public cleanup(): void {
    this.stopListening();
    this.resultCallbacks = [];
    this.stateCallbacks = [];
    this.errorCallbacks = [];
  }
}

// Export a singleton instance
export const voiceInputService = new VoiceInputService();
