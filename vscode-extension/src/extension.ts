import * as vscode from 'vscode';
import { DyadCli } from './dyadCli';
import { DyadApi } from './dyadApi';
import { DyadSidebarProvider } from './views/sidebar';

let dyadCli: DyadCli;
let dyadApi: DyadApi;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    console.log('Dyad extension is now active');

    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel('Dyad');
    context.subscriptions.push(outputChannel);

    // Initialize CLI and API clients
    dyadCli = new DyadCli();
    dyadApi = new DyadApi();

    // Check API health on activation
    checkDyadConnection();

    // Register sidebar view provider
    const sidebarProvider = new DyadSidebarProvider(context.extensionUri, dyadCli, dyadApi);
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('dyadApps', sidebarProvider),
        vscode.window.registerTreeDataProvider('dyadActions', sidebarProvider)
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
