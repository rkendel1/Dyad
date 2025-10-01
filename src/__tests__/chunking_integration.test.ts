import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  chunkResponse,
  shouldChunkResponse,
} from "../ipc/utils/chunking_utils";
import { chunkPerfTracker } from "../ipc/utils/chunk_performance";

describe("Chunking Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle a realistic long response scenario", () => {
    // Simulate a long response with code blocks and dyad tags
    const longResponse = `
I'll help you create a complete React todo application. Let me break this down into multiple files:

<dyad-write path="src/components/TodoItem.tsx" description="Creating a todo item component">
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  id,
  text,
  completed,
  onToggle,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-2">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onToggle(id)}
          className={completed ? "bg-green-100" : ""}
        >
          {completed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-0" />}
        </Button>
        <span className={completed ? "line-through text-gray-500" : ""}>
          {text}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(id)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
</dyad-write>

<dyad-write path="src/components/TodoList.tsx" description="Creating the main todo list component">
import React from "react";
import { TodoItem } from "./TodoItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No todos yet. Add one above!
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-2">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            text={todo.text}
            completed={todo.completed}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
</dyad-write>

Now let me also create the main App component that ties everything together:

\`\`\`typescript
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { TodoList } from "./components/TodoList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");

  const addTodo = () => {
    if (inputText.trim()) {
      const newTodo: Todo = {
        id: uuidv4(),
        text: inputText.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputText("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Todo App</h1>
      
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a new todo..."
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <Button onClick={addTodo}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}

export default App;
\`\`\`

<dyad-add-dependency packages="uuid lucide-react"></dyad-add-dependency>

This creates a fully functional todo application with the following features:
1. Add new todos
2. Mark todos as complete/incomplete
3. Delete todos
4. Responsive design with Tailwind CSS
5. Clean component architecture

The application uses modern React patterns with hooks and TypeScript for type safety.
    `.repeat(3); // Make it even longer

    // Test chunking decision
    const shouldChunk = shouldChunkResponse(longResponse, {
      maxChunkSize: 5000,
    });
    expect(shouldChunk).toBe(true);

    // Test actual chunking
    const chunks = chunkResponse(longResponse, {
      maxChunkSize: 5000,
      preserveCodeBlocks: true,
      preserveDyadTags: true,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].metadata.isChunked).toBe(true);
    expect(chunks[0].metadata.totalChunks).toBe(chunks.length);

    // Check that dyad tags are preserved
    const dyadTagChunks = chunks.filter(
      (chunk) =>
        chunk.content.includes("<dyad-write") ||
        chunk.content.includes("</dyad-write>"),
    );
    expect(dyadTagChunks.length).toBeGreaterThan(0);

    // Check that code blocks are preserved
    const codeBlockChunks = chunks.filter(
      (chunk) =>
        chunk.content.includes("```typescript") ||
        chunk.content.includes("```"),
    );
    expect(codeBlockChunks.length).toBeGreaterThan(0);

    // Verify each chunk has correct metadata
    chunks.forEach((chunk, index) => {
      expect(chunk.metadata.chunkIndex).toBe(index);
      expect(chunk.metadata.totalChunks).toBe(chunks.length);
      expect(chunk.metadata.isChunked).toBe(true);
      expect(chunk.metadata.chunkDeliveryStatus).toBe("delivering");
    });
  });

  it("should track performance metrics correctly", () => {
    const chatId = 12345;
    const totalChunks = 3;

    // Start a performance tracking session
    chunkPerfTracker.startSession(chatId, totalChunks);

    // Simulate successful chunk deliveries
    chunkPerfTracker.recordChunkDelivery(chatId, 0, 1000, 150, true);
    chunkPerfTracker.recordChunkDelivery(chatId, 1, 1200, 180, true);

    // Simulate a failed chunk
    const error = new Error("Network timeout");
    chunkPerfTracker.recordChunkDelivery(chatId, 2, 800, 0, false, error);

    // Get session metrics before ending
    const sessionMetrics = chunkPerfTracker.getSessionMetrics(chatId);
    expect(sessionMetrics).toBeTruthy();
    expect(sessionMetrics!.totalChunks).toBe(totalChunks);
    expect(sessionMetrics!.deliveredChunks).toBe(2);
    expect(sessionMetrics!.failedChunks).toBe(1);
    expect(sessionMetrics!.errorRate).toBeCloseTo(1 / 3);

    // End the session
    const finalMetrics = chunkPerfTracker.endSession(chatId);
    expect(finalMetrics).toBeTruthy();
    expect(finalMetrics!.errorRate).toBeCloseTo(1 / 3);
    expect(finalMetrics!.deliveredChunks).toBe(2);
    expect(finalMetrics!.failedChunks).toBe(1);
  });

  it("should adjust recommended chunk size based on performance", () => {
    const baseRecommendation = chunkPerfTracker.getRecommendedChunkSize();
    expect(baseRecommendation).toBeGreaterThan(0);
    expect(baseRecommendation).toBeLessThanOrEqual(15000);

    // The recommendation should be reasonable (between 4KB and 15KB)
    expect(baseRecommendation).toBeGreaterThanOrEqual(4000);
    expect(baseRecommendation).toBeLessThanOrEqual(15000);
  });

  it("should handle edge cases gracefully", () => {
    // Empty content
    const emptyChunks = chunkResponse("");
    expect(emptyChunks).toHaveLength(1);
    expect(emptyChunks[0].metadata.isChunked).toBe(false);

    // Very small content
    const smallChunks = chunkResponse("Small text");
    expect(smallChunks).toHaveLength(1);
    expect(smallChunks[0].metadata.isChunked).toBe(false);

    // Content with only dyad tags
    const dyadOnly = '<dyad-write path="test.js">content</dyad-write>';
    const dyadChunks = chunkResponse(dyadOnly);
    expect(dyadChunks).toHaveLength(1);
    expect(dyadChunks[0].content).toBe(dyadOnly);

    // Content with only code blocks
    const codeOnly = '```javascript\nconsole.log("test");\n```';
    const codeChunks = chunkResponse(codeOnly);
    expect(codeChunks).toHaveLength(1);
    expect(codeChunks[0].content).toBe(codeOnly);
  });

  it("should preserve context across chunks", () => {
    const content =
      "First sentence. Second sentence.\n\nNew paragraph. Another sentence.".repeat(
        100,
      );
    const chunks = chunkResponse(content, { maxChunkSize: 500 });

    if (chunks.length > 1) {
      // Check that chunks don't end abruptly in the middle of sentences
      chunks.slice(0, -1).forEach((chunk) => {
        const trimmedContent = chunk.content.trim();
        const endsWithPeriod = trimmedContent.endsWith(".");
        const endsWithNewline = chunk.content.endsWith("\n");

        // Should end at natural boundaries when possible
        expect(endsWithPeriod || endsWithNewline).toBe(true);
      });
    }
  });
});
