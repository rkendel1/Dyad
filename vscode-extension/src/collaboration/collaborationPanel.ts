import * as vscode from "vscode";
import { CollaborationService } from "./collaborationService";
import { ChatMessage, InlineComment, CollaborationEventType } from "./types";

/**
 * CollaborationPanel manages the webview panel for collaboration UI
 */
export class CollaborationPanel {
  private panel: vscode.WebviewPanel | undefined;
  private collaborationService: CollaborationService;
  private chatMessages: ChatMessage[] = [];
  private inlineComments: InlineComment[] = [];
  private disposables: vscode.Disposable[] = [];

  constructor(
    private context: vscode.ExtensionContext,
    collaborationService: CollaborationService,
  ) {
    this.collaborationService = collaborationService;
    this.setupEventHandlers();
  }

  /**
   * Show the collaboration panel
   */
  show(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Two);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "dyadCollaboration",
      "Dyad Collaboration",
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );

    this.panel.webview.html = this.getWebviewContent();
    this.setupWebviewMessageHandling();

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      this.disposables,
    );

    this.updateView();
  }

  /**
   * Update the view with current session data
   */
  private updateView(): void {
    if (!this.panel) {
      return;
    }

    const session = this.collaborationService.getCurrentSession();
    const currentUser = this.collaborationService.getCurrentUser();

    this.panel.webview.postMessage({
      command: "update",
      session,
      currentUser,
      chatMessages: this.chatMessages,
      inlineComments: this.inlineComments,
    });
  }

  /**
   * Setup event handlers for collaboration events
   */
  private setupEventHandlers(): void {
    this.disposables.push(
      this.collaborationService.onEvent((event) => {
        switch (event.type) {
          case CollaborationEventType.USER_JOINED:
            this.handleUserJoined(event.data);
            break;
          case CollaborationEventType.USER_LEFT:
            this.handleUserLeft(event.data);
            break;
          case CollaborationEventType.CHAT_MESSAGE:
            this.handleChatMessage(event.data);
            break;
          case CollaborationEventType.INLINE_COMMENT_ADD:
            this.handleInlineCommentAdd(event.data);
            break;
          case CollaborationEventType.INLINE_COMMENT_RESOLVE:
            this.handleInlineCommentResolve(event.data);
            break;
          case CollaborationEventType.ROLE_CHANGED:
            this.handleRoleChanged(event.data);
            break;
        }
        this.updateView();
      }),
    );
  }

  /**
   * Setup webview message handling
   */
  private setupWebviewMessageHandling(): void {
    if (!this.panel) {
      return;
    }

    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "sendChatMessage":
            this.collaborationService.sendChatMessage(message.text);
            break;
          case "addInlineComment":
            this.collaborationService.addInlineComment(
              message.line,
              message.text,
            );
            break;
          case "resolveComment":
            this.collaborationService.resolveInlineComment(message.commentId);
            break;
          case "changeUserRole":
            this.collaborationService.changeUserRole(
              message.userId,
              message.role,
            );
            break;
        }
      },
      null,
      this.disposables,
    );
  }

  /**
   * Handle user joined event
   */
  private handleUserJoined(data: Record<string, unknown>): void {
    const user = data.user as { name: string };
    vscode.window.showInformationMessage(
      `${user.name} joined the collaboration session`,
    );
  }

  /**
   * Handle user left event
   */
  private handleUserLeft(data: Record<string, unknown>): void {
    const userName = data.userName as string;
    vscode.window.showInformationMessage(
      `${userName} left the collaboration session`,
    );
  }

  /**
   * Handle chat message event
   */
  private handleChatMessage(data: Record<string, unknown>): void {
    const message = data.message as ChatMessage;
    this.chatMessages.push(message);
  }

  /**
   * Handle inline comment add event
   */
  private handleInlineCommentAdd(data: Record<string, unknown>): void {
    const comment = data.comment as InlineComment;
    this.inlineComments.push(comment);
  }

  /**
   * Handle inline comment resolve event
   */
  private handleInlineCommentResolve(data: Record<string, unknown>): void {
    const commentId = data.commentId as string;
    const comment = this.inlineComments.find((c) => c.id === commentId);
    if (comment) {
      comment.resolved = true;
    }
  }

  /**
   * Handle role changed event
   */
  private handleRoleChanged(data: Record<string, unknown>): void {
    const role = data.role as string;
    vscode.window.showInformationMessage(`User role changed to ${role}`);
  }

  /**
   * Get the webview HTML content
   */
  private getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dyad Collaboration</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 0;
            margin: 0;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .header {
            padding: 15px;
            background-color: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .session-info {
            margin-bottom: 10px;
        }
        .session-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .session-id {
            font-size: 12px;
            opacity: 0.7;
        }
        .tabs {
            display: flex;
            gap: 10px;
            padding: 0 15px;
            background-color: var(--vscode-tab-inactiveBackground);
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .tab {
            padding: 10px 15px;
            cursor: pointer;
            border: none;
            background: none;
            color: var(--vscode-foreground);
            border-bottom: 2px solid transparent;
        }
        .tab.active {
            border-bottom-color: var(--vscode-focusBorder);
        }
        .content {
            flex: 1;
            overflow: auto;
            padding: 15px;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .user-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .user-item {
            display: flex;
            align-items: center;
            padding: 8px;
            margin-bottom: 5px;
            background-color: var(--vscode-list-hoverBackground);
            border-radius: 4px;
        }
        .user-color {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .user-name {
            flex: 1;
        }
        .user-role {
            font-size: 11px;
            padding: 2px 8px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 10px;
        }
        .chat-messages {
            height: 300px;
            overflow-y: auto;
            margin-bottom: 10px;
            padding: 10px;
            background-color: var(--vscode-input-background);
            border-radius: 4px;
        }
        .chat-message {
            margin-bottom: 10px;
        }
        .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
        }
        .message-author {
            font-weight: bold;
            margin-right: 8px;
        }
        .message-time {
            font-size: 11px;
            opacity: 0.7;
        }
        .message-text {
            padding-left: 8px;
            border-left: 2px solid var(--vscode-focusBorder);
        }
        .chat-input-container {
            display: flex;
            gap: 10px;
        }
        .chat-input {
            flex: 1;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
        }
        .send-button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .comment-item {
            padding: 10px;
            margin-bottom: 10px;
            background-color: var(--vscode-input-background);
            border-radius: 4px;
            border-left: 3px solid var(--vscode-focusBorder);
        }
        .comment-item.resolved {
            opacity: 0.6;
            border-left-color: var(--vscode-testing-iconPassed);
        }
        .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .comment-line {
            font-size: 11px;
            background-color: var(--vscode-badge-background);
            padding: 2px 6px;
            border-radius: 3px;
        }
        .resolve-button {
            font-size: 11px;
            padding: 2px 8px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="session-info">
                <div class="session-title" id="sessionTitle">No Active Session</div>
                <div class="session-id" id="sessionId"></div>
            </div>
        </div>
        <div class="tabs">
            <button class="tab active" data-tab="users">Users</button>
            <button class="tab" data-tab="chat">Chat</button>
            <button class="tab" data-tab="comments">Comments</button>
        </div>
        <div class="content">
            <div class="tab-content active" id="users-tab">
                <ul class="user-list" id="userList">
                    <li class="empty-state">No users in session</li>
                </ul>
            </div>
            <div class="tab-content" id="chat-tab">
                <div class="chat-messages" id="chatMessages">
                    <div class="empty-state">No messages yet</div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" id="chatInput" placeholder="Type a message...">
                    <button class="send-button" id="sendButton">Send</button>
                </div>
            </div>
            <div class="tab-content" id="comments-tab">
                <div id="commentsList">
                    <div class="empty-state">No comments yet</div>
                </div>
            </div>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tabName + '-tab').classList.add('active');
            });
        });
        
        // Send chat message
        function sendMessage() {
            const input = document.getElementById('chatInput');
            const text = input.value.trim();
            if (text) {
                vscode.postMessage({
                    command: 'sendChatMessage',
                    text: text
                });
                input.value = '';
            }
        }
        
        document.getElementById('sendButton').addEventListener('click', sendMessage);
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'update') {
                updateView(message);
            }
        });
        
        function updateView(data) {
            // Update session info
            if (data.session) {
                document.getElementById('sessionTitle').textContent = data.session.appName;
                document.getElementById('sessionId').textContent = 'Session ID: ' + data.session.id;
                
                // Update users list
                const userList = document.getElementById('userList');
                if (data.session.users && data.session.users.length > 0) {
                    userList.innerHTML = data.session.users.map(user => \`
                        <li class="user-item">
                            <div class="user-color" style="background-color: \${user.color}"></div>
                            <span class="user-name">\${user.name}</span>
                            <span class="user-role">\${user.role}</span>
                        </li>
                    \`).join('');
                } else {
                    userList.innerHTML = '<li class="empty-state">No users in session</li>';
                }
            }
            
            // Update chat messages
            if (data.chatMessages && data.chatMessages.length > 0) {
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.innerHTML = data.chatMessages.map(msg => \`
                    <div class="chat-message">
                        <div class="message-header">
                            <span class="message-author">\${msg.userName}</span>
                            <span class="message-time">\${new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div class="message-text">\${msg.message}</div>
                    </div>
                \`).join('');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // Update comments
            if (data.inlineComments && data.inlineComments.length > 0) {
                const commentsList = document.getElementById('commentsList');
                commentsList.innerHTML = data.inlineComments.map(comment => \`
                    <div class="comment-item \${comment.resolved ? 'resolved' : ''}">
                        <div class="comment-header">
                            <span class="comment-line">Line \${comment.line}</span>
                            \${!comment.resolved ? \`
                                <button class="resolve-button" onclick="resolveComment('\${comment.id}')">Resolve</button>
                            \` : '<span>✓ Resolved</span>'}
                        </div>
                        <div><strong>\${comment.userName}:</strong> \${comment.text}</div>
                    </div>
                \`).join('');
            }
        }
        
        function resolveComment(commentId) {
            vscode.postMessage({
                command: 'resolveComment',
                commentId: commentId
            });
        }
    </script>
</body>
</html>`;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.panel?.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
