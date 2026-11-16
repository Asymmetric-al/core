/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@asym/auth/auth-screen", () => ({
  requireAnonymousVisitor: async () => ({ nextPath: null }),
}));
vi.mock("@asym/env", () => ({ serverEnv: { DEMO_ONLY_LOGIN: false } }));

// eslint-disable-next-line no-restricted-imports -- AL-1931: The donor recovery page is the unit under test.
import DonorForgotPasswordPage from "../../../apps/donor/app/(auth)/forgot-password/page";
// eslint-disable-next-line no-restricted-imports -- AL-1931: The missionary login page decides whether to offer registration.
import MissionaryLoginPage from "../../../apps/missionary/app/(auth)/login/page";
// eslint-disable-next-line no-restricted-imports -- AL-1931: The missionary recovery page is the unit under test.
import MissionaryForgotPasswordPage from "../../../apps/missionary/app/forgot-password/page";
import { FullLoginCard } from "../../../packages/ui/components/auth/FullLoginCard";

afterEach(cleanup);

// Neither app can reset a password by email yet, and neither has a support
// inbox or phone line. Each recovery page says what the person can do next
// instead of pointing at a support contact that doesn't exist.
describe("account recovery", () => {
  it("tells a missionary who can get them back in", () => {
    render(<MissionaryForgotPasswordPage />);
    expect(
      screen.getByRole("heading", { name: "Can’t sign in?" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /your organization’s administrator manages missionary accounts/i,
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/contact support/i)).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Back to sign in" })
        .getAttribute("href"),
    ).toBe("/login");
  });

  it("gives a donor steps they can take", () => {
    render(<DonorForgotPasswordPage />);
    expect(
      screen.getByRole("heading", { name: "Can’t sign in?" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/the email address your gift receipts go to/i),
    ).toBeTruthy();
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
