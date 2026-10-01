import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("modern input, number, OTP and real editor retain native contracts", async ({
  page,
}, testInfo) => {
  const name = page.getByRole("textbox", { name: "Profile name" });
  await name.fill("Conrad");
  await expect(name).toHaveClass(/enabled-name/);
  await page
    .getByRole("button", { name: "Toggle profile availability" })
    .click();
  await expect(name).toHaveClass(/disabled-name/);
  await expect(name).toBeDisabled();
  await page
    .getByRole("button", { name: "Toggle profile availability" })
    .click();
  await expect(name).toHaveValue("Conrad");
  const amount = page.getByRole("textbox", { name: "Profile amount" });
  await amount.focus();
  await amount.press("ArrowUp");
  await expect(amount).toHaveValue("2");
  await expect(
    page.getByRole("button", { name: "Increase value" }),
  ).toBeDisabled();
  await amount.press("ArrowDown");
  await expect(amount).toHaveValue("1.5");
  const code = page.getByRole("textbox", {
    name: "Verification code",
    exact: true,
  });
  await expect(code).toHaveAttribute("autocomplete", "one-time-code");
  await expect(
    page.getByRole("group", { name: "Verification code", exact: true }),
  ).toHaveAccessibleDescription("Enter four digits.");
  await code.focus();
  await page.keyboard.type("1234");
  await expect(
    page.getByRole("textbox", { name: "Character 4 of 4" }),
  ).toHaveValue("4");
  await page.getByRole("button", { name: "Save profile controls" }).click();
  await expect(
    page.getByRole("status", { name: "Submitted controls" }),
  ).toHaveText('{"name":"Conrad","amount":"1.5","code":"1234"}');

  const toolbar = page.getByRole("toolbar", { name: "Text formatting" });
  const bold = toolbar.getByRole("button", { name: "Bold (Ctrl+B)" });
  await bold.focus();
  await bold.press("ArrowRight");
  await expect(
    toolbar.getByRole("button", { name: "Italic (Ctrl+I)" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(toolbar.getByRole("button", { name: "Add link" })).toBeFocused();
  const editor = page.locator(".tiptap[contenteditable=true]");
  await editor.fill("Base UI ");
  await editor.press("End");
  await bold.click();
  await page.keyboard.type("works");
  await expect(
    page.getByRole("status", { name: "Stored message" }),
  ).toContainText('"type":"bold"');
  await expect(
    page.getByRole("status", { name: "Stored message" }),
  ).toContainText("works");
  await expect(
    toolbar.getByRole("button", { name: "Undo (Ctrl+Z)" }),
  ).not.toHaveAttribute("aria-pressed");
  await name.focus();
  const axe = await new AxeBuilder({ page })
    .include("#input-contracts")
    .analyze();
  expect(axe.violations).toEqual([]);
  await page
    .locator("#input-contracts")
    .screenshot({ path: testInfo.outputPath("input-contracts.png") });
});
