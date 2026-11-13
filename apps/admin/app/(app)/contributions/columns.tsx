"use client";

import { formatSharedContributionAmount } from "@asym/api/admin/contribution-shared";
import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
import { getInitials } from "@asym/lib/utils";
import {
  DataGridRowPrimary,
  createDataGridSelectionColumn,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Copy, Eye, Link2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  ContributionReceiptStatus,
  ContributionStatusBadge,
} from "./contribution-status";
import { formatPaymentMethod } from "./data";
import {
  contributionDonorDetail,
  contributionDonorLabel,
  effectiveContributionStatus,
  matchesContributionSearch,
} from "./hub-model";
import {
  getHubPaymentStatusFacetValues,
  getHubSharedFilterFacetValue,
  hubSharedContributionFilterChips,
  matchesHubPaymentStatusSelection,
  matchesHubSharedFilterSelection,
} from "./shared-filters";

import type { Contribution } from "./types";
import type { DataGridColumnDef } from "@asym/ui/components/data-grid-panel";
import type { ReactNode } from "react";

/** Columns rendered by default; the rest are one click away in View. */
export const CONTRIBUTION_DEFAULT_HIDDEN_COLUMNS = [
  "type",
  "missionaryName",
  "paymentMethod",
  "source",
  "donorType",
  "amountNet",
  "entryMethod",
  "transactionId",
] as const;

/**
 * Column widths in px. The defaults without Fund / designation (754px) fit a
 * laptop-width panel (1024px window, sidebar open), where the fund moves to
 * the donor's second line; wider panels grow every column proportionally.
 */
/**
 * Entry methods as the contributions model normalizes them. "api" is the
 * model's catch-all for anything not imported or entered as cash, check or
 * bank transfer, so it reads as "System" rather than claiming "Online".
 */
const ENTRY_METHOD_LABELS: Record<Contribution["entryMethod"], string> = {
  api: "System",
  manual: "Manual entry",
  import: "Import",
};

export const CONTRIBUTION_COLUMN_SIZES = {
  select: 40,
  donorName: 210,
  amount: 108,
  date: 112,
  status: 124,
  type: 110,
  fundName: 184,
  missionaryName: 170,
  paymentMethod: 150,
  source: 120,
  receiptStatus: 104,
  donorType: 130,
  amountNet: 130,
  entryMethod: 130,
  transactionId: 200,
  actions: 56,
} as const satisfies Record<string, number>;

const DEFAULT_HIDDEN_COLUMN_IDS: ReadonlySet<string> = new Set(
  CONTRIBUTION_DEFAULT_HIDDEN_COLUMNS,
);

/** Width of every column the grid shows by default, Fund included. */
export const CONTRIBUTION_DEFAULT_COLUMNS_WIDTH = Object.entries(
  CONTRIBUTION_COLUMN_SIZES,
).reduce(
  (total, [id, size]) =>
    DEFAULT_HIDDEN_COLUMN_IDS.has(id) ? total : total + size,
  0,
);

/**
 * Columns that stay in view while the grid scrolls sideways: the row
 * checkbox and donor at the start, the row actions at the end. Pinning only
 * applies while the visible columns overflow the panel.
 */
export const CONTRIBUTION_PINNED_COLUMNS = {
  start: ["select", "donorName"],
  end: ["actions"],
};

const PINNABLE_COLUMN_IDS: ReadonlySet<string> = new Set([
  ...CONTRIBUTION_PINNED_COLUMNS.start,
  ...CONTRIBUTION_PINNED_COLUMNS.end,
]);

/** Sum of the widths of the visible data columns for a visibility state. */
export function getVisibleContributionColumnsWidth(
  visibility: Readonly<Record<string, boolean>>,
): number {
  return Object.entries(CONTRIBUTION_COLUMN_SIZES).reduce(
    (total, [id, size]) => (visibility[id] === false ? total : total + size),
    0,
  );
}

export function ContributionDonorAvatar({
  contribution,
}: {
  contribution: Contribution;
}) {
  const label = contributionDonorLabel(contribution);
  return (
    // Decorative: the donor name sits beside it, so screen readers skip the
    // initials instead of announcing them before the name.
    <Avatar aria-hidden="true" className="size-8">
      {!contribution.isAnonymous && contribution.donorAvatar ? (
        <AvatarImage src={contribution.donorAvatar} alt="" />
      ) : null}
      <AvatarFallback>
        {contribution.isAnonymous ? "?" : getInitials(label)}
      </AvatarFallback>
    </Avatar>
  );
}

export function useContributionDateLabel(value: string) {
  const { formatDate } = useLocaleFormat();
  return formatDate(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ContributionDateCell({ value }: { value: string }) {
  const label = useContributionDateLabel(value);
  return (
    <span className="text-sm whitespace-nowrap text-foreground">{label}</span>
  );
}

/** Record name for a gift's row checkbox: donor, then the amount shown. */
function contributionSelectionLabel(contribution: Contribution): string {
  return `${contributionDonorLabel(contribution)}, ${formatSharedContributionAmount(
    contribution.shared.amountCents,
    contribution.shared.currencyCode,
  )}`;
}

function SecondaryText({ children }: { children: ReactNode }) {
  return (
    <span className="block truncate text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function copyToClipboard(value: string, copiedMessage: string) {
  // Without a clipboard (an insecure page, an old browser) the copy never
  // happens: say so rather than doing nothing.
  if (!navigator.clipboard) {
    toast.error("Could not copy to clipboard");
    return;
  }
  void navigator.clipboard.writeText(value).then(
    () => toast.success(copiedMessage),
    () => toast.error("Could not copy to clipboard"),
  );
}

function ContributionRowActions({
  contribution,
  onViewContribution,
}: {
  contribution: Contribution;
  onViewContribution: (contribution: Contribution) => void;
}) {
  const donorLabel = contributionDonorLabel(contribution);
  // Only a processor reference is a transaction ID; a gift without its own
  // is shared through its link, never by printing the internal id.
  const processorId =
    contribution.transactionId && contribution.transactionId !== contribution.id
      ? contribution.transactionId
      : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Contribution actions for ${donorLabel}`}
            // The row itself opens the gift; a click (or Enter) on the menu
            // trigger must only open the menu. Menu items render in a portal,
            // which the row already ignores.
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onViewContribution(contribution)}>
            <Eye aria-hidden="true" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              copyToClipboard(
                new URL(
                  `/contributions/${encodeURIComponent(contribution.id)}`,
                  window.location.origin,
                ).href,
                "Contribution link copied",
              )
            }
          >
            <Link2 aria-hidden="true" />
            Copy link
          </DropdownMenuItem>
          {processorId ? (
            <DropdownMenuItem
              onClick={() =>
                copyToClipboard(processorId, "Transaction ID copied")
              }
            >
              <Copy aria-hidden="true" />
              Copy transaction ID
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const textSkeleton = <Skeleton className="h-4 w-20" />;

export { ContributionReceiptStatus, ContributionStatusBadge };

/**
 * Contributions Hub columns for the ReUI data grid. Money renders through
 * `formatSharedContributionAmount` from the shared adjusted amount; the badge
 * shows the grid status while the Status filter matches the shared payment
 * status (issue #274).
 */
export interface ContributionDonorCellLayout {
  /**
   * Decorative initials beside the donor. Narrow panels spend that width on
   * the donor name instead.
   */
  showAvatar: boolean;
  /**
   * The donor's second line names the fund (as the mobile card does) while
   * the Fund / designation column is hidden; otherwise it shows contact
   * detail.
   */
  fundInDonorLine: boolean;
}

const DEFAULT_DONOR_CELL_LAYOUT: ContributionDonorCellLayout = {
  showAvatar: true,
  fundInDonorLine: false,
};

export function getContributionColumns({
  onViewContribution,
  donorCellLayout = DEFAULT_DONOR_CELL_LAYOUT,
}: {
  onViewContribution: (contribution: Contribution) => void;
  donorCellLayout?: ContributionDonorCellLayout;
}): DataGridColumnDef<Contribution>[] {
  const columns: DataGridColumnDef<Contribution>[] = [
    {
      // Each row checkbox is named after its gift ("Select Kenji Nakamura,
      // $100.00"), so a screen reader user picking gifts for a bulk receipt
      // send hears which gift each one selects.
      ...createDataGridSelectionColumn<Contribution>({
        getRowLabel: contributionSelectionLabel,
      }),
      size: CONTRIBUTION_COLUMN_SIZES.select,
    },
    {
      // The donor column doubles as the search target: its filter matches
      // donor, email, organization, fund, recipient and transaction id.
      id: "donorName",
      accessorKey: "donorName",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Donor" />
      ),
      cell: ({ row }) => {
        const contribution = row.original;
        return (
          <DataGridRowPrimary
            className="w-full"
            onClick={() => onViewContribution(contribution)}
          >
            {donorCellLayout.showAvatar ? (
              <ContributionDonorAvatar contribution={contribution} />
            ) : null}
            <span className="min-w-0">
              {/* The record's name wraps rather than truncating. */}
              <span className="line-clamp-2 text-sm font-medium break-words text-foreground">
                {contributionDonorLabel(contribution)}
              </span>
              <SecondaryText>
                {donorCellLayout.fundInDonorLine
                  ? contribution.shared.designationSummary.fundName
                  : contributionDonorDetail(contribution)}
              </SecondaryText>
            </span>
          </DataGridRowPrimary>
        );
      },
      filterFn: (row, _columnId, filterValue) =>
        matchesContributionSearch(row.original, filterValue),
      enableSorting: false,
      enableHiding: false,
      size: CONTRIBUTION_COLUMN_SIZES.donorName,
      meta: {
        headerTitle: "Donor",
        skeleton: (
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ),
      },
    },
    {
      id: "amount",
      accessorFn: (row) => row.shared.amountCents,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <span className="block text-sm font-medium whitespace-nowrap text-foreground tabular-nums">
            {formatSharedContributionAmount(
              row.original.shared.amountCents,
              row.original.shared.currencyCode,
            )}
          </span>
          <SecondaryText>{row.original.type}</SecondaryText>
        </div>
      ),
      size: CONTRIBUTION_COLUMN_SIZES.amount,
      meta: {
        headerTitle: "Amount",
        headerClassName: "text-right [&>div]:justify-end [&>div]:-me-2",
        skeleton: (
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        ),
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <ContributionDateCell value={row.original.date} />
          <SecondaryText>
            {formatPaymentMethod(row.original.paymentMethod)}
          </SecondaryText>
        </div>
      ),
      size: CONTRIBUTION_COLUMN_SIZES.date,
      meta: { headerTitle: "Date", skeleton: textSkeleton },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <ContributionStatusBadge
          status={effectiveContributionStatus(row.original)}
        />
      ),
      // Shared-vocabulary selections (completed/pending/failed/refunded) must
      // match the shared evaluator (issue #274); Hub-only "processing" stays a
      // grid-status extension.
      filterFn: (row, _columnId, filterValue) =>
        matchesHubPaymentStatusSelection(row.original, filterValue),
      // Faceting counts by the same values the filter matches (not the grid
      // status accessor), so the chip popover counts agree with the filtered
      // rows — e.g. a refunded-but-grid-completed gift counts under Refunded.
      getUniqueValues: (row) => getHubPaymentStatusFacetValues(row),
      size: CONTRIBUTION_COLUMN_SIZES.status,
      meta: { headerTitle: "Status", skeleton: textSkeleton },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.type}</span>
      ),
      filterFn: (row, columnId, filterValue) =>
        matchesSelectedValue(row.getValue(columnId), filterValue),
      enableSorting: false,
      size: CONTRIBUTION_COLUMN_SIZES.type,
      meta: { headerTitle: "Type", skeleton: textSkeleton },
    },
    {
      id: "fundName",
      accessorFn: (row) => row.shared.designationSummary.fundName,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Fund / designation" />
      ),
      cell: ({ row }) => {
        const designation = row.original.shared.designationSummary;
        // `fundCode` carries the fund's UUID in live data, so the secondary
        // line names the supported missionary instead of an internal id.
        return (
          <div className="min-w-0">
            <span className="block truncate text-sm text-foreground">
              {designation.fundName}
            </span>
            {designation.missionaryName ? (
              <SecondaryText>{designation.missionaryName}</SecondaryText>
            ) : null}
          </div>
        );
      },
      enableSorting: false,
      size: CONTRIBUTION_COLUMN_SIZES.fundName,
      meta: { headerTitle: "Fund / designation", skeleton: textSkeleton },
    },
    {
      accessorKey: "missionaryName",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Recipient" />
      ),
      cell: ({ row }) => (
        <span className="block truncate text-sm text-foreground">
          {row.original.missionaryName || (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </span>
      ),
      enableSorting: false,
      size: CONTRIBUTION_COLUMN_SIZES.missionaryName,
      meta: { headerTitle: "Recipient", skeleton: textSkeleton },
    },
    {
      accessorKey: "paymentMethod",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Payment method" />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-foreground">
          {formatPaymentMethod(row.original.paymentMethod)}
        </span>
      ),
      filterFn: (row, columnId, filterValue) =>
        matchesSelectedValue(row.getValue(columnId), filterValue),
      size: CONTRIBUTION_COLUMN_SIZES.paymentMethod,
      meta: { headerTitle: "Payment method", skeleton: textSkeleton },
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Source" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.source}</span>
      ),
      filterFn: (row, columnId, filterValue) =>
        matchesSelectedValue(row.getValue(columnId), filterValue),
      size: CONTRIBUTION_COLUMN_SIZES.source,
      meta: { headerTitle: "Source", skeleton: textSkeleton },
    },
    {
      id: "receiptStatus",
      accessorFn: (row) => row.shared.receiptStatus,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Receipt" />
      ),
      cell: ({ row }) => (
        <ContributionReceiptStatus status={row.original.shared.receiptStatus} />
      ),
      enableSorting: false,
      size: CONTRIBUTION_COLUMN_SIZES.receiptStatus,
      meta: { headerTitle: "Receipt", skeleton: textSkeleton },
    },
    {
      accessorKey: "donorType",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Donor type" />
      ),
      cell: ({ row }) =>
        row.original.donorType ? (
          <span className="text-sm text-foreground capitalize">
            {row.original.donorType}
          </span>
        ) : (
          // No stored type: say so rather than assume "individual".
          <span className="text-sm text-muted-foreground">—</span>
        ),
      enableSorting: false,
      size: CONTRIBUTION_COLUMN_SIZES.donorType,
      meta: { headerTitle: "Donor type", skeleton: textSkeleton },
    },
    {
      accessorKey: "amountNet",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Net amount" />
      ),
      cell: ({ row }) => (
        <div className="text-right text-sm whitespace-nowrap tabular-nums">
          {row.original.amountNet != null ? (
            formatSharedContributionAmount(
              row.original.amountNet,
              row.original.shared.currencyCode,
            )
          ) : (
            <span className="text-muted-foreground">Unavailable</span>
          )}
        </div>
      ),
      enableSorting: false,
      // List rows never project net or fee amounts (contributions model sets
      // amountNet to null), so the column stays hidden and is not offered in
      // View, where it could only show an empty column.
      enableHiding: false,
      size: CONTRIBUTION_COLUMN_SIZES.amountNet,
      meta: {
        headerTitle: "Net amount",
        headerClassName: "text-right [&>div]:justify-end",
        skeleton: textSkeleton,
      },
    },
    {
      accessorKey: "entryMethod",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Entry method" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {ENTRY_METHOD_LABELS[row.original.entryMethod]}
        </span>
      ),
      enableSorting: false,
      size: CONTRIBUTION_COLUMN_SIZES.entryMethod,
      meta: { headerTitle: "Entry method", skeleton: textSkeleton },
    },
    {
      accessorKey: "transactionId",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => (
        <span className="block truncate font-mono text-xs text-muted-foreground">
          {row.original.transactionId || "Unavailable"}
        </span>
      ),
      enableSorting: false,
      size: CONTRIBUTION_COLUMN_SIZES.transactionId,
      meta: { headerTitle: "Transaction ID", skeleton: textSkeleton },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ContributionRowActions
            contribution={row.original}
            onViewContribution={onViewContribution}
          />
        </div>
      ),
      size: CONTRIBUTION_COLUMN_SIZES.actions,
      enableSorting: false,
      enableHiding: false,
      meta: { skeleton: <Skeleton className="ms-auto size-6" /> },
    },
    // Hidden filter-only columns backing the shared CRM/Hub filter chips
    // (issue #274). They never render as data columns: the grid hides them
    // through its initial column visibility and enableHiding: false keeps
    // them out of the View menu. The accessorFn only feeds faceted counts;
    // matching always goes through the shared evaluator so Hub results
    // cannot drift from CRM.
    ...hubSharedContributionFilterChips.map(
      (chip): DataGridColumnDef<Contribution> => ({
        id: chip.id,
        accessorFn: (row) => getHubSharedFilterFacetValue(row, chip.id),
        header: chip.label,
        enableHiding: false,
        enableSorting: false,
        filterFn: (row, _columnId, filterValue) =>
          matchesHubSharedFilterSelection(row.original, chip.id, filterValue),
      }),
    ),
  ];
  // Only the pinned set offers pin controls; every other header keeps its
  // plain sort toggle when the grid scrolls sideways.
  return columns.map((column) =>
    column.id && PINNABLE_COLUMN_IDS.has(column.id)
      ? column
      : { ...column, enablePinning: false },
  );
}

function matchesSelectedValue(value: unknown, filterValue: unknown): boolean {
  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    return true;
  }
  return filterValue.includes(value);
}
