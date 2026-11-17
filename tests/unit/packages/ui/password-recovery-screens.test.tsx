/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}));
const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));

vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { ForgotPasswordScreen } from "../../../../packages/ui/components/auth/ForgotPasswordScreen";
import { FullLoginCard } from "../../../../packages/ui/components/auth/FullLoginCard";
import { ResetPasswordScreen } from "../../../../packages/ui/components/auth/ResetPasswordScreen";

beforeEach(() => {
  auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  auth.updateUser.mockResolvedValue({ data: {}, error: null });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("asking for a reset link", () => {
  it("sends the link back to the host the page was opened on", async () => {
    render(<ForgotPasswordScreen />);
    type("Email", "  Ada@Example.com ");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() =>
      expect(auth.resetPasswordForEmail).toHaveBeenCalledTimes(1),
    );
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("ada@example.com", {
      redirectTo: `${window.location.origin}/forgot-password/callback`,
    });
  });

  it("answers the same way whether or not the address has an account", async () => {
    render(<ForgotPasswordScreen />);
    type("Email", "ada@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    const status = await screen.findByRole("status");
    expect(status.textContent).toContain(
      "If an account uses ada@example.com, we’ve sent it a link",
    );
    expect(status.textContent).toContain("in this browser");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("says what went wrong when the request is refused", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: new Error("Email rate limit exceeded"),
    });
    render(<ForgotPasswordScreen />);
    type("Email", "ada@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Email rate limit exceeded",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("sends one request for a double submit", async () => {
    let finish: (value: unknown) => void = () => undefined;
    auth.resetPasswordForEmail.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<ForgotPasswordScreen />);
    type("Email", "ada@example.com");
    const form = screen
      .getByRole("button", { name: "Send reset link" })
      .closest("form") as HTMLFormElement;
    fireEvent.submit(form);
    fireEvent.submit(form);
    // Pending: the submit control is natively disabled and shows progress.
    const pendingButton = screen.getByRole("button", {
      name: "Send reset link",
    });
    expect(pendingButton.hasAttribute("disabled")).toBe(true);
    finish({ data: {}, error: null });

    await screen.findByRole("status");
    expect(auth.resetPasswordForEmail).toHaveBeenCalledTimes(1);
  });

  it("labels its own field while the sign-in screen stays mounted and hidden", () => {
    // Next keeps a visited route mounted (hidden) after a client navigation,
    // so the sign-in card's fields share the document with this form.
    render(
      <>
        <div hidden>
          <FullLoginCard
            title="Sign in"
            email=""
            password=""
            onEmailChange={vi.fn()}
            onPasswordChange={vi.fn()}
            onSubmit={vi.fn()}
          />
        </div>
        <ForgotPasswordScreen />
      </>,
    );
    const form = screen
      .getByRole("button", { name: "Send reset link" })
      .closest("form") as HTMLFormElement;
    const label = form.querySelector("label") as HTMLLabelElement;
    const input = form.querySelector('input[type="email"]') as HTMLInputElement;

    expect(label.htmlFor).toBe(input.id);
    expect(document.querySelectorAll(`[id="${input.id}"]`)).toHaveLength(1);
    expect(label.control).toBe(input);
  });

  it("links back to sign-in", () => {
    render(<ForgotPasswordScreen loginHref="/login" />);
    expect(
      screen
        .getByRole("link", { name: "Back to sign in" })
        .getAttribute("href"),
    ).toBe("/login");
  });
});

describe("choosing a new password", () => {
  it("explains an expired or reused link and offers a new one", () => {
    render(<ResetPasswordScreen appId="donor" recovery={null} />);

    expect(
      screen.getByRole("heading", { name: "This link has expired" }),
    ).toBeTruthy();
    expect(screen.getByText(/opened in a different browser/)).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Send a new link" })
        .getAttribute("href"),
    ).toBe("/forgot-password");
    expect(screen.queryByLabelText("New password")).toBeNull();
  });

  it("checks length and confirmation before saving", async () => {
    render(
      <ResetPasswordScreen
        appId="donor"
        recovery={{ email: "ada@example.com" }}
      />,
    );
    expect(screen.getByText(/ada@example.com/)).toBeTruthy();

    type("New password", "short");
    type("Confirm new password", "short");
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "at least 8 characters",
    );

    type("New password", "long enough phrase");
    type("Confirm new password", "long enough phrasf");
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "don’t match",
    );
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("saves the password and continues signed in to the app", async () => {
    render(
      <ResetPasswordScreen
        appId="admin"
        recovery={{ email: "ada@example.com" }}
      />,
    );
    type("New password", "long enough phrase");
    type("Confirm new password", "long enough phrase");
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    expect(auth.updateUser).toHaveBeenCalledWith({
      password: "long enough phrase",
    });
    expect(router.refresh).toHaveBeenCalled();
  });

  it("keeps the person on the form when Supabase refuses the password", async () => {
    auth.updateUser.mockResolvedValue({
      data: null,
      error: new Error(
        "New password should be different from the old password.",
      ),
    });
    render(
      <ResetPasswordScreen
        appId="donor"
        recovery={{ email: "ada@example.com" }}
      />,
    );
    type("New password", "long enough phrase");
    type("Confirm new password", "long enough phrase");
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "different from the old password",
    );
    expect(router.replace).not.toHaveBeenCalled();
  });
});
