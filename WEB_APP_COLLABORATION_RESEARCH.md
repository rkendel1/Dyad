# Real-time Collaboration Research - Web App

## Overview

This document outlines the research and findings for implementing real-time collaboration features in the Dyad web application to achieve parity with the desktop application.

## Current Desktop Implementation

The desktop application has a collaboration service implemented using WebSockets (Socket.IO) located at:
- `vscode-extension/src/collaboration/collaborationService.ts`

The desktop implementation includes:
- WebSocket connection management
- Session creation and joining
- User presence tracking
- Collaborative editing awareness
- File synchronization

## Web Application Requirements

To implement real-time collaboration in the web app, we would need:

1. **WebSocket Server Infrastructure**
   - The current HTTP API server needs WebSocket support
   - Socket.IO integration with Express
   - Session management and state persistence

2. **Client-Side WebSocket Integration**
   - Socket.IO client library in the web app
   - Connection state management with React
   - Real-time event handling

3. **Presence Indicators**
   - Show active users in a session
   - Display user cursors/selections in files
   - Activity indicators in the UI

4. **Collaborative Editing**
   - Operational transformation or CRDT for conflict resolution
   - Real-time diff synchronization
   - File lock management

## Implementation Recommendations

### Phase 1: Basic Presence (Feasible)
- Add WebSocket server to the HTTP API
- Implement basic presence tracking
- Show "who's online" indicator
- Display active users in app details page

### Phase 2: File Awareness (Complex)
- Track which files users are viewing/editing
- Show indicators when multiple users are in same file
- Notify on conflicting edits

### Phase 3: Real-time Editing (Most Complex)
- Implement operational transformation
- Synchronize cursor positions
- Live collaborative editing with Monaco editor
- Conflict resolution UI

## Current Limitations

### Web App vs Desktop

**Desktop Advantages:**
- Direct file system access
- Native OS integration
- Lower latency for local operations
- Full VSCode extension ecosystem

**Web App Limitations:**
- No direct file system access (requires API calls)
- Higher latency for operations
- Browser security restrictions
- Limited to HTTP/WebSocket protocols

### Technical Challenges

1. **State Synchronization**
   - Need to keep server state in sync across WebSocket and HTTP
   - Session management across multiple tabs/browsers
   - Handling network disconnections and reconnections

2. **Conflict Resolution**
   - Multiple users editing same file simultaneously
   - Race conditions between HTTP file saves and WebSocket updates
   - Maintaining consistency across clients

3. **Scalability**
   - WebSocket connections consume server resources
   - Need efficient message broadcasting
   - State persistence for session recovery

## Recommended Approach for Web App

### Short-term (Minimal Implementation)

**1. Connection Status Indicator** ✅ (Already Implemented)
- Shows if connected to Dyad Desktop
- Displays connection state in header

**2. Basic Activity Indicators**
- Show when AI is processing
- Display loading states during operations
- Indicate when files are being saved

**3. User Notifications**
- Toast notifications for important events
- Alert when someone else modifies files
- Notify on chat updates

### Long-term (Full Collaboration)

**1. WebSocket Integration**
```typescript
// Server-side (HTTP API)
import { Server as SocketIOServer } from "socket.io";
import type { Server } from "http";

export function setupWebSocket(server: Server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: ["http://localhost:*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    socket.on("join-app", (appId) => {
      socket.join(`app-${appId}`);
      io.to(`app-${appId}`).emit("user-joined", {
        userId: socket.id,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}
```

**2. Client-side Hook**
```typescript
// web-app/src/hooks/useCollaboration.ts
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export function useCollaboration(appId: number | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  
  useEffect(() => {
    if (!appId) return;
    
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    
    newSocket.on("connect", () => {
      newSocket.emit("join-app", appId);
    });
    
    newSocket.on("user-joined", (data) => {
      setActiveUsers((prev) => [...prev, data.userId]);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [appId]);
  
  return { socket, activeUsers };
}
```

**3. Presence Component**
```typescript
// web-app/src/components/presence-indicator.tsx
export function PresenceIndicator({ appId }: { appId: number }) {
  const { activeUsers } = useCollaboration(appId);
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map((userId, i) => (
          <div
            key={userId}
            className="h-8 w-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
          >
            {i + 1}
          </div>
        ))}
      </div>
      {activeUsers.length > 3 && (
        <span className="text-xs text-gray-600">
          +{activeUsers.length - 3} more
        </span>
      )}
    </div>
  );
}
```

## Conclusion

### What's Currently Implemented ✅
- Connection status indicators
- Toast notifications for user actions
- Loading states and spinners
- Status badges for different states

### What's Feasible for Near Future
- Basic presence indicators (who's viewing an app)
- Activity notifications
- File edit notifications
- Simple user list

### What Requires Major Backend Work
- Real-time collaborative editing
- Cursor synchronization
- Operational transformation
- Full WebSocket infrastructure

### Recommendation
For the web app to achieve basic collaboration parity:
1. Keep using the current HTTP API for primary operations
2. Add WebSocket layer for presence and notifications only
3. Use optimistic UI updates for better perceived performance
4. Implement comprehensive error handling and retry logic
5. Document limitations clearly to users

The web app can provide a great experience without full real-time collaboration by focusing on:
- Fast, reliable HTTP operations
- Clear user feedback
- Intuitive UI/UX
- Graceful degradation when offline
