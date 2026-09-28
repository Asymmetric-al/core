"use client";

import { motion } from "@asym/lib/motion";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import { Heart, AlertCircle, Users, Repeat } from "lucide-react";
import * as React from "react";

import { formatCurrency } from "./donors-model";
import { smoothTransition } from "./donors-page-motion";
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
      className={cn(
        "hover-lift border-border bg-card shadow-sm transition-[color,background-color,border-color,box-shadow,transform,opacity] rounded-xl",
        onClick && "cursor-pointer",
        isActive && "border-primary ring-2 ring-ring/20",
      )}
    >
      <CardHeader>
        <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
        <CardAction>
          <div
            className={cn(
              "size-9 rounded-lg border flex items-center justify-center",
              iconBg,
            )}
          >
            <Icon className={cn("size-4", iconColor)} />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5">
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {value}
        </motion.p>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {subtext}
        </span>
      </CardContent>
    </MotionCard>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={Boolean(isActive)}
        className="text-left w-full press-feedback rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
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
        iconBg="bg-muted border-border"
        iconColor="text-foreground"
        delay={0}
      />
      <StatCard
        label="Total Given"
        value={formatCurrency(totalGiven)}
        subtext={hasMoreDonors ? "Lifetime (loaded window)" : "Lifetime"}
        icon={Heart}
        iconBg="bg-primary/10 border-primary/20"
        iconColor="text-primary"
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
        iconBg="bg-accent border-border"
        iconColor="text-primary"
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
        iconBg="bg-muted border-border"
        iconColor="text-muted-foreground"
        onClick={() => applyStatFilter("needsAttention")}
        isActive={statusFilter === "Needs Attention"}
        delay={0.15}
      />
    </div>
  );
}
