import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test("scroll content growth updates overflow and keyboard scrolling", async ({
  page,
}) => {
  const viewport = page.locator('[data-slot="scroll-area-viewport"]').first();
  await expect(viewport).not.toHaveAttribute("data-has-overflow-y", "");
  await page.getByRole("button", { name: "Toggle rows" }).click();
  await expect(viewport).toHaveAttribute("data-has-overflow-y", "");
  await viewport.focus();
  await viewport.press("End");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Toggle rows" }).click();
  await expect(viewport).not.toHaveAttribute("data-has-overflow-y", "");
});

test("menu families preserve labelled groups and keyboard navigation", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Actions", exact: true });
  await trigger.click();
  await expect(
    page
      .getByRole("group", { name: "Record actions" })
      .getByRole("menuitem", { name: "Edit record" }),
  ).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();

  await page
    .getByRole("menubar")
    .getByRole("menuitem", { name: "File", exact: true })
    .click();
  await expect(page.getByRole("menuitem", { name: "New file" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("menuitem", { name: "Undo edit" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page
    .getByText("Right click this area", { exact: true })
    .click({ button: "right" });
  await expect(
    page
      .getByRole("group", { name: "Context actions" })
      .getByRole("menuitem", { name: "Copy record", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Copy record alternative" }),
  ).toBeVisible();

  const navigation = page.getByRole("button", {
    name: "Resources",
    exact: true,
  });
  await navigation.click();
  await expect(
    page.getByRole("link", { name: "Documentation", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeFocused();
});

test("disclosures and manually activated tabs retain state and names", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Details", exact: true }).click();
  await expect(page.locator(".content-open")).toContainText(
    "Accordion details",
  );
  const disclosure = page.getByRole("button", {
    name: "Toggle disclosure",
    exact: true,
  });
  await disclosure.click();
  await expect(
    page.getByText("Disclosure content", { exact: true }),
  ).toBeVisible();
  await disclosure.click();
  await expect(
    page.getByText("Disclosure content", { exact: true }),
  ).toBeHidden();
  await page.getByRole("tab", { name: "First", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Second", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("tab", { name: "Second", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tabpanel", { name: "Second", exact: true }),
  ).toContainText("Second content");
});

test("modal families expose descriptions and return focus", async ({
  page,
}) => {
  for (const [triggerName, role, name] of [
    ["Open compact dialog", "dialog", "Compact dialog"],
    ["Open alert dialog", "alertdialog", "Important alert"],
    ["Open side sheet", "dialog", "Side sheet"],
  ] as const) {
    const trigger = page.getByRole("button", {
      name: triggerName,
      exact: true,
    });
    await trigger.click();
    const modal = page.getByRole(role, { name, exact: true });
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAccessibleDescription(/.+/);
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test("nested portals stay above isolated app content and respect reduced motion", async ({
  page,
}, testInfo) => {
  await page
    .getByRole("button", { name: "Open compact dialog", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Compact dialog",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await page.getByTestId("high-z-app-child").evaluate((element) => {
    element.style.display = "block";
  });
  const modal = await dialog.evaluate((element) => {
    const css = getComputedStyle(element);
    const root = document.querySelector(".app-root");
    return {
      name: css.animationName,
      duration: css.animationDuration,
      outsideRoot: !element.closest(".app-root"),
      isolation: root && getComputedStyle(root).isolation,
    };
  });
  expect(modal).toMatchObject({
    name: "enter",
    outsideRoot: true,
    isolation: "isolate",
  });
  const reduced =
    testInfo.project.use.contextOptions?.reducedMotion === "reduce";
  expect(Number.parseFloat(modal.duration)).toBeCloseTo(
    reduced ? 0.00001 : 0.22,
    5,
  );

  await page.getByRole("button", { name: "Open nested popover" }).click();
  const popover = page.getByRole("dialog", { name: "Nested help" });
  await expect(popover).toBeVisible();
  const nested = await popover.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const top = document.elementFromPoint(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
    );
    return {
      aboveApp: element === top || element.contains(top),
      outsideRoot: !element.closest(".app-root"),
      duration: getComputedStyle(element).animationDuration,
    };
  });
  expect(nested).toMatchObject({ aboveApp: true, outsideRoot: true });
  expect(Number.parseFloat(nested.duration)).toBeCloseTo(
    reduced ? 0.00001 : 0.22,
    5,
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open nested popover" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open compact dialog", exact: true }),
  ).toBeFocused();
});

test("drawer snap positioning and touch movement follow Base UI state", async ({
  page,
  context,
}, testInfo) => {
  await page
    .getByRole("button", { name: "Open snap drawer", exact: true })
    .click();
  const snap = page.getByRole("dialog", { name: "Snap drawer", exact: true });
  await expect(snap).toBeVisible();
  await expect
    .poll(() =>
      snap.evaluate((element) =>
        Number.parseFloat(
          getComputedStyle(element).getPropertyValue(
            "--drawer-snap-point-offset",
          ),
        ),
      ),
    )
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      snap.evaluate((element) => {
        const css = getComputedStyle(element);
        return Math.abs(
          new DOMMatrixReadOnly(css.transform).m42 -
            Number.parseFloat(
              css.getPropertyValue("--drawer-snap-point-offset"),
            ),
        );
      }),
    )
    .toBeLessThan(0.5);
  await page.screenshot({ path: testInfo.outputPath("snap-drawer.png") });
  await page.keyboard.press("Escape");
  await expect(snap).toBeHidden();

  await page.getByRole("button", { name: "Open drawer", exact: true }).click();
  const popup = page.getByRole("dialog", {
    name: "Gesture drawer",
    exact: true,
  });
  await expect(popup).toBeVisible();
  const duration = await popup.evaluate(
    (element) => getComputedStyle(element).transitionDuration,
  );
  expect(Number.parseFloat(duration)).toBeCloseTo(
    testInfo.project.use.contextOptions?.reducedMotion === "reduce"
      ? 0.00001
      : 0.32,
    5,
  );
  const bounds = await popup.boundingBox();
  if (!bounds) throw new Error("Open drawer must have a bounding box");
  const client = await context.newCDPSession(page);
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + 20;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  // Multiple moves cross the browser's touch slop before the actual swipe distance.
  for (const delta of [15, 30, 60, 100]) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y + delta }],
    });
  }
  await expect
    .poll(() =>
      popup.evaluate(
        (element) =>
          new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
      ),
    )
    .toBeGreaterThan(20);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await client.detach();
});

test("short documents still receive a viewport-height backdrop", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open drawer", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Gesture drawer" }),
  ).toBeVisible();
  await page.locator("body").evaluate((element) => {
    element.style.height = "100px";
  });
  const height = await page
    .locator('[data-slot="drawer-overlay"]')
    .evaluate((element) => element.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(page.viewportSize()?.height ?? 844);
});

test("visual hints keep independently accessible triggers and image semantics", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Helpful action", exact: true })
    .focus();
  await expect(
    page
      .locator('[data-slot="tooltip-content"]')
      .filter({ hasText: "Helpful action" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("link", { name: "Preview destination", exact: true })
    .hover();
  await expect(page.locator('[data-slot="hover-card-content"]')).toContainText(
    "Supplementary preview details",
  );
  await expect(page.locator("#preview-destination")).toContainText(
    "Supplementary preview details",
  );
  await expect(
    page.locator('[data-slot="avatar-image"]').first(),
  ).toHaveAttribute("alt", "");
  await expect(
    page.getByRole("separator", { name: "Section separator" }),
  ).toHaveAttribute("aria-orientation", "horizontal");
});

test("resting fixture has no WCAG A or AA violations", async ({
  page,
}, testInfo) => {
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("compliance-fixture.png"),
    fullPage: true,
  });
});
