import net from "net";

export function findAvailablePort(
  minPort: number,
  maxPort: number,
): Promise<number> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = Math.min(100, maxPort - minPort + 1); // Limit attempts but allow more for larger ranges
    const triedPorts = new Set<number>();

    function tryPort() {
      if (attempts >= maxAttempts) {
        reject(
          new Error(
            `Failed to find an available port in range ${minPort}-${maxPort} after ${maxAttempts} attempts.`,
          ),
        );
        return;
      }

      attempts++;

      // Try to find a port that hasn't been tried yet
      let port: number;
      do {
        port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
      } while (triedPorts.has(port) && triedPorts.size < maxPort - minPort + 1);

      triedPorts.add(port);

      const server = net.createServer();

      server.once("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          // Port is in use, try another one
          console.log(`Port ${port} is in use, trying another...`);
          server.close(() => tryPort());
        } else {
          // Other error
          server.close(() => reject(err));
        }
      });

      server.once("listening", () => {
        server.close(() => {
          resolve(port);
        });
      });

      server.listen(port, "localhost");
    }

    tryPort();
  });
}

/**
 * Check if a specific port is available
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, "localhost");
  });
}

/**
 * Find multiple available ports within a range
 */
export async function findAvailablePorts(
  minPort: number,
  maxPort: number,
  count: number = 1,
): Promise<number[]> {
  const ports: number[] = [];
  const triedPorts = new Set<number>();

  for (let i = 0; i < count; i++) {
    try {
      let port: number;
      let attempts = 0;
      const maxAttempts = Math.min(50, maxPort - minPort + 1);

      do {
        if (attempts >= maxAttempts) {
          throw new Error(
            `Could not find ${count} available ports in range ${minPort}-${maxPort}`,
          );
        }
        port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
        attempts++;
      } while (triedPorts.has(port) || ports.includes(port));

      triedPorts.add(port);

      if (await isPortAvailable(port)) {
        ports.push(port);
      } else {
        i--; // Retry this iteration
      }
    } catch (error) {
      throw new Error(`Failed to find available ports: ${error}`);
    }
  }

  return ports;
}
