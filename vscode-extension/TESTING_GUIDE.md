# Testing the Dyad Collaboration Features

This guide provides step-by-step instructions for testing the real-time collaboration features in the Dyad VS Code extension.

## Prerequisites

1. VS Code 1.80.0 or higher
2. Node.js installed
3. Dyad VS Code extension source code
4. Socket.IO installed (`npm install socket.io`)

## Quick Start with Mock Server

### 1. Start the Mock Server

```bash
cd vscode-extension
npm install socket.io
npm run mock-server
```

You should see:

```
================================================
  Dyad Mock Collaboration Server
================================================
  Server running on port 3000
  WebSocket endpoint: ws://localhost:3000
------------------------------------------------
  This server simulates the collaboration
  features for the Dyad VS Code extension.
================================================

Waiting for connections...
```

### 2. Open Extension in Development Mode

1. Open the `vscode-extension` folder in VS Code
2. Press `F5` to launch the Extension Development Host
3. A new VS Code window will open with the extension loaded

### 3. Test Single User Session

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run `Dyad: Start Collaboration Session`
3. You'll be prompted to:
   - Select an app (may need to create one first)
   - Enter your name
4. A success message appears with the Session ID
5. The Collaboration sidebar shows your active session

### 4. Test Multi-User Collaboration

#### Window 1 (Session Owner):

1. Start a collaboration session as above
2. Copy the Session ID from the success message (or click "Copy Session ID")
3. Share this ID with another tester (or use in second window)

#### Window 2 (Joining User):

1. Open another VS Code window
2. Open the Command Palette
3. Run `Dyad: Join Collaboration Session`
4. Enter the Session ID from Window 1
5. Enter your name (different from Window 1)
6. You should join successfully

#### Verify in Both Windows:

Check the mock server logs - you should see:

```
✓ Session created: session-xxxxx for app: MyApp
✓ User Alice joined session session-xxxxx
✓ User Bob joined session session-xxxxx
```

## Feature Testing

### Test 1: User Presence

**What to Test**: Live cursor and selection tracking

**Steps**:

1. In Window 1, open a file and move the cursor
2. In Window 2, you should see cursor decorations from Window 1
3. In Window 1, select some text
4. In Window 2, you should see the selection highlighted

**Expected Result**: Each user's cursor and selection is visible with their unique color

### Test 2: Chat Communication

**What to Test**: Integrated chat functionality

**Steps**:

1. In either window, run `Dyad: Show Collaboration Panel`
2. Switch to the "Chat" tab
3. Type a message and click "Send"
4. In the other window, open the Collaboration Panel
5. You should see the message appear

**Expected Result**: Messages appear in real-time in all participants' chat panels

### Test 3: Inline Comments

**What to Test**: Adding and resolving comments

**Steps**:

1. In Window 1, place cursor on a specific line
2. Run `Dyad: Add Inline Comment`
3. Enter comment text: "This needs review"
4. In Window 2, open Collaboration Panel → Comments tab
5. You should see the comment
6. Click "Resolve" on the comment
7. In Window 1, the comment should show as resolved

**Expected Result**: Comments appear on correct lines and can be resolved

### Test 4: Role Management

**What to Test**: Role-based access control

**Steps**:

1. In the Collaboration Panel → Users tab
2. View the list of users with their roles
3. Session owner can change roles (if implemented in UI)

**Expected Result**: Users show correct roles (Editor, Reviewer, Viewer)

### Test 5: Session Lifecycle

**What to Test**: Joining and leaving sessions

**Steps**:

1. Start a session in Window 1
2. Join from Window 2
3. In Window 2, run `Dyad: Leave Collaboration Session`
4. Check mock server logs for leave confirmation
5. In Window 1, user count should update

**Expected Result**: Users can join and leave cleanly

### Test 6: Disconnect Handling

**What to Test**: Graceful disconnect handling

**Steps**:

1. Start a session in Window 1
2. Join from Window 2
3. Close Window 2 abruptly
4. Check mock server logs

**Expected Result**: Server detects disconnect and notifies other users

## Testing Scenarios

### Scenario 1: Basic Collaboration Workflow

1. **Setup**
   - Alice starts session for "MyApp"
   - Bob joins session
   - Carol joins session

2. **Collaboration**
   - Alice: Opens file, adds comment "Review this function"
   - Bob: Sees comment, replies in chat "Looks good"
   - Carol: Resolves the comment
   - All see updates in real-time

3. **Cleanup**
   - All users leave session
   - Session is cleaned up

### Scenario 2: Code Review Session

1. **Setup**
   - Reviewer starts session
   - Developer joins as Editor
   - Stakeholder joins as Viewer

2. **Review**
   - Developer makes changes
   - Reviewer adds inline comments
   - Stakeholder can see but not edit
   - Discussion happens in chat

### Scenario 3: Pair Programming

1. **Setup**
   - Two developers, both as Editors
   - Start session on "FeatureBranch" app

2. **Collaboration**
   - Both can see cursors
   - Real-time selection tracking
   - Quick questions via chat
   - Comments for TODO items

## Mock Server Event Monitoring

The mock server logs all events for debugging:

```
✓ Session created: session-xxxxx for app: MyApp
✓ User Alice joined session session-xxxxx
✓ User Bob joined session session-xxxxx
Chat message in session session-xxxxx: Hello Bob!
Comment added in session session-xxxxx on line 42
✓ Role changed for user user-yyyy to editor
✓ User Bob left session session-xxxxx
```

## Troubleshooting

### Issue: Cannot connect to server

**Symptoms**: "Failed to connect to collaboration server" error

**Solutions**:

1. Verify mock server is running: `npm run mock-server`
2. Check port 3000 is available: `lsof -i :3000`
3. Check VS Code Output panel → Dyad for errors

### Issue: Session not found

**Symptoms**: "Session not found" when joining

**Solutions**:

1. Verify Session ID is correct (copy-paste recommended)
2. Ensure the session creator's window is still active
3. Check mock server logs for session creation

### Issue: Cursor/selection not showing

**Symptoms**: Can't see other users' cursors

**Solutions**:

1. Ensure same file is open in both windows
2. Check if decorations are enabled in VS Code
3. Try refreshing the window

### Issue: Chat messages missing

**Symptoms**: Messages not appearing

**Solutions**:

1. Ensure Collaboration Panel is open
2. Switch to Chat tab
3. Check WebSocket connection in Output panel
4. Restart mock server

## Performance Testing

### Test with Multiple Users

1. Start mock server
2. Open 5+ VS Code windows
3. All join same session
4. Perform rapid actions:
   - Move cursors quickly
   - Send multiple chat messages
   - Add several comments

**Expected**: Server handles load without crashes or lag

### Test Session Cleanup

1. Create 10 sessions
2. Leave all sessions
3. Check mock server logs for cleanup

**Expected**: Empty sessions are deleted properly

## Integration with Dyad Desktop

Once Dyad Desktop has WebSocket support:

### Setup

1. Stop mock server
2. Start Dyad Desktop
3. Verify WebSocket server on port 3000
4. Test extension with real backend

### Additional Tests

1. Verify app data syncs between extension and desktop
2. Test session persistence across restarts
3. Validate authentication flow (if implemented)

## Automated Testing (Future)

Example unit test structure:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CollaborationService } from "./collaborationService";

describe("CollaborationService", () => {
  let service: CollaborationService;

  beforeEach(() => {
    service = new CollaborationService(mockOutputChannel);
  });

  it("should create a session", async () => {
    const session = await service.startSession(1, "TestApp", "Alice");
    expect(session.id).toBeDefined();
    expect(session.appName).toBe("TestApp");
  });

  // More tests...
});
```

## Reporting Issues

When reporting bugs, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Mock server logs**
5. **VS Code Output panel logs (Dyad channel)**
6. **Screenshots if relevant**

## Next Steps

After successful testing:

1. ✅ Verify all features work with mock server
2. 📋 Document any issues found
3. 🔧 Fix identified bugs
4. 🏗️ Implement real backend in Dyad Desktop
5. 🧪 Re-test with production backend
6. 📚 Update documentation
7. 🚀 Deploy to users

## Resources

- [Mock Server Code](mock-collaboration-server.js)
- [Backend Integration Guide](BACKEND_INTEGRATION.md)
- [Collaboration User Guide](COLLABORATION.md)
- [Development Guide](DEVELOPMENT.md)
