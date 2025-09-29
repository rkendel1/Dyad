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
    <title>Dyad Preview - ${url}</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            overflow: hidden;
        }
        .toolbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 10px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 1000;
        }
        .toolbar-button {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 6px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: white;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .toolbar-button:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-1px);
        }
        .toolbar-button.active {
            background: rgba(255,255,255,0.4);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toolbar-button.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .url-display {
            flex: 1;
            padding: 8px 16px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 6px;
            color: white;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .iframe-container {
            flex: 1;
            background: white;
            position: relative;
            overflow: hidden;
        }
        .preview-iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        }
        .selector-panel {
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            max-width: 340px;
            z-index: 1001;
            display: none;
            backdrop-filter: blur(10px);
        }
        .selector-panel.visible {
            display: block;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .selector-title {
            font-weight: 600;
            margin-bottom: 12px;
            color: #2d3748;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .selector-title::before {
            content: "🎯";
            font-size: 16px;
        }
        .selector-value {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 8px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 12px;
            word-break: break-all;
            margin-bottom: 16px;
            color: #2d3748;
            line-height: 1.5;
        }
        .selector-actions {
            display: flex;
            gap: 10px;
        }
        .selector-actions button {
            flex: 1;
            background: #4299e1;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .selector-actions button:hover {
            background: #3182ce;
            transform: translateY(-1px);
        }
        .selector-actions button.secondary {
            background: #718096;
        }
        .selector-actions button.secondary:hover {
            background: #4a5568;
        }
        .main-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .loading-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.95);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: none;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            color: #4a5568;
        }
        .loading-indicator.visible {
            display: flex;
        }
        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e2e8f0;
            border-top: 2px solid #4299e1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .status-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 12px;
            background: #48bb78;
            color: white;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            display: none;
            z-index: 1002;
        }
        .status-indicator.visible {
            display: block;
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="main-container">
        <div class="toolbar">
            <button id="componentSelector" class="toolbar-button" title="Select Dyad Component (⌘/Ctrl + Shift + C)">
                📦 <span>Component</span>
            </button>
            <button id="cssSelector" class="toolbar-button" title="Select CSS Element (⌘/Ctrl + Shift + S)">
                🎯 <span>CSS</span>
            </button>
            <div class="url-display" title="${url}">${url}</div>
            <button id="refreshBtn" class="toolbar-button" title="Refresh Preview">
                🔄 <span>Refresh</span>
            </button>
        </div>
        <div class="iframe-container">
            <div id="loadingIndicator" class="loading-indicator">
                <div class="spinner"></div>
                <span>Loading preview...</span>
            </div>
            <iframe id="previewFrame" class="preview-iframe" src="${url}" 
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals">
            </iframe>
        </div>
    </div>
    
    <div id="selectorPanel" class="selector-panel">
        <div class="selector-title" id="selectorTitle">Selected Element</div>
        <div class="selector-value" id="selectorValue"></div>
        <div class="selector-actions">
            <button id="copySelector">📋 Copy</button>
            <button id="closeSelector" class="secondary">✕ Close</button>
        </div>
    </div>
    
    <div id="statusIndicator" class="status-indicator">
        Ready
    </div>

    <script>
        let currentSelector = null;
        let selectorMode = null;
        let isLoading = false;
        
        // Initialize the preview window
        document.addEventListener('DOMContentLoaded', function() {
            const iframe = document.getElementById('previewFrame');
            const componentBtn = document.getElementById('componentSelector');
            const cssBtn = document.getElementById('cssSelector');
            const refreshBtn = document.getElementById('refreshBtn');
            const selectorPanel = document.getElementById('selectorPanel');
            const copyBtn = document.getElementById('copySelector');
            const closeBtn = document.getElementById('closeSelector');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const statusIndicator = document.getElementById('statusIndicator');
            
            // Show loading indicator initially
            showLoading();
            
            // Handle iframe load
            iframe.addEventListener('load', function() {
                hideLoading();
                setTimeout(() => {
                    injectSelectors();
                    showStatus('Preview loaded');
                }, 100);
            });
            
            iframe.addEventListener('error', function() {
                hideLoading();
                showStatus('Failed to load preview', 'error');
            });
            
            // Toolbar button handlers
            componentBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleSelector('component');
            });
            
            cssBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleSelector('css');
            });
            
            refreshBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showLoading();
                hideSelectorPanel();
                iframe.src = iframe.src;
            });
            
            // Selector panel handlers
            copyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentSelector) {
                    navigator.clipboard.writeText(currentSelector).then(() => {
                        copyBtn.innerHTML = '✅ Copied!';
                        showStatus('Copied to clipboard');
                        setTimeout(() => {
                            copyBtn.innerHTML = '📋 Copy';
                        }, 2000);
                    }).catch(() => {
                        showStatus('Copy failed', 'error');
                    });
                }
            });
            
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                hideSelectorPanel();
                toggleSelector(null);
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
                
                if (ctrlOrCmd && e.shiftKey) {
                    if (e.key.toLowerCase() === 'c') {
                        e.preventDefault();
                        toggleSelector('component');
                    } else if (e.key.toLowerCase() === 's') {
                        e.preventDefault();
                        toggleSelector('css');
                    }
                }
                
                if (e.key === 'Escape') {
                    hideSelectorPanel();
                    toggleSelector(null);
                }
            });
            
            // Listen for messages from iframe
            window.addEventListener('message', function(event) {
                if (event.source !== iframe.contentWindow) return;
                
                if (event.data.type === 'dyad-component-selected') {
                    showSelector('Component', event.data.name + ' (' + event.data.id + ')');
                    showStatus('Component selected');
                } else if (event.data.type === 'dyad-css-selector-selected') {
                    showSelector('CSS Selector', event.data.selector);
                    showStatus('CSS selector captured');
                }
            });
            
            // Show initial status
            setTimeout(() => {
                showStatus('Ready - Click a selector button to start');
            }, 1000);
        });
        
        function showLoading() {
            const loadingIndicator = document.getElementById('loadingIndicator');
            loadingIndicator.classList.add('visible');
            isLoading = true;
        }
        
        function hideLoading() {
            const loadingIndicator = document.getElementById('loadingIndicator');
            loadingIndicator.classList.remove('visible');
            isLoading = false;
        }
        
        function showStatus(message, type = 'success') {
            const statusIndicator = document.getElementById('statusIndicator');
            statusIndicator.textContent = message;
            statusIndicator.style.background = type === 'error' ? '#e53e3e' : '#48bb78';
            statusIndicator.classList.add('visible');
            
            setTimeout(() => {
                statusIndicator.classList.remove('visible');
            }, 3000);
        }
        
        function toggleSelector(type) {
            const iframe = document.getElementById('previewFrame');
            const componentBtn = document.getElementById('componentSelector');
            const cssBtn = document.getElementById('cssSelector');
            
            if (isLoading) return;
            
            // Clear previous state
            componentBtn.classList.remove('active');
            cssBtn.classList.remove('active');
            
            if (selectorMode === type || type === null) {
                // Deactivate current mode
                selectorMode = null;
                deactivateSelectors();
                showStatus('Selector deactivated');
            } else {
                // Activate new mode
                selectorMode = type;
                if (type === 'component') {
                    componentBtn.classList.add('active');
                    activateComponentSelector();
                    showStatus('Component selector active - Click an element');
                } else if (type === 'css') {
                    cssBtn.classList.add('active');
                    activateCssSelector();
                    showStatus('CSS selector active - Click an element');
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
                
                // Try to inject scripts - use try/catch for each injection
                try {
                    const componentScript = iframeDoc.createElement('script');
                    componentScript.id = 'dyad-component-selector';
                    componentScript.src = 'file://' + path.resolve(__dirname, "..", "..", "..", "worker", "dyad-component-selector-client.js").replace(/\\\\/g, "/");
                    componentScript.onerror = () => console.log('Component selector script failed to load');
                    iframeDoc.head.appendChild(componentScript);
                } catch (e) {
                    console.log('Could not inject component selector script:', e);
                }
                
                try {
                    const cssScript = iframeDoc.createElement('script');
                    cssScript.id = 'dyad-css-selector';
                    cssScript.src = 'file://' + path.resolve(__dirname, "..", "..", "..", "worker", "dyad-css-selector-client.js").replace(/\\\\/g, "/");
                    cssScript.onerror = () => console.log('CSS selector script failed to load');
                    iframeDoc.head.appendChild(cssScript);
                } catch (e) {
                    console.log('Could not inject CSS selector script:', e);
                }
                
            } catch (error) {
                console.log('Could not inject selector scripts (likely CORS):', error);
                showStatus('Selectors may not work due to CORS restrictions', 'error');
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
