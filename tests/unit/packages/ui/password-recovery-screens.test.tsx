/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { AuthApiError } from "@supabase/supabase-js";
import { Activity } from "react";
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

  // Council round 2, B1: Auth answers an unknown address with success, and a
  // known one asked again within the email frequency with a rate limit. Both
  // must read the same, or two requests show who has an account.
  it("answers a rate-limited request exactly as it answers a sent one", async () => {
    render(<ForgotPasswordScreen />);
    type("Email", "ada@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    const sent = (await screen.findByRole("status")).textContent;
    cleanup();

    auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: new AuthApiError(
        "For security purposes, you can only request this after 52 seconds.",
        429,
        "over_email_send_rate_limit",
      ),
    });
    render(<ForgotPasswordScreen />);
    type("Email", "ada@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect((await screen.findByRole("status")).textContent).toBe(sent);
    expect(sent).toContain("ask for a new link in a few minutes");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByLabelText("Email").hasAttribute("aria-invalid")).toBe(
      false,
    );
  });

  it("gives a general message for any other refusal, without Auth's wording", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: new AuthApiError(
        "Database error querying schema",
        500,
        "unexpected_failure",
      ),
    });
    render(<ForgotPasswordScreen />);
    type("Email", "ada@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "The reset link couldn’t be sent. Try again in a moment.",
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
        recovery={{ email: "ada@example.com", secondsLeft: 3600 }}
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
        recovery={{ email: "ada@example.com", secondsLeft: 3600 }}
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
        recovery={{ email: "ada@example.com", secondsLeft: 3600 }}
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

  // Council round 2, B3: as the change-password form does, an error marks
  // only the field at fault and focus moves to it.
  it("marks only the field at fault and moves focus to it", async () => {
    render(
      <ResetPasswordScreen
        appId="donor"
        recovery={{ email: "ada@example.com", secondsLeft: 3600 }}
      />,
    );
    const password = screen.getByLabelText("New password");
    const confirmation = screen.getByLabelText("Confirm new password");
    const save = screen.getByRole("button", { name: "Save new password" });

    type("New password", "short");
    type("Confirm new password", "short");
    fireEvent.click(save);
    let alert = await screen.findByRole("alert");
    expect(password.getAttribute("aria-invalid")).toBe("true");
    expect(confirmation.hasAttribute("aria-invalid")).toBe(false);
    expect(password.getAttribute("aria-describedby")).toContain(alert.id);
    expect(document.activeElement).toBe(password);

    type("New password", "long enough phrase");
    type("Confirm new password", "long enough phrasf");
    fireEvent.click(save);
    alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("don’t match");
    expect(confirmation.getAttribute("aria-invalid")).toBe("true");
    expect(password.hasAttribute("aria-invalid")).toBe(false);
    expect(confirmation.getAttribute("aria-describedby")).toContain(alert.id);
    expect(document.activeElement).toBe(confirmation);
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  // Council round 2, B2: the server checks the recovery window when the page
  // renders; a form left open past it must not save.
  it("refuses to save once the time to choose a password has run out", async () => {
    const start = 1_800_000_000_000;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(start);
    try {
      render(
        <ResetPasswordScreen
          appId="donor"
          recovery={{ email: "ada@example.com", secondsLeft: 120 }}
        />,
      );
      type("New password", "long enough phrase");
      type("Confirm new password", "long enough phrase");
      vi.setSystemTime(start + 121_000);
      fireEvent.click(
        screen.getByRole("button", { name: "Save new password" }),
      );

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toContain("This link has expired");
      expect(
        within(alert)
          .getByRole("link", { name: "Send a new link" })
          .getAttribute("href"),
      ).toBe("/forgot-password");
      expect(auth.updateUser).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
      expect(
        screen.getByLabelText("New password").hasAttribute("aria-invalid"),
      ).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("still saves within the time left", async () => {
    const start = 1_800_000_000_000;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(start);
    try {
      render(
        <ResetPasswordScreen
          appId="donor"
          recovery={{ email: "ada@example.com", secondsLeft: 120 }}
        />,
      );
      type("New password", "long enough phrase");
      type("Confirm new password", "long enough phrase");
      vi.setSystemTime(start + 119_000);
      fireEvent.click(
        screen.getByRole("button", { name: "Save new password" }),
      );
      await waitFor(() => expect(auth.updateUser).toHaveBeenCalledTimes(1));
    } finally {
      vi.useRealTimers();
    }
  });

  // Council round 3: Next keeps a page it navigated away from mounted and
  // hidden in <Activity>, and React runs its Effects again when it is shown
  // again. The window counts from the time left the server gave, once; coming
  // back to the form must not start it over.
  it("does not start the time over when the form is hidden and shown again", async () => {
    const start = 1_800_000_000_000;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(start);
    try {
      const form = (mode: "visible" | "hidden") => (
        <Activity mode={mode}>
          <ResetPasswordScreen
            appId="donor"
            recovery={{ email: "ada@example.com", secondsLeft: 120 }}
          />
        </Activity>
      );
      const { rerender } = render(form("visible"));
      type("New password", "long enough phrase");
      type("Confirm new password", "long enough phrase");

      vi.setSystemTime(start + 121_000);
      rerender(form("hidden"));
      rerender(form("visible"));
      fireEvent.click(
        screen.getByRole("button", { name: "Save new password" }),
      );

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toContain("This link has expired");
      expect(auth.updateUser).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("counts from the new time left when the server gives one", async () => {
    const start = 1_800_000_000_000;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(start);
    try {
      const form = (secondsLeft: number) => (
        <ResetPasswordScreen
          appId="donor"
          recovery={{ email: "ada@example.com", secondsLeft }}
        />
      );
      const { rerender } = render(form(120));
      type("New password", "long enough phrase");
      type("Confirm new password", "long enough phrase");

      // The page is read again 100 seconds in, and the server reports 20 left.
      vi.setSystemTime(start + 100_000);
      rerender(form(20));
      vi.setSystemTime(start + 121_000);
      fireEvent.click(
        screen.getByRole("button", { name: "Save new password" }),
      );

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toContain("This link has expired");
      expect(auth.updateUser).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
