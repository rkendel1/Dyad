import * as vscode from 'vscode';
import { DyadCli } from '../dyadCli';
import { DyadApi } from '../dyadApi';

/**
 * Tree item for the sidebar
 */
class DyadTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly contextValue?: string,
        public readonly iconPath?: vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
        this.command = command;
        this.contextValue = contextValue;
        this.iconPath = iconPath;
    }
}

/**
 * Sidebar provider for Dyad extension
 */
export class DyadSidebarProvider implements vscode.TreeDataProvider<DyadTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DyadTreeItem | undefined | null | void> = new vscode.EventEmitter<DyadTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DyadTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(
        private extensionUri: vscode.Uri,
        private dyadCli: DyadCli,
        private dyadApi: DyadApi
    ) {}

    /**
     * Refresh the tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Get tree item
     */
    getTreeItem(element: DyadTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * Get children for the tree view
     */
    async getChildren(element?: DyadTreeItem): Promise<DyadTreeItem[]> {
        if (!element) {
            // Root level - return main sections
            return [
                new DyadTreeItem(
                    'Apps',
                    vscode.TreeItemCollapsibleState.Expanded,
                    undefined,
                    'appsSection',
                    new vscode.ThemeIcon('folder')
                ),
                new DyadTreeItem(
                    'Quick Actions',
                    vscode.TreeItemCollapsibleState.Expanded,
                    undefined,
                    'actionsSection',
                    new vscode.ThemeIcon('rocket')
                )
            ];
        }

        if (element.contextValue === 'appsSection') {
            return this.getAppsItems();
        }

        if (element.contextValue === 'actionsSection') {
            return this.getActionItems();
        }

        return [];
    }

    /**
     * Get app items
     */
    private async getAppsItems(): Promise<DyadTreeItem[]> {
        try {
            const apps = await this.dyadApi.getApps();
            
            if (apps.length === 0) {
                return [
                    new DyadTreeItem(
                        'No apps found',
                        vscode.TreeItemCollapsibleState.None,
                        undefined,
                        'noApps',
                        new vscode.ThemeIcon('info')
                    ),
                    new DyadTreeItem(
                        'Create an app in Dyad Desktop',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'dyad.createApp',
                            title: 'Create New App'
                        },
                        'helpItem',
                        new vscode.ThemeIcon('add')
                    )
                ];
            }

            return apps.map(app => {
                const isRunning = app.isRunning || false;
                const icon = isRunning 
                    ? new vscode.ThemeIcon('debug-start', new vscode.ThemeColor('charts.green'))
                    : new vscode.ThemeIcon('circle-outline');
                
                const tooltip = new vscode.MarkdownString();
                tooltip.appendMarkdown(`**${app.name}**\n\n`);
                tooltip.appendMarkdown(`Path: \`${app.path}\`\n\n`);
                tooltip.appendMarkdown(`Status: ${isRunning ? '🟢 Running' : '⚪ Stopped'}\n\n`);
                if (app.createdAt) {
                    tooltip.appendMarkdown(`Created: ${new Date(app.createdAt).toLocaleDateString()}\n\n`);
                }
                
                const item = new DyadTreeItem(
                    app.name,
                    vscode.TreeItemCollapsibleState.None,
                    {
                        command: 'dyad.selectApp',
                        title: 'Select App',
                        arguments: [app]
                    },
                    'app',
                    icon
                );
                item.tooltip = tooltip;
                item.description = isRunning ? 'Running' : '';
                
                return item;
            });
        } catch (error) {
            console.error('Failed to get apps:', error);
            const message = error instanceof Error ? error.message : String(error);
            
            // Check if it's a connection error
            if (message.includes('Cannot connect') || message.includes('ECONNREFUSED')) {
                return [
                    new DyadTreeItem(
                        'Cannot connect to Dyad Desktop',
                        vscode.TreeItemCollapsibleState.None,
                        undefined,
                        'error',
                        new vscode.ThemeIcon('error')
                    ),
                    new DyadTreeItem(
                        'Make sure Dyad Desktop is running',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'dyad.checkHealth',
                            title: 'Check Connection'
                        },
                        'helpItem',
                        new vscode.ThemeIcon('debug-disconnect')
                    ),
                    new DyadTreeItem(
                        'Check Connection',
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'dyad.checkHealth',
                            title: 'Check Connection'
                        },
                        'action',
                        new vscode.ThemeIcon('refresh')
                    )
                ];
            }
            
            return [
                new DyadTreeItem(
                    'Error loading apps',
                    vscode.TreeItemCollapsibleState.None,
                    undefined,
                    'error',
                    new vscode.ThemeIcon('error')
                ),
                new DyadTreeItem(
                    'Click to retry',
                    vscode.TreeItemCollapsibleState.None,
                    {
                        command: 'dyad.refreshSidebar',
                        title: 'Refresh'
                    },
                    'action',
                    new vscode.ThemeIcon('refresh')
                )
            ];
        }
    }

    /**
     * Get quick action items
     */
    private getActionItems(): DyadTreeItem[] {
        return [
            new DyadTreeItem(
                'Create New App',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'dyad.createApp',
                    title: 'Create New App'
                },
                'action',
                new vscode.ThemeIcon('add')
            ),
            new DyadTreeItem(
                'Run App',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'dyad.runApp',
                    title: 'Run App'
                },
                'action',
                new vscode.ThemeIcon('play')
            ),
            new DyadTreeItem(
                'Stop App',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'dyad.stopApp',
                    title: 'Stop App'
                },
                'action',
                new vscode.ThemeIcon('stop')
            ),
            new DyadTreeItem(
                'Open Console',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'dyad.openConsole',
                    title: 'Open Console'
                },
                'action',
                new vscode.ThemeIcon('terminal')
            ),
            new DyadTreeItem(
                'Send CLI Command',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'dyad.sendCliCommand',
                    title: 'Send CLI Command'
                },
                'action',
                new vscode.ThemeIcon('debug-console')
            ),
            new DyadTreeItem(
                'Refresh',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'dyad.refreshSidebar',
                    title: 'Refresh'
                },
                'action',
                new vscode.ThemeIcon('refresh')
            )
        ];
    }
}
