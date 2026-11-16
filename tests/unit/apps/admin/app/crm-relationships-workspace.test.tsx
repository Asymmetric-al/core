/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  CrmRelationshipReport,
  CrmRelationshipRow,
} from "@asym/database/types";
import type { ComponentType } from "react";

/**
 * CRM relationships (/crm/relationships): every returned row renders, money
 * is integer cents, and donor-backed rows open their CRM record.
 */

const relationshipsHook = vi.hoisted(() => vi.fn());

vi.mock("@asym/database/hooks", () => ({
  CRM_RELATIONSHIP_DOMAIN_OPTIONS: [
    { label: "People", value: "people" },
    { label: "Organizations", value: "organizations" },
    { label: "Churches", value: "churches" },
    { label: "Households", value: "households" },
    { label: "Pledges", value: "pledges" },
    { label: "Activity", value: "activity" },
  ],
  useAdminCrmRelationshipsGrid: relationshipsHook,
}));

function makeRow(
  index: number,
  overrides: Partial<CrmRelationshipRow> = {},
): CrmRelationshipRow {
  const number = String(index + 1).padStart(2, "0");
  const recordKind = overrides.recordKind ?? "person";
  const recordId = overrides.recordId ?? `donor-${number}`;
  return {
    id: `relationship-${number}`,
    recordKind,
    recordId,
    // As the server fills it: donor-backed kinds open their own record.
    donorId: ["person", "organization", "church", "household"].includes(
      recordKind,
    )
      ? recordId
      : null,
    domain: "people",
    displayName: `Relationship person ${number}`,
    secondaryLabel: null,
    relationshipKind: "person",
    status: "active",
    location: null,
    sourceSystem: "Asym CRM",
    authorityScope: "crm_relationship",
    authorityLabel: "CRM relationship context",
    memberCount: null,
    commitmentAmountCents: null,
    commitmentCurrency: null,
    commitmentFrequency: null,
    lastActivityAt: "2026-10-01T12:00:00.000Z",
    primaryContactName: null,
    tenantId: "tenant-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
    dedupeKey: null,
    ...overrides,
  };
}

const report: CrmRelationshipReport = {
  sourceSystems: {
    auth: "Asym auth",
    crm: "Asym CRM",
    finance: "Asym finance summary is a local read-only overlay.",
    care: "Non-sensitive Member Care activity is listed; sensitive care activity is always left out.",
  },
  totalRows: 90,
  domainCounts: {
    people: 46,
    organizations: 8,
    churches: 6,
    households: 6,
    pledges: 8,
    activity: 12,
  },
  activeCommitments: {
    monthlyByCurrency: [
      { currency: "USD", monthlyCents: 632_000, pledgeCount: 8 },
    ],
    pledgeCount: 8,
    unknownFrequencyCount: 0,
  },
  householdCount: 6,
  recentActivityCount: 12,
  duplicateCompanyCandidates: 0,
  duplicatePersonCandidates: 0,
  excludedCareActivityCount: 3,
};

const FIFTY_ROWS = Array.from({ length: 50 }, (_, index) => makeRow(index));

function relationshipsState(overrides: Record<string, unknown> = {}) {
  return {
    clearDomains: vi.fn(),
    configured: true,
    domains: [],
    hasMore: false,
    isFetchingMore: false,
    isLoading: false,
    loadMore: vi.fn(),
    missing: [],
    mode: "local",
    onDomainToggle: vi.fn(),
    onRefresh: vi.fn().mockResolvedValue(undefined),
    onSearchChange: vi.fn(),
    onSortingChange: vi.fn(),
    relationships: FIFTY_ROWS,
    report,
    rollback: { existingCrmPath: "/crm" },
    search: "",
    sorting: [{ id: "updatedAt", desc: true }],
    tableError: null,
    ...overrides,
  };
}

let RelationshipsPage: ComponentType;
let formatCrmCommitment: (row: CrmRelationshipRow) => string | null;
let crmRelationshipSource: (row: CrmRelationshipRow) => string;
let crmRelationshipAuthority: (row: CrmRelationshipRow) => string;

describe("CRM relationships workspace", () => {
  beforeAll(async () => {
    RelationshipsPage = (
      await import("../../../../../apps/admin/app/(app)/crm/relationships/page-client")
    ).default;
    ({ crmRelationshipAuthority, crmRelationshipSource, formatCrmCommitment } =
      await import("../../../../../apps/admin/app/(app)/crm/relationships/columns"));
  }, 120_000);

  // jsdom has no layout: give the virtualized grid body a tall viewport so
  // every loaded row is inside the rendered window (as the records test).
  const clientHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientHeight",
  );
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 6000,
    });
  });
  afterAll(() => {
    if (clientHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "clientHeight",
        clientHeight,
      );
    }
  });

  beforeEach(() => {
    relationshipsHook.mockReturnValue(relationshipsState());
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    Element.prototype.getAnimations ??= () => [];
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders every loaded relationship and says how many remain", () => {
    relationshipsHook.mockReturnValue(relationshipsState({ hasMore: true }));
    render(<RelationshipsPage />);
    expect(
      screen.getAllByRole("link", { name: /^Relationship person \d+/ }),
    ).toHaveLength(50);
    // The report covers every row; the footer says how many are loaded.
    expect(
      screen.getByText(`50 of ${report.totalRows} relationships loaded`),
    ).toBeTruthy();
    expect(screen.queryByText(/showing the first/i)).toBeNull();
  });

  it("keeps 60% of the window for the list, not a five-row slot at 1024", () => {
    relationshipsHook.mockReturnValue(relationshipsState({ hasMore: true }));
    const { container } = render(<RelationshipsPage />);
    const viewport = container.querySelector<HTMLElement>(
      '[data-slot="data-grid-table-viewport"]',
    );
    expect(viewport?.getAttribute("style") ?? "").toContain("60dvh");
  });

  it("formats commitments from integer cents", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        relationships: [
          makeRow(0, {
            recordKind: "commitment",
            recordId: "pledge-1",
            donorId: null,
            domain: "pledges",
            displayName: "Okonjo Family Trust pledge",
            commitmentAmountCents: 500_000,
            commitmentCurrency: "USD",
            commitmentFrequency: "quarterly",
            sourceSystem: "Asym finance summary",
            authorityScope: "finance_summary",
          }),
        ],
      }),
    );
    render(<RelationshipsPage />);
    const table = screen.getByRole("table");
    // In its own column on a wide panel, or under the name on a narrow one.
    expect(within(table).getAllByText(/\$5,000\.00/).length).toBeGreaterThan(0);
    expect(within(table).queryByText(/\$500,000\.00/)).toBeNull();
    // The commitments figure is in cents too: 632,000 cents is $6,320.00.
    expect(screen.getByText("$6,320.00")).toBeTruthy();
    expect(screen.queryByText("$632,000.00")).toBeNull();
    // A commitment without a known donor has no CRM record to open.
    expect(
      screen.queryByRole("link", { name: /Okonjo Family Trust pledge/ }),
    ).toBeNull();
  });

  it("labels a commitment's frequency under the name instead of its raw value", () => {
    expect(
      formatCrmCommitment(
        makeRow(0, {
          recordKind: "commitment",
          commitmentAmountCents: 500_000,
          commitmentCurrency: "USD",
          commitmentFrequency: "semi_annual",
        }),
      ),
    ).toBe("$5,000.00 semi annual");
    expect(
      formatCrmCommitment(
        makeRow(0, {
          recordKind: "commitment",
          commitmentAmountCents: 1_234,
          commitmentCurrency: "USD",
          commitmentFrequency: "Quarterly",
        }),
      ),
    ).toBe("$12.34 quarterly");
  });

  it("opens donor-backed relationships in the CRM record drawer", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        relationships: [
          makeRow(0, {
            displayName: "Northfield Community Bank",
            recordKind: "organization",
            recordId: "donor-bank",
            domain: "organizations",
          }),
        ],
      }),
    );
    render(<RelationshipsPage />);
    const link = screen.getByRole("link", {
      name: /^Northfield Community Bank/,
    });
    expect(link.getAttribute("href")).toBe("/crm?donor=donor-bank");
    // A name that leaves for the CRM record says so with an arrow, unlike
    // names that open a details dialog in place.
    expect(link.querySelector('[data-slot="opens-record"]')).not.toBeNull();
  });

  it("opens a pledge's donor record", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        relationships: [
          makeRow(0, {
            displayName: "Okonjo Family Trust pledge",
            recordKind: "commitment",
            recordId: "pledge-1",
            donorId: "donor-okonjo",
            domain: "pledges",
            commitmentAmountCents: 500_000,
            commitmentCurrency: "USD",
            sourceSystem: "Asym finance summary",
            authorityScope: "finance_summary",
          }),
        ],
      }),
    );
    render(<RelationshipsPage />);
    const link = screen.getByRole("link", {
      name: /^Okonjo Family Trust pledge/,
    });
    expect(link.getAttribute("href")).toBe("/crm?donor=donor-okonjo");
  });

  it("keeps the type on the name's line, so rows stay one line when there is no detail", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({ relationships: [makeRow(0)] }),
    );
    render(<RelationshipsPage />);
    const table = screen.getByRole("table");
    const badge = within(table).getByText("Person");
    const nameLine = badge.parentElement!;
    expect(nameLine.textContent).toContain(makeRow(0).displayName);
  });

  it("sorts by commitment from the View menu column, keeping it visible while sorted", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        sorting: [{ id: "commitmentAmountCents", desc: true }],
      }),
    );
    render(<RelationshipsPage />);
    expect(
      within(screen.getByRole("table")).getByRole("columnheader", {
        name: /^Commitment/,
      }),
    ).toBeTruthy();
  });

  it("labels each row with a singular type and leaves the identical Source column in View", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({ relationships: [makeRow(0)] }),
    );
    render(<RelationshipsPage />);
    const table = screen.getByRole("table");
    expect(within(table).getByText("Person")).toBeTruthy();
    expect(within(table).queryByText("People")).toBeNull();
    expect(
      within(table).queryByRole("columnheader", { name: /^Source/ }),
    ).toBeNull();
  });

  it("does not repeat a household's contact, and counts its members in the row", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        relationships: [
          makeRow(0, {
            recordKind: "household",
            recordId: "donor-margaret",
            domain: "households",
            displayName: "Margaret Okonkwo-Hale Household",
            secondaryLabel: "Richard Hale",
            primaryContactName: "Richard Hale",
            memberCount: 2,
          }),
        ],
      }),
    );
    render(<RelationshipsPage />);
    const table = screen.getByRole("table");
    // The contact is said once, not again as the household's label.
    expect(table.textContent?.split("Richard Hale")).toHaveLength(2);
    expect(within(table).getByText(/2 members/)).toBeTruthy();
    // Members is not a mostly-empty column of its own.
    expect(
      within(table).queryByRole("columnheader", { name: /^Members/ }),
    ).toBeNull();
  });

  it("opens rows without a CRM record in a details dialog from their primary", async () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        relationships: [
          makeRow(1, {
            recordKind: "commitment",
            recordId: "pledge-1",
            domain: "pledges",
            displayName: "Okonjo Family Trust pledge",
            secondaryLabel: "quarterly",
            commitmentAmountCents: 500_000,
            commitmentCurrency: "USD",
            commitmentFrequency: "quarterly",
            primaryContactName: "Okonjo Family Trust",
            status: null,
            sourceSystem: "Asym finance summary",
            authorityScope: "finance_summary",
            authorityLabel: "Asym finance summary",
          }),
        ],
      }),
    );
    render(<RelationshipsPage />);
    expect(
      screen.queryByRole("link", { name: /Okonjo Family Trust pledge/ }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Okonjo Family Trust pledge" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Okonjo Family Trust pledge",
    });
    expect(dialog.textContent).toContain("$5,000.00 quarterly");
    expect(dialog.textContent).toContain("Summary from Contributions");
    expect(dialog.textContent).toContain("Okonjo Family Trust");
  });

  describe("on a 1440px-wide viewport", () => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect;
    beforeEach(() => {
      Element.prototype.getBoundingClientRect = function () {
        return { ...getBoundingClientRect.call(this), width: 1180 };
      };
    });
    afterEach(() => {
      Element.prototype.getBoundingClientRect = getBoundingClientRect;
    });

    it("shows contact and commitment as columns when the panel has room", () => {
      relationshipsHook.mockReturnValue(
        relationshipsState({
          sorting: [{ id: "lastActivityAt", desc: true }],
          relationships: [
            makeRow(0, { displayName: "Theodore Lindqvist" }),
            makeRow(1, {
              recordKind: "commitment",
              recordId: "pledge-1",
              domain: "pledges",
              displayName: "Okonjo Family Trust pledge",
              secondaryLabel: "quarterly",
              commitmentAmountCents: 500_000,
              commitmentCurrency: "USD",
              commitmentFrequency: "quarterly",
              primaryContactName: "Okonjo Family Trust",
              status: null,
              sourceSystem: "Asym finance summary",
              authorityScope: "finance_summary",
              authorityLabel: "Asym finance summary",
            }),
          ],
        }),
      );
      render(<RelationshipsPage />);
      const table = screen.getByRole("table");
      const headers = within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent?.trim());
      // A wide panel fills its width with the contact and commitment instead
      // of leaving a long empty stretch beside each name.
      expect(headers).toEqual(
        expect.arrayContaining([
          "Contact",
          "Location",
          "Commitment",
          "Last activity",
        ]),
      );
      // Shown in their columns, they are not repeated under the name.
      expect(within(table).queryByText(/Contact:/)).toBeNull();
      expect(within(table).getByText("$5,000.00")).toBeTruthy();
      expect(within(table).queryByText(/\$5,000\.00 quarterly/)).toBeNull();
    });
  });

  describe("on a 1440px-wide viewport with mostly people", () => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect;
    beforeEach(() => {
      Element.prototype.getBoundingClientRect = function () {
        return { ...getBoundingClientRect.call(this), width: 1180 };
      };
    });
    afterEach(() => {
      Element.prototype.getBoundingClientRect = getBoundingClientRect;
    });

    it("folds contact and commitment under the name when few rows have them", () => {
      relationshipsHook.mockReturnValue(
        relationshipsState({
          sorting: [{ id: "lastActivityAt", desc: true }],
          relationships: [
            ...FIFTY_ROWS.slice(0, 9),
            makeRow(20, {
              recordKind: "commitment",
              recordId: "pledge-1",
              domain: "pledges",
              displayName: "Okonjo Family Trust pledge",
              commitmentAmountCents: 500_000,
              commitmentCurrency: "USD",
              commitmentFrequency: "quarterly",
              primaryContactName: "Okonjo Family Trust",
              status: null,
              sourceSystem: "Asym finance summary",
              authorityScope: "finance_summary",
              authorityLabel: "Asym finance summary",
            }),
          ],
        }),
      );
      render(<RelationshipsPage />);
      const table = screen.getByRole("table");
      const headers = within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent?.trim());
      // Columns that would read "—" on nine rows in ten stay folded.
      expect(headers).not.toContain("Contact");
      expect(headers).not.toContain("Commitment");
      expect(headers).toContain("Location");
      expect(
        within(table).getByText(
          "$5,000.00 quarterly · Contact: Okonjo Family Trust",
        ),
      ).toBeTruthy();
    });

    it("shows only the column most rows fill", () => {
      const household = (index: number) =>
        makeRow(index, {
          recordKind: "household",
          domain: "households",
          displayName: `Household ${index}`,
          primaryContactName: `Contact ${index}`,
          memberCount: 2,
        });
      relationshipsHook.mockReturnValue(
        relationshipsState({
          sorting: [{ id: "lastActivityAt", desc: true }],
          relationships: [household(0), household(1), makeRow(2)],
        }),
      );
      render(<RelationshipsPage />);
      const headers = within(screen.getByRole("table"))
        .getAllByRole("columnheader")
        .map((header) => header.textContent?.trim());
      expect(headers).toContain("Contact");
      expect(headers).not.toContain("Commitment");
    });
  });

  it("offers a skip link that lands on the first relationship", () => {
    render(<RelationshipsPage />);
    const link = screen.getByRole("link", { name: "Skip to relationships" });
    // Invisible until focused, so it never moves the layout.
    expect(link.className.split(" ")).toEqual(
      expect.arrayContaining(["opacity-0", "focus:opacity-100"]),
    );
    fireEvent.click(link);
    const first = document.querySelector<HTMLElement>(
      "[data-grid-row-primary]",
    );
    expect(first).toBeTruthy();
    expect(document.activeElement).toBe(first);
  });

  it("lands the skip link inside the list when there are no relationships", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({ relationships: [] }),
    );
    render(<RelationshipsPage />);
    fireEvent.click(
      screen.getByRole("link", { name: "Skip to relationships" }),
    );
    const list = document.getElementById("crm-relationships-list");
    expect(list?.contains(document.activeElement)).toBe(true);
  });

  describe("just under a 1280px-wide viewport", () => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect;
    beforeEach(() => {
      Element.prototype.getBoundingClientRect = function () {
        return { ...getBoundingClientRect.call(this), width: 960 };
      };
    });
    afterEach(() => {
      Element.prototype.getBoundingClientRect = getBoundingClientRect;
    });

    it("keeps the name readable, folding contact and commitment under it", () => {
      relationshipsHook.mockReturnValue(
        relationshipsState({
          sorting: [{ id: "lastActivityAt", desc: true }],
        }),
      );
      render(<RelationshipsPage />);
      const headers = within(screen.getByRole("table"))
        .getAllByRole("columnheader")
        .map((header) => header.textContent?.trim());
      expect(headers).toContain("Location");
      expect(headers).not.toContain("Contact");
      expect(headers).not.toContain("Commitment");
    });
  });

  describe("on a 1024px-wide viewport", () => {
    const getBoundingClientRect = Element.prototype.getBoundingClientRect;
    beforeEach(() => {
      Element.prototype.getBoundingClientRect = function () {
        return { ...getBoundingClientRect.call(this), width: 760 };
      };
    });
    afterEach(() => {
      Element.prototype.getBoundingClientRect = getBoundingClientRect;
    });

    it("keeps Refresh and View on the search's row, so the toolbar takes two rows", () => {
      render(<RelationshipsPage />);
      const search = screen.getByRole("searchbox", {
        name: "Search CRM relationships",
      });
      const row = search.closest('[data-slot="crm-search-row"]');
      expect(row).toBeTruthy();
      expect(
        within(row as HTMLElement).getByRole("button", { name: "Refresh" }),
      ).toBeTruthy();
      expect(
        within(row as HTMLElement).queryByRole("group", {
          name: "Relationship types",
        }),
      ).toBeNull();
    });

    it("keeps location and last activity, folding sparse columns into the row", () => {
      relationshipsHook.mockReturnValue(
        relationshipsState({
          relationships: [
            makeRow(0, { displayName: "Theodore Lindqvist" }),
            makeRow(1, {
              recordKind: "commitment",
              recordId: "pledge-1",
              domain: "pledges",
              displayName: "Okonjo Family Trust pledge",
              secondaryLabel: "quarterly",
              commitmentAmountCents: 500_000,
              commitmentCurrency: "USD",
              commitmentFrequency: "quarterly",
              primaryContactName: "Okonjo Family Trust",
              status: null,
              sourceSystem: "Asym finance summary",
              authorityScope: "finance_summary",
              authorityLabel: "Asym finance summary",
            }),
          ],
        }),
      );
      render(<RelationshipsPage />);
      const table = screen.getByRole("table");
      const headers = within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent?.trim());
      expect(headers).toContain("Location");
      expect(headers).toContain("Last activity");
      expect(headers).not.toContain("Commitment");
      expect(headers).not.toContain("Contact");
      // The pledge keeps its amount and contact under its name.
      expect(
        within(table).getByText(
          "$5,000.00 quarterly · Contact: Okonjo Family Trust",
        ),
      ).toBeTruthy();
    });
  });

  describe("below the md breakpoint", () => {
    const innerWidth = window.innerWidth;
    beforeEach(() => {
      window.innerWidth = 390;
    });
    afterEach(() => {
      window.innerWidth = innerWidth;
    });

    it("keeps the four summary figures compact in the shared metric cards", () => {
      render(<RelationshipsPage />);
      const summary = screen.getByRole("region", {
        name: "Relationship summary",
      });
      // The shared MetricCard, so the totals read like every other module's.
      const cards = summary.querySelectorAll('[data-slot="metric-card"]');
      expect(
        Array.from(
          cards,
          (card) =>
            card.querySelector('[data-slot="card-description"]')?.textContent,
        ),
      ).toEqual([
        "Relationships",
        "Monthly commitments",
        "Households",
        "Activity",
      ]);
      // One row of four from 1024 up, so the list starts sooner there.
      expect(summary.className.split(" ")).toContain("lg:grid-cols-4");
      for (const figure of ["90", "$6,320.00", "6", "12"]) {
        expect(within(summary).getByText(figure)).toBeTruthy();
      }
      // The pledge count and the private-care caveat stay visible.
      for (const line of [
        "8 active pledges",
        "Leaves out 3 private care entries",
      ]) {
        const element = within(summary).getByText(line);
        expect(element.className).not.toMatch(/sr-only|(^|\s)hidden/);
      }
      // Generic description lines are gone: they pushed the list down.
      expect(
        within(summary).queryByText(
          "People and organizations connected in the CRM",
        ),
      ).toBeNull();
    });

    it("gives every summary card a line from the data, compact on phones", () => {
      render(<RelationshipsPage />);
      const summary = screen.getByRole("region", {
        name: "Relationship summary",
      });
      const cards = Array.from(
        summary.querySelectorAll<HTMLElement>('[data-slot="metric-card"]'),
      );
      // Even cards: each says what its figure counts.
      for (const card of cards) {
        expect(card.querySelector('[data-slot="card-content"]')).not.toBeNull();
        expect(card.dataset.compact).toBe("phone");
      }
      // 46 people; 8 organizations and 6 churches.
      expect(
        within(summary).getByText("46 people, 14 churches and organizations"),
      ).toBeTruthy();
      expect(
        within(summary).getByText("Donors with a spouse on record"),
      ).toBeTruthy();
    });

    it("says where activity comes from when no private care is left out", () => {
      relationshipsHook.mockReturnValue(
        relationshipsState({
          report: { ...report, excludedCareActivityCount: 0 },
        }),
      );
      render(<RelationshipsPage />);
      const summary = screen.getByRole("region", {
        name: "Relationship summary",
      });
      expect(within(summary).getByText("From Member Care")).toBeTruthy();
    });

    it("wraps the relationship type filters so every type is visible", () => {
      render(<RelationshipsPage />);
      const group = screen.getByRole("group", { name: "Relationship types" });
      expect(group.className).toContain("flex-wrap");
      expect(group.className).not.toContain("overflow-x-auto");
      expect(within(group).getAllByRole("button")).toHaveLength(7);
    });

    it("shows each card's useful detail instead of a repeated source line", () => {
      relationshipsHook.mockReturnValue(
        relationshipsState({
          relationships: [
            makeRow(0, { displayName: "Theodore Lindqvist" }),
            makeRow(1, {
              recordKind: "commitment",
              recordId: "pledge-1",
              domain: "pledges",
              displayName: "Okonjo Family Trust pledge",
              secondaryLabel: "quarterly",
              commitmentAmountCents: 500_000,
              commitmentCurrency: "USD",
              commitmentFrequency: "quarterly",
              primaryContactName: "Okonjo Family Trust",
              status: null,
              sourceSystem: "Asym finance summary",
              authorityScope: "finance_summary",
              authorityLabel: "Asym finance summary",
            }),
            makeRow(2, {
              recordKind: "household",
              recordId: "donor-margaret",
              domain: "households",
              displayName: "Margaret Okonkwo-Hale Household",
              secondaryLabel: "Richard Hale",
              primaryContactName: "Richard Hale",
              memberCount: 2,
            }),
          ],
        }),
      );
      render(<RelationshipsPage />);
      const list = screen.getByRole("list", { name: "CRM relationships" });
      const [person, pledge, household] = within(list).getAllByRole("listitem");
      for (const card of [person!, pledge!, household!]) {
        expect(card.textContent).not.toContain("Asym CRM");
        expect(card.textContent).not.toContain("CRM context");
      }
      expect(person!.textContent).toContain("Person");
      expect(
        within(person!)
          .getByRole("link", { name: /^Theodore Lindqvist/ })
          .getAttribute("href"),
      ).toBe("/crm?donor=donor-01");
      expect(pledge!.textContent).toContain("Pledge");
      expect(pledge!.textContent).toContain("$5,000.00 quarterly");
      expect(within(pledge!).queryByRole("link")).toBeNull();
      expect(
        within(pledge!).getByRole("button", {
          name: "Okonjo Family Trust pledge",
        }),
      ).toBeTruthy();
      expect(household!.textContent).toContain("2 members");
      // The household's contact says what it is.
      expect(household!.textContent).toContain("Contact: Richard Hale");
    });

    it("says when each card was updated, or last active when sorted so", () => {
      const rows = [
        makeRow(0, {
          recordKind: "activity",
          recordId: "activity-1",
          domain: "activity",
          displayName: "Prayer update: Zhang ministry",
          lastActivityAt: "2026-10-20T12:00:00.000Z",
          updatedAt: "2026-10-28T12:00:00.000Z",
        }),
      ];
      relationshipsHook.mockReturnValue(
        relationshipsState({ relationships: rows }),
      );
      const view = render(<RelationshipsPage />);
      let card = within(
        screen.getByRole("list", { name: "CRM relationships" }),
      ).getAllByRole("listitem")[0]!;
      expect(card.textContent).toContain("Updated Oct 28, 2026");

      relationshipsHook.mockReturnValue(
        relationshipsState({
          relationships: rows,
          sorting: [{ id: "lastActivityAt", desc: true }],
        }),
      );
      view.rerender(<RelationshipsPage />);
      card = within(
        screen.getByRole("list", { name: "CRM relationships" }),
      ).getAllByRole("listitem")[0]!;
      expect(card.textContent).toContain("Last activity Oct 20, 2026");
    });

    it("offers server sorting on phones, where the table headers are gone", async () => {
      const state = relationshipsState();
      relationshipsHook.mockReturnValue(state);
      render(<RelationshipsPage />);
      const sort = screen.getByRole("combobox", {
        name: "Sort relationships",
      });
      expect(sort.textContent).toContain("Updated: newest");
      fireEvent.click(sort);
      const option = await screen.findByRole("option", {
        name: "Last activity: newest",
      });
      fireEvent.pointerDown(option, { pointerType: "mouse" });
      fireEvent.click(option);
      expect(state.onSortingChange).toHaveBeenCalledWith([
        { id: "lastActivityAt", desc: true },
      ]);
      // Refresh stays on phones as a named icon button beside the search.
      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
      expect(state.onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it("shows summary skeletons, never zero totals, before the report loads", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({ isLoading: true, relationships: [], report: null }),
    );
    render(<RelationshipsPage />);
    const summary = screen.getByRole("region", {
      name: "Relationship summary",
    });
    expect(summary.textContent).not.toContain("$0.00");
    expect(summary.textContent).not.toMatch(/\b0\b/);
    expect(summary.getAttribute("aria-busy")).toBe("true");
    // The shared metric card owns the loading state.
    const cards = summary.querySelectorAll('[data-slot="metric-card"]');
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(card.getAttribute("data-state")).toBe("loading");
    }
  });

  it("marks summary totals unavailable, not zero, when the report fails", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        relationships: [],
        report: null,
        tableError: new Error("Failed to load CRM relationships (500)"),
      }),
    );
    render(<RelationshipsPage />);
    const summary = screen.getByRole("region", {
      name: "Relationship summary",
    });
    expect(summary.textContent).not.toContain("$0.00");
    expect(summary.textContent).not.toMatch(/\b0\b/);
    const cards = summary.querySelectorAll('[data-slot="metric-card"]');
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(card.getAttribute("data-state")).toBe("unavailable");
    }
    expect(within(summary).getAllByText("Not available")).toHaveLength(4);
  });

  it("marks commitments unavailable, not $0.00, when the report lacks them", () => {
    // A report from a mismatched API contract: the other figures are real,
    // but there is no commitments summary to show.
    const { activeCommitments: _omitted, ...withoutCommitments } = report;
    relationshipsHook.mockReturnValue(
      relationshipsState({
        report: withoutCommitments as unknown as CrmRelationshipReport,
      }),
    );
    render(<RelationshipsPage />);
    const summary = screen.getByRole("region", {
      name: "Relationship summary",
    });
    expect(summary.textContent).not.toContain("$0.00");
    const card = within(summary)
      .getByText("Monthly commitments")
      .closest('[data-slot="metric-card"]');
    expect(card?.getAttribute("data-state")).toBe("unavailable");
    const ready = summary.querySelectorAll(
      '[data-slot="metric-card"][data-state="ready"]',
    );
    expect(ready).toHaveLength(3);
  });

  it("shows a real $0.00 when the report counts no active pledges", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        report: {
          ...report,
          activeCommitments: {
            monthlyByCurrency: [],
            pledgeCount: 0,
            unknownFrequencyCount: 0,
          },
        },
      }),
    );
    render(<RelationshipsPage />);
    const card = within(
      screen.getByRole("region", { name: "Relationship summary" }),
    )
      .getByText("Monthly commitments")
      .closest('[data-slot="metric-card"]');
    expect(card?.getAttribute("data-state")).toBe("ready");
    expect(card?.textContent).toContain("$0.00");
    expect(card?.textContent).toContain("0 active pledges");
  });

  it("does not show the API's rollback path as a data source", () => {
    render(<RelationshipsPage />);
    const sources = screen.getByRole("group", { name: "Data sources" });
    expect(sources.textContent).not.toMatch(/rollback/i);
  });

  it("explains a staff-access denial once, without a Retry that cannot help", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        relationships: [],
        tableError: new Error("Unauthorized"),
      }),
    );
    render(<RelationshipsPage />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.textContent).toContain("Access required");
    expect(alerts[0]!.textContent).toContain(
      "Your account doesn't have staff access to this organization's CRM. Ask an administrator for access.",
    );
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("says the commitments figure is active pledges per month, per currency", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({
        report: {
          ...report,
          activeCommitments: {
            monthlyByCurrency: [
              { currency: "USD", monthlyCents: 10_000, pledgeCount: 2 },
              { currency: "CAD", monthlyCents: 5_000, pledgeCount: 1 },
            ],
            pledgeCount: 4,
            unknownFrequencyCount: 1,
          },
        },
      }),
    );
    render(<RelationshipsPage />);
    const summary = screen.getByRole("region", {
      name: "Relationship summary",
    });
    expect(within(summary).getByText(/\$100\.00 \+ CA\$50\.00/)).toBeTruthy();
    expect(
      within(summary).getByText(
        "4 active pledges, 1 with no monthly schedule left out",
      ),
    ).toBeTruthy();
  });

  it("keeps the empty-state copy and the source-system context", () => {
    relationshipsHook.mockReturnValue(
      relationshipsState({ relationships: [] }),
    );
    render(<RelationshipsPage />);
    expect(screen.getByText("No CRM relationships")).toBeTruthy();
    const sources = screen.getByRole("group", { name: "Data sources" });
    expect(within(sources).getByText("Mission Control")).toBeTruthy();
    // Plain-language boundary notes, not the API's engineering copy.
    expect(
      screen.getByText(/Commitments are a read-only summary/),
    ).toBeTruthy();
    expect(screen.queryByText(/local read-only overlay/)).toBeNull();
    // Everyday care activity is listed; only sensitive entries are left out.
    expect(
      screen.getByText(/sensitive care entries are always left out/),
    ).toBeTruthy();
    expect(screen.queryByText(/unless you have care access/)).toBeNull();
  });

  it("names Member Care as the source of care activity rows", () => {
    const row = makeRow(0, {
      authorityLabel: "Asym member care",
      authorityScope: "member_care",
      domain: "activity",
      recordKind: "activity",
      sourceSystem: "Asym member care",
    });
    expect(crmRelationshipSource(row)).toBe("Member Care");
    expect(crmRelationshipAuthority(row)).toBe("Kept in Member Care");
  });
});
