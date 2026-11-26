// @vitest-environment jsdom

import {
  dataTableFeatures,
  flexRender,
  useTable,
} from "@asym/ui/components/shadcn/data-table/tanstack";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ContributionGridRow } from "@asym/api/admin/contributions/types";
import type { ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";
import type { ReactNode } from "react";

const toasts = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast: toasts }));

const hooks = vi.hoisted(() => ({ views: [] as unknown[] }));
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-saved-views",
  () => ({
    useSupportSavedViews: () => ({
      data: hooks.views,
      access: { agentId: "agent-david", canManageAll: false },
      isLoading: false,
      isError: false,
      isReady: true,
      refetch: vi.fn(),
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useDeleteSupportSavedView: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({
      data: [],
      isLoading: false,
      isError: false,
      isReady: true,
      refetch: vi.fn(),
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/components/workspace/confirm-provider",
  () => ({ useConfirm: () => vi.fn().mockResolvedValue(false) }),
);

async function load() {
  vi.resetModules();
  const [{ DocumentScopeProvider }, columns, savedViews] = await Promise.all([
    import("../../../../packages/database/document-scope"),
    import("../../../../apps/admin/app/(app)/contributions/columns"),
    import("../../../../apps/admin/features/support-hub/components/settings/saved-views/SavedViewsList"),
  ]);
  return {
    DocumentScopeProvider,
    getContributionColumns: columns.getContributionColumns,
    SavedViewsList: savedViews.SavedViewsList,
  };
}

const TA = "00000000-0000-0000-0000-000000000001";
const scope = (addressPrefix: string) => ({
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: TA,
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix,
});

const contribution = {
  shared: {
    donationId: "donation-1",
    amountCents: 10000,
    currencyCode: "USD",
    giftDate: "2026-05-30T00:00:00.000Z",
    donorId: "donor-1",
    donorName: "Ada Lovelace",
    designationSummary: {
      fundId: "fund-1",
      fundName: "General Fund",
      missionaryId: null,
      missionaryName: null,
      lineCount: 1,
    },
    paymentStatus: "completed",
    receiptStatus: "pending",
    crmPostStatus: null,
    refundState: "none",
    refundedAmountCents: 0,
    correctionState: "none",
    recurringLinkState: "none",
  },
  id: "donation-1",
  donorId: "donor-1",
  donorName: "Ada Lovelace",
  donorEmail: "ada@example.test",
  amount: 10000,
  currency: "USD",
  date: "2026-05-30T00:00:00.000Z",
  transactionId: "donation-1",
} as unknown as ContributionGridRow;

function ActionCell({
  columns,
  record,
}: {
  columns: ColumnDef<ContributionGridRow>[];
  record: ContributionGridRow;
}) {
  const table = useTable({
    features: dataTableFeatures,
    data: [record],
    columns,
  });
  const cell = table
    .getRowModel()
    .rows[0]?.getAllCells()
    .find((candidate) => candidate.column.id === "actions");
  return cell
    ? flexRender(cell.column.columnDef.cell, cell.getContext())
    : null;
}

function inDocument(
  mod: Awaited<ReturnType<typeof load>>,
  addressPrefix: string,
  children: ReactNode,
) {
  return (
    <mod.DocumentScopeProvider scope={scope(addressPrefix)}>
      {children}
    </mod.DocumentScopeProvider>
  );
}

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  hooks.views = [
    {
      id: "mine",
      tenantId: TA,
      name: "My open",
      slug: "mine",
      scope: "personal",
      ownerAgentId: "agent-david",
      filter: {
        view: "mine",
        layout: "table",
        status: "open",
        q: "",
        labelSlugs: [],
        assignee: "",
      },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  Reflect.deleteProperty(navigator, "clipboard");
});

async function copyContribution() {
  fireEvent.click(
    screen.getByRole("button", { name: /^Contribution actions for / }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: "Copy link" }));
  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  return writeText.mock.calls[0]![0] as string;
}

async function copySavedView() {
  fireEvent.click(screen.getByRole("button", { name: "Actions for My open" }));
  fireEvent.click(await screen.findByRole("menuitem", { name: "Copy link" }));
  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  return writeText.mock.calls[0]![0] as string;
}

describe("on: copied links carry no sub-role and no ID", () => {
  beforeEach(() => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  });

  it("copies a contribution's link from a /~finance document without the sub-role (base: /admin/~finance/…)", async () => {
    const mod = await load();
    render(
      inDocument(
        mod,
        "/~finance",
        <ActionCell
          columns={mod.getContributionColumns({ onViewContribution: vi.fn() })}
          record={contribution}
        />,
      ),
    );
    expect(await copyContribution()).toBe(
      `${window.location.origin}/admin/contributions/donation-1`,
    );
  });

  it("copies a saved view's link from a /~finance document without the sub-role (base: /admin/~finance/…)", async () => {
    const mod = await load();
    render(inDocument(mod, "/~finance", <mod.SavedViewsList />));
    expect(await copySavedView()).toBe(
      `${window.location.origin}/admin/support?view=mine&layout=table&status=open`,
    );
  });
});

describe("off: copied links keep the document's prefix (guard)", () => {
  it("copies both links under /<organization>~<sub-role>", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    const mod = await load();
    const view = render(
      inDocument(
        mod,
        `/${TA}~finance`,
        <ActionCell
          columns={mod.getContributionColumns({ onViewContribution: vi.fn() })}
          record={contribution}
        />,
      ),
    );
    expect(await copyContribution()).toBe(
      `${window.location.origin}/${TA}~finance/contributions/donation-1`,
    );
    view.unmount();
    writeText.mockClear();
    render(inDocument(mod, `/${TA}~finance`, <mod.SavedViewsList />));
    expect(await copySavedView()).toBe(
      `${window.location.origin}/${TA}~finance/support?view=mine&layout=table&status=open`,
    );
  });
});
