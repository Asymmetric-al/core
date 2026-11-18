import { expect, test, type Page } from "@playwright/test";

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
    const transcript = page.locator('[data-slot="scroll-area-viewport"]');
    // Wheel over the panel header, which belongs to the panel body. A fixed
    // point can land on the nested transcript, which rightly keeps the wheel.
    await page.getByRole("heading", { name: "Eve", exact: true }).hover();
    await expect(control).not.toBeInViewport();
    const transcriptScrollTop = await transcript.evaluate(
      (viewport) => viewport.scrollTop,
    );
    await page.mouse.wheel(0, 1000);
    await expect(control).toBeInViewport({ ratio: 1 });
    expect(await transcript.evaluate((viewport) => viewport.scrollTop)).toBe(
      transcriptScrollTop,
    );
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

// The fixture's agent holds each status of a sent turn until the spec moves it
// on, so every check below runs in a known status: submitted, streaming, ready.
type EveFixtureWindow = Window & { eveFixture: { advance: () => void } };

async function advanceEveTurn(page: Page) {
  await page.evaluate(() =>
    (window as unknown as EveFixtureWindow).eveFixture.advance(),
  );
}

for (const sendWith of ["ControlOrMeta+Enter", "the Send button"] as const) {
  test(`Eve composer keeps focus while a reply streams and after it, sent with ${sendWith}`, async ({
    page,
  }) => {
    await page.goto("/admin-shell.html");
    await page.getByRole("button", { name: "Open Eve assistant" }).click();
    const composer = page.getByRole("textbox", { name: "Message Eve" });
    const conversation = page
      .getByRole("dialog")
      .locator('[aria-live="polite"][aria-busy]');
    const send = page.getByRole("button", { name: "Send", exact: true });
    const detach = page.getByRole("button", { name: "Detach", exact: true });
    await composer.click();
    await page.keyboard.type("Review this page");
    await expect(composer).toHaveValue("Review this page");
    if (sendWith === "ControlOrMeta+Enter") {
      await expect(send).toHaveAttribute("aria-keyshortcuts", /Enter/);
      await page.keyboard.press("ControlOrMeta+Enter");
    } else {
      await send.click();
    }

    // Submitted: the turn is sent and no reply has arrived yet.
    await expect(
      conversation.getByText("Review this page", { exact: true }),
    ).toBeVisible();
    await expect(conversation).toHaveAttribute("aria-busy", "true");
    await expect(detach).toBeVisible();
    await expect(composer).toHaveValue("");
    await expect(composer).not.toBeEditable();
    await expect(composer).toBeFocused();

    // Streaming: part of the reply has arrived.
    await advanceEveTurn(page);
    await expect(
      conversation.getByText("Fixture reply is streaming", { exact: true }),
    ).toBeVisible();
    await expect(conversation).toHaveAttribute("aria-busy", "true");
    await expect(detach).toBeVisible();
    await expect(composer).not.toBeEditable();
    await expect(composer).toBeFocused();

    // Ready: the reply is complete and the composer takes the next message.
    await advanceEveTurn(page);
    await expect(
      conversation.getByText(
        "Fixture reply is streaming. Fixture reply finished.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(conversation).toHaveAttribute("aria-busy", "false");
    await expect(detach).toHaveCount(0);
    await expect(send).toBeDisabled();
    await expect(composer).toBeEditable();
    await expect(composer).toBeFocused();
    await page.keyboard.type("Next question");
    await expect(composer).toHaveValue("Next question");
    await expect(send).toBeEnabled();
  });
}

test("Shift+? over the Eve sheet lists its send key and closes back into the sheet", async ({
  page,
}) => {
  await page.goto("/admin-shell.html");
  await page.getByRole("button", { name: "Open Eve assistant" }).click();
  const composer = page.getByRole("textbox", { name: "Message Eve" });
  const send = page.getByRole("button", { name: "Send", exact: true });
  const help = page.getByRole("dialog", { name: "Keyboard shortcuts" });

  // In the composer, ? is typed.
  await composer.click();
  await page.keyboard.press("Shift+?");
  await expect(composer).toHaveValue("?");
  await expect(help).toHaveCount(0);

  // From Send, inside the composer's form, the help opens over the sheet
  // and lists the send key that works there.
  await send.focus();
  await page.keyboard.press("Shift+?");
  await expect(help).toBeVisible();
  const rows = await help
    .locator("li")
    .evaluateAll((items) =>
      items.map((item) => item.firstElementChild?.textContent?.trim() ?? ""),
    );
  expect(rows.sort()).toEqual([
    "Send message to Eve",
    "Show keyboard shortcuts",
  ]);

  // Escape closes only the help; the sheet stays, with focus on Send.
  await page.keyboard.press("Escape");
  await expect(help).toBeHidden();
  await expect(composer).toBeVisible();
  await expect(send).toBeFocused();
  await expect(composer).toHaveValue("?");
});

test("Eve hands focus from Detach to the composer when the reply finishes", async ({
  page,
}) => {
  await page.goto("/admin-shell.html");
  await page.getByRole("button", { name: "Open Eve assistant" }).click();
  const composer = page.getByRole("textbox", { name: "Message Eve" });
  const send = page.getByRole("button", { name: "Send", exact: true });
  const detach = page.getByRole("button", { name: "Detach", exact: true });
  await composer.click();
  await page.keyboard.type("Review this page");
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(detach).toBeVisible();
  await expect(composer).toBeFocused();
  // Start a new session is disabled while busy, so Tab goes straight to Detach.
  await page.keyboard.press("Tab");
  await expect(detach).toBeFocused();
  await advanceEveTurn(page);
  await expect(
    page.getByText("Fixture reply is streaming", { exact: true }),
  ).toBeVisible();
  await expect(detach).toBeFocused();

  // Detach turns into the empty, disabled Send; focus must not fall to <body>.
  await advanceEveTurn(page);
  await expect(send).toBeDisabled();
  await expect(composer).toBeFocused();
  await page.keyboard.type("Next question");
  await expect(composer).toHaveValue("Next question");
});

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

test("quick actions keep a full-width row of independent click targets", async ({
  page,
}) => {
  await page.goto("/admin-shell.html?surface=tile");
  // The shortcuts take their own labelled row below the tile text.
  const row = page.getByRole("group", {
    name: "Fixture workspace shortcuts",
    exact: true,
  });
  const first = row.getByRole("link", { name: "First action", exact: true });
  const second = row.getByRole("link", { name: "Second action", exact: true });
  const rowBox = (await row.boundingBox())!;
  const purposeBox = (await page
    .getByText("Exercise independent action targets", { exact: true })
    .boundingBox())!;
  const firstBox = (await first.boundingBox())!;
  const secondBox = (await second.boundingBox())!;
  expect(rowBox.width).toBeGreaterThan(250);
  expect(rowBox.y).toBeGreaterThanOrEqual(purposeBox.y + purposeBox.height);
  for (const box of [firstBox, secondBox]) {
    expect(box.x).toBeGreaterThanOrEqual(rowBox.x);
    expect(box.x + box.width).toBeLessThanOrEqual(rowBox.x + rowBox.width);
  }
  // Neither target overlaps the other, so each edge belongs to one action.
  expect(
    firstBox.x + firstBox.width <= secondBox.x ||
      secondBox.y >= firstBox.y + firstBox.height,
  ).toBe(true);
  await first.click({
    position: { x: firstBox.width - 4, y: firstBox.height / 2 },
  });
  await expect(page).toHaveURL(/#first$/);
  await second.click({ position: { x: 4, y: secondBox.height / 2 } });
  await expect(page).toHaveURL(/#second$/);
});

test("standalone Studio shell fills a short directory viewport", async ({
  page,
}) => {
  await page.goto("/admin-shell.html?surface=studio");
  const shell = page.getByTestId("web-studio-native-shell");
  await expect(
    shell.getByRole("heading", { name: "Missionaries", exact: true }),
  ).toBeVisible();
  expect((await shell.boundingBox())!.height).toBeGreaterThanOrEqual(
    page.viewportSize()!.height,
  );
});
