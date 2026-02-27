"use client";

import { formatCurrency, getInitials } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  DataTableResponsive,
  type DataTableFilterField,
} from "@asym/ui/components/shadcn/data-table";
import { cn } from "@asym/ui/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Download,
  Plus,
  Trash2,
  Receipt,
} from "lucide-react";
import { useState, useMemo } from "react";

import { getColumns } from "./columns";
import { ContributionDetailSheet } from "./contribution-detail-sheet";
import {
  mockContributions,
  contributionStatusOptions,
  contributionTypeOptions,
  paymentMethodOptions,
  sourceOptions,
} from "./data";

import type { Contribution } from "./types";

/* ------------------------------------------------------------------ */
/*  Status dot color — used in mobile card                             */
/* ------------------------------------------------------------------ */

const statusDotColor: Record<string, string> = {
  Succeeded: "bg-emerald-500",
  Pending: "bg-amber-500",
  Failed: "bg-destructive",
  Refunded: "bg-muted-foreground",
  Disputed: "bg-orange-500",
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ContributionsPage() {
  const [data] = useState<Contribution[]>(mockContributions);
  const [isLoading] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  /* ---- Computed stats ---- */
  const stats = useMemo(() => {
    const totalAmount = data.reduce(
      (sum, c) => (c.status === "Succeeded" ? sum + c.amount : sum),
      0,
    );
    const totalCount = data.filter((c) => c.status === "Succeeded").length;
    const pendingCount = data.filter((c) => c.status === "Pending").length;
    const pendingAmount = data.reduce(
      (sum, c) => (c.status === "Pending" ? sum + c.amount : sum),
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

  /* ---- Column factory ---- */
  const columns = useMemo(
    () => getColumns({ onViewContribution: setSelectedContribution }),
    [],
  );

  /* ---- Filter fields ---- */
  const filterFields: DataTableFilterField<Contribution>[] = [
    {
      id: "status",
      label: "Status",
      options: contributionStatusOptions,
    },
    {
      id: "type",
      label: "Type",
      options: contributionTypeOptions,
    },
    {
      id: "paymentMethod",
      label: "Payment",
      options: paymentMethodOptions,
    },
    {
      id: "source",
      label: "Source",
      options: sourceOptions,
    },
  ];

  /* ---- Handlers ---- */
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
    <div className="container-responsive section-gap animate-in fade-in duration-500 py-6">
      {/* ================================================================ */}
      {/*  Header row — title + subtitle left, actions right               */}
      {/* ================================================================ */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Contributions
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all donations and contributions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Contribution</span>
          </Button>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  KPI metric tiles                                                */}
      {/* ================================================================ */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Received */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Received
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono tabular-nums">
              {formatCurrency(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalCount} successful contributions
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono tabular-nums">
              {formatCurrency(stats.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingCount} awaiting processing
            </p>
          </CardContent>
        </Card>

        {/* Average Gift */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Average Gift
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono tabular-nums">
              {formatCurrency(stats.avgAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per successful contribution
            </p>
          </CardContent>
        </Card>

        {/* Recurring Donors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Recurring Donors
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {stats.recurringCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active recurring gifts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ================================================================ */}
      {/*  Data table                                                      */}
      {/* ================================================================ */}
      <DataTableResponsive
        columns={columns}
        data={data}
        filterFields={filterFields}
        searchKey="donor"
        searchPlaceholder="Search by donor name or email..."
        isLoading={isLoading}
        config={{
          enableRowSelection: true,
          enableColumnVisibility: true,
          enablePagination: true,
          enableFilters: true,
          enableSorting: true,
          enableViewToggle: true,
          enableKeyboardNavigation: true,
        }}
        initialState={{
          columnVisibility: {
            transactionId: false,
            source: false,
          },
        }}
        onRowClick={(row) => setSelectedContribution(row.original)}
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
        mobileCardConfig={{
          primaryField: "donor",
          secondaryField: "fundName",
          badgeField: "status",
          renderCard: (row) => {
            const contribution = row.original;
            const donor = contribution.donor;
            return (
              <button
                type="button"
                onClick={() => setSelectedContribution(contribution)}
                className="w-full p-4 cursor-pointer space-y-3 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={donor.avatar} alt={donor.name} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                        {contribution.isAnonymous
                          ? "?"
                          : getInitials(donor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {contribution.isAnonymous ? "Anonymous" : donor.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contribution.fundName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        statusDotColor[contribution.status] ??
                          "bg-muted-foreground",
                      )}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {contribution.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {new Date(contribution.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {formatCurrency(contribution.amount)}
                  </span>
                </div>
              </button>
            );
          },
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-2xl bg-muted/50 p-4 mb-4">
              <DollarSign className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No contributions found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Get started by recording your first contribution or importing from
              another source.
            </p>
            <Button className="mt-6" size="sm">
              <Plus className="mr-2 size-4" />
              Add Contribution
            </Button>
          </div>
        }
      />

      {/* ================================================================ */}
      {/*  Detail sheet                                                    */}
      {/* ================================================================ */}
      <ContributionDetailSheet
        contribution={selectedContribution}
        onClose={() => setSelectedContribution(null)}
      />
    </div>
  );
}
