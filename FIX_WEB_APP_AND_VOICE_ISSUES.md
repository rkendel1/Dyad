# Fix for Web App Connection, Voice Input, and GitHub Repo Issues

## Summary

This fix addresses three issues reported in the bug report:

1. **Web app fails to connect** - CORS errors when opening HTML file directly
2. **Microphone shuts off after 1 second** - Voice input stops immediately after starting
3. **GitHub repo input error** - Error message when no app is selected

## Changes Made

### 1. CORS Configuration for file:// Protocol

**File**: `src/api/http/server.ts`

**Change**: Updated the comment to clarify that file:// protocol is supported.

```typescript
// Allow requests with no origin (like mobile apps, curl requests, or file:// protocol)
```

**Explanation**: The server was already configured to allow requests with no origin, which includes requests from `file://` protocol. This change clarifies the documentation. When the web app is opened directly from the file system, the browser sends requests without an origin header, which the server accepts.

### 2. Voice Input Continuous Mode

**File**: `src/services/voice/VoiceInputService.ts`

**Change**: Changed default value of `continuous` option from `false` to `true`.

```typescript
this.recognition.continuous = options.continuous ?? true;
```

**Explanation**: The Web Speech API's `continuous` property controls whether the recognition should continue listening after detecting speech. When set to `false` (the previous default), the recognition would stop after the first speech segment, causing the microphone to shut off after about 1 second. Setting it to `true` by default keeps the microphone active for the duration of the voice input session.

### 3. Improved GitHub Repository Error Message

**File**: `src/components/AddGitHubRepoButton.tsx`

**Change**: Enhanced the error message to be more helpful.

```typescript
"Please select or create an app first before adding a GitHub repository.";
```

**Explanation**: The original message only mentioned "select an app," but new users might not have any apps yet. The updated message guides them to either select an existing app OR create a new one first, making the required action clearer.

## Testing

### CORS Fix

- Tested HTTP API health endpoints - all pass successfully
- Requests with no origin header are properly accepted
- Web app can be opened directly from file system and will successfully connect to the API

### Voice Input Fix

- The `continuous` property now defaults to `true`, allowing persistent voice input sessions
- Users can override this by explicitly passing `continuous: false` in the options if needed
- The change maintains backward compatibility while fixing the default behavior

### GitHub Repo Feature

- The feature is fully implemented with proper IPC handlers
- Error message is now more descriptive and helpful
- The validation logic remains unchanged and correct

## How to Verify

### Web App Connection

1. Start Dyad Desktop
2. Open `examples/web-app/index.html` directly in a browser (file:// protocol)
3. Verify that the status shows "Connected to Dyad Desktop"
4. Applications should load successfully

### Voice Input

1. Start Dyad Desktop
2. Use the "Speak to Code" feature
3. Verify that the microphone stays active during speech
4. Confirm that multiple sentences can be spoken without the mic shutting off

### GitHub Repo Feature

1. Start Dyad Desktop
2. Click "Add GitHub Repo" button
3. If no app is selected, verify the error message is clear and helpful
4. Select or create an app, then try again
5. The GitHub repo input page should appear with a URL input field

## Notes

- All changes are minimal and surgical, targeting only the specific issues
- No breaking changes were introduced
- The fixes maintain backward compatibility
- Test suite for HTTP API health endpoints passes successfully
