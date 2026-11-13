/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DonorsPageDetail } from "../../../../apps/missionary/app/donors/donors-page-detail";
import { DonorsPageRoster } from "../../../../apps/missionary/app/donors/donors-page-roster";
import { DonorsPageStats } from "../../../../apps/missionary/app/donors/donors-page-stats";
import { DonorsPageViewProvider } from "../../../../apps/missionary/app/donors/use-donors-page-view";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";

import type { Donor } from "../../../../apps/missionary/app/donors/donor-types";

const fixture = vi.hoisted(() => ({ rows: [] as Donor[], width: 1440 }));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryDonorRows: () => ({
    data: fixture.rows,
    isLoading: false,
    error: null,
    hasMore: false,
    isLoadingMore: false,
    loadMore: async () => {},
  }),
  useMissionaryPortalSnapshot: () => ({ data: undefined }),
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "r21-missionary" }, loading: false }),
  useMediaQuery: (query: string) => window.matchMedia(query).matches,
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: async () => {},
}));
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

function partner(id: string, name: string): Donor {
  return {
    id,
    name,
    initials: name.slice(0, 2).toUpperCase(),
    type: "Individual",
    status: "Active",
    total_given: 20400,
    last_gift_date: null,
    last_gift_amount: null,
    frequency: "One-time",
    email: `${id}@example.test`,
    phone: "555-0100",
    preferred_contact: "email",
    location: "Fixture City",
    address: {},
    joined_date: "2026-01-01T12:00:00Z",
    tags: [],
    score: 0,
    activities: [],
    recurring_donations: [],
    has_active_pledge: false,
  } as unknown as Donor;
}

function matchesWidth(query: string, width: number) {
  const min = /min-width:\s*(\d+)px/.exec(query);
  const max = /max-width:\s*(\d+)px/.exec(query);
  return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]));
}

beforeEach(() => {
  fixture.rows = [
    partner("r21-a", "Roster Partner A"),
    partner("r21-b", "Roster Partner B"),
  ];
  fixture.width = 1440;
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matchesWidth(query, fixture.width),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderPartners(children: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>{children}</DonorsPageViewProvider>
    </QueryClientProvider>,
  );
}

/** The virtualized desktop table needs a measured scroll box to render rows. */
function giveTheTableRoom() {
  vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(640);
  vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(560);
}

function openControl(name: string) {
  return screen.getByRole("button", { name: new RegExp(`^${name}`) });
}

describe("open partner in the desktop roster", () => {
  it("marks only the open partner, quietly and without the keyboard ring", async () => {
    giveTheTableRoom();
    renderPartners(<DonorsPageRoster />);

    // Each partner is a real control, so the keyboard can reach the list.
    const openB = await screen.findByRole("button", {
      name: /^Roster Partner B/,
    });
    expect(openB.getAttribute("aria-current")).toBeNull();
    act(() => openB.focus());
    fireEvent.click(openB);

    await waitFor(() =>
      expect(openControl("Roster Partner B").getAttribute("aria-current")).toBe(
        "true",
      ),
    );
    const openRow = openControl("Roster Partner B").closest("tr")!;
    const otherRow = openControl("Roster Partner A").closest("tr")!;
    expect(openControl("Roster Partner A").getAttribute("aria-current")).toBe(
      null,
    );
    // The table's own selected row: a muted fill.
    expect(openRow.getAttribute("data-state")).toBe("selected");
    expect(otherRow.getAttribute("data-state")).not.toBe("selected");

    // Like the Tasks page's active card, a primary edge rather than a solid
    // primary disc.
    const avatar = openRow.querySelector('[data-slot="avatar"]')!;
    expect(avatar.className).toContain("border-primary");
    const fallback = openRow.querySelector('[data-slot="avatar-fallback"]')!;
    expect(fallback.className).not.toContain("bg-primary");
    // Clicking a partner leaves no keyboard ring on its row.
    for (const row of [openRow, otherRow]) {
      expect(row.className).not.toMatch(/\bring-2\b/);
    }
  });

  it("gives every partner a native button in the tab order", async () => {
    giveTheTableRoom();
    renderPartners(<DonorsPageRoster />);
    const openA = await screen.findByRole("button", {
      name: /^Roster Partner A/,
    });
    // Native buttons turn Enter and Space into a click.
    expect(openA.tagName).toBe("BUTTON");
    expect(openA.tabIndex).toBe(0);
    // The photo and initials stay out of the name; the partner's name leads.
    expect(openA.textContent).toContain("RO");
    // No second, unreachable row-by-row model competes with it.
    expect(openA.closest("tr")!.tabIndex).toBe(-1);
    act(() => openA.focus());
    fireEvent.click(openA);
    await waitFor(() =>
      expect(openControl("Roster Partner A").getAttribute("aria-current")).toBe(
        "true",
      ),
    );
    expect(document.activeElement).toBe(openControl("Roster Partner A"));
  });
});

describe("open partner's giving summary", () => {
  function statValue(label: string) {
    return screen.getByText(label, { selector: "p" }).nextElementSibling
      ?.textContent;
  }

  it("keeps unqualified scalar totals unavailable and does not invent a last gift", async () => {
    fixture.rows = [
      { ...partner("r21-a", "Roster Partner A"), total_given: 75500 },
      {
        ...partner("r21-b", "Roster Partner B"),
        total_given: 70667,
        last_gift_amount: 7550,
        last_gift_date: "2026-03-11T12:00:00Z",
      },
      // Added by hand: the Add partner dialog stores 0 and no date.
      {
        ...partner("r21-c", "Roster Partner C"),
        last_gift_amount: 0,
        last_gift_date: null,
      },
    ];
    giveTheTableRoom();
    renderPartners(
      <>
        <DonorsPageRoster />
        <DonorsPageDetail />
      </>,
    );
    // The roster's amount is everything given, not a monthly figure, so it
    // says so beside a "Monthly" badge and in the row's name.
    const row = await screen.findByRole("button", {
      name: /^Roster Partner A.*Unavailable given$/,
    });
    fireEvent.click(row);
    await screen.findByRole("heading", { name: "Roster Partner A" });
    expect(statValue("Lifetime")).toBe("Unavailable");
    // No gift on record: say so rather than show a $0.00 gift.
    expect(statValue("Last gift")).toBe("—");

    fireEvent.click(openControl("Roster Partner B"));
    await screen.findByRole("heading", { name: "Roster Partner B" });
    await waitFor(() => expect(statValue("Lifetime")).toBe("Unavailable"));
    expect(statValue("Last gift")).toBe("Unavailable");

    fireEvent.click(openControl("Roster Partner C"));
    await screen.findByRole("heading", { name: "Roster Partner C" });
    await waitFor(() => expect(statValue("Last gift")).toBe("—"));
  });
});

describe("partner open on a phone", () => {
  function rowFor(name: string) {
    return screen
      .getByText(name)
      .closest<HTMLElement>('button, [tabindex="0"]')!;
  }

  it("steps the summary aside for the open partner and restores it on Back", async () => {
    fixture.width = 390;
    renderPartners(
      <>
        <DonorsPageStats />
        <DonorsPageRoster />
        <DonorsPageDetail />
      </>,
    );
    const summary = screen.getByRole("button", {
      name: /Monthly partners/,
    }).parentElement!;
    expect(summary.className.split(/\s+/)).not.toContain("max-lg:hidden");
    // Totals carry cents, so the figures step down a size on phones to stay
    // inside two-up tiles.
    const total = screen
      .getByText("Given, all time")
      .closest('[data-slot="card"]')!
      .querySelector('[data-slot="card-content"] p')!;
    expect(total.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["text-xl", "sm:text-2xl"]),
    );

    const row = rowFor("Roster Partner B");
    act(() => row.focus());
    fireEvent.click(row);
    const back = await screen.findByRole("button", {
      name: "Back to partner list",
    });
    // Below lg the detail starts at the top: the tiles hide like the list.
    expect(summary.className.split(/\s+/)).toContain("max-lg:hidden");
    expect(summary.className.split(/\s+/)).not.toContain("hidden");
    await waitFor(() => expect(document.activeElement).toBe(back));

    fireEvent.click(back);
    await waitFor(() =>
      expect(document.activeElement).toBe(rowFor("Roster Partner B")),
    );
    expect(summary.className.split(/\s+/)).not.toContain("max-lg:hidden");
  });

  it("shows an edge cue for tabs past either end of the rail", async () => {
    fixture.width = 390;
    renderPartners(
      <>
        <DonorsPageRoster />
        <DonorsPageDetail />
      </>,
    );
    fireEvent.click(rowFor("Roster Partner A"));
    const tablist = await screen.findByRole("tablist");
    expect(
      within(tablist)
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["Overview", "Tasks", "Contact", "Recurring", "Giving"]);

    const railRoot = tablist.closest<HTMLElement>('[data-slot="scroll-area"]')!;
    const frame = railRoot.parentElement!;
    // Phones get a narrower inset so more of the rail shows.
    expect(frame.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["px-4", "sm:px-6"]),
    );
    const cues = Array.from(
      frame.querySelectorAll<HTMLElement>(":scope > [aria-hidden='true']"),
    );
    expect(cues).toHaveLength(2);
    const [start, end] = cues;
    // Base UI marks the rail root while tabs are hidden past an edge.
    expect(start!.className).toContain(
      "group-has-data-[overflow-x-start]/tab-rail:flex",
    );
    expect(end!.className).toContain(
      "group-has-data-[overflow-x-end]/tab-rail:flex",
    );
    for (const cue of cues) {
      expect(cue.className.split(/\s+/)).toContain("hidden");
      expect(cue.className).toContain("pointer-events-none");
      // The fade is a transparency mask, so a bare chevron would sit on
      // half-faded tab text; a solid disc in the card colour keeps it clean.
      const disc = cue.querySelector("svg")!.parentElement!;
      expect(disc).not.toBe(cue);
      expect(disc.className.split(/\s+/)).toEqual(
        expect.arrayContaining(["rounded-full", "bg-card"]),
      );
    }
    expect(frame.className).toContain("group/tab-rail");
  });

  it("scrolls the chosen tab into the rail when the next partner opens", async () => {
    fixture.width = 390;
    const RAIL = { left: 33, width: 324 };
    const TABS = ["Overview", "Tasks", "Contact", "Recurring", "Giving"];
    const WIDTHS = [79, 54, 71, 77.56, 59.8];
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        if (this.getAttribute("data-slot") === "scroll-area-viewport") {
          return new DOMRect(RAIL.left, 220, RAIL.width, 44);
        }
        const viewport = this.closest<HTMLElement>(
          '[data-slot="scroll-area-viewport"]',
        );
        const index = TABS.indexOf(this.textContent ?? "");
        if (this.getAttribute("role") === "tab" && viewport && index >= 0) {
          const offset = WIDTHS.slice(0, index).reduce((a, b) => a + b, 0);
          return new DOMRect(
            RAIL.left + 3 + offset - viewport.scrollLeft,
            224,
            WIDTHS[index],
            36,
          );
        }
        return new DOMRect(0, 0, 0, 0);
      },
    );
    renderPartners(
      <>
        <DonorsPageRoster />
        <DonorsPageDetail />
      </>,
    );
    fireEvent.click(rowFor("Roster Partner A"));
    fireEvent.click(await screen.findByRole("tab", { name: "Giving" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Back to partner list" }),
    );
    await waitFor(() => expect(screen.queryByRole("tablist")).toBeNull());

    fireEvent.click(rowFor("Roster Partner B"));
    await screen.findByRole("heading", { name: "Roster Partner B" });
    const giving = screen.getByRole("tab", { name: "Giving" });
    expect(giving.getAttribute("aria-selected")).toBe("true");
    const rail = giving.closest<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )!;
    await waitFor(() => expect(rail.scrollLeft).toBeGreaterThan(0));
    expect(giving.getBoundingClientRect().right).toBeLessThanOrEqual(
      RAIL.left + RAIL.width,
    );
  });
});
