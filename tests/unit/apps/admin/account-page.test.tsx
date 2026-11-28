// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("Mission Control's account page (AL-2671 N4)", () => {
  it("offers every staff person their own password change, by the current password, outside the administration pages", async () => {
    const { default: AccountPage, metadata } =
      await import("../../../../apps/admin/app/(app)/account/page");
    const html = renderToStaticMarkup(<AccountPage />);
    expect(metadata).toMatchObject({ title: "Your account" });
    expect(html).toContain("Your account");
    expect(html).toContain('aria-label="Change password"');
    expect(html).toContain("Current password");
    expect(html).toContain('autoComplete="current-password"');
  });
});
