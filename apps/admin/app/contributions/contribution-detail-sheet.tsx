"use client";

import { formatCurrency } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { Sheet, SheetContent } from "@asym/ui/components/shadcn/sheet";
import { cn } from "@asym/ui/lib/utils";
import { Copy, DollarSign, X } from "lucide-react";
import { toast } from "sonner";

import {
  contributionStatusDotColor,
  formatContributionDate,
  formatContributionTimestamp,
  getContributionDonorInitials,
  getContributionDonorName,
  getContributionReceiptDotColor,
  getContributionReceiptLabel,
} from "./display";

import type { Contribution } from "./types";

/* ------------------------------------------------------------------ */
/*  Detail field component                                              */
/* ------------------------------------------------------------------ */

function DetailField({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-bold text-foreground",
          mono && "font-mono tabular-nums",
        )}
      >
        {children}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sheet                                                               */
/* ------------------------------------------------------------------ */

interface ContributionDetailSheetProps {
  contribution: Contribution | null;
  onClose: () => void;
}

export function ContributionDetailSheet({
  contribution,
  onClose,
}: ContributionDetailSheetProps) {
  if (!contribution) return null;

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(contribution.transactionId);
    toast.success("Transaction ID copied to clipboard");
  };

  return (
    <Sheet open={!!contribution} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 gap-0 border-l border-border bg-background shadow-2xl overflow-hidden flex flex-col h-full text-left">
        {/* ---- Header ---- */}
        <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
            <DollarSign className="size-4 text-muted-foreground" />
            <span>Contribution Details</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* ---- Content ---- */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* ---- Donor + Status ---- */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-4 border-background shadow-sm">
                <AvatarImage
                  src={contribution.donor.avatar}
                  alt={contribution.donor.name}
                />
                <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xl">
                  {getContributionDonorInitials(contribution)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 pt-1">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {getContributionDonorName(contribution, "Anonymous Donor")}
                </h2>
                {!contribution.isAnonymous && contribution.donor.email && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {contribution.donor.email}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] font-bold uppercase tracking-wider border shadow-none"
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full mr-1.5",
                        contributionStatusDotColor[contribution.status],
                      )}
                    />
                    {contribution.status}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="h-5 text-[10px] font-bold uppercase tracking-wider border-none bg-muted text-muted-foreground"
                  >
                    {contribution.type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* ---- Amount display ---- */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Amount
              </p>
              <p className="text-3xl font-black font-mono tabular-nums text-foreground tracking-tight">
                {formatCurrency(contribution.amount)}
              </p>
            </div>

            <Separator />

            {/* ---- Details grid ---- */}
            <div className="grid grid-cols-2 gap-6">
              <DetailField label="Date">
                {formatContributionDate(contribution.date, {
                  weekday: "short",
                })}
              </DetailField>

              <DetailField label="Payment Method">
                {contribution.paymentMethod}
              </DetailField>

              <DetailField label="Source">{contribution.source}</DetailField>

              <DetailField label="Fund">
                <span>{contribution.fundName}</span>
                <span className="block font-mono text-xs text-muted-foreground">
                  {contribution.fundCode}
                </span>
              </DetailField>

              <DetailField label="Transaction ID" mono>
                {contribution.transactionId}
              </DetailField>

              <DetailField label="Receipt">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      getContributionReceiptDotColor(contribution.receiptSent),
                    )}
                  />
                  {getContributionReceiptLabel(contribution.receiptSent)}
                </span>
              </DetailField>

              {contribution.missionaryName && (
                <DetailField label="Missionary">
                  {contribution.missionaryName}
                </DetailField>
              )}
            </div>

            {/* ---- Notes ---- */}
            {contribution.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Notes
                  </p>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {contribution.notes}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* ---- Actions ---- */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Actions
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl font-bold uppercase tracking-widest text-[10px] h-9"
                  onClick={handleCopyTxn}
                >
                  <Copy className="size-3.5" />
                  Copy Transaction ID
                </Button>
              </div>
            </div>

            {/* ---- Metadata ---- */}
            <div className="pt-2 space-y-1">
              <p className="text-[10px] text-muted-foreground font-bold">
                Created {formatContributionTimestamp(contribution.createdAt)}
              </p>
              {contribution.updatedAt !== contribution.createdAt && (
                <p className="text-[10px] text-muted-foreground font-bold">
                  Updated {formatContributionTimestamp(contribution.updatedAt)}
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
