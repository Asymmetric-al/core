import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeDetailPayload } from "./fixtures/react-cleanup-detail-data";

const root = process.cwd();
const requireRoot = createRequire(path.join(root, "package.json"));
const tailwindPostcss = requireRoot("@tailwindcss/postcss");
const postcss = createRequire(requireRoot.resolve("@tailwindcss/postcss"))(
  "postcss",
);
let temporaryDirectory: string, javascript: string, css: string;
test.beforeAll(async () => {
  temporaryDirectory = mkdtempSync(
    path.join(tmpdir(), "core-react-cleanup-gifts-"),
  );
  execFileSync(
    "bun",
    [
      "--no-env-file",
      "tests/e2e/fixtures/build-react-cleanup.ts",
      temporaryDirectory,
    ],
    { cwd: root, stdio: "pipe", timeout: 30000 },
  );
  javascript = readFileSync(
    path.join(temporaryDirectory, "react-cleanup-contributions.js"),
    "utf8",
  );
  const stylesheet = path.join(root, "packages/ui/styles/globals.css");
  css = (
    await postcss([tailwindPostcss({ base: root, optimize: false })]).process(
      readFileSync(stylesheet, "utf8"),
      { from: stylesheet },
    )
  ).css;
});
test.afterAll(() => {
  if (temporaryDirectory)
    rmSync(temporaryDirectory, { recursive: true, force: true });
});
const id = "00000000-0000-4000-8000-0000000000aa";
const modes: Array<{
  width: number;
  theme: "light" | "dark";
  motion: "reduce" | "no-preference";
  scenario: string;
}> = [
  ...[320, 1280].flatMap((width) =>
    (["light", "dark"] as const).flatMap((theme) =>
      (["reduce", "no-preference"] as const).map((motion) => ({
        width,
        theme,
        motion,
        scenario: "success",
      })),
    ),
  ),
  ...["failure", "stale", "refresh-failure"].map((scenario) => ({
    width: 320,
    theme: "dark" as const,
    motion: "reduce" as const,
    scenario,
  })),
];
for (const surface of ["Hub", "CRM"])
  for (const mode of modes) {
    const tag = `${surface}-${mode.width}-${mode.theme}-${mode.motion}-${mode.scenario}`;
    test(`synthetic gift operations preserve financial and focus behavior: ${tag}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: mode.width, height: 900 });
      await page.emulateMedia({
        colorScheme: mode.theme,
        reducedMotion: mode.motion,
      });
      const errors: string[] = [],
        blocked: string[] = [];
      const posts: Array<{
        sourceSurface: string;
        expectedRevision: string;
        payload: { amount: number };
        idempotencyKey: string;
      }> = [];
      let actionSent = false;
      page.on("pageerror", (error) => errors.push(error.message));
      const detail = {
        ...makeDetailPayload(id, "Synthetic Donor").contribution,
        stagedGift: {
          id: "staged-1",
          status: "posted",
          receiptStatus: "pending",
          crmPostStatus: "posted",
          reviewReason: null,
          twentyRecordId: null,
        },
        actionAvailability: [
          {
            actionType: "refund",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "high",
          },
          {
            actionType: "amount_correction",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "high",
          },
        ],
      };
      detail.shared.amountCents = 20000;
      detail.original.amountCents = 25000;
      detail.shared.refundedAmountCents = 5000;
      detail.shared.refundState = "partially_refunded";
      await page.route("**/*", async (route) => {
        const request = route.request(),
          url = new URL(request.url());
        if (url.hostname !== "localhost") {
          blocked.push(request.url());
          return route.abort();
        }
        if (url.pathname.endsWith("/actions")) {
          const body = request.postDataJSON();
          posts.push(body);
          actionSent = true;
          if (mode.scenario === "failure")
            return route.fulfill({
              status: 500,
              json: { error: "Synthetic provider failure" },
            });
          if (mode.scenario === "stale") {
            detail.revision = "2026-05-26T00:00:00.000Z#1";
            return route.fulfill({
              status: 409,
              json: { error: "Gift changed during editing" },
            });
          }
          return route.fulfill({
            json: {
              result: {
                auditEventId: "audit-fixture",
                adjustmentId: "adjustment-fixture",
                approvalStatus: "applied",
                taskIds: [],
                canonicalContribution: {},
                providerOutcome: {
                  status: "succeeded",
                  provider: "stripe",
                  providerReference: "re-fixture",
                },
              },
            },
          });
        }
        if (url.pathname.startsWith("/api/admin/contribution-operations/")) {
          if (actionSent && mode.scenario === "refresh-failure")
            return route.fulfill({
              status: 503,
              json: { error: "Synthetic refresh failure" },
            });
          return route.fulfill({ json: { contribution: detail } });
        }
        if (url.pathname === "/react-cleanup-fixture")
          return route.fulfill({
            contentType: "text/html",
            body: `<!doctype html><html lang="en" class="${mode.theme === "dark" ? "dark" : ""}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Core cleanup verification</title></head><body><div id="root"></div></body></html>`,
          });
        blocked.push(request.url());
        return route.abort();
      });
      try {
        await page.goto("http://localhost:48329/react-cleanup-fixture");
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: javascript });
        const opener = page.getByRole("button", {
          name: `Open ${surface} gift`,
          exact: true,
        });
        await expect(opener).toBeVisible();
        await opener.focus();
        await page.keyboard.press("Enter");
        const sheet = page.getByRole("dialog").first();
        await expect(
          sheet.getByText("Synthetic Donor", { exact: true }).first(),
        ).toBeVisible();
        const refund = sheet.getByRole("button", { name: /refund gift/i });
        await expect(refund).toBeEnabled();
        await refund.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog").last();
        const amount = dialog.getByLabel("Amount (USD)", { exact: true });
        await expect(amount).toHaveValue("200.00");
        await amount.fill("200.01");
        await expect(
          dialog.getByRole("button", { name: "Refund gift", exact: true }),
        ).toBeDisabled();
        expect(posts).toHaveLength(0);
        await amount.fill("50");
        await dialog
          .getByLabel("Reason", { exact: true })
          .fill("Synthetic verification refund");
        await dialog.getByRole("checkbox").check();
        if (mode.scenario === "success") {
          const axe = await new AxeBuilder({ page })
            .include('[role="dialog"]')
            .analyze();
          expect(axe.violations).toEqual([]);
          await page.screenshot({
            path: testInfo.outputPath(`${tag}.png`),
            fullPage: true,
          });
        }
        await dialog
          .getByRole("button", { name: "Refund gift", exact: true })
          .click();
        await expect.poll(() => posts.length).toBe(1);
        expect(posts[0].sourceSurface).toBe(
          surface === "Hub" ? "contributions_hub" : "donor_crm_record",
        );
        expect(posts[0].expectedRevision).toBe("2026-05-26T00:00:00.000Z#0");
        expect(posts[0].payload.amount).toBe(5000);
        expect(typeof posts[0].idempotencyKey).toBe("string");
        if (mode.scenario === "failure") {
          await expect(
            dialog.getByText("Synthetic provider failure", { exact: true }),
          ).toBeVisible();
          await expect(amount).toHaveValue("50");
          await expect(
            dialog.getByRole("button", { name: "Retry", exact: true }),
          ).toBeEnabled();
        } else if (mode.scenario === "stale") {
          await expect(
            dialog.getByRole("button", {
              name: "Reload latest gift",
              exact: true,
            }),
          ).toBeVisible();
          await expect(amount).toHaveValue("50");
          await expect(
            dialog.getByRole("button", { name: "Refund gift", exact: true }),
          ).toHaveCount(0);
        } else {
          await expect(
            dialog.getByTestId("operation-result-panel"),
          ).toBeVisible();
          await expect(
            dialog.getByText("Operation completed.", { exact: true }),
          ).toBeVisible();
          if (mode.scenario === "refresh-failure")
            await expect(
              dialog
                .getByText(/refresh|reload/i)
                .filter({ hasText: /fail|could not|unavailable/i })
                .first(),
            ).toBeVisible();
          await dialog
            .getByRole("button", {
              name: "Close operation result",
              exact: true,
            })
            .click();
          await expect(page.getByTestId("operation-result-panel")).toHaveCount(
            0,
          );
        }
        await page.keyboard.press("Escape");
        if (await page.getByRole("dialog").count())
          await page.keyboard.press("Escape");
        await expect(opener).toBeFocused();
        expect(errors).toEqual([]);
        expect(blocked).toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        expect(overflow).toBe(false);
        if (mode.motion === "reduce") {
          const transform = await page
            .locator(".payload-admin-wrapper")
            .first()
            .evaluate((e) => getComputedStyle(e).transform);
          expect(transform).toBe("none");
        }
      } finally {
        await testInfo.attach("synthetic-operation-evidence", {
          body: JSON.stringify({ tag, posts, errors, blocked }, null, 2),
          contentType: "application/json",
        });
      }
    });
  }
