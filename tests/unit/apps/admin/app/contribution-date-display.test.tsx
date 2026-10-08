/** @vitest-environment jsdom */

import {
  dataTableFeatures,
  flexRender,
  useTable,
} from "@asym/ui/components/shadcn/data-table/tanstack";
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildContributionGridRow } from "../../../../../packages/api/src/admin/contributions/model";

import type { ContributionGridRow as Contribution } from "@asym/api/admin/contributions/types";
import type { DataTableResponsiveProps } from "@asym/ui/components/shadcn/data-table/data-table-responsive";

// Invoke the public mobile renderer with actual TanStack rows; the desktop
// column is exercised separately without responsive shell/viewport concerns.
vi.mock("@asym/ui/components/shadcn/data-table", () => ({
  DataTableResponsive: ({
    data,
    columns,
    mobileCardConfig,
  }: DataTableResponsiveProps<Contribution, unknown>) => {
    const table = useTable({
      features: dataTableFeatures,
      data,
      columns,
    });
    return (
      <>
        {table.getRowModel().rows.map((row) => (
          <div key={row.id}>{mobileCardConfig?.renderCard?.(row)}</div>
        ))}
      </>
    );
  },
}));

const { getContributionColumns } =
  await import("../../../../../apps/admin/app/(app)/contributions/columns");
const { ContributionDetailSheet } =
  await import("../../../../../apps/admin/app/(app)/contributions/contribution-detail-sheet");
const { ContributionsMainBody } =
  await import("../../../../../apps/admin/app/(app)/contributions/main-body");

function contribution(giftDate: string): Contribution {
  return buildContributionGridRow({
    donation: {
      id: "00000000-0000-4000-8000-000000000003",
      donor_id: null,
      missionary_id: null,
      fund_id: null,
      amount: 2500,
      currency: "USD",
      status: "completed",
      donation_type: "one_time",
      payment_method: "cash",
      is_recurring: false,
      recurring_interval: null,
      notes: null,
      stripe_payment_intent_id: null,
      gift_date: giftDate,
      campaign_id: null,
      pledge_id: null,
      processed_at: null,
      completed_at: null,
      failed_at: null,
      error_code: null,
      error_message: null,
      stripe_charge_id: null,
      refunded_at: null,
      refund_amount: 0,
      source: "in_person",
      created_at: "2026-10-03T00:30:00.000Z",
      updated_at: "2026-10-03T00:30:00.000Z",
    },
    donor: null,
    profile: null,
    fund: null,
    missionary: null,
  });
}

function DateColumn({ row }: { row: Contribution }) {
  const table = useTable({
    features: dataTableFeatures,
    data: [row],
    columns: getContributionColumns({ onViewContribution: vi.fn() }),
  });
  const cell = table
    .getRowModel()
    .rows[0]?.getAllCells()
    .find((entry) => entry.column.id === "date");
  if (!cell) throw new Error("Actual contribution date column was not found");
  return <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>;
}

const surfaces = ["detail sheet", "mobile card", "desktop column"] as const;
type Surface = (typeof surfaces)[number];

function show(surface: Surface, row: Contribution) {
  if (surface === "detail sheet") {
    return render(
      <ContributionDetailSheet contribution={row} onClose={vi.fn()} />,
    );
  }
  if (surface === "mobile card") {
    return render(
      <ContributionsMainBody
        data={[row]}
        isLoading={false}
        onSelectContribution={vi.fn()}
      />,
    );
  }
  return render(<DateColumn row={row} />);
}

afterEach(cleanup);

describe.each(surfaces)("contribution calendar date in the %s", (surface) => {
  it("displays the actual API gift_date without shifting the calendar day", async () => {
    const row = contribution("2026-10-03");
    show(surface, row);
    await screen.findByText(
      surface === "detail sheet" ? "Sat, Oct 3, 2026" : "Oct 3, 2026",
    );
    expect(row.shared.giftDate).toBe("2026-10-03");
    expect(row.date).toBe("2026-10-03");
  });

  it("preserves the visitor's calendar projection of the legacy instant fallback", async () => {
    const row = contribution("");
    // At 00:30 UTC, a zone more than 30 minutes west is still October 2.
    // Select the known calendar texts without calling the formatter under test.
    const previousDay = new Date(row.date).getTimezoneOffset() > 30;
    show(surface, row);
    const text =
      surface === "detail sheet"
        ? previousDay
          ? "Fri, Oct 2, 2026"
          : "Sat, Oct 3, 2026"
        : previousDay
          ? "Oct 2, 2026"
          : "Oct 3, 2026";
    await screen.findByText(text);
    expect(row.date).toBe("2026-10-03T00:30:00.000Z");
  });
});

describe.each(["mobile card", "desktop column"] as const)(
  "contribution instant hydration in the %s",
  (surface) => {
    it("hydrates a stable UTC snapshot before applying the visitor's instant date", async () => {
      const row = contribution("");
      const element =
        surface === "desktop column" ? (
          <DateColumn row={row} />
        ) : (
          <ContributionsMainBody
            data={[row]}
            isLoading={false}
            onSelectContribution={vi.fn()}
          />
        );
      const html = renderToString(element);
      expect(html).toContain("Oct 3, 2026");
      const container = document.createElement("div");
      container.innerHTML = html;
      document.body.appendChild(container);
      const recoverableErrors: string[] = [];
      let root: ReturnType<typeof hydrateRoot> | undefined;
      try {
        await act(async () => {
          root = hydrateRoot(container, element, {
            onRecoverableError: (error) =>
              recoverableErrors.push(String(error)),
          });
        });
        await waitFor(() => {
          const previousDay = new Date(row.date).getTimezoneOffset() > 30;
          expect(
            within(container).getByText(
              previousDay ? "Oct 2, 2026" : "Oct 3, 2026",
            ),
          ).toBeTruthy();
        });
        expect(recoverableErrors).toEqual([]);
      } finally {
        await act(async () => root?.unmount());
        container.remove();
      }
    });
  },
);
