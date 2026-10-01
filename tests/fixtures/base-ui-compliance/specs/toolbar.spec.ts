import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("responsive toolbar keeps column and export names when visible text is hidden", async ({
  page,
}) => {
  const scope = page.locator("#toolbar-contracts");
  await page.setViewportSize({ width: 390, height: 844 });
  const columns = scope.getByRole("button", {
    name: "Toggle columns",
    exact: true,
  });
  await expect(columns).toBeVisible();
  await columns.focus();
  await columns.press("Enter");
  const email = page.getByRole("menuitemcheckbox", { name: "Email" });
  await expect(email).toBeVisible();
  await email.click();
  await page.keyboard.press("Escape");
  await expect(
    scope.getByRole("status", { name: "Visible columns" }),
  ).toHaveText("name");
  await expect(columns).toBeFocused();
  await scope.getByRole("button", { name: "Toggle table search" }).click();
  const search = scope.getByRole("textbox", { name: "Search people" });
  await expect(search).toBeFocused();
  await search.fill("Ada");
  await scope.getByRole("button", { name: "Clear table search" }).click();
  await expect(search).toHaveValue("");
  await page.setViewportSize({ width: 700, height: 844 });
  const exportButton = scope.getByRole("button", {
    name: "Export table",
    exact: true,
  });
  await expect(exportButton).toBeVisible();
  await expect(
    exportButton.getByText("Export", { exact: true }),
  ).not.toBeVisible();
  await exportButton.click();
  await expect(scope.getByRole("status", { name: "Table exports" })).toHaveText(
    "1",
  );
  const axe = await new AxeBuilder({ page })
    .include("#toolbar-contracts")
    .analyze();
  expect(axe.violations).toEqual([]);
});

test("actual mobile filter drawer keeps nested search, selection and focus usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const scope = page.locator("#toolbar-contracts");
  const trigger = scope.getByRole("button", { name: /^Filters/ });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Filters", exact: true });
  await expect(drawer).toHaveAccessibleDescription(
    "Refine your results with filters",
  );
  await drawer.getByRole("combobox", { name: "People", exact: true }).click();
  const search = page.getByRole("combobox", {
    name: "Search people",
    exact: true,
  });
  await expect(search).toBeFocused();
  await search.fill("Ada");
  const ada = page.getByRole("option", { name: /^Ada/ });
  await ada.click();
  await expect(ada).toHaveAttribute("aria-selected", "true");
  await search.press("Escape");
  await expect(
    drawer.getByRole("combobox", { name: "People", exact: true }),
  ).toBeFocused();
  const axe = await new AxeBuilder({ page })
    .include('[data-slot="drawer-content"]')
    .analyze();
  expect(axe.violations).toEqual([]);
  await drawer.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(
    scope.getByRole("status", { name: "Active people filter" }),
  ).toHaveText('["Ada"]');
});
