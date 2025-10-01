import * as vscode from "vscode";
import { CollaborationService } from "./collaborationService";
import { CollaborationUser, CollaborationEventType } from "./types";

/**
 * DecoratorManager handles visual decorations for collaboration features
 * like live cursors, selections, and inline comments
 */
export class DecoratorManager {
  private cursorDecorations: Map<string, vscode.TextEditorDecorationType> =
    new Map();
  private selectionDecorations: Map<string, vscode.TextEditorDecorationType> =
    new Map();
  private commentDecorations: vscode.TextEditorDecorationType;
  private disposables: vscode.Disposable[] = [];
  private userPositions: Map<
    string,
    { cursor?: vscode.Position; selection?: vscode.Range }
  > = new Map();

  constructor(private collaborationService: CollaborationService) {
    // Create comment decoration type
    this.commentDecorations = vscode.window.createTextEditorDecorationType({
      backgroundColor: new vscode.ThemeColor("editor.wordHighlightBackground"),
      borderColor: new vscode.ThemeColor("editorInfo.foreground"),
      borderWidth: "0 0 0 3px",
      borderStyle: "solid",
    });

    this.setupEventHandlers();
    this.setupEditorHandlers();
  }

  /**
   * Setup event handlers for collaboration events
   */
  private setupEventHandlers(): void {
    this.disposables.push(
      this.collaborationService.onEvent((event) => {
        switch (event.type) {
          case CollaborationEventType.USER_CURSOR_MOVE:
            this.handleCursorMove(event.data);
            break;
          case CollaborationEventType.USER_SELECTION_CHANGE:
            this.handleSelectionChange(event.data);
            break;
          case CollaborationEventType.USER_LEFT:
            this.handleUserLeft(event.data);
            break;
        }
      }),
    );
  }

  /**
   * Setup editor event handlers to track local cursor and selection
   */
  private setupEditorHandlers(): void {
    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection((e) => {
        if (!this.collaborationService.isSessionActive()) {
          return;
        }

        const selection = e.selections[0];
        if (selection) {
          // Update cursor position
          this.collaborationService.updateCursor(
            selection.active.line,
            selection.active.character,
          );

          // Update selection if not empty
          if (!selection.isEmpty) {
            this.collaborationService.updateSelection(
              {
                line: selection.start.line,
                character: selection.start.character,
              },
              {
                line: selection.end.line,
                character: selection.end.character,
              },
            );
          }
        }
      }),
    );
  }

  /**
   * Handle cursor move event from other users
   */
  private handleCursorMove(data: Record<string, unknown>): void {
    const userId = data.userId as string;
    const cursor = data.cursor as { line: number; character: number };
    const user = data.user as CollaborationUser;
    const currentUser = this.collaborationService.getCurrentUser();

    // Don't show our own cursor
    if (currentUser && userId === currentUser.id) {
      return;
    }

    // Store cursor position
    const userPos = this.userPositions.get(userId) || {};
    userPos.cursor = new vscode.Position(cursor.line, cursor.character);
    this.userPositions.set(userId, userPos);

    // Update decorations
    this.updateCursorDecoration(userId, user);
  }

  /**
   * Handle selection change event from other users
   */
  private handleSelectionChange(data: Record<string, unknown>): void {
    const userId = data.userId as string;
    const selection = data.selection as {
      start: { line: number; character: number };
      end: { line: number; character: number };
    };
    const user = data.user as CollaborationUser;
    const currentUser = this.collaborationService.getCurrentUser();

    // Don't show our own selection
    if (currentUser && userId === currentUser.id) {
      return;
    }

    // Store selection
    const userPos = this.userPositions.get(userId) || {};
    userPos.selection = new vscode.Range(
      new vscode.Position(selection.start.line, selection.start.character),
      new vscode.Position(selection.end.line, selection.end.character),
    );
    this.userPositions.set(userId, userPos);

    // Update decorations
    this.updateSelectionDecoration(userId, user);
  }

  /**
   * Handle user left event
   */
  private handleUserLeft(data: Record<string, unknown>): void {
    const userId = data.userId as string;

    // Remove user decorations
    this.removeUserDecorations(userId);
    this.userPositions.delete(userId);
  }

  /**
   * Update cursor decoration for a user
   */
  private updateCursorDecoration(
    userId: string,
    user: CollaborationUser,
  ): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const userPos = this.userPositions.get(userId);
    if (!userPos?.cursor) {
      return;
    }

    // Create or get decoration type for this user
    let decorationType = this.cursorDecorations.get(userId);
    if (!decorationType) {
      decorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: user.color,
        backgroundColor: user.color + "40", // 25% opacity
        after: {
          contentText: ` ${user.name}`,
          color: user.color,
          fontWeight: "bold",
          margin: "0 0 0 4px",
        },
      });
      this.cursorDecorations.set(userId, decorationType);
    }

    // Apply decoration
    const range = new vscode.Range(userPos.cursor, userPos.cursor);
    editor.setDecorations(decorationType, [{ range }]);
  }

  /**
   * Update selection decoration for a user
   */
  private updateSelectionDecoration(
    userId: string,
    user: CollaborationUser,
  ): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const userPos = this.userPositions.get(userId);
    if (!userPos?.selection) {
      return;
    }

    // Create or get decoration type for this user
    let decorationType = this.selectionDecorations.get(userId);
    if (!decorationType) {
      decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: user.color + "30", // 19% opacity
        borderColor: user.color,
        borderWidth: "1px",
        borderStyle: "solid",
      });
      this.selectionDecorations.set(userId, decorationType);
    }

    // Apply decoration
    editor.setDecorations(decorationType, [{ range: userPos.selection }]);
  }

  /**
   * Add inline comment decoration
   */
  addCommentDecoration(line: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const range = new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER);
    editor.setDecorations(this.commentDecorations, [{ range }]);
  }

  /**
   * Remove decorations for a user
   */
  private removeUserDecorations(userId: string): void {
    const cursorDec = this.cursorDecorations.get(userId);
    if (cursorDec) {
      cursorDec.dispose();
      this.cursorDecorations.delete(userId);
    }

    const selectionDec = this.selectionDecorations.get(userId);
    if (selectionDec) {
      selectionDec.dispose();
      this.selectionDecorations.delete(userId);
    }
  }

  /**
   * Clear all decorations
   */
  clearAll(): void {
    this.cursorDecorations.forEach((dec) => dec.dispose());
    this.cursorDecorations.clear();

    this.selectionDecorations.forEach((dec) => dec.dispose());
    this.selectionDecorations.clear();

    this.userPositions.clear();
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.clearAll();
    this.commentDecorations.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
