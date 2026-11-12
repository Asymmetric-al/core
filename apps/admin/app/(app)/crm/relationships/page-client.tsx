"use client";

import {
  CRM_RELATIONSHIP_DOMAIN_OPTIONS,
  useAdminCrmRelationshipsGrid,
} from "@asym/database/hooks";
import { useIsMobile } from "@asym/lib/hooks/use-mobile";
import {
  DataGridPanel,
  DataGridSearch,
  DataGridToolbarSpacer,
  DataGridViewOptions,
  dataGridFeatures,
  useTable,
  DataGridSortSelect,
} from "@asym/ui/components/data-grid-panel";
import {
  MetricCard,
  MetricGrid,
  type MetricState,
} from "@asym/ui/components/primitives/metric-card";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import {
  Activity,
  ArrowLeft,
  HandCoins,
  Home,
  Network,
  ShieldAlert,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  CRM_RELATIONSHIP_FILL_COLUMN_ID,
  CRM_RELATIONSHIP_FILL_MINIMUMS,
  CrmRelationshipName,
  crmRelationshipAuthority,
  crmRelationshipColumnTiers,
  crmRelationshipSource,
  crmRelationshipDomainLabel,
  crmRelationshipMembersLabel,
  crmRelationshipSecondaryLabel,
  formatCrmCommitment,
  getCrmRelationshipColumns,
} from "./columns";
import {
  CrmDataSources,
  CrmEmptyValue,
  CrmRefreshButton,
  CrmSkipLink,
  CrmStatusBadge,
  crmPanelError,
  formatCrmDate,
  formatCrmMoneyCents,
} from "../crm-display";
import { crmVirtualOptions, useCrmVirtualAllowance } from "../crm-virtual";
import { useCrmGridLayout } from "../use-crm-grid-layout";

import type {
  CrmRelationshipDomain,
  CrmRelationshipReport,
  CrmRelationshipRow,
} from "@asym/database/types";
import type { DataGridRow } from "@asym/ui/components/data-grid-panel";
import type { ReactNode } from "react";

import {
  CRM_PAGE_META,
  CRM_RELATIONSHIPS_PAGE_META,
} from "@/components/table-page-meta";

/** Estimated relationship row height (name plus a secondary line). */
const RELATIONSHIP_ROW_HEIGHT = 56;

/** Server sort choices for phones, where the table headers are not shown. */
const CRM_RELATIONSHIP_SORT_LABELS: Record<string, string> = {
  "updatedAt:desc": "Updated: newest",
  "updatedAt:asc": "Updated: oldest",
  "lastActivityAt:desc": "Last activity: newest",
  "lastActivityAt:asc": "Last activity: oldest",
  "displayName:asc": "Name: A–Z",
  "displayName:desc": "Name: Z–A",
  "commitmentAmountCents:desc": "Commitment: highest",
  "commitmentAmountCents:asc": "Commitment: lowest",
};

/** Header sorts a wide screen can set, labelled if a phone shows them. */
const CRM_RELATIONSHIP_EXTRA_SORT_LABELS: Record<string, string> = {
  "status:asc": "Status: A–Z",
  "status:desc": "Status: Z–A",
};

/** The relationships list's box: the "Skip to relationships" target. */
const CRM_RELATIONSHIPS_LIST_ID = "crm-relationships-list";

/**
 * Below this panel width the toolbar cannot hold the search, every type
 * filter and the actions on one row, so Refresh and View join the search's
 * row and the types take the second (two rows, not three, at 1024).
 */
const RELATIONSHIP_TOOLBAR_ONE_ROW_WIDTH = 1120;

/**
 * Detail for the commitments figure: how many active pledges it covers, and
 * how many have no schedule that converts to a monthly amount.
 */
export function describeActivePledges(
  pledgeCount: number,
  unknownFrequencyCount: number,
): string {
  const active = `${pledgeCount} active ${pledgeCount === 1 ? "pledge" : "pledges"}`;
  return unknownFrequencyCount > 0
    ? `${active}, ${unknownFrequencyCount} with no monthly schedule left out`
    : active;
}

/**
 * The report's four figures in the shared metric cards, one row of four from
 * 1024 up (compact on phones), so the first relationship starts soon after
 * the page heading. Each card has one line saying what its figure counts,
 * from the data where it can be, so the row reads evenly.
 */
function CrmRelationshipsMetrics({
  report,
  isLoading,
}: {
  report: CrmRelationshipReport | null;
  isLoading: boolean;
}) {
  // A cached report stays on screen through a failed refresh; never a
  // stand-in zero, which would read as a real total.
  const state: MetricState = report
    ? "ready"
    : isLoading
      ? "loading"
      : "unavailable";
  const commitments = report?.activeCommitments;
  // A report without the commitments summary (an API and client contract
  // mismatch) is unavailable for this one figure, never $0.00. A summary
  // with no active pledges is a real zero.
  const commitmentsState: MetricState =
    state === "ready" && !commitments ? "unavailable" : state;
  const monthly = !commitments
    ? undefined
    : commitments.monthlyByCurrency.length > 0
      ? commitments.monthlyByCurrency
          .map((entry) =>
            formatCrmMoneyCents(entry.monthlyCents, entry.currency),
          )
          .join(" + ")
      : formatCrmMoneyCents(0);
  const pledges = commitments
    ? describeActivePledges(
        commitments.pledgeCount,
        commitments.unknownFrequencyCount,
      )
    : null;
  const excludedCare = report?.excludedCareActivityCount ?? 0;
  const counts = report?.domainCounts;
  const relationshipsDetail = counts
    ? `${counts.people} people, ${counts.churches + counts.organizations} churches and organizations`
    : null;
  const activityDetail = !report
    ? null
    : excludedCare > 0
      ? `Leaves out ${excludedCare} private care ${excludedCare === 1 ? "entry" : "entries"}`
      : "From Member Care";
  return (
    <MetricGrid
      label="Relationship summary"
      busy={state === "loading"}
      className="lg:grid-cols-4"
    >
      <MetricCard
        compactOnPhone
        icon={Network}
        label="Relationships"
        state={state}
        value={report?.totalRows}
        detail={relationshipsDetail}
      />
      <MetricCard
        compactOnPhone
        icon={HandCoins}
        label="Monthly commitments"
        state={commitmentsState}
        value={monthly}
        detail={pledges}
      />
      <MetricCard
        compactOnPhone
        icon={Home}
        label="Households"
        state={state}
        value={report?.householdCount}
        detail={report ? "Donors with a spouse on record" : null}
      />
      <MetricCard
        compactOnPhone
        icon={Activity}
        label="Activity"
        state={state}
        value={report?.recentActivityCount}
        detail={activityDetail}
      />
    </MetricGrid>
  );
}

function CrmRelationshipsSourceBadges({
  configured,
  mode,
}: {
  configured: boolean;
  mode: "local" | string;
}) {
  return (
    <CrmDataSources mode={mode} configured={configured}>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <p>
          Commitments are a read-only summary; Contributions holds each
          gift&apos;s full record.
        </p>
        <p>
          Monthly commitments count active pledges only, converted to a monthly
          amount.
        </p>
        <p>
          Shows everyday Member Care activity; sensitive care entries are always
          left out.
        </p>
      </div>
    </CrmDataSources>
  );
}

export function CrmRelationshipsFilters({
  search,
  domains,
  onSearchChange,
  onDomainToggle,
  clearDomains,
  searchAction,
  growSearch = false,
}: {
  search: string;
  domains: CrmRelationshipDomain[];
  onSearchChange: (value: string) => void;
  onDomainToggle: (value: CrmRelationshipDomain) => void;
  clearDomains: () => void;
  /**
   * Controls kept on the search's row: Refresh on phones, Refresh and View
   * on a narrow desktop panel, so the type filters start the next row.
   */
  searchAction?: ReactNode;
  /** The search takes the row's spare width (phones). */
  growSearch?: boolean;
}) {
  const searchBox = (
    <DataGridSearch
      label="Search CRM relationships"
      placeholder="Search relationships…"
      value={search}
      onValueChange={onSearchChange}
      className={growSearch ? "min-w-0 flex-1" : undefined}
    />
  );
  return (
    <>
      {searchAction ? (
        <div
          data-slot="crm-search-row"
          className="flex w-full min-w-0 items-center gap-2"
        >
          {searchBox}
          {searchAction}
        </div>
      ) : (
        searchBox
      )}
      {/* Wrapped, so every type stays in view (two rows on phones). */}
      <div
        role="group"
        aria-label="Relationship types"
        className="flex flex-wrap items-center gap-1.5"
      >
        <Button
          variant={domains.length === 0 ? "default" : "outline"}
          size="sm"
          aria-pressed={domains.length === 0}
          onClick={clearDomains}
        >
          All
        </Button>
        {CRM_RELATIONSHIP_DOMAIN_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={domains.includes(option.value) ? "default" : "outline"}
            size="sm"
            aria-pressed={domains.includes(option.value)}
            onClick={() => onDomainToggle(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </>
  );
}

function CrmRelationshipsEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Network aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No CRM relationships</EmptyTitle>
        <EmptyDescription>
          {filtered
            ? "No relationship records match this search or type."
            : "Relationships appear as donors, households and pledges are recorded."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function CrmRelationshipProperty({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={
        wide
          ? "flex min-w-0 flex-col gap-1 sm:col-span-2"
          : "flex min-w-0 flex-col gap-1"
      }
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

/**
 * Every field of a relationship without a CRM record (pledges, activity,
 * missionaries): what the narrower grid tiers and phone cards leave out.
 */
function CrmRelationshipDialog({
  relationship,
  onClose,
}: {
  relationship: CrmRelationshipRow | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={relationship !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      {relationship ? (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{relationship.displayName}</DialogTitle>
            <DialogDescription>
              {crmRelationshipDomainLabel(relationship.domain)} ·{" "}
              {crmRelationshipAuthority(relationship)}
            </DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-1 gap-4 rounded-lg border px-4 py-3 sm:grid-cols-2">
            {crmRelationshipSecondaryLabel(relationship) ? (
              <CrmRelationshipProperty label="Detail" wide>
                {crmRelationshipSecondaryLabel(relationship)}
              </CrmRelationshipProperty>
            ) : null}
            <CrmRelationshipProperty label="Status">
              {relationship.status ? (
                <CrmStatusBadge status={relationship.status} />
              ) : (
                <CrmEmptyValue />
              )}
            </CrmRelationshipProperty>
            <CrmRelationshipProperty label="Contact">
              {relationship.primaryContactName ?? <CrmEmptyValue />}
            </CrmRelationshipProperty>
            {formatCrmCommitment(relationship) ? (
              <CrmRelationshipProperty label="Commitment">
                <span className="font-medium tabular-nums">
                  {formatCrmCommitment(relationship)}
                </span>
              </CrmRelationshipProperty>
            ) : null}
            {crmRelationshipMembersLabel(relationship) ? (
              <CrmRelationshipProperty label="Members">
                {crmRelationshipMembersLabel(relationship)}
              </CrmRelationshipProperty>
            ) : null}
            {relationship.location ? (
              <CrmRelationshipProperty label="Location">
                {relationship.location}
              </CrmRelationshipProperty>
            ) : null}
            <CrmRelationshipProperty label="Source">
              {crmRelationshipSource(relationship)}
            </CrmRelationshipProperty>
            <CrmRelationshipProperty label="Last activity">
              <span className="tabular-nums">
                {formatCrmDate(relationship.lastActivityAt) ?? (
                  <CrmEmptyValue />
                )}
              </span>
            </CrmRelationshipProperty>
            <CrmRelationshipProperty label="Updated">
              <span className="tabular-nums">
                {formatCrmDate(relationship.updatedAt) ?? <CrmEmptyValue />}
              </span>
            </CrmRelationshipProperty>
          </dl>
          <DialogFooter showCloseButton />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

/**
 * The card's date: the one the list is ordered by (updated, the default, or
 * last activity), otherwise the last activity, so every card says when.
 */
export function crmRelationshipCardDate(
  relationship: CrmRelationshipRow,
  sortId: string | undefined,
): string | null {
  const updated = formatCrmDate(relationship.updatedAt);
  const lastActivity = formatCrmDate(relationship.lastActivityAt);
  if (sortId === "updatedAt" && updated) return `Updated ${updated}`;
  if (lastActivity) return `Last activity ${lastActivity}`;
  return updated ? `Updated ${updated}` : null;
}

function CrmRelationshipsMobileCard({
  relationship,
  sortId,
  onOpenDetails,
}: {
  relationship: CrmRelationshipRow;
  sortId: string | undefined;
  onOpenDetails: (row: CrmRelationshipRow) => void;
}) {
  const date = crmRelationshipCardDate(relationship, sortId);
  // The card's detail: a household's members or a pledge's commitment. The
  // source authority is the same on nearly every row, so it is not repeated.
  const detail =
    crmRelationshipMembersLabel(relationship) ??
    formatCrmCommitment(relationship);
  const description =
    crmRelationshipSecondaryLabel(relationship) ??
    (relationship.primaryContactName
      ? `Contact: ${relationship.primaryContactName}`
      : null);
  return (
    // The primary stretches over the card, so the whole card opens it.
    <div className="relative rounded-md transition-colors hover:bg-accent/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <Item variant="outline" size="sm" render={<div />}>
        <ItemContent className="min-w-0">
          <ItemTitle className="max-w-full">
            <CrmRelationshipName
              row={relationship}
              stretched
              onOpenDetails={onOpenDetails}
            />
          </ItemTitle>
          {description ? (
            <ItemDescription>{description}</ItemDescription>
          ) : null}
          {date ? (
            <p className="text-xs text-muted-foreground tabular-nums">{date}</p>
          ) : null}
        </ItemContent>
        <ItemFooter>
          <span className="flex min-w-0 items-center gap-1.5">
            <Badge variant="outline">
              {crmRelationshipDomainLabel(relationship.domain)}
            </Badge>
            {detail ? (
              <span className="truncate text-xs text-muted-foreground tabular-nums">
                {detail}
              </span>
            ) : null}
          </span>
          {relationship.status ? (
            <CrmStatusBadge status={relationship.status} />
          ) : null}
        </ItemFooter>
      </Item>
    </div>
  );
}

export default function CrmRelationshipsPageClient() {
  const {
    clearDomains,
    configured,
    domains,
    hasMore,
    isFetchingMore,
    isLoading,
    loadMore,
    missing,
    mode,
    onDomainToggle,
    onRefresh,
    onSearchChange,
    onSortingChange,
    relationships,
    report,
    search,
    sorting,
    tableError,
  } = useAdminCrmRelationshipsGrid();
  const [openRelationship, setOpenRelationship] =
    useState<CrmRelationshipRow | null>(null);
  const columns = useMemo(
    () => getCrmRelationshipColumns({ onOpenDetails: setOpenRelationship }),
    [],
  );
  // The sorted column stays on screen at every panel width.
  const keepVisible = useMemo(() => sorting.map((sort) => sort.id), [sorting]);
  const {
    panelRef,
    panelWidth,
    columnVisibility,
    columnSizing,
    onColumnVisibilityChange,
  } = useCrmGridLayout({
    columns,
    fillColumnId: CRM_RELATIONSHIP_FILL_COLUMN_ID,
    // Contact and commitment are columns only while most loaded rows have
    // them; otherwise they fold under the name.
    tiers: crmRelationshipColumnTiers(relationships),
    fillMinimums: CRM_RELATIONSHIP_FILL_MINIMUMS,
    keepVisible,
  });
  const virtualAllowance = useCrmVirtualAllowance(panelRef);
  const table = useTable({
    features: dataGridFeatures,
    data: relationships,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, columnVisibility, columnSizing },
    onSortingChange,
    onColumnVisibilityChange,
    manualSorting: true,
    // The hook pages by cursor; show every loaded row.
    manualPagination: true,
  });
  const filtered = search.trim().length > 0 || domains.length > 0;
  const isMobile = useIsMobile();
  const actionsBesideSearch =
    !isMobile &&
    panelWidth != null &&
    panelWidth < RELATIONSHIP_TOOLBAR_ONE_ROW_WIDTH;
  const sortId = sorting[0]?.id;
  const totalRows = report?.totalRows ?? relationships.length;
  const desktopActions = (
    <div className="ms-auto flex items-center gap-2">
      <CrmRefreshButton refreshing={isLoading} onRefresh={onRefresh} />
      {/* Columns only exist in the table layout. */}
      <DataGridViewOptions table={table} />
    </div>
  );

  return (
    <PageShell
      title={CRM_RELATIONSHIPS_PAGE_META.title}
      description={CRM_RELATIONSHIPS_PAGE_META.description}
      density={CRM_PAGE_META.density}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/crm"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft aria-hidden="true" />
            CRM
          </Link>
          <Link
            href="/crm/notes"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <StickyNote aria-hidden="true" />
            Notes
          </Link>
        </div>
      }
    >
      <div className="relative flex flex-col gap-6">
        {/* The summary, the type filters and the toolbar put dozens of Tab
            stops before the first relationship. */}
        <CrmSkipLink targetId={CRM_RELATIONSHIPS_LIST_ID}>
          Skip to relationships
        </CrmSkipLink>
        <CrmRelationshipsMetrics report={report} isLoading={isLoading} />

        {missing.length > 0 ? (
          <Alert variant="warning">
            <ShieldAlert />
            <AlertTitle>CRM relationships unavailable</AlertTitle>
            <AlertDescription>
              CRM relationships are not available in this environment.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Measured so the name column can take the width the others
            leave; the skip link's target. */}
        <div
          ref={panelRef}
          id={CRM_RELATIONSHIPS_LIST_ID}
          tabIndex={-1}
          className="min-w-0 scroll-mt-4 outline-none"
        >
          <DataGridPanel
            table={table}
            recordCount={relationships.length}
            label="CRM relationships"
            isLoading={isLoading}
            tableLayout={{ width: "fixed" }}
            // Long lists scroll inside the panel and load the next page near
            // the end; phones get a "Load more" button.
            virtual={crmVirtualOptions({
              rowCount: relationships.length,
              rowHeight: RELATIONSHIP_ROW_HEIGHT,
              hasMore,
              isFetchingMore,
              loadMore,
              noun: ["relationship", "relationships"],
              allowance: virtualAllowance,
              // The summary strip, a wrapping toolbar and the sources footer
              // leave little room at 1024x900; keep 60% of the window for
              // rows rather than a five-row slot.
              minViewportShare: 0.6,
            })}
            // An access denial reads "Access required", without a Retry.
            error={crmPanelError(tableError, {
              resource: "CRM relationships",
              onRetry: () => void onRefresh(),
            })}
            empty={<CrmRelationshipsEmptyState filtered={filtered} />}
            renderMobileRow={(row: DataGridRow<CrmRelationshipRow>) => (
              <CrmRelationshipsMobileCard
                relationship={row.original}
                sortId={sortId}
                onOpenDetails={setOpenRelationship}
              />
            )}
            toolbar={
              <>
                <CrmRelationshipsFilters
                  search={search}
                  domains={domains}
                  onSearchChange={onSearchChange}
                  onDomainToggle={onDomainToggle}
                  clearDomains={clearDomains}
                  searchAction={
                    isMobile ? (
                      <CrmRefreshButton
                        compact
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                      />
                    ) : actionsBesideSearch ? (
                      desktopActions
                    ) : undefined
                  }
                  growSearch={isMobile}
                />
                {isMobile ? (
                  // Phones get cards without headers, so sorting moves here.
                  <DataGridSortSelect
                    label="Sort relationships"
                    options={CRM_RELATIONSHIP_SORT_LABELS}
                    extraOptions={CRM_RELATIONSHIP_EXTRA_SORT_LABELS}
                    fallback="lastActivityAt:desc"
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                  />
                ) : actionsBesideSearch ? null : (
                  <>
                    <DataGridToolbarSpacer />
                    {desktopActions}
                  </>
                )}
              </>
            }
            footer={
              <div className="flex flex-col gap-4">
                {relationships.length > 0 ? (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {hasMore
                      ? `${relationships.length} of ${totalRows} relationships loaded`
                      : `${relationships.length} ${
                          relationships.length === 1
                            ? "relationship"
                            : "relationships"
                        }`}
                  </p>
                ) : null}
                <CrmRelationshipsSourceBadges
                  configured={configured}
                  mode={mode}
                />
              </div>
            }
          />
        </div>
      </div>

      <CrmRelationshipDialog
        relationship={openRelationship}
        onClose={() => setOpenRelationship(null)}
      />
    </PageShell>
  );
}
