"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  DataTable,
  useDataTableWithLiveQuery,
} from "@asym/ui/components/shadcn/data-table";
import type { DataTableFilterField } from "@asym/ui/components/shadcn/data-table/types";
import { formatCurrency } from "@asym/lib/utils";
import { cn } from "@asym/ui/lib/utils";
import { columns } from "./columns";
import {
  contributionStatusOptions,
  contributionTypeOptions,
  paymentMethodOptions,
  sourceOptions,
} from "./data";
import type { Contribution } from "./types";
import {
  buildContributionsLiveQuery,
  contributionsLiveQueryKey,
  type ContributionLiveRow,
} from "./live-query";

const statusIcons = {
  completed: CircleCheck,
  pending: Clock,
  failed: XCircle,
  refunded: RotateCcw,
};

export default function ContributionsClient() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });
  }, []);

  if (!isMounted) {
    return (
      <div className="container-responsive section-gap animate-in fade-in duration-500">
        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Contributions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage all donations and contributions
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-10 text-sm text-muted-foreground">
            Loading contributions…
          </div>
        </div>
      </div>
    );
  }

  return <ContributionsClientBody />;
}

function ContributionsClientBody() {
  const { data, isLoading, error, refetch, table } =
    useDataTableWithLiveQuery<ContributionLiveRow>({
      columns,
      queryBuilder: buildContributionsLiveQuery,
      queryKey: contributionsLiveQueryKey,
      getRowId: (row) => row.id,
    });

  const stats = useMemo(() => {
    const totalAmount = data.reduce(
      (sum, c) => (c.status === "completed" ? sum + c.amount : sum),
      0,
    );
    const totalCount = data.filter((c) => c.status === "completed").length;
    const pendingCount = data.filter((c) => c.status === "pending").length;
    const pendingAmount = data.reduce(
      (sum, c) => (c.status === "pending" ? sum + c.amount : sum),
      0,
    );
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    const recurringCount = data.filter((c) => c.type === "Recurring").length;

    return {
      totalAmount,
      totalCount,
      pendingCount,
      pendingAmount,
      avgAmount,
      recurringCount,
    };
  }, [data]);

  const filterFields: DataTableFilterField<Contribution>[] = [
    { id: "status", label: "Status", options: contributionStatusOptions },
    { id: "type", label: "Type", options: contributionTypeOptions },
    { id: "paymentMethod", label: "Payment", options: paymentMethodOptions },
    { id: "source", label: "Source", options: sourceOptions },
  ];

  const handleBulkDelete = (rows: Contribution[]) => {
    console.log(
      "Delete rows:",
      rows.map((r) => r.id),
    );
  };

  const handleBulkReceipt = (rows: Contribution[]) => {
    console.log(
      "Send receipts to:",
      rows.map((r) => r.id),
    );
  };

  const handleExport = () => {
    console.log("Exporting contributions...");
  };

  return (
    <div className="container-responsive section-gap animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 lg:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Contributions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage all donations and contributions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2 bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Contribution</span>
            </Button>
          </div>
        </div>

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
            const count = data.filter((c) => c.status === status).length;
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
          <DataTable
            columns={columns}
            data={data}
            table={table}
            filterFields={filterFields}
            searchKey="donorName"
            searchPlaceholder="Search by donor name or email..."
            isLoading={isLoading}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-2xl bg-muted/50 p-4 mb-4">
                  <DollarSign className="size-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                  No contributions found
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Get started by recording your first contribution or importing
                  from another source.
                </p>
                <div className="mt-6 flex gap-3">
                  {error && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void refetch()}
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
              enablePagination: true,
              enableFilters: true,
              enableSorting: true,
            }}
            actionBarActions={[
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
    </div>
  );
}
