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
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { cn } from "@asym/ui/lib/utils";
import { DollarSign, Download, Plus, Trash2, Receipt } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
/*  Shared transitions                                                  */
/* ------------------------------------------------------------------ */

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

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

const unavailableActionReason = "Coming soon";
const detailSheetCloseDurationMs = 300;

/* ------------------------------------------------------------------ */
/*  Stat card — with motion hover                                      */
/* ------------------------------------------------------------------ */

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
        <span className="text-3xl font-black tabular-nums tracking-tight text-zinc-900">
          {value}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">
          {label}
        </span>
      </div>
    </motion.div>
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
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [detailSheetTriggerId, setDetailSheetTriggerId] = useState<
    string | null
  >(null);
  const [closeTimeoutId, setCloseTimeoutId] = useState<number | null>(null);

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

  const openContributionDetails = useCallback(
    (contribution: Contribution, triggerId?: string) => {
      if (closeTimeoutId) {
        window.clearTimeout(closeTimeoutId);
        setCloseTimeoutId(null);
      }

      setDetailSheetTriggerId(triggerId ?? null);
      setSelectedContribution(contribution);
      setIsDetailSheetOpen(true);
    },
    [closeTimeoutId],
  );

  const handleDetailSheetOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsDetailSheetOpen(true);
        return;
      }

      setIsDetailSheetOpen(false);
      const focusTargetId = detailSheetTriggerId;

      if (closeTimeoutId) {
        window.clearTimeout(closeTimeoutId);
      }

      const timeoutId = window.setTimeout(() => {
        setSelectedContribution(null);
        setCloseTimeoutId(null);
        window.requestAnimationFrame(() => {
          if (!focusTargetId) return;

          document
            .querySelector<HTMLElement>(
              `[data-contribution-trigger="${focusTargetId}"]`,
            )
            ?.focus({ preventScroll: true });
        });
      }, detailSheetCloseDurationMs);
      setCloseTimeoutId(timeoutId);
    },
    [closeTimeoutId, detailSheetTriggerId],
  );

  useEffect(() => {
    return () => {
      if (closeTimeoutId) {
        window.clearTimeout(closeTimeoutId);
      }
    };
  }, [closeTimeoutId]);

  /* ---- Column factory ---- */
  const columns = useMemo(
    () => getColumns({ onViewContribution: openContributionDetails }),
    [openContributionDetails],
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

  const handleUnavailableBulkAction = (_rows: Contribution[]) => undefined;

  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled
            aria-label={`Export contributions (${unavailableActionReason})`}
            className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-all font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            <Download className="size-4" />
            Export
          </Button>
          <Button
            disabled
            aria-label={`Add contribution (${unavailableActionReason})`}
            className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200 gap-2"
          >
            <Plus className="size-4" />
            Add Contribution
          </Button>
        </div>
      }
    >
      <div className="space-y-10">
        {/* ============================================================ */}
        {/*  Stat cards — staggered entrance + hover lift                 */}
        {/* ============================================================ */}
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

        {/* ============================================================ */}
        {/*  Data table — fade in                                        */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothTransition, delay: 0.3 }}
        >
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
            onRowClick={(row) => openContributionDetails(row.original)}
            floatingBarActions={[
              {
                label: "Send Receipts",
                icon: Receipt,
                onClick: handleUnavailableBulkAction,
                disabled: true,
                disabledReason: unavailableActionReason,
              },
              {
                label: "Delete",
                icon: Trash2,
                onClick: handleUnavailableBulkAction,
                variant: "destructive",
                disabled: true,
                disabledReason: unavailableActionReason,
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
                    data-contribution-trigger={contribution.id}
                    onClick={() =>
                      openContributionDetails(contribution, contribution.id)
                    }
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
                            {contribution.isAnonymous
                              ? "Anonymous"
                              : donor.name}
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
                      <span className="text-xs text-muted-foreground">
                        {new Date(contribution.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
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
                <Button
                  disabled
                  aria-label={`Add contribution (${unavailableActionReason})`}
                  className="mt-8 h-12 px-8 rounded-xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px]"
                >
                  <Plus className="mr-2 size-4" />
                  Add Contribution
                </Button>
              </div>
            }
          />
        </motion.div>
      </div>

      {/* ============================================================== */}
      {/*  Detail sheet                                                    */}
      {/* ============================================================== */}
      <ContributionDetailSheet
        contribution={selectedContribution}
        open={isDetailSheetOpen}
        onOpenChange={handleDetailSheetOpenChange}
      />
    </PageShell>
  );
}
