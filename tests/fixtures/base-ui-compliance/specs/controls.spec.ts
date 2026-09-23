import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("searchable product settings preserve 200 records and distinct duplicate values", async ({
  page,
}) => {
  const scope = page.locator("#controls-contracts");
  const tenant = scope.getByRole("combobox", { name: "Tenant directory" });
  await expect(tenant).toHaveText(/Shared tenant name/);
  await expect(tenant).toHaveAccessibleDescription(
    "Choose from all 200 tenant records.",
  );
  await scope.getByText("Tenant directory", { exact: true }).click();
  await expect(tenant).toBeFocused();
  await expect(tenant).toHaveAttribute("aria-expanded", "false");
  await tenant.press("Space");
  const search = page.getByRole("combobox", {
    name: "Search Tenant directory",
  });
  await expect(search).toBeFocused();
  expect(await search.getAttribute("id")).not.toBe(
    await tenant.getAttribute("id"),
  );
  await expect(page.getByRole("option")).toHaveCount(200);
  await search.fill("Shared tenant name");
  await expect(
    page.getByRole("option", { name: "Shared tenant name", exact: true }),
  ).toHaveCount(2);
  await page
    .getByRole("option", { name: "Shared tenant name", exact: true })
    .nth(1)
    .click();
  await expect(
    scope.getByRole("status", { name: "Selected tenant ID" }),
  ).toHaveText("tenant-21");
  await expect(tenant).toBeFocused();
  await tenant.press("Space");
  await search.fill("Tenant 198");
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(
    scope.getByRole("status", { name: "Selected tenant ID" }),
  ).toHaveText("tenant-198");
  await expect(tenant).toBeFocused();
  await tenant.click();
  await search.fill("Tenant 199");
  await expect(
    page.getByRole("option", { name: "Tenant 199", exact: true }),
  ).toHaveAttribute("aria-disabled", "true");
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(
    scope.getByRole("status", { name: "Selected tenant ID" }),
  ).toHaveText("tenant-198");
  await search.fill("No such tenant");
  await expect(
    page.getByRole("status").filter({ hasText: "No options found." }),
  ).toBeVisible();
  const popupAxe = await new AxeBuilder({ page })
    .include('[data-slot="combobox-content"]')
    .analyze();
  expect(popupAxe.violations).toEqual([]);
  await search.press("Escape");
  await expect(tenant).toBeFocused();
});

test("sliders and choice controls retain state, names, values and indicator geometry", async ({
  page,
}) => {
  const scope = page.locator("#controls-contracts");
  const volume = scope.getByRole("slider", { name: "Contract volume" });
  await expect(scope.getByRole("slider")).toHaveCount(3);
  await volume.focus();
  await volume.press("ArrowUp");
  await expect(volume).toHaveAttribute("aria-valuenow", "21");
  await expect(volume).toHaveAttribute("aria-valuetext", "21 percent");
  await expect(scope.locator('[data-slot="slider"]').first()).toHaveClass(
    /slider-changed/,
  );
  const minimum = scope.getByRole("slider", { name: "Contract minimum" });
  await minimum.focus();
  await minimum.press("ArrowRight");
  await expect(
    scope.getByRole("status", { name: "Contract range" }),
  ).toHaveText("11,80");
  await expect(minimum).toHaveAttribute("aria-valuetext", "11 dollars");
  await expect(
    scope.getByRole("meter", { name: "Capacity used" }),
  ).toHaveAttribute("aria-valuenow", "7");
  await expect(
    scope.getByRole("meter", { name: "Capacity used" }),
  ).toHaveAttribute("aria-valuemax", "20");
  await expect(
    scope.getByRole("progressbar", { name: "Loading records" }),
  ).not.toHaveAttribute("aria-valuenow");
  const consent = scope.getByRole("checkbox", { name: "Contract consent" });
  await consent.focus();
  await consent.press("Space");
  await expect(consent).toHaveAttribute("aria-checked", "true");
  await expect(consent).toHaveClass(/contract-checked/);
  const feature = scope.getByRole("switch", { name: "Contract feature" });
  await feature.focus();
  await feature.press("Space");
  await expect(feature).toHaveAttribute("aria-checked", "true");
  await expect(feature).toHaveClass(/contract-on/);
  await scope.getByRole("radio", { name: "Contract email" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    scope.getByRole("radio", { name: "Contract paper" }),
  ).toBeFocused();
  await expect(
    scope.getByRole("radio", { name: "Contract paper" }),
  ).toHaveAttribute("aria-checked", "true");
  const radioAlignment = await scope
    .getByRole("radio", { name: "Contract paper" })
    .evaluate((element) => {
      const root = element.getBoundingClientRect();
      const indicator = element.querySelector(
        "[data-slot=radio-group-indicator] svg",
      );
      if (!indicator)
        throw new Error("Selected radio must render its indicator");
      const dot = indicator.getBoundingClientRect();
      return {
        x: Math.abs(root.x + root.width / 2 - dot.x - dot.width / 2),
        y: Math.abs(root.y + root.height / 2 - dot.y - dot.height / 2),
      };
    });
  expect(radioAlignment.x).toBeLessThanOrEqual(1);
  expect(radioAlignment.y).toBeLessThanOrEqual(1);
});

test("TanStack fields preserve relationships, numeric semantics and pending submit focus", async ({
  page,
}, testInfo) => {
  const scope = page.locator("#controls-contracts");
  const name = scope.getByRole("textbox", {
    name: "Contract name",
    exact: true,
  });
  const amount = scope.getByRole("textbox", {
    name: "Contract amount",
    exact: true,
  });
  await name.focus();
  await amount.focus();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAccessibleDescription(
    /Visible to donors.*Contract name is required/,
  );
  const errorId = await name.getAttribute("aria-errormessage");
  expect(errorId).toBeTruthy();
  await expect(page.locator(`[id="${errorId}"]`)).toHaveText(
    "Contract name is required",
  );
  await name.fill("Conrad");
  await amount.focus();
  await expect(name).toHaveAttribute("aria-invalid", "false");
  await amount.fill("");
  await name.focus();
  await expect(amount).toHaveValue("5");
  await amount.fill("12.1234567");
  await name.focus();
  await expect(amount).toHaveValue("12.1234567");
  await amount.fill("7.125");
  await name.focus();
  const optional = scope.getByRole("textbox", {
    name: "Contract optional amount",
  });
  await optional.fill("");
  await name.focus();
  await expect(optional).toHaveValue("");
  await scope
    .getByRole("textbox", { name: "Contract notes" })
    .fill("Modern Base UI");
  const plan = scope.getByRole("combobox", { name: "Contract plan" });
  await expect(plan).toHaveText(/Premium plan/);
  await scope.getByText("Contract plan", { exact: true }).click();
  await expect(plan).toBeFocused();
  await expect(plan).toHaveAttribute("aria-expanded", "false");
  await plan.press("Space");
  await page.getByRole("option", { name: "Basic plan" }).click();
  await expect(plan).toHaveText(/Basic plan/);
  await expect(plan).toBeFocused();
  await scope.getByRole("switch", { name: "Contract alerts" }).click();
  await expect(
    scope.getByRole("textbox", { name: "Contract locked field" }),
  ).toBeDisabled();
  const save = scope.getByRole("button", {
    name: "Save contract",
    exact: true,
  });
  await save.click();
  const pending = scope.getByRole("button", {
    name: "Saving contract",
    exact: true,
  });
  await expect(pending).toBeFocused();
  await expect(pending).toHaveAttribute("aria-disabled", "true");
  await expect(pending).not.toHaveAttribute("disabled");
  await scope.getByRole("button", { name: "Complete fixture save" }).click();
  await expect(
    scope.getByRole("status", { name: "Saved contract" }),
  ).toContainText('"amount":7.125');
  await expect(
    scope.getByRole("status", { name: "Saved contract" }),
  ).toContainText('"plan":"b"');
  await expect(
    scope.getByRole("status", { name: "Saved contract" }),
  ).toContainText('"alerts":true');
  const axe = await new AxeBuilder({ page })
    .include("#controls-contracts")
    .analyze();
  expect(axe.violations).toEqual([]);
  const duplicateIds = await scope.locator("[id]").evaluateAll((nodes) => {
    const seen = new Set<string>();
    return nodes
      .map((node) => node.id)
      .filter((id) => seen.has(id) || !seen.add(id));
  });
  expect(duplicateIds).toEqual([]);
  expect(
    await scope.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(false);
  await scope.screenshot({ path: testInfo.outputPath("controls-form.png") });
});
