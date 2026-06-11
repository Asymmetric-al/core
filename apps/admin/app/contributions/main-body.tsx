"use client";

import { motion } from "@asym/lib/motion";
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
import { cn } from "@asym/ui/lib/utils";
import { DollarSign, Download, Plus, Trash2, Receipt } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { getContributionColumns } from "./columns";
import {
  contributionStatusOptions,
  contributionTypeOptions,
  paymentMethodOptions,
  sourceOptions,
} from "./data";

import type { Contribution, ContributionStatus } from "./types";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

const statusDotColor: Record<ContributionStatus, string> = {
  completed: "bg-emerald-500",
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  failed: "bg-destructive",
  refunded: "bg-muted-foreground",
};

const statusShortLabel: Record<ContributionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
  refunded: "Refunded",
};

function StatCard({
  label,
  value,
  index = 0,
}: {
  label: string;
  value: string | number;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothTransition, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-zinc-100 bg-white shadow-sm cursor-default min-w-[140px]"
    >
      <div className="flex flex-col">
        <span className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
          {value}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mt-1">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

export function ContributionsMainBody({
  data,
  isLoading,
  onSelectContribution,
}: {
  data: Contribution[];
  isLoading: boolean;
  onSelectContribution: (c: Contribution) => void;
}) {
  const handleViewContribution = useCallback(
    (c: Contribution) => {
      onSelectContribution(c);
    },
    [onSelectContribution],
  );

  const columns = useMemo(
    () =>
      getContributionColumns({
        onViewContribution: handleViewContribution,
      }),
    [handleViewContribution],
  );

  const stats = useMemo(() => {
    const totalAmount = data.reduce(
      (sum, c) => (c.status === "completed" ? sum + c.amount : sum),
      0,
    );
    const totalCount = data.filter((c) => c.status === "completed").length;
    const pendingAmount = data.reduce(
      (sum, c) =>
        c.status === "pending" || c.status === "processing"
          ? sum + c.amount
          : sum,
      0,
    );
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    const recurringCount = data.filter((c) => c.type === "Recurring").length;

    return {
      totalAmount,
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

  const handleBulkDelete = (_rows: Contribution[]) => {
    toast.info("Bulk delete coming soon.");
  };

  const handleBulkReceipt = (_rows: Contribution[]) => {
    toast.info("Send receipts coming soon.");
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Received"
          value={formatCurrency(stats.totalAmount)}
          index={0}
        />
        <StatCard
          label="Pending"
          value={formatCurrency(stats.pendingAmount)}
          index={1}
        />
        <StatCard
          label="Avg Gift"
          value={formatCurrency(stats.avgAmount)}
          index={2}
        />
        <StatCard label="Recurring" value={stats.recurringCount} index={3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothTransition, delay: 0.3 }}
      >
        <DataTableResponsive
          columns={columns}
          data={data}
          filterFields={filterFields}
          searchKey="donorName"
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
          onRowClick={(row) => onSelectContribution(row.original)}
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
            primaryField: "donorName",
            secondaryField: "fundName",
            badgeField: "status",
            renderCard: (row) => {
              const contribution = row.original;
              const donorLabel =
                contribution.isAnonymous === true
                  ? "Anonymous"
                  : (contribution.donorName ?? contribution.donorEmail);
              const avatarSrc = contribution.donorAvatar ?? undefined;

              return (
                <button
                  type="button"
                  onClick={() => onSelectContribution(contribution)}
                  className="w-full p-4 cursor-pointer space-y-3 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-border">
                        {!contribution.isAnonymous && avatarSrc ? (
                          <AvatarImage src={avatarSrc} alt={donorLabel} />
                        ) : null}
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                          {contribution.isAnonymous
                            ? "?"
                            : getInitials(donorLabel)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {donorLabel}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          {contribution.fundName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          statusDotColor[contribution.status] ??
                            "bg-muted-foreground",
                        )}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                        {statusShortLabel[contribution.status]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs text-muted-foreground">
                      {makeDisplayDate(contribution.date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                    <span className="font-mono font-semibold tabular-nums tracking-tight">
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
              <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight">
                No contributions found
              </h3>
              <p className="text-sm text-zinc-500 mt-2 font-medium">
                Get started by recording your first contribution or importing
                from another source.
              </p>
              <Button className="mt-8 h-12 px-8 rounded-xl bg-zinc-900 text-white font-semibold uppercase tracking-widest text-[10px]">
                <Plus className="mr-2 size-4" />
                Add Contribution
              </Button>
            </div>
          }
        />
      </motion.div>
    </div>
  );
}

export function ContributionsPageActions() {
  const handleExport = () => {
    toast.info("Export coming soon.");
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-all font-semibold uppercase tracking-widest text-[10px] gap-2"
        onClick={handleExport}
      >
        <Download className="size-4" />
        Export
      </Button>
      <Button className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200 gap-2">
        <Plus className="size-4" />
        Add Contribution
      </Button>
    </div>
  );
}
