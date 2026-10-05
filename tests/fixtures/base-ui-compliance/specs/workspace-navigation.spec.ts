import AxeBuilder from "@axe-core/playwright";

import { expect, test } from "./test";

test("missionary public routes never mount or intercept workspace search", async ({
  page,
}) => {
  for (const pathname of [
    "/login",
    "/register",
    "/forgot-password",
    "/no-access",
    "/auth/callback",
    "/checkout",
    "/workers/example",
    "/boneyard/capture",
  ]) {
    await page.goto(
      `/workspace.html?workspace=missionary&pathname=${encodeURIComponent(pathname)}`,
    );
    await expect(
      page.getByRole("heading", { name: "Missionary workspace contracts" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Search missionary pages" }),
    ).toHaveCount(0);
    const prevented = await page.evaluate(() => {
      const shortcut = new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(shortcut);
      return shortcut.defaultPrevented;
    });
    expect(prevented).toBe(false);
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("shared palette preserves light and dark token contrast and keyboard dismissal", async ({
  page,
}, testInfo) => {
  await page.goto("/workspace.html?workspace=shared");
  if (testInfo.project.use.colorScheme === "dark")
    await page
      .locator("html")
      .evaluate((element) => element.classList.add("dark"));
  const trigger = page.getByRole("button", { name: "Search shared pages" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Shared navigation" });
  await expect(
    dialog.getByRole("combobox", { name: "Search shared navigation" }),
  ).toBeFocused();
  const result = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(result.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const workspace of ["donor", "missionary"] as const) {
  test(`${workspace} palette supports keyboard navigation and Escape focus return`, async ({
    page,
  }) => {
    await page.goto(`/workspace.html?workspace=${workspace}`);
    const trigger = page.getByRole("button", {
      name: `Search ${workspace} pages`,
    });
    await expect(page.locator("html")).toHaveClass(/light/);
    if (workspace === "missionary") {
      await expect(
        page.getByRole("button", { name: "Notifications" }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Toggle theme" }),
      ).toHaveCount(0);
      const helpSize = await page
        .getByRole("button", { name: "Help", exact: true })
        .boundingBox();
      expect(helpSize?.width).toBeGreaterThanOrEqual(44);
      expect(helpSize?.height).toBeGreaterThanOrEqual(44);
    }
    await trigger.focus();
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", {
      name: `${workspace === "donor" ? "Donor" : "Missionary"} navigation`,
    });
    const search = dialog.getByRole("combobox", {
      name: `Search ${workspace} navigation`,
    });
    await expect(search).toBeFocused();
    await search.fill("settings");
    await expect(
      dialog.getByRole("option", { name: "Settings" }),
    ).toBeVisible();
    const result = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();
    expect(result.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(search).toHaveValue("");
    await search.fill("settings");
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("status", { name: "Navigation destination" }),
    ).toHaveText(
      workspace === "donor" ? "/donor-dashboard/settings" : "/settings",
    );
    await expect(dialog).toBeHidden();
    const note = page.getByRole("textbox", { name: "Workspace note" });
    await note.focus();
    await page.keyboard.press("Control+k");
    await expect(dialog).toBeHidden();
    await expect(note).toBeFocused();
    const size = await trigger.boundingBox();
    expect(size?.width).toBeGreaterThanOrEqual(44);
    expect(size?.height).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  });
}

test("donor navigation controls keep names when mobile labels are hidden", async ({
  page,
}) => {
  await page.goto("/workspace.html?workspace=donor");
  for (const name of [
    "Overview",
    "Donation History",
    "Ministry Updates",
    "Recurring Giving",
    "Wallet",
    "Settings",
  ]) {
    const link = page.getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    const size = await link.boundingBox();
    expect(size?.width).toBeGreaterThanOrEqual(44);
    expect(size?.height).toBeGreaterThanOrEqual(44);
  }
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
});

test("donor sign-out remains pending until its session operation completes", async ({
  page,
}) => {
  await page.goto("/workspace.html?workspace=donor");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  const pending = page.getByRole("button", {
    name: "Signing out…",
    exact: true,
  });
  await expect(pending).toBeDisabled();
  await expect(pending).toHaveAttribute("aria-busy", "true");
  await pending.dispatchEvent("click");
  await page
    .getByRole("button", { name: "Complete sign out", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("status", { name: "Sign out requests" }),
  ).toHaveText("1");
});
