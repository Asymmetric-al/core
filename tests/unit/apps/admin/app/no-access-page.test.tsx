/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Exercise the actual app-local exit controls at the session-action boundary.
import NoAccessPage from "../../../../../apps/admin/app/(auth)/no-access/page";

import type {
  SignOutClientSessionOptions,
  SignOutClientSessionResult,
} from "@asym/auth/client-session";

const session = vi.hoisted(() => ({
  signOut:
    vi.fn<
      (
        options?: SignOutClientSessionOptions,
      ) => Promise<SignOutClientSessionResult>
    >(),
}));
vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: session.signOut,
}));

beforeEach(() => {
  session.signOut.mockReset();
});
afterEach(() => cleanup());

it("draws both exits as buttons, not plain text links", () => {
  render(<NoAccessPage />);

  expect(screen.getByRole("heading", { name: "No access" })).toBeTruthy();
  const home = screen.getByRole("link", { name: "Go to home" });
  expect(home.getAttribute("href")).toBe("/");
  // Button styling comes from the shared button variants.
  expect(home.getAttribute("data-slot")).toBe("button-link");
  expect(screen.getByRole("button", { name: "Switch account" })).toBeTruthy();
  expect(session.signOut).not.toHaveBeenCalled();
});

it("makes switching account the primary exit, since home rejects the same roles", () => {
  render(<NoAccessPage />);

  // The edge proxy sends a rejected role from "/" straight back here, so
  // "Go to home" only helps someone blocked from a single page (Eve). It
  // stays available but secondary, after the primary action.
  const switchAccount = screen.getByRole("button", { name: "Switch account" });
  const home = screen.getByRole("link", { name: "Go to home" });
  expect(switchAccount.getAttribute("data-variant")).toBe("default");
  expect(home.getAttribute("data-variant")).toBe("outline");
  expect(
    switchAccount.compareDocumentPosition(home) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(screen.getByText(/sign in with a different account/i)).toBeTruthy();
});

it("signs out to switch account, since /login sends a signed-in user back", async () => {
  session.signOut.mockResolvedValueOnce({ ok: true, redirected: true });
  render(<NoAccessPage />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Switch account" }));
  });

  expect(session.signOut).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("link", { name: "Switch account" })).toBeNull();
});

it("reports a failed sign-out and lets the person try again", async () => {
  session.signOut.mockImplementationOnce(async (options) => {
    options?.notify?.("Could not sign out. Try again.");
    return {
      ok: false,
      message: "Could not sign out. Try again.",
      redirected: false,
    };
  });
  render(<NoAccessPage />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Switch account" }));
  });

  expect(screen.getByRole("alert").textContent).toBe(
    "Could not sign out. Try again.",
  );
  const retry = screen.getByRole("button", { name: "Switch account" });
  expect(retry.getAttribute("aria-describedby")).toBeTruthy();
});
