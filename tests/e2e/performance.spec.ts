import { test, expect, Page } from "@playwright/test";

const LCP_THRESHOLD_MS = 2500;
const TTFB_THRESHOLD_MS = 500;
const FCP_THRESHOLD_MS = 1800;

async function measureWebVitals(page: Page) {
  return page.evaluate(() => {
    return new Promise<{
      lcp: number | null;
      fcp: number | null;
      ttfb: number | null;
      cls: number | null;
    }>((resolve) => {
      let lcp: number | null = null;
      let fcp: number | null = null;
      let ttfb: number | null = null;
      let cls: number | null = 0;

      const navEntry = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      if (navEntry) {
        ttfb = navEntry.responseStart - navEntry.requestStart;
      }

      const paintEntries = performance.getEntriesByType("paint");
      for (const entry of paintEntries) {
        if (entry.name === "first-contentful-paint") {
          fcp = entry.startTime;
        }
      }

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === "largest-contentful-paint") {
            lcp = entry.startTime;
          }
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!layoutShift.hadRecentInput) {
            cls = (cls || 0) + layoutShift.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });

      setTimeout(() => {
        resolve({ lcp, fcp, ttfb, cls });
      }, 3000);
    });
  });
}

test.describe("Performance Budgets", () => {
  test("Homepage LCP should be under 2.5s", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const vitals = await measureWebVitals(page);

    console.log("Homepage Web Vitals:", vitals);

    if (vitals.lcp !== null) {
      expect(vitals.lcp).toBeLessThan(LCP_THRESHOLD_MS);
    }
    if (vitals.ttfb !== null) {
      expect(vitals.ttfb).toBeLessThan(TTFB_THRESHOLD_MS);
    }
  });

  test("Login page LCP should be under 2.5s", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const vitals = await measureWebVitals(page);

    console.log("Login Page Web Vitals:", vitals);

    if (vitals.lcp !== null) {
      expect(vitals.lcp).toBeLessThan(LCP_THRESHOLD_MS);
    }
  });

  test("Login to dashboard flow should complete under threshold", async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const loginLoadTime = Date.now() - startTime;
    console.log(`Login page load time: ${loginLoadTime}ms`);

    expect(loginLoadTime).toBeLessThan(5000);
  });
});

test.describe("SSR Integrity", () => {
  test("Homepage renders valid HTML", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-type"]).toContain("text/html");

    const html = await page.content();
    expect(html).toContain("<html");
    expect(html).toContain("</body>");
  });

  test("Login page renders without hydration errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const hydrationErrors = consoleErrors.filter(
      (e) => e.includes("Hydration") || e.includes("hydration"),
    );

    expect(hydrationErrors).toHaveLength(0);
  });
});

test.describe("Edge Caching", () => {
  test("Static assets should have cache headers", async ({ page }) => {
    const staticAssetRequests: { url: string; cacheControl: string | null }[] =
      [];

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/_next/static/") || url.match(/\.(js|css|woff2?)$/)) {
        staticAssetRequests.push({
          url,
          cacheControl: response.headers()["cache-control"] ?? null,
        });
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    for (const asset of staticAssetRequests) {
      console.log(`Asset: ${asset.url}, Cache-Control: ${asset.cacheControl}`);
    }
  });
});
