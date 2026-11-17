import { expect, test } from "./test";

test("actual analytics stat values and titles remain inside their cards across sidebar breakpoints", async ({
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
      // The page leads with three stat regions, each named by its title.
      const cards = await Promise.all(
        [
          "Given in the last 12 months",
          "Partners who gave again",
          "Typical gift",
        ].map((title) =>
          page
            .getByRole("region", { name: title, exact: true })
            .evaluate((card) => {
              const heading = card.querySelector("h2");
              const value = card.querySelector('[data-slot="card-content"] p');
              if (!heading || !value)
                throw new Error("Expected real stat card title and value");
              const outer = card.getBoundingClientRect();
              const style = getComputedStyle(card);
              const left =
                outer.left + Number.parseFloat(style.borderLeftWidth);
              const right =
                outer.right - Number.parseFloat(style.borderRightWidth);
              const fits = (element: Element) => {
                const range = document.createRange();
                range.selectNodeContents(element);
                return [...range.getClientRects()].every(
                  (rect) =>
                    rect.left >= left - 0.5 && rect.right <= right + 0.5,
                );
              };
              return {
                valueFits: fits(value),
                titleFits: fits(heading),
                font: getComputedStyle(value).fontFamily,
              };
            }),
        ),
      );
      expect(
        cards,
        `${width}px ${state}: all three actual stat cards`,
      ).toHaveLength(3);
      expect(
        cards.every((card) => card.font.includes("Analytics Fixture Inter")),
      ).toBe(true);
      expect(
        cards.every((card) => card.valueFits),
        `${width}px ${state}: complete values`,
      ).toBe(true);
      expect(
        cards.every((card) => card.titleFits),
        `${width}px ${state}: complete titles`,
      ).toBe(true);
    }
  }
});
