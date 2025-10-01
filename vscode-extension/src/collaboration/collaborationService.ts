import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';
import {
    CollaborationSession,
    CollaborationUser,
    CollaborationEvent,
    CollaborationEventType,
    ChatMessage,
    InlineComment,
    DocumentChange,
    VersionSnapshot,
    UserRole
} from './types';

/**
 * CollaborationService manages real-time collaboration features
 * for Dyad apps using WebSocket connections.
 */
export class CollaborationService {
    private socket: Socket | null = null;
    private currentSession: CollaborationSession | null = null;
    private currentUser: CollaborationUser | null = null;
    private isConnected: boolean = false;
    private eventEmitter: vscode.EventEmitter<CollaborationEvent>;
    private outputChannel: vscode.OutputChannel;
    private serverUrl: string;

    public readonly onEvent: vscode.Event<CollaborationEvent>;

    constructor(outputChannel: vscode.OutputChannel, serverUrl: string = 'http://localhost:3000') {
        this.outputChannel = outputChannel;
        this.serverUrl = serverUrl;
        this.eventEmitter = new vscode.EventEmitter<CollaborationEvent>();
        this.onEvent = this.eventEmitter.event;
    }

    /**
     * Start a new collaboration session
     */
    async startSession(appId: number, appName: string, userName: string): Promise<CollaborationSession> {
        try {
            this.outputChannel.appendLine(`Starting collaboration session for app: ${appName}`);

            // Generate session ID
            const sessionId = this.generateSessionId();

            // Create user
            this.currentUser = {
                id: this.generateUserId(),
                name: userName,
                role: UserRole.EDITOR,
                color: this.generateUserColor()
            };

            // Create session
            this.currentSession = {
                id: sessionId,
                appId,
                appName,
                ownerId: this.currentUser.id,
                ownerName: userName,
                users: [this.currentUser],
                createdAt: new Date().toISOString(),
                isActive: true
            };

            // Connect to WebSocket server
            await this.connect();

            // Emit session created event
            if (this.socket) {
                this.socket.emit('session:create', this.currentSession);
            }

            this.outputChannel.appendLine(`Collaboration session started: ${sessionId}`);
            return this.currentSession;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`Failed to start collaboration session: ${message}`);
            throw new Error(`Failed to start collaboration session: ${message}`);
        }
    }

    /**
     * Join an existing collaboration session
     */
    async joinSession(sessionId: string, userName: string): Promise<CollaborationSession> {
        try {
            this.outputChannel.appendLine(`Joining collaboration session: ${sessionId}`);

            // Create user
            this.currentUser = {
                id: this.generateUserId(),
                name: userName,
                role: UserRole.VIEWER, // Default role, can be changed by owner
                color: this.generateUserColor()
            };

            // Connect to WebSocket server
            await this.connect();

            // Join session
            return new Promise((resolve, reject) => {
                if (!this.socket) {
                    reject(new Error('Not connected to server'));
                    return;
                }

                this.socket.emit('session:join', { sessionId, user: this.currentUser }, (response: { success: boolean; session?: CollaborationSession; error?: string }) => {
                    if (response.success && response.session) {
                        this.currentSession = response.session;
                        this.outputChannel.appendLine(`Joined collaboration session: ${sessionId}`);
                        resolve(response.session);
                    } else {
                        reject(new Error(response.error || 'Failed to join session'));
                    }
                });
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`Failed to join collaboration session: ${message}`);
            throw new Error(`Failed to join collaboration session: ${message}`);
        }
    }

    /**
     * Leave the current collaboration session
     */
    async leaveSession(): Promise<void> {
        if (!this.currentSession || !this.socket) {
            return;
        }

        try {
            this.outputChannel.appendLine(`Leaving collaboration session: ${this.currentSession.id}`);
            this.socket.emit('session:leave', { sessionId: this.currentSession.id });
            await this.disconnect();
            this.currentSession = null;
            this.currentUser = null;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`Error leaving session: ${message}`);
        }
    }

    /**
     * Send a chat message
     */
    sendChatMessage(message: string): void {
        if (!this.currentSession || !this.currentUser || !this.socket) {
            throw new Error('Not in an active collaboration session');
        }

        const chatMessage: ChatMessage = {
            id: this.generateMessageId(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            message,
            timestamp: new Date().toISOString()
        };

        this.socket.emit('chat:message', {
            sessionId: this.currentSession.id,
            message: chatMessage
        });
    }

    /**
     * Add an inline comment
     */
    addInlineComment(line: number, text: string): void {
        if (!this.currentSession || !this.currentUser || !this.socket) {
            throw new Error('Not in an active collaboration session');
        }

        const comment: InlineComment = {
            id: this.generateCommentId(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            line,
            text,
            timestamp: new Date().toISOString(),
            resolved: false
        };

        this.socket.emit('inline:comment:add', {
            sessionId: this.currentSession.id,
            comment
        });
    }

    /**
     * Resolve an inline comment
     */
    resolveInlineComment(commentId: string): void {
        if (!this.currentSession || !this.socket) {
            throw new Error('Not in an active collaboration session');
        }

        this.socket.emit('inline:comment:resolve', {
            sessionId: this.currentSession.id,
            commentId
        });
    }

    /**
     * Update cursor position
     */
    updateCursor(line: number, character: number): void {
        if (!this.currentSession || !this.currentUser || !this.socket) {
            return;
        }

        this.currentUser.cursor = { line, character };

        this.socket.emit('user:cursor:move', {
            sessionId: this.currentSession.id,
            userId: this.currentUser.id,
            cursor: { line, character }
        });
    }

    /**
     * Update selection
     */
    updateSelection(start: { line: number; character: number }, end: { line: number; character: number }): void {
        if (!this.currentSession || !this.currentUser || !this.socket) {
            return;
        }

        this.currentUser.selection = { start, end };

        this.socket.emit('user:selection:change', {
            sessionId: this.currentSession.id,
            userId: this.currentUser.id,
            selection: { start, end }
        });
    }

    /**
     * Broadcast document change
     */
    broadcastDocumentChange(change: Omit<DocumentChange, 'sessionId' | 'userId' | 'timestamp'>): void {
        if (!this.currentSession || !this.currentUser || !this.socket) {
            return;
        }

        const documentChange: DocumentChange = {
            ...change,
            sessionId: this.currentSession.id,
            userId: this.currentUser.id,
            timestamp: new Date().toISOString()
        };

        this.socket.emit('document:change', documentChange);
    }

    /**
     * Create a version snapshot
     */
    createVersionSnapshot(content: string, description?: string): void {
        if (!this.currentSession || !this.currentUser || !this.socket) {
            throw new Error('Not in an active collaboration session');
        }

        const snapshot: VersionSnapshot = {
            id: this.generateSnapshotId(),
            sessionId: this.currentSession.id,
            content,
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            timestamp: new Date().toISOString(),
            description
        };

        this.socket.emit('version:snapshot', snapshot);
    }

    /**
     * Change user role (owner only)
     */
    changeUserRole(userId: string, role: UserRole): void {
        if (!this.currentSession || !this.currentUser || !this.socket) {
            throw new Error('Not in an active collaboration session');
        }

        if (this.currentUser.id !== this.currentSession.ownerId) {
            throw new Error('Only the session owner can change user roles');
        }

        this.socket.emit('role:change', {
            sessionId: this.currentSession.id,
            userId,
            role
        });
    }

    /**
     * Get current session
     */
    getCurrentSession(): CollaborationSession | null {
        return this.currentSession;
    }

    /**
     * Get current user
     */
    getCurrentUser(): CollaborationUser | null {
        return this.currentUser;
    }

    /**
     * Check if connected
     */
    isSessionActive(): boolean {
        return this.isConnected && this.currentSession !== null;
    }

    /**
     * Connect to WebSocket server
     */
    private async connect(): Promise<void> {
        if (this.socket && this.isConnected) {
            return;
        }

        return new Promise((resolve, reject) => {
            try {
                this.socket = io(this.serverUrl, {
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000
                });

                this.socket.on('connect', () => {
                    this.isConnected = true;
                    this.outputChannel.appendLine('Connected to collaboration server');
                    this.setupEventHandlers();
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    this.outputChannel.appendLine(`Connection error: ${error.message}`);
                    reject(new Error(`Failed to connect to collaboration server: ${error.message}`));
                });

                this.socket.on('disconnect', () => {
                    this.isConnected = false;
                    this.outputChannel.appendLine('Disconnected from collaboration server');
                });

                // Set timeout for connection
                setTimeout(() => {
                    if (!this.isConnected) {
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    private async disconnect(): Promise<void> {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    private setupEventHandlers(): void {
        if (!this.socket) {
            return;
        }

        // User events
        this.socket.on(CollaborationEventType.USER_JOINED, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.USER_JOINED, data);
        });

        this.socket.on(CollaborationEventType.USER_LEFT, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.USER_LEFT, data);
        });

        this.socket.on(CollaborationEventType.USER_CURSOR_MOVE, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.USER_CURSOR_MOVE, data);
        });

        this.socket.on(CollaborationEventType.USER_SELECTION_CHANGE, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.USER_SELECTION_CHANGE, data);
        });

        // Document events
        this.socket.on(CollaborationEventType.DOCUMENT_CHANGE, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.DOCUMENT_CHANGE, data);
        });

        // Chat events
        this.socket.on(CollaborationEventType.CHAT_MESSAGE, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.CHAT_MESSAGE, data);
        });

        // Comment events
        this.socket.on(CollaborationEventType.INLINE_COMMENT_ADD, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.INLINE_COMMENT_ADD, data);
        });

        this.socket.on(CollaborationEventType.INLINE_COMMENT_RESOLVE, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.INLINE_COMMENT_RESOLVE, data);
        });

        // Role events
        this.socket.on(CollaborationEventType.ROLE_CHANGED, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.ROLE_CHANGED, data);
        });

        // Lock events
        this.socket.on(CollaborationEventType.LOCK_ACQUIRED, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.LOCK_ACQUIRED, data);
        });

        this.socket.on(CollaborationEventType.LOCK_RELEASED, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.LOCK_RELEASED, data);
        });

        // Version events
        this.socket.on(CollaborationEventType.VERSION_SNAPSHOT, (data: Record<string, unknown>) => {
            this.emitEvent(CollaborationEventType.VERSION_SNAPSHOT, data);
        });
    }

    /**
     * Emit collaboration event
     */
    private emitEvent(type: CollaborationEventType, data: Record<string, unknown>): void {
        const event: CollaborationEvent = {
            type,
            sessionId: this.currentSession?.id || '',
            userId: (data.userId as string) || '',
            data,
            timestamp: new Date().toISOString()
        };

        this.eventEmitter.fire(event);
    }

    /**
     * Generate a unique session ID
     */
    private generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate a unique user ID
     */
    private generateUserId(): string {
        return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate a unique message ID
     */
    private generateMessageId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate a unique comment ID
     */
    private generateCommentId(): string {
        return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate a unique snapshot ID
     */
    private generateSnapshotId(): string {
        return `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate a random user color
     */
    private generateUserColor(): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B739', '#52B788', '#E07A5F', '#81B29A'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        this.leaveSession();
        this.eventEmitter.dispose();
    }
}
