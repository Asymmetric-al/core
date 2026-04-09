"use client";

import { useAdminContributionsInfiniteGrid } from "@asym/database/hooks";
import { formatCurrency } from "@asym/lib/utils";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { cn } from "@asym/ui/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Users,
  Receipt,
  Download,
  Plus,
  Trash2,
  CircleCheck,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { getContributionColumns } from "./columns";
import { ContributionDetailSheet } from "./contribution-detail-sheet";
import {
  contributionStatusOptions,
  contributionTypeOptions,
  paymentMethodOptions,
  sourceOptions,
} from "./data";

import type { Contribution } from "./types";
import type { DataTableFilterField } from "@asym/ui/components/shadcn/data-table/types";

const statusIcons = {
  completed: CircleCheck,
  pending: Clock,
  failed: XCircle,
  refunded: RotateCcw,
} as const;

export default function ContributionsClient() {
  return <ContributionsClientBody />;
}

function ContributionsClientBody() {
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);
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
    summary,
    tableError,
  } = useAdminContributionsInfiniteGrid();

  const stats = useMemo(() => {
    const totalAmount =
      summary?.totalReceived ??
      rows.reduce(
        (sum, c) => (c.status === "completed" ? sum + c.amountGross : sum),
        0,
      );
    const totalCount =
      summary?.successfulCount ??
      rows.filter((c) => c.status === "completed").length;
    const pendingCount =
      summary?.pendingCount ??
      rows.filter((c) => c.status === "pending").length;
    const pendingAmount =
      summary?.pendingAmount ??
      rows.reduce(
        (sum, c) => (c.status === "pending" ? sum + c.amountGross : sum),
        0,
      );
    const avgAmount =
      summary?.averageGift ?? (totalCount > 0 ? totalAmount / totalCount : 0);
    const recurringCount =
      summary?.recurringCount ??
      rows.filter((c) => c.type === "Recurring").length;

    return {
      totalAmount,
      totalCount,
      pendingCount,
      pendingAmount,
      avgAmount,
      recurringCount,
    };
  }, [rows, summary]);

  const filterFields: DataTableFilterField<Contribution>[] = [
    { id: "status", label: "Status", options: contributionStatusOptions },
    { id: "type", label: "Type", options: contributionTypeOptions },
    { id: "paymentMethod", label: "Payment", options: paymentMethodOptions },
    { id: "source", label: "Source", options: sourceOptions },
  ];
  const columns = useMemo(
    () =>
      getContributionColumns({
        onViewContribution: setSelectedContribution,
      }),
    [],
  );

  const handleBulkDelete = (_rows: Contribution[]) => {
    toast.info("Bulk delete is not available yet.");
  };

  const handleBulkReceipt = (_rows: Contribution[]) => {
    toast.info("Send receipts is not available yet.");
  };

  const handleExport = () => {
    toast.info("Export is not available yet.");
  };

  return (
    <>
      <PageShell
        title="Contributions"
        description="Track and manage all donations and contributions."
        actions={
          <>
            <Button
              variant="outline"
              className="h-11 gap-2 rounded-xl border-zinc-200 font-bold uppercase tracking-widest text-[10px]"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              Export
            </Button>
            <Button className="h-11 gap-2 rounded-xl bg-zinc-900 font-black uppercase tracking-widest text-[10px] text-white hover:bg-zinc-800">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Contribution</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </>
        }
      >
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Received
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {formatCurrency(stats.totalAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalCount} successful contributions
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {formatCurrency(stats.pendingAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingCount} awaiting processing
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Average Gift
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {formatCurrency(stats.avgAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per successful contribution
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Recurring Donors
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.recurringCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active recurring gifts
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(statusIcons).map(([status, Icon]) => {
              const count = rows.filter(
                (contribution) => contribution.status === status,
              ).length;
              if (count === 0) return null;
              return (
                <Badge
                  key={status}
                  variant="outline"
                  className={cn(
                    "gap-1.5 py-1.5 px-3 font-medium cursor-pointer hover:bg-muted/50 transition-colors",
                    status === "completed" &&
                      "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400",
                    status === "pending" &&
                      "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400",
                    status === "failed" &&
                      "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
                    status === "refunded" &&
                      "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                </Badge>
              );
            })}
          </div>

          <div data-testid="mc-contributions-live">
            <DataTableResponsive
              columns={columns}
              data={rows}
              filterFields={filterFields}
              searchColumnId="donorName"
              searchPlaceholder="Search donor, entity, or email..."
              isLoading={isLoading}
              onFiltersChange={onFiltersChange}
              onSortingChange={onSortingChange}
              onRefresh={() => void onRefresh()}
              onRowClick={(row) => setSelectedContribution(row.original)}
              infiniteScroll={{
                hasMore,
                isFetchingMore,
                onLoadMore: loadMore,
                threshold: 10,
                loadingContent: "Loading more contributions...",
              }}
              emptyState={
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-2xl bg-muted/50 p-4 mb-4">
                    <DollarSign className="size-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    No contributions found
                  </h3>
                  {tableError ? (
                    <p className="text-sm text-destructive mt-1 max-w-xl">
                      {tableError.message}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Get started by recording your first contribution or
                      importing from another source.
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
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contribution
                    </Button>
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
                  amountNet: false,
                  donorType: false,
                  entryMethod: false,
                  transactionId: false,
                },
              }}
              floatingBarActions={[
                {
                  label: "Send Receipts",
                  icon: Receipt,
                  onClick: handleBulkReceipt,
                },
                {
                  label: "Delete",
                  icon: Trash2,
                  onClick: handleBulkDelete,
                  variant: "destructive",
                },
              ]}
            />
          </div>
        </div>
      </PageShell>
      <ContributionDetailSheet
        contribution={selectedContribution}
        onClose={() => setSelectedContribution(null)}
      />
    </>
  );
}
