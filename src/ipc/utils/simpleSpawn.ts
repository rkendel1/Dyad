import { spawn } from "child_process";
import log from "electron-log/main";

const logger = log.scope("simpleSpawn");

export async function simpleSpawn({
  command,
  cwd,
  successMessage,
  errorPrefix,
  env,
}: {
  command: string;
  cwd: string;
  successMessage: string;
  errorPrefix: string;
  env?: Record<string, string>;
}): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    logger.info(`Running: ${command}`);
    const process = spawn(command, {
      cwd,
      shell: true,
      stdio: "pipe",
      env,
    });

    let stdout = "";
    let stderr = "";

    const stdoutHandler = (data: Buffer) => {
      const output = data.toString();
      stdout += output;
      logger.info(output);
    };

    const stderrHandler = (data: Buffer) => {
      const output = data.toString();
      stderr += output;
      logger.error(output);
    };

    const cleanupListeners = () => {
      process.stdout?.removeListener("data", stdoutHandler);
      process.stderr?.removeListener("data", stderrHandler);
      process.removeAllListeners("close");
      process.removeAllListeners("error");

      // Close stdio streams to release resources
      try {
        process.stdout?.destroy();
        process.stderr?.destroy();
        process.stdin?.destroy();
      } catch (err) {
        logger.warn(`Error destroying stdio streams: ${err}`);
      }
    };

    process.stdout?.on("data", stdoutHandler);
    process.stderr?.on("data", stderrHandler);

    process.on("close", (code) => {
      cleanupListeners();
      if (code === 0) {
        logger.info(successMessage);
        resolve();
      } else {
        logger.error(`${errorPrefix}, exit code ${code}`);
        const errorMessage = `${errorPrefix} (exit code ${code})\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
        reject(new Error(errorMessage));
      }
    });

    process.on("error", (err) => {
      cleanupListeners();
      logger.error(`Failed to spawn command: ${command}`, err);
      const errorMessage = `Failed to spawn command: ${err.message}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
      reject(new Error(errorMessage));
    });
  });
}
