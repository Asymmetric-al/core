// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the settings navigation's public UI boundary.
import {
  SupportSettingsSideNav,
  SupportSubNav,
} from "../../../../../../../apps/admin/features/support-hub/components/workspace/SupportSubNav";

const route = vi.hoisted(() => ({ pathname: "/support/settings/inbox" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  route.pathname = "/support/settings/inbox";
});

describe("Support settings navigation", () => {
  it("names inbox rules without changing the automations URL", () => {
    route.pathname = "/support/settings/automations";
    render(<SupportSettingsSideNav />);
    const rules = screen.getByRole("link", { name: "Inbox rules" });
    expect(rules.getAttribute("href")).toBe("/support/settings/automations");
    expect(rules.getAttribute("aria-current")).toBe("page");
    expect(screen.queryByRole("link", { name: "Automations" })).toBeNull();
  });
  it("links tickets and keeps nested tickets active without selecting Inbox", () => {
    route.pathname = "/support/tickets/new";
    render(<SupportSubNav section="tickets" />);
    const tickets = screen.getByRole("link", { name: "Tickets" });
    expect(tickets.getAttribute("href")).toBe("/support/tickets");
    expect(tickets.getAttribute("aria-current")).toBe("page");
    expect(
      screen.getByRole("link", { name: "Inbox" }).getAttribute("aria-current"),
    ).toBeNull();
  });
  it("keeps Reports active on every report and names Assignment rules", () => {
    route.pathname = "/support/reports/agents";
    render(<SupportSubNav section="reports" />);
    expect(
      screen
        .getByRole("link", { name: "Reports" })
        .getAttribute("aria-current"),
    ).toBe("page");
    cleanup();
    render(<SupportSettingsSideNav />);
    expect(screen.getByRole("link", { name: "Assignment rules" })).toBeTruthy();
  });
  it("names each page once: the inbox page by its title, under Routing", () => {
    render(<SupportSettingsSideNav />);
    // "Inbox" stays the name of the top tab only.
    expect(screen.queryByText("Inbox", { exact: true })).toBeNull();
    expect(screen.getByText("Routing")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Inbox identity" }).getAttribute("href"),
    ).toBe("/support/settings/inbox");
  });

  it("names the SLA page as its page heading and card name it: SLA policies", () => {
    render(<SupportSettingsSideNav />);
    expect(
      screen.getByRole("link", { name: "SLA policies" }).getAttribute("href"),
    ).toBe("/support/settings/sla");
    expect(screen.queryByRole("link", { name: "SLA" })).toBeNull();
  });

  it("names the message report by what it shows, not after the Inbox tab", () => {
    render(<SupportSubNav section="reports" />);
    // "Inbox" is the top tab only, not also a report.
    expect(screen.getAllByText("Inbox", { exact: true })).toHaveLength(1);
    expect(
      screen.getAllByText("Messages", { exact: true }).length,
    ).toBeGreaterThan(0);
  });

  it("draws the report tabs lighter than the section strip: muted until current", () => {
    route.pathname = "/support/reports/overview";
    render(<SupportSubNav section="reports" />);
    const reports = screen.getByRole("navigation", { name: "Reports" });
    const overview = within(reports).getByRole("link", { name: "Overview" });
    const agents = within(reports).getByRole("link", { name: "Agents" });
    expect(overview.getAttribute("aria-current")).toBe("page");
    expect(overview.className).not.toContain("text-muted-foreground");
    expect(agents.className.split(" ")).toEqual(
      expect.arrayContaining([
        "text-muted-foreground",
        "hover:text-foreground",
      ]),
    );
  });

  it("draws the section strip as the shared line tabs, current section marked", () => {
    render(<SupportSubNav section="settings" />);
    const nav = screen.getByRole("navigation", { name: "Support Hub section" });
    expect(nav.getAttribute("data-slot")).toBe("nav-tabs");
    const settings = within(nav).getByRole("link", { name: "Settings" });
    expect(settings.getAttribute("aria-current")).toBe("page");
    expect(settings.getAttribute("data-slot")).toBe("nav-tabs-link");
    expect(
      within(nav)
        .getByRole("link", { name: "Inbox" })
        .hasAttribute("aria-current"),
    ).toBe(false);
  });
});
