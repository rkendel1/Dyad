import { useState } from "react";
import { Plus, Trash2, Check, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ApiKeyWithMetadata } from "@/lib/schemas";
import { maskApiKey } from "@/lib/api-key-utils";
import { v4 as uuidv4 } from "uuid";

interface ApiKeyManagerProps {
  provider: string;
  apiKeys: ApiKeyWithMetadata[];
  onSaveKey: (key: ApiKeyWithMetadata) => Promise<void>;
  onDeleteKey: (keyId: string) => Promise<void>;
  onActivateKey: (keyId: string) => Promise<void>;
  isSaving: boolean;
}

export function ApiKeyManager({
  provider,
  apiKeys,
  onSaveKey,
  onDeleteKey,
  onActivateKey,
  isSaving,
}: ApiKeyManagerProps) {
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddKey = async () => {
    if (!newKeyValue || !newKeyName) return;

    const newKey: ApiKeyWithMetadata = {
      id: uuidv4(),
      name: newKeyName,
      secret: { value: newKeyValue },
      isActive: apiKeys.length === 0, // First key is automatically active
      createdAt: new Date().toISOString(),
    };

    await onSaveKey(newKey);
    setNewKeyName("");
    setNewKeyValue("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">API Keys</h3>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              disabled={isSaving}
            >
              <Plus size={16} className="mr-1" />
              Add Key
            </Button>
          )}
        </div>

        {apiKeys.length === 0 && !isAdding && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              No API keys configured. Add a key to get started.
            </AlertDescription>
          </Alert>
        )}

        {/* Existing keys */}
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{key.name}</span>
                  {key.isActive && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  {maskApiKey(key.secret.value)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!key.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onActivateKey(key.id)}
                    disabled={isSaving}
                  >
                    <Check size={16} />
                    Activate
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteKey(key.id)}
                  disabled={isSaving || key.isActive}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new key form */}
        {isAdding && (
          <div className="border rounded-md p-3 space-y-2">
            <Input
              placeholder="Key name (e.g., 'Personal', 'Work')"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              disabled={isSaving}
            />
            <Input
              type="password"
              placeholder="API Key"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              disabled={isSaving}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddKey}
                disabled={!newKeyName || !newKeyValue || isSaving}
                size="sm"
              >
                Save Key
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewKeyName("");
                  setNewKeyValue("");
                }}
                disabled={isSaving}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
