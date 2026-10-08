import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (
          url.hostname === "127.0.0.1" &&
          url.port === "5198" &&
          !url.pathname.startsWith("/api/")
        ) {
          await route.continue();
        } else {
          errors.push(
            `Unexpected external or API request: ${url.origin}${url.pathname}`,
          );
          await route.abort();
        }
      });
      await page.addInitScript((dark) => {
        const applyTheme = () => {
          if (!document.documentElement) return false;
          document.documentElement.classList.toggle("dark", dark);
          return true;
        };
        if (!applyTheme()) {
          const observer = new MutationObserver(() => {
            if (applyTheme()) observer.disconnect();
          });
          observer.observe(document, { childList: true });
        }
      }, testInfo.project.use.colorScheme === "dark");
      await page.goto("/");
      expect(
        await page.evaluate(
          () => matchMedia("(prefers-reduced-motion: reduce)").matches,
        ),
      ).toBe(testInfo.project.use.contextOptions?.reducedMotion === "reduce");
      await expect(
        page.getByRole("heading", { name: "Base UI contracts", exact: true }),
      ).toBeVisible();
      await use(errors);
      expect(
        errors,
        "Fixture must not hide runtime errors or call external services",
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
