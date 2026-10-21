import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("real Support mention suggestions keep editor focus, announce the active option and retain selection", async ({
  page,
}) => {
  const scope = page.locator("#support-suggestion-contracts");
  const editor = scope.getByRole("textbox", { name: "Internal note" });
  await editor.click();
  await editor.pressSequentially("@r");
  const popup = page.getByRole("listbox", { name: "Mention agent" });
  await expect(popup).toBeVisible();
  await expect(popup.getByRole("option")).toHaveCount(2);
  await expect(editor).toBeFocused();
  const popupId = await popup.getAttribute("id");
  expect(popupId).toBeTruthy();
  await expect(editor).toHaveAttribute("aria-controls", popupId!);
  const first = popup.getByRole("option", { name: "Morgan Care" });
  await expect(editor).toHaveAttribute(
    "aria-activedescendant",
    (await first.getAttribute("id"))!,
  );
  await editor.press("ArrowDown");
  const second = popup.getByRole("option", { name: "Riley Care" });
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(editor).toHaveAttribute(
    "aria-activedescendant",
    (await second.getAttribute("id"))!,
  );
  await expect(editor).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .include('#support-suggestion-contracts [contenteditable="true"]')
        .include('[role="listbox"]')
        .analyze()
    ).violations,
  ).toEqual([]);
  await editor.press("Enter");
  await expect(popup).toBeHidden();
  await expect(
    scope.getByRole("status", { name: "Selected suggestion" }),
  ).toHaveText("agent-riley");
  await expect(editor).toContainText("Riley");
  await expect(editor).toBeFocused();
  await expect(editor).not.toHaveAttribute("aria-controls");
  await expect(editor).not.toHaveAttribute("aria-activedescendant");
});

test("real Support suggestion filtering, Escape and editor unmount remove popup references", async ({
  page,
}) => {
  const scope = page.locator("#support-suggestion-contracts");
  const editor = scope.getByRole("textbox", { name: "Internal note" });
  await editor.click();
  await editor.pressSequentially("@zzzz");
  const popup = page.getByRole("listbox", { name: "Mention agent" });
  await expect(popup).toBeVisible();
  await expect(popup).toContainText("No agent matches.");
  await expect(editor).not.toHaveAttribute("aria-activedescendant");
  await editor.press("Escape");
  await expect(popup).toBeHidden();
  await expect(editor).toBeFocused();
  await expect(editor).not.toHaveAttribute("aria-controls");
  await editor.selectText();
  // Tiptap keeps an escaped trigger dismissed until its matching context ends.
  await editor.press("Backspace");
  await editor.pressSequentially("@");
  await expect(popup).toBeVisible();
  const unmount = scope.getByRole("button", { name: "Unmount support editor" });
  await editor.press("Tab");
  await expect(unmount).toBeFocused();
  await unmount.press("Enter");
  await expect(popup).toBeHidden();
  await expect(editor).toHaveCount(0);
  await scope.getByRole("button", { name: "Mount support editor" }).click();
  await expect(editor).toBeVisible();
  await expect(editor).not.toHaveAttribute("aria-controls");
});

test("Support eight-item keyboard navigation keeps the active option within the scroll viewport", async ({
  page,
}, testInfo) => {
  const editor = page
    .locator("#support-suggestion-contracts")
    .getByRole("textbox", { name: "Internal note" });
  await editor.click();
  await editor.pressSequentially("@");
  const popup = page.getByRole("listbox", { name: "Mention agent" });
  await expect(popup.getByRole("option")).toHaveCount(8);
  await editor.press("ArrowUp");
  const last = popup.getByRole("option", { name: "Finley Care" });
  await expect(editor).toHaveAttribute(
    "aria-activedescendant",
    (await last.getAttribute("id"))!,
  );
  const viewport = await popup.locator("ul").boundingBox();
  const active = await last.boundingBox();
  if (!viewport || !active)
    throw new Error("Actual suggestion viewport did not render");
  expect(active.y).toBeGreaterThanOrEqual(viewport.y);
  expect(active.y + active.height).toBeLessThanOrEqual(
    viewport.y + viewport.height + 1,
  );
  await expect(editor).toBeFocused();
  // Current axe recognizes the textbox-owned popup focus model. Keep the
  // complete report and require zero violations; the old scroll-region
  // exception is no longer needed. DOM focus remains in the editor.
  const report = await new AxeBuilder({ page })
    .include('#support-suggestion-contracts [contenteditable="true"]')
    .include('[role="listbox"]')
    .analyze();
  await testInfo.attach("support-eight-item-axe-report", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });
  expect(report.violations).toEqual([]);
  await editor.press("Enter");
  await expect(popup).toBeHidden();
  await expect(
    page.getByRole("status", { name: "Selected suggestion" }),
  ).toHaveText("agent-finley");
  await expect(editor).toContainText("Finley");
  await expect(editor).toBeFocused();
  await expect(editor).not.toHaveAttribute("aria-controls");
});
