import { expect, test } from "@playwright/test";

async function gotoContributions(page: Parameters<typeof test>[0]["page"]) {
  await page.goto("/contributions");
  await expect(
    page.getByRole("heading", { name: "Contributions" }),
  ).toBeVisible();
}

test.describe("Admin contributions", () => {
  test("detail sheet exposes dialog semantics and restores focus on close", async ({
    page,
  }) => {
    await gotoContributions(page);

    const donorTrigger = page.getByRole("button", { name: "Sarah Mitchell" });

    await donorTrigger.click();

    const dialog = page.getByRole("dialog", { name: "Contribution Details" });

    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-slot="sheet-title"]')).toHaveText(
      "Contribution Details",
    );
    await expect(
      dialog.locator('[data-slot="sheet-description"]'),
    ).toContainText("Review contribution details");

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(donorTrigger).toBeFocused();

    await donorTrigger.click();
    await expect(dialog).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(donorTrigger).toBeFocused();
  });

  test("unfinished contribution actions are explicitly unavailable", async ({
    page,
  }) => {
    await gotoContributions(page);

    await expect(page.getByRole("button", { name: "Export" })).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Add Contribution" }),
    ).toBeDisabled();

    await page.getByRole("checkbox", { name: "Select row" }).first().click();
    await expect(
      page.getByRole("button", { name: "Send Receipts" }),
    ).toBeDisabled();
    await expect(page.getByRole("button", { name: "Delete" })).toBeDisabled();

    const failedContributionRow = page
      .locator("tr")
      .filter({ hasText: "Robert Johnson" });

    await failedContributionRow
      .getByRole("button", { name: "Open menu" })
      .click();

    const actionMenu = page.locator('[data-slot="dropdown-menu-content"]');
    await expect(
      actionMenu.getByRole("menuitem", { name: "Email Donor" }),
    ).toHaveAttribute("data-disabled", "");
    await expect(
      actionMenu.getByRole("menuitem", { name: "Send Receipt" }),
    ).toHaveAttribute("data-disabled", "");
    await expect(
      actionMenu.getByRole("menuitem", { name: "Retry Payment" }),
    ).toHaveAttribute("data-disabled", "");

    await page.keyboard.press("Escape");

    const failedDonorTrigger = page.getByRole("button", {
      name: "Robert Johnson",
    });
    await failedDonorTrigger.click();

    const dialog = page.getByRole("dialog", { name: "Contribution Details" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Copy Transaction ID" }),
    ).toBeEnabled();
    await expect(
      dialog.getByRole("button", { name: "Email Donor" }),
    ).toBeDisabled();
    await expect(
      dialog.getByRole("button", { name: "Send Receipt" }),
    ).toBeDisabled();
    await expect(
      dialog.getByRole("button", { name: "Retry Payment" }),
    ).toBeDisabled();
  });
});
