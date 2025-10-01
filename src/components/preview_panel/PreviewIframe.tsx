import {
  selectedAppIdAtom,
  appUrlAtom,
  appOutputAtom,
  previewErrorMessageAtom,
  cliInputTextAtom,
} from "@/atoms/appAtoms";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Loader2,
  X,
  Sparkles,
  ChevronDown,
  Lightbulb,
  ChevronRight,
  MousePointerClick,
  Power,
  Code,
  Copy,
  MessageSquare,
  Square,
  Edit3,
  Check,
  Terminal,
} from "lucide-react";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";
import { IpcClient } from "@/ipc/ipc_client";

import { useParseRouter } from "@/hooks/useParseRouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStreamChat } from "@/hooks/useStreamChat";
import { selectedComponentPreviewAtom } from "@/atoms/previewAtoms";
import { ComponentSelection } from "@/ipc/ipc_types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRunApp } from "@/hooks/useRunApp";
import { useShortcut } from "@/hooks/useShortcut";
import { showSuccess, showError } from "@/lib/toast";

interface ErrorBannerProps {
  error: string | undefined;
  onDismiss: () => void;
  onAIFix: () => void;
}

const ErrorBanner = ({ error, onDismiss, onAIFix }: ErrorBannerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { isStreaming } = useStreamChat();
  if (!error) return null;
  const isDockerError = error.includes("Cannot connect to the Docker");

  const getTruncatedError = () => {
    const firstLine = error.split("\n")[0];
    const snippetLength = 250;
    const snippet = error.substring(0, snippetLength);
    return firstLine.length < snippet.length
      ? firstLine
      : snippet + (snippet.length === snippetLength ? "..." : "");
  };

  return (
    <div
      className="absolute top-2 left-2 right-2 z-10 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md shadow-sm p-2"
      data-testid="preview-error-banner"
    >
      {/* Close button in top left */}
      <button
        onClick={onDismiss}
        className="absolute top-1 left-1 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
      >
        <X size={14} className="text-red-500 dark:text-red-400" />
      </button>

      {/* Error message in the middle */}
      <div className="px-6 py-1 text-sm">
        <div
          className="text-red-700 dark:text-red-300 text-wrap font-mono whitespace-pre-wrap break-words text-xs cursor-pointer flex gap-1 items-start"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronRight
            size={14}
            className={`mt-0.5 transform transition-transform ${
              isCollapsed ? "" : "rotate-90"
            }`}
          />
          {isCollapsed ? getTruncatedError() : error}
        </div>
      </div>

      {/* Tip message */}
      <div className="mt-2 px-6">
        <div className="relative p-2 bg-red-100 dark:bg-red-900 rounded-sm flex gap-1 items-center">
          <div>
            <Lightbulb size={16} className=" text-red-800 dark:text-red-300" />
          </div>
          <span className="text-sm text-red-700 dark:text-red-200">
            <span className="font-medium">Tip: </span>
            {isDockerError
              ? "Make sure Docker Desktop is running and try restarting the app."
              : "Check if restarting the app fixes the error."}
          </span>
        </div>
      </div>

      {/* AI Fix button at the bottom */}
      {!isDockerError && (
        <div className="mt-2 flex justify-end">
          <button
            disabled={isStreaming}
            onClick={onAIFix}
            className="cursor-pointer flex items-center space-x-1 px-2 py-0.5 bg-red-500 dark:bg-red-600 text-white rounded text-sm hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={14} />
            <span>Fix error with AI</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Preview iframe component
export const PreviewIframe = ({ loading }: { loading: boolean }) => {
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const { appUrl, originalUrl } = useAtomValue(appUrlAtom);
  const setAppOutput = useSetAtom(appOutputAtom);
  // State to trigger iframe reload
  const [reloadKey, setReloadKey] = useState(0);
  const [errorMessage, setErrorMessage] = useAtom(previewErrorMessageAtom);
  const selectedChatId = useAtomValue(selectedChatIdAtom);
  const { streamMessage } = useStreamChat();
  const { routes: availableRoutes } = useParseRouter(selectedAppId);
  const { restartApp } = useRunApp();
  const setCliInputText = useSetAtom(cliInputTextAtom);

  // Navigation state
  const [isComponentSelectorInitialized, setIsComponentSelectorInitialized] =
    useState(false);
  const [isCssSelectorInitialized, setIsCssSelectorInitialized] =
    useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentHistoryPosition, setCurrentHistoryPosition] = useState(0);
  const [selectedComponentPreview, setSelectedComponentPreview] = useAtom(
    selectedComponentPreviewAtom,
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isPickingCssSelector, setIsPickingCssSelector] = useState(false);
  const [capturedCssSelector, setCapturedCssSelector] = useState<string | null>(
    null,
  );

  // URL editing state
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState("");

  //detect if the user is using Mac
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // Deactivate component selector when selection is cleared
  useEffect(() => {
    if (!selectedComponentPreview) {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "deactivate-dyad-component-selector" },
          "*",
        );
      }
      setIsPicking(false);
    }
  }, [selectedComponentPreview]);

  // Deactivate CSS selector when it's not being used
  useEffect(() => {
    if (!isPickingCssSelector && !capturedCssSelector) {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "deactivate-dyad-css-selector" },
          "*",
        );
      }
    }
  }, [isPickingCssSelector, capturedCssSelector]);

  // Add message listener for iframe errors and navigation events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only handle messages from our iframe
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      if (event.data?.type === "dyad-component-selector-initialized") {
        setIsComponentSelectorInitialized(true);
        return;
      }

      if (event.data?.type === "dyad-css-selector-initialized") {
        setIsCssSelectorInitialized(true);
        return;
      }

      if (event.data?.type === "dyad-component-selected") {
        console.log("Component picked:", event.data);
        setSelectedComponentPreview(parseComponentSelection(event.data));
        setIsPicking(false);
        return;
      }

      if (event.data?.type === "dyad-css-selector-selected") {
        console.log("CSS selector captured:", event.data);
        setCapturedCssSelector(event.data.selector);
        setIsPickingCssSelector(false);
        return;
      }

      if (event.data?.type === "dyad-css-selector-cancelled") {
        console.log("CSS selector cancelled");
        setIsPickingCssSelector(false);
        setCapturedCssSelector(null);
        return;
      }

      const { type, payload } = event.data as {
        type:
          | "window-error"
          | "unhandled-rejection"
          | "iframe-sourcemapped-error"
          | "build-error-report"
          | "pushState"
          | "replaceState";
        payload?: {
          message?: string;
          stack?: string;
          reason?: string;
          newUrl?: string;
          file?: string;
          frame?: string;
        };
      };

      if (
        type === "window-error" ||
        type === "unhandled-rejection" ||
        type === "iframe-sourcemapped-error"
      ) {
        const stack =
          type === "iframe-sourcemapped-error"
            ? payload?.stack?.split("\n").slice(0, 1).join("\n")
            : payload?.stack;
        const errorMessage = `Error ${
          payload?.message || payload?.reason
        }\nStack trace: ${stack}`;
        console.error("Iframe error:", errorMessage);
        setErrorMessage(errorMessage);
        setAppOutput((prev) => [
          ...prev,
          {
            message: `Iframe error: ${errorMessage}`,
            type: "client-error",
            appId: selectedAppId!,
            timestamp: Date.now(),
          },
        ]);
      } else if (type === "build-error-report") {
        console.debug(`Build error report: ${payload}`);
        const errorMessage = `${payload?.message} from file ${payload?.file}.\n\nSource code:\n${payload?.frame}`;
        setErrorMessage(errorMessage);
        setAppOutput((prev) => [
          ...prev,
          {
            message: `Build error report: ${JSON.stringify(payload)}`,
            type: "client-error",
            appId: selectedAppId!,
            timestamp: Date.now(),
          },
        ]);
      } else if (type === "pushState" || type === "replaceState") {
        console.debug(`Navigation event: ${type}`, payload);

        // Update navigation history based on the type of state change
        if (type === "pushState" && payload?.newUrl) {
          // For pushState, we trim any forward history and add the new URL
          const newHistory = [
            ...navigationHistory.slice(0, currentHistoryPosition + 1),
            payload.newUrl,
          ];
          setNavigationHistory(newHistory);
          setCurrentHistoryPosition(newHistory.length - 1);
        } else if (type === "replaceState" && payload?.newUrl) {
          // For replaceState, we replace the current URL
          const newHistory = [...navigationHistory];
          newHistory[currentHistoryPosition] = payload.newUrl;
          setNavigationHistory(newHistory);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    navigationHistory,
    currentHistoryPosition,
    selectedAppId,
    errorMessage,
    setErrorMessage,
    setIsComponentSelectorInitialized,
    setSelectedComponentPreview,
  ]);

  useEffect(() => {
    // Update navigation buttons state
    setCanGoBack(currentHistoryPosition > 0);
    setCanGoForward(currentHistoryPosition < navigationHistory.length - 1);
  }, [navigationHistory, currentHistoryPosition]);

  // Initialize navigation history when iframe loads
  useEffect(() => {
    if (appUrl) {
      setNavigationHistory([appUrl]);
      setCurrentHistoryPosition(0);
      setCanGoBack(false);
      setCanGoForward(false);
    }
  }, [appUrl]);

  // Function to activate component selector in the iframe
  const handleActivateComponentSelector = () => {
    if (iframeRef.current?.contentWindow) {
      const newIsPicking = !isPicking;
      setIsPicking(newIsPicking);
      // Deactivate CSS selector if it's active
      if (isPickingCssSelector) {
        setIsPickingCssSelector(false);
        iframeRef.current.contentWindow.postMessage(
          { type: "deactivate-dyad-css-selector" },
          "*",
        );
      }
      iframeRef.current.contentWindow.postMessage(
        {
          type: newIsPicking
            ? "activate-dyad-component-selector"
            : "deactivate-dyad-component-selector",
        },
        "*",
      );
    }
  };

  // Function to activate CSS selector in the iframe
  const handleActivateCssSelector = () => {
    if (iframeRef.current?.contentWindow) {
      const newIsPickingCss = !isPickingCssSelector;
      setIsPickingCssSelector(newIsPickingCss);
      setCapturedCssSelector(null);
      // Deactivate component selector if it's active
      if (isPicking) {
        setIsPicking(false);
        iframeRef.current.contentWindow.postMessage(
          { type: "deactivate-dyad-component-selector" },
          "*",
        );
      }
      iframeRef.current.contentWindow.postMessage(
        {
          type: newIsPickingCss
            ? "activate-dyad-css-selector"
            : "deactivate-dyad-css-selector",
        },
        "*",
      );
    }
  };

  // Function to copy CSS selector to clipboard
  const copyCssSelectorToClipboard = async () => {
    if (capturedCssSelector) {
      try {
        await navigator.clipboard.writeText(capturedCssSelector);
        console.log("CSS selector copied to clipboard:", capturedCssSelector);
        showSuccess("CSS selector copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy CSS selector to clipboard:", err);
        showError("Failed to copy CSS selector to clipboard");
      }
    }
  };

  // Function to insert CSS selector into chat
  const insertCssSelectorToChat = () => {
    if (capturedCssSelector && selectedChatId) {
      streamMessage({
        prompt: `Use this CSS selector: \`${capturedCssSelector}\``,
        chatId: selectedChatId,
      });
      setCapturedCssSelector(null);
      showSuccess("CSS selector inserted into chat!");
    }
  };

  // Function to send CSS selector to terminal
  const sendCssSelectorToTerminal = () => {
    if (capturedCssSelector) {
      setCliInputText(capturedCssSelector);
      showSuccess("CSS selector sent to terminal!");
    }
  };

  // Activate component selector using a shortcut
  useShortcut(
    "c",
    { shift: true, ctrl: !isMac, meta: isMac },
    handleActivateComponentSelector,
    isComponentSelectorInitialized,
    iframeRef,
  );

  // Activate CSS selector using a shortcut
  useShortcut(
    "s",
    { shift: true, ctrl: !isMac, meta: isMac },
    handleActivateCssSelector,
    isCssSelectorInitialized,
    iframeRef,
  );

  // Open external preview using a shortcut
  const handleOpenExternalPreview = () => {
    if (originalUrl) {
      IpcClient.getInstance().openExternalPreview(originalUrl);
    }
  };

  useShortcut(
    "e",
    { shift: true, ctrl: !isMac, meta: isMac },
    handleOpenExternalPreview,
    isComponentSelectorInitialized, // Use component selector initialization as a proxy for app readiness
    iframeRef,
  );

  // Function to navigate back
  const handleNavigateBack = () => {
    if (canGoBack && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "navigate",
          payload: { direction: "backward" },
        },
        "*",
      );

      // Update our local state
      setCurrentHistoryPosition((prev) => prev - 1);
      setCanGoBack(currentHistoryPosition - 1 > 0);
      setCanGoForward(true);
    }
  };

  // Function to navigate forward
  const handleNavigateForward = () => {
    if (canGoForward && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "navigate",
          payload: { direction: "forward" },
        },
        "*",
      );

      // Update our local state
      setCurrentHistoryPosition((prev) => prev + 1);
      setCanGoBack(true);
      setCanGoForward(
        currentHistoryPosition + 1 < navigationHistory.length - 1,
      );
    }
  };

  // Function to handle reload
  const handleReload = () => {
    setReloadKey((prevKey) => prevKey + 1);
    setErrorMessage(undefined);
    // Optionally, add logic here if you need to explicitly stop/start the app again
    // For now, just changing the key should remount the iframe
    console.debug("Reloading iframe preview for app", selectedAppId);
  };

  // Function to navigate to a specific route
  const navigateToRoute = (path: string) => {
    if (iframeRef.current?.contentWindow && appUrl) {
      // Create the full URL by combining the base URL with the path
      const baseUrl = new URL(appUrl).origin;
      const newUrl = `${baseUrl}${path}`;

      // Navigate to the URL
      iframeRef.current.contentWindow.location.href = newUrl;

      // iframeRef.current.src = newUrl;

      // Update navigation history
      const newHistory = [
        ...navigationHistory.slice(0, currentHistoryPosition + 1),
        newUrl,
      ];
      setNavigationHistory(newHistory);
      setCurrentHistoryPosition(newHistory.length - 1);
      setCanGoBack(true);
      setCanGoForward(false);
    }
  };

  // Function to start URL editing
  const handleStartUrlEdit = () => {
    const currentUrl =
      navigationHistory[currentHistoryPosition] || appUrl || "";
    setEditedUrl(currentUrl);
    setIsEditingUrl(true);
  };

  // Function to cancel URL editing
  const handleCancelUrlEdit = () => {
    setIsEditingUrl(false);
    setEditedUrl("");
  };

  // Function to navigate to edited URL
  const handleNavigateToUrl = () => {
    if (!editedUrl.trim()) {
      setIsEditingUrl(false);
      return;
    }

    let urlToNavigate = editedUrl.trim();

    // Basic URL validation and normalization
    try {
      // If it doesn't start with http(s), try to determine if it's a relative path or needs a protocol
      if (
        !urlToNavigate.startsWith("http://") &&
        !urlToNavigate.startsWith("https://")
      ) {
        if (urlToNavigate.startsWith("/")) {
          // It's a relative path - combine with current origin
          if (appUrl) {
            const baseUrl = new URL(appUrl).origin;
            urlToNavigate = `${baseUrl}${urlToNavigate}`;
          } else {
            // Can't navigate to relative path without a base URL
            throw new Error(
              "Cannot navigate to relative path without a base URL",
            );
          }
        } else if (
          urlToNavigate.includes(".") &&
          !urlToNavigate.includes(" ")
        ) {
          // Looks like a domain - add https://
          urlToNavigate = `https://${urlToNavigate}`;
        } else if (/^\d+$/.test(urlToNavigate)) {
          // If it's just a number, treat it as a port on localhost
          urlToNavigate = `http://localhost:${urlToNavigate}`;
        } else {
          // Treat as a path relative to current origin
          if (appUrl) {
            const baseUrl = new URL(appUrl).origin;
            urlToNavigate = `${baseUrl}/${urlToNavigate}`;
          } else {
            throw new Error("Invalid URL format");
          }
        }
      }

      // Validate the URL
      new URL(urlToNavigate);

      // Navigate to the URL
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.location.href = urlToNavigate;

        // Update navigation history
        const newHistory = [
          ...navigationHistory.slice(0, currentHistoryPosition + 1),
          urlToNavigate,
        ];
        setNavigationHistory(newHistory);
        setCurrentHistoryPosition(newHistory.length - 1);
        setCanGoBack(true);
        setCanGoForward(false);
      }

      setIsEditingUrl(false);
      setEditedUrl("");
    } catch (error) {
      // Show error message for invalid URL with helpful suggestions
      let errorMsg = `Invalid URL: ${urlToNavigate}`;
      if (error instanceof Error) {
        errorMsg += `. ${error.message}`;
      }

      // Add helpful suggestions for common URL formats
      if (!urlToNavigate.includes(":") && !urlToNavigate.startsWith("/")) {
        errorMsg +=
          ' Try entering just a port number (e.g., "3000") or a full URL (e.g., "http://localhost:3000").';
      }

      setErrorMessage(errorMsg);
    }
  };

  // Function to handle URL input key press
  const handleUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNavigateToUrl();
    } else if (e.key === "Escape") {
      handleCancelUrlEdit();
    }
  };

  // Display loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-gray-950">
          <div className="relative w-5 h-5 animate-spin">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary rounded-full opacity-80"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full opacity-60"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Preparing app preview...
          </p>
        </div>
      </div>
    );
  }

  // Display message if no app is selected
  if (selectedAppId === null) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400">
        Select an app to see the preview.
      </div>
    );
  }

  const onRestart = () => {
    restartApp();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Browser-style header */}
      <div className="flex items-center p-2 border-b space-x-2 ">
        {/* Navigation Buttons */}
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleActivateComponentSelector}
                  className={`p-1 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPicking
                      ? "bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
                      : " text-purple-700 hover:bg-purple-200  dark:text-purple-300 dark:hover:bg-purple-900"
                  }`}
                  disabled={
                    loading || !selectedAppId || !isComponentSelectorInitialized
                  }
                  data-testid="preview-pick-element-button"
                >
                  <MousePointerClick size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isPicking
                    ? "Deactivate component selector"
                    : "Select component"}
                </p>
                <p>{isMac ? "⌘ + ⇧ + C" : "Ctrl + ⇧ + C"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleActivateCssSelector}
                  className={`p-1 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPickingCssSelector
                      ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                      : " text-green-700 hover:bg-green-200  dark:text-green-300 dark:hover:bg-green-900"
                  }`}
                  disabled={
                    loading || !selectedAppId || !isCssSelectorInitialized
                  }
                  data-testid="preview-css-selector-button"
                >
                  <Code size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isPickingCssSelector
                    ? "Deactivate CSS selector"
                    : "Select CSS selector"}
                </p>
                <p>{isMac ? "⌘ + ⇧ + S" : "Ctrl + ⇧ + S"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300"
            disabled={!canGoBack || loading || !selectedAppId}
            onClick={handleNavigateBack}
            data-testid="preview-navigate-back-button"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300"
            disabled={!canGoForward || loading || !selectedAppId}
            onClick={handleNavigateForward}
            data-testid="preview-navigate-forward-button"
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={handleReload}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300"
            disabled={loading || !selectedAppId}
            data-testid="preview-refresh-button"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Address Bar with URL Display and Editing */}
        <div className="relative flex-grow min-w-20">
          {isEditingUrl ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editedUrl}
                onChange={(e) => setEditedUrl(e.target.value)}
                onKeyDown={handleUrlKeyPress}
                className="flex-1 px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Enter URL..."
                autoFocus
                data-testid="preview-url-input"
              />
              <button
                onClick={handleNavigateToUrl}
                className="p-1 rounded hover:bg-green-200 dark:hover:bg-green-900 text-green-600 dark:text-green-400"
                title="Navigate to URL"
                data-testid="preview-url-submit"
              >
                <Check size={16} />
              </button>
              <button
                onClick={handleCancelUrlEdit}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                title="Cancel"
                data-testid="preview-url-cancel"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div
                className="flex-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 cursor-pointer min-w-0"
                title={
                  navigationHistory[currentHistoryPosition] || appUrl || ""
                }
                data-testid="preview-url-display"
              >
                <span className="truncate block">
                  {navigationHistory[currentHistoryPosition] ||
                    appUrl ||
                    "Loading..."}
                </span>
              </div>
              <button
                onClick={handleStartUrlEdit}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                title="Edit URL"
                disabled={loading || !selectedAppId}
                data-testid="preview-url-edit"
              >
                <Edit3 size={16} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    title="Quick navigate to routes"
                    disabled={
                      loading || !selectedAppId || availableRoutes.length === 0
                    }
                    data-testid="preview-routes-dropdown"
                  >
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {availableRoutes.length > 0 ? (
                    availableRoutes.map((route) => (
                      <DropdownMenuItem
                        key={route.path}
                        onClick={() => navigateToRoute(route.path)}
                        className="flex justify-between"
                      >
                        <span>{route.label}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {route.path}
                        </span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      Loading routes...
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={onRestart}
            className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm hover:bg-[var(--background-darkest)] transition-colors"
            title="Restart App"
          >
            <Power size={16} />
            <span>Restart</span>
          </button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  data-testid="preview-open-external-window-button"
                  onClick={() => {
                    if (originalUrl) {
                      IpcClient.getInstance().openExternalPreview(originalUrl);
                    }
                  }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300"
                  disabled={!originalUrl}
                  title="Open preview in external window"
                >
                  <Square size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open preview in external window</p>
                <p>Includes component and CSS selectors</p>
                <p>{isMac ? "⌘ + ⇧ + E" : "Ctrl + ⇧ + E"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            data-testid="preview-open-browser-button"
            onClick={() => {
              if (originalUrl) {
                IpcClient.getInstance().openExternalUrl(originalUrl);
              }
            }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="relative flex-grow ">
        <ErrorBanner
          error={errorMessage}
          onDismiss={() => setErrorMessage(undefined)}
          onAIFix={() => {
            if (selectedChatId) {
              streamMessage({
                prompt: `Fix error: ${errorMessage}`,
                chatId: selectedChatId,
              });
            }
          }}
        />

        {/* CSS Selector Display Panel */}
        {capturedCssSelector && (
          <div className="absolute top-2 left-2 right-2 z-20 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Code
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                  <span className="font-medium text-green-800 dark:text-green-200 text-sm">
                    CSS Selector Captured
                  </span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
                  {capturedCssSelector}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={copyCssSelectorToClipboard}
                        className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded text-green-700 dark:text-green-300 transition-colors"
                        data-testid="copy-css-selector-button"
                      >
                        <Copy size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={sendCssSelectorToTerminal}
                        className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded text-green-700 dark:text-green-300 transition-colors"
                        data-testid="send-css-selector-to-terminal-button"
                      >
                        <Terminal size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send to terminal</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={insertCssSelectorToChat}
                        disabled={!selectedChatId}
                        className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded text-green-700 dark:text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="insert-css-selector-button"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Insert to chat</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <button
                  onClick={() => setCapturedCssSelector(null)}
                  className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded text-green-500 dark:text-green-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {!appUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-gray-950">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
            <p className="text-gray-600 dark:text-gray-300">
              Starting your app server...
            </p>
          </div>
        ) : (
          <iframe
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-downloads"
            data-testid="preview-iframe-element"
            onLoad={() => {
              setErrorMessage(undefined);
            }}
            ref={iframeRef}
            key={reloadKey}
            title={`Preview for App ${selectedAppId}`}
            className="w-full h-full border-none bg-white dark:bg-gray-950"
            src={appUrl}
            allow="clipboard-read; clipboard-write; fullscreen; microphone; camera; display-capture; geolocation; autoplay; picture-in-picture"
          />
        )}
      </div>
    </div>
  );
};

function parseComponentSelection(data: any): ComponentSelection | null {
  if (
    !data ||
    data.type !== "dyad-component-selected" ||
    typeof data.id !== "string" ||
    typeof data.name !== "string"
  ) {
    return null;
  }

  const { id, name } = data;

  // The id is expected to be in the format "filepath:line:column"
  const parts = id.split(":");
  if (parts.length < 3) {
    console.error(`Invalid component selection id format: "${id}"`);
    return null;
  }

  const columnStr = parts.pop();
  const lineStr = parts.pop();
  const relativePath = parts.join(":");

  if (!columnStr || !lineStr || !relativePath) {
    console.error(`Could not parse component selection from id: "${id}"`);
    return null;
  }

  const lineNumber = parseInt(lineStr, 10);
  const columnNumber = parseInt(columnStr, 10);

  if (isNaN(lineNumber) || isNaN(columnNumber)) {
    console.error(`Could not parse line/column from id: "${id}"`);
    return null;
  }

  return {
    id,
    name,
    relativePath,
    lineNumber,
    columnNumber,
  };
}
