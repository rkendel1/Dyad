(() => {
  const OVERLAY_ID = "__dyad_css_selector_overlay__";
  let overlay, label;

  //detect if the user is using Mac
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // The possible states are:
  // { type: 'inactive' }
  // { type: 'inspecting', element: ?HTMLElement }
  // { type: 'selected', element: HTMLElement, selector: string }
  let state = { type: "inactive" };

  /* ---------- helpers --------------------------------------------------- */
  const css = (el, obj) => Object.assign(el.style, obj);

  // Generate optimal CSS selector for an element
  function generateCSSSelector(element) {
    if (!element) return "";

    // If element has an ID, use it (most specific)
    if (element.id) {
      return `#${element.id}`;
    }

    // If element has unique classes, build class selector
    const classes = Array.from(element.classList).filter(cls => 
      cls && !cls.startsWith('__dyad') // exclude our overlay classes
    );
    
    if (classes.length > 0) {
      const classSelector = `.${classes.join('.')}`;
      // Check if this class combination is unique
      if (document.querySelectorAll(classSelector).length === 1) {
        return classSelector;
      }
    }

    // Build path-based selector
    const path = [];
    let currentElement = element;

    while (currentElement && currentElement !== document.body) {
      let selector = currentElement.tagName.toLowerCase();

      // Add ID if present
      if (currentElement.id) {
        selector += `#${currentElement.id}`;
        path.unshift(selector);
        break; // ID is unique, we can stop here
      }

      // Add classes if present
      const elementClasses = Array.from(currentElement.classList).filter(cls => 
        cls && !cls.startsWith('__dyad')
      );
      if (elementClasses.length > 0) {
        selector += `.${elementClasses.join('.')}`;
      }

      // Add nth-child if there are siblings of same type
      const parent = currentElement.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(child => 
          child.tagName === currentElement.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(currentElement) + 1;
          selector += `:nth-child(${index})`;
        }
      }

      path.unshift(selector);
      currentElement = currentElement.parentElement;
    }

    return path.join(' > ');
  }

  function makeOverlay() {
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    css(overlay, {
      position: "absolute",
      border: "2px solid #22c55e",
      background: "rgba(34, 197, 94, 0.1)",
      pointerEvents: "none",
      zIndex: "2147483647", // max
      borderRadius: "4px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    });

    label = document.createElement("div");
    css(label, {
      position: "absolute",
      left: "0",
      top: "100%",
      transform: "translateY(4px)",
      background: "#22c55e",
      color: "#fff",
      fontFamily: "monospace",
      fontSize: "11px",
      lineHeight: "1.2",
      padding: "4px 6px",
      whiteSpace: "nowrap",
      borderRadius: "4px",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
      maxWidth: "400px",
      overflow: "hidden",
      textOverflow: "ellipsis",
    });
    overlay.appendChild(label);
    document.body.appendChild(overlay);
  }

  function updateOverlay(el, isSelected = false, selector = "") {
    if (!overlay) makeOverlay();

    const rect = el.getBoundingClientRect();
    css(overlay, {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      display: "block",
      border: isSelected ? "3px solid #22c55e" : "2px solid #22c55e",
      background: isSelected
        ? "rgba(34, 197, 94, 0.15)"
        : "rgba(34, 197, 94, 0.1)",
    });

    // Clear previous contents
    while (label.firstChild) {
      label.removeChild(label.firstChild);
    }

    if (isSelected) {
      const actionLine = document.createElement("div");
      css(actionLine, {
        fontWeight: "bold",
        marginBottom: "2px",
      });
      
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      Object.assign(svg.style, {
        display: "inline-block",
        verticalAlign: "-2px",
        marginRight: "4px",
      });
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute(
        "d",
        "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      );
      path.setAttribute("stroke", "white");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);

      actionLine.appendChild(svg);
      actionLine.appendChild(document.createTextNode("CSS Selector Captured"));
      label.appendChild(actionLine);
    }

    const tagName = el.tagName.toLowerCase();
    const selectorText = selector || generateCSSSelector(el);
    
    const tagEl = document.createElement("div");
    css(tagEl, {
      fontSize: "10px",
      opacity: "0.9",
      marginBottom: "1px",
    });
    tagEl.textContent = `<${tagName}>`;
    label.appendChild(tagEl);

    const selectorEl = document.createElement("div");
    css(selectorEl, { 
      fontSize: "10px", 
      fontFamily: "monospace",
      wordBreak: "break-all",
    });
    selectorEl.textContent = selectorText;
    label.appendChild(selectorEl);
  }

  /* ---------- event handlers -------------------------------------------- */
  function onMouseMove(e) {
    if (state.type !== "inspecting") return;

    let el = e.target;
    
    // Skip our overlay elements
    if (el === overlay || (overlay && overlay.contains(el))) {
      return;
    }

    if (state.element === el) return;
    state.element = el;

    if (el) {
      const selector = generateCSSSelector(el);
      updateOverlay(el, false, selector);
    } else {
      if (overlay) overlay.style.display = "none";
    }
  }

  function onClick(e) {
    if (state.type !== "inspecting" || !state.element) return;
    
    // Skip our overlay elements
    if (e.target === overlay || (overlay && overlay.contains(e.target))) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();

    const selector = generateCSSSelector(state.element);
    state = { type: "selected", element: state.element, selector };
    updateOverlay(state.element, true, selector);

    window.parent.postMessage(
      {
        type: "dyad-css-selector-selected",
        selector: selector,
        elementInfo: {
          tagName: state.element.tagName.toLowerCase(),
          id: state.element.id || null,
          className: state.element.className || null,
          textContent: state.element.textContent?.substring(0, 100) || null,
        },
      },
      "*",
    );
  }

  function onKeyDown(e) {
    // Ignore keystrokes if the user is typing in an input field, textarea, or editable element
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.isContentEditable
    ) {
      return;
    }

    // ESC to cancel
    if (e.key === "Escape" && state.type !== "inactive") {
      e.preventDefault();
      deactivate();
      window.parent.postMessage(
        { type: "dyad-css-selector-cancelled" },
        "*",
      );
    }

    // Forward shortcuts to parent window
    const key = e.key.toLowerCase();
    const hasShift = e.shiftKey;
    const hasCtrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
    if (key === "s" && hasShift && hasCtrlOrMeta) {
      e.preventDefault();
      window.parent.postMessage(
        {
          type: "dyad-css-selector-shortcut",
        },
        "*",
      );
    }
  }

  /* ---------- activation / deactivation --------------------------------- */
  function activate() {
    if (state.type === "inactive") {
      window.addEventListener("mousemove", onMouseMove, true);
      window.addEventListener("click", onClick, true);
    }
    state = { type: "inspecting", element: null };
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  function deactivate() {
    if (state.type === "inactive") return;

    window.removeEventListener("mousemove", onMouseMove, true);
    window.removeEventListener("click", onClick, true);
    if (overlay) {
      overlay.remove();
      overlay = null;
      label = null;
    }
    state = { type: "inactive" };
  }

  /* ---------- message bridge -------------------------------------------- */
  window.addEventListener("message", (e) => {
    if (e.source !== window.parent) return;
    if (e.data.type === "activate-dyad-css-selector") activate();
    if (e.data.type === "deactivate-dyad-css-selector") deactivate();
  });

  // Always listen for keyboard shortcuts (like component selector)
  window.addEventListener("keydown", onKeyDown, true);

  function initializeCSSSelector() {
    window.parent.postMessage(
      {
        type: "dyad-css-selector-initialized",
      },
      "*",
    );
    console.debug("Dyad CSS selector initialized");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCSSSelector);
  } else {
    initializeCSSSelector();
  }
})();