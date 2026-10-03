import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./test";

test("shared names, field relationships, pending feedback and Base UI cropper labels work", async ({
  page,
}) => {
  const region = page.getByRole("region", {
    name: "Shadscan accessibility contracts",
  });
  await region
    .getByRole("textbox", { name: "Search", exact: true })
    .fill("Conrad");
  const field = region.getByRole("textbox", { name: "Fixture first name" });
  await field.fill("invalid");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(region.getByRole("alert")).toHaveText(
    "Choose a valid first name",
  );
  await field.fill("Conrad");
  await region.getByRole("button", { name: "Demo Access" }).click();
  await expect(region.getByRole("alert")).toHaveText("Demo access unavailable");
  await region.getByRole("button", { name: "Fail fixture chart" }).click();
  await expect(
    region.getByRole("alert").filter({ hasText: "Giving data unavailable" }),
  ).toBeVisible();
  const archive = page.getByRole("button", { name: "Archive selected" });
  await archive.focus();
  await page.keyboard.press("Enter");
  await expect(
    region.getByRole("status", { name: "Archived rows" }),
  ).toHaveText("1");
  expect(
    (
      await new AxeBuilder({ page })
        .include('[aria-label="Shadscan accessibility contracts"]')
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  await region.getByRole("button", { name: "Open fixture comments" }).click();
  const comments = page.getByRole("dialog", { name: "Comments" });
  await comments.getByRole("textbox", { name: "Comment text" }).fill("Thanks");
  await comments.getByRole("button", { name: "Send comment" }).click();
  await expect(comments.getByRole("status")).toHaveText("Sending comment…");
  await expect(
    comments.getByRole("button", { name: "Send comment" }),
  ).toBeDisabled();
  await page.evaluate(() =>
    document.dispatchEvent(new Event("fixture-comment-accept")),
  );
  await expect(comments.getByRole("status")).toHaveText("");
  await page.keyboard.press("Escape");
  await expect(comments).toBeHidden();
  await region.getByRole("button", { name: "Open labeled cropper" }).click();
  const cropper = page.getByRole("dialog");
  const zoom = cropper.getByRole("slider", { name: "Zoom" });
  const rotation = cropper.getByRole("slider", { name: "Rotation" });
  await zoom.focus();
  await page.keyboard.press("ArrowRight");
  await expect(zoom).toHaveAttribute("aria-valuenow", "1.1");
  await rotation.focus();
  await page.keyboard.press("ArrowRight");
  await expect(rotation).toHaveAttribute("aria-valuenow", "1");
  expect(
    (
      await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(cropper).toBeHidden();
});

test("mobile public navigation traps focus, dismisses on Escape and restores its trigger", async ({
  page,
}, testInfo) => {
  test.skip(
    (testInfo.project.use.viewport?.width ?? 1280) >= 768,
    "Mobile navigation is hidden at desktop widths",
  );
  await page.getByRole("button", { name: "Show public navigation" }).click();
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Main navigation" });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
});

test("map marker keyboard activation opens a named modal with semantic giving links", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Show map" }).click();
  const trigger = page.getByRole("button", { name: "View River Ministry" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "River Ministry" });
  await expect(dialog).toBeVisible();
  // The marker keeps its 44px hit target; the decorative pulse belongs only to
  // the 8px visual and cannot steal neighboring marker pointer events.
  const modalBackgroundMarker = page.getByRole("button", {
    name: "View River Ministry",
    includeHidden: true,
  });
  expect(
    await modalBackgroundMarker.evaluate(
      (button) => getComputedStyle(button).minWidth,
    ),
  ).toBe("44px");
  const pulse = modalBackgroundMarker.locator(
    '[data-slot="location-marker-pulse"]',
  );
  expect(
    await pulse.evaluate((element) => getComputedStyle(element).width),
  ).toBe("8px");
  expect(
    await pulse.evaluate((element) => getComputedStyle(element).pointerEvents),
  ).toBe("none");
  await expect(pulse).toHaveAttribute("aria-hidden", "true");
  await expect(
    dialog.getByRole("link", { name: "Give to River Ministry" }),
  ).toHaveAttribute("href", /missionary_id=worker-1/);
  await expect(
    dialog.getByRole("link", { name: "View Profile" }).locator("button"),
  ).toHaveCount(0);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("modal mutation toast escapes the app isolation layer and stays above the backdrop", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open modal toast" }).click();
  const dialog = page.getByRole("dialog", { name: "Fixture toast layer" });
  await dialog.getByRole("button", { name: "Save in modal" }).click();
  const toast = page
    .locator("[data-sonner-toast]")
    .filter({ hasText: "Saved in modal" });
  await expect(toast).toBeVisible();
  await expect(page.locator(".app-root [data-sonner-toaster]")).toHaveCount(0);
  await expect
    .poll(() =>
      toast.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const painted = document.elementFromPoint(
          box.x + box.width / 2,
          box.y + box.height / 2,
        );
        return painted?.closest("[data-sonner-toast]") === element;
      }),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("map mobile Sheet releases its backdrop and focus trap on desktop resize and can reopen on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Show map" }).click();
  const marker = page.getByRole("button", { name: "View River Ministry" });
  await marker.focus();
  await marker.press("Enter");
  const sheet = page.locator('[data-slot="sheet-content"]');
  await expect(sheet).toBeVisible();
  await page.setViewportSize({ width: 1023, height: 844 });
  await expect(sheet).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 844 });
  await expect(sheet).toHaveCount(0);
  await expect(page.locator('[data-slot="sheet-overlay"]')).toHaveCount(0);
  await expect(marker).toBeFocused();
  expect(
    await marker.evaluate((element) =>
      element.closest('[inert], [aria-hidden="true"]'),
    ),
  ).toBeNull();
  expect(
    await marker.evaluate((element) => getComputedStyle(element).minWidth),
  ).toBe("44px");
  const selectedLocation = page.getByRole("button", {
    name: "River Ministry",
    exact: true,
  });
  await expect(selectedLocation).toBeVisible();
  await marker.press("Enter");
  const desktopDialog = page.getByRole("dialog", { name: "River Ministry" });
  await expect(desktopDialog).toHaveAttribute("data-slot", "dialog-content");
  await expect(
    desktopDialog.getByRole("link", { name: "Give to River Ministry" }),
  ).toHaveAttribute("href", /missionary_id=worker-1/);
  await page.keyboard.press("Escape");
  await expect(desktopDialog).toHaveCount(0);
  await expect(marker).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await marker.focus();
  await marker.press("Enter");
  await expect(sheet).toBeVisible();
  await expect(
    sheet.getByRole("link", { name: "Give to River Ministry" }),
  ).toHaveAttribute("href", /missionary_id=worker-1/);
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(marker).toBeFocused();
});
