"use client";

import {
  useAdminCrmRecordDetail,
  useAdminCrmRecordsInfiniteGrid,
} from "@asym/database/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { formatCurrency } from "@asym/lib/utils";
import {
  crmRecordAvatarTransitionName,
  crmRecordTitleTransitionName,
} from "@asym/lib/view-transitions";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  DataTableResponsive,
  type DataTableFilterField,
} from "@asym/ui/components/shadcn/data-table";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import {
  Plus,
  List,
  Columns,
  User,
  Network,
  Receipt,
  Trash2,
  StickyNote,
  GitCompareArrows,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getCrmColumns } from "./columns";
import { EMPTY_CELL_VALUE } from "./crm-detail-shared";
import { DetailDrawer } from "./detail-drawer";
import { KanbanView } from "./kanban-view";
import { toCrmRecord, toCrmRecordFromDetail } from "./types";
import { CRM_PAGE_META } from "../../components/table-page-meta";
import {
  ContributionDetailOverlay,
  isContributionGiftParam,
} from "../contributions/contribution-detail-overlay";

import type { CrmGridRow, CrmRecord } from "./types";

export default function MissionControlCRM() {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selectedRecord, setSelectedRecord] = useState<CrmRecord | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const donorParam = searchParams.get("donor");
  const giftParam = searchParams.get("gift");
  const selectedGiftParam = isContributionGiftParam(giftParam)
    ? giftParam
    : null;
  const hasInvalidGiftParam = giftParam != null && selectedGiftParam == null;
  const [openGiftId, setOpenGiftId] = useState<string | null>(
    () => selectedGiftParam,
  );

  useEffect(() => {
    setOpenGiftId(selectedGiftParam);
  }, [selectedGiftParam]);

  useEffect(() => {
    if (!hasInvalidGiftParam) {
      return;
    }

    setOpenGiftId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gift");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [hasInvalidGiftParam, pathname, router, searchParams]);

  const {
    columnFilters,
    hasMore,
    isFetchingMore,
    isLoading,
    loadMore,
    onFiltersChange,
    onRefresh,
    onSortingChange,
    rows,
    sorting,
    tableError,
  } = useAdminCrmRecordsInfiniteGrid();

  const routeDonorRow = useMemo(
    () =>
      donorParam
        ? rows.find((candidate) => candidate.id === donorParam)
        : undefined,
    [donorParam, rows],
  );
  const shouldLoadRouteDonor =
    Boolean(donorParam) && !routeDonorRow && selectedRecord?.id !== donorParam;
  const routeDonorDetailQuery = useAdminCrmRecordDetail(
    shouldLoadRouteDonor ? donorParam : null,
  );

  /**
   * Restore the donor drawer from `?donor=` route state. Prefer the loaded grid
   * row when present, and fall back to the canonical detail route so bookmarked
   * links survive pagination, filters, and sort changes.
   */
  useEffect(() => {
    if (!donorParam || selectedRecord?.id === donorParam) {
      return;
    }
    if (routeDonorRow) {
      setSelectedRecord(toCrmRecord(routeDonorRow));
      return;
    }
    if (routeDonorDetailQuery.data?.donor.id === donorParam) {
      setSelectedRecord(toCrmRecordFromDetail(routeDonorDetailQuery.data));
    }
  }, [
    donorParam,
    routeDonorDetailQuery.data,
    routeDonorRow,
    selectedRecord?.id,
  ]);

  const selectRecord = useCallback(
    (record: CrmRecord | null) => {
      setSelectedRecord(record);
      setOpenGiftId(null);
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
    [pathname, router, searchParams],
  );

  const giftOpenerRef = React.useRef<HTMLElement | null>(null);

  const openGift = useCallback(
    (donationId: string) => {
      // Smart close (ADR-CD-023): remember the gift row so closing restores
      // focus to it while the donor drawer context stays untouched.
      giftOpenerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setOpenGiftId(donationId);
      const params = new URLSearchParams(searchParams.toString());
      if (selectedRecord) {
        params.set("donor", selectedRecord.id);
      }
      params.set("gift", donationId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, selectedRecord],
  );

  const closeGift = useCallback(() => {
    setOpenGiftId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gift");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    // Restore focus after the sheet unmounts so its focus-trap cleanup
    // cannot clobber the opener focus (ADR-CD-023 focus return).
    const opener = giftOpenerRef.current;
    giftOpenerRef.current = null;
    window.setTimeout(() => opener?.focus(), 0);
  }, [pathname, router, searchParams]);

  const tagOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      for (const t of r.tags ?? []) {
        s.add(t);
      }
    }
    return Array.from(s)
      .sort()
      .map((t) => ({ label: t, value: t }));
  }, [rows]);

  const filterFields = useMemo((): DataTableFilterField<CrmGridRow>[] => {
    return [
      {
        id: "recordType",
        label: "Record type",
        options: [
          { label: "Individual", value: "individual" },
          { label: "Organization", value: "Organization" },
          { label: "Church", value: "Church" },
        ],
      },
      {
        id: "lifecycleStatus",
        label: "Status",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
      {
        id: "portalAccessLabel",
        label: "Portal",
        options: [
          { label: "Portal linked", value: "linked" },
          { label: "No portal", value: "none" },
        ],
      },
      ...(tagOptions.length > 0
        ? [
            {
              id: "tags",
              label: "Tags",
              options: tagOptions,
            } as DataTableFilterField<CrmGridRow>,
          ]
        : []),
    ];
  }, [tagOptions]);

  const columns = useMemo(
    () =>
      getCrmColumns({
        onViewRecord: (r) => selectRecord(toCrmRecord(r)),
        tagOptions,
      }),
    [selectRecord, tagOptions],
  );

  const handleBulkArchive = (_selected: CrmGridRow[]) => {
    toast.info("Bulk archive is not available yet.");
  };

  const handleBulkExport = (selected: CrmGridRow[]) => {
    const params = new URLSearchParams({ slice: "donors" });
    if (selected.length > 0) {
      toast.info("Export includes the current donor report slice.");
    }
    window.location.assign(`/api/admin/crm/reports/export?${params}`);
  };

  return (
    <>
      <PageShell
        title={CRM_PAGE_META.title}
        description={CRM_PAGE_META.description}
        density={CRM_PAGE_META.density}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              <button
                type="button"
                aria-label="Show CRM table view"
                onClick={() => setView("table")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "table"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Show CRM kanban view"
                onClick={() => setView("kanban")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "kanban"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Columns className="size-4" />
              </button>
            </div>
            <Button className="h-10 gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              <Plus className="size-3.5" /> New Record
            </Button>
            <Link
              href="/crm/relationships"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 gap-2",
              )}
            >
              <Network className="h-4 w-4" />
              Relationships
            </Link>
            <Link
              href="/crm/notes"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 gap-2",
              )}
            >
              <StickyNote className="h-4 w-4" />
              Notes
            </Link>
            <Link
              href="/crm/projections"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 gap-2",
              )}
            >
              <GitCompareArrows className="h-4 w-4" />
              Projections
            </Link>
          </div>
        }
      >
        <div className="flex flex-col min-h-[400px]">
          <AnimatePresence mode="wait">
            {view === "table" ? (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <DataTableResponsive
                  columns={columns}
                  data={rows}
                  isLoading={isLoading}
                  filterFields={filterFields}
                  searchColumnId="displayName"
                  searchPlaceholder="Search name, email, or organization..."
                  getRowId={(row) => row.id}
                  onFiltersChange={onFiltersChange}
                  onSortingChange={onSortingChange}
                  onRefresh={() => void onRefresh()}
                  onRowClick={(row) => selectRecord(toCrmRecord(row.original))}
                  infiniteScroll={{
                    hasMore,
                    isFetchingMore,
                    onLoadMore: loadMore,
                    threshold: 10,
                    loadingContent: "Loading more records...",
                  }}
                  emptyState={
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-2xl bg-muted/50 p-4 mb-4">
                        <User className="size-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No CRM records</h3>
                      {tableError ? (
                        <p className="text-sm text-destructive mt-1 max-w-xl">
                          {tableError.message}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          No donors match the current filters for your
                          workspace.
                        </p>
                      )}
                      <div className="mt-6 flex gap-3">
                        {tableError && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void onRefresh()}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  }
                  config={{
                    enableRowSelection: true,
                    enableColumnVisibility: true,
                    enablePagination: false,
                    enableFilters: true,
                    enableSorting: true,
                    enableViewToggle: false,
                    mobileBreakpoint: 0,
                    manualFiltering: true,
                    manualSorting: true,
                    stickyHeader: true,
                    virtualization: {
                      enabled: true,
                      estimateSize: 72,
                      overscan: 10,
                      containerHeight: 720,
                    },
                  }}
                  initialState={{
                    sorting,
                    columnFilters,
                    columnVisibility: {
                      primaryContactLine: false,
                      fundsGivenToSummary: false,
                      nextTaskSummary: false,
                    },
                  }}
                  floatingBarActions={[
                    {
                      label: "Export",
                      icon: Receipt,
                      onClick: handleBulkExport,
                    },
                    {
                      label: "Archive",
                      icon: Trash2,
                      onClick: handleBulkArchive,
                      variant: "destructive",
                    },
                  ]}
                  mobileCardConfig={{
                    primaryField: "displayName",
                    secondaryField: "primaryOrganization",
                    badgeField: "lifecycleStatus",
                    renderCard: (row) => {
                      const c = row.original;
                      const name = c.displayName || "Unnamed";
                      return (
                        <button
                          type="button"
                          onClick={() => selectRecord(toCrmRecord(c))}
                          className="w-full p-4 cursor-pointer space-y-3 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <SharedNamedViewTransition
                                name={crmRecordAvatarTransitionName(c.id)}
                              >
                                <Avatar className="size-10 border border-border">
                                  <AvatarImage src={c.avatarUrl ?? undefined} />
                                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                                    {name[0] ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </SharedNamedViewTransition>
                              <div>
                                <SharedNamedViewTransition
                                  name={crmRecordTitleTransitionName(c.id)}
                                >
                                  <div className="font-semibold text-sm text-foreground">
                                    {name}
                                  </div>
                                </SharedNamedViewTransition>
                                <div className="text-xs text-muted-foreground">
                                  {c.primaryOrganization ?? EMPTY_CELL_VALUE}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase"
                            >
                              {c.lifecycleStatus ?? EMPTY_CELL_VALUE}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground line-clamp-1">
                              {c.recordType ?? EMPTY_CELL_VALUE}
                            </span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(c.lifetimeGiving)}
                            </span>
                          </div>
                        </button>
                      );
                    },
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <KanbanView
                  rows={rows}
                  onSelectRow={(r) => selectRecord(toCrmRecord(r))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageShell>

      {selectedRecord && (
        <DetailDrawer
          contact={selectedRecord}
          onClose={() => selectRecord(null)}
          onOpenGift={openGift}
        />
      )}

      <ContributionDetailOverlay
        donationId={openGiftId}
        sourceSurface="donor_crm_record"
        onClose={closeGift}
      />
    </>
  );
}
