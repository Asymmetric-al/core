/** @vitest-environment jsdom */

import { QueryProvider } from "@asym/database/providers";
import {
  act,
  cleanup,
  fireEvent,
  render,
  within,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { CrmDonorDetailResponse, CrmGridRow } from "@asym/database/types";
import type { ComponentType, ReactNode } from "react";

let ContributionsPage: ComponentType;
let MissionControlCRM: ComponentType;

const route = vi.hoisted(() => ({
  pathname: "/contributions",
  search: "",
  listeners: new Set<() => void>(),
  push: vi.fn(),
  replace: vi.fn(),
}));
const queries = vi.hoisted(() => ({
  grid: vi.fn(),
  detail: vi.fn(),
}));

function navigate(search: string) {
  route.search = search;
  for (const listener of route.listeners) listener();
}

vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    usePathname: () => route.pathname,
    useRouter: () => ({ push: route.push, replace: route.replace }),
    useSearchParams: () => {
      const search = useSyncExternalStore(
        (listener) => {
          route.listeners.add(listener);
          return () => route.listeners.delete(listener);
        },
        () => route.search,
      );
      return new URLSearchParams(search);
    },
  };
});

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "detail"],
  ADMIN_CRM_RECORDS_QUERY_KEY: ["admin", "crm"],
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY: ["admin", "attention"],
  useMissionControlNeedsAttention: () => ({ data: { groups: [] } }),
  useAdminCrmRecordsInfiniteGrid: queries.grid,
  useAdminCrmRecordDetail: queries.detail,
}));
vi.mock(
  "../../../../../apps/admin/app/(app)/contributions/use-admin-contributions",
  () => ({
    ADMIN_CONTRIBUTIONS_QUERY_KEY: ["admin", "contributions"],
    useAdminContributions: () => ({
      data: [],
      isError: false,
      isPending: false,
    }),
  }),
);
vi.mock("@asym/ui/components/primitives/page-shell", () => ({
  PageShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@asym/ui/components/boneyard-skeleton", () => ({
  BoneyardSkeleton: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("../../../../../apps/admin/app/(app)/contributions/main-body", () => ({
  ContributionsPageActions: () => null,
  ContributionsMainBody: ({
    onOpenContributionById,
  }: {
    onOpenContributionById: (id: string) => void;
  }) => (
    <>
      <button type="button" onClick={() => onOpenContributionById(GIFT_A)}>
        Open gift A
      </button>
      <button type="button" onClick={() => onOpenContributionById(GIFT_B)}>
        Open gift B
      </button>
    </>
  ),
}));
vi.mock("@asym/ui/components/shadcn/data-table", () => ({
  DataTableResponsive: ({
    data,
    onRowClick,
  }: {
    data: CrmGridRow[];
    onRowClick: (row: { original: CrmGridRow }) => void;
  }) => (
    <>
      {data.map((row) => (
        <button
          key={row.id}
          type="button"
          onClick={() => onRowClick({ original: row })}
        >
          Open {row.displayName}
        </button>
      ))}
    </>
  ),
}));
vi.mock("../../../../../apps/admin/app/(app)/crm/columns", () => ({
  getCrmColumns: () => [],
}));
vi.mock("../../../../../apps/admin/app/(app)/crm/detail-drawer", () => ({
  DetailDrawer: ({
    contact,
    onClose,
    onOpenGift,
  }: {
    contact: CrmGridRow;
    onClose: () => void;
    onOpenGift: (id: string) => void;
  }) => (
    <>
      <div role="dialog" aria-label="Donor details">
        <span>{contact.displayName}</span>
        <span>{contact.email}</span>
        <span>{contact.phone}</span>
        {contact.lifetimeGiving != null && (
          <span>Lifetime giving: {contact.lifetimeGiving}</span>
        )}
      </div>
      <button type="button" onClick={onClose}>
        Close donor
      </button>
      <button type="button" onClick={() => onOpenGift(GIFT_A)}>
        Open donor gift A
      </button>
      <button type="button" onClick={() => onOpenGift(GIFT_B)}>
        Open donor gift B
      </button>
    </>
  ),
}));
vi.mock(
  "../../../../../apps/admin/app/(app)/contributions/contribution-detail-overlay",
  () => ({
    ContributionDetailOverlay: ({
      donationId,
      onClose,
    }: {
      donationId: string | null;
      onClose: () => void;
    }) =>
      donationId ? (
        <div role="dialog" aria-label="Gift details">
          {donationId}
          <button type="button" onClick={onClose}>
            Close gift
          </button>
        </div>
      ) : null,
  }),
);

const GIFT_A = "00000000-0000-4000-8000-000000000101";
const GIFT_B = "00000000-0000-4000-8000-000000000102";
const donorRow = {
  id: "donor-a",
  displayName: "Alice Donor",
  tags: [],
} as CrmGridRow;

function makeCrmDetail(
  name = "Alice Detail",
  email = "alice.detail@example.test",
): CrmDonorDetailResponse {
  return {
    donor: {
      id: "donor-a",
      name,
      title: null,
      email,
      phone: null,
      organization: null,
      location: null,
      status: "active",
      type: "individual",
      profileId: null,
      missionaryId: null,
      notesPreview: null,
      tags: [],
      avatarUrl: null,
      createdAt: null,
      updatedAt: null,
    },
    giftHistory: [],
    giftHistoryTruncated: false,
    timeline: [],
    duplicateWarnings: [],
    support: {
      lifetimeGivingCents: 0,
      lastGiftAt: null,
      activeRecurringCommitments: 0,
      lapsedCommitments: 0,
      atRiskCommitments: 0,
      byFund: [],
      byMissionary: [],
    },
    privacy: {
      roleGate: "staff",
      restrictedNotesVisible: false,
      missionaryContactDataExposed: false,
    },
    reconciliation: {
      crmWriteMode: "disabled",
      platformPaymentTruth: true,
    },
  };
}

const surfaces = [
  {
    name: "Contribution Hub",
    Page: () => <ContributionsPage />,
    pathname: "/contributions",
  },
  { name: "donor CRM", Page: () => <MissionControlCRM />, pathname: "/crm" },
];

describe("route-owned detail selection", () => {
  beforeAll(async () => {
    const [contributions, crm] = await Promise.all([
      import("../../../../../apps/admin/app/(app)/contributions/page-client"),
      import("../../../../../apps/admin/app/(app)/crm/page-client"),
    ]);
    ContributionsPage = contributions.default;
    MissionControlCRM = crm.default;
  });

  beforeEach(() => {
    route.pathname = "/contributions";
    route.search = "";
    route.push.mockImplementation((url: string) =>
      navigate(url.split("?")[1] ?? ""),
    );
    route.replace.mockImplementation((url: string) =>
      navigate(url.split("?")[1] ?? ""),
    );
    queries.grid.mockReturnValue({
      rows: [donorRow],
      columnFilters: [],
      sorting: [],
      isLoading: false,
    });
    queries.detail.mockReturnValue({ data: undefined, isPending: true });
  });

  afterEach(() => {
    cleanup();
    route.listeners.clear();
  });

  it.each(surfaces)(
    "restores gift selections through back and forward changes in $name",
    ({ Page, pathname }) => {
      route.pathname = pathname;
      route.search = `search=alice&gift=${GIFT_A}`;
      const view = render(<Page />, { wrapper: QueryProvider });
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_A);

      act(() => navigate(`search=alice&gift=${GIFT_B}`));
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_B);
      act(() => navigate("search=alice"));
      expect(view.queryByRole("dialog", { name: "Gift details" })).toBeNull();
      act(() => navigate(`search=alice&gift=${GIFT_A}`));
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_A);

      fireEvent.click(view.getByRole("button", { name: "Close gift" }));
      expect(route.replace).toHaveBeenCalledWith(`${pathname}?search=alice`, {
        scroll: false,
      });
      expect(view.queryByRole("dialog", { name: "Gift details" })).toBeNull();
    },
  );

  it.each(surfaces)(
    "closes gift details immediately before navigation commits in $name",
    ({ Page, pathname }) => {
      route.pathname = pathname;
      route.search = `search=alice&gift=${GIFT_A}`;
      route.replace.mockImplementation(() => {});
      const view = render(<Page />, { wrapper: QueryProvider });

      fireEvent.click(view.getByRole("button", { name: "Close gift" }));
      expect(view.queryByRole("dialog", { name: "Gift details" })).toBeNull();
      expect(route.search).toBe(`search=alice&gift=${GIFT_A}`);
      view.rerender(<Page />);
      expect(view.queryByRole("dialog", { name: "Gift details" })).toBeNull();

      act(() => navigate("search=alice"));
      act(() => navigate(`search=alice&gift=${GIFT_A}`));
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_A);
    },
  );

  it.each(surfaces)(
    "opens and switches gifts immediately before navigation commits in $name",
    ({ Page, pathname }) => {
      route.pathname = pathname;
      route.search =
        pathname === "/crm" ? "donor=donor-a&search=alice" : "search=alice";
      route.push.mockImplementation(() => {});
      const view = render(<Page />, { wrapper: QueryProvider });
      const buttonPrefix =
        pathname === "/crm" ? "Open donor gift" : "Open gift";

      fireEvent.click(view.getByRole("button", { name: `${buttonPrefix} A` }));
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_A);
      fireEvent.click(view.getByRole("button", { name: `${buttonPrefix} B` }));
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_B);
      view.rerender(<Page />);
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_B);

      const target = route.push.mock.calls.at(-1)![0] as string;
      act(() => navigate(target.split("?")[1]!));
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_B);
      act(() => navigate(route.search.replace(GIFT_B, GIFT_A)));
      expect(
        view.getByRole("dialog", { name: "Gift details" }).textContent,
      ).toContain(GIFT_A);
    },
  );

  it("opens, switches and closes donors immediately before navigation commits", () => {
    route.pathname = "/crm";
    route.search = "search=alice";
    route.replace.mockImplementation(() => {});
    queries.grid.mockReturnValue({
      columnFilters: [],
      sorting: [],
      isLoading: false,
      rows: [
        donorRow,
        { ...donorRow, id: "donor-b", displayName: "Bob Donor" },
      ],
    });
    const view = render(<MissionControlCRM />, { wrapper: QueryProvider });

    fireEvent.click(view.getByRole("button", { name: "Open Alice Donor" }));
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Alice Donor");
    fireEvent.click(view.getByRole("button", { name: "Open Bob Donor" }));
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Bob Donor");
    view.rerender(<MissionControlCRM />);
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Bob Donor");

    act(() => navigate("search=alice&donor=donor-b"));
    fireEvent.click(view.getByRole("button", { name: "Close donor" }));
    expect(view.queryByRole("dialog", { name: "Donor details" })).toBeNull();
    expect(route.search).toBe("search=alice&donor=donor-b");
    view.rerender(<MissionControlCRM />);
    expect(view.queryByRole("dialog", { name: "Donor details" })).toBeNull();

    act(() => navigate("search=alice"));
    act(() => navigate("search=alice&donor=donor-a"));
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Alice Donor");
  });

  it("preserves the pending local donor context when opening and closing its gift", () => {
    route.pathname = "/crm";
    route.search = "search=alice";
    route.push.mockImplementation(() => {});
    route.replace.mockImplementation(() => {});
    const view = render(<MissionControlCRM />, { wrapper: QueryProvider });

    fireEvent.click(view.getByRole("button", { name: "Open Alice Donor" }));
    fireEvent.click(view.getByRole("button", { name: "Open donor gift A" }));
    expect(route.push).toHaveBeenLastCalledWith(
      `/crm?search=alice&donor=donor-a&gift=${GIFT_A}`,
      { scroll: false },
    );
    fireEvent.click(view.getByRole("button", { name: "Close gift" }));
    expect(route.replace).toHaveBeenLastCalledWith(
      "/crm?search=alice&donor=donor-a",
      { scroll: false },
    );
    expect(view.queryByRole("dialog", { name: "Gift details" })).toBeNull();
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Alice Donor");
  });

  it.each(surfaces)(
    "clears malformed gift selections and preserves other route context in $name",
    ({ Page, pathname }) => {
      route.pathname = pathname;
      route.search = `donor=donor-a&search=alice&gift=${GIFT_A}`;
      const view = render(<Page />, { wrapper: QueryProvider });

      act(() => navigate("donor=donor-a&search=alice&gift=invalid"));
      expect(view.queryByRole("dialog", { name: "Gift details" })).toBeNull();
      expect(route.replace).toHaveBeenCalledWith(
        `${pathname}?donor=donor-a&search=alice`,
        { scroll: false },
      );
    },
  );

  it("does not retain the previous donor when navigation changes the selected donor", () => {
    route.pathname = "/crm";
    route.search = "donor=donor-a";
    const view = render(<MissionControlCRM />, { wrapper: QueryProvider });
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Alice Donor");

    act(() => navigate("donor=donor-b"));
    expect(view.queryByRole("dialog", { name: "Donor details" })).toBeNull();
    expect(queries.detail).toHaveBeenLastCalledWith("donor-b");

    act(() => navigate("donor=donor-a"));
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Alice Donor");

    act(() => navigate("search=alice"));
    expect(view.queryByRole("dialog", { name: "Donor details" })).toBeNull();
  });

  it.each([
    { selection: "row click", detailState: "loading" },
    { selection: "row click", detailState: "failed" },
    { selection: "deep link", detailState: "loading" },
    { selection: "deep link", detailState: "failed" },
  ])(
    "keeps the donor drawer after $selection when filtering hides the selected row and detail is $detailState",
    ({ selection, detailState }) => {
      route.pathname = "/crm";
      route.search = selection === "deep link" ? "donor=donor-a" : "";
      const view = render(<MissionControlCRM />, { wrapper: QueryProvider });
      if (selection === "row click") {
        fireEvent.click(view.getByRole("button", { name: "Open Alice Donor" }));
      }
      expect(
        view.getByRole("dialog", { name: "Donor details" }).textContent,
      ).toBe("Alice Donor");

      queries.grid.mockReturnValue({
        ...queries.grid.mock.results.at(-1)!.value,
        rows: [],
      });
      queries.detail.mockReturnValue({
        data: undefined,
        isPending: detailState === "loading",
        isError: detailState === "failed",
      });
      view.rerender(<MissionControlCRM />);

      expect(
        view.getByRole("dialog", { name: "Donor details" }).textContent,
      ).toBe("Alice Donor");
      expect(route.search).toBe("donor=donor-a");

      act(() => navigate("donor=donor-b"));
      expect(view.queryByRole("dialog", { name: "Donor details" })).toBeNull();
    },
  );

  it("keeps a deep-linked donor after its grid row arrives and is later filtered out", () => {
    route.pathname = "/crm";
    route.search = "donor=donor-a";
    const grid = queries.grid.mock.results.at(-1)?.value ?? {
      columnFilters: [],
      sorting: [],
      isLoading: false,
    };
    queries.grid.mockReturnValue({ ...grid, rows: [] });
    const view = render(<MissionControlCRM />, { wrapper: QueryProvider });
    expect(view.queryByRole("dialog", { name: "Donor details" })).toBeNull();

    queries.grid.mockReturnValue({ ...grid, rows: [donorRow] });
    view.rerender(<MissionControlCRM />);
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Alice Donor");

    queries.grid.mockReturnValue({ ...grid, rows: [] });
    view.rerender(<MissionControlCRM />);
    expect(
      view.getByRole("dialog", { name: "Donor details" }).textContent,
    ).toBe("Alice Donor");
  });

  it.each(["loading", "failed"])(
    "keeps refreshed grid values after filtering hides the donor and detail is %s",
    (detailState) => {
      route.pathname = "/crm";
      route.search = "donor=donor-a";
      const view = render(<MissionControlCRM />, { wrapper: QueryProvider });
      const grid = queries.grid.mock.results.at(-1)!.value;
      const refreshedRow = {
        ...donorRow,
        displayName: "Alice Updated",
        email: "alice.updated@example.test",
      };

      queries.grid.mockReturnValue({ ...grid, rows: [refreshedRow] });
      view.rerender(<MissionControlCRM />);
      let drawer = within(view.getByRole("dialog", { name: "Donor details" }));
      expect(drawer.getByText("Alice Updated")).toBeTruthy();
      expect(drawer.getByText("alice.updated@example.test")).toBeTruthy();

      queries.grid.mockReturnValue({ ...grid, rows: [] });
      queries.detail.mockReturnValue({
        data: undefined,
        isPending: detailState === "loading",
        isError: detailState === "failed",
      });
      view.rerender(<MissionControlCRM />);
      drawer = within(view.getByRole("dialog", { name: "Donor details" }));
      expect(drawer.getByText("Alice Updated")).toBeTruthy();
      expect(drawer.getByText("alice.updated@example.test")).toBeTruthy();
      expect(drawer.queryByText("Alice Donor")).toBeNull();
    },
  );

  it("keeps refreshed canonical detail values when the next detail read fails", () => {
    route.pathname = "/crm";
    route.search = "donor=donor-a";
    const view = render(<MissionControlCRM />, { wrapper: QueryProvider });
    queries.grid.mockReturnValue({
      ...queries.grid.mock.results.at(-1)!.value,
      rows: [],
    });
    const detail = makeCrmDetail();
    queries.detail.mockReturnValue({
      data: detail,
      dataUpdatedAt: 1000,
      isPending: false,
    });
    view.rerender(<MissionControlCRM />);
    expect(view.getByText("Alice Detail")).toBeTruthy();

    const refreshedDetail = {
      ...detail,
      donor: {
        ...detail.donor,
        name: "Alice Canonical Updated",
        email: "alice.canonical.updated@example.test",
      },
    };
    queries.detail.mockReturnValue({
      data: refreshedDetail,
      dataUpdatedAt: 2000,
      isPending: false,
    });
    view.rerender(<MissionControlCRM />);
    expect(view.getByText("Alice Canonical Updated")).toBeTruthy();

    // A fresh response object with unchanged values must settle without
    // repeatedly updating the snapshot as the converter allocates records.
    queries.detail.mockReturnValue({
      data: { ...refreshedDetail, donor: { ...refreshedDetail.donor } },
      dataUpdatedAt: 2000,
      isPending: false,
    });
    view.rerender(<MissionControlCRM />);

    queries.detail.mockReturnValue({ data: undefined, isError: true });
    view.rerender(<MissionControlCRM />);
    const drawer = within(view.getByRole("dialog", { name: "Donor details" }));
    expect(drawer.getByText("Alice Canonical Updated")).toBeTruthy();
    expect(
      drawer.getByText("alice.canonical.updated@example.test"),
    ).toBeTruthy();
    expect(drawer.queryByText("Alice Detail")).toBeNull();
  });

  it.each([0, 1000])(
    "uses detail refreshed before filtering hides the donor, with initial cache time %s",
    (initialCacheTime) => {
      route.pathname = "/crm";
      route.search = "donor=donor-a";
      queries.detail.mockReturnValue({
        data: initialCacheTime ? makeCrmDetail("Alice Cached") : undefined,
        dataUpdatedAt: initialCacheTime,
        isPending: initialCacheTime === 0,
      });
      const view = render(<MissionControlCRM />, { wrapper: QueryProvider });
      const grid = queries.grid.mock.results.at(-1)!.value;
      expect(view.getByText("Alice Donor")).toBeTruthy();

      const freshDetail = makeCrmDetail(
        "Alice Fresh Detail",
        "alice.fresh@example.test",
      );
      freshDetail.donor.phone = "+1 555 0100";
      freshDetail.support.lifetimeGivingCents = 12500;
      queries.detail.mockReturnValue({
        data: freshDetail,
        dataUpdatedAt: 2000,
        isSuccess: true,
        isPending: false,
      });
      // A recreated row with unchanged values must not consume the fresh
      // detail response's timestamp before filtering removes the row.
      queries.grid.mockReturnValue({ ...grid, rows: [{ ...donorRow }] });
      view.rerender(<MissionControlCRM />);

      queries.grid.mockReturnValue({ ...grid, rows: [] });
      view.rerender(<MissionControlCRM />);
      const drawer = within(
        view.getByRole("dialog", { name: "Donor details" }),
      );
      expect(drawer.getByText("Alice Fresh Detail")).toBeTruthy();
      expect(drawer.getByText("alice.fresh@example.test")).toBeTruthy();
      expect(drawer.getByText("+1 555 0100")).toBeTruthy();
      expect(drawer.getByText("Lifetime giving: 12500")).toBeTruthy();
      expect(drawer.queryByText("Alice Donor")).toBeNull();
    },
  );

  it("keeps initial grid values when filtering reveals preexisting cached detail", () => {
    route.pathname = "/crm";
    route.search = "donor=donor-a";
    queries.detail.mockReturnValue({
      data: makeCrmDetail("Alice Cached"),
      dataUpdatedAt: 1000,
      isSuccess: true,
    });
    const view = render(<MissionControlCRM />, { wrapper: QueryProvider });
    queries.grid.mockReturnValue({
      ...queries.grid.mock.results.at(-1)!.value,
      rows: [],
    });
    view.rerender(<MissionControlCRM />);
    const drawer = within(view.getByRole("dialog", { name: "Donor details" }));
    expect(drawer.getByText("Alice Donor")).toBeTruthy();
    expect(drawer.queryByText("Alice Cached")).toBeNull();
  });

  it.each(["success", "fetching", "error"])(
    "keeps the refreshed grid snapshot when filtering reveals older cached detail in %s state",
    (cacheState) => {
      route.pathname = "/crm";
      route.search = "donor=donor-a";
      const cachedDetail = makeCrmDetail(
        "Alice Cached",
        "alice.cached@example.test",
      );
      queries.detail.mockReturnValue({
        data: cachedDetail,
        dataUpdatedAt: 1000,
        isSuccess: cacheState === "success",
        isFetching: cacheState === "fetching",
        isError: cacheState === "error",
      });
      const view = render(<MissionControlCRM />, { wrapper: QueryProvider });
      const grid = queries.grid.mock.results.at(-1)!.value;
      const refreshedRow = {
        ...donorRow,
        displayName: "Alice Current",
        email: "alice.current@example.test",
      };
      queries.grid.mockReturnValue({ ...grid, rows: [refreshedRow] });
      view.rerender(<MissionControlCRM />);
      expect(view.getByText("Alice Current")).toBeTruthy();

      queries.grid.mockReturnValue({ ...grid, rows: [] });
      view.rerender(<MissionControlCRM />);
      let drawer = within(view.getByRole("dialog", { name: "Donor details" }));
      expect(drawer.getByText("Alice Current")).toBeTruthy();
      expect(drawer.getByText("alice.current@example.test")).toBeTruthy();
      expect(drawer.queryByText("Alice Cached")).toBeNull();

      queries.detail.mockReturnValue({
        data: makeCrmDetail("Alice Fresh Detail", "alice.fresh@example.test"),
        dataUpdatedAt: 2000,
        isSuccess: true,
        isFetching: false,
        isError: false,
      });
      view.rerender(<MissionControlCRM />);
      drawer = within(view.getByRole("dialog", { name: "Donor details" }));
      expect(drawer.getByText("Alice Fresh Detail")).toBeTruthy();
      expect(drawer.getByText("alice.fresh@example.test")).toBeTruthy();
    },
  );
});
