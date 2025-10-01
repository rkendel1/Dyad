import * as vscode from 'vscode';
import { CollaborationService } from '../collaboration/collaborationService';
import { UserRole } from '../collaboration/types';

/**
 * Collaboration tree item
 */
class CollaborationTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly iconPath?: vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
    }
}

/**
 * Collaboration sidebar provider
 */
export class CollaborationSidebarProvider implements vscode.TreeDataProvider<CollaborationTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CollaborationTreeItem | undefined | null> = new vscode.EventEmitter<CollaborationTreeItem | undefined | null>();
    readonly onDidChangeTreeData: vscode.Event<CollaborationTreeItem | undefined | null> = this._onDidChangeTreeData.event;

    constructor(private collaborationService: CollaborationService) {
        // Listen to collaboration events
        collaborationService.onEvent(() => {
            this.refresh();
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: CollaborationTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: CollaborationTreeItem): Promise<CollaborationTreeItem[]> {
        const session = this.collaborationService.getCurrentSession();

        if (!element) {
            // Root level
            if (!session) {
                return [
                    new CollaborationTreeItem(
                        'Start Collaboration',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'dyad.startCollaboration',
                            title: 'Start Collaboration'
                        },
                        new vscode.ThemeIcon('live-share')
                    ),
                    new CollaborationTreeItem(
                        'Join Collaboration',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'dyad.joinCollaboration',
                            title: 'Join Collaboration'
                        },
                        new vscode.ThemeIcon('sign-in')
                    )
                ];
            } else {
                return [
                    new CollaborationTreeItem(
                        `Session: ${session.appName}`,
                        vscode.TreeItemCollapsibleState.None,
                        undefined,
                        new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('terminal.ansiGreen'))
                    ),
                    new CollaborationTreeItem(
                        'Users',
                        vscode.TreeItemCollapsibleState.Collapsed,
                        undefined,
                        new vscode.ThemeIcon('account')
                    ),
                    new CollaborationTreeItem(
                        'Show Chat',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'dyad.showCollaborationPanel',
                            title: 'Show Collaboration Panel'
                        },
                        new vscode.ThemeIcon('comment-discussion')
                    ),
                    new CollaborationTreeItem(
                        'Add Comment',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'dyad.addInlineComment',
                            title: 'Add Inline Comment'
                        },
                        new vscode.ThemeIcon('comment')
                    ),
                    new CollaborationTreeItem(
                        'Leave Session',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'dyad.leaveCollaboration',
                            title: 'Leave Collaboration'
                        },
                        new vscode.ThemeIcon('sign-out')
                    )
                ];
            }
        } else if (element.label === 'Users') {
            // Show users
            if (session) {
                return session.users.map(user => {
                    const currentUser = this.collaborationService.getCurrentUser();
                    const isCurrentUser = currentUser?.id === user.id;
                    const roleIcon = this.getRoleIcon(user.role);
                    
                    return new CollaborationTreeItem(
                        `${user.name}${isCurrentUser ? ' (You)' : ''} - ${user.role}`,
                        vscode.TreeItemCollapsibleState.None,
                        undefined,
                        new vscode.ThemeIcon(roleIcon)
                    );
                });
            }
        }

        return [];
    }

    private getRoleIcon(role: UserRole): string {
        switch (role) {
            case UserRole.EDITOR:
                return 'edit';
            case UserRole.REVIEWER:
                return 'preview';
            case UserRole.VIEWER:
                return 'eye';
            default:
                return 'person';
        }
    }
}
