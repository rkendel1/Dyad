import * as vscode from 'vscode';
import { DyadCli } from './dyadCli';
import { DyadApi } from './dyadApi';
import { DyadSidebarProvider } from './views/sidebar';

let dyadCli: DyadCli;
let dyadApi: DyadApi;

export function activate(context: vscode.ExtensionContext) {
    console.log('Dyad extension is now active');

    // Initialize CLI and API clients
    dyadCli = new DyadCli();
    dyadApi = new DyadApi();

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
                placeHolder: 'my-app'
            });

            if (appName) {
                try {
                    await dyadCli.createApp(appName);
                    vscode.window.showInformationMessage(`App "${appName}" created successfully!`);
                    sidebarProvider.refresh();
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to create app: ${error}`);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.runApp', async () => {
            const apps = await dyadApi.getApps();
            if (apps.length === 0) {
                vscode.window.showInformationMessage('No apps available to run');
                return;
            }

            const selectedApp = await vscode.window.showQuickPick(
                apps.map(app => ({ label: app.name, id: app.id })),
                { placeHolder: 'Select an app to run' }
            );

            if (selectedApp) {
                try {
                    await dyadCli.runApp(selectedApp.id);
                    vscode.window.showInformationMessage(`App "${selectedApp.label}" is running`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to run app: ${error}`);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.stopApp', async () => {
            const apps = await dyadApi.getApps();
            const runningApps = apps.filter(app => app.isRunning);

            if (runningApps.length === 0) {
                vscode.window.showInformationMessage('No apps are currently running');
                return;
            }

            const selectedApp = await vscode.window.showQuickPick(
                runningApps.map(app => ({ label: app.name, id: app.id })),
                { placeHolder: 'Select an app to stop' }
            );

            if (selectedApp) {
                try {
                    await dyadCli.stopApp(selectedApp.id);
                    vscode.window.showInformationMessage(`App "${selectedApp.label}" stopped`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to stop app: ${error}`);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.openConsole', async () => {
            try {
                await dyadCli.openConsole();
                vscode.window.showInformationMessage('Dyad console opened');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to open console: ${error}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.sendCliCommand', async () => {
            const command = await vscode.window.showInputBox({
                prompt: 'Enter a CLI command to send to Dyad',
                placeHolder: 'help, clear, etc.'
            });

            if (command) {
                try {
                    const result = await dyadCli.sendCommand(command);
                    vscode.window.showInformationMessage(`Command executed: ${result}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to execute command: ${error}`);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('dyad.refreshSidebar', () => {
            sidebarProvider.refresh();
            vscode.window.showInformationMessage('Sidebar refreshed');
        })
    );
}

export function deactivate() {
    console.log('Dyad extension is now deactivated');
}
