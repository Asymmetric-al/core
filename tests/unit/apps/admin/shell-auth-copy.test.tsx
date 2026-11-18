import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ForgotPasswordPage from "../../../../apps/admin/app/(auth)/forgot-password/page";

describe("admin sign-in guidance", () => {
  it("offers a self-service reset on the shared auth card", () => {
    const html = renderToStaticMarkup(<ForgotPasswordPage />);
    expect(html).toContain('data-slot="card"');
    expect(html).toContain("Reset your password");
    expect(html).toContain("Send reset link");
    expect(html).not.toContain("not available");
    expect(html).toContain('href="/login"');
    expect(html).toContain("Back to sign in");
  });
  it("explains invitation-only accounts and links to password reset", () => {
    const source = readFileSync(
      new URL(
        "../../../../apps/admin/app/(auth)/login/page.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    expect(source).toContain("Access is by invitation.");
    expect(source).not.toContain("reset your password");
    // The default link points at /forgot-password, which now works.
    expect(source).not.toContain("forgotPasswordHref");
    expect(source).toContain("showRegisterLink={false}");
  });
});
