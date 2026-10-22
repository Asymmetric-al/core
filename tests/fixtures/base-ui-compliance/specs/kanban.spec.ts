import AxeBuilder from "@axe-core/playwright";

import { test, expect } from "./test";

test.use({
  fixture: { path: "/kanban.html", heading: "Task board contracts" },
});

test("a pointer move to an empty Waiting column submits exactly one move", async ({
  page,
}) => {
  const source = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  const target = page.getByRole("region", { name: "Waiting", exact: true });
  const start = (await source.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    start.x + start.width / 2,
    start.y + start.height / 2 + 12,
    { steps: 3 },
  );
  const viewport = page.viewportSize()!;
  if ((await target.boundingBox())!.x > viewport.width - 50) {
    // Keep the pointer inside the viewport while the real board auto-scrolls.
    await page.mouse.move(viewport.width - 22, start.y + start.height / 2, {
      steps: 12,
    });
    await expect
      .poll(async () => (await target.boundingBox())!.x, { intervals: [16] })
      .toBeLessThan(viewport.width / 2 - 30);
    await page.mouse.move(viewport.width / 2, start.y + start.height / 2);
  }
  const end = (await target.boundingBox())!;
  await page.mouse.move(
    Math.max(80, Math.min(end.x + end.width / 2, viewport.width - 100)),
    end.y + 115,
    { steps: 16 },
  );
  await page.mouse.up();
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText('[{"taskId":"call","status":"waiting","index":0}]');
  await expect(
    page.getByRole("heading", { name: "Waiting 1", exact: true }),
  ).toBeVisible();
});

test("keyboard sorting keeps order, the final index and focus", async ({
  page,
}) => {
  const column = page.getByRole("region", { name: "To Do", exact: true });
  const handle = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await expect(column.getByRole("heading", { level: 4 })).toHaveText([
    "Send newsletter",
    "Call Anna",
  ]);
  await expect
    .poll(() =>
      page.locator('[data-drag-overlay="true"]').evaluate((element) =>
        getComputedStyle(element.closest("[data-dnd-overlay]")!)
          .transitionDuration.split(",")
          .every((duration) => parseFloat(duration) <= 0.00001),
      ),
    )
    .toBe(true);
  await page.keyboard.press("Space");
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText('[{"taskId":"call","status":"not_started","index":1}]');
  await expect(handle).toBeFocused();
});

test("Escape restores a cross-column keyboard preview without a mutation", async ({
  page,
}) => {
  const handle = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await expect(
    page
      .getByRole("region", { name: "In Progress", exact: true })
      .getByRole("heading", { level: 4 }),
  ).toContainText(["Call Anna"]);
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("heading", { name: "Waiting 1", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "To Do 2", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Waiting 0", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText("[]");
  await expect(handle).toBeFocused();
});

test("a thrown save restores order and focus, reports failure and allows retry", async ({
  page,
}) => {
  await page.goto("/kanban.html?moveResult=throw");
  const column = page.getByRole("region", { name: "To Do", exact: true });
  const handle = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await expect(column.getByRole("heading", { level: 4 })).toHaveText([
    "Send newsletter",
    "Call Anna",
  ]);
  await page.keyboard.press("Space");
  await expect(column.getByRole("heading", { level: 4 })).toHaveText([
    "Call Anna",
    "Send newsletter",
  ]);
  await expect(
    page
      .getByRole("region", { name: "Notifications alt+T", exact: true })
      .getByText("Task move failed. Please try again.", { exact: true }),
  ).toBeVisible();
  await expect(handle).toBeFocused();
  await page
    .getByRole("button", { name: "Show unrelated notice", exact: true })
    .click();
  await expect(
    page.getByText("Unrelated task update", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save normally", exact: true })
    .click();
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await expect(column.getByRole("heading", { level: 4 })).toHaveText([
    "Send newsletter",
    "Call Anna",
  ]);
  await page.keyboard.press("Space");
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText(
    '[{"taskId":"call","status":"not_started","index":1},{"taskId":"call","status":"not_started","index":1}]',
  );
  await expect(
    page.getByText("Task move failed. Please try again.", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Unrelated task update", { exact: true }),
  ).toHaveCount(1);
  await expect(handle).toBeFocused();
});

test("a declined save restores the controlled list and announces failure", async ({
  page,
}) => {
  await page.goto("/kanban.html?moveResult=false");
  const column = page.getByRole("region", { name: "To Do", exact: true });
  const handle = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await expect(column.getByRole("heading", { level: 4 })).toHaveText([
    "Send newsletter",
    "Call Anna",
  ]);
  await page.keyboard.press("Space");
  await expect(column.getByRole("heading", { level: 4 })).toHaveText([
    "Call Anna",
    "Send newsletter",
  ]);
  await expect(
    page
      .getByRole("region", { name: "Notifications alt+T", exact: true })
      .getByText("Task move failed. Please try again.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText('[{"taskId":"call","status":"not_started","index":1}]');
  await expect(handle).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(
    page
      .getByRole("region", { name: "Notifications alt+T", exact: true })
      .getByText("Task move failed. Please try again.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Task move failed. Please try again.", { exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText(
    '[{"taskId":"call","status":"not_started","index":1},{"taskId":"call","status":"not_started","index":1}]',
  );
  await expect(handle).toBeFocused();
});

test("a pending failure survives switching to List view without duplicate feedback or stuck dragging", async ({
  page,
}, testInfo) => {
  for (const outcome of ["false", "throw"] as const) {
    await page.goto(`/kanban.html?moveResult=pending-${outcome}`);
    const handle = page.getByRole("button", {
      name: "Move Call Anna",
      exact: true,
    });
    await handle.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(
      page.getByLabel("Task save phase", { exact: true }),
    ).toHaveText("pending");
    await page.getByRole("button", { name: "List view", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "Task list", exact: true }),
    ).toBeVisible();
    await expect(handle).toHaveCount(0);
    const finish = page.getByRole("button", {
      name: "Finish task save",
      exact: true,
    });
    await finish.click();
    await expect(
      page.getByLabel("Task save phase", { exact: true }),
    ).toHaveText("idle");
    const message = "Task move failed. Please try again.";
    const notifications = page.getByRole("region", {
      name: "Notifications alt+T",
      exact: true,
    });
    const failure = notifications.getByText(message, { exact: true });
    await expect(failure).toBeVisible();
    await expect(page.getByText(message, { exact: true })).toHaveCount(1);
    await expect(notifications).toHaveAttribute("aria-live", "polite");
    await expect(
      page.locator("[data-sonner-toast]").filter({ hasText: message }),
    ).toHaveCSS("opacity", "1");
    await expect(finish).toBeFocused();
    await expect(page.locator('[data-drag-overlay="true"]')).toHaveCount(0);
    await testInfo.attach(`pending-${outcome}-after-unmount`, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
    await page.getByRole("button", { name: "Board view", exact: true }).click();
    await page
      .getByRole("button", { name: "Save normally", exact: true })
      .click();
    await handle.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(
      page.getByLabel("Submitted task moves", { exact: true }),
    ).toHaveText(
      '[{"taskId":"call","status":"not_started","index":1},{"taskId":"call","status":"not_started","index":1}]',
    );
    await expect(handle).toBeFocused();
  }
});

test("a pending save admits no second move and preserves later user focus", async ({
  page,
}) => {
  await page.goto("/kanban.html?moveResult=pending");
  const column = page.getByRole("region", { name: "To Do", exact: true });
  const handle = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  const other = page.getByRole("button", {
    name: "Move Send newsletter",
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(page.getByLabel("Task save phase", { exact: true })).toHaveText(
    "pending",
  );
  await other.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText('[{"taskId":"call","status":"not_started","index":1}]');
  const finish = page.getByRole("button", {
    name: "Finish task save",
    exact: true,
  });
  await finish.click();
  await expect(page.getByLabel("Task save phase", { exact: true })).toHaveText(
    "idle",
  );
  await expect(column.getByRole("heading", { level: 4 })).toHaveText([
    "Send newsletter",
    "Call Anna",
  ]);
  await expect(finish).toBeFocused();
  await page
    .getByRole("button", { name: "Save normally", exact: true })
    .click();
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText(
    '[{"taskId":"call","status":"not_started","index":1},{"taskId":"call","status":"not_started","index":0}]',
  );
  await expect(handle).toBeFocused();
});

test("lifting and dropping in place submits no mutation", async ({ page }) => {
  const handle = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText("[]");
  await expect(
    page
      .getByRole("region", { name: "To Do", exact: true })
      .getByRole("heading", { level: 4 }),
  ).toHaveText(["Call Anna", "Send newsletter"]);
  await expect(handle).toBeFocused();
});

test("task-board controls have no automated accessibility violations", async ({
  page,
}) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("touch dragging the grip sorts without handing the gesture to page scrolling", async ({
  page,
}) => {
  const column = page.getByRole("region", { name: "To Do", exact: true });
  const handle = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  const next = column.getByRole("heading", {
    name: "Send newsletter",
    exact: true,
  });
  const start = (await handle.boundingBox())!;
  const end = (await next.boundingBox())!;
  const x = start.x + start.width / 2;
  const from = start.y + start.height / 2;
  const to = end.y + end.height / 2;
  const touch = await page.context().newCDPSession(page);
  try {
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y: from, id: 1 }],
    });
    for (let step = 1; step <= 16; step++) {
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: from + ((to - from) * step) / 16, id: 1 }],
      });
    }
    await expect(column.getByRole("heading", { level: 4 })).toHaveText([
      "Send newsletter",
      "Call Anna",
    ]);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(
      page.getByLabel("Submitted task moves", { exact: true }),
    ).toHaveText('[{"taskId":"call","status":"not_started","index":1}]');
  } finally {
    await touch.detach();
  }
});

test("short grip movements and dropping outside the board submit no mutation", async ({
  page,
}) => {
  const handle = page.getByRole("button", {
    name: "Move Call Anna",
    exact: true,
  });
  const start = (await handle.boundingBox())!;
  const x = start.x + start.width / 2;
  const y = start.y + start.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 3);
  await page.mouse.up();
  await expect(page.locator('[data-drag-overlay="true"]')).toHaveCount(0);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 15, { steps: 3 });
  await expect(page.locator('[data-drag-overlay="true"]')).toHaveCount(1);
  await page.mouse.move(5, 5, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator('[data-drag-overlay="true"]')).toHaveCount(0);
  await expect(
    page.getByLabel("Submitted task moves", { exact: true }),
  ).toHaveText("[]");
  await expect(
    page
      .getByRole("region", { name: "To Do", exact: true })
      .getByRole("heading", { level: 4 }),
  ).toHaveText(["Call Anna", "Send newsletter"]);
});
