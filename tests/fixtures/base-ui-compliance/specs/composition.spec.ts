import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("pending authentication action stays focused and blocks duplicate activation", async ({
  page,
}) => {
  const scope = page.locator("#composition-contracts");
  const auth = scope.getByRole("button", {
    name: /Sign in fixture|Signing in/,
  });
  await auth.click();
  await expect(auth).toBeFocused();
  await expect(auth).toHaveAccessibleName("Signing in");
  await expect(auth).toHaveAttribute("aria-disabled", "true");
  await expect(auth).not.toHaveAttribute("disabled");
  await expect(auth).toHaveCSS("opacity", "0.5");
  await page.keyboard.press("Space");
  await expect(
    scope.getByRole("status", { name: "Auth activations" }),
  ).toHaveText("1");
});

test("sidebar composition keeps render state, cancellation and native links", async ({
  page,
}) => {
  const scope = page.locator("#composition-contracts");
  const composed = scope.getByRole("button", { name: "Composed Projects" });
  await composed.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(composed).toHaveAttribute("data-render-size", "lg");
  const tooltip = page.getByText("Projects help", { exact: true });
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    await expect(tooltip).toBeHidden();
  } else {
    await expect(tooltip).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await scope.getByRole("button", { name: "Toggle Sidebar" }).click();
  await expect(
    scope.getByRole("status", { name: "Sidebar changes" }),
  ).toHaveText("0");
  const link = scope.getByRole("link", { name: "Styled destination" });
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#composition-destination$/);
  await expect(link).not.toHaveAttribute("role", "button");
});

test("product choice groups support keyboard selection and preserve saved values", async ({
  page,
}, testInfo) => {
  const scope = page.locator("#composition-contracts");
  const board = scope.getByRole("button", { name: "Board", exact: true });
  const table = scope.getByRole("button", { name: "Table", exact: true });
  await board.focus();
  await page.keyboard.press("ArrowRight");
  await expect(table).toBeFocused();
  await page.keyboard.press("Space");
  await expect(scope.getByRole("status", { name: "Chosen layout" })).toHaveText(
    "table",
  );
  await page.keyboard.press("Space");
  await expect(table).toHaveAttribute("aria-pressed", "true");
  await scope.getByRole("button", { name: "Use zinc tone" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    scope.getByRole("button", { name: "Use blue tone" }),
  ).toBeFocused();
  await page.keyboard.press("Space");
  await scope.getByLabel("Name", { exact: true }).fill("Finance");
  await scope.getByRole("button", { name: "Create label" }).click();
  await expect(
    scope.getByRole("status", { name: "Saved label" }),
  ).toContainText('"tone":"blue"');
  await expect(board).toHaveAccessibleName("Board");
  await expect(table).toHaveAccessibleName("Table");
  expect(
    await scope.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  const axe = await new AxeBuilder({ page })
    .include("#composition-contracts")
    .analyze();
  expect(axe.violations).toEqual([]);
  await scope.screenshot({
    path: testInfo.outputPath("composition-contracts.png"),
  });
});

test("real offline gift donor modes select and restore focus without submitting", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Open offline donor modes",
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  const known = dialog.getByRole("button", { name: /Known donor/ });
  const unknown = dialog.getByRole("button", { name: /Unknown \/ anonymous/ });
  await known.focus();
  await page.keyboard.press("ArrowRight");
  await expect(unknown).toBeFocused();
  await page.keyboard.press("Space");
  await expect(
    dialog.getByText("Not receiptable", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("offline gift success and the next entry retain a single named dialog", async ({
  page,
}) => {
  let submissions = 0;
  await page.route(
    "http://127.0.0.1:5198/api/admin/contributions/offline",
    async (route) => {
      expect(route.request().method()).toBe("POST");
      submissions += 1;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            contributionId: "fixture-gift",
            donorIdentityStatus: "known",
            receiptStatus: "pending",
          },
        }),
      });
    },
  );
  const trigger = page.getByRole("button", {
    name: "Open offline donor modes",
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const entry = page.getByRole("dialog", { name: "Enter offline gift" });
  await entry.getByPlaceholder("Ada", { exact: true }).fill("Ada");
  await entry.getByPlaceholder("Lovelace", { exact: true }).fill("Lovelace");
  await entry.getByPlaceholder("0.00", { exact: true }).fill("100");
  await entry.locator('input[type="date"]').fill("2026-07-01");
  await entry.getByPlaceholder("fund ID", { exact: true }).fill("fixture-fund");
  const record = entry.getByRole("button", { name: "Record gift" });
  await record.focus();
  await page.keyboard.press("Enter");
  const success = page.getByRole("dialog", { name: "Gift recorded" });
  await expect(success).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  expect(submissions).toBe(1);
  const another = success.getByRole("button", { name: "Enter another" });
  await another.focus();
  await page.keyboard.press("Enter");
  await expect(entry).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(entry.getByPlaceholder("Ada", { exact: true })).toHaveValue("");
  expect(submissions).toBe(1);
  await page.keyboard.press("Escape");
  await expect(entry).toBeHidden();
  await expect(trigger).toBeFocused();
});
