import { test, expect } from "./test";

test("library search delegates native Enter and Space activation without an extra keyboard stop", async ({
  page,
}) => {
  // Placeholder demo imagery is irrelevant to trigger semantics. Fulfill only
  // these image requests locally; all other external/API requests still fail.
  await page.route("https://cdn.shadcnstudio.com/**", async (route) => {
    if (route.request().resourceType() !== "image") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
    });
  });
  const section = page.getByRole("region", {
    name: "Library search delegation",
  });
  const trigger = section.getByRole("button", { name: "Open library search" });
  const activations = section.getByRole("status", {
    name: "Library trigger activations",
  });
  for (const [index, key] of ["Enter", "Space"].entries()) {
    await trigger.focus();
    await expect(trigger).toBeFocused();
    expect(
      await trigger.evaluate((element) => ({
        role: element.parentElement?.getAttribute("role"),
        keyboardStop: element.parentElement?.hasAttribute("tabindex"),
      })),
    ).toEqual({ role: "presentation", keyboardStop: false });
    await trigger.press(key);
    const dialog = page.getByRole("dialog", { name: "Command Palette" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("combobox")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // The modal correctly removes its background from the accessibility tree;
    // read the native trigger's click count after that background is restored.
    await expect(activations).toHaveText(String(index + 1));
  }
});
