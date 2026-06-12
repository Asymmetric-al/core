"use client";

import { motion } from "@asym/lib/motion";
import { formatCurrency, getInitials } from "@asym/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
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
import { useQueryClient } from "@tanstack/react-query";
import { DollarSign, Download, Plus, Trash2, Receipt } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { getContributionColumns } from "./columns";
import { invalidateContributionOperationQueries } from "./contribution-detail-overlay";
import {
  contributionStatusOptions,
  contributionTypeOptions,
  paymentMethodOptions,
  sourceOptions,
} from "./data";
import { ContributionNeedsAttentionPanel } from "./needs-attention-panel";

import type { Contribution, ContributionStatus } from "./types";
import type { MissionControlNeedsAttentionGroup } from "@asym/database/hooks";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

function formatSelectedContributionCount(count: number): string {
  return `${count} selected contribution${count === 1 ? "" : "s"}`;
}

function formatMissingStagedGiftCount(count: number): string {
  return `${count} missing`;
}

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

const statusDotColor: Record<ContributionStatus, string> = {
  completed: "bg-emerald-500",
  pending: "bg-amber-500",
  failed: "bg-destructive",
  refunded: "bg-muted-foreground",
};

const statusShortLabel: Record<ContributionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
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
      className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-border bg-card shadow-sm cursor-default min-w-[140px]"
    >
      <div className="flex flex-col">
        <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mt-1">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

function BulkReceiptConfirmDialog({
  onConfirm,
  onOpenChange,
  open,
  rows,
  submitting,
}: {
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  rows: Contribution[];
  submitting: boolean;
}) {
  const selectedCount = rows.length;
  const eligibleCount = rows.filter((row) => row.stagedGiftId).length;
  const missingStagedGiftCount = selectedCount - eligibleCount;
  const hasEligibleReceipts = eligibleCount > 0;
  const actionLabel = submitting
    ? "Starting batch..."
    : hasEligibleReceipts
      ? "Send receipts"
      : "No eligible receipts";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send receipts?</AlertDialogTitle>
          <AlertDialogDescription>
            This will start a receipt resend batch for{" "}
            {formatSelectedContributionCount(selectedCount)}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-muted-foreground">
                Selected contributions
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {selectedCount}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Ready to send
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {eligibleCount}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Missing staged gift id
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {formatMissingStagedGiftCount(missingStagedGiftCount)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Contributions missing a staged gift id will be skipped by the batch
            processor. You will see the succeeded and failed counts after the
            batch starts.
          </p>
          {!hasEligibleReceipts ? (
            <p className="mt-3 text-sm font-medium text-destructive">
              No selected contributions have a staged gift id.
            </p>
          ) : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting || !hasEligibleReceipts}
            onClick={(event) => {
              event.preventDefault();
              if (!submitting && hasEligibleReceipts) {
                onConfirm();
              }
            }}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ContributionsMainBody({
  data,
  isLoading,
  onSelectContribution,
  needsAttentionGroups = [],
  onOpenContributionById,
}: {
  data: Contribution[];
  isLoading: boolean;
  onSelectContribution: (c: Contribution) => void;
  needsAttentionGroups?: MissionControlNeedsAttentionGroup[];
  onOpenContributionById?: (contributionId: string) => void;
}) {
  const queryClient = useQueryClient();
  const [pendingBulkReceiptRows, setPendingBulkReceiptRows] = useState<
    Contribution[]
  >([]);
  const [isBulkReceiptSubmitting, setIsBulkReceiptSubmitting] = useState(false);
  const isBulkReceiptSubmittingRef = useRef(false);

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
      (sum, c) => (c.status === "pending" ? sum + c.amount : sum),
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

  const handleBulkReceipt = useCallback((rows: Contribution[]) => {
    if (rows.length === 0) {
      return;
    }
    setPendingBulkReceiptRows(rows);
  }, []);

  const handleBulkReceiptDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !isBulkReceiptSubmitting) {
        setPendingBulkReceiptRows([]);
      }
    },
    [isBulkReceiptSubmitting],
  );

  const submitBulkReceipt = useCallback(async () => {
    const rows = pendingBulkReceiptRows;
    if (
      rows.length === 0 ||
      isBulkReceiptSubmittingRef.current ||
      rows.every((row) => !row.stagedGiftId)
    ) {
      return;
    }

    isBulkReceiptSubmittingRef.current = true;
    setIsBulkReceiptSubmitting(true);
    try {
      const response = await fetch("/api/admin/contribution-batches", {
        body: JSON.stringify({
          actionType: "resend_receipt",
          confirmationToken: crypto.randomUUID(),
          reason: "Bulk receipt resend requested from Contribution Hub.",
          records: rows.map((row) => ({
            id: row.id,
            receiptStatus: row.receiptStatus,
            stagedGiftId: row.stagedGiftId,
          })),
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Bulk receipt send failed.");
      }
      const body = (await response.json()) as {
        batch?: {
          status?: string;
          summary?: { succeeded?: number; failed?: number };
        };
      };
      const batchStatus = body.batch?.status ?? "completed";
      if (batchStatus === "running") {
        // Background batches return before any record is processed, so the
        // zeroed summary would read as "nothing succeeded".
        toast.success(
          `Bulk receipt batch started: ${formatSelectedContributionCount(rows.length)} processing in the background.`,
        );
      } else {
        toast.success(
          `Bulk receipt batch ${batchStatus}: ${body.batch?.summary?.succeeded ?? 0} succeeded, ${body.batch?.summary?.failed ?? 0} failed.`,
        );
      }
      setPendingBulkReceiptRows([]);
      await invalidateContributionOperationQueries(queryClient);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send receipts in bulk.",
      );
    } finally {
      isBulkReceiptSubmittingRef.current = false;
      setIsBulkReceiptSubmitting(false);
    }
  }, [pendingBulkReceiptRows, queryClient]);

  return (
    <div className="space-y-10">
      <BulkReceiptConfirmDialog
        onConfirm={submitBulkReceipt}
        onOpenChange={handleBulkReceiptDialogOpenChange}
        open={pendingBulkReceiptRows.length > 0}
        rows={pendingBulkReceiptRows}
        submitting={isBulkReceiptSubmitting}
      />

      <ContributionNeedsAttentionPanel
        groups={needsAttentionGroups}
        onOpenContribution={(contributionId) => {
          const contribution = data.find((row) => row.id === contributionId);
          if (contribution) {
            onSelectContribution(contribution);
            return;
          }
          onOpenContributionById?.(contributionId);
        }}
      />

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
            <div className="text-center py-32 bg-muted/30 border-2 border-dashed border-border rounded-[2.5rem]">
              <div className="size-20 bg-card rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
                <DollarSign className="size-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground tracking-tight">
                No contributions found
              </h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Get started by recording your first contribution or importing
                from another source.
              </p>
              <Button className="mt-8 h-12 px-8 rounded-xl font-semibold uppercase tracking-widest text-[10px]">
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
        className="h-11 px-4 rounded-xl transition-colors font-semibold uppercase tracking-widest text-[10px] gap-2"
        onClick={handleExport}
      >
        <Download className="size-4" />
        Export
      </Button>
      <Button className="h-11 px-6 rounded-xl font-semibold uppercase tracking-widest text-[10px] shadow-lg gap-2">
        <Plus className="size-4" />
        Add Contribution
      </Button>
    </div>
  );
}
