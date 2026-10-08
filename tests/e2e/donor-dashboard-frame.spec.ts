import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

import type { PostWithAuthor } from "../../packages/database/types/database";

const TOLERANCE = 2;
const sourceSHA = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const layoutHash = createHash("sha256")
  .update(
    readFileSync(
      path.join(
        process.cwd(),
        "apps/donor/app/(dashboard)/donor-dashboard/layout.tsx",
      ),
    ),
  )
  .digest("hex");
const nextVersion = JSON.parse(
  readFileSync("apps/donor/node_modules/next/package.json", "utf8"),
) as { version: string };
const packageManager = JSON.parse(readFileSync("package.json", "utf8")) as {
  packageManager: string;
};
const viewports = [
  { width: 1440, height: 2200 },
  { width: 1440, height: 900 },
  { width: 320, height: 568 },
  { width: 640, height: 450 },
] as const;

test.use({ reducedMotion: "reduce" });
test.describe.configure({ timeout: 90_000 });

/**
 * Actual Next.js dashboard composition, Core's compiled styles and existing
 * local demo auth. Only GET /api/posts receives deterministic HTTP data;
 * navigation, layout, primitives, providers and guards remain real.
 */
async function openFeed(page: Page) {
  const session = await installDemoSessionInBrowser(page, "donor");
  expect(session.ok, `Donor demo session returned ${session.status}`).toBe(
    true,
  );
  await page.goto("/donor-dashboard/feed", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveAttribute("id", "main-content");
  await expect(
    page.getByRole("navigation", { name: "Donor workspace" }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function geometry(page: Page) {
  return page.getByRole("main").evaluate((main) => {
    const footer = document.querySelector("footer")!;
    const frame = footer.parentElement!;
    const wrapper = main.parentElement!;
    const routeContent = main.firstElementChild!;
    const navbar = document.querySelector('nav[aria-label="Main navigation"]')!;
    const workspace = document.querySelector(
      'nav[aria-label="Donor workspace"]',
    )!;
    const bounds = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + scrollY,
        bottom: rect.bottom + scrollY,
        left: rect.left,
        right: rect.right,
        height: rect.height,
        width: rect.width,
      };
    };
    const mainStyle = getComputedStyle(main);
    const wrapperStyle = getComputedStyle(wrapper);
    const footerStyle = getComputedStyle(footer);
    const scrollingAncestors: string[] = [];
    for (let ancestor = main; ancestor; ancestor = ancestor.parentElement!) {
      if (
        ["auto", "scroll", "hidden", "clip"].includes(
          getComputedStyle(ancestor).overflowY,
        )
      ) {
        scrollingAncestors.push(ancestor.tagName);
      }
    }
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollY,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      frame: bounds(frame),
      wrapper: bounds(wrapper),
      main: bounds(main),
      routeContent: bounds(routeContent),
      footer: bounds(footer),
      navbar: bounds(navbar),
      workspace: bounds(workspace),
      mainPaddingTop: parseFloat(mainStyle.paddingTop),
      mainPaddingBottom: parseFloat(mainStyle.paddingBottom),
      footerPosition: footerStyle.position,
      footerPaddingTop: footerStyle.paddingTop,
      footerPaddingBottom: footerStyle.paddingBottom,
      wrapperDisplay: wrapperStyle.display,
      wrapperFlex: wrapperStyle.flex,
      mainFlex: mainStyle.flex,
      mainMinHeight: mainStyle.minHeight,
      scrollingAncestors,
    };
  });
}

async function capture(page: Page, testInfo: TestInfo, state: string) {
  const measured = await geometry(page);
  const jsonPath = testInfo.outputPath(`${state}-geometry.json`);
  await writeFile(
    jsonPath,
    JSON.stringify(
      {
        sourceSHA,
        layoutHash,
        environment: {
          node: process.version,
          next: nextVersion.version,
          packageManager: packageManager.packageManager,
          browser: page.context().browser()?.version(),
          url: page.url(),
          datasource:
            process.env.ASYM_USE_CI_ENV_DEFAULTS === "1"
              ? "repository CI placeholder defaults"
              : "caller-configured demo environment",
          fixture: "GET /api/posts HTTP data in the actual Next.js app",
          reducedMotion: "reduce",
          zoom: "default browser zoom; viewport emulation is not browser zoom",
        },
        state,
        measured,
      },
      null,
      2,
    ),
  );
  await testInfo.attach(`${state}-geometry`, {
    path: jsonPath,
    contentType: "application/json",
  });
  const screenshotPath = testInfo.outputPath(`${state}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach(state, {
    path: screenshotPath,
    contentType: "image/png",
  });
  return measured;
}

async function expectDocumentFrame(page: Page) {
  await expect
    .poll(async () => {
      const measured = await geometry(page);
      return Math.abs(measured.footer.bottom - measured.frame.bottom);
    })
    .toBeLessThanOrEqual(TOLERANCE);
  const measured = await geometry(page);
  expect(measured.frame.height).toBeGreaterThanOrEqual(
    measured.viewport.height - TOLERANCE,
  );
  expect(
    Math.abs(measured.main.bottom - measured.footer.top),
  ).toBeLessThanOrEqual(TOLERANCE);
  expect(measured.documentWidth).toBeLessThanOrEqual(
    measured.viewport.width + TOLERANCE,
  );
  expect(["fixed", "absolute"]).not.toContain(measured.footerPosition);
  expect(measured.scrollingAncestors).toEqual([]);
  expect(measured.routeContent.bottom).toBeLessThanOrEqual(
    measured.main.bottom - measured.mainPaddingBottom + TOLERANCE,
  );
  expect(
    Math.abs(measured.footer.bottom - measured.documentHeight),
  ).toBeLessThanOrEqual(TOLERANCE);
  return measured;
}

async function emptyFeed(page: Page) {
  await page.route(
    (url) => url.pathname === "/api/posts",
    (route) =>
      route.request().method() === "GET"
        ? route.fulfill({ json: { posts: [] } })
        : route.continue(),
  );
}

test("short content grows into the available tall viewport", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1800 });
  await emptyFeed(page);
  await openFeed(page);
  await expect(
    page.getByRole("heading", { name: "No posts found" }),
  ).toBeVisible();
  await capture(page, testInfo, "short-empty");
  const measured = await expectDocumentFrame(page);
  expect(
    Math.abs(measured.frame.bottom - measured.viewport.height),
  ).toBeLessThanOrEqual(TOLERANCE);
  expect(measured.main.height).toBeGreaterThan(
    measured.routeContent.height +
      measured.mainPaddingTop +
      measured.mainPaddingBottom +
      TOLERANCE,
  );
});

for (const viewport of viewports) {
  for (const state of ["empty", "error"] as const) {
    test(`${state} content keeps normal document framing at ${viewport.width}x${viewport.height}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.route(
        (url) => url.pathname === "/api/posts",
        (route) => {
          if (route.request().method() !== "GET") return route.continue();
          return state === "empty"
            ? route.fulfill({ json: { posts: [] } })
            : route.fulfill({
                status: 500,
                json: { error: "Deterministic layout-only feed failure" },
              });
        },
      );
      await openFeed(page);
      await expect(
        page.getByRole("heading", {
          name: state === "empty" ? "No posts found" : "Couldn't load updates",
        }),
      ).toBeVisible({ timeout: 20_000 });
      await capture(page, testInfo, state);
      const measured = await expectDocumentFrame(page);
      expect(measured.main.top).toBeGreaterThanOrEqual(
        measured.workspace.bottom - TOLERANCE,
      );
      expect(measured.routeContent.top).toBeGreaterThanOrEqual(
        measured.navbar.bottom - TOLERANCE,
      );
      if (viewport.height === 2200) {
        expect(
          Math.abs(measured.frame.bottom - viewport.height),
        ).toBeLessThanOrEqual(TOLERANCE);
      } else {
        expect(measured.documentHeight).toBeGreaterThan(viewport.height);
      }
    });
  }
}

function longPosts(): PostWithAuthor[] {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `donor-frame-post-${index + 1}`,
    tenant_id: "donor-frame-tenant",
    missionary_id: "donor-frame-partner",
    content:
      `<p>Deterministic field update ${index + 1}.</p>` +
      Array.from(
        { length: 4 },
        () =>
          "<p>This browser fixture exercises naturally growing ministry updates with readable paragraphs. It supplies only HTTP response data; the dashboard layout, navigation, shared footer, compiled styles, and scrolling remain the application's own composition.</p>",
      ).join(""),
    media: [],
    like_count: 0,
    prayer_count: 0,
    fires_count: 0,
    comment_count: 0,
    created_at: "2026-10-08T00:00:00.000Z",
    updated_at: "2026-10-08T00:00:00.000Z",
    author: {
      id: "donor-frame-partner",
      first_name: "Fixture",
      last_name: "Partner",
      avatar_url: null,
    },
  }));
}

for (const viewport of viewports) {
  test(`loading grows into long content without trapped scrolling at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(
      (url) => url.pathname === "/api/posts",
      async (route) => {
        if (route.request().method() !== "GET") return route.continue();
        await ready;
        await route.fulfill({ json: { posts: longPosts() } });
      },
    );
    try {
      await openFeed(page);
      await expect(
        page.getByText("Loading updates…", { exact: true }),
      ).toBeVisible();
      const loading = await capture(page, testInfo, "loading");
      await expectDocumentFrame(page);
      release();
      const articles = page.getByRole("main").getByRole("article");
      await expect(articles).toHaveCount(8);
      // Exercise the real viewport entrances before capturing a full document.
      for (const article of await articles.all()) {
        await article.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            article.evaluate((node) => getComputedStyle(node).opacity),
          )
          .toBe("1");
      }
      const loaded = await capture(page, testInfo, "long-content");
      await expectDocumentFrame(page);
      expect(loaded.main.height).toBeGreaterThan(loading.main.height);
      expect(loaded.documentHeight).toBeGreaterThan(loading.documentHeight);
      expect(loaded.documentHeight).toBeGreaterThan(viewport.height);
      const footerLink = page
        .getByRole("contentinfo")
        .getByRole("link", { name: "Source & License", exact: true });
      await footerLink.scrollIntoViewIfNeeded();
      await footerLink.focus();
      await expect(footerLink).toBeFocused();
      const reachable = await footerLink.boundingBox();
      expect(reachable!.y).toBeGreaterThanOrEqual(0);
      expect(reachable!.y + reachable!.height).toBeLessThanOrEqual(
        viewport.height + TOLERANCE,
      );
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    } finally {
      release();
    }
  });
}

test("skip link and workspace navigation preserve the main target", async ({
  page,
}, testInfo) => {
  const runtimeMessages: { type: string; text: string }[] = [];
  page.on("pageerror", (error) => {
    runtimeMessages.push({ type: "pageerror", text: error.message });
  });
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      runtimeMessages.push({ type: message.type(), text: message.text() });
    }
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await emptyFeed(page);
  await openFeed(page);
  await expect(
    page.getByRole("heading", { name: "No posts found" }),
  ).toBeVisible();
  const main = page.getByRole("main");
  await page.getByRole("link", { name: "Skip to main content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  // The native fragment sets the sequential navigation starting point even
  // though this semantic main is not itself a tabbable control.
  await page.keyboard.press("Tab");
  const firstFilter = main.getByRole("button", { name: "All", exact: true });
  await expect(firstFilter).toBeFocused();
  expect(
    await firstFilter.evaluate((node) => node.matches(":focus-visible")),
  ).toBe(true);
  const filterBounds = await firstFilter.boundingBox();
  const navbarBounds = await page
    .getByRole("navigation", { name: "Main navigation" })
    .boundingBox();
  const workspaceBounds = await page
    .getByRole("navigation", { name: "Donor workspace" })
    .boundingBox();
  expect(filterBounds!.y).toBeGreaterThanOrEqual(
    Math.max(
      navbarBounds!.y + navbarBounds!.height,
      workspaceBounds!.y + workspaceBounds!.height,
    ) - TOLERANCE,
  );
  await capture(page, testInfo, "skip-link-focus");

  const wallet = page
    .getByRole("navigation", { name: "Donor workspace" })
    .getByRole("link", { name: "Wallet", exact: true });
  await wallet.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/donor-dashboard\/wallet$/);
  await expect(
    page.getByRole("heading", { name: "Wallet", exact: true }),
  ).toBeVisible();
  await expect(main).toHaveCount(1);
  await expect(main).toHaveAttribute("id", "main-content");
  await expectDocumentFrame(page);
  await capture(page, testInfo, "wallet-navigation");
  const runtimePath = testInfo.outputPath("keyboard-navigation-runtime.json");
  await writeFile(
    runtimePath,
    JSON.stringify({ sourceSHA, layoutHash, runtimeMessages }, null, 2),
  );
  await testInfo.attach("keyboard-navigation-runtime-messages", {
    path: runtimePath,
    contentType: "application/json",
  });
  expect(
    runtimeMessages.filter((message) => message.type === "pageerror"),
  ).toEqual([]);
});

test("protected direct requests retain anonymous and wrong-role redirects", async ({
  page,
}, testInfo) => {
  const protectedPath = "/donor-dashboard/feed";
  const anonymous = await page.request.get(protectedPath, { maxRedirects: 0 });
  expect([307, 308]).toContain(anonymous.status());
  const anonymousLocation = new URL(
    anonymous.headers().location,
    page.url() === "about:blank" ? testInfo.project.use.baseURL : page.url(),
  );
  expect(anonymousLocation.pathname).toBe("/login");
  expect(anonymousLocation.searchParams.get("next")).toBe(protectedPath);

  const session = await installDemoSessionInBrowser(page, "missionary");
  expect(session.ok, `Missionary demo session returned ${session.status}`).toBe(
    true,
  );
  const wrongRole = await page.request.get(protectedPath, { maxRedirects: 0 });
  expect([307, 308]).toContain(wrongRole.status());
  const wrongRoleLocation = new URL(
    wrongRole.headers().location,
    anonymousLocation,
  );
  // A wrong-role demo cookie is rejected before the proxy assigns userId;
  // real provider-authenticated wrong-role redirects are a separate check.
  expect(wrongRoleLocation.pathname).toBe("/login");
  expect(wrongRoleLocation.searchParams.get("next")).toBe(protectedPath);
  const redirectsPath = testInfo.outputPath("protected-direct-redirects.json");
  await writeFile(
    redirectsPath,
    JSON.stringify(
      {
        sourceSHA,
        anonymous: {
          status: anonymous.status(),
          location: anonymousLocation.toString(),
        },
        wrongRole: {
          status: wrongRole.status(),
          location: wrongRoleLocation.toString(),
        },
        scope:
          "Existing nonproduction demo fixture; provider-backed login is separate",
      },
      null,
      2,
    ),
  );
  await testInfo.attach("protected-direct-redirects", {
    path: redirectsPath,
    contentType: "application/json",
  });
});

for (const viewport of [viewports[0], viewports[2]]) {
  test(`composed empty dashboard has clean automated accessibility at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await emptyFeed(page);
    await openFeed(page);
    await expect(
      page.getByRole("heading", { name: "No posts found" }),
    ).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const axePath = testInfo.outputPath("axe.json");
    await writeFile(
      axePath,
      JSON.stringify({ sourceSHA, layoutHash, results }, null, 2),
    );
    await testInfo.attach("axe", {
      path: axePath,
      contentType: "application/json",
    });
    expect(results.violations).toEqual([]);
  });
}
