import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("Eve operations navigation stays visible and named at every supported width", async ({
  page,
}) => {
  const navigation = page.getByRole("navigation", {
    name: "Eve operations panels",
  });
  await expect(navigation).toBeVisible();
  const links = navigation.getByRole("link");
  expect(await links.count()).toBeGreaterThan(5);
  for (const link of await links.all()) await expect(link).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .include('[aria-label="Eve operations panels"]')
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("Mission Control search names permitted routes, supports keyboard selection and restores focus", async ({
  page,
}) => {
  const scope = page.locator("#admin-shadscan-contracts");
  const trigger = scope
    .getByRole("button", { name: "Open Mission Control search" })
    .filter({ visible: true });
  await trigger.focus();
  await trigger.press("Control+k");
  const dialog = page.getByRole("dialog", {
    name: "Mission Control navigation",
  });
  await expect(dialog).toBeVisible();
  const search = dialog.getByRole("combobox", {
    name: "Search Mission Control pages",
  });
  await expect(search).toBeFocused();
  await expect(
    dialog.getByRole("option", { name: "Contributions" }),
  ).toHaveCount(0);
  await search.fill("web studio");
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(
    scope.getByRole("status", { name: "Last navigation" }),
  ).toHaveText("/web-studio");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Mission Control shortcut preserves editing and Support's focused key handling", async ({
  page,
}) => {
  const scope = page.locator("#admin-shadscan-contracts");
  const draft = scope.getByRole("textbox", { name: "Draft note" });
  await draft.fill("Keep this draft");
  await draft.press("Control+k");
  await expect(
    page.getByRole("dialog", { name: "Mission Control navigation" }),
  ).toBeHidden();
  await expect(draft).toHaveValue("Keep this draft");
  await scope
    .getByRole("button", { name: "Focused Support workspace" })
    .press("Control+k");
  await expect(
    scope.getByRole("status", { name: "Support shortcut" }),
  ).toHaveText("Support shortcut handled");
  await expect(
    page.getByRole("dialog", { name: "Mission Control navigation" }),
  ).toBeHidden();
});

test("Admin candidate fields and replacement view group have usable labels", async ({
  page,
}) => {
  const scope = page.locator("#admin-shadscan-contracts");
  await scope.getByRole("button", { name: "Open candidate fields" }).click();
  const candidate = page.getByRole("dialog", { name: "New Candidate Profile" });
  await expect(candidate).toBeVisible();
  const create = candidate.getByRole("button", { name: "Create Profile" });
  await create.press("Control+k");
  await expect(
    page.getByRole("dialog", { name: "Mission Control navigation" }),
  ).toBeHidden();
  await expect(create).toBeFocused();
  for (const [name, purpose] of [
    ["First Name", "given-name"],
    ["Last Name", "family-name"],
    ["Email Address", "email"],
  ]) {
    await expect(candidate.getByRole("textbox", { name })).toHaveAttribute(
      "autocomplete",
      purpose,
    );
  }
  await candidate
    .getByRole("textbox", { name: "Interest Role" })
    .fill("Field worker");
  expect(
    (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(candidate).toBeHidden();
  await scope
    .getByRole("button", { name: "Choose replacement default" })
    .click();
  await expect(
    page.getByRole("radiogroup", { name: "Replacement default view" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    scope.getByRole("status").filter({ hasText: "Loading Web Studio…" }),
  ).toBeVisible();
});
