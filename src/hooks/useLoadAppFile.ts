import { useState, useEffect, useRef } from "react";
import { IpcClient } from "@/ipc/ipc_client";

export function useLoadAppFile(appId: number | null, filePath: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Reset mounted ref on mount
    isMountedRef.current = true;

    const loadFile = async () => {
      if (appId === null || filePath === null) {
        if (isMountedRef.current) {
          setContent(null);
          setError(null);
        }
        return;
      }

      if (isMountedRef.current) {
        setLoading(true);
      }

      try {
        const ipcClient = IpcClient.getInstance();
        const fileContent = await ipcClient.readAppFile(appId, filePath);

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setContent(fileContent);
          setError(null);
        }
      } catch (error) {
        // Only log and update state if component is still mounted
        if (isMountedRef.current) {
          console.error(
            `Error loading file ${filePath} for app ${appId}:`,
            error,
          );
          setError(error instanceof Error ? error : new Error(String(error)));
          setContent(null);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadFile();

    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
    };
  }, [appId, filePath]);

  const refreshFile = async () => {
    if (appId === null || filePath === null) {
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
    }

    try {
      const ipcClient = IpcClient.getInstance();
      const fileContent = await ipcClient.readAppFile(appId, filePath);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setContent(fileContent);
        setError(null);
      }
    } catch (error) {
      // Only log and update state if component is still mounted
      if (isMountedRef.current) {
        console.error(
          `Error refreshing file ${filePath} for app ${appId}:`,
          error,
        );
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return { content, loading, error, refreshFile };
}
