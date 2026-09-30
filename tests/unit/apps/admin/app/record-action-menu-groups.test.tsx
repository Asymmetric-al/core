// @vitest-environment jsdom

import {
  createDataTableRowModels,
  dataTableFeatures,
  flexRender,
  useTable,
} from "@asym/ui/components/shadcn/data-table/tanstack";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the actual app actions cell and its Base UI menu ancestry.
import { getContributionColumns } from "../../../../../apps/admin/app/(app)/contributions/columns";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the actual app actions cell and its Base UI menu ancestry.
import { getCrmColumns } from "../../../../../apps/admin/app/(app)/crm/columns";

import type { ContributionGridRow } from "@asym/api/admin/contributions/types";
import type { CrmGridRow } from "@asym/database/types";
import type { ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";

afterEach(cleanup);

function ActionCell<TData>({
  columns,
  record,
}: {
  columns: ColumnDef<TData>[];
  record: TData;
}) {
  const table = useTable({
    features: dataTableFeatures,
    rowModels: createDataTableRowModels<TData>(),
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

const crmRecord: CrmGridRow = {
  id: "record-1",
  recordType: "individual",
  displayName: "Ada Lovelace",
  title: null,
  primaryOrganization: null,
  primaryContactLine: null,
  location: null,
  lifecycleStatus: "active",
  lastGiftAt: null,
  lifetimeGiving: 0,
  fundsGivenToSummary: null,
  lastTouchAt: null,
  nextTaskSummary: null,
  portalAccessLabel: "none",
  linkedAuthUserId: null,
  tags: [],
  assignedMissionaryName: null,
  avatarUrl: null,
  email: null,
  phone: null,
  notesPreview: null,
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

const contribution: ContributionGridRow = {
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
  donorAvatar: null,
  donorType: null,
  donorPhone: null,
  donorLocation: null,
  organizationName: null,
  amount: 10000,
  amountGross: 10000,
  amountNet: null,
  amountFee: null,
  amountTaxDeductible: null,
  currency: "USD",
  date: "2026-05-30T00:00:00.000Z",
  contributionDate: "2026-05-30T00:00:00.000Z",
  createdAt: "2026-05-30T00:00:00.000Z",
  updatedAt: "2026-05-30T00:00:00.000Z",
  settlementDate: null,
  depositDate: null,
  status: "completed",
  subStatus: null,
  type: "One-time",
  paymentMethod: "Credit Card",
  source: "Online",
  fundId: "fund-1",
  fundCode: "GENERAL",
  fundName: "General Fund",
  missionaryId: null,
  missionaryName: null,
  campaignId: null,
  receiptStatus: "pending",
  receiptSent: false,
  receiptSentAt: null,
  stagedGiftId: null,
  stagedGiftStatus: null,
  stagedGiftReviewReason: null,
  crmPostStatus: null,
  annualStatementEligible: true,
  entryMethod: "api",
  reconciliationStatus: "unreconciled",
  transactionId: "transaction-1",
  externalTransactionId: null,
  processorTransactionId: "transaction-1",
  notes: null,
  notesPreview: null,
  isAnonymous: false,
};

describe("record action menu groups", () => {
  it.each([null, "ada@example.test"])(
    "keeps CRM details in the labelled Actions group when email is %s",
    async (email) => {
      const record = { ...crmRecord, email };
      const onViewRecord = vi.fn();
      render(
        <ActionCell
          columns={getCrmColumns({ onViewRecord, tagOptions: [] })}
          record={record}
        />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "CRM actions for Ada Lovelace" }),
      );
      const group = await screen.findByRole("group", { name: "Actions" });
      const details = within(group).getByRole("menuitem", {
        name: "Open details",
      });
      expect(within(group).getAllByRole("menuitem")).toHaveLength(
        email ? 2 : 1,
      );
      expect(
        Boolean(within(group).queryByRole("menuitem", { name: "Copy email" })),
      ).toBe(Boolean(email));
      fireEvent.click(details);
      expect(onViewRecord).toHaveBeenCalledExactlyOnceWith(record);
    },
  );

  it("includes both contribution actions in the labelled group", async () => {
    const onViewContribution = vi.fn();
    render(
      <ActionCell
        columns={getContributionColumns({ onViewContribution })}
        record={contribution}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Contribution actions for Ada Lovelace",
      }),
    );
    const group = await screen.findByRole("group", { name: "Actions" });
    expect(
      within(group).getByRole("menuitem", { name: "Copy Transaction ID" }),
    ).toBeTruthy();
    const details = within(group).getByRole("menuitem", {
      name: "View Details",
    });
    expect(within(group).getAllByRole("menuitem")).toHaveLength(2);
    fireEvent.click(details);
    expect(onViewContribution).toHaveBeenCalledExactlyOnceWith(contribution);
  });
});
