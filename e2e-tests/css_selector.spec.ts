import { expect } from "@playwright/test";
import { testSkipIfWindows } from "./helpers/test_helper";

testSkipIfWindows("css selector capture", async ({ po }) => {
  await po.setUp();
  await po.sendPrompt("tc=basic");
  await po.clickTogglePreviewPanel();

  // Activate CSS selector mode
  await po.page.getByTestId("preview-css-selector-button").click();

  // Click on an element in the preview to capture its CSS selector
  await po
    .getPreviewIframeElement()
    .contentFrame()
    .getByRole("heading", { name: "Welcome to Your Blank App" })
    .click();

  // Wait for the CSS selector panel to appear
  await expect(po.page.locator(".bg-green-50")).toBeVisible();

  // The captured selector should be displayed
  const selectorDisplay = po.page.locator(".font-mono").first();
  await expect(selectorDisplay).toBeVisible();

  // Copy button should be present and functional
  const copyButton = po.page.getByTestId("copy-css-selector-button").first();
  await expect(copyButton).toBeVisible();

  // Insert to chat button should be present
  const insertButton = po.page
    .getByTestId("insert-css-selector-button")
    .first();
  await expect(insertButton).toBeVisible();

  await po.snapshotPreview();
});

testSkipIfWindows("css selector copy to clipboard", async ({ po }) => {
  await po.setUp();
  await po.sendPrompt("tc=basic");
  await po.clickTogglePreviewPanel();

  // Grant clipboard permissions
  await po.page
    .context()
    .grantPermissions(["clipboard-read", "clipboard-write"]);

  // Activate CSS selector mode
  await po.page.getByTestId("preview-css-selector-button").click();

  // Click on an element to capture selector
  await po
    .getPreviewIframeElement()
    .contentFrame()
    .getByRole("heading", { name: "Welcome to Your Blank App" })
    .click();

  // Click copy button
  await po.page.getByRole("button", { name: /copy/i }).first().click();

  // Verify content was copied to clipboard
  const clipboardContent = await po.page.evaluate(() =>
    navigator.clipboard.readText(),
  );

  expect(clipboardContent.length).toBeGreaterThan(0);
  expect(clipboardContent).toMatch(/h1|\.[\w-]+|#[\w-]+/); // Should match CSS selector patterns
});

testSkipIfWindows("css selector insert to chat", async ({ po }) => {
  await po.setUp();
  await po.sendPrompt("tc=basic");
  await po.clickTogglePreviewPanel();

  // Activate CSS selector mode
  await po.page.getByTestId("preview-css-selector-button").click();

  // Click on an element to capture selector
  await po
    .getPreviewIframeElement()
    .contentFrame()
    .getByRole("heading", { name: "Welcome to Your Blank App" })
    .click();

  // Click insert to chat button
  await po.page
    .getByRole("button", { name: /insert/i })
    .first()
    .click();

  // Verify the selector was added to the chat
  await po.waitForChatCompletion();

  // Check if the CSS selector appears in the chat
  const chatContent = await po.page.getByTestId("chat-messages").textContent();
  expect(chatContent).toContain("Use this CSS selector:");

  await po.snapshotMessages({ replaceDumpPath: true });
});

testSkipIfWindows("css selector keyboard shortcut", async ({ po }) => {
  await po.setUp();
  await po.sendPrompt("tc=basic");
  await po.clickTogglePreviewPanel();

  // Use keyboard shortcut to activate CSS selector
  const isMac = process.platform === "darwin";
  if (isMac) {
    await po.page.keyboard.press("Meta+Shift+S");
  } else {
    await po.page.keyboard.press("Control+Shift+S");
  }

  // Verify CSS selector mode is activated
  const cssSelectorButton = po.page.getByTestId("preview-css-selector-button");
  await expect(cssSelectorButton).toHaveClass(/bg-green-500/);

  // Click on an element to test functionality
  await po
    .getPreviewIframeElement()
    .contentFrame()
    .getByRole("heading", { name: "Welcome to Your Blank App" })
    .click();

  // Verify selector panel appears
  await expect(po.page.locator(".bg-green-50")).toBeVisible();
});

testSkipIfWindows(
  "css selector and component selector mutual exclusion",
  async ({ po }) => {
    await po.setUp();
    await po.sendPrompt("tc=basic");
    await po.clickTogglePreviewPanel();

    // First activate component selector
    await po.clickPreviewPickElement();
    const componentButton = po.page.getByTestId("preview-pick-element-button");
    await expect(componentButton).toHaveClass(/bg-purple-500/);

    // Then activate CSS selector - should deactivate component selector
    await po.page.getByTestId("preview-css-selector-button").click();

    // Component selector should be deactivated
    await expect(componentButton).not.toHaveClass(/bg-purple-500/);

    // CSS selector should be activated
    const cssSelectorButton = po.page.getByTestId(
      "preview-css-selector-button",
    );
    await expect(cssSelectorButton).toHaveClass(/bg-green-500/);
  },
);
