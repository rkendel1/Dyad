# Dyad Collaboration Features

This document describes the real-time multi-collaborator sharing and synchronization features in the Dyad VS Code extension.

## Overview

The collaboration feature enables multiple developers to work on the same Dyad app simultaneously in real-time. It provides live cursor tracking, shared editing, integrated chat, inline comments, and role-based access control.

## Features

### 1. Real-Time Collaboration

- **Live Cursor Tracking**: See where other collaborators are editing in real-time
- **Selection Highlights**: View highlighted selections from all team members with unique colors
- **User Identifiers**: Each user has a distinct color and name badge
- **Synchronized Edits**: Changes are synchronized in real-time across all collaborators

### 2. Session Management

#### Starting a Collaboration Session

1. Click the Dyad icon in the Activity Bar
2. In the Collaboration sidebar section, click "Start Collaboration"
3. Select the app you want to collaborate on
4. Enter your name
5. Share the Session ID or collaboration link with team members

Command: `Dyad: Start Collaboration Session`

#### Joining a Collaboration Session

1. Get the session ID from the session owner
2. Click "Join Collaboration" in the sidebar
3. Enter the session ID
4. Enter your name
5. Start collaborating!

Command: `Dyad: Join Collaboration Session`

#### Leaving a Session

Click "Leave Session" in the sidebar or use the command palette.

Command: `Dyad: Leave Collaboration Session`

### 3. Role-Based Access Control

Three user roles are available:

- **Editor**: Full editing permissions
- **Reviewer**: Can comment and review but not edit
- **Viewer**: Read-only access

Session owners can change user roles from the collaboration panel.

### 4. Communication Features

#### Integrated Chat

- Real-time messaging between collaborators
- Chat history preserved during the session
- Accessible from the Collaboration Panel

To open: `Dyad: Show Collaboration Panel`

#### Inline Comments

- Add comments directly to specific lines of code
- Thread discussions on code changes
- Mark comments as resolved

To add: `Dyad: Add Inline Comment` or right-click on a line

### 5. Version History

- Automatic snapshots of collaboration sessions
- Track all changes during the session
- Ability to revert to previous states
- Compare versions

### 6. Collaboration Panel

The Collaboration Panel provides:

- List of active users with roles
- Integrated chat interface
- Inline comments management
- Session information

Access via: `Dyad: Show Collaboration Panel`

## Architecture

### Components

#### CollaborationService

Manages WebSocket connections and collaboration state:
- Session creation and joining
- Real-time event broadcasting
- User management
- Message handling

#### CollaborationPanel

WebView-based UI for:
- Chat interface
- User list
- Comment management
- Session controls

#### DecoratorManager

Handles visual decorations:
- Live cursor positions
- Selection highlights
- Inline comment markers
- User-specific colors

#### CollaborationSidebarProvider

Tree view in the sidebar showing:
- Session status
- Quick actions
- User list

### WebSocket Events

The collaboration system uses the following event types:

- `USER_JOINED`: New user joins session
- `USER_LEFT`: User leaves session
- `USER_CURSOR_MOVE`: Cursor position update
- `USER_SELECTION_CHANGE`: Selection change
- `DOCUMENT_CHANGE`: Document edit
- `CHAT_MESSAGE`: Chat message
- `INLINE_COMMENT_ADD`: New comment
- `INLINE_COMMENT_RESOLVE`: Comment resolved
- `ROLE_CHANGED`: User role updated
- `LOCK_ACQUIRED`: Resource lock acquired
- `LOCK_RELEASED`: Resource lock released
- `VERSION_SNAPSHOT`: Version snapshot created

## Server Requirements

The collaboration feature requires a WebSocket server running on the Dyad Desktop backend. The extension connects to:

```
ws://localhost:3000
```

The server should implement the following Socket.IO events:

### Client → Server

- `session:create`: Create a new collaboration session
- `session:join`: Join an existing session
- `session:leave`: Leave current session
- `chat:message`: Send chat message
- `inline:comment:add`: Add inline comment
- `inline:comment:resolve`: Resolve comment
- `user:cursor:move`: Update cursor position
- `user:selection:change`: Update selection
- `document:change`: Broadcast document change
- `role:change`: Change user role
- `version:snapshot`: Create version snapshot

### Server → Client

The server should broadcast all collaboration events to relevant session participants.

## Integration with Dyad Desktop

All changes made during collaboration sessions are synchronized with Dyad Desktop in real-time to ensure consistency across platforms. The collaboration layer sits on top of the existing Dyad API.

## Security and Privacy

- Session IDs are unique and unpredictable
- Sessions are isolated from each other
- Role-based access control prevents unauthorized edits
- All communication goes through the local Dyad Desktop instance

## Performance Considerations

- Efficient delta synchronization for document changes
- Message batching for rapid changes
- Connection quality monitoring
- Automatic reconnection on network issues
- Health check caching to reduce overhead

## Future Enhancements

Planned improvements:

1. **Conflict Resolution**: Advanced merge algorithms for simultaneous edits
2. **GitHub Authentication**: OAuth integration for user identity
3. **Persistent Sessions**: Sessions that survive VS Code restarts
4. **Audio/Video**: Integrated voice/video calling
5. **Screen Sharing**: Share your screen with collaborators
6. **Code Review Tools**: Built-in PR review capabilities
7. **Metrics and Analytics**: Collaboration statistics and insights

## Troubleshooting

### Cannot Connect to Collaboration Server

**Problem**: "Failed to connect to collaboration server" error

**Solutions**:
1. Ensure Dyad Desktop is running
2. Check that port 3000 is not blocked
3. Verify WebSocket support is enabled
4. Check the Output panel for detailed errors

### Session Join Failed

**Problem**: Unable to join a session with valid ID

**Solutions**:
1. Verify the session ID is correct
2. Check if the session is still active
3. Ensure you have network connectivity
4. Try creating a new session

### Cursors/Selections Not Showing

**Problem**: Can't see other users' cursors or selections

**Solutions**:
1. Check if the file is open in your editor
2. Ensure decorations are enabled in VS Code
3. Verify the session is active
4. Try refreshing the editor

### Chat Messages Not Appearing

**Problem**: Chat messages not synchronized

**Solutions**:
1. Check WebSocket connection in Output panel
2. Verify the Collaboration Panel is open
3. Try leaving and rejoining the session
4. Check Dyad Desktop logs

## Getting Help

- **View Logs**: Check the "Dyad" output channel
- **Report Issues**: [GitHub Issues](https://github.com/rkendel1/Dyad/issues)
- **Community**: [r/dyadbuilders](https://www.reddit.com/r/dyadbuilders/)

## API Reference

For detailed API documentation, see the TypeScript interfaces in:

- `src/collaboration/types.ts`
- `src/collaboration/collaborationService.ts`
- `src/collaboration/collaborationPanel.ts`
- `src/collaboration/decoratorManager.ts`
