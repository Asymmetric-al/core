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
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({
    loading: false,
    user: { email: "jordan@example.test" },
    profile: {
      first_name: "Jordan",
      last_name: "Hale",
      display_name: "Jordan Hale",
      email: "jordan@example.test",
      avatar_url: null,
    },
  }),
}));
vi.mock("@asym/ui/components/shadcn/sidebar", async () => {
  const React = await import("react");
  const Pass = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  return {
    SidebarMenu: Pass,
    SidebarMenuItem: Pass,
    SidebarMenuButton: React.forwardRef<
      HTMLButtonElement,
      React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: string }
    >(function SidebarMenuButton({ size: _size, ...props }, ref) {
      return <button ref={ref} type="button" {...props} />;
    }),
    useSidebar: () => ({ isMobile: false, setOpenMobile: vi.fn() }),
  };
});

import { SidebarAccountMenu } from "../../../../apps/missionary/components/sidebar-account-menu";

afterEach(cleanup);

// Sign-out lives in the account menu (the workspace bar has none). It stays
// pending until the session operation finishes.
it("keeps sign-out pending until the session operation finishes", async () => {
  let finish = () => {};
  session.signOut.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(<SidebarAccountMenu roleLabel="Missionary" />);
  const trigger = screen.getByRole("button", {
    name: "Account menu for Jordan Hale",
  });
  fireEvent.click(trigger);
  fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }));
  expect(session.signOut).toHaveBeenCalledTimes(1);

  fireEvent.click(trigger);
  const pending = await screen.findByRole("menuitem", { name: "Signing out…" });
  expect(pending.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(pending);
  expect(session.signOut).toHaveBeenCalledTimes(1);

  await act(async () => finish());
  await waitFor(() => {
    const ready = screen.getByRole("menuitem", { name: "Sign out" });
    expect(ready.getAttribute("aria-disabled")).not.toBe("true");
  });
});

it("offers settings and help from the account menu", async () => {
  render(<SidebarAccountMenu roleLabel="Missionary" />);
  fireEvent.click(
    screen.getByRole("button", { name: "Account menu for Jordan Hale" }),
  );
  expect(
    (await screen.findByRole("menuitem", { name: "Settings" })).getAttribute(
      "href",
    ),
  ).toBe("/settings");
  expect(
    screen
      .getByRole("menuitem", { name: "About this app" })
      .getAttribute("href"),
  ).toBe("/help/about");
});
