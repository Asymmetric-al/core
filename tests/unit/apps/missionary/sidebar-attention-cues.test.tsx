/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: The header owns the trigger that opens the mobile drawer.
import { AppHeader } from "../../../../apps/missionary/components/app-header";
// eslint-disable-next-line no-restricted-imports -- AL-1931: Exercise the actual missionary sidebar in its expanded, icon and mobile forms.
import { AppSidebar } from "../../../../apps/missionary/components/app-sidebar";
import { SidebarProvider } from "../../../../packages/ui/components/shadcn/sidebar";

const counts = vi.hoisted(() => ({ followRequests: 4, overdue: 0 }));
const screenSize = vi.hoisted(() => ({ phone: false }));

vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: vi.fn(),
  subscribeToClientAuthState: () => () => {},
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: () => ({ data: {} }),
  usePendingFollowRequestCount: () => ({ data: counts.followRequests }),
}));
// The overdue count comes from the portal snapshot; stub the view builder so
// the test controls it directly.
vi.mock("@asym/missionary/components/dashboard-view", () => ({
  buildMissionaryDashboardView: () => ({
    pendingTasks: Array.from({ length: counts.overdue }, () => ({
      overdue: true,
    })),
  }),
}));

beforeEach(() => {
  counts.followRequests = 4;
  counts.overdue = 0;
  screenSize.phone = false;
  vi.stubGlobal("innerWidth", 1440);
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: screenSize.phone && media.includes("max-width"),
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderSidebar({ open = true }: { open?: boolean } = {}) {
  return render(
    <SidebarProvider defaultOpen={open}>
      <AppSidebar role="missionary" />
      <AppHeader title="Home" />
    </SidebarProvider>,
  );
}

describe("sidebar attention counts say what they count", () => {
  it("shows what the Updates count means in the expanded sidebar", () => {
    renderSidebar();
    const link = screen.getByRole("link", {
      name: "Updates, 4 requests to follow you",
    });
    expect(link.getAttribute("href")).toBe("/feed");
    // The meaning is visible text, not only a screen-reader label.
    const cue = within(link).getByText("4 requests");
    expect(cue.closest(".sr-only")).toBeNull();
    expect(cue.getAttribute("aria-hidden")).toBe("true");
    expect(link.querySelector(".sr-only")).toBeNull();
  });

  it("uses the singular for one follow request", () => {
    counts.followRequests = 1;
    renderSidebar();
    const link = screen.getByRole("link", {
      name: "Updates, 1 request to follow you",
    });
    expect(within(link).getByText("1 request")).toBeTruthy();
  });

  it("says overdue beside the Tasks count", () => {
    counts.overdue = 2;
    renderSidebar();
    const link = screen.getByRole("link", { name: "Tasks, 2 overdue" });
    expect(within(link).getByText("2 overdue")).toBeTruthy();
  });

  it("leaves the plain name when nothing is waiting", () => {
    counts.followRequests = 0;
    renderSidebar();
    const link = screen.getByRole("link", { name: "Updates" });
    expect(within(link).queryByText(/request/)).toBeNull();
    expect(
      link
        .closest('[data-slot="sidebar-menu-item"]')
        ?.querySelector("[data-attention-dot]"),
    ).toBeNull();
  });

  it("marks the icon and names the count in the tooltip when collapsed to icons", async () => {
    renderSidebar({ open: false });
    expect(
      document
        .querySelector('[data-slot="sidebar"]')
        ?.getAttribute("data-collapsible"),
    ).toBe("icon");
    const link = screen.getByRole("link", {
      name: "Updates, 4 requests to follow you",
    });
    // A dot on the icon is the cue while labels are hidden. It sits on the
    // menu item, beside the link, so the link keeps one name.
    const dot = link
      .closest('[data-slot="sidebar-menu-item"]')
      ?.querySelector("[data-attention-dot]");
    expect(dot).toBeTruthy();
    expect(link.contains(dot ?? null)).toBe(false);
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
    expect(dot?.className).toContain("group-data-[collapsible=icon]:block");
    // The text cue is hidden with the label, so the tooltip carries it.
    fireEvent.focus(link);
    fireEvent.pointerEnter(link);
    fireEvent.mouseEnter(link);
    expect(
      await screen.findByText("Updates · 4 requests to follow you"),
    ).toBeTruthy();
  });

  it("shows the meaning in the mobile navigation drawer", async () => {
    screenSize.phone = true;
    vi.stubGlobal("innerWidth", 390);
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    const drawer = await screen.findByRole("dialog", { name: "Sidebar" });
    const link = within(drawer).getByRole("link", {
      name: "Updates, 4 requests to follow you",
    });
    expect(within(link).getByText("4 requests")).toBeTruthy();
  });
});
