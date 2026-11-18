/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@asym/auth/auth-screen", () => ({
  requireAnonymousVisitor: async () => ({ nextPath: null }),
}));
vi.mock("@asym/env", () => ({ serverEnv: { DEMO_ONLY_LOGIN: false } }));

// eslint-disable-next-line no-restricted-imports -- AL-2673: The admin recovery page is the unit under test.
import AdminForgotPasswordPage from "../../../apps/admin/app/(auth)/forgot-password/page";
// eslint-disable-next-line no-restricted-imports -- AL-1931: The donor recovery page is the unit under test.
import DonorForgotPasswordPage from "../../../apps/donor/app/(auth)/forgot-password/page";
// eslint-disable-next-line no-restricted-imports -- AL-1931: The missionary login page decides whether to offer registration.
import MissionaryLoginPage from "../../../apps/missionary/app/(auth)/login/page";
// eslint-disable-next-line no-restricted-imports -- AL-1931: The missionary recovery page is the unit under test.
import MissionaryForgotPasswordPage from "../../../apps/missionary/app/forgot-password/page";
import { FullLoginCard } from "../../../packages/ui/components/auth/FullLoginCard";

afterEach(cleanup);

// Every app resets a password by email through Supabase Auth (WP0b, A09).
// None has a support inbox or phone line, so no recovery page points at one.
describe("account recovery", () => {
  it.each([
    ["Mission Control", AdminForgotPasswordPage],
    ["the donor portal", DonorForgotPasswordPage],
    ["the missionary portal", MissionaryForgotPasswordPage],
  ])("lets a person on %s ask for a reset link", (_surface, Page) => {
    render(<Page />);
    expect(
      screen.getByRole("heading", { name: "Reset your password" }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Send reset link" }),
    ).toBeTruthy();
    expect(screen.queryByText(/isn’t available|not available/i)).toBeNull();
    expect(screen.queryByText(/contact support/i)).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Back to sign in" })
        .getAttribute("href"),
    ).toBe("/login");
  });
});

describe("missionary sign-in", () => {
  // /register only says registration is unavailable, so the login page
  // explains invitations instead of linking there.
  it("explains invitations instead of linking to an unavailable register page", async () => {
    const element = await MissionaryLoginPage({
      searchParams: Promise.resolve({}),
    });
    expect(element.props.showRegisterLink).toBe(false);
    expect(element.props.accountNote).toBe(
      "Missionary accounts are set up by invitation from your organization.",
    );
  });

  it("shows the account note in place of the register link", () => {
    render(
      <FullLoginCard
        title="Sign In"
        email=""
        password=""
        showRegisterLink={false}
        accountNote="Accounts are set up by invitation."
        onEmailChange={vi.fn()}
        onPasswordChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText("Accounts are set up by invitation.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Register" })).toBeNull();
  });
});
