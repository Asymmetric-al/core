import { expect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import {
  attachPayloadDbConsoleListener,
  waitForWebStudioShellOrSkip,
} from "./cms-skip-if-no-payload";

const nativePagesUiDisabled =
  process.env.CMS_WEB_STUDIO_NATIVE_PAGES === "false" ||
  process.env.CMS_WEB_STUDIO_NATIVE_PAGES === "0";

test.describe("@cms Web Studio native shell", () => {
  test.beforeEach(({}, testInfo) => {
    if (nativePagesUiDisabled) {
      testInfo.skip(
        true,
        "CMS_WEB_STUDIO_NATIVE_PAGES disables native Pages UI; shell assertions do not apply. Smoke script sets CMS_WEB_STUDIO_NATIVE_PAGES=true — see docs/guides/development/site-studio-payload.md.",
      );
    }
  });

  async function signInAsAdmin(page: Page) {
    const sawPayloadDbFailure = attachPayloadDbConsoleListener(page);

    const availability = await page.request.get(
      `${adminBaseURL}/api/auth/demo-account`,
    );
    test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");

    const payload = (await availability.json()) as {
      roles?: Record<string, boolean>;
      availableRoles?: Record<string, boolean>;
    };
    const roles = payload.roles ?? payload.availableRoles ?? {};
    test.skip(!roles.admin, "Admin demo account is not configured.");

    await page.goto(
      `${adminBaseURL}/login?next=${encodeURIComponent("/web-studio/collections/pages")}`,
    );
    await page.getByRole("button", { name: "Demo Access" }).click();
    await page.waitForURL(/\/web-studio\/collections\/pages/);
    await waitForWebStudioShellOrSkip(page, sawPayloadDbFailure);
  }

  test("authenticated staff sees Mission Control shell on Pages list", async ({
    page,
  }) => {
    await signInAsAdmin(page);

    await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /pages/i }).first(),
    ).toBeVisible();
  });

  test("native shell renders without prerender-time clock errors", async ({
    page,
  }) => {
    const renderErrors: string[] = [];
    const recordRenderError = (message: string) => {
      if (
        /blocking-prerender-current-time|unstable value.*Date\.now\(\)/s.test(
          message,
        )
      ) {
        renderErrors.push(message);
      }
    };

    page.on("console", (message) => {
      if (message.type() === "error") recordRenderError(message.text());
    });
    page.on("pageerror", (error) => recordRenderError(error.message));

    try {
      await signInAsAdmin(page);
      await page.goto(`${adminBaseURL}/web-studio/collections/navigation`);
      await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
      expect(renderErrors).toEqual([]);
    } finally {
      await page.request.post(`${adminBaseURL}/api/auth/signout`);
    }
  });

  test("staff edits persist as a private draft through native autosave", async ({
    page,
  }) => {
    test.setTimeout(150_000);
    const browserErrors: string[] = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    let documentId: string | number | undefined;
    let testBodyFailed = false;

    try {
      await signInAsAdmin(page);
      const slug = `native-draft-check-${Date.now()}`;
      const created = await page.request.post(
        `${adminBaseURL}/api/pages?draft=true`,
        {
          data: {
            title: "Native draft check",
            slug,
            pageType: "standard",
            _status: "draft",
            content: {
              root: {
                type: "root",
                children: [],
                direction: null,
                format: "",
                indent: 0,
                version: 1,
              },
            },
          },
        },
      );
      expect(created.status()).toBe(201);
      documentId = (await created.json()).doc.id;

      await page.reload();
      await expect(
        page.getByText("Native draft check", { exact: true }).first(),
      ).toBeVisible();
      await page.goto(
        `${adminBaseURL}/web-studio/collections/pages/${documentId}`,
      );
      const title = page.getByRole("textbox", { name: /^Title/ }).first();
      await expect(title).toHaveValue("Native draft check");
      const saveDraft = page.getByRole("button", { name: /^Save Draft$/i });
      await expect(saveDraft).toBeVisible();
      await title.fill("Native draft check saved");
      const documentState = page.getByRole("region", {
        name: "Document state",
      });
      await expect(
        documentState.getByText("Autosaved draft", { exact: true }),
      ).toBeVisible();
      await expect(saveDraft).toBeDisabled();
      await expect(
        documentState.getByText("Private draft", { exact: true }),
      ).toBeVisible();
      await expect
        .poll(
          async () => {
            const response = await page.request.get(
              `${adminBaseURL}/api/pages/${documentId}?draft=true&depth=0`,
            );
            const doc = response.ok() ? await response.json() : null;
            return (
              doc?.title === "Native draft check saved" &&
              doc?._status === "draft"
            );
          },
          { timeout: 60_000 },
        )
        .toBe(true);
      await page.reload();
      await expect(title).toHaveValue("Native draft check saved");
      expect(browserErrors).toEqual([]);
    } catch (error) {
      testBodyFailed = true;
      throw error;
    } finally {
      const cleanupErrors: unknown[] = [];
      try {
        if (documentId !== undefined) {
          const deleted = await page.request.delete(
            `${adminBaseURL}/api/pages/${documentId}`,
          );
          expect(deleted.ok()).toBe(true);
        }
      } catch (error) {
        cleanupErrors.push(error);
      }
      try {
        const signedOut = await page.request.post(
          `${adminBaseURL}/api/auth/signout`,
        );
        expect(signedOut.ok()).toBe(true);
      } catch (error) {
        cleanupErrors.push(error);
      }
      if (cleanupErrors.length) {
        test.info().annotations.push({
          type: "cleanup",
          description: `${cleanupErrors.length} draft cleanup action(s) failed`,
        });
        if (!testBodyFailed) {
          throw new AggregateError(cleanupErrors, "Draft cleanup failed");
        }
      }
    }
  });

  test("editorial collection routes use the native shell", async ({ page }) => {
    await signInAsAdmin(page);

    const editorialRoutes = [
      { href: "/web-studio/collections/navigation", heading: /navigation/i },
      {
        href: "/web-studio/collections/missionary-profiles",
        heading: /missionary profiles/i,
      },
      {
        href: "/web-studio/collections/ministry-updates",
        heading: /ministry updates/i,
      },
      { href: "/web-studio/collections/media", heading: /media/i },
    ] as const;

    for (const route of editorialRoutes) {
      await page.goto(`${adminBaseURL}${route.href}`);
      await page.waitForURL(new RegExp(route.href.replace(/\//g, "\\/")));
      await waitForWebStudioShellOrSkip(page);
      await expect(page.getByTestId("web-studio-native-shell")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: route.heading }).first(),
      ).toBeVisible();
    }
  });
});
