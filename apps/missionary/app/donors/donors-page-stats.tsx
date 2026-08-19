"use client";

import { motion } from "@asym/lib/motion";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import { Heart, AlertCircle, Users, Repeat } from "lucide-react";
import * as React from "react";

import { formatCurrency } from "./donors-model";
import { smoothTransition, springTransition } from "./donors-page-motion";
import { useDonorsPageViewFields } from "./use-donors-page-view";

const MotionCard = motion.create(Card);

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
  isActive,
  delay = 0,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
  isActive?: boolean;
  delay?: number;
}) {
  const content = (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothTransition, delay }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "border-zinc-200 bg-white shadow-sm transition-[color,background-color,border-color,box-shadow,transform,opacity] rounded-xl",
        onClick && "cursor-pointer",
        isActive && "border-blue-400 ring-2 ring-blue-100",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {label}
            </p>
            <motion.p
              key={value}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold tracking-tight text-zinc-900"
            >
              {value}
            </motion.p>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              {subtext}
            </span>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={springTransition}
            className={cn(
              "size-9 rounded-lg border flex items-center justify-center",
              iconBg,
            )}
          >
            <Icon className={cn("size-4", iconColor)} />
          </motion.div>
        </div>
      </CardContent>
    </MotionCard>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full">
        {content}
      </button>
    );
  }
  return content;
}

export function DonorsPageStats() {
  const view = useDonorsPageViewFields();
  const { all: donorRows, hasMore: hasMoreDonors } = view.donors;
  const { statusFilter, pledgeFilter } = view.filters;
  const { applyStatFilter } = view.actions;
  const {
    activeCount,
    activePledgeCount,
    atRiskCount,
    lapsedCount,
    monthlyPledgeTotal,
    totalGiven,
  } = view.summary;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={hasMoreDonors ? "Partners loaded" : "Total Partners"}
        value={hasMoreDonors ? `${donorRows.length}+` : donorRows.length}
        subtext={
          hasMoreDonors
            ? `${activeCount} active in loaded window`
            : `${activeCount} active`
        }
        icon={Users}
        iconBg="bg-zinc-50 border-zinc-100"
        iconColor="text-zinc-900"
        delay={0}
      />
      <StatCard
        label="Total Given"
        value={formatCurrency(totalGiven)}
        subtext={hasMoreDonors ? "Lifetime (loaded window)" : "Lifetime"}
        icon={Heart}
        iconBg="bg-emerald-50 border-emerald-100"
        iconColor="text-emerald-600"
        delay={0.05}
      />
      <StatCard
        label="Recurring Donations"
        value={activePledgeCount}
        subtext={
          hasMoreDonors
            ? `${formatCurrency(monthlyPledgeTotal)}/mo (loaded window)`
            : `${formatCurrency(monthlyPledgeTotal)}/mo`
        }
        icon={Repeat}
        iconBg="bg-blue-50 border-blue-100"
        iconColor="text-blue-600"
        onClick={() => applyStatFilter("activePledge")}
        isActive={pledgeFilter === "Active"}
        delay={0.1}
      />
      <StatCard
        label="Needs Attention"
        value={atRiskCount + lapsedCount}
        subtext={
          hasMoreDonors
            ? `${atRiskCount} at risk, ${lapsedCount} lapsed (loaded window)`
            : `${atRiskCount} at risk, ${lapsedCount} lapsed`
        }
        icon={AlertCircle}
        iconBg="bg-amber-50 border-amber-100"
        iconColor="text-amber-600"
        onClick={() => applyStatFilter("atRisk")}
        isActive={statusFilter === "At Risk"}
        delay={0.15}
      />
    </div>
  );
}
