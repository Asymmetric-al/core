"use client";

import { formatCurrency, getInitials } from "@asym/lib/utils";
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
import {
  Copy,
  DollarSign,
  Mail,
  Receipt,
  RefreshCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { Contribution, ContributionStatus } from "./types";

/* ------------------------------------------------------------------ */
/*  Status dot colors — accent colors for semantic meaning              */
/* ------------------------------------------------------------------ */

const statusDotColor: Record<ContributionStatus, string> = {
  Succeeded: "bg-emerald-500",
  Pending: "bg-amber-500",
  Failed: "bg-destructive",
  Refunded: "bg-muted-foreground",
  Disputed: "bg-orange-500",
};

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
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-sm font-medium text-foreground",
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

  const { donor, isAnonymous } = contribution;
  const date = new Date(contribution.date);

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(contribution.transactionId);
    toast.success("Transaction ID copied to clipboard");
  };

  return (
    <Sheet
      open={!!contribution}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent className="w-full sm:max-w-lg p-0 gap-0 border-l border-border bg-background shadow-2xl overflow-hidden flex flex-col h-full text-left">
        {/* ---- Header ---- */}
        <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
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
            {/* ---- Donor + Amount ---- */}
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                <AvatarImage src={donor.avatar} alt={donor.name} />
                <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-lg">
                  {isAnonymous ? "?" : getInitials(donor.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  {isAnonymous ? "Anonymous Donor" : donor.name}
                </h2>
                {!isAnonymous && donor.email && (
                  <p className="text-sm text-muted-foreground">{donor.email}</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        statusDotColor[contribution.status],
                      )}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {contribution.status}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {contribution.type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* ---- Amount display ---- */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Amount
              </p>
              <p className="text-3xl font-semibold font-mono tabular-nums text-foreground tracking-tight">
                {formatCurrency(contribution.amount)}
              </p>
            </div>

            <Separator />

            {/* ---- Details grid ---- */}
            <div className="grid grid-cols-2 gap-6">
              <DetailField label="Date">
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </DetailField>

              <DetailField label="Payment Method">
                {contribution.paymentMethod}
              </DetailField>

              <DetailField label="Source">
                {contribution.source}
              </DetailField>

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
                      contribution.receiptSent
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  {contribution.receiptSent ? "Sent" : "Pending"}
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
                  <p className="text-xs font-medium text-muted-foreground">
                    Notes
                  </p>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {contribution.notes}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* ---- Actions ---- */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Actions
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleCopyTxn}
                >
                  <Copy className="size-3.5" />
                  Copy Transaction ID
                </Button>
                {!isAnonymous && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="size-3.5" />
                    Email Donor
                  </Button>
                )}
                {!contribution.receiptSent && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Receipt className="size-3.5" />
                    Send Receipt
                  </Button>
                )}
                {contribution.status === "Failed" && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCcw className="size-3.5" />
                    Retry Payment
                  </Button>
                )}
              </div>
            </div>

            {/* ---- Metadata ---- */}
            <div className="pt-2 space-y-1">
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                Created{" "}
                {new Date(contribution.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              {contribution.updatedAt !== contribution.createdAt && (
                <p className="font-mono text-xs text-muted-foreground tabular-nums">
                  Updated{" "}
                  {new Date(contribution.updatedAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    },
                  )}
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
