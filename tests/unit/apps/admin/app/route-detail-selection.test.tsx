/** @vitest-environment jsdom */

import { QueryProvider } from "@asym/database/providers";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { CrmGridRow } from "@asym/database/types";
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
  ContributionsMainBody: () => null,
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
  DetailDrawer: ({ contact }: { contact: CrmGridRow }) => (
    <div role="dialog" aria-label="Donor details">
      {contact.displayName}
    </div>
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
});
