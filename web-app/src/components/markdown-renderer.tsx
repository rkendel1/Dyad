import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parsing - handles basic formatting
  const parseMarkdown = (text: string) => {
    if (!text) return [];

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentCodeBlock: string[] = [];
    let inCodeBlock = false;
    let currentListItems: string[] = [];
    let inList = false;

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre
              key={`code-${index}`}
              className="bg-muted p-3 rounded-md overflow-x-auto my-2 text-sm"
            >
              <code>{currentCodeBlock.join("\n")}</code>
            </pre>
          );
          currentCodeBlock = [];
          inCodeBlock = false;
        } else {
          // Start code block
          if (currentListItems.length > 0) {
            elements.push(
              <ul key={`list-${index}`} className="list-disc list-inside my-2 space-y-1">
                {currentListItems.map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
                ))}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        currentCodeBlock.push(line);
        return;
      }

      // Lists
      if (line.trim().match(/^[-*+]\s+/)) {
        const content = line.trim().replace(/^[-*+]\s+/, "");
        currentListItems.push(content);
        inList = true;
        return;
      } else if (inList && currentListItems.length > 0) {
        // End of list
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside my-2 space-y-1">
            {currentListItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ul>
        );
        currentListItems = [];
        inList = false;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const HeaderTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        const className = level === 1 
          ? "text-2xl font-bold my-3"
          : level === 2
          ? "text-xl font-bold my-2"
          : "text-lg font-semibold my-2";
        
        elements.push(
          <HeaderTag key={index} className={className}>
            {headerMatch[2]}
          </HeaderTag>
        );
        return;
      }

      // Inline code
      if (line.trim().startsWith("`") && line.trim().endsWith("`") && line.trim().length > 2) {
        elements.push(
          <code
            key={index}
            className="bg-muted px-1.5 py-0.5 rounded text-sm my-1 block"
          >
            {line.trim().slice(1, -1)}
          </code>
        );
        return;
      }

      // Empty lines
      if (line.trim() === "") {
        elements.push(<br key={index} />);
        return;
      }

      // Regular paragraphs with inline formatting
      elements.push(
        <p key={index} className="my-1" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />
      );
    });

    // Close any remaining list
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-end`} className="list-disc list-inside my-2 space-y-1">
          {currentListItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
          ))}
        </ul>
      );
    }

    return elements;
  };

  const parseInline = (text: string): string => {
    let result = text;
    
    // Bold (** or __)
    result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");
    
    // Italic (* or _)
    result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
    result = result.replace(/_(.+?)_/g, "<em>$1</em>");
    
    // Inline code
    result = result.replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');
    
    // Links
    result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    return result;
  };

  return (
    <div className="markdown-content text-sm">
      {parseMarkdown(content)}
    </div>
  );
}
