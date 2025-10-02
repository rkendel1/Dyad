"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dyadClient, type App } from "@/lib/dyad-client";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export function AppsPage() {
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const {
    data: apps,
    isLoading,
    error,
  } = useQuery<App[], Error>({
    queryKey: ["dyadApps"],
    queryFn: () => dyadClient.apps.listApps(),
    retry: 3,
    retryDelay: 1000,
  });

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await dyadClient.checkHealth();
        setConnectionStatus("connected");
      } catch {
        setConnectionStatus("disconnected");
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                🚀 Dyad Web Interface
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your AI applications from the browser
              </p>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    Connected to Dyad Desktop
                  </span>
                </>
              )}
              {connectionStatus === "connecting" && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-400">
                    Connecting...
                  </span>
                </>
              )}
              {connectionStatus === "disconnected" && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    Disconnected - Is Dyad Desktop running?
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Your Applications</h2>
          <p className="text-muted-foreground">
            View and manage your Dyad applications
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        )}

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{error.message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure Dyad Desktop is running at{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  http://localhost:3000
                </code>
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && apps && apps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <Card
                key={app.id}
                className="hover:shadow-lg transition-shadow bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-1">{app.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {app.path}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created:{" "}
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/app/${app.id}`}>Open App</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !error && apps && apps.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-2">
                  No Applications Yet
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Create your first application in Dyad Desktop to get started
                  building amazing AI-powered apps.
                </p>
                <p className="text-sm text-muted-foreground">
                  Once you create an app in the desktop application, it will
                  appear here and you can interact with it through the browser.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Dyad - Free, local, open-source AI app builder •{" "}
            <a
              href="https://dyad.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              dyad.sh
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}