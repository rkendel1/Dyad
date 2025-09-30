import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * DyadCli provides methods to interact with the Dyad CLI
 * Note: Dyad is primarily an Electron desktop application, not a CLI tool.
 * This class attempts to execute commands but will gracefully handle
 * cases where the CLI is not available.
 */
export class DyadCli {
    private dyadPath: string;
    private cliAvailable: boolean | null = null;

    constructor() {
        // Default to 'dyad' in PATH, can be configured later
        this.dyadPath = 'dyad';
    }

    /**
     * Set the path to the Dyad executable
     */
    setDyadPath(path: string): void {
        this.dyadPath = path;
        this.cliAvailable = null; // Reset availability check
    }

    /**
     * Check if the Dyad CLI is available
     */
    async checkCliAvailability(): Promise<boolean> {
        if (this.cliAvailable !== null) {
            return this.cliAvailable;
        }

        try {
            await execAsync(`${this.dyadPath} --version`, { timeout: 5000 });
            this.cliAvailable = true;
            return true;
        } catch (error) {
            console.log('Dyad CLI not found in PATH. This is expected as Dyad is a desktop application.');
            this.cliAvailable = false;
            return false;
        }
    }

    /**
     * Create a new Dyad app
     */
    async createApp(appName: string): Promise<string> {
        const available = await this.checkCliAvailability();
        if (!available) {
            throw new Error('Dyad CLI is not available. Please use the Dyad Desktop application to create apps.');
        }

        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} create ${appName}`, { timeout: 30000 });
            if (stderr && !stderr.includes('warning')) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Failed to create app:', error);
            throw new Error(`Failed to create app: ${message}`);
        }
    }

    /**
     * Run a Dyad app by ID
     */
    async runApp(appId: number): Promise<string> {
        const available = await this.checkCliAvailability();
        if (!available) {
            throw new Error('Dyad CLI is not available. Please use the Dyad Desktop application to run apps.');
        }

        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} run ${appId}`, { timeout: 30000 });
            if (stderr && !stderr.includes('warning')) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Failed to run app:', error);
            throw new Error(`Failed to run app: ${message}`);
        }
    }

    /**
     * Stop a running Dyad app
     */
    async stopApp(appId: number): Promise<string> {
        const available = await this.checkCliAvailability();
        if (!available) {
            throw new Error('Dyad CLI is not available. Please use the Dyad Desktop application to stop apps.');
        }

        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} stop ${appId}`, { timeout: 30000 });
            if (stderr && !stderr.includes('warning')) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Failed to stop app:', error);
            throw new Error(`Failed to stop app: ${message}`);
        }
    }

    /**
     * Open the Dyad console
     */
    async openConsole(): Promise<string> {
        const available = await this.checkCliAvailability();
        if (!available) {
            throw new Error('Dyad CLI is not available. Please use the Dyad Desktop application.');
        }

        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} console`, { timeout: 30000 });
            if (stderr && !stderr.includes('warning')) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Failed to open console:', error);
            throw new Error(`Failed to open console: ${message}`);
        }
    }

    /**
     * Send a command to the Dyad CLI
     */
    async sendCommand(command: string): Promise<string> {
        const available = await this.checkCliAvailability();
        if (!available) {
            throw new Error('Dyad CLI is not available. Please use the Dyad Desktop application.');
        }

        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} ${command}`, { timeout: 30000 });
            if (stderr && !stderr.includes('warning')) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Failed to send command:', error);
            throw new Error(`Failed to send command: ${message}`);
        }
    }

    /**
     * List all Dyad apps
     */
    async listApps(): Promise<string> {
        const available = await this.checkCliAvailability();
        if (!available) {
            throw new Error('Dyad CLI is not available. Please use the Dyad Desktop application.');
        }

        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} list`, { timeout: 30000 });
            if (stderr && !stderr.includes('warning')) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Failed to list apps:', error);
            throw new Error(`Failed to list apps: ${message}`);
        }
    }

    /**
     * Get help from the CLI
     */
    async getHelp(): Promise<string> {
        const available = await this.checkCliAvailability();
        if (!available) {
            throw new Error('Dyad CLI is not available. Please use the Dyad Desktop application.');
        }

        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} help`, { timeout: 10000 });
            if (stderr && !stderr.includes('warning')) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Failed to get help:', error);
            throw new Error(`Failed to get help: ${message}`);
        }
    }

    /**
     * Clear the console output
     */
    async clearConsole(): Promise<string> {
        const available = await this.checkCliAvailability();
        if (!available) {
            throw new Error('Dyad CLI is not available. Please use the Dyad Desktop application.');
        }

        try {
            const { stdout, stderr } = await execAsync(`${this.dyadPath} clear`, { timeout: 10000 });
            if (stderr && !stderr.includes('warning')) {
                console.error('Dyad CLI stderr:', stderr);
            }
            return stdout;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Failed to clear console:', error);
            throw new Error(`Failed to clear console: ${message}`);
        }
    }
}
