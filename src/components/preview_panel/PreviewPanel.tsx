import { useAtom, useAtomValue } from "jotai";
import {
  appOutputAtom,
  previewModeAtom,
  previewPanelKeyAtom,
  selectedAppIdAtom,
} from "../../atoms/appAtoms";

import { CodeView } from "./CodeView";
import { PreviewIframe } from "./PreviewIframe";
import { Problems } from "./Problems";
import { ConfigurePanel } from "./ConfigurePanel";
import { ChevronDown, ChevronUp, Logs, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Console } from "./Console";
import { CliPopout } from "./CliPopout";
import { useRunApp } from "@/hooks/useRunApp";
import { PublishPanel } from "./PublishPanel";
import { Button } from "@/components/ui/button";

interface ConsoleHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  latestMessage?: string;
  messageCount: number;
  errorCount: number;
  onOpenCliPopout: () => void;
}

// Console header component
const ConsoleHeader = ({
  isOpen,
  onToggle,
  latestMessage,
  messageCount,
  errorCount,
  onOpenCliPopout,
}: ConsoleHeaderProps) => (
  <div className="flex items-start gap-2 px-4 py-1.5 border-t border-border hover:bg-[var(--background-darkest)] transition-colors">
    <div
      className="flex items-start gap-2 flex-1 cursor-pointer"
      onClick={onToggle}
    >
      <Logs size={16} className="mt-0.5" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">System Messages</span>
          {messageCount > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              {messageCount}
            </span>
          )}
          {errorCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
              {errorCount} errors
            </span>
          )}
        </div>
        {!isOpen && latestMessage && (
          <span className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-[400px]">
            {latestMessage}
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onOpenCliPopout();
        }}
        title="Open CLI in popout window"
        className="h-7 px-2"
      >
        <ExternalLink size={14} />
      </Button>
      <div className="cursor-pointer" onClick={onToggle}>
        {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </div>
    </div>
  </div>
);

// Main PreviewPanel component
export function PreviewPanel() {
  const [previewMode] = useAtom(previewModeAtom);
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isCliPopoutOpen, setIsCliPopoutOpen] = useState(false);
  const [isCliPopoutMinimized, setIsCliPopoutMinimized] = useState(false);
  const { runApp, stopApp, loading, app } = useRunApp();
  const runningAppIdRef = useRef<number | null>(null);
  const key = useAtomValue(previewPanelKeyAtom);
  const appOutput = useAtomValue(appOutputAtom);

  const messageCount = appOutput.length;
  const errorCount = appOutput.filter(
    (output) =>
      output.type === "stderr" ||
      output.type === "client-error" ||
      // Enhanced error detection patterns
      /error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION/i.test(
        output.message,
      ),
  ).length;
  const latestMessage =
    messageCount > 0 ? appOutput[messageCount - 1]?.message : undefined;

  useEffect(() => {
    const previousAppId = runningAppIdRef.current;

    // Check if the selected app ID has changed
    if (selectedAppId !== previousAppId) {
      // Stop the previously running app, if any
      if (previousAppId !== null) {
        console.debug("Stopping previous app", previousAppId);
        stopApp(previousAppId);
        // We don't necessarily nullify the ref here immediately,
        // let the start of the next app update it or unmount handle it.
      }

      // Start the new app if an ID is selected
      if (selectedAppId !== null) {
        console.debug("Starting new app", selectedAppId);
        runApp(selectedAppId); // Consider adding error handling for the promise if needed
        runningAppIdRef.current = selectedAppId; // Update ref to the new running app ID
      } else {
        // If selectedAppId is null, ensure no app is marked as running
        runningAppIdRef.current = null;
      }
    }

    // Cleanup function: This runs when the component unmounts OR before the effect runs again.
    // We only want to stop the app on actual unmount. The logic above handles stopping
    // when the appId changes. So, we capture the running appId at the time the effect renders.
    const appToStopOnUnmount = runningAppIdRef.current;
    return () => {
      if (appToStopOnUnmount !== null) {
        const currentRunningApp = runningAppIdRef.current;
        if (currentRunningApp !== null) {
          console.debug(
            "Component unmounting or selectedAppId changing, stopping app",
            currentRunningApp,
          );
          stopApp(currentRunningApp);
          runningAppIdRef.current = null; // Clear ref on stop
        }
      }
    };
    // Dependencies: run effect when selectedAppId changes.
    // runApp/stopApp are stable due to useCallback.
  }, [selectedAppId, runApp, stopApp]);
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="vertical">
            <Panel id="content" minSize={30}>
              <div className="h-full overflow-y-auto">
                {previewMode === "preview" ? (
                  <PreviewIframe key={key} loading={loading} />
                ) : previewMode === "code" ? (
                  <CodeView loading={loading} app={app} />
                ) : previewMode === "configure" ? (
                  <ConfigurePanel />
                ) : previewMode === "publish" ? (
                  <PublishPanel />
                ) : (
                  <Problems />
                )}
              </div>
            </Panel>
            {isConsoleOpen && (
              <>
                <PanelResizeHandle className="h-1 bg-border hover:bg-gray-400 transition-colors cursor-row-resize" />
                <Panel id="console" minSize={10} defaultSize={30}>
                  <div className="flex flex-col h-full">
                    <ConsoleHeader
                      isOpen={true}
                      onToggle={() => setIsConsoleOpen(false)}
                      latestMessage={latestMessage}
                      messageCount={messageCount}
                      errorCount={errorCount}
                      onOpenCliPopout={() => setIsCliPopoutOpen(true)}
                    />
                    <Console />
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
        {!isConsoleOpen && (
          <ConsoleHeader
            isOpen={false}
            onToggle={() => setIsConsoleOpen(true)}
            latestMessage={latestMessage}
            messageCount={messageCount}
            errorCount={errorCount}
            onOpenCliPopout={() => setIsCliPopoutOpen(true)}
          />
        )}
      </div>

      {/* CLI Popout */}
      {isCliPopoutOpen && (
        <CliPopout
          onClose={() => setIsCliPopoutOpen(false)}
          isMinimized={isCliPopoutMinimized}
          onToggleMinimize={() =>
            setIsCliPopoutMinimized(!isCliPopoutMinimized)
          }
        />
      )}
    </>
  );
}
