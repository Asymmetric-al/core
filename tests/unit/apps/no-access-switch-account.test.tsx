// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Council round 2 on slice B, BR8: "Switch account" on each app's no-access
 * page signs the person out first. A link to /login cannot switch: the
 * sign-in screen sends a signed-in person straight on, and in the donor app
 * a person with donor memberships in two organizations lands back on
 * /no-access, unable to change account.
 */

const session = vi.hoisted(() => ({ signOutClientSession: vi.fn() }));
vi.mock("@asym/auth/client-session", () => session);
vi.mock("next/navigation", () => ({
  usePathname: () => "/no-access",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

beforeEach(() => {
  session.signOutClientSession.mockReset();
});

afterEach(cleanup);

describe.each([
  [
    "Mission Control",
    () => import("../../../apps/admin/app/(auth)/no-access/page"),
  ],
  [
    "the missionary workspace",
    () => import("../../../apps/missionary/app/no-access/page"),
  ],
  ["the donor app", () => import("../../../apps/donor/app/no-access/page")],
])("%s's no-access page", (_app, load) => {
  it("switches account by signing out first, not through a link to sign-in", async () => {
    session.signOutClientSession.mockResolvedValue({
      ok: true,
      redirected: true,
    });
    const { default: NoAccessPage } = await load();
    render(<NoAccessPage />);

    expect(screen.queryByRole("link", { name: "Switch account" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Switch account" }));

    await waitFor(() =>
      expect(session.signOutClientSession).toHaveBeenCalledTimes(1),
    );
  });

  it("says why when signing out fails, and lets the person try again", async () => {
    session.signOutClientSession.mockImplementation(
      async ({ notify }: { notify: (message: string) => void }) => {
        notify("We could not sign you out. Try again.");
        return { ok: false, message: "failed", redirected: false };
      },
    );
    const { default: NoAccessPage } = await load();
    render(<NoAccessPage />);

    fireEvent.click(screen.getByRole("button", { name: "Switch account" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("We could not sign you out. Try again.");
    const button = screen.getByRole("button", { name: "Switch account" });
    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
    expect(button.getAttribute("aria-describedby")).toBe(alert.id);
  });
});
