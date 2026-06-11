"use client";

import { formatSharedContributionAmount } from "@asym/api/admin/contribution-shared";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { cn } from "@asym/ui/lib/utils";
import {
  CheckCircle2,
  Copy,
  DollarSign,
  Mail,
  Receipt,
  RefreshCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { Contribution, ContributionStatus } from "./types";
import type {
  ContributionActionAvailability,
  ContributionProviderProof,
} from "@asym/api/admin/contribution-operations";
import type {
  ContributionDesignationFundType,
  ContributionDesignationSet,
} from "@asym/database/types";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

/* ------------------------------------------------------------------ */
/*  Status dot colors — accent colors for semantic meaning              */
/* ------------------------------------------------------------------ */

const statusDotColor: Record<ContributionStatus, string> = {
  completed: "bg-emerald-500",
  pending: "bg-amber-500",
  failed: "bg-destructive",
  refunded: "bg-muted-foreground",
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
      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-semibold text-foreground",
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
  onApproveStagedGift?: (stagedGiftId: string, contributionId: string) => void;
  onRetryStagedGift?: (stagedGiftId: string, contributionId: string) => void;
  onSendReceipt?: (stagedGiftId: string, contributionId: string) => void;
  isActionPending?: boolean;
  /**
   * Server-computed action availability (ADR-CD-017 / ADR-CD-018). When
   * provided it is the authority for which workflow actions render; the
   * legacy client-side gating below only applies when it is absent.
   */
  actionAvailability?: ContributionActionAvailability[];
  /**
   * The gift's complete designation set (ADR-CD-008 / ADR-CD-011). Lines
   * render equally — compact rows with expandable per-line context.
   */
  designations?: ContributionDesignationSet;
  /**
   * Role-gated provider proof (ADR-CD-014). Null/undefined for staff
   * without provider access — the section then never renders.
   */
  providerProof?: ContributionProviderProof | null;
}

const FUND_TYPE_LABELS: Record<ContributionDesignationFundType, string> = {
  missionary: "Missionary fund",
  project: "Project fund",
  campaign: "Campaign",
  general: "General fund",
};

const ACTION_LABELS: Partial<
  Record<ContributionActionAvailability["actionType"], string>
> = {
  approve_staged_gift: "Approve/Post",
  retry_staged_gift: "Retry posting",
  resend_receipt: "Send receipt",
};

export function ContributionDetailSheet({
  contribution,
  onClose,
  onApproveStagedGift,
  onRetryStagedGift,
  onSendReceipt,
  isActionPending = false,
  actionAvailability,
  designations,
  providerProof,
}: ContributionDetailSheetProps) {
  if (!contribution) return null;

  const { donorName, donorEmail, donorAvatar, isAnonymous } = contribution;
  const date = makeDisplayDate(contribution.date);
  const donorDisplayName = isAnonymous ? "Anonymous" : (donorName ?? "Unknown");
  const stagedGiftId = contribution.stagedGiftId;

  const availabilityByAction = actionAvailability
    ? new Map(actionAvailability.map((entry) => [entry.actionType, entry]))
    : null;
  const approveEntry = availabilityByAction?.get("approve_staged_gift") ?? null;
  const retryEntry = availabilityByAction?.get("retry_staged_gift") ?? null;
  const receiptEntry = availabilityByAction?.get("resend_receipt") ?? null;
  const missingStagedGiftWorkflow =
    Boolean(availabilityByAction) && !stagedGiftId;
  const blockedWorkflowEntries = availabilityByAction
    ? [approveEntry, retryEntry, receiptEntry].filter(
        (entry): entry is ContributionActionAvailability =>
          Boolean(entry && !entry.available && entry.blockedReason),
      )
    : [];

  const canApproveGift = availabilityByAction
    ? Boolean(stagedGiftId && approveEntry?.available)
    : stagedGiftId &&
      (contribution.stagedGiftStatus === "received" ||
        contribution.stagedGiftStatus === "needs_review");
  const canRetryGift = availabilityByAction
    ? Boolean(stagedGiftId && retryEntry?.available)
    : stagedGiftId &&
      (contribution.stagedGiftStatus === "failed" ||
        contribution.crmPostStatus === "failed" ||
        contribution.crmPostStatus === "blocked");
  const canSendReceipt = availabilityByAction
    ? Boolean(stagedGiftId && receiptEntry?.available)
    : !contribution.receiptSent;

  const handleCopyTxn = async () => {
    const tid = contribution.transactionId;
    if (!tid) {
      toast.error("No transaction ID to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(tid);
      toast.success("Transaction ID copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <Sheet open={!!contribution} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 gap-0 border-l border-border bg-background shadow-2xl overflow-hidden flex flex-col h-full text-left">
        {/* ---- Header ---- */}
        <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-10">
          <SheetTitle className="m-0 flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider">
            <DollarSign className="size-4 text-muted-foreground" aria-hidden />
            Contribution Details
          </SheetTitle>
          <SheetDescription className="sr-only">
            Contribution details for {donorDisplayName}, including donor,
            receipt, staged gift, and payment information.
          </SheetDescription>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Close contribution details"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {/* ---- Content ---- */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* ---- Donor + Status ---- */}
            <div className="flex items-start gap-4">
              <Avatar className="size-16 border-4 border-background shadow-sm">
                <AvatarImage
                  src={donorAvatar ?? undefined}
                  alt={donorDisplayName}
                />
                <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xl">
                  {isAnonymous ? "?" : getInitials(donorDisplayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1 pt-1">
                <h3 className="text-2xl font-semibold text-foreground tracking-tight">
                  {isAnonymous ? "Anonymous Donor" : donorDisplayName}
                </h3>
                {!isAnonymous && donorEmail && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {donorEmail}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] font-semibold uppercase tracking-wider border shadow-none"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full mr-1.5",
                        statusDotColor[contribution.status],
                      )}
                    />
                    {contribution.status}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="h-5 text-[10px] font-semibold uppercase tracking-wider border-none bg-muted text-muted-foreground"
                  >
                    {contribution.type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* ---- Amount display ---- */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
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

              <DetailField label="Source">{contribution.source}</DetailField>

              {!designations && (
                <DetailField label="Fund">
                  <span>{contribution.fundName}</span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {contribution.fundCode}
                  </span>
                </DetailField>
              )}

              <DetailField label="Transaction ID" mono>
                {contribution.transactionId}
              </DetailField>

              <DetailField label="Receipt">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      contribution.receiptSent
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  {contribution.receiptSent ? "Sent" : "Pending"}
                </span>
              </DetailField>

              {contribution.stagedGiftStatus && (
                <DetailField label="Review">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        contribution.stagedGiftStatus === "posted"
                          ? "bg-emerald-500"
                          : contribution.stagedGiftStatus === "failed"
                            ? "bg-destructive"
                            : "bg-amber-500",
                      )}
                    />
                    {contribution.stagedGiftStatus.replace(/_/g, " ")}
                  </span>
                </DetailField>
              )}

              {contribution.crmPostStatus && (
                <DetailField label="Twenty">
                  {contribution.crmPostStatus.replace(/_/g, " ")}
                </DetailField>
              )}

              {contribution.missionaryName && (
                <DetailField label="Missionary">
                  {contribution.missionaryName}
                </DetailField>
              )}
            </div>

            {/* ---- Designations (ADR-CD-008 / ADR-CD-011) ---- */}
            {designations && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Designations
                  </p>
                  {!designations.reconcilesToGiftAmount && (
                    <div
                      role="note"
                      className="rounded-lg border border-border bg-amber-50/50 p-3 dark:bg-amber-950/20"
                    >
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Designation lines do not reconcile to the gift amount.
                        Review the designation set before relying on these
                        allocations.
                      </p>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {designations.lines.map((line) => {
                      const hasContext = Boolean(
                        line.memo || line.restriction || line.missionaryName,
                      );

                      return (
                        <li
                          key={line.id}
                          className="rounded-lg border border-border bg-card"
                        >
                          <details className="group">
                            <summary
                              className={cn(
                                "flex items-center justify-between gap-3 p-3",
                                hasContext
                                  ? "cursor-pointer list-none"
                                  : "pointer-events-none list-none",
                              )}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-foreground">
                                  {line.fundName}
                                </span>
                                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {FUND_TYPE_LABELS[line.fundType]}
                                </span>
                              </span>
                              <span className="shrink-0 text-sm font-semibold font-mono tabular-nums text-foreground">
                                {formatSharedContributionAmount(
                                  line.amountCents,
                                  line.currencyCode,
                                )}
                              </span>
                            </summary>
                            {hasContext && (
                              <div className="space-y-1 border-t border-border px-3 py-2">
                                {line.missionaryName && (
                                  <p className="text-xs text-muted-foreground">
                                    Supports{" "}
                                    <span className="font-medium text-foreground">
                                      {line.missionaryName}
                                    </span>
                                  </p>
                                )}
                                {line.memo && (
                                  <p className="text-xs text-muted-foreground">
                                    Donor memo: “{line.memo}”
                                  </p>
                                )}
                                {line.restriction && (
                                  <p className="text-xs text-muted-foreground">
                                    Restriction: {line.restriction}
                                  </p>
                                )}
                              </div>
                            )}
                          </details>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}

            {/* ---- Notes ---- */}
            {contribution.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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

            {contribution.stagedGiftReviewReason && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Review reason
                  </p>
                  <div className="rounded-lg border border-border bg-amber-50/50 p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {contribution.stagedGiftReviewReason.replace(/,/g, ", ")}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* ---- Actions ---- */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Actions
              </p>

              {missingStagedGiftWorkflow && (
                <div
                  role="note"
                  className="rounded-lg border border-border bg-muted/30 p-4 space-y-1"
                >
                  <p className="text-sm font-medium text-foreground">
                    This gift has no staged gift workflow record, so finance
                    workflow actions are unavailable.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The donation is valid and shown read-only. Import or create
                    a staged gift to run finance workflow actions for it.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl font-semibold uppercase tracking-widest text-[10px] h-9"
                  onClick={handleCopyTxn}
                >
                  <Copy className="size-3.5" />
                  Copy Transaction ID
                </Button>
                {!isAnonymous && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl font-semibold uppercase tracking-widest text-[10px] h-9"
                  >
                    <Mail className="size-3.5" />
                    Email Donor
                  </Button>
                )}
                {canSendReceipt && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl font-semibold uppercase tracking-widest text-[10px] h-9"
                    disabled={!stagedGiftId || isActionPending}
                    onClick={() =>
                      stagedGiftId &&
                      onSendReceipt?.(stagedGiftId, contribution.id)
                    }
                  >
                    <Receipt className="size-3.5" />
                    Send Receipt
                  </Button>
                )}
                {canApproveGift && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isActionPending}
                    className="gap-2 rounded-xl font-bold uppercase tracking-widest text-[10px] h-9"
                    onClick={() =>
                      stagedGiftId &&
                      onApproveStagedGift?.(stagedGiftId, contribution.id)
                    }
                  >
                    <CheckCircle2 className="size-3.5" />
                    Approve/Post
                  </Button>
                )}
                {canRetryGift && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isActionPending}
                    className="gap-2 rounded-xl font-bold uppercase tracking-widest text-[10px] h-9"
                    onClick={() =>
                      stagedGiftId &&
                      onRetryStagedGift?.(stagedGiftId, contribution.id)
                    }
                  >
                    <RefreshCcw className="size-3.5" />
                    Retry Posting
                  </Button>
                )}
                {contribution.status === "failed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl font-semibold uppercase tracking-widest text-[10px] h-9"
                  >
                    <RefreshCcw className="size-3.5" />
                    Retry Payment
                  </Button>
                )}
              </div>

              {!missingStagedGiftWorkflow &&
                blockedWorkflowEntries.length > 0 && (
                  <ul className="space-y-1.5">
                    {blockedWorkflowEntries.map((entry) => (
                      <li
                        key={entry.actionType}
                        className="text-xs text-muted-foreground leading-relaxed"
                      >
                        <span className="font-medium text-foreground">
                          {ACTION_LABELS[entry.actionType] ?? entry.actionType}:
                        </span>{" "}
                        {entry.blockedReason}
                        {entry.nextStep ? ` ${entry.nextStep}` : null}
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            {/* ---- Provider proof (ADR-CD-014, role-gated) ---- */}
            {providerProof && (
              <>
                <Separator />
                <details className="rounded-lg border border-border bg-card">
                  <summary className="cursor-pointer list-none p-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Provider proof
                  </summary>
                  <div className="space-y-2 border-t border-border px-3 py-3">
                    <DetailField label="Payment intent" mono>
                      {providerProof.paymentIntentId ?? "—"}
                    </DetailField>
                    <DetailField label="Charge" mono>
                      {providerProof.chargeId ?? "—"}
                    </DetailField>
                    {providerProof.refundIds.length > 0 && (
                      <DetailField label="Refund IDs" mono>
                        {providerProof.refundIds.join(", ")}
                      </DetailField>
                    )}
                    <div className="flex flex-wrap gap-3 pt-1">
                      {providerProof.dashboardUrls.paymentIntent && (
                        <a
                          href={providerProof.dashboardUrls.paymentIntent}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-foreground underline underline-offset-2"
                        >
                          Open payment in Stripe
                        </a>
                      )}
                      {providerProof.dashboardUrls.charge && (
                        <a
                          href={providerProof.dashboardUrls.charge}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-foreground underline underline-offset-2"
                        >
                          Open charge in Stripe
                        </a>
                      )}
                    </div>
                  </div>
                </details>
              </>
            )}

            {/* ---- Metadata ---- */}
            <div className="pt-2 space-y-1">
              <p className="text-[10px] text-muted-foreground font-semibold">
                Created{" "}
                {makeDisplayDate(contribution.createdAt).toLocaleString(
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
              {contribution.updatedAt !== contribution.createdAt && (
                <p className="text-[10px] text-muted-foreground font-semibold">
                  Updated{" "}
                  {makeDisplayDate(contribution.updatedAt).toLocaleString(
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
