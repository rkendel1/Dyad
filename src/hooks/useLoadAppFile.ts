import { useState, useEffect, useRef } from "react";
import { IpcClient } from "@/ipc/ipc_client";

export function useLoadAppFile(appId: number | null, filePath: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Reset mounted flag on mount
    mountedRef.current = true;

    const loadFile = async () => {
      if (appId === null || filePath === null) {
        // Only update state if still mounted
        if (mountedRef.current) {
          setContent(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      // Only set loading if still mounted
      if (mountedRef.current) {
        setLoading(true);
      }

      try {
        const ipcClient = IpcClient.getInstance();
        const fileContent = await ipcClient.readAppFile(appId, filePath);

        // Only update state if still mounted and parameters haven't changed
        if (mountedRef.current) {
          setContent(fileContent);
          setError(null);
        }
      } catch (error) {
        console.error(
          `Error loading file ${filePath} for app ${appId}:`,
          error,
        );
        // Only update state if still mounted
        if (mountedRef.current) {
          setError(error instanceof Error ? error : new Error(String(error)));
          setContent(null);
        }
      } finally {
        // Only update state if still mounted
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadFile();

    // Cleanup function to prevent memory leaks
    return () => {
      mountedRef.current = false;
    };
  }, [appId, filePath]);

  const refreshFile = async () => {
    if (appId === null || filePath === null) {
      return;
    }

    // Check if component is still mounted before starting
    if (!mountedRef.current) {
      return;
    }

    setLoading(true);
    try {
      const ipcClient = IpcClient.getInstance();
      const fileContent = await ipcClient.readAppFile(appId, filePath);

      // Only update state if still mounted
      if (mountedRef.current) {
        setContent(fileContent);
        setError(null);
      }
    } catch (error) {
      console.error(
        `Error refreshing file ${filePath} for app ${appId}:`,
        error,
      );
      // Only update state if still mounted
      if (mountedRef.current) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      // Only update state if still mounted
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return { content, loading, error, refreshFile };
}
