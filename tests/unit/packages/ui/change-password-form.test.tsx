/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const provider = vi.hoisted(() => ({
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth: provider }),
}));

import { ChangePasswordForm } from "../../../../packages/ui/components/auth/change-password-form";

const passwordRoute = vi.fn<(body: unknown) => Promise<Response>>();

beforeEach(() => {
  for (const call of Object.values(provider))
    call.mockRejectedValue(new Error("The browser called the provider."));
  passwordRoute.mockResolvedValue(Response.json({ ok: true }));
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (
        String(input).endsWith("/api/auth/password") &&
        init?.method === "POST"
      )
        return passwordRoute(JSON.parse(String(init.body)));
      throw new Error(`Unexpected request from the form: ${String(input)}`);
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Change password" }));
const refusal = (status: number, code: string, error: string) =>
  Response.json({ ok: false, code, error }, { status });
const providerCalls = () =>
  Object.values(provider).reduce(
    (sum, call) => sum + call.mock.calls.length,
    0,
  );

function fillChange(current = "old-password") {
  fill("Current password", current);
  fill("New password", "a new long phrase");
  fill("Confirm new password", "a new long phrase");
}

describe("ChangePasswordForm", () => {
  it("sends the current and the new password to Core's password route, never to the provider", async () => {
    render(<ChangePasswordForm />);
    fillChange();
    submit();

    expect((await screen.findByRole("status")).textContent).toContain(
      "Your password has been changed.",
    );
    expect(passwordRoute).toHaveBeenCalledWith({
      currentPassword: "old-password",
      newPassword: "a new long phrase",
    });
    expect(providerCalls()).toBe(0);
    expect(
      (screen.getByLabelText("New password") as HTMLInputElement).value,
    ).toBe("");
  });

  it("explains what to fix before calling the server", async () => {
    render(<ChangePasswordForm />);
    fill("Current password", "old-password");
    fill("New password", "short");
    fill("Confirm new password", "different");
    submit();

    expect(await screen.findByText("Use at least 8 characters.")).toBeTruthy();
    expect(screen.getByText("The passwords don’t match.")).toBeTruthy();
    expect(passwordRoute).not.toHaveBeenCalled();
  });

  it("says when Core refuses the current password, beside that field, and moves focus to it", async () => {
    passwordRoute.mockResolvedValue(
      refusal(
        403,
        "CURRENT_PASSWORD_REFUSED",
        "That isn’t your current password.",
      ),
    );
    render(<ChangePasswordForm />);
    fillChange("wrong");
    submit();

    expect(
      await screen.findByText("That isn’t your current password."),
    ).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByLabelText("Current password"),
    );
    expect(screen.queryByText("Your password has been changed.")).toBeNull();
  });

  it("shows Core's words for any other refusal, and a general message when the route cannot be reached", async () => {
    passwordRoute.mockResolvedValueOnce(
      refusal(
        429,
        "PASSWORD_CHECK_LIMITED",
        "Too many attempts. Try again in a few minutes, or reset your password.",
      ),
    );
    render(<ChangePasswordForm />);
    fillChange();
    submit();
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Too many attempts. Try again in a few minutes, or reset your password.",
    );

    passwordRoute.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    submit();
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "Your password couldn’t be changed. Try again.",
      ),
    );
  });

  it("refuses reusing the current password", async () => {
    render(<ChangePasswordForm />);
    fill("Current password", "same old phrase");
    fill("New password", "same old phrase");
    fill("Confirm new password", "same old phrase");
    submit();

    expect(
      await screen.findByText("Choose a password you haven’t used here."),
    ).toBeTruthy();
    expect(passwordRoute).not.toHaveBeenCalled();
  });

  it("keeps focus in the form while saving and returns it to the button", async () => {
    let finish!: (value: Response) => void;
    passwordRoute.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<ChangePasswordForm />);
    fillChange();
    const button = screen.getByRole("button", { name: "Change password" });
    button.focus();
    submit();

    const form = screen.getByRole("form", { name: "Change password" });
    await waitFor(() => expect(document.activeElement).toBe(form));
    finish(Response.json({ ok: true }));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Change password" }),
      ),
    );
  });
});
