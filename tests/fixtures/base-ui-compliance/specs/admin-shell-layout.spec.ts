import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1280]) {
  test(`Eve trigger preserves its touch target and keyboard focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/admin-shell.html");
    const trigger = page.getByRole("button", { name: "Open Eve assistant" });
    const bounds = (await trigger.boundingBox())!;
    expect(bounds.width).toBe(44);
    expect(bounds.height).toBe(44);
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("textbox", { name: "Message Eve" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}

test("long audit targets stay inside the card on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin-shell.html?surface=audit");
  const audit = page.locator("#eve-audit");
  await audit.locator("summary").click();
  const target = audit.getByText(`https://example.test/${"a".repeat(200)}`);
  await expect(target).toBeVisible();
  expect(
    await target.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const card = element.closest("#eve-audit")!.getBoundingClientRect();
      return [...range.getClientRects()].every(
        (rect) => rect.left >= card.left && rect.right <= card.right,
      );
    }),
  ).toBe(true);
});

for (const busy of [false, true]) {
  test(`Eve composer remains reachable on a short viewport (${busy ? "streaming" : "idle"})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 240 });
    await page.goto(`/admin-shell.html${busy ? "?busy=1" : ""}`);
    await page.getByRole("button", { name: "Open Eve assistant" }).click();
    const composer = page.getByRole("textbox", { name: "Message Eve" });
    const control = page.getByRole("button", {
      name: busy ? "Detach" : "Send",
      exact: true,
    });
    await page.getByRole("heading", { name: "Eve", exact: true }).hover();
    await page.mouse.move(200, 120);
    await page.mouse.wheel(0, 1000);
    await expect(control).toBeInViewport({ ratio: 1 });
    if (!busy) {
      await composer.fill("Review this page");
      await control.click();
      await expect(composer).toHaveValue("");
    } else {
      await control.click();
    }
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open Eve assistant" }),
    ).toBeFocused();
  });
}

for (const width of [390, 844]) {
  for (const busy of [false, true]) {
    test(`Eve transcript remains readable on a short viewport at ${width}px (${busy ? "streaming" : "idle"})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 200 });
      await page.goto(`/admin-shell.html?messages=1${busy ? "&busy=1" : ""}`);
      await page.getByRole("button", { name: "Open Eve assistant" }).click();
      const transcript = page.locator('[data-slot="scroll-area-viewport"]');
      await expect
        .poll(async () => (await transcript.boundingBox())?.height ?? 0)
        .toBeGreaterThan(0);
      await page.getByRole("heading", { name: "Eve", exact: true }).hover();
      await page.mouse.wheel(0, 100);
      await expect(
        page.getByText("Fixture assistant transcript remains readable."),
      ).toBeInViewport({ ratio: 1 });

      const panelBody = page.getByRole("dialog").locator("form").locator("..");
      await transcript.hover();
      const outerScrollTop = await panelBody.evaluate((body) => body.scrollTop);
      const transcriptScrollTop = await transcript.evaluate(
        (viewport) => viewport.scrollTop,
      );
      await page.mouse.wheel(0, 100);
      await expect
        .poll(() => transcript.evaluate((viewport) => viewport.scrollTop))
        .toBeGreaterThan(transcriptScrollTop);
      expect(await panelBody.evaluate((body) => body.scrollTop)).toBe(
        outerScrollTop,
      );
    });
  }
}

test("quick actions retain their full-width independent click targets", async ({
  page,
}) => {
  await page.goto("/admin-shell.html?surface=tile");
  const first = page.getByRole("link", { name: "First action", exact: true });
  const second = page.getByRole("link", { name: "Second action", exact: true });
  const firstBox = (await first.boundingBox())!;
  const secondBox = (await second.boundingBox())!;
  expect(firstBox.width).toBeGreaterThan(250);
  expect(secondBox.y).toBeGreaterThan(firstBox.y);
  await first.click({
    position: { x: firstBox.width - 8, y: firstBox.height / 2 },
  });
  await expect(page).toHaveURL(/#first$/);
});

test("standalone Studio shell fills a short directory viewport", async ({
  page,
}) => {
  await page.goto("/admin-shell.html?surface=studio");
  const shell = page.getByTestId("web-studio-native-shell");
  await expect(
    shell.getByRole("heading", { name: "Missionary directory" }),
  ).toBeVisible();
  expect((await shell.boundingBox())!.height).toBeGreaterThanOrEqual(
    page.viewportSize()!.height,
  );
});
