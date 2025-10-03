"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { dyadApiClient, type Template } from "@/lib/api-client";
import { TemplateCard } from "@/components/template-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export function TemplatesPage() {
  const router = useRouter();

  const {
    data: templates,
    isLoading,
    error,
  } = useQuery<Template[], Error>({
    queryKey: ["templates"],
    queryFn: () => dyadApiClient.getTemplates(),
  });

  const handleSelectTemplate = (templateId: string) => {
    // For now, just log the selection
    // In the future, this would trigger an app creation workflow
    console.log("Selected template:", templateId);
    // TODO: Implement app creation workflow
    alert(`Selected template: ${templateId}\n\nApp creation workflow coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Apps
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  App Templates
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a template to start your new project
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-destructive">
              Error loading templates: {error.message}
            </p>
            <Button onClick={() => router.push("/")}>Go Back</Button>
          </div>
        )}

        {templates && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <p>No templates available</p>
            <Button onClick={() => router.push("/")}>Go Back</Button>
          </div>
        )}

        {templates && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelectTemplate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
