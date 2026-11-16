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
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth }),
}));

import { ChangePasswordForm } from "../../../../packages/ui/components/auth/change-password-form";

beforeEach(() => {
  auth.getUser.mockResolvedValue({
    data: { user: { email: "ada@example.com" } },
    error: null,
  });
  auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
  auth.updateUser.mockResolvedValue({ data: {}, error: null });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Change password" }));

describe("ChangePasswordForm", () => {
  it("checks the current password, then sets the new one", async () => {
    render(<ChangePasswordForm />);
    fill("Current password", "old-password");
    fill("New password", "a new long phrase");
    fill("Confirm new password", "a new long phrase");
    submit();

    await waitFor(() =>
      expect(auth.updateUser).toHaveBeenCalledWith({
        password: "a new long phrase",
      }),
    );
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "old-password",
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "Your password has been changed.",
    );
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
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("says when the current password is wrong and changes nothing", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    });
    render(<ChangePasswordForm />);
    fill("Current password", "wrong");
    fill("New password", "a new long phrase");
    fill("Confirm new password", "a new long phrase");
    submit();

    expect(
      await screen.findByText("That isn’t your current password."),
    ).toBeTruthy();
    expect(auth.updateUser).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(
      screen.getByLabelText("Current password"),
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
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("keeps focus in the form while saving and returns it to the button", async () => {
    let finish!: (value: unknown) => void;
    auth.updateUser.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<ChangePasswordForm />);
    fill("Current password", "old-password");
    fill("New password", "a new long phrase");
    fill("Confirm new password", "a new long phrase");
    const button = screen.getByRole("button", { name: "Change password" });
    button.focus();
    submit();

    const form = screen.getByRole("form", { name: "Change password" });
    await waitFor(() => expect(document.activeElement).toBe(form));
    finish({ data: {}, error: null });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Change password" }),
      ),
    );
  });
});
