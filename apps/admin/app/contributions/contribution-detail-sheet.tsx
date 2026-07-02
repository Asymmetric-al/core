"use client";

import { formatSharedContributionAmount } from "@asym/api/admin/contribution-shared";
import { getInitials } from "@asym/lib/utils";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
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
  AlertCircle,
  CheckCircle2,
  Copy,
  DollarSign,
  LoaderCircle,
  Receipt,
  RefreshCcw,
  Undo2,
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
  processing: "bg-blue-500",
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
  isOpen?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onApproveStagedGift?: (stagedGiftId: string, contributionId: string) => void;
  onRetryStagedGift?: (stagedGiftId: string, contributionId: string) => void;
  onSendReceipt?: (stagedGiftId: string, contributionId: string) => void;
  /**
   * Opens the shared refund operation shell for this gift (issue #265).
   * The affordance only renders when server availability includes a refund
   * entry; a present-but-blocked entry renders disabled with the server's
   * blocked reason inline.
   */
  onRefund?: (contributionId: string) => void;
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
  /** Recurring agreement context (ADR-CD-007). */
  recurring?: {
    isRecurring: boolean;
    interval: string | null;
    pledgeId: string | null;
    agreement: {
      id: string;
      status: string | null;
      frequency: string | null;
      amountCents: number;
      currencyCode: string;
      fundName: string | null;
      nextExpectedGiftAt: string | null;
      stripeSubscriptionId: string | null;
    } | null;
    providerRecurrenceWithoutAgreement: boolean;
  };
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
  refund: "Refund gift",
};

function ContributionDetailSheetFrame({
  children,
  donorDisplayName,
  onClose,
  open,
}: {
  children: React.ReactNode;
  donorDisplayName: string;
  onClose: () => void;
  open: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        showCloseButton={false}
        className="w-full sm:max-w-lg p-0 gap-0 border-l border-border bg-background shadow-2xl overflow-hidden flex flex-col h-full text-left"
      >
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

        <ScrollArea className="flex-1">{children}</ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ContributionDetailLoadingState() {
  return (
    <div className="p-6">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-muted-foreground"
      >
        <LoaderCircle className="size-4 animate-spin" aria-hidden />
        Loading contribution details...
      </div>
    </div>
  );
}

function ContributionDetailErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="size-4" aria-hidden />
        <AlertDescription>
          <p>{errorMessage}</p>
          {onRetry && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2 gap-2"
              onClick={onRetry}
            >
              <RefreshCcw className="size-3.5" aria-hidden />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function ContributionDetailSheet({
  contribution,
  onClose,
  isOpen,
  isLoading = false,
  errorMessage,
  onRetry,
  onApproveStagedGift,
  onRetryStagedGift,
  onSendReceipt,
  onRefund,
  isActionPending = false,
  actionAvailability,
  designations,
  providerProof,
  recurring,
}: ContributionDetailSheetProps) {
  const open = isOpen ?? Boolean(contribution);
  const donorDisplayName = contribution
    ? contribution.isAnonymous
      ? "Anonymous"
      : (contribution.donorName ?? "Unknown")
    : "selected contribution";

  if (!open && !contribution) {
    return null;
  }

  if (!contribution) {
    return (
      <ContributionDetailSheetFrame
        donorDisplayName={donorDisplayName}
        onClose={onClose}
        open={open}
      >
        {isLoading ? (
          <ContributionDetailLoadingState />
        ) : errorMessage ? (
          <ContributionDetailErrorState
            errorMessage={errorMessage}
            onRetry={onRetry}
          />
        ) : (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              Contribution details are unavailable.
            </p>
          </div>
        )}
      </ContributionDetailSheetFrame>
    );
  }

  const { donorName, donorEmail, donorAvatar, isAnonymous } = contribution;
  const date = makeDisplayDate(contribution.date);
  const resolvedDonorDisplayName = isAnonymous
    ? "Anonymous"
    : (donorName ?? "Unknown");
  const stagedGiftId = contribution.stagedGiftId;

  const availabilityByAction = actionAvailability
    ? new Map(actionAvailability.map((entry) => [entry.actionType, entry]))
    : null;
  const approveEntry = availabilityByAction?.get("approve_staged_gift") ?? null;
  const retryEntry = availabilityByAction?.get("retry_staged_gift") ?? null;
  const receiptEntry = availabilityByAction?.get("resend_receipt") ?? null;
  const refundEntry = availabilityByAction?.get("refund") ?? null;
  const missingStagedGiftWorkflow =
    Boolean(availabilityByAction) && !stagedGiftId;
  const blockedWorkflowEntries = availabilityByAction
    ? [approveEntry, retryEntry, receiptEntry].filter(
        (entry): entry is ContributionActionAvailability =>
          Boolean(entry && !entry.available && entry.blockedReason),
      )
    : [];

  // Refunds are provider-charge based, not staged-gift based, so the refund
  // affordance and its blocked reason render independently of the staged
  // gift workflow gating below.
  const showRefundAction = Boolean(onRefund && refundEntry);
  const canRefund = Boolean(refundEntry?.available);
  const refundBlockedEntry =
    showRefundAction && refundEntry && !refundEntry.available
      ? refundEntry
      : null;
  const visibleBlockedEntries = [
    ...(missingStagedGiftWorkflow ? [] : blockedWorkflowEntries),
    ...(refundBlockedEntry?.blockedReason ? [refundBlockedEntry] : []),
  ];

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
    <ContributionDetailSheetFrame
      donorDisplayName={resolvedDonorDisplayName}
      onClose={onClose}
      open={open}
    >
      <div className="p-6 space-y-8">
        {/* ---- Donor + Status ---- */}
        <div className="flex items-start gap-4">
          <Avatar className="size-16 border-4 border-background shadow-sm">
            <AvatarImage
              src={donorAvatar ?? undefined}
              alt={resolvedDonorDisplayName}
            />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xl">
              {isAnonymous ? "?" : getInitials(resolvedDonorDisplayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1 pt-1">
            <h3 className="text-2xl font-semibold text-foreground tracking-tight">
              {isAnonymous ? "Anonymous Donor" : resolvedDonorDisplayName}
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
            {formatSharedContributionAmount(
              contribution.shared.amountCents,
              contribution.shared.currencyCode,
            )}
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
                    "size-2 shrink-0 rounded-full",
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
                <Alert className="bg-muted/40">
                  <AlertDescription>
                    <p className="text-xs">
                      Designation lines do not reconcile to the gift amount.
                      Review the designation set before relying on these
                      allocations.
                    </p>
                  </AlertDescription>
                </Alert>
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
              <Alert className="bg-muted/40">
                <AlertDescription>
                  <p className="text-sm font-medium">
                    {contribution.stagedGiftReviewReason.replace(/,/g, ", ")}
                  </p>
                </AlertDescription>
              </Alert>
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
                The donation is valid and shown read-only. Import or create a
                staged gift to run finance workflow actions for it.
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
            {canSendReceipt && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl font-semibold uppercase tracking-widest text-[10px] h-9"
                disabled={!stagedGiftId || isActionPending}
                onClick={() =>
                  stagedGiftId && onSendReceipt?.(stagedGiftId, contribution.id)
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
            {showRefundAction && (
              <Button
                variant="outline"
                size="sm"
                disabled={!canRefund || isActionPending}
                className="gap-2 rounded-xl font-semibold uppercase tracking-widest text-[10px] h-9"
                onClick={() => onRefund?.(contribution.id)}
              >
                <Undo2 className="size-3.5" />
                Refund Gift
              </Button>
            )}
          </div>

          {visibleBlockedEntries.length > 0 && (
            <ul className="space-y-1.5">
              {visibleBlockedEntries.map((entry) => (
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

        {/* ---- Recurring agreement context (ADR-CD-007) ---- */}
        {recurring?.isRecurring && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recurring giving
              </p>
              {recurring.providerRecurrenceWithoutAgreement && (
                <Alert className="bg-muted/40">
                  <AlertDescription>
                    <p className="text-xs">
                      The payment provider reports this gift as recurring, but
                      no internal recurring agreement is linked. Review and link
                      the recurring agreement to close this reconciliation gap.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              {recurring.agreement && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {formatSharedContributionAmount(
                      recurring.agreement.amountCents,
                      recurring.agreement.currencyCode,
                    )}{" "}
                    {recurring.agreement.frequency ?? "recurring"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {recurring.agreement.fundName ?? "General Fund"}
                    {" · "}
                    {recurring.agreement.status ?? "active"}
                    {recurring.agreement.nextExpectedGiftAt
                      ? ` · Next expected ${makeDisplayDate(
                          recurring.agreement.nextExpectedGiftAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : null}
                  </p>
                  {recurring.agreement.stripeSubscriptionId && (
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Stripe evidence:{" "}
                      {recurring.agreement.stripeSubscriptionId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

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
            {makeDisplayDate(contribution.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          {contribution.updatedAt !== contribution.createdAt && (
            <p className="text-[10px] text-muted-foreground font-semibold">
              Updated{" "}
              {makeDisplayDate(contribution.updatedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    </ContributionDetailSheetFrame>
  );
}
