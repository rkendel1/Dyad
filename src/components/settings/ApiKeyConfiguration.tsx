import { Info, KeyRound, Trash2, Key } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AzureConfiguration } from "./AzureConfiguration";
import { VertexConfiguration } from "./VertexConfiguration";
import { UserSettings, ApiKeyWithMetadata } from "@/lib/schemas";
import { getActiveApiKey, getAllApiKeys, maskApiKey } from "@/lib/api-key-utils";
import { ApiKeyManager } from "./ApiKeyManager";

interface ApiKeyConfigurationProps {
  provider: string;
  providerDisplayName: string;
  settings: UserSettings | null | undefined;
  envVars: Record<string, string | undefined>;
  envVarName?: string;
  isSaving: boolean;
  saveError: string | null;
  _apiKeyInput: string; // Legacy - no longer used with multi-key management
  _onApiKeyInputChange: (value: string) => void; // Legacy - no longer used
  _onSaveKey: () => Promise<void>; // Legacy - no longer used
  onDeleteKey: () => Promise<void>;
  onSaveMultiKey: (key: ApiKeyWithMetadata) => Promise<void>;
  onDeleteMultiKey: (keyId: string) => Promise<void>;
  onActivateMultiKey: (keyId: string) => Promise<void>;
  isDyad: boolean;
}

export function ApiKeyConfiguration({
  provider,
  providerDisplayName,
  settings,
  envVars,
  envVarName,
  isSaving,
  saveError: _saveError, // Legacy - no longer used
  _apiKeyInput,
  _onApiKeyInputChange,
  _onSaveKey,
  onDeleteKey,
  onSaveMultiKey,
  onDeleteMultiKey,
  onActivateMultiKey,
  isDyad,
}: ApiKeyConfigurationProps) {
  // Special handling for Azure OpenAI which requires environment variables
  if (provider === "azure") {
    return <AzureConfiguration envVars={envVars} />;
  }
  // Special handling for Google Vertex AI which uses service account credentials
  if (provider === "vertex") {
    return <VertexConfiguration />;
  }

  const activeKeyInfo = getActiveApiKey(provider, settings, envVars, envVarName);
  const allApiKeys = getAllApiKeys(provider, settings);
  const envApiKey = envVarName ? envVars[envVarName] : undefined;
  const userApiKey = settings?.providerSettings?.[provider]?.apiKey?.value;

  const isValidUserKey =
    !!userApiKey &&
    !userApiKey.startsWith("Invalid Key") &&
    userApiKey !== "Not Set";
  const hasEnvKey = !!envApiKey;

  const defaultAccordionValue = [];
  if (allApiKeys.length > 0 || isValidUserKey || !hasEnvKey) {
    defaultAccordionValue.push("settings-key");
  }
  if (!isDyad && hasEnvKey) {
    defaultAccordionValue.push("env-key");
  }

  return (
    <div className="space-y-4">
      {/* Active Key Display */}
      {activeKeyInfo && (
        <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
          <Key className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Active API Key
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            {activeKeyInfo.source === "multi-key" && (
              <div>
                <p className="font-medium">{activeKeyInfo.keyName}</p>
                <p className="font-mono text-sm">{maskApiKey(activeKeyInfo.value)}</p>
                <p className="text-xs mt-1">Source: Managed Keys</p>
              </div>
            )}
            {activeKeyInfo.source === "settings" && (
              <div>
                <p className="font-mono text-sm">{maskApiKey(activeKeyInfo.value)}</p>
                <p className="text-xs mt-1">Source: Legacy Settings Key</p>
              </div>
            )}
            {activeKeyInfo.source === "env" && (
              <div>
                <p className="font-mono text-sm">{maskApiKey(activeKeyInfo.value)}</p>
                <p className="text-xs mt-1">Source: Environment Variable ({envVarName})</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Accordion
        type="multiple"
        className="w-full space-y-4"
        defaultValue={defaultAccordionValue}
      >
        <AccordionItem
          value="settings-key"
          className="border rounded-lg px-4 bg-(--background-lightest)"
        >
          <AccordionTrigger className="text-lg font-medium hover:no-underline cursor-pointer">
            Manage API Keys
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            {/* Multi-key manager */}
            <ApiKeyManager
              provider={provider}
              apiKeys={allApiKeys}
              onSaveKey={onSaveMultiKey}
              onDeleteKey={onDeleteMultiKey}
              onActivateKey={onActivateMultiKey}
              isSaving={isSaving}
            />

            {/* Legacy single key section */}
            {isValidUserKey && (
              <div className="pt-4 border-t">
                <Alert variant="default" className="mb-4">
                  <KeyRound className="h-4 w-4" />
                  <AlertTitle className="flex justify-between items-center">
                    <span>Legacy Key (Settings)</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onDeleteKey}
                      disabled={isSaving}
                      className="flex items-center gap-1 h-7 px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isSaving ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertTitle>
                  <AlertDescription>
                    <p className="font-mono text-sm">{userApiKey}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      This is a legacy key. Consider migrating to managed keys above.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {!isDyad && envVarName && (
          <AccordionItem
            value="env-key"
            className="border rounded-lg px-4 bg-(--background-lightest)"
          >
            <AccordionTrigger className="text-lg font-medium hover:no-underline cursor-pointer">
              API Key from Environment Variable
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {hasEnvKey ? (
                <Alert variant="default">
                  <KeyRound className="h-4 w-4" />
                  <AlertTitle>Environment Variable Key ({envVarName})</AlertTitle>
                  <AlertDescription>
                    <p className="font-mono text-sm">
                      {maskApiKey(envApiKey)}
                    </p>
                    {activeKeyInfo?.source === "env" && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        This key is currently active (no managed or settings keys set).
                      </p>
                    )}
                    {activeKeyInfo?.source !== "env" && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        This key is available but not active (overridden by managed/settings key).
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Environment Variable Not Set</AlertTitle>
                  <AlertDescription>
                    The{" "}
                    <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                      {envVarName}
                    </code>{" "}
                    environment variable is not set.
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                This key is set outside the application. If present, it will be
                used only if no managed or settings keys are configured.
                Requires app restart to detect changes.
              </p>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
