/**
 * Mock WebSocket server for testing Dyad collaboration features
 *
 * This is a standalone server that can be used to test the collaboration
 * features in the Dyad VS Code extension without requiring the full
 * Dyad Desktop application.
 *
 * Usage:
 *   npm install socket.io
 *   node mock-collaboration-server.js
 */

const http = require("http");
const socketIO = require("socket.io");

const PORT = 3000;

// In-memory session storage
const sessions = new Map();

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Dyad Mock Collaboration Server Running\n");
});

// Create Socket.IO server
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Session creation
  socket.on("session:create", (sessionData) => {
    const session = {
      ...sessionData,
      users: new Map(),
      isActive: true,
    };

    sessions.set(session.id, session);
    socket.join(session.id);

    console.log(`✓ Session created: ${session.id} for app: ${session.appName}`);
  });

  // Session join
  socket.on("session:join", (data, callback) => {
    const { sessionId, user } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      console.log(`✗ Session not found: ${sessionId}`);
      callback({ success: false, error: "Session not found" });
      return;
    }

    const userWithSocket = { ...user, socketId: socket.id };
    session.users.set(user.id, userWithSocket);
    socket.join(sessionId);

    // Notify existing users
    socket.to(sessionId).emit("user:joined", {
      userId: user.id,
      user: userWithSocket,
    });

    // Send session data to joining user
    callback({
      success: true,
      session: {
        ...session,
        users: Array.from(session.users.values()),
      },
    });

    console.log(`✓ User ${user.name} joined session ${sessionId}`);
  });

  // Session leave
  socket.on("session:leave", (data) => {
    const { sessionId } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Find user by socket ID
    let userId = null;
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

      socket.to(sessionId).emit("user:left", {
        userId,
        userName: user.name,
      });

      console.log(`✓ User ${user.name} left session ${sessionId}`);

      // Clean up empty sessions
      if (session.users.size === 0) {
        sessions.delete(sessionId);
        console.log(`✓ Session ${sessionId} deleted (empty)`);
      }
    }
  });

  // Cursor movement
  socket.on("user:cursor:move", (data) => {
    socket.to(data.sessionId).emit("user:cursor:move", data);
  });

  // Selection change
  socket.on("user:selection:change", (data) => {
    socket.to(data.sessionId).emit("user:selection:change", data);
  });

  // Document changes
  socket.on("document:change", (data) => {
    console.log(`Document change in session ${data.sessionId}`);
    socket.to(data.sessionId).emit("document:change", data);
  });

  // Chat messages
  socket.on("chat:message", (data) => {
    console.log(
      `Chat message in session ${data.sessionId}: ${data.message.message}`,
    );
    socket.to(data.sessionId).emit("chat:message", data);
  });

  // Inline comments
  socket.on("inline:comment:add", (data) => {
    console.log(
      `Comment added in session ${data.sessionId} on line ${data.comment.line}`,
    );
    socket.to(data.sessionId).emit("inline:comment:add", data);
  });

  socket.on("inline:comment:resolve", (data) => {
    console.log(
      `Comment resolved in session ${data.sessionId}: ${data.commentId}`,
    );
    socket.to(data.sessionId).emit("inline:comment:resolve", data);
  });

  // Role changes
  socket.on("role:change", (data) => {
    const session = sessions.get(data.sessionId);
    if (session) {
      const user = session.users.get(data.userId);
      if (user) {
        user.role = data.role;
        socket.to(data.sessionId).emit("role:changed", data);
        console.log(`✓ Role changed for user ${data.userId} to ${data.role}`);
      }
    }
  });

  // Version snapshots
  socket.on("version:snapshot", (data) => {
    console.log(`Version snapshot created in session ${data.sessionId}`);
    socket.to(data.sessionId).emit("version:snapshot", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    // Find and remove user from all sessions
    for (const [sessionId, session] of sessions) {
      for (const [userId, user] of session.users) {
        if (user.socketId === socket.id) {
          session.users.delete(userId);
          io.to(sessionId).emit("user:left", {
            userId,
            userName: user.name,
          });

          console.log(
            `✓ User ${user.name} disconnected from session ${sessionId}`,
          );

          if (session.users.size === 0) {
            sessions.delete(sessionId);
            console.log(`✓ Session ${sessionId} deleted (empty)`);
          }
          break;
        }
      }
    }

    console.log("Client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log("================================================");
  console.log("  Dyad Mock Collaboration Server");
  console.log("================================================");
  console.log(`  Server running on port ${PORT}`);
  console.log(`  WebSocket endpoint: ws://localhost:${PORT}`);
  console.log("------------------------------------------------");
  console.log("  This server simulates the collaboration");
  console.log("  features for the Dyad VS Code extension.");
  console.log("================================================\n");
  console.log("Waiting for connections...\n");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\nShutting down mock server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
