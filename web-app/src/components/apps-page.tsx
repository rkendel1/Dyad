"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { StatusBadge } from "@/components/ui/status-badge";
import {
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export function AppsPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                🚀 Dyad Web Interface
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your AI applications from the browser
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/templates")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
              <div className="flex items-center gap-2">
              {connectionStatus === "connected" && (
                <StatusBadge variant="success">
                  Connected to Dyad Desktop
                </StatusBadge>
              )}
              {connectionStatus === "connecting" && (
                <StatusBadge variant="loading">Connecting...</StatusBadge>
              )}
              {connectionStatus === "disconnected" && (
                <StatusBadge variant="error">
                  Disconnected - Is Dyad Desktop running?
                </StatusBadge>
              )}
              </div>
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
              <p className="text-sm mb-4">{error.message}</p>
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
                className="hover:shadow-lg transition-all hover:border-primary/50 bg-card border-border"
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
          <Card className="bg-card border-border">
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
      <footer className="mt-16 py-8 border-t bg-card backdrop-blur-sm">
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