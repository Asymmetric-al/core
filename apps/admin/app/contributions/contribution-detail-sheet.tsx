"use client";

import {
  CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP,
  CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
  isContributionRouteCrmRetryScopeSupported,
} from "@asym/api/admin/contribution-operations";
import {
  formatSharedContributionAmount,
  SHARED_CRM_POST_STATUS_LABELS,
} from "@asym/api/admin/contribution-shared";
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
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  CorrectionApprovalPanel,
  type ContributionCorrectionRequestView,
} from "./correction-approval-panel";

import type { ContributionReceiptDeliveryContext } from "./receipt-delivery-choice";
import type { Contribution, ContributionStatus } from "./types";
import type {
  ContributionActionAvailability,
  ContributionCrmPostState,
  ContributionProviderProof,
  CrmPostFailedScope,
} from "@asym/api/admin/contribution-operations";
import type {
  ContributionDesignationFundType,
  ContributionDesignationSet,
  SharedContributionCrmPostStatus,
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
/*  CRM post state helpers (ADR-CD-012)                                 */
/* ------------------------------------------------------------------ */

function isCrmPostFailure(
  status: SharedContributionCrmPostStatus | null,
): boolean {
  return status === "failed" || status === "blocked";
}

function crmPostStatusLabel(
  status: SharedContributionCrmPostStatus | null,
): string {
  return status ? SHARED_CRM_POST_STATUS_LABELS[status] : "Not posted";
}

function crmPostStatusDotColor(
  status: SharedContributionCrmPostStatus | null,
): string {
  if (status === "posted") {
    return "bg-emerald-500";
  }
  if (isCrmPostFailure(status)) {
    return "bg-destructive";
  }
  if (status === "queued") {
    return "bg-amber-500";
  }
  return "bg-muted-foreground/40";
}

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
  /**
   * CRM/Twenty parent + child post state (ADR-CD-012). Workflow metadata —
   * never payment truth. When present it replaces the scalar Twenty field
   * with a parent/child breakdown, failed-scope retries, and any adapter
   * limitation note.
   */
  crmPostState?: ContributionCrmPostState | null;
  /**
   * Scoped CRM retry (ADR-CD-012): retries only the failed parent record or
   * one failed designation line via the existing retry_staged_gift action.
   * Buttons render only when the retry_staged_gift availability entry is
   * available.
   */
  onRetryCrmPost?: (
    scope: CrmPostFailedScope,
    stagedGiftId: string,
    contributionId: string,
  ) => void;
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
  /**
   * Correction requests for this gift (AL-263). Pending requests the viewer
   * can decide render an inline approval panel.
   */
  correctionRequests?: ContributionCorrectionRequestView[];
  /** Updated receipt delivery context for receipt-affecting corrections. */
  receiptDelivery?: ContributionReceiptDeliveryContext | null;
  /** Called after a correction request decision succeeds. */
  onDecided?: () => void;
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
  isActionPending = false,
  actionAvailability,
  designations,
  providerProof,
  crmPostState,
  onRetryCrmPost,
  recurring,
  correctionRequests,
  receiptDelivery,
  onDecided,
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
  const designationRetryGuidanceShownInActions = Boolean(
    retryEntry &&
    !retryEntry.available &&
    retryEntry.blockedReason === CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
  );
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
  const parentRetryScope =
    crmPostState?.failedScopes.find((scope) => scope.scope === "parent") ??
    null;
  const hasRetryableStagedGiftState =
    contribution.stagedGiftStatus === "failed" ||
    (contribution.stagedGiftStatus === "ready_to_post" &&
      (contribution.crmPostStatus === "failed" ||
        contribution.crmPostStatus === "blocked"));
  const hasLegacyCrmRetryState =
    !crmPostState &&
    (contribution.crmPostStatus === "failed" ||
      contribution.crmPostStatus === "blocked");
  const hasRetryableParentTarget = Boolean(
    hasRetryableStagedGiftState || parentRetryScope || hasLegacyCrmRetryState,
  );
  const canRetryGift = Boolean(
    stagedGiftId &&
    hasRetryableParentTarget &&
    (availabilityByAction ? retryEntry?.available : true),
  );
  const canSendReceipt = availabilityByAction
    ? Boolean(stagedGiftId && receiptEntry?.available)
    : !contribution.receiptSent;
  const canRetryCrmScope = Boolean(
    stagedGiftId && retryEntry?.available && onRetryCrmPost,
  );
  /**
   * Gifts outside the CRM post workflow carry an all-null post state; render
   * the section only when there is something to report, matching the prior
   * scalar-field behavior of hiding a null crmPostStatus.
   */
  const crmPostStateHasSignal = Boolean(
    crmPostState &&
    (crmPostState.parent.status ||
      crmPostState.parent.twentyRecordId ||
      crmPostState.designationRecords.length > 0 ||
      crmPostState.failedScopes.length > 0 ||
      crmPostState.adapterLimitation),
  );

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

          {contribution.crmPostStatus && !crmPostStateHasSignal && (
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

        {/* ---- CRM/Twenty post state (ADR-CD-012) ---- */}
        {crmPostState && crmPostStateHasSignal && (
          <>
            <Separator />
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Twenty CRM posting
              </p>
              {crmPostState.adapterLimitation && (
                <Alert className="bg-muted/40">
                  <AlertDescription>
                    <p className="text-xs">{crmPostState.adapterLimitation}</p>
                  </AlertDescription>
                </Alert>
              )}
              <ul className="space-y-2">
                <li className="space-y-2 rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        Parent gift record
                      </span>
                      {crmPostState.parent.twentyRecordId && (
                        <span className="block truncate font-mono text-[10px] text-muted-foreground">
                          {crmPostState.parent.twentyRecordId}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-foreground">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          crmPostStatusDotColor(crmPostState.parent.status),
                        )}
                      />
                      {crmPostStatusLabel(crmPostState.parent.status)}
                    </span>
                  </div>
                  {isCrmPostFailure(crmPostState.parent.status) &&
                    crmPostState.parent.lastError && (
                      <p className="text-xs text-destructive">
                        {crmPostState.parent.lastError}
                      </p>
                    )}
                  {canRetryCrmScope && parentRetryScope && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActionPending}
                      className="h-8 gap-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest"
                      onClick={() =>
                        stagedGiftId &&
                        onRetryCrmPost?.(
                          parentRetryScope,
                          stagedGiftId,
                          contribution.id,
                        )
                      }
                    >
                      <RefreshCcw className="size-3.5" aria-hidden />
                      Retry parent record
                    </Button>
                  )}
                </li>
                {crmPostState.designationRecords.map((record, index) => {
                  const allocationId = record.allocationId;
                  const line = allocationId
                    ? (designations?.lines.find(
                        (candidate) => candidate.id === allocationId,
                      ) ?? null)
                    : null;
                  const lineLabel =
                    line?.fundName ??
                    (allocationId
                      ? `Designation ${allocationId}`
                      : "Designation line");
                  const retryScope = crmPostState.failedScopes.find(
                    (scope) =>
                      scope.scope === "designation" &&
                      scope.allocationId === allocationId,
                  );

                  return (
                    <li
                      key={allocationId ?? `designation-record-${index}`}
                      className="space-y-2 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {lineLabel}
                          </span>
                          {record.twentyRecordId && (
                            <span className="block truncate font-mono text-[10px] text-muted-foreground">
                              {record.twentyRecordId}
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-foreground">
                          <span
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              crmPostStatusDotColor(record.status),
                            )}
                          />
                          {crmPostStatusLabel(record.status)}
                        </span>
                      </div>
                      {isCrmPostFailure(record.status) && record.lastError && (
                        <p className="text-xs text-destructive">
                          {record.lastError}
                        </p>
                      )}
                      {retryScope &&
                        !designationRetryGuidanceShownInActions &&
                        !isContributionRouteCrmRetryScopeSupported(
                          "designation",
                        ) && (
                          <div
                            role="note"
                            className="space-y-1 rounded-md border border-border bg-muted/30 p-2"
                          >
                            <p className="text-xs font-medium text-foreground">
                              {CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP}
                            </p>
                          </div>
                        )}
                      {canRetryCrmScope &&
                        retryScope &&
                        allocationId &&
                        isContributionRouteCrmRetryScopeSupported(
                          "designation",
                        ) && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionPending}
                            className="h-8 gap-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest"
                            onClick={() =>
                              stagedGiftId &&
                              onRetryCrmPost?.(
                                { scope: "designation", allocationId },
                                stagedGiftId,
                                contribution.id,
                              )
                            }
                          >
                            <RefreshCcw className="size-3.5" aria-hidden />
                            Retry this line
                          </Button>
                        )}
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
          </div>

          {!missingStagedGiftWorkflow && blockedWorkflowEntries.length > 0 && (
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

        {/* ---- Correction approvals (AL-263) ---- */}
        {correctionRequests && correctionRequests.length > 0 && (
          <CorrectionApprovalPanel
            correctionRequests={correctionRequests}
            receiptDelivery={receiptDelivery}
            onDecided={onDecided}
          />
        )}

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
