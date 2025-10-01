# Voice-Driven Iterative Building with Emotion Detection

This feature enhances the Dyad desktop app with voice input capabilities and emotion detection for adaptive user experiences.

## Features

### 1. Voice Input

- **Web Speech API Integration**: Uses the browser's built-in speech recognition for privacy and low latency
- **Microphone Button**: Click the microphone icon in the chat input to start/stop voice input
- **Visual Feedback**: The button shows recording status with animations and color changes
- **Transcript Display**: Interim results appear as you speak, final results are inserted into the chat input

### 2. Emotion Detection

- **Sentiment Analysis**: Detects positive, negative, neutral, and frustrated emotional states
- **Frustration Detection**: Identifies frustration through:
  - Repeated similar messages
  - Negative keywords (broken, error, doesn't work, etc.)
  - Multiple consecutive errors
- **Adaptive Prompts**: Automatically modifies prompts when frustration is detected to provide:
  - Clear, step-by-step solutions
  - Additional guidance and context
  - More helpful responses

### 3. Adaptive Responses

When frustration is detected, the system:

- Adds context to the AI prompt indicating the user needs extra help
- Suggests clearer, more structured solutions
- Provides step-by-step guidance instead of complex explanations

## Usage

### Desktop App

1. **Enable Voice Input**:
   - Click the microphone button in the chat input
   - Grant microphone permissions if prompted
   - Speak your request or command
   - Click the button again to stop recording

2. **View Emotion State**:
   - A colored indicator appears on the microphone button when emotions are detected
   - Red pulse indicates frustration
   - The tooltip shows the current emotion state

### VS Code Extension

1. **Start Voice Input**:
   - Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
   - Type "Dyad: Start Voice Input"
   - Or click the microphone icon in the status bar

2. **Voice Commands**:
   - "Create app [name]" - Creates a new Dyad app
   - "Run app" - Starts the current app
   - "Stop app" - Stops the running app
   - Other commands are sent to Dyad chat

## Browser Compatibility

Voice input requires a browser with Web Speech API support:

- ✅ Chrome/Chromium (best support)
- ✅ Microsoft Edge
- ✅ Safari (limited support)
- ❌ Firefox (not supported)

## Privacy & Security

- **Local Processing**: All speech recognition is done on-device using the browser's native APIs
- **No Data Sent**: Voice data is not sent to external servers (except the browser's own speech service)
- **Emotion Detection**: Uses text-based heuristics only - no audio analysis or ML models required

## Configuration

Voice settings can be configured in User Settings:

```typescript
{
  "voiceSettings": {
    "enabled": true,
    "language": "en-US",
    "continuousMode": false,
    "emotionDetection": true,
    "adaptivePrompts": true
  }
}
```

### Settings Options

- **enabled**: Enable/disable voice input globally
- **language**: Speech recognition language (e.g., "en-US", "es-ES", "fr-FR")
- **continuousMode**: Keep listening after each command (not yet implemented)
- **emotionDetection**: Enable/disable emotion detection
- **adaptivePrompts**: Enable/disable adaptive prompt modification

## Technical Architecture

### Services

1. **VoiceInputService** (`src/services/voice/VoiceInputService.ts`)
   - Manages Web Speech API integration
   - Handles microphone state and permissions
   - Provides callbacks for results, errors, and state changes

2. **EmotionDetectionService** (`src/services/emotion/EmotionDetectionService.ts`)
   - Analyzes message sentiment using keyword matching
   - Detects frustration from patterns and repetition
   - Generates adaptive prompts based on emotion state

3. **useVoiceInput Hook** (`src/hooks/useVoiceInput.ts`)
   - React hook combining voice input and emotion detection
   - Manages state and lifecycle
   - Provides easy integration with components

### Components

1. **VoiceInputButton** (`src/components/chat/VoiceInputButton.tsx`)
   - Microphone button with visual feedback
   - Shows recording state and emotion indicators
   - Integrated into ChatInput and HomeChatInput

### IPC Communication

Voice settings are persisted via IPC handlers:

- `voice:get-settings` - Retrieve current voice settings
- `voice:update-settings` - Update voice settings

## Future Enhancements

1. **Advanced Speech Recognition**:
   - Integrate OpenAI Whisper for better accuracy
   - Support for offline speech recognition
   - Custom wake word detection

2. **Enhanced Emotion Detection**:
   - ML-based emotion detection from audio tone
   - Voice stress analysis
   - Facial expression analysis (via camera)

3. **Advanced Features**:
   - Voice synthesis for AI responses
   - Multi-language support
   - Custom voice commands/shortcuts
   - Voice-to-code generation

## Testing

Run emotion detection tests:

```bash
npm test -- src/__tests__/emotion_detection.test.ts
```

Test coverage includes:

- Emotion state detection (neutral, positive, negative, frustrated)
- Frustration detection from repetition
- Error tracking and frustration triggers
- Adaptive prompt generation
- Context management and history

## Troubleshooting

### Voice input not working

- Check browser compatibility (use Chrome/Edge)
- Ensure microphone permissions are granted
- Check browser console for errors
- Try refreshing the page

### Emotion detection not activating

- Check that emotionDetection is enabled in settings
- Try messages with clear emotional keywords
- Frustration requires multiple similar messages or errors

### No transcription appearing

- Speak clearly and at normal volume
- Check microphone input levels in system settings
- Ensure correct language is selected
- Try a different browser if issues persist
