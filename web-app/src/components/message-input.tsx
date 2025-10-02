"use client";

import React from "react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  isLoading: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  disabled,
  isLoading,
}: MessageInputProps) {
  return (
    <CardFooter className="border-t pt-4 bg-card">
      <form onSubmit={onSubmit} className="flex gap-2 w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          disabled={disabled}
        />
        <Button type="submit" disabled={!value.trim() || isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </CardFooter>
  );
}
