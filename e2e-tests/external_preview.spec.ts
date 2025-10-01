import { expect } from "@playwright/test";
import { testSkipIfWindows } from "./helpers/test_helper";

testSkipIfWindows("external preview window button appears", async ({ po }) => {
  await po.setUp();
  await po.sendPrompt("tc=basic");
  await po.clickTogglePreviewPanel();

  // Check that the external preview button is visible
  const externalPreviewButton = po.page.getByTestId(
    "preview-open-external-window-button",
  );
  await expect(externalPreviewButton).toBeVisible();

  // Check that the button has the correct tooltip
  await externalPreviewButton.hover();
  await expect(
    po.page.locator("text=Open preview in external window"),
  ).toBeVisible();
});

testSkipIfWindows(
  "external preview window button is disabled when no app URL",
  async ({ po }) => {
    await po.setUp();

    // Without an app, the button should be disabled
    await po.clickTogglePreviewPanel();

    const externalPreviewButton = po.page.getByTestId(
      "preview-open-external-window-button",
    );
    await expect(externalPreviewButton).toBeDisabled();
  },
);

testSkipIfWindows(
  "external preview window button positioning",
  async ({ po }) => {
    await po.setUp();
    await po.sendPrompt("tc=basic");
    await po.clickTogglePreviewPanel();

    // Check that external preview button comes before the regular external link button
    const externalPreviewButton = po.page.getByTestId(
      "preview-open-external-window-button",
    );
    const externalLinkButton = po.page.getByTestId(
      "preview-open-browser-button",
    );

    await expect(externalPreviewButton).toBeVisible();
    await expect(externalLinkButton).toBeVisible();

    // Both buttons should be in the same container
    const toolbar = po.page.locator(".flex.space-x-1").last();
    await expect(toolbar.locator("button")).toHaveCount(3); // Restart, External Preview, External Link
  },
);

testSkipIfWindows(
  "external preview keyboard shortcut tooltip",
  async ({ po }) => {
    await po.setUp();
    await po.sendPrompt("tc=basic");
    await po.clickTogglePreviewPanel();

    // Check that the tooltip shows the keyboard shortcut
    const externalPreviewButton = po.page.getByTestId(
      "preview-open-external-window-button",
    );
    await externalPreviewButton.hover();

    const isMac = process.platform === "darwin";
    const expectedShortcut = isMac ? "⌘ + ⇧ + E" : "Ctrl + ⇧ + E";
    await expect(po.page.locator(`text=${expectedShortcut}`)).toBeVisible();
  },
);
