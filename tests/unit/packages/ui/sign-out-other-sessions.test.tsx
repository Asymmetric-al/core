/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ signOut: vi.fn() }));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth }),
}));

import { SignOutOtherSessions } from "../../../../packages/ui/components/auth/sign-out-other-sessions";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SignOutOtherSessions", () => {
  it("signs out every other session and keeps this one", async () => {
    auth.signOut.mockResolvedValue({ error: null });
    render(<SignOutOtherSessions />);
    fireEvent.click(
      screen.getByRole("button", { name: "Sign out other devices" }),
    );
    await waitFor(() =>
      expect(auth.signOut).toHaveBeenCalledWith({ scope: "others" }),
    );
    expect((await screen.findByRole("status")).textContent).toContain(
      "You’re signed out everywhere else.",
    );
  });

  it("says so when it couldn't sign the other devices out", async () => {
    auth.signOut.mockResolvedValue({ error: { message: "network" } });
    render(<SignOutOtherSessions />);
    fireEvent.click(
      screen.getByRole("button", { name: "Sign out other devices" }),
    );
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Other devices couldn’t be signed out. Try again.",
    );
  });
});
