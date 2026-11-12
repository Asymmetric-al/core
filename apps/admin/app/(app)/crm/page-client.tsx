"use client";

import {
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY,
  useAdminCrmRecordDetail,
  useAdminCrmRecordsInfiniteGrid,
} from "@asym/database/hooks";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Columns3, List, Network, StickyNote } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import { CrmSkipLink } from "./crm-display";
import {
  crmUrlStateKey,
  readCrmUrlState,
  writeCrmUrlState,
  type CrmUrlState,
  type CrmView,
} from "./crm-url-state";
import { DetailDrawer } from "./detail-drawer";
import { KanbanView } from "./kanban-view";
import {
  CrmBoardActions,
  CrmBoardFilters,
  CrmRecordsGrid,
  getCrmSearchValue,
  withCrmSearch,
} from "./records-grid";
import { toCrmRecord, toCrmRecordFromDetail } from "./types";
import { CRM_PAGE_META } from "../../../components/table-page-meta";
import { ContributionDetailOverlay } from "../contributions/contribution-detail-overlay";
import { isContributionGiftParam } from "../contributions/contribution-detail-query";
import {
  ContributionFreshnessIndicator,
  useContributionFreshness,
} from "../contributions/freshness-indicator";

import type { CrmGridRow, CrmRecord } from "./types";

type SelectedCrmRecordSnapshot = {
  record: CrmRecord;
  detailUpdatedAt: number;
  source: "grid" | "detail" | "selection";
};

/** The records list's box: the "Skip to records" link's target. */
const CRM_RECORDS_LIST_ID = "crm-records-list";

/**
 * Support Hub links to `/crm?email=` ("Find in CRM"). The records API's
 * server search covers email, so the address becomes the record search once
 * per distinct link value. Profile, missionary and church ids from the Hub
 * have no records-API filter and are not applied.
 */
function useSupportHubEmailSearch(
  emailParam: string | null,
  onFiltersChange: ReturnType<
    typeof useAdminCrmRecordsInfiniteGrid
  >["onFiltersChange"],
) {
  const appliedEmailRef = useRef<string | null>(null);
  useEffect(() => {
    const email = emailParam?.trim();
    if (!email || email === appliedEmailRef.current) {
      return;
    }
    appliedEmailRef.current = email;
    onFiltersChange((current) => withCrmSearch(current, email));
  }, [emailParam, onFiltersChange]);
}

/**
 * Keeps the list's search, filters, sort and view in the address (so reload,
 * a shared link and Back restore them) without feedback loops: whichever side
 * moved since the last sync wins. Writes use `history.replaceState`, which
 * Next.js folds into `useSearchParams` without a server round trip.
 */
function useCrmUrlStateSync({
  searchParams,
  pathname,
  state,
  apply,
}: {
  searchParams: URLSearchParams;
  pathname: string;
  state: CrmUrlState;
  apply: (state: CrmUrlState) => void;
}) {
  const urlState = useMemo(() => readCrmUrlState(searchParams), [searchParams]);
  const urlKey = crmUrlStateKey(urlState);
  const stateKey = crmUrlStateKey(state);
  const syncedKeyRef = useRef(urlKey);

  const sync = useEffectEvent(() => {
    if (urlKey === stateKey) {
      syncedKeyRef.current = stateKey;
      return;
    }
    if (stateKey !== syncedKeyRef.current) {
      syncedKeyRef.current = stateKey;
      const query = writeCrmUrlState(searchParams, state).toString();
      window.history.replaceState(
        null,
        "",
        query ? `${pathname}?${query}` : pathname,
      );
      return;
    }
    syncedKeyRef.current = urlKey;
    apply(urlState);
  });

  useEffect(() => {
    sync();
  }, [stateKey, urlKey]);
}

export default function MissionControlCRM() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialUrlState] = useState(() => readCrmUrlState(searchParams));
  const [view, setView] = useState<CrmView>(initialUrlState.view);
  const donorParam = searchParams.get("donor");
  const giftParam = searchParams.get("gift");
  const selectedGiftParam = isContributionGiftParam(giftParam)
    ? giftParam
    : null;
  const hasInvalidGiftParam = giftParam != null && selectedGiftParam == null;
  const [donorSelection, setDonorSelection] = useState({
    donorParam,
    donorId: donorParam,
  });
  const [giftSelection, setGiftSelection] = useState({
    giftParam,
    donationId: selectedGiftParam,
  });
  if (donorSelection.donorParam !== donorParam) {
    setDonorSelection({ donorParam, donorId: donorParam });
  }
  if (giftSelection.giftParam !== giftParam) {
    setGiftSelection({ giftParam, donationId: selectedGiftParam });
  }
  const selectedDonorId =
    donorSelection.donorParam === donorParam
      ? donorSelection.donorId
      : donorParam;
  const openGiftId =
    giftSelection.giftParam === giftParam
      ? giftSelection.donationId
      : selectedGiftParam;
  const { markFreshness, showFreshness } = useContributionFreshness();

  useEffect(() => {
    if (!hasInvalidGiftParam) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("gift");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [hasInvalidGiftParam, pathname, router, searchParams]);

  const gridState = useAdminCrmRecordsInfiniteGrid({
    initialColumnFilters: initialUrlState.columnFilters,
    initialSorting: initialUrlState.sorting,
  });
  const { rows } = gridState;
  const { onFiltersChange, onSortingChange } = gridState;
  useCrmUrlStateSync({
    searchParams,
    pathname,
    state: {
      columnFilters: gridState.columnFilters ?? [],
      sorting: gridState.sorting ?? [],
      view,
    },
    apply: (next) => {
      onFiltersChange(next.columnFilters);
      onSortingChange(next.sorting);
      setView(next.view);
    },
  });
  useSupportHubEmailSearch(
    searchParams.get("email"),
    gridState.onFiltersChange,
  );

  const routeDonorRow = useMemo(
    () =>
      selectedDonorId
        ? rows.find((candidate) => candidate.id === selectedDonorId)
        : undefined,
    [selectedDonorId, rows],
  );
  const [selectedRecordSnapshot, setSelectedRecordSnapshot] =
    useState<SelectedCrmRecordSnapshot | null>(null);
  // Observe the same cache key as the drawer while a grid row is visible, so
  // its snapshot can distinguish cached detail from a subsequent fresh read.
  const routeDonorDetailQuery = useAdminCrmRecordDetail(selectedDonorId);
  const detailUpdatedAt = routeDonorDetailQuery.dataUpdatedAt ?? 0;

  /**
   * Prefer the actively selected grid row, and use the canonical detail route
   * for bookmarked donors outside the grid. Matching snapshots keep the
   * selected row visible through pagination, filtering, and failed detail
   * reads; only a subsequent detail fetch supersedes their displayed values.
   */
  const resolvedRecordSnapshot =
    useMemo<SelectedCrmRecordSnapshot | null>(() => {
      if (!selectedDonorId) {
        return null;
      }
      if (routeDonorRow) {
        const record = toCrmRecord(routeDonorRow);
        // Keep the cache baseline tied to these grid values, so a detail
        // refresh can supersede them when filtering removes the row.
        if (
          selectedRecordSnapshot?.source === "grid" &&
          JSON.stringify(selectedRecordSnapshot.record) ===
            JSON.stringify(record)
        ) {
          return selectedRecordSnapshot;
        }
        return {
          record,
          detailUpdatedAt,
          source: "grid",
        };
      }
      const matchingSnapshot =
        selectedRecordSnapshot?.record.id === selectedDonorId
          ? selectedRecordSnapshot
          : null;
      if (
        routeDonorDetailQuery.data?.donor.id === selectedDonorId &&
        (!matchingSnapshot ||
          detailUpdatedAt > matchingSnapshot.detailUpdatedAt ||
          (matchingSnapshot.source === "detail" &&
            detailUpdatedAt === matchingSnapshot.detailUpdatedAt))
      ) {
        return {
          record: toCrmRecordFromDetail(routeDonorDetailQuery.data),
          detailUpdatedAt,
          source: "detail",
        };
      }
      return matchingSnapshot;
    }, [
      detailUpdatedAt,
      selectedDonorId,
      routeDonorDetailQuery.data,
      routeDonorRow,
      selectedRecordSnapshot,
    ]);
  const selectedRecord = resolvedRecordSnapshot?.record ?? null;
  // The drawer keeps showing the record it closed until its slide-out ends.
  const [closingRecord, setClosingRecord] = useState<CrmRecord | null>(null);
  const [previousSelected, setPreviousSelected] = useState(selectedRecord);
  if (previousSelected !== selectedRecord) {
    setPreviousSelected(selectedRecord);
    setClosingRecord(selectedRecord ? null : previousSelected);
  }
  const drawerRecord = selectedRecord ?? closingRecord;
  // A linked donor with nothing to show: neither in the list nor readable.
  const linkedRecordFailure =
    selectedDonorId && !selectedRecord && routeDonorDetailQuery.isError
      ? linkedRecordFailureKind(routeDonorDetailQuery.error)
      : null;
  // Keep the latest resolved values before a row disappears. These records
  // contain only serializable values; comparing those values also prevents
  // the allocating converters from triggering repeated render updates.
  if (
    resolvedRecordSnapshot &&
    JSON.stringify(selectedRecordSnapshot) !==
      JSON.stringify(resolvedRecordSnapshot)
  ) {
    setSelectedRecordSnapshot(resolvedRecordSnapshot);
  }

  const selectRecord = useCallback(
    (record: CrmRecord | null) => {
      setDonorSelection({ donorParam, donorId: record?.id ?? null });
      setGiftSelection({ giftParam, donationId: null });
      setSelectedRecordSnapshot(
        record
          ? {
              record,
              detailUpdatedAt:
                queryClient.getQueryState([
                  ...ADMIN_CRM_RECORD_DETAIL_QUERY_KEY,
                  record.id,
                ])?.dataUpdatedAt ?? 0,
              source: "selection",
            }
          : null,
      );
      const params = new URLSearchParams(searchParams.toString());
      params.delete("gift");
      if (record) {
        params.set("donor", record.id);
      } else {
        params.delete("donor");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [donorParam, giftParam, pathname, queryClient, router, searchParams],
  );

  const giftOpenerRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (openGiftId || !giftOpenerRef.current) {
      return;
    }
    // Wait for the sheet to close before returning focus to the
    // gift row in the donor drawer (ADR-CD-023).
    const opener = giftOpenerRef.current;
    giftOpenerRef.current = null;
    const timeout = window.setTimeout(() => opener.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [openGiftId]);

  const openGift = useCallback(
    (donationId: string) => {
      // Smart close (ADR-CD-023): remember the gift row so closing restores
      // focus to it while the donor drawer context stays untouched.
      giftOpenerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setGiftSelection({ giftParam, donationId });
      const params = new URLSearchParams(searchParams.toString());
      if (selectedDonorId) {
        params.set("donor", selectedDonorId);
      } else {
        params.delete("donor");
      }
      params.set("gift", donationId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [giftParam, pathname, router, searchParams, selectedDonorId],
  );

  const closeGift = useCallback(() => {
    setGiftSelection({ giftParam, donationId: null });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gift");
    if (selectedDonorId) {
      params.set("donor", selectedDonorId);
    } else {
      params.delete("donor");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [giftParam, pathname, router, searchParams, selectedDonorId]);

  const openRow = useCallback(
    (row: CrmGridRow) => selectRecord(toCrmRecord(row)),
    [selectRecord],
  );

  return (
    <>
      <PageShell
        title={CRM_PAGE_META.title}
        description={CRM_PAGE_META.description}
        density={CRM_PAGE_META.density}
        actions={<CrmViewToolbar setView={setView} view={view} />}
      >
        {linkedRecordFailure ? (
          <LinkedRecordAlert
            failure={linkedRecordFailure}
            retrying={routeDonorDetailQuery.isFetching}
            onDismiss={() => selectRecord(null)}
            onRetry={() => void routeDonorDetailQuery.refetch()}
          />
        ) : null}
        <CrmResultsSection
          gridState={gridState}
          showFreshness={showFreshness}
          view={view}
          onOpenRecord={openRow}
        />
      </PageShell>

      {drawerRecord && (
        <DetailDrawer
          // A different record is a fresh drawer (no note draft carried over).
          key={drawerRecord.id}
          contact={drawerRecord}
          open={selectedRecord != null}
          onClose={() => selectRecord(null)}
          onClosed={() => setClosingRecord(null)}
          onOpenGift={openGift}
          onRowRefresh={markFreshness}
        />
      )}

      <ContributionDetailOverlay
        donationId={openGiftId}
        sourceSurface="donor_crm_record"
        onClose={closeGift}
        onActionSuccess={markFreshness}
      />
    </>
  );
}

type LinkedRecordFailure = "unavailable" | "forbidden" | "failed";

/** Only the status is known; the copy never claims more than it says. */
function linkedRecordFailureKind(error: unknown): LinkedRecordFailure {
  const status =
    error instanceof Error && "status" in error ? error.status : null;
  if (status === 400 || status === 404) return "unavailable";
  if (status === 401 || status === 403) return "forbidden";
  return "failed";
}

const LINKED_RECORD_FAILURE_COPY: Record<LinkedRecordFailure, string> = {
  unavailable:
    "This link doesn't match a record in your organization's CRM. It may have been removed.",
  forbidden: "You don't have access to CRM records with this account.",
  failed: "The record didn't load. Check your connection and try again.",
};

function LinkedRecordAlert({
  failure,
  retrying,
  onDismiss,
  onRetry,
}: {
  failure: LinkedRecordFailure;
  retrying: boolean;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>Couldn&apos;t open that record</AlertTitle>
      <AlertDescription>
        <p>{LINKED_RECORD_FAILURE_COPY[failure]}</p>
        <div className="flex flex-wrap gap-2">
          {failure === "failed" ? (
            <Button
              size="sm"
              variant="outline"
              disabled={retrying}
              onClick={onRetry}
            >
              Retry
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function CrmViewToolbar({
  setView,
  view,
}: {
  setView: React.Dispatch<React.SetStateAction<CrmView>>;
  view: CrmView;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        aria-label="CRM view"
        variant="outline"
        size="sm"
        value={[view]}
        onValueChange={(value) => {
          const next = value[0];
          if (next === "table" || next === "kanban") setView(next);
        }}
      >
        {/* Icon-only toggles: the tooltip shows sighted users what each
            icon means; the aria-label stays the accessible name. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem value="table" aria-label="Show CRM table view">
                <List aria-hidden="true" />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Table</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToggleGroupItem value="kanban" aria-label="Show CRM kanban view">
                <Columns3 aria-hidden="true" />
              </ToggleGroupItem>
            }
          />
          <TooltipContent>Board by status</TooltipContent>
        </Tooltip>
      </ToggleGroup>
      <Link
        href="/crm/relationships"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Network aria-hidden="true" />
        Relationships
      </Link>
      <Link
        href="/crm/notes"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <StickyNote aria-hidden="true" />
        Notes
      </Link>
    </div>
  );
}

function CrmResultsSection({
  gridState,
  showFreshness,
  view,
  onOpenRecord,
}: {
  gridState: ReturnType<typeof useAdminCrmRecordsInfiniteGrid>;
  showFreshness: boolean;
  view: CrmView;
  onOpenRecord: (row: CrmGridRow) => void;
}) {
  const { columnFilters, onFiltersChange } = gridState;
  return (
    <div
      id={CRM_RECORDS_LIST_ID}
      tabIndex={-1}
      className="relative flex min-w-0 scroll-mt-4 flex-col outline-none"
    >
      {/* The page actions and the toolbar put dozens of Tab stops before
          the first record. */}
      <CrmSkipLink targetId={CRM_RECORDS_LIST_ID}>Skip to records</CrmSkipLink>
      <ContributionFreshnessIndicator show={showFreshness} />
      {view === "table" ? (
        <CrmRecordsGrid state={gridState} onOpenRecord={onOpenRecord} />
      ) : (
        <KanbanView
          rows={gridState.rows}
          onSelectRow={onOpenRecord}
          search={getCrmSearchValue(columnFilters ?? [])}
          onSearchChange={(value) =>
            onFiltersChange((current) => withCrmSearch(current, value))
          }
          filters={
            <CrmBoardFilters
              rows={gridState.rows}
              columnFilters={columnFilters ?? []}
              onFiltersChange={onFiltersChange}
            />
          }
          filtersActive={(columnFilters ?? []).length > 0}
          onClearFilters={() => onFiltersChange([])}
          hasMore={gridState.hasMore}
          isFetchingMore={gridState.isFetchingMore}
          onLoadMore={gridState.loadMore}
          isLoading={gridState.isLoading}
          error={gridState.tableError}
          onRetry={() => void gridState.onRefresh()}
          actions={<CrmBoardActions state={gridState} />}
        />
      )}
    </div>
  );
}
