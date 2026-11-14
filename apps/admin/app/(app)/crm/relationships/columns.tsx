"use client";

import { DataGridRowPrimary } from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { cn } from "@asym/ui/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  CrmEmptyValue,
  CrmStatusBadge,
  formatCrmDate,
  formatCrmMoneyCents,
  toCrmLabel,
} from "../crm-display";

import type { CrmRelationshipRow } from "@asym/database/types";
import type { DataGridColumnDef } from "@asym/ui/components/data-grid-panel";

/**
 * Columns that are the same on nearly every row start hidden at every width,
 * and the View menu restores them: Source is "Asym CRM" on nearly every row
 * (pledges read "Asym finance summary", which the Pledges type already says),
 * and Updated is usually the same date as Last activity.
 */
const CRM_RELATIONSHIP_REPEATED_COLUMNS = {
  sourceSystem: false,
  updatedAt: false,
} as const;

/**
 * Only households and pledges have a contact or a commitment. Wide panels
 * (about 1280px windows and up) show each as a column only while at least
 * half the loaded rows fill it (a pledges or households view), so a mixed
 * list is not a column of dashes; otherwise, and on narrower panels, the
 * value folds under the name, on the rows that have it (a sorted column
 * stays visible). Narrower panels then drop location, then last activity.
 */
const CRM_RELATIONSHIP_SPARSE_COLUMNS = {
  ...CRM_RELATIONSHIP_REPEATED_COLUMNS,
  primaryContactName: false,
  commitmentAmountCents: false,
} as const;

const CRM_RELATIONSHIP_NARROW_TIERS: Array<Record<string, boolean>> = [
  CRM_RELATIONSHIP_SPARSE_COLUMNS,
  { ...CRM_RELATIONSHIP_SPARSE_COLUMNS, location: false },
  {
    ...CRM_RELATIONSHIP_SPARSE_COLUMNS,
    location: false,
    lastActivityAt: false,
  },
];

/** Column tiers for each pair of (contact shown, commitment shown). */
function relationshipTiers(contact: boolean, commitment: boolean) {
  return [
    {
      ...CRM_RELATIONSHIP_REPEATED_COLUMNS,
      ...(contact ? {} : { primaryContactName: false }),
      ...(commitment ? {} : { commitmentAmountCents: false }),
    },
    ...CRM_RELATIONSHIP_NARROW_TIERS,
  ];
}

const CRM_RELATIONSHIP_TIER_SETS = {
  both: relationshipTiers(true, true),
  contact: relationshipTiers(true, false),
  commitment: relationshipTiers(false, true),
  neither: relationshipTiers(false, false),
};

/**
 * The column tiers for the loaded rows: contact and commitment are columns
 * on a wide panel only while at least half the rows have a value for them.
 * Returns one of four constant arrays, so the layout stays stable.
 */
export function crmRelationshipColumnTiers(
  rows: readonly CrmRelationshipRow[],
): Array<Record<string, boolean>> {
  if (rows.length === 0) return CRM_RELATIONSHIP_TIER_SETS.neither;
  const filled = (has: (row: CrmRelationshipRow) => boolean) =>
    rows.filter(has).length * 2 >= rows.length;
  const contact = filled((row) => Boolean(row.primaryContactName));
  const commitment = filled((row) => row.commitmentAmountCents != null);
  if (contact && commitment) return CRM_RELATIONSHIP_TIER_SETS.both;
  if (contact) return CRM_RELATIONSHIP_TIER_SETS.contact;
  if (commitment) return CRM_RELATIONSHIP_TIER_SETS.commitment;
  return CRM_RELATIONSHIP_TIER_SETS.neither;
}

/**
 * The name's minimum per tier: the wide tier applies only while the name
 * keeps 340px (a long household name and its type badge), so the extra
 * columns never squeeze it; the folded tiers use the column's own minimum.
 */
export const CRM_RELATIONSHIP_FILL_MINIMUMS: readonly (number | undefined)[] = [
  340,
];

/** The relationship name takes the width the other visible columns leave. */
export const CRM_RELATIONSHIP_FILL_COLUMN_ID = "displayName";

/** Singular row labels; the filter buttons keep the plural domain names. */
const DOMAIN_ROW_LABELS: Record<string, string> = {
  people: "Person",
  organizations: "Organization",
  churches: "Church",
  households: "Household",
  pledges: "Pledge",
  activity: "Activity",
};

export function crmRelationshipDomainLabel(domain: string): string {
  return DOMAIN_ROW_LABELS[domain] ?? toCrmLabel(domain);
}

/**
 * The secondary label, unless it only repeats the commitment frequency or the
 * primary contact (a household's label is its contact, shown on its own).
 */
export function crmRelationshipSecondaryLabel(
  row: CrmRelationshipRow,
): string | null {
  const label = row.secondaryLabel?.trim();
  if (!label) return null;
  const repeats = [row.commitmentFrequency, row.primaryContactName].some(
    (value) => value && label.toLowerCase() === value.trim().toLowerCase(),
  );
  return repeats ? null : label;
}

/** "2 members" for households; null for rows without a member count. */
export function crmRelationshipMembersLabel(
  row: CrmRelationshipRow,
): string | null {
  if (row.memberCount == null) return null;
  return row.memberCount === 1 ? "1 member" : `${row.memberCount} members`;
}

export function crmRelationshipRecordHref(
  row: CrmRelationshipRow,
): string | null {
  // The server names the donor record a row opens (a pledge opens its
  // donor's); missionaries and activity have none.
  return row.donorId ? `/crm?donor=${encodeURIComponent(row.donorId)}` : null;
}

export function formatCrmCommitment(row: CrmRelationshipRow): string | null {
  if (row.commitmentAmountCents == null) {
    return null;
  }
  const amount = formatCrmMoneyCents(
    row.commitmentAmountCents,
    row.commitmentCurrency,
  );
  // Labelled as the Commitment column labels it ("semi_annual" reads
  // "semi annual"), lower case as it follows the amount.
  return row.commitmentFrequency
    ? `${amount} ${toCrmLabel(row.commitmentFrequency).toLowerCase()}`
    : amount;
}

/** Where the row's details are kept, in staff language. */
export function crmRelationshipAuthority(row: CrmRelationshipRow): string {
  switch (row.authorityScope) {
    case "finance_summary":
      return "Summary from Contributions";
    case "member_care":
    case "care_excluded":
      return "Kept in Member Care";
    default:
      return "CRM";
  }
}

const SOURCE_LABELS: Record<CrmRelationshipRow["sourceSystem"], string> = {
  "Asym CRM": "CRM",
  "Asym finance summary": "Asym finance summary",
  "Asym member care": "Member Care",
};

/** The source system a row came from, in staff language. */
export function crmRelationshipSource(row: CrmRelationshipRow): string {
  return SOURCE_LABELS[row.sourceSystem] ?? row.sourceSystem;
}

/**
 * Relationship name, the row's one primary control: a link to the CRM record
 * when one exists, otherwise a button that opens the row's details
 * (missionaries, activity and pledges without a known donor have no CRM
 * record). `stretched` extends it over
 * its positioned card so the whole card opens it.
 */
export function CrmRelationshipName({
  row,
  stretched = false,
  onOpenDetails,
}: {
  row: CrmRelationshipRow;
  stretched?: boolean;
  onOpenDetails: (row: CrmRelationshipRow) => void;
}) {
  const href = crmRelationshipRecordHref(row);
  if (!href) {
    return (
      <DataGridRowPrimary
        title={row.displayName}
        className={cn(stretched && "after:absolute after:inset-0")}
        onClick={() => onOpenDetails(row)}
      >
        <span className="truncate text-sm font-medium text-foreground underline-offset-4 hover:underline">
          {row.displayName}
        </span>
      </DataGridRowPrimary>
    );
  }
  // The arrow marks a name that leaves for the CRM record; names without
  // a record open their details in place.
  return (
    <DataGridRowPrimary
      render={<Link href={href} title={row.displayName} />}
      className={cn(stretched && "after:absolute after:inset-0")}
    >
      <span className="truncate text-sm font-medium text-foreground underline-offset-4 hover:underline">
        {row.displayName}
      </span>
      <ArrowUpRight
        aria-hidden="true"
        data-slot="opens-record"
        className="size-3.5 shrink-0 text-muted-foreground"
      />
    </DataGridRowPrimary>
  );
}

function DateCell({ value }: { value: string | null }) {
  const formatted = formatCrmDate(value);
  return formatted ? (
    <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
      {formatted}
    </span>
  ) : (
    <CrmEmptyValue />
  );
}

export function getCrmRelationshipColumns({
  onOpenDetails,
}: {
  onOpenDetails: (row: CrmRelationshipRow) => void;
}): DataGridColumnDef<CrmRelationshipRow>[] {
  return [
    {
      id: "displayName",
      accessorFn: (row) => row.displayName,
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row, table }) => {
        const relationship = row.original;
        const hidden = (columnId: string) =>
          table.getColumn(columnId)?.getIsVisible() === false;
        // A hidden Commitment or Contact column moves its value under the
        // name, so a pledge keeps its amount and a household its contact.
        const detail = [
          crmRelationshipMembersLabel(relationship),
          hidden("commitmentAmountCents")
            ? formatCrmCommitment(relationship)
            : null,
          hidden("primaryContactName") && relationship.primaryContactName
            ? `Contact: ${relationship.primaryContactName}`
            : null,
          crmRelationshipSecondaryLabel(relationship),
        ]
          .filter(Boolean)
          .join(" · ");
        // Name and type share the first line; detail, when there is any,
        // sits under it, so rows without detail stay one line tall.
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <CrmRelationshipName
                row={relationship}
                onOpenDetails={onOpenDetails}
              />
              <Badge variant="outline">
                {crmRelationshipDomainLabel(relationship.domain)}
              </Badge>
            </div>
            {detail ? (
              <span
                className="truncate text-xs text-muted-foreground"
                title={detail}
              >
                {detail}
              </span>
            ) : null}
          </div>
        );
      },
      enableHiding: false,
      size: 300,
      minSize: 240,
      meta: { headerTitle: "Relationship" },
    },
    {
      accessorKey: "sourceSystem",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          <span className="text-sm text-foreground">
            {crmRelationshipSource(row.original)}
          </span>
          <span className="text-xs text-muted-foreground">
            {crmRelationshipAuthority(row.original)}
          </span>
        </div>
      ),
      enableSorting: false,
      size: 170,
      meta: { headerTitle: "Source" },
    },
    {
      accessorKey: "primaryContactName",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) =>
        row.original.primaryContactName ? (
          <span
            className="block truncate text-sm text-muted-foreground"
            title={row.original.primaryContactName}
          >
            {row.original.primaryContactName}
          </span>
        ) : (
          <CrmEmptyValue />
        ),
      enableSorting: false,
      size: 150,
      meta: { headerTitle: "Contact" },
    },
    {
      accessorKey: "location",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) =>
        row.original.location ? (
          <span
            className="block truncate text-sm text-muted-foreground"
            title={row.original.location}
          >
            {row.original.location}
          </span>
        ) : (
          <CrmEmptyValue />
        ),
      enableSorting: false,
      size: 160,
      meta: { headerTitle: "Location" },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => <CrmStatusBadge status={row.original.status} />,
      size: 100,
      meta: { headerTitle: "Status" },
    },
    {
      accessorKey: "commitmentAmountCents",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataGridColumnHeader column={column} />
        </div>
      ),
      cell: ({ row }) => {
        const relationship = row.original;
        if (relationship.commitmentAmountCents == null) {
          return (
            <div className="text-end">
              <CrmEmptyValue />
            </div>
          );
        }
        return (
          <div className="flex flex-col items-end whitespace-nowrap">
            <span className="text-sm font-medium text-foreground tabular-nums">
              {formatCrmMoneyCents(
                relationship.commitmentAmountCents,
                relationship.commitmentCurrency,
              )}
            </span>
            {relationship.commitmentFrequency ? (
              <span className="text-xs text-muted-foreground">
                {toCrmLabel(relationship.commitmentFrequency)}
              </span>
            ) : null}
          </div>
        );
      },
      size: 132,
      meta: { headerTitle: "Commitment" },
    },
    {
      accessorKey: "lastActivityAt",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => <DateCell value={row.original.lastActivityAt} />,
      size: 120,
      meta: { headerTitle: "Last activity" },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataGridColumnHeader column={column} />,
      cell: ({ row }) => <DateCell value={row.original.updatedAt} />,
      size: 120,
      meta: { headerTitle: "Updated" },
    },
  ];
}
