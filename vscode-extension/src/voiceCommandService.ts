import * as vscode from 'vscode';

/**
 * VoiceCommandService handles voice input in VS Code
 * Note: VS Code extensions run in Node.js, not the browser,
 * so we communicate with the Dyad Desktop app for actual voice processing
 */
export class VoiceCommandService {
    private isListening: boolean = false;
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        
        // Create status bar item for voice input
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.text = "$(mic) Voice";
        this.statusBarItem.tooltip = "Click to start voice input";
        this.statusBarItem.command = 'dyad.startVoiceInput';
        this.statusBarItem.show();
    }

    public async startListening(): Promise<void> {
        if (this.isListening) {
            vscode.window.showWarningMessage('Voice input is already active');
            return;
        }

        this.isListening = true;
        this.updateStatusBar();
        
        this.outputChannel.appendLine('Voice input started...');

        // Show notification
        vscode.window.showInformationMessage(
            'Voice input started. Speak your command and press Stop when done.',
            'Stop'
        ).then(selection => {
            if (selection === 'Stop') {
                this.stopListening();
            }
        });

        // In a real implementation, this would:
        // 1. Send a message to Dyad Desktop to start listening
        // 2. Receive the transcribed text back
        // 3. Insert it into the active editor or send to Dyad chat
        
        // For now, we'll simulate it with a timeout
        this.simulateVoiceInput();
    }

    public stopListening(): void {
        if (!this.isListening) {
            return;
        }

        this.isListening = false;
        this.updateStatusBar();
        this.outputChannel.appendLine('Voice input stopped');
    }

    public isCurrentlyListening(): boolean {
        return this.isListening;
    }

    private updateStatusBar(): void {
        if (this.isListening) {
            this.statusBarItem.text = "$(mic-filled) Listening...";
            this.statusBarItem.tooltip = "Click to stop voice input";
            this.statusBarItem.command = 'dyad.stopVoiceInput';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            this.statusBarItem.text = "$(mic) Voice";
            this.statusBarItem.tooltip = "Click to start voice input";
            this.statusBarItem.command = 'dyad.startVoiceInput';
            this.statusBarItem.backgroundColor = undefined;
        }
    }

    private simulateVoiceInput(): void {
        // This is a placeholder for demonstration
        // In production, this would integrate with Dyad Desktop's voice service
        const editor = vscode.window.activeTextEditor;
        
        if (editor) {
            vscode.window.showInputBox({
                prompt: 'Enter voice command (simulated)',
                placeHolder: 'e.g., Create a new React component'
            }).then(command => {
                if (command) {
                    this.processVoiceCommand(command);
                }
                this.stopListening();
            });
        } else {
            this.stopListening();
            vscode.window.showErrorMessage('No active editor');
        }
    }

    private async processVoiceCommand(command: string): Promise<void> {
        this.outputChannel.appendLine(`Processing voice command: ${command}`);

        // Analyze the command and take appropriate action
        const lowerCommand = command.toLowerCase();

        if (lowerCommand.includes('create') && lowerCommand.includes('app')) {
            // Trigger create app command
            vscode.commands.executeCommand('dyad.createApp');
        } else if (lowerCommand.includes('run') || lowerCommand.includes('start')) {
            // Trigger run app command
            vscode.commands.executeCommand('dyad.runApp');
        } else if (lowerCommand.includes('stop')) {
            // Trigger stop app command
            vscode.commands.executeCommand('dyad.stopApp');
        } else {
            // Send as a chat message to Dyad
            vscode.window.showInformationMessage(
                `Voice command: "${command}" - This would be sent to Dyad chat`,
                'Open Dyad'
            ).then(selection => {
                if (selection === 'Open Dyad') {
                    // In production, this would open Dyad Desktop or send to API
                    this.outputChannel.appendLine('Opening Dyad Desktop...');
                }
            });
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
