# Voice Input Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────┐                 │
│  │  ChatInput       │         │ HomeChatInput    │                 │
│  │                  │         │                  │                 │
│  │  ┌────────────┐  │         │  ┌────────────┐  │                 │
│  │  │ Voice      │  │         │  │ Voice      │  │                 │
│  │  │ Button     │◄─┼─────────┼─►│ Button     │  │                 │
│  │  └────────────┘  │         │  └────────────┘  │                 │
│  │        │         │         │        │         │                 │
│  └────────┼─────────┘         └────────┼─────────┘                 │
│           │                            │                            │
└───────────┼────────────────────────────┼────────────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      REACT HOOKS LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│              ┌────────────────────────────────┐                     │
│              │   useVoiceInput Hook           │                     │
│              │                                │                     │
│              │  • Manages state              │                     │
│              │  • Combines voice & emotion   │                     │
│              │  • Provides callbacks         │                     │
│              └───────────┬──────────┬─────────┘                     │
│                          │          │                               │
└──────────────────────────┼──────────┼───────────────────────────────┘
                           │          │
                ┌──────────▼──────┐   └──────────▼──────────┐
                │                 │                          │
┌───────────────┴───────────────┐ │  ┌──────────────────────┴────────┐
│    VOICE INPUT SERVICE        │ │  │ EMOTION DETECTION SERVICE     │
│                               │ │  │                               │
│  • Web Speech API wrapper     │ │  │  • Text analysis             │
│  • State management           │ │  │  • Keyword matching          │
│  • Microphone handling        │ │  │  • Frustration detection     │
│  • Transcript callbacks       │ │  │  • Adaptive prompts          │
│                               │ │  │  • Context management        │
└───────────────┬───────────────┘ │  └───────────────────────────────┘
                │                 │
                ▼                 │
┌───────────────────────────────┐ │
│   Web Speech API              │ │
│   (Browser Native)            │ │
│                               │ │
│  • Speech Recognition         │ │
│  • Language Detection         │ │
│  • Confidence Scoring         │ │
└───────────────────────────────┘ │
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    IPC & SETTINGS LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  IPC Handlers                                                 │  │
│  │                                                                │  │
│  │  voice:get-settings  ────────► Read from UserSettings JSON   │  │
│  │  voice:update-settings ───────► Write to UserSettings JSON   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UserSettings Schema                                          │  │
│  │  {                                                            │  │
│  │    voiceSettings: {                                           │  │
│  │      enabled: boolean                                         │  │
│  │      language: string                                         │  │
│  │      emotionDetection: boolean                                │  │
│  │      adaptivePrompts: boolean                                 │  │
│  │    }                                                          │  │
│  │  }                                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    VS CODE EXTENSION                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  VoiceCommandService                                        │    │
│  │                                                             │    │
│  │  • Command palette integration                              │    │
│  │  • Status bar indicator                                     │    │
│  │  • Voice command processing                                 │    │
│  │  • Dyad Desktop API communication                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  Voice Commands:                                                     │
│  • "Create app [name]" → dyad.createApp                             │
│  • "Run app"           → dyad.runApp                                │
│  • "Stop app"          → dyad.stopApp                               │
│  • Other commands      → Send to Dyad chat                          │
└─────────────────────────────────────────────────────────────────────┘


DATA FLOW:
──────────

1. USER SPEAKS
   │
   ▼
2. VoiceInputService captures audio
   │
   ▼
3. Web Speech API transcribes
   │
   ▼
4. useVoiceInput receives transcript
   │
   ▼
5. EmotionDetectionService analyzes text
   │
   ▼
6. Emotion state detected (neutral/positive/negative/frustrated)
   │
   ▼
7. Adaptive prompt generated (if frustrated)
   │
   ▼
8. Transcript + emotion context sent to chat
   │
   ▼
9. AI receives emotion-aware prompt
   │
   ▼
10. User receives adaptive response


EMOTION DETECTION FLOW:
───────────────────────

Message Input
   │
   ▼
Keyword Analysis
   │
   ├─► Frustration keywords? ───► Increase frustration score
   ├─► Negative keywords?    ───► Decrease emotion score
   └─► Positive keywords?    ───► Increase emotion score
   │
   ▼
Repetition Detection
   │
   └─► Similar to last message? ───► Increase frustration score
   │
   ▼
Error Tracking
   │
   └─► Multiple errors? ───────────► Trigger frustration state
   │
   ▼
Emotion State Determined
   │
   ├─► FRUSTRATED ─────► Add guidance context to prompt
   ├─► NEGATIVE   ─────► Add help context to prompt
   ├─► POSITIVE   ─────► No modification
   └─► NEUTRAL    ─────► No modification
   │
   ▼
Prompt sent to AI with context
```

## Key Integration Points

### 1. Voice Input → Chat

```typescript
// VoiceInputButton captures transcript
onTranscriptChange(transcript) →
  // Updates chat input value
  setInputValue(transcript) →
    // User submits or edits
    handleSubmit()
```

### 2. Emotion Detection → Adaptive Prompts

```typescript
// Analyze each message
emotionDetectionService.analyzeMessage(message) →
  // Detect emotion state
  EmotionState.FRUSTRATED →
    // Generate adaptive prompt
    generateAdaptivePrompt(originalPrompt, emotionState) →
      // Send modified prompt to AI
      streamMessage({ prompt: adaptivePrompt })
```

### 3. Settings Persistence

```typescript
// Load settings
IpcClient.getVoiceSettings() →
  // User modifies settings
  updateVoiceSettings(newSettings) →
    // Save via IPC
    IpcClient.updateVoiceSettings(newSettings) →
      // Write to JSON file
      writeSettings({ voiceSettings: newSettings })
```

### 4. VS Code Integration

```typescript
// User activates voice command
Command Palette → "Dyad: Start Voice Input" →
  // VoiceCommandService starts listening
  voiceCommandService.startListening() →
    // Simulated voice input (for now)
    showInputBox("Enter command") →
      // Process command
      processVoiceCommand(command) →
        // Execute Dyad action
        executeCommand('dyad.createApp')
```

## Privacy & Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER DEVICE                           │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Microphone Input                               │    │
│  └──────────────┬──────────────────────────────────┘    │
│                 ▼                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │  Browser Web Speech API                        │    │
│  │  (Local Processing*)                           │    │
│  └──────────────┬──────────────────────────────────┘    │
│                 ▼                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │  VoiceInputService                             │    │
│  │  (Transcript Only)                             │    │
│  └──────────────┬──────────────────────────────────┘    │
│                 ▼                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │  EmotionDetectionService                       │    │
│  │  (Text Analysis - No Audio)                    │    │
│  └──────────────┬──────────────────────────────────┘    │
│                 ▼                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │  Dyad AI Processing                            │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘

* Web Speech API may use browser's cloud service
  but audio never reaches Dyad servers
```

## Component Relationships

```
VoiceInputButton
    ├── useVoiceInput (Hook)
    │   ├── VoiceInputService
    │   │   └── Web Speech API
    │   └── EmotionDetectionService
    │       └── Text Analysis
    └── UI State & Feedback

ChatInput/HomeChatInput
    ├── VoiceInputButton
    ├── EmotionDetectionService (direct)
    └── Adaptive Prompt Generation
```
