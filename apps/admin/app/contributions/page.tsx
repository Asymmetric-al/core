"use client";

import { motion } from "@asym/lib/motion";
import { formatCurrency } from "@asym/lib/utils";
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
import { DollarSign, Download, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { getColumns } from "./columns";
import { ContributionDetailSheet } from "./contribution-detail-sheet";
import {
  mockContributions,
  contributionStatusOptions,
  contributionTypeOptions,
  paymentMethodOptions,
  sourceOptions,
} from "./data";
import {
  contributionStatusDotColor,
  formatContributionDate,
  getContributionDonorInitials,
  getContributionDonorName,
} from "./display";

import type { Contribution } from "./types";

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
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

export default function ContributionsPage() {
  const [data] = useState<Contribution[]>(mockContributions);
  const [isLoading] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  const stats = useMemo(() => {
    const totalAmount = data.reduce(
      (sum, contribution) =>
        contribution.status === "Succeeded" ? sum + contribution.amount : sum,
      0,
    );
    const totalCount = data.filter(
      (contribution) => contribution.status === "Succeeded",
    ).length;
    const pendingAmount = data.reduce(
      (sum, contribution) =>
        contribution.status === "Pending" ? sum + contribution.amount : sum,
      0,
    );
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    const recurringCount = data.filter(
      (contribution) => contribution.type === "Recurring",
    ).length;

    return {
      totalAmount,
      pendingAmount,
      avgAmount,
      recurringCount,
    };
  }, [data]);

  const columns = useMemo(
    () => getColumns({ onViewContribution: setSelectedContribution }),
    [],
  );

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

  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-xl border-zinc-200 hover:bg-zinc-50 transition-all font-bold uppercase tracking-widest text-[10px] gap-2"
            disabled
            title="Export is not available yet"
          >
            <Download className="size-4" />
            Export
          </Button>
          <Button
            className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-zinc-200 gap-2"
            disabled
            title="Contribution creation is not available yet"
          >
            <Plus className="size-4" />
            Add Contribution
          </Button>
        </div>
      }
    >
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
            searchKey="donor"
            searchPlaceholder="Search by donor name or email..."
            isLoading={isLoading}
            config={{
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
            mobileCardConfig={{
              primaryField: "donor",
              secondaryField: "fundName",
              badgeField: "status",
              renderCard: (row) => {
                const contribution = row.original;

                return (
                  <button
                    type="button"
                    onClick={() => setSelectedContribution(contribution)}
                    className="w-full p-4 cursor-pointer space-y-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage
                            src={contribution.donor.avatar}
                            alt={contribution.donor.name}
                          />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                            {getContributionDonorInitials(contribution)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            {getContributionDonorName(contribution)}
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
                            contributionStatusDotColor[contribution.status] ??
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
                        {formatContributionDate(contribution.date)}
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
                  className="mt-8 h-12 px-8 rounded-xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px]"
                  disabled
                  title="Contribution creation is not available yet"
                >
                  <Plus className="mr-2 size-4" />
                  Add Contribution
                </Button>
              </div>
            }
          />
        </motion.div>
      </div>

      <ContributionDetailSheet
        contribution={selectedContribution}
        onClose={() => setSelectedContribution(null)}
      />
    </PageShell>
  );
}
