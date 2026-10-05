/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ signOut: vi.fn() }));
vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: session.signOut,
}));
vi.mock("@asym/ui/components/shadcn/sidebar", () => ({
  SidebarTrigger: () => <button type="button">Toggle sidebar</button>,
}));

import { AppHeader } from "../../../../apps/missionary/components/app-header";

afterEach(cleanup);

it("keeps signout pending until the session operation finishes", async () => {
  let finish = () => {};
  session.signOut.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(<AppHeader />);
  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Signing out…" })).toBeTruthy(),
  );
  expect(
    screen
      .getByRole("button", { name: "Signing out…" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await act(async () => finish());
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy(),
  );
});
