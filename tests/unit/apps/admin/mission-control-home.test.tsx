// @vitest-environment jsdom

import { navigation } from "@asym/config/navigation";
import { quickActionsForRole, tiles } from "@asym/config/tiles";
import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { WORKFLOWS } from "@asym/lib/mission-control/tiles";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Exercise the admin page at its public UI boundary.
import { getIcon } from "../../../../apps/admin/features/mission-control/components/icon-map";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Exercise the admin page at its public UI boundary.
import { MissionControlHome } from "../../../../apps/admin/features/mission-control/components/tiles/mission-control-home";

import type { GivingTrend } from "@asym/api/reads/dashboard-stats";

function givingTrend(netCents = 0): GivingTrend {
  return {
    periodStart: "2025-11-01T00:00:00.000Z",
    asOf: "2026-11-11T12:00:00.000Z",
    currency: netCents ? "USD" : null,
    currencies: netCents ? ["USD"] : [],
    months: Array.from({ length: 13 }, (_, index) => ({
      month: new Date(Date.UTC(2025, 10 + index, 1)).toISOString().slice(0, 7),
      soFar: index === 12,
      giftCount: netCents ? 1 : 0,
      netCents,
    })),
  };
}

const { workspace, refresh } = vi.hoisted(() => ({
  workspace: { role: "admin" },
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
const attention = vi.hoisted(() => ({
  isError: false,
  isLoading: false,
  refetch: vi.fn(),
  data: undefined as
    | {
        groups: Array<{
          key: string;
          title: string;
          urgency: "normal" | "high" | "critical";
          count: number;
          items: unknown[];
        }>;
        items: unknown[];
      }
    | undefined,
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionControlNeedsAttention: () => ({
    data: attention.data,
    isLoading: attention.isLoading,
    isError: attention.isError,
    refetch: attention.refetch,
  }),
}));
vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => workspace,
}));

afterEach(() => {
  cleanup();
  workspace.role = "admin";
  attention.data = undefined;
  attention.isError = false;
  attention.isLoading = false;
});

describe("Mission Control overview", () => {
  it("puts open follow-ups before general shortcuts", () => {
    attention.data = {
      groups: [
        {
          key: "receipt",
          title: "Receipt",
          urgency: "high",
          count: 2,
          items: [],
        },
      ],
      items: [],
    };
    render(<MissionControlHome />);
    const followUps = screen.getByRole("region", { name: "Needs attention" });
    const shortcuts = screen.getByRole("heading", { name: "Quick actions" });
    expect(
      followUps.compareDocumentPosition(shortcuts) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the whole module directory on wider screens and folds it only on phones", () => {
    render(<MissionControlHome />);
    const directory = screen.getByRole("list", { name: "Workspace modules" });
    const count = tiles.filter(
      (tile) => tile.roles.includes("admin") && !tile.unavailableReason,
    ).length;
    // Administration's shortcuts were always visible before; no cap hides them.
    expect(within(directory).getAllByRole("listitem")).toHaveLength(count);
    const toggle = screen.getByRole("button", {
      name: `Show all ${count} modules`,
    });
    expect(toggle.closest(".sm\\:hidden")).not.toBeNull();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-controls")).toBe(directory.id);
    expect(directory.className.split(" ")).toContain("max-sm:hidden");

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.textContent).toBe("Show fewer modules");
    expect(directory.className.split(" ")).not.toContain("max-sm:hidden");
    expect(within(directory).getAllByRole("listitem")).toHaveLength(count);
  });

  it("keeps each module's shortcuts on their own row, so its text keeps the card's width", () => {
    render(<MissionControlHome />);
    const directory = screen.getByRole("list", { name: "Workspace modules" });
    // Grid items stretch, so cards in one row share a height.
    expect(directory.className.split(" ")).not.toContain("items-start");
    const groups = within(directory).getAllByRole("group");
    expect(groups.length).toBeGreaterThan(0);
    const viewportRule = /^(sm|md|lg|xl|2xl):/;
    for (const group of groups) {
      const actions = group.closest('[data-slot="item-actions"]')!;
      const actionClasses = actions.className.split(" ");
      expect(actionClasses).toContain("basis-full");
      // A viewport rule put shortcuts beside the text in ~350px grid cards.
      expect(actionClasses.filter((name) => viewportRule.test(name))).toEqual(
        [],
      );
      expect(
        group.className.split(" ").filter((name) => viewportRule.test(name)),
      ).toEqual([]);
    }
  });

  it("reports a failed attention check even with cached groups and retries it", () => {
    attention.isError = true;
    attention.data = {
      groups: [
        {
          key: "receipt",
          title: "Receipt",
          urgency: "high",
          count: 5,
          items: [],
        },
      ],
      items: [],
    };
    render(<MissionControlHome />);
    expect(screen.getByText("Couldn't check Needs attention.")).toBeTruthy();
    expect(
      screen.queryByRole("region", { name: "Needs attention" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(attention.refetch).toHaveBeenCalledOnce();
  });
  it("keeps exact large financial amounts", () => {
    render(
      <MissionControlHome
        stats={{
          crmRecordCount: 999999999,
          totalMissionaries: 246,
          totalDonationsThisMonth: 123456789,
          revenueThisMonthCents: 98765432109800,
          activeFundsCount: 32,
          givingTrend: givingTrend(),
        }}
      />,
    );
    expect(screen.getByText("$987,654,321,098.00")).toBeTruthy();
    expect(screen.getByText("123,456,789")).toBeTruthy();
  });
  it.each([
    [123456, "$1,234.56"],
    [49, "$0.49"],
    // One $50 gift is 5,000 cents and must read $50.00, not $5,000.00.
    [5000, "$50.00"],
  ])("formats revenue of %s cents as dollars", (revenue, expected) => {
    render(
      <MissionControlHome
        stats={{
          crmRecordCount: 1,
          totalMissionaries: 1,
          totalDonationsThisMonth: 1,
          revenueThisMonthCents: revenue,
          activeFundsCount: 1,
          givingTrend: givingTrend(),
        }}
      />,
    );
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it.each([
    "finance",
    "fundraising",
    "mobilizers",
    "member_care",
    "events",
    "staff",
    "admin",
  ])("keeps four working role shortcuts for %s", (role) => {
    workspace.role = role;
    render(<MissionControlHome />);
    const section = screen
      .getByRole("heading", { name: "Quick actions" })
      .closest("section")!;
    const links = [...section.querySelectorAll("a")];
    expect(links).toHaveLength(4);
    const permitted = new Set(
      tiles
        .filter(
          (tile) =>
            tile.roles.some((allowedRole) => allowedRole === role) &&
            !tile.unavailableReason,
        )
        .flatMap((tile) => tile.quickActions.map((action) => action.href)),
    );
    expect(
      links.every((link) => permitted.has(link.getAttribute("href")!)),
    ).toBe(true);
  });

  it("says once that the dashboard figures couldn't load, naming what is missing", () => {
    render(<MissionControlHome />);
    expect(
      screen.getByRole("main", { name: "Mission Control workspace" }),
    ).toBeTruthy();
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.textContent).toContain("Dashboard figures couldn't load");
    expect(alerts[0]!.textContent).toContain(
      "Net giving, gift counts, the CRM total and net giving by month",
    );
    // No row of "Couldn't load" tiles or empty chart card repeating it.
    expect(screen.queryByText("Couldn't load")).toBeNull();
    expect(
      screen.queryByRole("region", { name: "Tenant overview" }),
    ).toBeNull();
    expect(
      screen.queryByRole("region", { name: "Net giving by month" }),
    ).toBeNull();
    expect(screen.queryByText(/ministry health/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
    expect(screen.queryByText(/while tenant metrics load/)).toBeNull();
    expect(screen.queryByText("Live", { exact: true })).toBeNull();
  });

  it("keeps the financial metric labels when the figures load", () => {
    render(
      <MissionControlHome
        stats={{
          crmRecordCount: 3,
          totalMissionaries: 0,
          totalDonationsThisMonth: 0,
          revenueThisMonthCents: 0,
          activeFundsCount: 0,
          givingTrend: givingTrend(),
        }}
      />,
    );
    expect(screen.getByText("Net giving this month")).toBeTruthy();
    expect(screen.getByText("Gifts this month")).toBeTruthy();
    expect(screen.getByText("In CRM")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("distinguishes zero recorded activity from unavailable metrics", () => {
    render(
      <MissionControlHome
        stats={{
          crmRecordCount: 0,
          totalMissionaries: 0,
          totalDonationsThisMonth: 0,
          revenueThisMonthCents: 0,
          activeFundsCount: 0,
          givingTrend: givingTrend(),
        }}
      />,
    );
    expect(screen.getByText("$0.00")).toBeTruthy();
    expect(screen.queryByText(/Tenant metrics are unavailable/)).toBeNull();
    expect(
      screen.getByText("Settled gifts since the 1st (UTC), after refunds"),
    ).toBeTruthy();
  });

  it.each([
    [
      ["EUR", "USD"],
      "Gifts in this period are in more than one currency (EUR and USD), so this month's total can't be added together.",
    ],
    [
      ["USD", "unknown"],
      "Some gifts in this period have no currency recorded, so this month's total can't be added together.",
    ],
  ])(
    "does not add up net giving across currencies %j",
    (currencies, notice) => {
      render(
        <MissionControlHome
          stats={{
            crmRecordCount: 1,
            totalMissionaries: 1,
            totalDonationsThisMonth: 2,
            // 10.00 EUR + 15.00 USD summed by the read: a meaningless 25.00.
            revenueThisMonthCents: 2500,
            activeFundsCount: 1,
            givingTrend: { ...givingTrend(), currency: null, currencies },
          }}
        />,
      );
      const overview = screen.getByRole("region", { name: "Tenant overview" });
      expect(overview.textContent).not.toContain("$25.00");
      expect(overview.textContent).toContain(notice);
      expect(
        overview.querySelectorAll('[data-state="unavailable"]'),
      ).toHaveLength(1);
      // The other figures are counts, so they still show.
      expect(overview.textContent).toContain("Gifts this month");
      expect(screen.getByText("2")).toBeTruthy();
    },
  );

  it("formats net giving in the one currency the gifts share", () => {
    render(
      <MissionControlHome
        stats={{
          crmRecordCount: 1,
          totalMissionaries: 1,
          totalDonationsThisMonth: 1,
          revenueThisMonthCents: 2500,
          activeFundsCount: 1,
          givingTrend: {
            ...givingTrend(2500),
            currency: "EUR",
            currencies: ["EUR"],
          },
        }}
      />,
    );
    const overview = screen.getByRole("region", { name: "Tenant overview" });
    expect(overview.textContent).toContain("€25.00");
    expect(overview.textContent).not.toContain("$25.00");
  });

  it.each([
    ["JPY", 10000, "¥10,000"],
    ["KWD", 1230, "KWD\u00a01.230"],
  ])(
    "preserves %s minor-unit precision in the monthly total",
    (currency, minorUnits, expected) => {
      render(
        <MissionControlHome
          stats={{
            crmRecordCount: 1,
            totalMissionaries: 1,
            totalDonationsThisMonth: 1,
            revenueThisMonthCents: minorUnits,
            activeFundsCount: 1,
            givingTrend: {
              ...givingTrend(minorUnits),
              currency,
              currencies: [currency],
            },
          }}
        />,
      );
      const overview = screen.getByRole("region", { name: "Tenant overview" });
      expect(overview.textContent).toContain(expected);
    },
  );

  it("charts net giving by month right after the overview figures", () => {
    render(
      <MissionControlHome
        stats={{
          crmRecordCount: 1,
          totalMissionaries: 1,
          totalDonationsThisMonth: 1,
          revenueThisMonthCents: 2500,
          activeFundsCount: 1,
          givingTrend: givingTrend(2500),
        }}
      />,
    );
    const trend = screen.getByRole("region", { name: "Net giving by month" });
    expect(trend.textContent).toContain(
      "Period: November 2025 to November 11, 2026 (UTC)",
    );
    expect(trend.querySelector("figcaption")?.textContent).toContain(
      "November 2026 so far: $25.00 from 1 gift",
    );
    const overview = screen.getByRole("region", { name: "Tenant overview" });
    expect(
      overview.compareDocumentPosition(trend) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps one Try again for the figures and the trend that load together", () => {
    render(<MissionControlHome />);
    expect(screen.getAllByRole("button", { name: "Try again" })).toHaveLength(
      1,
    );
  });

  it("resolves icons for the current configured actions", () => {
    for (const tile of tiles) {
      for (const action of tile.quickActions) {
        if (action.icon && action.icon !== "Settings") {
          expect(getIcon(action.icon), action.label).not.toBe(
            getIcon("Settings"),
          );
        }
      }
    }
  });

  it.each([
    "finance",
    "fundraising",
    "mobilizers",
    "member_care",
    "events",
    "staff",
    "admin",
  ])(
    "reaches every configured destination of each enabled module once for %s",
    (role) => {
      workspace.role = role;
      render(<MissionControlHome />);
      fireEvent.click(
        screen.getByRole("button", { name: /Show all .* modules/ }),
      );
      const directory = screen.getByRole("list", { name: "Workspace modules" });
      const expected = new Set(
        tiles
          .filter(
            (tile) =>
              tile.roles.some((r) => r === role) && !tile.unavailableReason,
          )
          .flatMap((tile) => [
            tile.route,
            // Shortcuts narrower than their tile (Eve: admins) follow role.
            ...quickActionsForRole(tile, role as never).map(
              (action) => action.href,
            ),
          ])
          .map(resolveMissionControlHref),
      );
      const hrefs = [...directory.querySelectorAll("a")].map((link) =>
        link.getAttribute("href")!,
      );
      expect(new Set(hrefs)).toEqual(expected);
      expect(hrefs).toHaveLength(expected.size);
    },
  );

  it("lists every module the sidebar offers, including Ministry Updates and Tasks", () => {
    workspace.role = "staff";
    render(<MissionControlHome />);
    fireEvent.click(
      screen.getByRole("button", { name: /Show all .* modules/ }),
    );
    const directory = screen.getByRole("list", { name: "Workspace modules" });
    const hrefs = [...directory.querySelectorAll("a")].map((link) =>
      link.getAttribute("href"),
    );
    expect(hrefs).toContain("/feed");
    expect(hrefs).toContain("/tasks");
  });

  it("lists modules in the sidebar's order, so both read the same way", () => {
    workspace.role = "admin";
    render(<MissionControlHome />);
    fireEvent.click(
      screen.getByRole("button", { name: /Show all .* modules/ }),
    );
    const directory = screen.getByRole("list", { name: "Workspace modules" });
    const listed = [...directory.querySelectorAll("a")]
      .map((link) => link.getAttribute("href")!)
      .filter((href) => navigation.some((item) => item.href === href));
    const sidebar = navigation
      .map((item) => item.href)
      .filter((href) => listed.includes(href));
    expect([...new Set(listed)]).toEqual(sidebar);
  });

  it("offers the module catalog from the module directory section", () => {
    render(<MissionControlHome />);
    const trigger = screen.getByRole("button", { name: "Explore modules" });
    const section = trigger.closest("section")!;
    expect(
      section.querySelector("h2")?.textContent,
      "catalog trigger section heading",
    ).toBe("Your modules");
    expect(
      section.querySelector('[role="list"][aria-label="Workspace modules"]'),
    ).toBeTruthy();
  });

  it("explains the module count instead of a bare catalog number", () => {
    render(<MissionControlHome />);
    fireEvent.click(
      screen.getByRole("button", { name: /Show all .* modules/ }),
    );
    const section = screen
      .getByRole("heading", { name: "Your modules" })
      .closest("section")!;
    expect(section.textContent).not.toMatch(/in catalog/);
    const listed = within(
      screen.getByRole("list", { name: "Workspace modules" }),
    ).getAllByRole("link", { name: /^Open / }).length;
    expect(section.textContent).toContain(
      `You can open ${listed} of ${tiles.length} modules.`,
    );
  });

  it("does not blame the role for modules that are only not set up yet", () => {
    // Admin is allowed every module; the only missing one is not set up.
    expect(tiles.every((tile) => tile.roles.includes("admin"))).toBe(true);
    const notSetUp = tiles.filter((tile) => tile.unavailableReason).length;
    expect(notSetUp).toBeGreaterThan(0);
    render(<MissionControlHome />);
    const section = screen
      .getByRole("heading", { name: "Your modules" })
      .closest("section")!;
    expect(section.textContent).not.toMatch(/your role/i);
    expect(section.textContent).toContain(
      notSetUp === 1
        ? "1 is not set up yet."
        : `${notSetUp} are not set up yet.`,
    );
  });

  it("names role limits only for modules the role cannot open", () => {
    workspace.role = "finance";
    const outsideRole = tiles.filter(
      (tile) => !tile.roles.includes("finance"),
    ).length;
    const notSetUp = tiles.filter(
      (tile) => tile.roles.includes("finance") && tile.unavailableReason,
    ).length;
    expect(outsideRole).toBeGreaterThan(1);
    render(<MissionControlHome />);
    const section = screen
      .getByRole("heading", { name: "Your modules" })
      .closest("section")!;
    expect(section.textContent).toContain(
      `${outsideRole} are not part of your role.`,
    );
    if (notSetUp === 0) {
      expect(section.textContent).not.toMatch(/not set up yet/);
    }
  });

  it("opens the phone catalog without expanding the directory", () => {
    render(<MissionControlHome />);
    const trigger = screen.getByRole("button", { name: "Explore modules" });
    expect(trigger.closest(".max-sm\\:hidden")).toBeNull();
    fireEvent.click(trigger);
    expect(
      screen.getByRole("dialog", { name: "Mission Control modules" }),
    ).toBeTruthy();
  });

  it("marks the most urgent kind with the strongest shared badge", () => {
    attention.data = {
      groups: [
        {
          key: "receipt",
          title: "Receipt",
          urgency: "critical",
          count: 1,
          items: [],
        },
      ],
      items: [],
    };
    render(<MissionControlHome />);
    expect(
      screen.getByText(/Based on up to 100 most recently seen open items/),
    ).toBeTruthy();
    // Solid, so Critical reads stronger than High's amber, not weaker.
    expect(screen.getByText("Critical").getAttribute("data-variant")).toBe(
      "destructive",
    );
  });

  it("uses the same page heading scale as other Mission Control pages", () => {
    render(<MissionControlHome />);
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Mission Control",
    });
    // Matches PageShell's compact heading used across admin pages.
    for (const token of ["text-2xl", "sm:text-3xl", "lg:text-4xl"]) {
      expect(heading.className.split(" ")).toContain(token);
    }
  });

  it("presents common tasks as single named links without decorative chrome", () => {
    render(<MissionControlHome />);
    const section = screen
      .getByRole("heading", { name: "Common tasks" })
      .closest("section")!;
    const links = [...section.querySelectorAll("a")];
    expect(links.length).toBeGreaterThan(0);
    for (const workflow of WORKFLOWS.filter((w) =>
      links.some((link) => link.textContent?.includes(w.title)),
    )) {
      const link = screen.getByRole("link", {
        name: new RegExp(workflow.title),
      });
      expect(link.textContent).toContain(workflow.description);
      expect(link.getAttribute("href")).toBe(
        resolveMissionControlHref(workflow.route),
      );
    }
    expect(section.querySelector('[data-slot="card"]')).toBeNull();
  });

  it.each([
    "finance",
    "fundraising",
    "mobilizers",
    "member_care",
    "events",
    "staff",
    "admin",
  ])("only suggests eligible workflows for %s", (role) => {
    workspace.role = role;
    render(<MissionControlHome />);
    const allowed = new Set(
      tiles
        .filter(
          (tile) =>
            tile.roles.some((r) => r === role) && !tile.unavailableReason,
        )
        .map((tile) => tile.id),
    );
    for (const workflow of WORKFLOWS) {
      expect(
        Boolean(
          screen.queryByRole("link", { name: new RegExp(workflow.title) }),
        ),
        workflow.title,
      ).toBe(allowed.has(workflow.primaryTile));
    }
  });

  it("says what needs attention today, with a link to where it is handled", () => {
    attention.data = {
      groups: [
        {
          key: "receipt",
          title: "Receipt",
          urgency: "critical",
          count: 2,
          items: [],
        },
        {
          key: "correction",
          title: "Correction review",
          urgency: "high",
          count: 1,
          items: [],
        },
      ],
      items: [],
    };
    render(<MissionControlHome />);
    const section = screen.getByRole("region", { name: "Needs attention" });
    expect(section.textContent).toContain("3 items");
    expect(section.textContent).toContain("Receipt");
    expect(
      screen
        .getByRole("link", { name: /Open Contributions/ })
        .getAttribute("href"),
    ).toBe("/contributions");
  });

  it("links each needs-attention kind to Contributions filtered to it", () => {
    attention.data = {
      groups: [
        {
          key: "critical:receipt_failed",
          title: "Receipt",
          urgency: "critical",
          count: 2,
          items: [],
        },
      ],
      items: [],
    };
    render(<MissionControlHome />);
    const section = screen.getByRole("region", { name: "Needs attention" });
    const link = within(section).getByRole("link", { name: /Receipt/ });
    expect(link.getAttribute("href")).toBe(
      "/contributions?attention=critical%3Areceipt_failed",
    );
  });

  it("puts each urgency badge beside its title, not at the far edge", () => {
    attention.data = {
      groups: [
        {
          key: "critical:receipt_failed",
          title: "Receipt",
          urgency: "critical",
          count: 2,
          items: [],
        },
      ],
      items: [],
    };
    render(<MissionControlHome />);
    const section = screen.getByRole("region", { name: "Needs attention" });
    const title = within(section)
      .getByText("Receipt")
      .closest('[data-slot="item-title"]');
    // At 1440 a trailing badge sat about 1,000px from its title.
    expect(title?.querySelector('[data-slot="badge"]')).not.toBeNull();
  });

  it("says when only the most urgent kinds are listed", () => {
    attention.data = {
      groups: ["a", "b", "c", "d"].map((key, index) => ({
        key: `high:${key}`,
        title: `Kind ${key}`,
        urgency: "high",
        count: index + 1,
        items: [],
      })),
      items: [],
    };
    render(<MissionControlHome />);
    const section = screen.getByRole("region", { name: "Needs attention" });
    expect(section.textContent).toContain("10 items");
    expect(section.textContent).toContain("3 most urgent of 4 kinds");
    expect(within(section).queryByText("Kind d")).toBeNull();
  });

  it("stays quiet when nothing needs attention, and for roles without Contributions", () => {
    attention.data = { groups: [], items: [] };
    render(<MissionControlHome />);
    expect(
      screen.queryByRole("region", { name: "Needs attention" }),
    ).toBeNull();
    cleanup();
    workspace.role = "staff";
    attention.data = {
      groups: [
        {
          key: "receipt",
          title: "Receipt",
          urgency: "critical",
          count: 2,
          items: [],
        },
      ],
      items: [],
    };
    render(<MissionControlHome />);
    expect(
      screen.queryByRole("region", { name: "Needs attention" }),
    ).toBeNull();
  });
});
