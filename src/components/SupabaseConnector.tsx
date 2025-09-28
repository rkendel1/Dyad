import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

import { IpcClient } from "@/ipc/ipc_client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useSupabase } from "@/hooks/useSupabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadApp } from "@/hooks/useLoadApp";
import { useDeepLink } from "@/contexts/DeepLinkContext";

// @ts-ignore
import supabaseLogoLight from "../../assets/supabase/supabase-logo-wordmark--light.svg";
// @ts-ignore
import supabaseLogoDark from "../../assets/supabase/supabase-logo-wordmark--dark.svg";
// @ts-ignore
import connectSupabaseDark from "../../assets/supabase/connect-supabase-dark.svg";
// @ts-ignore
import connectSupabaseLight from "../../assets/supabase/connect-supabase-light.svg";

import { ExternalLink, Server } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function SupabaseConnector({ appId }: { appId: number }) {
  const { settings, refreshSettings } = useSettings();
  const { app, refreshApp } = useLoadApp(appId);
  const { lastDeepLink } = useDeepLink();
  const { isDarkMode } = useTheme();
  const [localStatus, setLocalStatus] = useState<{ isRunning: boolean; dashboardUrl?: string } | null>(null);

  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "supabase-oauth-return") {
        await refreshSettings();
        await refreshApp();
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  // Check local Supabase status
  useEffect(() => {
    const checkLocalStatus = async () => {
      try {
        const status = await IpcClient.getInstance().getLocalSupabaseStatus();
        setLocalStatus(status);
      } catch (error) {
        console.error("Failed to check local Supabase status:", error);
        setLocalStatus({ isRunning: false });
      }
    };
    
    checkLocalStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkLocalStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const {
    projects,
    loading,
    error,
    loadProjects,
    setAppProject,
    unsetAppProject,
  } = useSupabase();
  const currentProjectId = app?.supabaseProjectId;

  useEffect(() => {
    // Load projects when the component mounts and user is connected
    if (settings?.supabase?.accessToken) {
      loadProjects();
    }
  }, [settings?.supabase?.accessToken, loadProjects]);

  const handleProjectSelect = async (projectId: string) => {
    try {
      await setAppProject(projectId, appId);
      toast.success("Project connected to app successfully");
      await refreshApp();
    } catch (error) {
      toast.error("Failed to connect project to app: " + error);
    }
  };

  const handleUnsetProject = async () => {
    try {
      await unsetAppProject(appId);
      toast.success("Project disconnected from app successfully");
      await refreshApp();
    } catch (error) {
      console.error("Failed to disconnect project:", error);
      toast.error("Failed to disconnect project from app");
    }
  };

  if (settings?.supabase?.accessToken || currentProjectId === "local-supabase") {
    if (app?.supabaseProjectName) {
      return (
        <Card className="mt-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {currentProjectId === "local-supabase" ? "Local Supabase" : "Supabase Project"}{" "}
              <Button
                variant="outline"
                onClick={() => {
                  const url = currentProjectId === "local-supabase" 
                    ? localStatus?.dashboardUrl || "http://localhost:3001"
                    : `https://supabase.com/dashboard/project/${app.supabaseProjectId}`;
                  IpcClient.getInstance().openExternalUrl(url);
                }}
                className="ml-2 px-2 py-1"
                style={{ display: "inline-flex", alignItems: "center" }}
                asChild
              >
                <div className="flex items-center gap-2">
                  {currentProjectId === "local-supabase" ? (
                    <Server className="h-4 w-4" />
                  ) : (
                    <img
                      src={isDarkMode ? supabaseLogoDark : supabaseLogoLight}
                      alt="Supabase Logo"
                      style={{ height: 20, width: "auto", marginRight: 4 }}
                    />
                  )}
                  <ExternalLink className="h-4 w-4" />
                </div>
              </Button>
            </CardTitle>
            <CardDescription>
              {currentProjectId === "local-supabase" 
                ? `This app is connected to local Supabase${localStatus?.isRunning ? " (running)" : " (not running)"}`
                : `This app is connected to project: ${app.supabaseProjectName}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleUnsetProject}>
              Disconnect Project
            </Button>
            {currentProjectId === "local-supabase" && localStatus?.isRunning && (
              <Button 
                variant="outline" 
                className="ml-2"
                onClick={async () => {
                  try {
                    await IpcClient.getInstance().stopLocalSupabase();
                    toast.success("Local Supabase stopped");
                    setLocalStatus({ isRunning: false });
                  } catch (error) {
                    toast.error("Failed to stop local Supabase: " + error);
                  }
                }}
              >
                Stop Local Supabase
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="mt-1">
        <CardHeader>
          <CardTitle>Supabase Projects</CardTitle>
          <CardDescription>
            Select a Supabase project to connect to this app
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-red-500">
              Error loading projects: {error.message}
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => loadProjects()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No projects found in your Supabase account.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project-select">Project</Label>
                    <Select
                      value={currentProjectId || ""}
                      onValueChange={handleProjectSelect}
                    >
                      <SelectTrigger id="project-select">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name || project.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentProjectId && (
                    <div className="text-sm text-gray-500">
                      This app is connected to project:{" "}
                      {projects.find((p) => p.id === currentProjectId)?.name ||
                        currentProjectId}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-md">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <h2 className="text-lg font-medium">Integrations</h2>
        
        <div className="flex flex-col space-y-2 w-full md:w-auto">
          {/* Local Supabase Option */}
          <Button
            onClick={async () => {
              try {
                toast.success("Setting up local Supabase...", {
                  description: "This may take a few moments for first-time setup"
                });
                await IpcClient.getInstance().setupLocalSupabase({ appId });
                toast.success("Local Supabase setup completed!");
                await refreshApp();
              } catch (error) {
                toast.error("Failed to setup local Supabase: " + error);
              }
            }}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="setup-local-supabase-button"
          >
            <Server className="h-4 w-4" />
            Use Local Supabase
          </Button>
          
          {/* Cloud Supabase Option */}
          <img
            onClick={async () => {
              if (settings?.isTestMode) {
                await IpcClient.getInstance().fakeHandleSupabaseConnect({
                  appId,
                  fakeProjectId: "fake-project-id",
                });
              } else {
                await IpcClient.getInstance().openExternalUrl(
                  "https://supabase-oauth.dyad.sh/api/connect-supabase/login",
                );
              }
            }}
            src={isDarkMode ? connectSupabaseDark : connectSupabaseLight}
            alt="Connect to Supabase"
            className="w-full h-10 min-h-8 min-w-20 cursor-pointer"
            data-testid="connect-supabase-button"
          />
          
          <p className="text-xs text-gray-500 text-center">
            Choose local development or cloud Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
