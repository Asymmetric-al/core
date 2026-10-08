/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1976: Exercise the actual app-local escape control and page at the session-action boundary.
import NoAccessPage from "../../../../apps/missionary/app/no-access/page";

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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  session.signOut.mockReset();
});
afterEach(() => cleanup());

it("offers explicit account switching without signing out on mount", () => {
  render(<NoAccessPage />);

  expect(screen.getByRole("heading", { name: "No access" })).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Go to home" }).getAttribute("href"),
  ).toBe("/");
  expect(screen.getByRole("button", { name: "Switch account" })).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Switch account" })).toBeNull();
  expect(session.signOut).not.toHaveBeenCalled();
});

it("keeps the exit pending, reports failure, and allows a retry", async () => {
  const first = deferred<SignOutClientSessionResult>();
  const retry = deferred<SignOutClientSessionResult>();
  session.signOut.mockReturnValueOnce(first.promise);
  session.signOut.mockReturnValueOnce(retry.promise);
  render(<NoAccessPage />);

  const button = screen.getByRole("button", { name: "Switch account" });
  button.focus();
  fireEvent.click(button);

  const pending = screen.getByRole("button", { name: "Signing out…" });
  expect(pending.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(pending);
  fireEvent.click(pending);
  expect(session.signOut).toHaveBeenCalledTimes(1);

  await act(async () => {
    session.signOut.mock.calls[0]![0]!.notify!(
      "Unable to sign out. Try again.",
    );
    first.resolve({
      ok: false,
      message: "Unable to sign out. Try again.",
      redirected: false,
    });
  });

  const alert = screen.getByRole("alert");
  expect(alert.textContent).toBe("Unable to sign out. Try again.");
  const available = screen.getByRole("button", { name: "Switch account" });
  expect(available.getAttribute("aria-describedby")).toBe(alert.id);
  expect(available.getAttribute("aria-disabled")).not.toBe("true");
  expect(screen.queryByRole("link", { name: "Switch account" })).toBeNull();

  fireEvent.click(available);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByRole("button", { name: "Signing out…" })).toBeTruthy();
  expect(session.signOut).toHaveBeenCalledTimes(2);
  await act(async () => {
    retry.resolve({ ok: true, redirected: true });
  });
  expect(screen.queryByRole("alert")).toBeNull();
});

it("leaves successful redirect and session cleanup with the existing operation", async () => {
  const success = deferred<SignOutClientSessionResult>();
  session.signOut.mockReturnValueOnce(success.promise);
  render(<NoAccessPage />);

  fireEvent.click(screen.getByRole("button", { name: "Switch account" }));
  const options = session.signOut.mock.calls[0]![0]!;
  expect(options.notify).toBeTypeOf("function");
  expect(options.redirect).toBeUndefined();
  expect(options.redirectTo).toBeUndefined();
  expect(options.createClient).toBeUndefined();
  expect(options.signOutOnServer).toBeUndefined();

  await act(async () => {
    success.resolve({ ok: true, redirected: true });
  });
  expect(session.signOut).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByRole("button", { name: "Switch account" })).toBeTruthy();
});
