import { BrowserWindow, ipcMain } from "electron";
import log from "electron-log";
import { platform } from "os";
import * as path from "node:path";

const logger = log.scope("window-handlers");

// Handler for minimizing the window
const handleMinimize = (event: Electron.IpcMainInvokeEvent) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    logger.error("Failed to get BrowserWindow instance for minimize command");
    return;
  }
  window.minimize();
};

// Handler for maximizing/restoring the window
const handleMaximize = (event: Electron.IpcMainInvokeEvent) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    logger.error("Failed to get BrowserWindow instance for maximize command");
    return;
  }

  if (window.isMaximized()) {
    window.restore();
  } else {
    window.maximize();
  }
};

// Handler for closing the window
const handleClose = (event: Electron.IpcMainInvokeEvent) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) {
    logger.error("Failed to get BrowserWindow instance for close command");
    return;
  }
  window.close();
};

// Handler to get the current system platform
const handleGetSystemPlatform = () => {
  return platform();
};

// Handler for opening external preview window
const handleOpenExternalPreview = async (event: Electron.IpcMainInvokeEvent, url: string) => {
  try {
    if (!url) {
      throw new Error("No URL provided for external preview.");
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error("Attempted to open invalid or non-http URL: " + url);
    }

    // Create a new browser window for the external preview
    const previewWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: "Dyad Preview",
      icon: path.join(__dirname, "..", "..", "..", "assets", "icon.png"),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        webSecurity: false, // Allow loading local resources
        preload: path.join(__dirname, "..", "..", "preload.js"),
      },
    });

    // Load the preview HTML that includes the selector functionality
    const previewHtml = await createPreviewHtml(url);
    previewWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(previewHtml)}`);

    // Open dev tools for debugging if needed
    if (process.env.NODE_ENV === "development") {
      previewWindow.webContents.openDevTools();
    }

    logger.debug("Opened external preview window for:", url);
  } catch (error) {
    logger.error("Failed to open external preview:", error);
    throw error;
  }
};

// Create HTML for the external preview window
const createPreviewHtml = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dyad Preview</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
        }
        .toolbar {
            background: #fff;
            border-bottom: 1px solid #e0e0e0;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .toolbar-button {
            background: #f0f0f0;
            border: 1px solid #d0d0d0;
            border-radius: 4px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        }
        .toolbar-button:hover {
            background: #e0e0e0;
        }
        .toolbar-button.active {
            background: #007acc;
            color: white;
        }
        .url-display {
            flex: 1;
            padding: 6px 12px;
            background: #f8f8f8;
            border: 1px solid #d0d0d0;
            border-radius: 4px;
            color: #666;
            font-family: monospace;
            font-size: 12px;
        }
        .iframe-container {
            flex: 1;
            background: white;
        }
        .preview-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .selector-panel {
            position: fixed;
            top: 60px;
            right: 20px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            z-index: 1000;
            display: none;
        }
        .selector-panel.visible {
            display: block;
        }
        .selector-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
        }
        .selector-value {
            background: #f5f5f5;
            padding: 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin-bottom: 8px;
        }
        .selector-actions {
            display: flex;
            gap: 8px;
        }
        .selector-actions button {
            flex: 1;
            background: #007acc;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .selector-actions button:hover {
            background: #005c99;
        }
        .main-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div class="main-container">
        <div class="toolbar">
            <button id="componentSelector" class="toolbar-button" title="Select Dyad Component">
                📦 Component
            </button>
            <button id="cssSelector" class="toolbar-button" title="Select CSS Element">
                🎯 CSS
            </button>
            <div class="url-display">${url}</div>
            <button id="refreshBtn" class="toolbar-button" title="Refresh">
                🔄
            </button>
        </div>
        <div class="iframe-container">
            <iframe id="previewFrame" class="preview-iframe" src="${url}" 
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals">
            </iframe>
        </div>
    </div>
    
    <div id="selectorPanel" class="selector-panel">
        <div class="selector-title" id="selectorTitle">Selected Element</div>
        <div class="selector-value" id="selectorValue"></div>
        <div class="selector-actions">
            <button id="copySelector">Copy</button>
            <button id="closeSelector">Close</button>
        </div>
    </div>

    <script>
        let currentSelector = null;
        let selectorMode = null;
        
        // Initialize the preview window
        document.addEventListener('DOMContentLoaded', function() {
            const iframe = document.getElementById('previewFrame');
            const componentBtn = document.getElementById('componentSelector');
            const cssBtn = document.getElementById('cssSelector');
            const refreshBtn = document.getElementById('refreshBtn');
            const selectorPanel = document.getElementById('selectorPanel');
            const copyBtn = document.getElementById('copySelector');
            const closeBtn = document.getElementById('closeSelector');
            
            // Handle iframe load
            iframe.addEventListener('load', function() {
                injectSelectors();
            });
            
            // Toolbar button handlers
            componentBtn.addEventListener('click', function() {
                toggleSelector('component');
            });
            
            cssBtn.addEventListener('click', function() {
                toggleSelector('css');
            });
            
            refreshBtn.addEventListener('click', function() {
                iframe.src = iframe.src;
            });
            
            // Selector panel handlers
            copyBtn.addEventListener('click', function() {
                if (currentSelector) {
                    navigator.clipboard.writeText(currentSelector);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                    }, 2000);
                }
            });
            
            closeBtn.addEventListener('click', function() {
                hideSelectorPanel();
            });
            
            // Listen for messages from iframe
            window.addEventListener('message', function(event) {
                if (event.source !== iframe.contentWindow) return;
                
                if (event.data.type === 'dyad-component-selected') {
                    showSelector('Component', event.data.name + ' (' + event.data.id + ')');
                } else if (event.data.type === 'dyad-css-selector-selected') {
                    showSelector('CSS Selector', event.data.selector);
                }
            });
        });
        
        function toggleSelector(type) {
            const iframe = document.getElementById('previewFrame');
            const componentBtn = document.getElementById('componentSelector');
            const cssBtn = document.getElementById('cssSelector');
            
            // Clear previous state
            componentBtn.classList.remove('active');
            cssBtn.classList.remove('active');
            
            if (selectorMode === type) {
                // Deactivate current mode
                selectorMode = null;
                deactivateSelectors();
            } else {
                // Activate new mode
                selectorMode = type;
                if (type === 'component') {
                    componentBtn.classList.add('active');
                    activateComponentSelector();
                } else if (type === 'css') {
                    cssBtn.classList.add('active');
                    activateCssSelector();
                }
            }
        }
        
        function activateComponentSelector() {
            const iframe = document.getElementById('previewFrame');
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'activate-dyad-component-selector'
                }, '*');
                iframe.contentWindow.postMessage({
                    type: 'deactivate-dyad-css-selector'
                }, '*');
            }
        }
        
        function activateCssSelector() {
            const iframe = document.getElementById('previewFrame');
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'activate-dyad-css-selector'
                }, '*');
                iframe.contentWindow.postMessage({
                    type: 'deactivate-dyad-component-selector'
                }, '*');
            }
        }
        
        function deactivateSelectors() {
            const iframe = document.getElementById('previewFrame');
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'deactivate-dyad-component-selector'
                }, '*');
                iframe.contentWindow.postMessage({
                    type: 'deactivate-dyad-css-selector'
                }, '*');
            }
            hideSelectorPanel();
        }
        
        function showSelector(title, value) {
            document.getElementById('selectorTitle').textContent = title;
            document.getElementById('selectorValue').textContent = value;
            document.getElementById('selectorPanel').classList.add('visible');
            currentSelector = value;
        }
        
        function hideSelectorPanel() {
            document.getElementById('selectorPanel').classList.remove('visible');
            currentSelector = null;
        }
        
        function injectSelectors() {
            const iframe = document.getElementById('previewFrame');
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                // Check if scripts are already injected
                if (iframeDoc.getElementById('dyad-component-selector') || 
                    iframeDoc.getElementById('dyad-css-selector')) {
                    return;
                }
                
                // Inject component selector script
                const componentScript = iframeDoc.createElement('script');
                componentScript.id = 'dyad-component-selector';
                componentScript.src = 'file://' + path.resolve(__dirname, "..", "..", "..", "worker", "dyad-component-selector-client.js").replace(/\\\\/g, "/");
                iframeDoc.head.appendChild(componentScript);
                
                // Inject CSS selector script
                const cssScript = iframeDoc.createElement('script');
                cssScript.id = 'dyad-css-selector';
                cssScript.src = 'file://' + path.resolve(__dirname, "..", "..", "..", "worker", "dyad-css-selector-client.js").replace(/\\\\/g, "/");
                iframeDoc.head.appendChild(cssScript);
                
            } catch (error) {
                console.log('Could not inject selector scripts:', error);
            }
        }
    </script>
</body>
</html>`;
    resolve(html);
  });
};

export function registerWindowHandlers() {
  logger.debug("Registering window control handlers");
  ipcMain.handle("window:minimize", handleMinimize);
  ipcMain.handle("window:maximize", handleMaximize);
  ipcMain.handle("window:close", handleClose);
  ipcMain.handle("get-system-platform", handleGetSystemPlatform);
  ipcMain.handle("open-external-preview", handleOpenExternalPreview);
}
