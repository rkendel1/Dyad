"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";
import type { Template } from "@/lib/api-client";

interface TemplateCardProps {
  template: Template;
  onSelect?: (templateId: string) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      {/* Template Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950">
        <img
          src={template.imageUrl}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {template.isExperimental && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Experimental
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{template.title}</span>
          {template.githubUrl && (
            <a
              href={template.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {template.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {template.isOfficial && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                Official
              </span>
            )}
            {template.requiresNeon && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                Neon DB
              </span>
            )}
          </div>

          {onSelect && (
            <Button
              size="sm"
              onClick={() => onSelect(template.id)}
              variant="default"
            >
              Use Template
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
