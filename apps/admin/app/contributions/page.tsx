"use client";

import { formatCurrency, getInitials } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DataTableResponsive,
  type DataTableFilterField,
} from "@asym/ui/components/shadcn/data-table";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { cn } from "@asym/ui/lib/utils";
import { DollarSign, Download, Plus, Trash2, Receipt } from "lucide-react";
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
/*  Stat card — bold font-black style matching reference               */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const isCurrency = typeof value === "string" && value.startsWith("$");
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all min-w-[140px] shadow-sm",
        color,
      )}
    >
      <div className="flex flex-col">
        <span
          className={cn(
            "text-3xl font-black tabular-nums tracking-tight",
            isCurrency && "font-mono",
          )}
        >
          {value}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}

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
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      badge="Financial Overview"
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-all font-bold uppercase tracking-widest text-[10px] gap-2"
            onClick={handleExport}
          >
            <Download className="size-4" />
            Export
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200 gap-2">
            <Plus className="size-4" />
            Add Contribution
          </Button>
        </div>
      }
    >
      <div className="space-y-10">
        {/* ============================================================ */}
        {/*  Stat cards                                                   */}
        {/* ============================================================ */}
        <div className="flex flex-wrap gap-4">
          <StatCard
            label="Received"
            value={formatCurrency(stats.totalAmount)}
            color="bg-emerald-50 text-emerald-700 border-emerald-100"
          />
          <StatCard
            label="Pending"
            value={formatCurrency(stats.pendingAmount)}
            color="bg-amber-50 text-amber-700 border-amber-100"
          />
          <StatCard
            label="Avg Gift"
            value={formatCurrency(stats.avgAmount)}
            color="bg-sky-50 text-sky-700 border-sky-100"
          />
          <StatCard
            label="Recurring"
            value={stats.recurringCount}
            color="bg-violet-50 text-violet-700 border-violet-100"
          />
        </div>

        {/* ============================================================ */}
        {/*  Data table                                                   */}
        {/* ============================================================ */}
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
                        <div className="text-sm font-bold text-foreground">
                          {contribution.isAnonymous ? "Anonymous" : donor.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
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
                    <span className="font-mono font-black tabular-nums tracking-tight">
                      {formatCurrency(contribution.amount)}
                    </span>
                  </div>
                </button>
              );
            },
          }}
          emptyState={
            <div className="text-center py-32 bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-[2.5rem]">
              <div className="size-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-100">
                <DollarSign className="size-10 text-zinc-200" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                No contributions found
              </h3>
              <p className="text-sm text-zinc-500 mt-2 font-medium">
                Get started by recording your first contribution or importing
                from another source.
              </p>
              <Button className="mt-8 h-12 px-8 rounded-xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px]">
                <Plus className="mr-2 size-4" />
                Add Contribution
              </Button>
            </div>
          }
        />
      </div>

      {/* ============================================================== */}
      {/*  Detail sheet                                                    */}
      {/* ============================================================== */}
      <ContributionDetailSheet
        contribution={selectedContribution}
        onClose={() => setSelectedContribution(null)}
      />
    </PageShell>
  );
}
