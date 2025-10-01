import * as vscode from 'vscode';
import { DyadCli } from './dyadCli';
import { DyadApi } from './dyadApi';
import { DyadSidebarProvider } from './views/sidebar';
import { CollaborationSidebarProvider } from './views/collaborationSidebar';
import { matchTemplates, formatTemplateChoices, getBestTemplate } from './templateMatcher';
import { CollaborationService } from './collaboration/collaborationService';
import { CollaborationPanel } from './collaboration/collaborationPanel';
import { DecoratorManager } from './collaboration/decoratorManager';

let dyadCli: DyadCli;
let dyadApi: DyadApi;
let outputChannel: vscode.OutputChannel;
let collaborationService: CollaborationService;
let collaborationPanel: CollaborationPanel;
let decoratorManager: DecoratorManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Dyad extension is now active');

    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel('Dyad');
    context.subscriptions.push(outputChannel);

    // Initialize CLI and API clients
    dyadCli = new DyadCli();
    dyadApi = new DyadApi();

    // Initialize collaboration services
    collaborationService = new CollaborationService(outputChannel);
    context.subscriptions.push(collaborationService);

    collaborationPanel = new CollaborationPanel(context, collaborationService);
    context.subscriptions.push(collaborationPanel);

    decoratorManager = new DecoratorManager(collaborationService);
    context.subscriptions.push(decoratorManager);

    // Check API health on activation
    checkDyadConnection();

    // Register sidebar view provider
    const sidebarProvider = new DyadSidebarProvider(context.extensionUri, dyadCli, dyadApi);
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('dyadApps', sidebarProvider),
        vscode.window.registerTreeDataProvider('dyadActions', sidebarProvider)
    );

    // Register collaboration sidebar
    const collaborationSidebarProvider = new CollaborationSidebarProvider(collaborationService);
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('dyadCollaboration', collaborationSidebarProvider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.createApp', async () => {
            const appName = await vscode.window.showInputBox({
                prompt: 'Enter the name for your new Dyad app',
                placeHolder: 'my-app',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'App name cannot be empty';
                    }
                    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                        return 'App name can only contain letters, numbers, hyphens, and underscores';
                    }
                    return null;
                }
            });

            if (appName) {
                try {
                    outputChannel.appendLine(`Creating app: ${appName}`);
                    await dyadCli.createApp(appName);
                    vscode.window.showInformationMessage(`App "${appName}" created successfully!`);
                    outputChannel.appendLine(`App "${appName}" created successfully`);
                    sidebarProvider.refresh();
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    outputChannel.appendLine(`Error creating app: ${message}`);
                    vscode.window.showErrorMessage(`Failed to create app: ${message}`);
                    
                    // Show helpful message if CLI is not available
                    if (message.includes('not available')) {
                        showDyadDesktopRequiredMessage();
                    }
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.runApp', async () => {
            try {
                const apps = await dyadApi.getApps();
                if (apps.length === 0) {
                    vscode.window.showInformationMessage('No apps available to run. Create one first using Dyad Desktop or the "Create New App" command.');
                    return;
                }

                const selectedApp = await vscode.window.showQuickPick(
                    apps.map(app => ({ label: app.name, id: app.id, description: app.path })),
                    { placeHolder: 'Select an app to run' }
                );

                if (selectedApp) {
                    try {
                        outputChannel.appendLine(`Running app: ${selectedApp.label} (ID: ${selectedApp.id})`);
                        await dyadCli.runApp(selectedApp.id);
                        vscode.window.showInformationMessage(`App "${selectedApp.label}" is running`);
                        outputChannel.appendLine(`App "${selectedApp.label}" started successfully`);
                        sidebarProvider.refresh();
                    } catch (error) {
                        const message = error instanceof Error ? error.message : String(error);
                        outputChannel.appendLine(`Error running app: ${message}`);
                        vscode.window.showErrorMessage(`Failed to run app: ${message}`);
                        
                        if (message.includes('not available')) {
                            showDyadDesktopRequiredMessage();
                        }
                    }
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error fetching apps: ${message}`);
                vscode.window.showErrorMessage(`Failed to fetch apps: ${message}`);
                
                if (message.includes('Cannot connect')) {
                    showDyadDesktopRequiredMessage();
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.stopApp', async () => {
            try {
                const apps = await dyadApi.getApps();
                const runningApps = apps.filter(app => app.isRunning);

                if (runningApps.length === 0) {
                    vscode.window.showInformationMessage('No apps are currently running');
                    return;
                }

                const selectedApp = await vscode.window.showQuickPick(
                    runningApps.map(app => ({ label: app.name, id: app.id, description: app.path })),
                    { placeHolder: 'Select an app to stop' }
                );

                if (selectedApp) {
                    try {
                        outputChannel.appendLine(`Stopping app: ${selectedApp.label} (ID: ${selectedApp.id})`);
                        await dyadCli.stopApp(selectedApp.id);
                        vscode.window.showInformationMessage(`App "${selectedApp.label}" stopped`);
                        outputChannel.appendLine(`App "${selectedApp.label}" stopped successfully`);
                        sidebarProvider.refresh();
                    } catch (error) {
                        const message = error instanceof Error ? error.message : String(error);
                        outputChannel.appendLine(`Error stopping app: ${message}`);
                        vscode.window.showErrorMessage(`Failed to stop app: ${message}`);
                        
                        if (message.includes('not available')) {
                            showDyadDesktopRequiredMessage();
                        }
                    }
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error fetching apps: ${message}`);
                vscode.window.showErrorMessage(`Failed to fetch apps: ${message}`);
                
                if (message.includes('Cannot connect')) {
                    showDyadDesktopRequiredMessage();
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.openConsole', async () => {
            try {
                outputChannel.appendLine('Opening Dyad console...');
                await dyadCli.openConsole();
                vscode.window.showInformationMessage('Dyad console opened');
                outputChannel.appendLine('Dyad console opened successfully');
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error opening console: ${message}`);
                vscode.window.showErrorMessage(`Failed to open console: ${message}`);
                
                if (message.includes('not available')) {
                    showDyadDesktopRequiredMessage();
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.sendCliCommand', async () => {
            const command = await vscode.window.showInputBox({
                prompt: 'Enter a CLI command to send to Dyad',
                placeHolder: 'help, clear, etc.',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Command cannot be empty';
                    }
                    return null;
                }
            });

            if (command) {
                try {
                    outputChannel.appendLine(`Executing command: ${command}`);
                    const result = await dyadCli.sendCommand(command);
                    vscode.window.showInformationMessage(`Command executed successfully`);
                    outputChannel.appendLine(`Command result:\n${result}`);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    outputChannel.appendLine(`Error executing command: ${message}`);
                    vscode.window.showErrorMessage(`Failed to execute command: ${message}`);
                    
                    if (message.includes('not available')) {
                        showDyadDesktopRequiredMessage();
                    }
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.refreshSidebar', () => {
            outputChannel.appendLine('Refreshing sidebar...');
            sidebarProvider.refresh();
            vscode.window.showInformationMessage('Sidebar refreshed');
        })
    );

    // Add health check command
    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.checkHealth', async () => {
            outputChannel.appendLine('Checking Dyad Desktop connection...');
            const isHealthy = await dyadApi.checkHealth();
            
            if (isHealthy) {
                vscode.window.showInformationMessage('✓ Successfully connected to Dyad Desktop');
                outputChannel.appendLine('✓ Dyad Desktop is running and accessible');
            } else {
                vscode.window.showWarningMessage('✗ Cannot connect to Dyad Desktop. Please make sure it is running.');
                outputChannel.appendLine('✗ Failed to connect to Dyad Desktop');
                showDyadDesktopRequiredMessage();
            }
        })
    );

    // Add template-based app creation command
    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.createAppWithTemplate', async () => {
            // Step 1: Ask user to describe their app
            const description = await vscode.window.showInputBox({
                prompt: 'Describe the app you want to build (e.g., "an e-commerce store with payments")',
                placeHolder: 'e.g., a blog, a dashboard, an e-commerce store',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Please provide a description';
                    }
                    return null;
                }
            });

            if (!description) {
                return;
            }

            try {
                outputChannel.appendLine(`Analyzing description: ${description}`);
                
                // Step 2: Match templates based on description
                const matchedTemplates = matchTemplates(description);
                const bestMatch = getBestTemplate(description);
                
                outputChannel.appendLine(`Found ${matchedTemplates.length} matching templates`);
                outputChannel.appendLine(`Best match: ${bestMatch.title}`);

                // Step 3: Show suggested templates
                const templateChoices = formatTemplateChoices(
                    matchedTemplates.length > 0 ? matchedTemplates.slice(0, 5) : [bestMatch]
                );

                const selectedTemplate = await vscode.window.showQuickPick(templateChoices, {
                    placeHolder: 'Select a template for your app (auto-suggested based on your description)',
                    title: 'Choose App Template'
                });

                if (!selectedTemplate) {
                    return;
                }

                outputChannel.appendLine(`Selected template: ${selectedTemplate.label} (${selectedTemplate.templateId})`);

                // Step 4: Ask for app name
                const appName = await vscode.window.showInputBox({
                    prompt: 'Enter the name for your new Dyad app',
                    placeHolder: 'my-app',
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'App name cannot be empty';
                        }
                        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                            return 'App name can only contain letters, numbers, hyphens, and underscores';
                        }
                        return null;
                    }
                });

                if (!appName) {
                    return;
                }

                // Step 5: Create app with selected template
                outputChannel.appendLine(`Creating app: ${appName} with template: ${selectedTemplate.templateId}`);
                const app = await dyadApi.createAppWithTemplate(appName, selectedTemplate.templateId || 'react');
                
                if (app) {
                    vscode.window.showInformationMessage(`App "${appName}" created successfully with ${selectedTemplate.label}!`);
                    outputChannel.appendLine(`App "${appName}" created successfully`);
                    sidebarProvider.refresh();
                } else {
                    throw new Error('Failed to create app');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error creating app: ${message}`);
                vscode.window.showErrorMessage(`Failed to create app: ${message}`);
                
                if (message.includes('not available') || message.includes('Cannot connect')) {
                    showDyadDesktopRequiredMessage();
                }
            }
        })
    );

    // Add local Supabase setup command
    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.setupLocalSupabase', async () => {
            try {
                const apps = await dyadApi.getApps();
                if (apps.length === 0) {
                    vscode.window.showInformationMessage('No apps available. Create one first.');
                    return;
                }

                const selectedApp = await vscode.window.showQuickPick(
                    apps.map(app => ({ label: app.name, id: app.id, description: app.path })),
                    { placeHolder: 'Select an app to setup local Supabase' }
                );

                if (!selectedApp) {
                    return;
                }

                outputChannel.appendLine(`Setting up local Supabase for app: ${selectedApp.label} (ID: ${selectedApp.id})`);
                
                const result = await dyadApi.setupLocalSupabase({ appId: selectedApp.id });
                
                if (result.success) {
                    vscode.window.showInformationMessage(`Local Supabase setup successfully for "${selectedApp.label}"!`);
                    outputChannel.appendLine(`Local Supabase setup completed for app: ${selectedApp.label}`);
                } else {
                    throw new Error(result.message || 'Setup failed');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error setting up local Supabase: ${message}`);
                vscode.window.showErrorMessage(`Failed to setup local Supabase: ${message}`);
                
                if (message.includes('not available') || message.includes('Cannot connect')) {
                    showDyadDesktopRequiredMessage();
                }
            }
        })
    );

    // Add production Supabase promotion command
    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.promoteToProduction', async () => {
            try {
                const apps = await dyadApi.getApps();
                if (apps.length === 0) {
                    vscode.window.showInformationMessage('No apps available. Create one first.');
                    return;
                }

                const selectedApp = await vscode.window.showQuickPick(
                    apps.map(app => ({ label: app.name, id: app.id, description: app.path })),
                    { placeHolder: 'Select an app to promote to production Supabase' }
                );

                if (!selectedApp) {
                    return;
                }

                // Collect production Supabase details
                const projectRef = await vscode.window.showInputBox({
                    prompt: 'Enter your production Supabase project reference',
                    placeHolder: 'e.g., abcdefghijklmnop',
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Project reference is required';
                        }
                        return null;
                    }
                });

                if (!projectRef) {
                    return;
                }

                const supabaseUrl = await vscode.window.showInputBox({
                    prompt: 'Enter your production Supabase URL',
                    placeHolder: 'https://xxxx.supabase.co',
                    value: `https://${projectRef}.supabase.co`,
                    validateInput: (value) => {
                        if (!value || !value.startsWith('https://')) {
                            return 'Valid HTTPS URL is required';
                        }
                        return null;
                    }
                });

                if (!supabaseUrl) {
                    return;
                }

                const anonKey = await vscode.window.showInputBox({
                    prompt: 'Enter your production Supabase anon key',
                    placeHolder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Anon key is required';
                        }
                        return null;
                    }
                });

                if (!anonKey) {
                    return;
                }

                const serviceRoleKey = await vscode.window.showInputBox({
                    prompt: 'Enter your production Supabase service role key',
                    placeHolder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Service role key is required';
                        }
                        return null;
                    }
                });

                if (!serviceRoleKey) {
                    return;
                }

                const dbPassword = await vscode.window.showInputBox({
                    prompt: 'Enter your production Supabase database password',
                    placeHolder: 'Your database password',
                    password: true,
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Database password is required';
                        }
                        return null;
                    }
                });

                if (!dbPassword) {
                    return;
                }

                outputChannel.appendLine(`Promoting app: ${selectedApp.label} (ID: ${selectedApp.id}) to production`);
                
                const result = await dyadApi.promoteToProduction({
                    appId: selectedApp.id,
                    productionProjectRef: projectRef,
                    supabaseUrl,
                    anonKey,
                    serviceRoleKey,
                    dbPassword
                });
                
                if (result.success) {
                    vscode.window.showInformationMessage(`Successfully promoted "${selectedApp.label}" to production Supabase!`);
                    outputChannel.appendLine(`Production promotion completed for app: ${selectedApp.label}`);
                } else {
                    throw new Error(result.message || 'Promotion failed');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error promoting to production: ${message}`);
                vscode.window.showErrorMessage(`Failed to promote to production: ${message}`);
                
                if (message.includes('not available') || message.includes('Cannot connect')) {
                    showDyadDesktopRequiredMessage();
                }
            }
        })
    );

    // Register collaboration commands
    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.startCollaboration', async () => {
            try {
                // Get apps
                const apps = await dyadApi.getApps();
                if (apps.length === 0) {
                    vscode.window.showInformationMessage('No apps available. Create an app first.');
                    return;
                }

                // Select app
                const selectedApp = await vscode.window.showQuickPick(
                    apps.map(app => ({ label: app.name, id: app.id })),
                    { placeHolder: 'Select an app to collaborate on' }
                );

                if (!selectedApp) {
                    return;
                }

                // Get user name
                const userName = await vscode.window.showInputBox({
                    prompt: 'Enter your name for this collaboration session',
                    placeHolder: 'Your Name',
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Name cannot be empty';
                        }
                        return null;
                    }
                });

                if (!userName) {
                    return;
                }

                // Start collaboration session
                outputChannel.appendLine(`Starting collaboration session for app: ${selectedApp.label}`);
                const session = await collaborationService.startSession(
                    selectedApp.id,
                    selectedApp.label,
                    userName
                );

                // Show collaboration panel
                collaborationPanel.show();

                // Show session info
                vscode.window.showInformationMessage(
                    `Collaboration session started! Session ID: ${session.id}`,
                    'Copy Session ID',
                    'Share Link'
                ).then(action => {
                    if (action === 'Copy Session ID') {
                        vscode.env.clipboard.writeText(session.id);
                        vscode.window.showInformationMessage('Session ID copied to clipboard');
                    } else if (action === 'Share Link') {
                        const link = `dyad://collaborate/${session.id}`;
                        vscode.env.clipboard.writeText(link);
                        vscode.window.showInformationMessage('Collaboration link copied to clipboard');
                    }
                });

                outputChannel.appendLine(`Collaboration session created: ${session.id}`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error starting collaboration: ${message}`);
                vscode.window.showErrorMessage(`Failed to start collaboration: ${message}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.joinCollaboration', async () => {
            try {
                // Get session ID
                const sessionId = await vscode.window.showInputBox({
                    prompt: 'Enter the collaboration session ID',
                    placeHolder: 'session-xxxxx-xxxxx',
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Session ID cannot be empty';
                        }
                        return null;
                    }
                });

                if (!sessionId) {
                    return;
                }

                // Get user name
                const userName = await vscode.window.showInputBox({
                    prompt: 'Enter your name for this collaboration session',
                    placeHolder: 'Your Name',
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Name cannot be empty';
                        }
                        return null;
                    }
                });

                if (!userName) {
                    return;
                }

                // Join collaboration session
                outputChannel.appendLine(`Joining collaboration session: ${sessionId}`);
                const session = await collaborationService.joinSession(sessionId, userName);

                // Show collaboration panel
                collaborationPanel.show();

                vscode.window.showInformationMessage(
                    `Joined collaboration session for app: ${session.appName}`
                );

                outputChannel.appendLine(`Joined collaboration session: ${sessionId}`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error joining collaboration: ${message}`);
                vscode.window.showErrorMessage(`Failed to join collaboration: ${message}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.leaveCollaboration', async () => {
            try {
                const session = collaborationService.getCurrentSession();
                if (!session) {
                    vscode.window.showInformationMessage('Not in an active collaboration session');
                    return;
                }

                const confirm = await vscode.window.showWarningMessage(
                    `Leave collaboration session for "${session.appName}"?`,
                    'Leave',
                    'Cancel'
                );

                if (confirm === 'Leave') {
                    await collaborationService.leaveSession();
                    vscode.window.showInformationMessage('Left collaboration session');
                    outputChannel.appendLine('Left collaboration session');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`Error leaving collaboration: ${message}`);
                vscode.window.showErrorMessage(`Failed to leave collaboration: ${message}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.showCollaborationPanel', () => {
            if (!collaborationService.isSessionActive()) {
                vscode.window.showInformationMessage('No active collaboration session');
                return;
            }
            collaborationPanel.show();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.addInlineComment', async () => {
            if (!collaborationService.isSessionActive()) {
                vscode.window.showInformationMessage('Not in an active collaboration session');
                return;
            }

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor');
                return;
            }

            const line = editor.selection.active.line;
            const comment = await vscode.window.showInputBox({
                prompt: `Add comment for line ${line + 1}`,
                placeHolder: 'Enter your comment...'
            });

            if (comment) {
                collaborationService.addInlineComment(line, comment);
                vscode.window.showInformationMessage(`Comment added to line ${line + 1}`);
            }
        })
    );
}

/**
 * Check Dyad Desktop connection on activation
 */
async function checkDyadConnection() {
    try {
        const isHealthy = await dyadApi.checkHealth();
        if (!isHealthy) {
            outputChannel.appendLine('Warning: Cannot connect to Dyad Desktop. Some features may not work.');
            
            // Show a non-intrusive notification
            const action = await vscode.window.showWarningMessage(
                'Dyad Desktop is not running. Some extension features may not work.',
                'Check Connection',
                'Dismiss'
            );
            
            if (action === 'Check Connection') {
                vscode.commands.executeCommand('dyad.checkHealth');
            }
        } else {
            outputChannel.appendLine('✓ Successfully connected to Dyad Desktop');
        }
    } catch (error) {
        outputChannel.appendLine(`Error during health check: ${error}`);
    }
}

/**
 * Show helpful message when Dyad Desktop is required
 */
function showDyadDesktopRequiredMessage() {
    const message = 'This feature requires Dyad Desktop to be running. Please launch Dyad Desktop and try again.';
    vscode.window.showInformationMessage(
        message,
        'Open Dyad Website',
        'Check Connection'
    ).then(action => {
        if (action === 'Open Dyad Website') {
            vscode.env.openExternal(vscode.Uri.parse('https://dyad.sh'));
        } else if (action === 'Check Connection') {
            vscode.commands.executeCommand('dyad.checkHealth');
        }
    });
}

export function deactivate() {
    console.log('Dyad extension is now deactivated');
}
