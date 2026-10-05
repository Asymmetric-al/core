import { expect, test } from "./test";

test("actual analytics KPI values and icons remain inside their cards across sidebar breakpoints", async ({
  page,
}) => {
  for (const width of [
    320, 375, 390, 639, 640, 767, 768, 1023, 1024, 1025, 1279, 1280,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/workspace.html?workspace=missionary&pathname=/analytics&surface=analytics",
    );
    await expect(
      page.getByRole("heading", { name: "Analytics", exact: true }),
    ).toBeVisible();
    const loadedFonts = await page.evaluate(async () => {
      const fonts = await document.fonts.load(
        "600 24px 'Analytics Fixture Inter'",
        "Unavailable",
      );
      await document.fonts.ready;
      return fonts.map((font) => font.status);
    });
    expect(
      loadedFonts,
      `${width}px: actual stored Inter face loaded`,
    ).toContain("loaded");
    for (const state of width >= 768 ? ["expanded", "collapsed"] : ["mobile"]) {
      if (state === "collapsed") {
        await page
          .locator("header")
          .getByRole("button", { name: "Toggle Sidebar", exact: true })
          .click();
      }
      await page.evaluate(async () => {
        await Promise.all(
          document
            .getAnimations()
            .map((animation) => animation.finished.catch(() => {})),
        );
        await new Promise((done) => requestAnimationFrame(done));
      });
      const cards = await page
        .getByRole("heading", { name: "Unavailable", exact: true })
        .evaluateAll((headings) =>
          headings.map((heading) => {
            const card = heading.closest('[data-slot="card"]');
            const icon = card?.querySelector("svg");
            if (!card || !icon)
              throw new Error("Expected real KPI card and icon");
            const outer = card.getBoundingClientRect();
            const iconRect = icon.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(heading);
            const valueRect = range.getBoundingClientRect();
            const style = getComputedStyle(card);
            const left = outer.left + Number.parseFloat(style.borderLeftWidth);
            const right =
              outer.right - Number.parseFloat(style.borderRightWidth);
            return {
              valueFits:
                valueRect.left >= left - 0.5 && valueRect.right <= right + 0.5,
              iconFits:
                iconRect.left >= left - 0.5 && iconRect.right <= right + 0.5,
              font: getComputedStyle(heading).fontFamily,
            };
          }),
        );
      expect(
        cards,
        `${width}px ${state}: all four actual KPI cards`,
      ).toHaveLength(4);
      expect(
        cards.every((card) => card.font.includes("Analytics Fixture Inter")),
      ).toBe(true);
      expect(
        cards.every((card) => card.valueFits),
        `${width}px ${state}: complete values`,
      ).toBe(true);
      expect(
        cards.every((card) => card.iconFits),
        `${width}px ${state}: complete icons`,
      ).toBe(true);
    }
  }
});
