import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ForgotPasswordPage from "../../../../apps/admin/app/(auth)/forgot-password/page";

describe("admin sign-in guidance", () => {
  it("uses shared auth-adjacent cards and a real sign-in destination", () => {
    const html = renderToStaticMarkup(<ForgotPasswordPage />);
    expect(html).toContain('data-slot="card"');
    expect(html).toContain(
      "Ask a Mission Control administrator to reset your access.",
    );
    expect(html).toContain('href="/login"');
    expect(html).toContain("Back to sign in");
  });
  it("explains invitation-only accounts and retains hidden unavailable links", () => {
    const source = readFileSync(
      new URL(
        "../../../../apps/admin/app/(auth)/login/page.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    expect(source).toContain("Access is by invitation.");
    expect(source).toContain("or to reset your password.");
    expect(source).toContain("forgotPasswordHref={null}");
    expect(source).toContain("showRegisterLink={false}");
  });
});
