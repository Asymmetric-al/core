import { expect, test, type Page } from "@playwright/test";

import { adminBaseURL } from "./base-urls";
import { getDemoRoleMap } from "./helpers/demo-auth";
import { installDemoSessionInBrowser } from "./helpers/install-demo-session";

type SavedTemplate = {
  id: string;
  name: string;
  builder: "react_email";
  builder_version: string;
  design_json: Record<string, unknown>;
  html_content: string;
  text_content: string;
  default_subject: string | null;
  default_preheader: string | null;
  version: number;
  updated_at: string;
};

async function ensureAdminDemo(page: Page) {
  const availability = await page.request.get(
    `${adminBaseURL}/api/auth/demo-account`,
  );
  test.skip(!availability.ok(), "Demo availability endpoint is unavailable.");
  const roles = getDemoRoleMap(await availability.json()) ?? {};
  test.skip(!roles.admin, "Admin demo account is not configured.");

  const { ok, status } = await installDemoSessionInBrowser(
    page,
    "admin",
    adminBaseURL,
  );
  if (!ok) {
    test.skip(true, `Demo admin session install failed (${status})`);
  }
}

function adminPath(path: string): string {
  return new URL(path, adminBaseURL).toString();
}

test.describe("Admin Email Studio", () => {
  test.setTimeout(180_000);

  test("saves, exports, reopens, and test-sends a React Email template", async ({
    page,
  }) => {
    const saveRequests: unknown[] = [];
    const testSendRequests: unknown[] = [];
    let savedTemplate: SavedTemplate | null = null;

    await page.route("**/api/email/templates", async (route) => {
      const request = route.request();

      if (request.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            templates: savedTemplate ? [savedTemplate] : [],
          }),
        });
        return;
      }

      if (request.method() === "POST") {
        const payload = request.postDataJSON() as {
          name: string;
          builder: "react_email";
          builderVersion: string;
          designJson: Record<string, unknown>;
          htmlContent: string;
          textContent: string;
          defaultSubject?: string | null;
          defaultPreheader?: string | null;
        };
        saveRequests.push(payload);
        expect(payload.builder).toBe("react_email");
        expect(payload.htmlContent.length).toBeGreaterThan(0);
        expect(payload.textContent).toBeDefined();

        savedTemplate = {
          id: "template_1",
          name: payload.name,
          builder: "react_email",
          builder_version: payload.builderVersion,
          design_json: payload.designJson,
          html_content: payload.htmlContent,
          text_content: payload.textContent,
          default_subject: payload.defaultSubject ?? null,
          default_preheader: payload.defaultPreheader ?? null,
          version: 1,
          updated_at: new Date("2026-05-11T00:00:00.000Z").toISOString(),
        };

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            template: {
              id: savedTemplate.id,
              name: savedTemplate.name,
              builder: savedTemplate.builder,
              version: savedTemplate.version,
            },
            version: { id: "version_1", version: 1 },
          }),
        });
        return;
      }

      await route.fallback();
    });

    await page.route(
      "**/api/email/templates/template_1/test-send",
      async (route) => {
        const payload = route.request().postDataJSON() as {
          builder: string;
          html: string;
          text: string;
          toEmail: string;
        };
        testSendRequests.push(payload);
        expect(payload.builder).toBe("react_email");
        expect(payload.toEmail).toBe("qa@example.com");
        expect(payload.html.length).toBeGreaterThan(0);
        expect(payload.text).toBeDefined();

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            messageId: "msg_test_123",
            correlationId: "corr_test_123",
            auditLogged: true,
            warnings: [],
          }),
        });
      },
    );

    await ensureAdminDemo(page);
    await page.goto(adminPath("/email"));
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("#__next_error__")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /Mission Control/i }),
    ).toBeVisible({ timeout: 120_000 });
    await expect(page.getByText("Email Studio").first()).toBeVisible();

    const saveButton = page.getByRole("button", { name: /^Save$/ });
    await expect(saveButton).toBeEnabled({ timeout: 120_000 });

    await page.getByRole("button", { name: /Export/i }).click();
    await page.getByRole("menuitem", { name: /Export as HTML/i }).click();
    await expect(
      page.getByRole("heading", { name: "Export HTML" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await saveButton.click();
    await expect(
      page.getByRole("heading", { name: "Save Email Template" }),
    ).toBeVisible();
    await page.getByLabel(/Template Name/i).fill("Migration smoke template");
    await page.getByLabel(/Email Subject/i).fill("Migration smoke subject");
    await page.getByLabel(/Preheader Text/i).fill("Migration smoke preheader");
    await page.getByRole("button", { name: /Save Template/i }).click();

    await expect(page.getByText("Template saved")).toBeVisible({
      timeout: 60_000,
    });
    expect(saveRequests).toHaveLength(1);

    await page
      .getByRole("button", { name: "More email template actions" })
      .click();
    await page.getByRole("menuitem", { name: /Load Template/i }).click();
    await expect(
      page.getByRole("heading", { name: "Open template" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Migration smoke template/i })
      .click();
    await expect(page.getByText("Template opened")).toBeVisible();

    await page.getByRole("button", { name: /Export/i }).click();
    await page.getByRole("menuitem", { name: /Send Test Email/i }).click();
    await expect(
      page.getByRole("heading", { name: "Send test email" }),
    ).toBeVisible();
    await page.getByLabel(/Recipient email/i).fill("qa@example.com");
    await page.getByRole("button", { name: /^Send$/ }).click();

    await expect(page.getByText("Test email sent")).toBeVisible({
      timeout: 60_000,
    });
    expect(testSendRequests).toHaveLength(1);
  });
});
