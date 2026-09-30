import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const require = createRequire(path.join(root, "package.json"));
const tailwind = require("@tailwindcss/postcss");
const postcss = createRequire(require.resolve("@tailwindcss/postcss"))(
  "postcss",
);
let directory: string;
let javascript: string;
let css: string;

test.beforeAll(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "core-wallet-layout-"));
  const bundle = path.join(directory, "fixture.js");
  execFileSync(
    "bun",
    ["--no-env-file", "tests/e2e/fixtures/build-donor-wallet.mjs", bundle],
    { cwd: root, stdio: "pipe", timeout: 30_000 },
  );
  javascript = await readFile(bundle, "utf8");
  const stylesheet = path.join(root, "packages/ui/styles/globals.css");
  css = (
    await postcss([tailwind({ base: root, optimize: false })]).process(
      await readFile(stylesheet, "utf8"),
      { from: stylesheet },
    )
  ).css;
});

test.afterAll(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

for (const theme of ["light", "dark"]) {
  for (const width of [320, 1280]) {
    for (const motion of ["reduce", "no-preference"] as const) {
      test(`wallet fields and local actions remain usable in ${theme} at ${width}px with ${motion} motion`, async ({
        page,
      }) => {
        const errors: string[] = [];
        const externalWrites: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("**/*", (route) => {
          if (route.request().method() !== "GET") {
            externalWrites.push(route.request().method());
          }
          return route.abort();
        });
        await page.setViewportSize({
          width,
          height: width === 320 ? 568 : 900,
        });
        await page.emulateMedia({ reducedMotion: motion });
        await page.setContent(
          `<!doctype html><html lang="en" class="${theme === "dark" ? "dark" : ""}"><head><meta charset="utf-8"><title>Wallet regression</title></head><body><div id="root"></div></body></html>`,
        );
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: javascript });
        const add = page.getByRole("button", {
          name: "Add Payment Method",
          exact: true,
        });
        await expect(
          page.getByRole("heading", { name: "Wallet", exact: true }),
        ).toBeVisible();
        const cardHeaders = page
          .getByRole("article")
          .locator('[data-slot="card-header"]');
        await expect(cardHeaders).toHaveCount(2);
        for (const header of await cardHeaders.all()) {
          const centers = await header.evaluate((element) =>
            [...element.children].map((child) => {
              const bounds = child.getBoundingClientRect();
              return bounds.y + bounds.height / 2;
            }),
          );
          expect(centers).toHaveLength(2);
          expect(Math.abs(centers[0]! - centers[1]!)).toBeLessThanOrEqual(1);
        }
        await add.click();
        const dialog = page.getByRole("dialog", { name: "Add Payment Method" });
        await expect(dialog).toBeVisible();
        const street = `123 ${"LongAddressSegment".repeat(8)}`;
        for (const [name, value] of [
          ["Card Number", "5555 5555 5555 4444"],
          ["Expiration", "12/29"],
          ["CVC", "123"],
          ["Cardholder Name", "Test Donor"],
          ["Street Address", street],
          ["City", "Bangkok"],
          ["State", "Test"],
          ["ZIP Code", "12345"],
        ]) {
          await dialog.getByRole("textbox", { name, exact: true }).fill(value);
        }
        await dialog
          .getByRole("button", { name: "Save Payment Method" })
          .click();
        await expect(dialog).toBeHidden();
        await expect(
          page.getByText("TEST DONOR", { exact: true }),
        ).toBeVisible();
        const address = page.getByText(street, { exact: false });
        await expect(address).toBeVisible();
        const addressBounds = await address.evaluate((element) => {
          const article = element.closest("article")!.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(element);
          return {
            article: article.toJSON(),
            text: [...range.getClientRects()].map((rect) => rect.toJSON()),
          };
        });
        for (const rect of addressBounds.text) {
          expect(rect.left).toBeGreaterThanOrEqual(addressBounds.article.left);
          expect(rect.right).toBeLessThanOrEqual(addressBounds.article.right);
        }
        await add.click();
        await dialog
          .getByRole("tab", { name: "Bank Account", exact: true })
          .click();
        await dialog
          .getByRole("textbox", { name: "Routing Number", exact: true })
          .fill("110000000");
        await dialog
          .getByLabel("Account Number", { exact: true })
          .fill("000123456789");
        await dialog
          .getByRole("textbox", { name: "Account Holder Name", exact: true })
          .fill("Bank Donor");
        await dialog
          .getByRole("button", { name: "Cancel", exact: true })
          .click();
        await expect(dialog).toBeHidden();
        await expect(add).toBeFocused();
        await add.click();
        await expect(
          dialog.getByRole("textbox", { name: "Card Number", exact: true }),
        ).toHaveValue("");
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(add).toBeFocused();
        const bank = page.getByRole("article", {
          name: "Chase Checking ending in 6789",
        });
        await bank
          .getByRole("button", { name: "More actions for Chase Checking" })
          .click();
        await page
          .getByRole("menuitem", { name: "Set as Default", exact: true })
          .click();
        await expect(bank.getByText("Default", { exact: true })).toBeVisible();
        await expect(page.getByRole("menu")).toHaveCount(0);

        const visa = page.getByRole("article", { name: "visa ending in 4242" });
        await visa
          .getByRole("button", { name: "More actions for visa ending in 4242" })
          .click();
        await page
          .getByRole("menuitem", { name: "Edit Details", exact: true })
          .click();
        const edit = page.getByRole("dialog", { name: "Edit Credit Card" });
        await expect(
          edit.getByRole("textbox", { name: "Card Number", exact: true }),
        ).toBeDisabled();
        await expect(
          edit.getByRole("textbox", { name: "Expiration", exact: true }),
        ).toHaveValue("12/26");
        await edit
          .getByRole("textbox", { name: "Cardholder Name", exact: true })
          .fill("Updated Donor");
        await edit.getByRole("button", { name: "Update Method" }).click();
        await expect(edit).toBeHidden();
        await expect(
          visa.getByText("UPDATED DONOR", { exact: true }),
        ).toBeVisible();

        await visa
          .getByRole("button", { name: "Move support for The Miller Family" })
          .click();
        const move = page.getByRole("dialog", { name: "Move Support" });
        await expect(
          move.getByRole("button", { name: "Confirm Move", exact: true }),
        ).toBeDisabled();
        await move.getByRole("radio", { name: /Chase Checking/ }).click();
        await move.getByRole("radio", { name: /Chase Checking/ }).focus();
        await page.keyboard.press("ArrowDown");
        await expect(
          move.getByRole("radio", { name: /MASTERCARD/ }),
        ).toBeChecked();
        await page.keyboard.press("ArrowUp");
        await expect(
          move.getByRole("radio", { name: /Chase Checking/ }),
        ).toBeChecked();
        await move
          .getByRole("button", { name: "Confirm Move", exact: true })
          .click();
        await expect(move).toBeHidden();
        await expect(
          bank.getByText("The Miller Family", { exact: true }),
        ).toBeVisible();
        await expect(
          visa.getByText("The Miller Family", { exact: true }),
        ).toHaveCount(0);

        await visa
          .getByRole("button", { name: "More actions for visa ending in 4242" })
          .click();
        await page
          .getByRole("menuitem", { name: "Remove", exact: true })
          .click();
        const transfer = page.getByRole("dialog", {
          name: "Active Support Detected",
        });
        await expect(
          transfer.getByRole("button", {
            name: "Transfer & Delete",
            exact: true,
          }),
        ).toBeDisabled();
        await transfer.getByRole("radio", { name: /Chase Checking/ }).click();
        await transfer
          .getByRole("button", { name: "Transfer & Delete", exact: true })
          .click();
        await expect(transfer).toBeHidden();
        await expect(visa).toHaveCount(0);
        await expect(
          bank.getByText("Clean Water Initiative", { exact: true }),
        ).toBeVisible();

        const added = page.getByRole("article", {
          name: "mastercard ending in 4444",
        });
        await added
          .getByRole("button", {
            name: "More actions for mastercard ending in 4444",
          })
          .click();
        await page
          .getByRole("menuitem", { name: "Remove", exact: true })
          .click();
        await expect(added).toHaveCount(0);
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await bank
          .getByRole("button", { name: "More actions for Chase Checking" })
          .click();
        await page
          .getByRole("menuitem", { name: "Remove", exact: true })
          .click();
        await expect(
          transfer.getByText("No Backup Method", { exact: true }),
        ).toBeVisible();
        await expect(
          transfer.getByRole("button", {
            name: "Transfer & Delete",
            exact: true,
          }),
        ).toBeDisabled();
        await transfer
          .getByRole("button", { name: "Cancel", exact: true })
          .click();
        await expect(transfer).toBeHidden();
        await expect(
          bank.getByRole("button", { name: "More actions for Chase Checking" }),
        ).toBeFocused();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        expect(externalWrites).toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  }
}
