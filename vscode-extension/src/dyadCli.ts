import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * DyadCli provides methods to interact with the Dyad CLI
 */
export class DyadCli {
    private dyadPath: string;

    constructor() {
        // Default to 'dyad' in PATH, can be configured later
        this.dyadPath = 'dyad';
    }

    /**
     * Set the path to the Dyad executable
     */
    setDyadPath(path: string): void {
        this.dyadPath = path;
    }

    /**
     * Create a new Dyad app
     */
    async createApp(appName: string): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} create ${appName}`);
            if (stderr) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error) {
            throw new Error(`Failed to create app: ${error}`);
        }
    }

    /**
     * Run a Dyad app by ID
     */
    async runApp(appId: number): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} run ${appId}`);
            if (stderr) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error) {
            throw new Error(`Failed to run app: ${error}`);
        }
    }

    /**
     * Stop a running Dyad app
     */
    async stopApp(appId: number): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} stop ${appId}`);
            if (stderr) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error) {
            throw new Error(`Failed to stop app: ${error}`);
        }
    }

    /**
     * Open the Dyad console
     */
    async openConsole(): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} console`);
            if (stderr) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error) {
            throw new Error(`Failed to open console: ${error}`);
        }
    }

    /**
     * Send a command to the Dyad CLI
     */
    async sendCommand(command: string): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} ${command}`);
            if (stderr) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error) {
            throw new Error(`Failed to send command: ${error}`);
        }
    }

    /**
     * List all Dyad apps
     */
    async listApps(): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} list`);
            if (stderr) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error) {
            throw new Error(`Failed to list apps: ${error}`);
        }
    }

    /**
     * Get help from the CLI
     */
    async getHelp(): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} help`);
            if (stderr) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error) {
            throw new Error(`Failed to get help: ${error}`);
        }
    }

    /**
     * Clear the console output
     */
    async clearConsole(): Promise<string> {
        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} clear`);
            if (stderr) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error) {
            throw new Error(`Failed to clear console: ${error}`);
        }
    }
}
