import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("merge-tag search keeps focus, highlights results and inserts with the keyboard", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Merge tag", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const popup = page.getByRole("dialog", { name: "Insert merge tag" });
  const search = popup.getByRole("searchbox", { name: "Search merge tags" });
  await expect(search).toBeFocused();
  await search.fill("  FIRST_NAME  ");
  const firstName = popup.getByRole("menuitem", { name: /^First Name/ });
  await expect(firstName).toBeVisible();
  await expect(popup.getByRole("menuitem")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await expect(search).toBeFocused();
  await expect(firstName).toHaveAttribute("data-highlighted", "");
  expect(
    await firstName.evaluate((item) => getComputedStyle(item).backgroundColor),
  ).not.toBe("rgba(0, 0, 0, 0)");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status", { name: "Inserted merge tag" }),
  ).toHaveText("first_name");
  await expect(search).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(search).toHaveValue("");
  await expect(popup.getByRole("menuitem").first()).toBeVisible();
});

test("merge-tag search preserves category and label matching, empty results and accessible anatomy", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Merge tag", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const popup = page.getByRole("dialog", { name: "Insert merge tag" });
  const search = popup.getByRole("searchbox", { name: "Search merge tags" });
  await search.fill("  RECIPIENT  ");
  await expect(popup.getByRole("menuitem")).toHaveCount(5);
  await expect(
    popup.getByRole("menuitem", { name: /^Salutation/ }),
  ).toBeVisible();
  await search.fill("Organization Name");
  await expect(popup.getByRole("menuitem")).toHaveCount(1);
  await expect(
    popup.getByRole("menuitem", { name: /^Organization Name/ }),
  ).toBeVisible();
  await expect(popup).toBeVisible();
  const axe = await new AxeBuilder({ page })
    .include('[data-slot="dropdown-menu-content"]')
    .analyze();
  expect(axe.violations).toEqual([]);
  await search.fill("missing-merge-tag");
  await expect(popup.getByRole("menuitem")).toHaveCount(0);
  await expect(
    page.getByText("No matching tags", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(search).toHaveValue("");
  await expect(
    page.getByText("No matching tags", { exact: true }),
  ).toBeHidden();
});
