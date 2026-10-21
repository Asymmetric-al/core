import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test.use({
  // DOM trace snapshots inject scripts into every frame; retain action traces without
  // injecting into the deliberately script-disabled static print preview.
  trace: {
    mode: "retain-on-failure",
    snapshots: false,
    screenshots: true,
    sources: true,
  },
  fixture: {
    path: "/modernization.html",
    heading: "Modernization control contracts",
    themeAfterNavigation: true,
  },
});

test("native PDF source supports long edits, mobile text and bounded vertical resizing", async ({
  page,
}, testInfo) => {
  const source = page.getByRole("textbox", { name: "PDF template source" });
  const preview = page.getByTitle("Native PDF authoring preview");
  const editor = page.getByRole("region", { name: "Native PDF editor" });
  const longJson = JSON.stringify(
    {
      version: 1,
      blocks: Array.from({ length: 150 }, (_, i) => ({
        text: `Line ${i} with preserved document wording`,
      })),
    },
    null,
    2,
  );
  await source.fill(longJson);
  await expect(source).toHaveValue(longJson);
  await expect(page.getByRole("status", { name: "Source length" })).toHaveText(
    String(longJson.length),
  );
  const style = await source.evaluate((element) => ({
    font: parseFloat(getComputedStyle(element).fontSize),
    resize: getComputedStyle(element).resize,
    scrolls: element.scrollHeight > element.clientHeight,
  }));
  if ((page.viewportSize()?.width ?? 0) < 768)
    expect(style.font).toBeGreaterThanOrEqual(16);
  expect(style.resize).toBe("vertical");
  expect(style.scrolls).toBe(true);
  const previewBefore = await preview.boundingBox();
  const sourceBefore = await source.boundingBox();
  expect(sourceBefore).toBeTruthy();
  expect(previewBefore).toBeTruthy();
  // Exercise the native handle without moving into the deliberately script-disabled
  // preview frame below the mobile editor. Shrink within that pane; desktop grows.
  await page.mouse.move(
    sourceBefore!.x + sourceBefore!.width - 4,
    sourceBefore!.y + sourceBefore!.height - 4,
  );
  await page.mouse.down();
  const mobile = (page.viewportSize()?.width ?? 0) < 1024;
  await page.mouse.move(
    sourceBefore!.x + sourceBefore!.width - 4,
    sourceBefore!.y + sourceBefore!.height + (mobile ? -48 : 72),
    { steps: 8 },
  );
  await page.mouse.up();
  const resizedHeight = expect.poll(
    async () => (await source.boundingBox())!.height,
  );
  if (mobile) await resizedHeight.toBeLessThan(sourceBefore!.height - 30);
  else await resizedHeight.toBeGreaterThan(sourceBefore!.height + 30);
  const previewAfter = (await preview.boundingBox())!;
  expect(
    Math.abs(previewAfter.height - previewBefore!.height),
  ).toBeLessThanOrEqual(1);
  expect(Math.abs(previewAfter.y - previewBefore!.y)).toBeLessThanOrEqual(1);
  await expect(source).toHaveValue(longJson);
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByRole("status", { name: "Preview count" })).toHaveText(
    "1",
  );
  const bounds = await editor.boundingBox();
  expect(previewAfter.y + previewAfter.height).toBeLessThanOrEqual(
    bounds!.y + bounds!.height + 1,
  );
  expect(
    (
      await new AxeBuilder({ page })
        .include('[aria-label="Native PDF editor"]')
        .exclude("iframe")
        // Audit editor chrome here. Generated print documents have their own checks;
        // axe cannot execute inside this intentionally script-disabled iframe.
        .options({ iframes: false })
        .analyze()
    ).violations,
  ).toEqual([]);
  await editor.screenshot({
    path: testInfo.outputPath("native-source-resize.png"),
  });
});

test("task details have native keyboard activation and child actions remain isolated", async ({
  page,
}) => {
  const table = page.getByRole("table", { name: "Tasks" });
  const open = table.getByRole("button", { name: "Call partner", exact: true });
  await expect(open).toBeVisible();
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status", { name: "Task open count" }),
  ).toHaveText("1");
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("status", { name: "Task open count" }),
  ).toHaveText("2");
  await table.getByRole("checkbox", { name: "Select Call partner" }).click();
  await expect(
    page.getByRole("status", { name: "Task selection count" }),
  ).toHaveText("1");
  await table.getByRole("button", { name: "Mark as complete" }).click();
  await expect(
    page.getByRole("status", { name: "Task status count" }),
  ).toHaveText("1");
  await table.getByRole("button", { name: "Open actions" }).click();
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await expect(
    page.getByRole("status", { name: "Task edit count" }),
  ).toHaveText("1");
  await expect(
    page.getByRole("status", { name: "Task open count" }),
  ).toHaveText("2");
  await table.getByText("not started", { exact: true }).click();
  await expect(
    page.getByRole("status", { name: "Task open count" }),
  ).toHaveText("3");
  await expect(table.getByRole("row")).toHaveCount(2);
});
