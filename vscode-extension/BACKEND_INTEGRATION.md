# Dyad Desktop Collaboration Server Integration Guide

This guide explains how to integrate the WebSocket collaboration server into Dyad Desktop to enable real-time multi-user collaboration features in the VS Code extension.

## Overview

The Dyad VS Code extension includes a complete client-side collaboration implementation that requires a WebSocket server backend. This document provides the specifications and implementation guidance for adding this server to Dyad Desktop.

## Architecture

```
┌─────────────────┐         WebSocket (Socket.IO)         ┌──────────────────┐
│   VS Code       │◄──────────────────────────────────────►│  Dyad Desktop    │
│   Extension     │                                        │  WebSocket Server│
│                 │                                        │                  │
│  - UI Layer     │         Port: 3000                    │  - Session Mgmt  │
│  - Decorations  │         Protocol: ws://               │  - Event Routing │
│  - Chat Panel   │                                        │  - State Sync    │
└─────────────────┘                                        └──────────────────┘
         │                                                          │
         │                                                          │
         └─────────────── Collaboration Events ────────────────────┘
```

## Technology Stack

### Required Dependencies

```bash
npm install socket.io
```

For TypeScript projects:

```bash
npm install --save-dev @types/socket.io
```

### Alternative: Native WebSocket

If you prefer not to use Socket.IO, you can implement with native WebSocket:

```bash
npm install ws
npm install --save-dev @types/ws
```

## Implementation Steps

### 1. Create WebSocket Server

Create a new file: `src/collaboration/collaborationServer.ts`

```typescript
import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

interface Session {
  id: string;
  appId: number;
  appName: string;
  ownerId: string;
  ownerName: string;
  users: Map<string, User>;
  createdAt: string;
  isActive: boolean;
}

interface User {
  id: string;
  socketId: string;
  name: string;
  role: "editor" | "reviewer" | "viewer";
  color: string;
}

export class CollaborationServer {
  private io: SocketIOServer;
  private sessions: Map<string, Session> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // Configure appropriately for production
        methods: ["GET", "POST"],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected:", socket.id);

      // Session management
      socket.on("session:create", (session: Omit<Session, "users">) => {
        this.handleSessionCreate(socket, session);
      });

      socket.on(
        "session:join",
        (
          data: { sessionId: string; user: Omit<User, "socketId"> },
          callback,
        ) => {
          this.handleSessionJoin(socket, data, callback);
        },
      );

      socket.on("session:leave", (data: { sessionId: string }) => {
        this.handleSessionLeave(socket, data.sessionId);
      });

      // User events
      socket.on("user:cursor:move", (data) => {
        this.broadcastToSession(
          socket,
          data.sessionId,
          "user:cursor:move",
          data,
        );
      });

      socket.on("user:selection:change", (data) => {
        this.broadcastToSession(
          socket,
          data.sessionId,
          "user:selection:change",
          data,
        );
      });

      // Document events
      socket.on("document:change", (data) => {
        this.broadcastToSession(
          socket,
          data.sessionId,
          "document:change",
          data,
        );
      });

      // Chat events
      socket.on("chat:message", (data) => {
        this.broadcastToSession(socket, data.sessionId, "chat:message", data);
      });

      // Comment events
      socket.on("inline:comment:add", (data) => {
        this.broadcastToSession(
          socket,
          data.sessionId,
          "inline:comment:add",
          data,
        );
      });

      socket.on("inline:comment:resolve", (data) => {
        this.broadcastToSession(
          socket,
          data.sessionId,
          "inline:comment:resolve",
          data,
        );
      });

      // Role management
      socket.on("role:change", (data) => {
        this.handleRoleChange(socket, data);
      });

      // Version snapshots
      socket.on("version:snapshot", (data) => {
        this.broadcastToSession(
          socket,
          data.sessionId,
          "version:snapshot",
          data,
        );
      });

      // Disconnect
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleSessionCreate(socket: Socket, sessionData: any): void {
    const session: Session = {
      ...sessionData,
      users: new Map(),
      isActive: true,
    };

    this.sessions.set(session.id, session);
    socket.join(session.id);

    console.log("Session created:", session.id);
  }

  private handleSessionJoin(
    socket: Socket,
    data: { sessionId: string; user: Omit<User, "socketId"> },
    callback: (response: any) => void,
  ): void {
    const session = this.sessions.get(data.sessionId);

    if (!session) {
      callback({ success: false, error: "Session not found" });
      return;
    }

    const user: User = {
      ...data.user,
      socketId: socket.id,
    };

    session.users.set(user.id, user);
    socket.join(data.sessionId);

    // Notify existing users
    this.broadcastToSession(socket, data.sessionId, "user:joined", {
      userId: user.id,
      user,
    });

    // Send session data to joining user
    callback({
      success: true,
      session: {
        ...session,
        users: Array.from(session.users.values()),
      },
    });

    console.log(`User ${user.name} joined session ${data.sessionId}`);
  }

  private handleSessionLeave(socket: Socket, sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Find user by socket ID
    let userId: string | null = null;
    for (const [id, user] of session.users) {
      if (user.socketId === socket.id) {
        userId = id;
        break;
      }
    }

    if (userId) {
      const user = session.users.get(userId);
      session.users.delete(userId);
      socket.leave(sessionId);

      // Notify others
      this.broadcastToSession(socket, sessionId, "user:left", {
        userId,
        userName: user?.name,
      });

      // Clean up empty sessions
      if (session.users.size === 0) {
        this.sessions.delete(sessionId);
        console.log(`Session ${sessionId} deleted (empty)`);
      }
    }
  }

  private handleRoleChange(
    socket: Socket,
    data: { sessionId: string; userId: string; role: string },
  ): void {
    const session = this.sessions.get(data.sessionId);
    if (!session) {
      return;
    }

    const user = session.users.get(data.userId);
    if (user) {
      user.role = data.role as any;
      this.broadcastToSession(socket, data.sessionId, "role:changed", {
        userId: data.userId,
        role: data.role,
      });
    }
  }

  private handleDisconnect(socket: Socket): void {
    // Find and remove user from all sessions
    for (const [sessionId, session] of this.sessions) {
      for (const [userId, user] of session.users) {
        if (user.socketId === socket.id) {
          session.users.delete(userId);
          this.io.to(sessionId).emit("user:left", {
            userId,
            userName: user.name,
          });

          if (session.users.size === 0) {
            this.sessions.delete(sessionId);
          }
          break;
        }
      }
    }

    console.log("Client disconnected:", socket.id);
  }

  private broadcastToSession(
    socket: Socket,
    sessionId: string,
    event: string,
    data: any,
  ): void {
    socket.to(sessionId).emit(event, data);
  }
}
```

### 2. Integrate with Dyad Desktop

In your main Electron process (e.g., `src/main.ts` or `main/index.ts`):

```typescript
import { app, BrowserWindow } from "electron";
import express from "express";
import { createServer } from "http";
import { CollaborationServer } from "./collaboration/collaborationServer";

// Your existing Express app
const expressApp = express();
const httpServer = createServer(expressApp);

// Initialize collaboration server
const collaborationServer = new CollaborationServer(httpServer);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Dyad Desktop server running on port ${PORT}`);
  console.log(`WebSocket server enabled for collaboration`);
});
```

### 3. Enhanced Features (Optional)

#### Document Synchronization with Operational Transformation

For conflict-free collaborative editing, implement OT or CRDTs:

```typescript
import * as ot from "ot";

class DocumentSync {
  private documents: Map<string, ot.Document> = new Map();

  applyOperation(sessionId: string, operation: any): void {
    const doc = this.documents.get(sessionId);
    if (doc) {
      const transformedOp = ot.transform(operation, doc.getPendingOps());
      doc.apply(transformedOp);
      return transformedOp;
    }
  }
}
```

#### Persistence Layer

Store sessions and history in a database:

```typescript
import { Database } from "better-sqlite3";

class SessionPersistence {
  private db: Database;

  saveSession(session: Session): void {
    this.db
      .prepare(
        `
      INSERT INTO collaboration_sessions 
      (id, app_id, created_at, data) 
      VALUES (?, ?, ?, ?)
    `,
      )
      .run(
        session.id,
        session.appId,
        session.createdAt,
        JSON.stringify(session),
      );
  }

  loadSession(sessionId: string): Session | null {
    const row = this.db
      .prepare(
        `
      SELECT * FROM collaboration_sessions WHERE id = ?
    `,
      )
      .get(sessionId);

    return row ? JSON.parse(row.data) : null;
  }
}
```

#### GitHub OAuth Integration

Add user authentication:

```typescript
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Store user info
      return done(null, profile);
    },
  ),
);
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { CollaborationServer } from "./collaborationServer";
import { createServer } from "http";
import { io as ioClient } from "socket.io-client";

describe("CollaborationServer", () => {
  it("should create a session", async () => {
    const httpServer = createServer();
    const server = new CollaborationServer(httpServer);
    const client = ioClient("http://localhost:3000");

    client.emit("session:create", {
      id: "test-session",
      appId: 1,
      appName: "Test App",
      ownerId: "user-1",
      ownerName: "Test User",
    });

    // Test assertions
  });
});
```

### Integration Tests

Test with actual VS Code extension:

1. Start Dyad Desktop with collaboration server
2. Open VS Code with Dyad extension
3. Start a collaboration session
4. Join from another VS Code instance
5. Verify cursor tracking, chat, and comments work

## Performance Considerations

### Message Batching

```typescript
class MessageBatcher {
  private batches: Map<string, any[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  batch(sessionId: string, message: any): void {
    if (!this.batches.has(sessionId)) {
      this.batches.set(sessionId, []);
    }

    this.batches.get(sessionId)!.push(message);

    // Flush after 50ms
    if (!this.timers.has(sessionId)) {
      const timer = setTimeout(() => {
        this.flush(sessionId);
      }, 50);
      this.timers.set(sessionId, timer);
    }
  }

  flush(sessionId: string): void {
    const batch = this.batches.get(sessionId);
    if (batch && batch.length > 0) {
      // Send batched messages
      this.io.to(sessionId).emit("batch:update", batch);
      this.batches.set(sessionId, []);
    }
    this.timers.delete(sessionId);
  }
}
```

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 100, // 100 requests per second
  message: "Too many requests",
});

app.use("/api/collaboration", limiter);
```

## Security Best Practices

1. **Validate all input**: Sanitize session IDs, user data, and messages
2. **Authenticate users**: Implement proper authentication (OAuth, JWT)
3. **Rate limiting**: Prevent spam and DoS attacks
4. **Session isolation**: Ensure users can only access their sessions
5. **Data encryption**: Use WSS (WebSocket Secure) in production
6. **Audit logging**: Log all collaboration events for security

## Deployment Checklist

- [ ] Enable HTTPS/WSS in production
- [ ] Configure CORS appropriately
- [ ] Set up authentication
- [ ] Implement rate limiting
- [ ] Add monitoring and logging
- [ ] Test with multiple concurrent sessions
- [ ] Document API endpoints
- [ ] Create backup/restore procedures
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure auto-scaling if needed

## Troubleshooting

### Common Issues

1. **CORS errors**: Check CORS configuration in Socket.IO setup
2. **Connection refused**: Verify port 3000 is available
3. **Events not received**: Check event names match exactly
4. **Memory leaks**: Ensure proper cleanup on disconnect
5. **Performance issues**: Implement message batching and rate limiting

## Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Operational Transformation](https://operational-transformation.github.io/)
- [WebSocket Security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)

## Support

For questions or issues:

- GitHub Issues: [rkendel1/Dyad](https://github.com/rkendel1/Dyad/issues)
- Community: [r/dyadbuilders](https://www.reddit.com/r/dyadbuilders/)
