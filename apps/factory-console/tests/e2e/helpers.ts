import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const FIXTURE = "http://127.0.0.1:39994";

export async function noSeriousAxe(page: Page) {
  const report = await new AxeBuilder({ page }).analyze();
  expect(
    report.violations
      .filter((item) => ["critical", "serious"].includes(item.impact ?? ""))
      .map(
        (item) =>
          `${item.id}: ${item.nodes.map((node) => node.target.join(" ")).join(", ")}`,
      ),
  ).toEqual([]);
}

export async function noHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}

export async function open(page: Page, tab: string) {
  await page.getByRole("tab", { name: tab, exact: true }).click();
  await expect(
    page.getByRole("tab", { name: tab, exact: true }),
  ).toHaveAttribute("aria-selected", "true");
}

/** The visible tab panel (inactive panels stay mounted but hidden). */
export function panel(page: Page) {
  return page.locator('[role="tabpanel"]:not([hidden])');
}

export async function ready(page: Page, path = "/") {
  await page.goto(path);
  await expect(
    page.getByText("instance fixture-store", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("Live", { exact: true }).first()).toBeVisible();
}
