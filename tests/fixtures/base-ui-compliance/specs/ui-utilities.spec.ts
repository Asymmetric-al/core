import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test.use({
  fixture: {
    path: "/ui-utilities.html",
    heading: "Shared UI upgrade contracts",
  },
  // Trusted offline fixture only: exercise actual WebGL2 in headless Chromium.
  launchOptions: { args: ["--enable-unsafe-swiftshader"] },
});

test("the real map renders worker-parsed GeoJSON and retains keyboard controls and theme", async ({
  page,
}) => {
  const observation = page.getByLabel("Map observation", { exact: true });
  await expect
    .poll(async () => JSON.parse((await observation.textContent())!).features)
    .toBeGreaterThan(0);
  expect(
    page
      .workers()
      .some(
        (worker) =>
          new URL(worker.url()).pathname === "/maplibre/maplibre-gl-worker.mjs",
      ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Sample ministry", exact: true }),
  ).toBeVisible();
  const zoom = JSON.parse((await observation.textContent())!).zoom;
  const zoomIn = page.getByRole("button", { name: "Zoom In", exact: true });
  await zoomIn.focus();
  await zoomIn.press("Enter");
  await expect(zoomIn).toBeFocused();
  await expect
    .poll(async () => JSON.parse((await observation.textContent())!).zoom)
    .toBeGreaterThan(zoom);
  const expectedColors: Record<string, string> = {
    "Core offline light": "#2563eb",
    "Core offline dark": "#f97316",
  };
  const style = JSON.parse((await observation.textContent())!).style;
  await expect
    .poll(
      async () => JSON.parse((await observation.textContent())!).circleColor,
    )
    .toBe(expectedColors[style]);
  await page
    .getByRole("button", { name: "Toggle map theme", exact: true })
    .click();
  await expect
    .poll(async () => JSON.parse((await observation.textContent())!).style)
    .not.toBe(style);
  const toggledStyle = JSON.parse((await observation.textContent())!).style;
  await expect
    .poll(
      async () => JSON.parse((await observation.textContent())!).circleColor,
    )
    .toBe(expectedColors[toggledStyle]);
  await expect
    .poll(async () => JSON.parse((await observation.textContent())!).features)
    .toBeGreaterThan(0);
});

test("shared panels preserve keyboard resizing, bounds and focus", async ({
  page,
}) => {
  const separator = page.getByRole("separator", {
    name: "Resize workspace",
    exact: true,
  });
  const primary = page.locator("#partner-list");
  const before = (await primary.boundingBox())!.width;
  await separator.focus();
  await separator.press("ArrowRight");
  await expect(separator).toBeFocused();
  await expect
    .poll(async () => (await primary.boundingBox())!.width)
    .toBeGreaterThan(before);
  await separator.press("End");
  const group = page.locator('[data-slot="resizable-panel-group"]');
  await expect
    .poll(
      async () =>
        (await primary.boundingBox())!.width /
        (await group.boundingBox())!.width,
    )
    .toBeLessThanOrEqual(0.81);
  await expect
    .poll(
      async () =>
        (await primary.boundingBox())!.width /
        (await group.boundingBox())!.width,
    )
    .toBeGreaterThanOrEqual(0.79);
  await separator.press("Home");
  await expect
    .poll(
      async () =>
        (await primary.boundingBox())!.width /
        (await group.boundingBox())!.width,
    )
    .toBeGreaterThanOrEqual(0.19);
  await expect
    .poll(
      async () =>
        (await primary.boundingBox())!.width /
        (await group.boundingBox())!.width,
    )
    .toBeLessThanOrEqual(0.21);
  await expect(separator).toBeFocused();
});

test("rapid partner filters settle in the URL and survive history navigation", async ({
  page,
}) => {
  await page.goto("/ui-utilities.html?retained=1");
  const search = page.getByRole("textbox", {
    name: "Search partners",
    exact: true,
  });
  await search.fill("Partner A");
  await search.fill("Partner B");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("Partner B");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("page"))
    .toBe("2");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("perPage"))
    .toBe("25");
  expect(new URL(page.url()).searchParams.get("retained")).toBe("1");
  await page
    .getByRole("button", { name: "Sort descending", exact: true })
    .click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("sort"))
    .toBe("-name");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("page"))
    .toBeNull();
  await page.getByRole("button", { name: "Hide email", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("cols"))
    .toBe("email");
  await page.goBack();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("cols"))
    .toBeNull();
  await expect(search).toHaveValue("Partner B");
  await page.goForward();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("cols"))
    .toBe("email");
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await expect.poll(() => new URL(page.url()).search).toBe("?retained=1");
  await expect(search).toHaveValue("");
});

test("shared transitions settle under reduced motion and semantic gradients survive class merging", async ({
  page,
}, testInfo) => {
  await page
    .getByRole("button", { name: "Toggle content", exact: true })
    .click();
  const content = page.getByText("Preserved transition content", {
    exact: true,
  });
  await expect(content).toBeVisible();
  await expect(content).toHaveCSS("opacity", "1", {
    timeout:
      testInfo.project.use.contextOptions?.reducedMotion === "reduce"
        ? 150
        : 2000,
  });
  await expect(content).toHaveCSS("transform", "none");
  const gradient = page.getByLabel("Merged background", { exact: true });
  await expect(gradient).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  expect(
    await gradient.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    ),
  ).not.toBe("none");
});

test("upgraded shared controls meet accessibility rules", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: "Sample ministry", exact: true }),
  ).toBeVisible();
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(report.violations).toEqual([]);
});
