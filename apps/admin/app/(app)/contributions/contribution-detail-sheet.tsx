"use client";

import { contributionActionName } from "@asym/api/admin/contribution-operations/catalog";
import {
  CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP,
  CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
  isContributionRouteCrmRetryScopeSupported,
} from "@asym/api/admin/contribution-operations/crm-retry-support";
import {
  formatSharedContributionAmount,
  SHARED_CRM_POST_STATUS_LABELS,
} from "@asym/api/admin/contribution-shared";
import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
import { getInitials } from "@asym/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
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
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Info,
  Receipt,
  RefreshCcw,
  TriangleAlert,
  Undo2,
  X,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import {
  ContributionReceiptStatus,
  ContributionStatusBadge,
} from "./contribution-status";
import {
  CorrectionApprovalPanel,
  type ContributionCorrectionRequestView,
} from "./correction-approval-panel";
import { formatPaymentMethod } from "./data";
import { effectiveContributionStatus } from "./hub-model";

import type { ContributionReceiptDeliveryContext } from "./receipt-delivery-choice";
import type { Contribution } from "./types";
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
import type { ReactNode } from "react";

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
    return "bg-success";
  }
  if (isCrmPostFailure(status)) {
    return "bg-destructive";
  }
  if (status === "queued") {
    return "bg-warning";
  }
  return "bg-muted-foreground/40";
}

/* ------------------------------------------------------------------ */
/*  Staged gift review labels                                          */
/* ------------------------------------------------------------------ */

const STAGED_GIFT_STATUS_LABELS: Record<
  NonNullable<Contribution["stagedGiftStatus"]>,
  string
> = {
  received: "Received",
  needs_review: "Needs review",
  ready_to_post: "Ready to post",
  posted: "Posted",
  failed: "Failed",
  refunded: "Refunded",
  voided: "Voided",
};

function stagedGiftDotColor(status: Contribution["stagedGiftStatus"]) {
  if (status === "posted") return "bg-success";
  if (status === "failed") return "bg-destructive";
  return "bg-warning";
}

/**
 * Review reasons are stored as comma-separated codes (see
 * `determineInitialReview` in packages/api/src/giving/staged-gifts.ts) or as
 * a free-text staff note, which passes through unchanged.
 */
const REVIEW_REASON_LABELS: Record<string, string> = {
  donor_match_missing: "No matching donor record",
  allocation_missing: "No fund or missionary chosen",
};

function reviewReasonLabel(reason: string): string {
  return reason
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => REVIEW_REASON_LABELS[part] ?? part)
    .join(", ");
}

/* ------------------------------------------------------------------ */
/*  Recurring agreement labels                                         */
/* ------------------------------------------------------------------ */

const AGREEMENT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  paused: "Paused",
  past_due: "Past due",
  canceled: "Canceled",
  cancelled: "Canceled",
  completed: "Completed",
};

function agreementStatusLabel(status: string | null): string {
  if (!status) {
    return "Status unknown";
  }
  const known = AGREEMENT_STATUS_LABELS[status.toLowerCase()];
  if (known) {
    return known;
  }
  // Unrecognized stored values still read as words, never snake_case.
  const words = status.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Layout parts                                                        */
/* ------------------------------------------------------------------ */

function StatusDot({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-2 shrink-0 rounded-full", className)}
    />
  );
}

/**
 * One titled section of the sheet. Sections share a hairline divider and a
 * heading level so screen-reader users can jump between them.
 */
function SheetSection({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 border-t pt-6"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function DetailField({
  label,
  children,
  mono = false,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", wide && "col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-sm text-foreground",
          mono && "font-mono text-xs break-all",
        )}
      >
        {children}
      </dd>
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
  pendingAction?: ContributionDetailPendingAction | null;
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
   * Historical CRM parent + child post state (ADR-CD-012). This is audit
   * metadata, never payment truth or an executable posting workflow.
   */
  crmPostState?: ContributionCrmPostState | null;
  /**
   * Compatibility callback retained for a future audited provider workflow.
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
      missionaryName: string | null;
      nextExpectedGiftAt: string | null;
      stripeSubscriptionId: string | null;
      linkedGiftCount: number;
      lastLinkedGiftAt: string | null;
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

export type ContributionDetailPendingAction =
  | {
      actionType: "approve_staged_gift";
      contributionId: string;
      stagedGiftId: string;
    }
  | {
      actionType: "retry_staged_gift";
      contributionId: string;
      stagedGiftId: string;
      scope?: CrmPostFailedScope;
    }
  | {
      actionType: "resend_receipt";
      contributionId: string;
      stagedGiftId: string;
    };

const FUND_TYPE_LABELS: Record<ContributionDesignationFundType, string> = {
  missionary: "Missionary fund",
  project: "Project fund",
  campaign: "Campaign",
  general: "General fund",
};

function ContributionDetailSheetFrame({
  children,
  donorDisplayName,
  onClose,
  open,
}: {
  children: ReactNode;
  donorDisplayName: string;
  onClose: () => void;
  open: boolean;
}) {
  // Open on the content rather than the close button, so the first thing a
  // pointer user sees is the gift (not a focus ring) and Tab still reaches
  // every action in order.
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        showCloseButton={false}
        initialFocus={contentRef}
        className="w-full sm:max-w-xl"
      >
        <div className="flex min-h-0 flex-1 flex-col text-left">
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6">
            <SheetTitle className="text-base">Contribution details</SheetTitle>
            <SheetDescription className="sr-only">
              Contribution details for {donorDisplayName}, including donor,
              receipt, staged gift, and payment information.
            </SheetDescription>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close contribution details"
            >
              <X aria-hidden="true" />
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div ref={contentRef} tabIndex={-1} className="outline-none">
              {children}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ContributionDetailLoadingState() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <p role="status" aria-live="polite" className="sr-only">
        Loading contribution details...
      </p>
      <div aria-hidden="true" className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <Skeleton aria-hidden="true" className="h-28 w-full rounded-xl" />
      <div aria-hidden="true" className="grid grid-cols-2 gap-x-6 gap-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
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
    <div className="p-4 sm:p-6">
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>Couldn&apos;t load this contribution</AlertTitle>
        <AlertDescription>
          <p>{errorMessage}</p>
          {onRetry && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={onRetry}
            >
              <RefreshCcw aria-hidden="true" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * A refresh that fails after the gift already loaded (for example right after
 * an action) keeps the last loaded details on screen, and says so.
 */
function ContributionDetailStaleNotice({ onRetry }: { onRetry?: () => void }) {
  return (
    <Alert variant="warning">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>Couldn&apos;t refresh this contribution</AlertTitle>
      <AlertDescription>
        <p>Showing the last loaded details, which may be out of date.</p>
        {onRetry && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={onRetry}
          >
            <RefreshCcw aria-hidden="true" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

function crmRetryScopeMatches(
  left: CrmPostFailedScope | undefined,
  right: CrmPostFailedScope | undefined,
) {
  if (!left && !right) return true;
  if (!left || !right) return false;
  if (left.scope !== right.scope) return false;
  if (left.scope === "designation" && right.scope === "designation") {
    return left.allocationId === right.allocationId;
  }
  return true;
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
  pendingAction = null,
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
  const { formatDate, formatDateTime } = useLocaleFormat();
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
          <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">
              Contribution details are unavailable.
            </p>
          </div>
        )}
      </ContributionDetailSheetFrame>
    );
  }

  const { donorName, donorEmail, donorAvatar, isAnonymous } = contribution;
  const resolvedDonorDisplayName = isAnonymous
    ? "Anonymous"
    : (donorName ?? "Unknown");
  const stagedGiftId = contribution.stagedGiftId;

  const {
    crmPostStateHasSignal,
    canRetryCrmScope,
    parentRetryScope,
    parentRetryActionPending,
    pendingActionMatches,
    designationRetryGuidanceShownInNote,
    missingStagedGiftWorkflow,
    canSendReceipt,
    receiptActionPending,
    canApproveGift,
    approveActionPending,
    canRetryGift,
    stagedRetryActionPending,
    showRefundAction,
    canRefund,
    visibleBlockedEntries,
    retiredCrmEntries,
    showRecurringSection,
    isOneTimeGiftWithAgreement,
  } = getContributionDetailWorkflow(contribution, {
    actionAvailability,
    crmPostState,
    onRefund,
    onRetryCrmPost,
    recurring,
    pendingAction,
  });

  // The retired-CRM note sits with the posting history when there is any;
  // otherwise it closes the Actions section.
  const showsCrmPostingHistory = Boolean(crmPostState && crmPostStateHasSignal);

  // Same fallback as the row menu: a gift without a processor transaction
  // copies its gift ID, and the button says which one it copies.
  const handleCopyTxn = async () => {
    const value = contribution.transactionId ?? contribution.id;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(
        contribution.transactionId ? "Transaction ID copied" : "Gift ID copied",
      );
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
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        {errorMessage && <ContributionDetailStaleNotice onRetry={onRetry} />}
        <ContributionDonorSummary
          donorAvatar={donorAvatar}
          resolvedDonorDisplayName={resolvedDonorDisplayName}
          isAnonymous={isAnonymous}
          donorEmail={donorEmail}
          contribution={contribution}
        />

        <ContributionActionsSection
          missingStagedGiftWorkflow={missingStagedGiftWorkflow}
          handleCopyTxn={handleCopyTxn}
          canSendReceipt={canSendReceipt}
          receiptActionPending={receiptActionPending}
          stagedGiftId={stagedGiftId}
          isActionPending={isActionPending}
          onSendReceipt={onSendReceipt}
          contribution={contribution}
          canApproveGift={canApproveGift}
          approveActionPending={approveActionPending}
          onApproveStagedGift={onApproveStagedGift}
          canRetryGift={canRetryGift}
          stagedRetryActionPending={stagedRetryActionPending}
          onRetryStagedGift={onRetryStagedGift}
          showRefundAction={showRefundAction}
          canRefund={canRefund}
          onRefund={onRefund}
          visibleBlockedEntries={visibleBlockedEntries}
          retiredCrmEntries={showsCrmPostingHistory ? [] : retiredCrmEntries}
        />

        {/* ---- Correction approvals (AL-263) ---- */}
        <ContributionCorrectionSection
          correctionRequests={correctionRequests}
          receiptDelivery={receiptDelivery}
          onDecided={onDecided}
        />

        <ContributionDetailsGrid
          formatDate={formatDate}
          contribution={contribution}
          designations={designations}
          crmPostStateHasSignal={crmPostStateHasSignal}
        />

        {/* ---- Designations (ADR-CD-008 / ADR-CD-011) ---- */}
        <ContributionDesignationsSection designations={designations} />

        <ContributionNotesSection contribution={contribution} />

        {/* ---- Recurring agreement context (ADR-CD-007) ---- */}
        <ContributionRecurringSection
          recurring={recurring}
          showRecurringSection={showRecurringSection}
          isOneTimeGiftWithAgreement={isOneTimeGiftWithAgreement}
          formatDate={formatDate}
        />

        {/* ---- Historical CRM post state (ADR-CD-012) ---- */}
        <ContributionCrmPostingSection
          crmPostState={crmPostState}
          crmPostStateHasSignal={crmPostStateHasSignal}
          canRetryCrmScope={canRetryCrmScope}
          parentRetryScope={parentRetryScope}
          parentRetryActionPending={parentRetryActionPending}
          isActionPending={isActionPending}
          stagedGiftId={stagedGiftId}
          onRetryCrmPost={onRetryCrmPost}
          contribution={contribution}
          designations={designations}
          pendingActionMatches={pendingActionMatches}
          designationRetryGuidanceShownInNote={
            designationRetryGuidanceShownInNote
          }
          retiredCrmEntries={retiredCrmEntries}
        />

        {/* ---- Provider proof (ADR-CD-014, role-gated) ---- */}
        <ContributionProviderSection providerProof={providerProof} />

        {/* ---- Metadata ---- */}
        <ContributionMetadataSection
          formatDateTime={formatDateTime}
          contribution={contribution}
        />
      </div>
    </ContributionDetailSheetFrame>
  );
}

function ContributionDonorSummary({
  donorAvatar,
  resolvedDonorDisplayName,
  isAnonymous,
  donorEmail,
  contribution,
}: {
  donorAvatar: Contribution["donorAvatar"];
  resolvedDonorDisplayName: string;
  isAnonymous: Contribution["isAnonymous"];
  donorEmail: Contribution["donorEmail"];
  contribution: Contribution;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar aria-hidden="true" className="size-10">
          {!isAnonymous && donorAvatar ? (
            <AvatarImage src={donorAvatar} alt="" />
          ) : null}
          <AvatarFallback>
            {isAnonymous ? "?" : getInitials(resolvedDonorDisplayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-base font-semibold text-foreground">
            {isAnonymous ? "Anonymous donor" : resolvedDonorDisplayName}
          </h3>
          {!isAnonymous && donorEmail && (
            <p className="truncate text-sm text-muted-foreground">
              {donorEmail}
            </p>
          )}
        </div>
      </div>

      {/* ---- Amount display ---- */}
      <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Amount</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <ContributionStatusBadge
              status={effectiveContributionStatus(contribution)}
            />
            <Badge variant="outline">{contribution.type}</Badge>
          </div>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatSharedContributionAmount(
            contribution.shared.amountCents,
            contribution.shared.currencyCode,
          )}
        </p>
        {contribution.shared.refundedAmountCents > 0 ? (
          <p className="text-sm text-muted-foreground tabular-nums">
            Refunded{" "}
            {formatSharedContributionAmount(
              contribution.shared.refundedAmountCents,
              contribution.shared.currencyCode,
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ContributionDetailsGrid({
  formatDate,
  contribution,
  designations,
  crmPostStateHasSignal,
}: {
  formatDate: ReturnType<typeof useLocaleFormat>["formatDate"];
  contribution: Contribution;
  designations: ContributionDetailSheetProps["designations"];
  crmPostStateHasSignal: boolean;
}) {
  return (
    <SheetSection title="Details">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        <DetailField label="Date">
          {formatDate(contribution.date, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </DetailField>

        <DetailField label="Payment method">
          {formatPaymentMethod(contribution.paymentMethod)}
        </DetailField>

        <DetailField label="Source">{contribution.source}</DetailField>

        {!designations && (
          // `fundCode` carries the fund's UUID in live data; the name is the
          // staff-facing identity, so no internal id renders under it.
          <DetailField label="Fund">{contribution.fundName}</DetailField>
        )}

        <DetailField label="Receipt">
          <ContributionReceiptStatus
            status={contribution.shared.receiptStatus}
          />
        </DetailField>

        {contribution.stagedGiftStatus && (
          <DetailField label="Import review">
            <span className="flex items-center gap-2">
              <StatusDot
                className={stagedGiftDotColor(contribution.stagedGiftStatus)}
              />
              {STAGED_GIFT_STATUS_LABELS[contribution.stagedGiftStatus] ??
                contribution.stagedGiftStatus}
            </span>
          </DetailField>
        )}

        {contribution.crmPostStatus && !crmPostStateHasSignal && (
          <DetailField label="CRM post status">
            {SHARED_CRM_POST_STATUS_LABELS[contribution.crmPostStatus] ??
              contribution.crmPostStatus}
          </DetailField>
        )}

        {contribution.missionaryName && (
          <DetailField label="Missionary">
            {contribution.missionaryName}
          </DetailField>
        )}

        <DetailField label="Transaction ID" mono wide>
          {contribution.transactionId ?? "Unavailable"}
        </DetailField>
      </dl>
    </SheetSection>
  );
}

function ContributionDesignationsSection({
  designations,
}: {
  designations: ContributionDetailSheetProps["designations"];
}) {
  return (
    designations && (
      <SheetSection title="Designations">
        {!designations.reconcilesToGiftAmount && (
          <Alert>
            <TriangleAlert aria-hidden="true" />
            <AlertDescription>
              Designation lines do not reconcile to the gift amount. Review the
              designation set before relying on these allocations.
            </AlertDescription>
          </Alert>
        )}
        <ul className="flex flex-col divide-y rounded-lg border">
          {designations.lines.map((line) => {
            const hasContext = designationLineHasContext(line);
            const lineSummary = (
              <>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {line.fundName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {FUND_TYPE_LABELS[line.fundType]}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium text-foreground tabular-nums">
                  {formatSharedContributionAmount(
                    line.amountCents,
                    line.currencyCode,
                  )}
                </span>
              </>
            );

            // Only lines with context to reveal are disclosures; a line with
            // nothing to expand is a plain row, so keyboard and screen-reader
            // users never meet a toggle that opens nothing.
            return (
              <li key={line.id}>
                {hasContext ? (
                  // Top-aligned with the chevron nudged to the fund name's
                  // line, so every row reads name, amount, chevron on line 1.
                  <DetailDisclosure
                    triggerClassName="items-start gap-3 px-3 py-2.5 [&>svg]:mt-0.5"
                    trigger={lineSummary}
                  >
                    <div className="flex flex-col gap-1 border-t bg-muted/30 px-3 py-2.5">
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
                  </DetailDisclosure>
                ) : (
                  // Same row geometry as a summary, with the chevron's width
                  // kept so amounts stay aligned down the list.
                  <div className="flex items-start gap-3 px-3 py-2.5">
                    {lineSummary}
                    <span aria-hidden="true" className="size-4 shrink-0" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {hasMixedLineContext(designations.lines) ? (
          <p className="text-xs text-muted-foreground">
            Lines with an arrow open who they support and any donor memo or
            restriction.
          </p>
        ) : null}
      </SheetSection>
    )
  );
}

function designationLineHasContext(line: {
  memo: string | null;
  restriction: string | null;
  missionaryName: string | null;
}) {
  return Boolean(line.memo || line.restriction || line.missionaryName);
}

/** Only some lines open, so an arrow on one row and not the next needs a word. */
function hasMixedLineContext(
  lines: Parameters<typeof designationLineHasContext>[0][],
) {
  const withContext = lines.filter(designationLineHasContext).length;
  return withContext > 0 && withContext < lines.length;
}

function ContributionCrmPostingSection({
  crmPostState,
  crmPostStateHasSignal,
  canRetryCrmScope,
  parentRetryScope,
  parentRetryActionPending,
  isActionPending,
  stagedGiftId,
  onRetryCrmPost,
  contribution,
  designations,
  pendingActionMatches,
  designationRetryGuidanceShownInNote,
  retiredCrmEntries,
}: {
  crmPostState: ContributionDetailSheetProps["crmPostState"];
  crmPostStateHasSignal: boolean;
  canRetryCrmScope: boolean;
  parentRetryScope: CrmPostFailedScope | null;
  parentRetryActionPending: boolean;
  isActionPending: boolean;
  stagedGiftId: Contribution["stagedGiftId"];
  onRetryCrmPost: ContributionDetailSheetProps["onRetryCrmPost"];
  contribution: Contribution;
  designations: ContributionDetailSheetProps["designations"];
  pendingActionMatches: (
    actionType: ContributionDetailPendingAction["actionType"],
    scope?: CrmPostFailedScope,
  ) => boolean;
  designationRetryGuidanceShownInNote: boolean;
  retiredCrmEntries: ContributionActionAvailability[];
}) {
  return (
    crmPostState &&
    crmPostStateHasSignal && (
      <SheetSection title="Historical CRM posting">
        {/* One quiet note for the whole history: why posting is retired
            and any limit of the old record, never a second callout. */}
        <RetiredCrmPostingNote
          entries={retiredCrmEntries}
          limitation={crmPostState.adapterLimitation}
        />
        <ul className="flex flex-col divide-y rounded-lg border">
          <li className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground">
                  Parent gift record
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-foreground">
                <StatusDot
                  className={crmPostStatusDotColor(crmPostState.parent.status)}
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
                focusableWhenDisabled={parentRetryActionPending}
                variant="outline"
                size="sm"
                disabled={isActionPending}
                tabIndex={workflowActionTabIndex(
                  isActionPending,
                  parentRetryActionPending,
                )}
                className="self-start"
                onClick={() =>
                  stagedGiftId &&
                  onRetryCrmPost?.(
                    parentRetryScope,
                    stagedGiftId,
                    contribution.id,
                  )
                }
              >
                <RefreshCcw aria-hidden="true" />
                Retry parent record
              </Button>
            )}
          </li>
          {crmPostState.designationRecords.map((record, index) => {
            const allocationId = record.allocationId;
            const lineLabel = crmDesignationRecordLabel(
              allocationId,
              designations,
            );
            const retryScope = crmPostState.failedScopes.find(
              (scope) =>
                scope.scope === "designation" &&
                scope.allocationId === allocationId,
            );
            const lineRetryActionPending = retryScope
              ? pendingActionMatches("retry_staged_gift", retryScope)
              : false;

            return (
              <li
                key={allocationId ?? `designation-record-${index}`}
                className="flex flex-col gap-2 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {lineLabel}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-foreground">
                    <StatusDot
                      className={crmPostStatusDotColor(record.status)}
                    />
                    {crmPostStatusLabel(record.status)}
                  </span>
                </div>
                {isCrmPostFailure(record.status) && record.lastError && (
                  <p className="text-xs text-destructive">{record.lastError}</p>
                )}
                {retryScope &&
                  !designationRetryGuidanceShownInNote &&
                  !isContributionRouteCrmRetryScopeSupported("designation") && (
                    <div role="note" className="flex flex-col gap-1">
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
                  isContributionRouteCrmRetryScopeSupported("designation") && (
                    <Button
                      focusableWhenDisabled={lineRetryActionPending}
                      variant="outline"
                      size="sm"
                      disabled={isActionPending}
                      tabIndex={workflowActionTabIndex(
                        isActionPending,
                        lineRetryActionPending,
                      )}
                      className="self-start"
                      onClick={() =>
                        stagedGiftId &&
                        onRetryCrmPost?.(
                          { scope: "designation", allocationId },
                          stagedGiftId,
                          contribution.id,
                        )
                      }
                    >
                      <RefreshCcw aria-hidden="true" />
                      Retry this line
                    </Button>
                  )}
              </li>
            );
          })}
        </ul>
        <CrmRecordIdsDisclosure
          crmPostState={crmPostState}
          designations={designations}
        />
      </SheetSection>
    )
  );
}

/** A designation's fund name, else its allocation id, for posting history. */
function crmDesignationRecordLabel(
  allocationId: string | null,
  designations: ContributionDetailSheetProps["designations"],
) {
  const line = allocationId
    ? designations?.lines.find((candidate) => candidate.id === allocationId)
    : undefined;
  return (
    line?.fundName ??
    (allocationId ? `Designation ${allocationId}` : "Designation line")
  );
}

/**
 * Retired CRM record IDs are audit detail, not something staff act on: one
 * folded list (still reachable by find-in-page) with a copy button per ID.
 */
function CrmRecordIdsDisclosure({
  crmPostState,
  designations,
}: {
  crmPostState: NonNullable<ContributionDetailSheetProps["crmPostState"]>;
  designations: ContributionDetailSheetProps["designations"];
}) {
  const records = [
    {
      key: "parent",
      label: "Parent gift record",
      copyName: "parent gift",
      recordId: crmPostState.parent.twentyRecordId,
    },
    ...crmPostState.designationRecords.map((record, index) => {
      const label = crmDesignationRecordLabel(
        record.allocationId,
        designations,
      );
      return {
        key: record.allocationId ?? `designation-record-${index}`,
        label,
        copyName: label,
        recordId: record.twentyRecordId,
      };
    }),
  ].filter(
    (record): record is typeof record & { recordId: string } =>
      typeof record.recordId === "string" && record.recordId.length > 0,
  );

  if (records.length === 0) {
    return null;
  }

  const copyRecordId = async (recordId: string) => {
    try {
      await navigator.clipboard.writeText(recordId);
      toast.success("Record ID copied");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <DetailDisclosure
      framed
      triggerClassName="gap-2 px-3 py-2 text-xs text-muted-foreground"
      trigger={<span className="min-w-0 flex-1">Historical record IDs</span>}
    >
      <dl className="flex flex-col gap-2 border-t p-3 text-xs">
        {records.map((record) => (
          <div key={record.key} className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">{record.label}</dt>
            <dd className="flex min-w-0 items-center gap-1">
              <span className="truncate font-mono text-foreground">
                {record.recordId}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Copy ${record.copyName} record ID`}
                onClick={() => void copyRecordId(record.recordId)}
              >
                <Copy aria-hidden="true" />
              </Button>
            </dd>
          </div>
        ))}
      </dl>
    </DetailDisclosure>
  );
}

function ContributionNotesSection({
  contribution,
}: {
  contribution: Contribution;
}) {
  return (
    <>
      {contribution.notes && (
        <SheetSection title="Notes">
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-foreground">
            {contribution.notes}
          </p>
        </SheetSection>
      )}

      {contribution.stagedGiftReviewReason && (
        <SheetSection title="Review reason">
          <Alert>
            <Info aria-hidden="true" />
            <AlertDescription>
              {reviewReasonLabel(contribution.stagedGiftReviewReason)}
            </AlertDescription>
          </Alert>
        </SheetSection>
      )}
    </>
  );
}

/**
 * Groups blocked-action reasons that say the same thing (for example both
 * retired CRM posting actions), so staff read each reason once.
 */
function groupBlockedEntries(entries: ContributionActionAvailability[]) {
  const groups = new Map<
    string,
    { names: string[]; reason: string; nextStep: string | null }
  >();
  for (const entry of entries) {
    const key = `${entry.blockedReason}\u0000${entry.nextStep ?? ""}`;
    const existing = groups.get(key);
    const name = contributionActionName(entry.actionType);
    if (existing) {
      existing.names.push(name);
    } else {
      groups.set(key, {
        names: [name],
        reason: entry.blockedReason ?? "",
        nextStep: entry.nextStep ?? null,
      });
    }
  }
  return [...groups.entries()].map(([key, group]) => ({ key, ...group }));
}

/**
 * One disclosure for the sheet, on the shared Base UI Collapsible: a real
 * button that reports aria-expanded, a chevron that turns when open, and a
 * panel kept in the page (hidden until found) so find-in-page still reaches
 * the folded detail.
 */
function DetailDisclosure({
  trigger,
  framed = false,
  triggerClassName,
  children,
}: {
  trigger: ReactNode;
  /** Draws the bordered panel used for standalone disclosures. */
  framed?: boolean;
  triggerClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={framed ? "rounded-lg border" : undefined}>
      <Collapsible>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer items-center rounded-lg text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                triggerClassName,
              )}
            >
              {trigger}
              <ChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform in-data-panel-open:rotate-90"
              />
            </button>
          }
        />
        <CollapsibleContent hiddenUntilFound>{children}</CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Why CRM approval and posting retry never render: one collapsed line, with
 * the affected actions, the reason and the next step one click away.
 */
function RetiredCrmPostingNote({
  entries,
  limitation = null,
}: {
  entries: ContributionActionAvailability[];
  /** A known limit of the historical record (e.g. no per-line records). */
  limitation?: string | null;
}) {
  const groups = groupBlockedEntries(entries);
  if (groups.length === 0 && !limitation) {
    return null;
  }
  return (
    <div data-slot="crm-history-note">
      <DetailDisclosure
        framed
        triggerClassName="gap-2 px-3 py-2 text-xs text-muted-foreground"
        trigger={
          <>
            <Info aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1">
              CRM posting is retired; posting state is shown for history only.
            </span>
          </>
        }
      >
        <ul className="flex flex-col gap-3 border-t p-3">
          {groups.map((group) => (
            <li key={group.key} className="flex flex-col gap-1 text-xs">
              <p className="font-medium text-foreground">
                {group.names.join(" · ")}
              </p>
              <p className="text-muted-foreground">{group.reason}</p>
              {group.nextStep ? (
                <p className="text-muted-foreground">{group.nextStep}</p>
              ) : null}
            </li>
          ))}
          {limitation ? (
            <li className="flex flex-col gap-1 text-xs">
              <p className="font-medium text-foreground">About this record</p>
              <p className="text-muted-foreground">{limitation}</p>
            </li>
          ) : null}
        </ul>
      </DetailDisclosure>
    </div>
  );
}

function ContributionActionsSection({
  missingStagedGiftWorkflow,
  handleCopyTxn,
  canSendReceipt,
  receiptActionPending,
  stagedGiftId,
  isActionPending,
  onSendReceipt,
  contribution,
  canApproveGift,
  approveActionPending,
  onApproveStagedGift,
  canRetryGift,
  stagedRetryActionPending,
  onRetryStagedGift,
  showRefundAction,
  canRefund,
  onRefund,
  visibleBlockedEntries,
  retiredCrmEntries,
}: {
  missingStagedGiftWorkflow: boolean;
  handleCopyTxn: () => Promise<void>;
  canSendReceipt: boolean;
  receiptActionPending: boolean;
  stagedGiftId: Contribution["stagedGiftId"];
  isActionPending: boolean;
  onSendReceipt: ContributionDetailSheetProps["onSendReceipt"];
  contribution: Contribution;
  canApproveGift: boolean | string | null | undefined;
  approveActionPending: boolean;
  onApproveStagedGift: ContributionDetailSheetProps["onApproveStagedGift"];
  canRetryGift: boolean;
  stagedRetryActionPending: boolean;
  onRetryStagedGift: ContributionDetailSheetProps["onRetryStagedGift"];
  showRefundAction: boolean;
  canRefund: boolean;
  onRefund: ContributionDetailSheetProps["onRefund"];
  visibleBlockedEntries: ContributionActionAvailability[];
  retiredCrmEntries: ContributionActionAvailability[];
}) {
  const blockedGroups = groupBlockedEntries(visibleBlockedEntries);

  return (
    <SheetSection title="Actions">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyTxn}>
          <Copy aria-hidden="true" />
          {contribution.transactionId ? "Copy transaction ID" : "Copy gift ID"}
        </Button>
        {canSendReceipt && (
          <ReceiptAction
            alreadySent={contribution.receiptSent}
            disabled={!stagedGiftId || isActionPending}
            isActionPending={isActionPending}
            receiptActionPending={receiptActionPending}
            onSend={() =>
              stagedGiftId && onSendReceipt?.(stagedGiftId, contribution.id)
            }
          />
        )}
        {canApproveGift && (
          <Button
            focusableWhenDisabled={approveActionPending}
            variant="outline"
            disabled={isActionPending}
            tabIndex={workflowActionTabIndex(
              isActionPending,
              approveActionPending,
            )}
            onClick={() =>
              stagedGiftId &&
              onApproveStagedGift?.(stagedGiftId, contribution.id)
            }
          >
            <CheckCircle2 aria-hidden="true" />
            Approve and post
          </Button>
        )}
        {canRetryGift && (
          <Button
            focusableWhenDisabled={stagedRetryActionPending}
            variant="outline"
            disabled={isActionPending}
            tabIndex={workflowActionTabIndex(
              isActionPending,
              stagedRetryActionPending,
            )}
            onClick={() =>
              stagedGiftId && onRetryStagedGift?.(stagedGiftId, contribution.id)
            }
          >
            <RefreshCcw aria-hidden="true" />
            Retry posting
          </Button>
        )}
        {showRefundAction && (
          <Button
            variant="outline"
            disabled={!canRefund || isActionPending}
            tabIndex={isActionPending ? -1 : undefined}
            onClick={() => onRefund?.(contribution.id)}
          >
            <Undo2 aria-hidden="true" />
            Refund gift
          </Button>
        )}
      </div>

      {missingStagedGiftWorkflow && (
        <div
          role="note"
          className="flex gap-2 rounded-lg border bg-muted/30 p-3"
        >
          <Info
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">
              This gift has no staged gift workflow record, so finance workflow
              actions are unavailable.
            </p>
            <p className="text-xs text-muted-foreground">
              The donation is valid and shown read-only. Import or create a
              staged gift to run finance workflow actions for it.
            </p>
          </div>
        </div>
      )}

      {blockedGroups.length > 0 && (
        <ul className="flex flex-col gap-2">
          {blockedGroups.map((group) => (
            <li
              key={group.key}
              className="flex gap-2 rounded-lg border bg-muted/30 p-3"
            >
              <Info
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              <div className="flex min-w-0 flex-col gap-1 text-xs">
                <p className="font-medium text-foreground">
                  {group.names.join(" · ")}
                </p>
                <p className="text-muted-foreground">{group.reason}</p>
                {group.nextStep ? (
                  <p className="text-muted-foreground">{group.nextStep}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <RetiredCrmPostingNote entries={retiredCrmEntries} />
    </SheetSection>
  );
}

/**
 * The gift's receipt action. A first send goes straight out; once a receipt
 * was sent the action reads "Resend receipt" and asks before sending the
 * donor a second copy, as the Hub's batch send does.
 */
function ReceiptAction({
  alreadySent,
  disabled,
  isActionPending,
  receiptActionPending,
  onSend,
}: {
  alreadySent: boolean;
  disabled: boolean;
  isActionPending: boolean;
  receiptActionPending: boolean;
  onSend: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const label = alreadySent ? "Resend receipt" : "Send receipt";

  return (
    <>
      <Button
        focusableWhenDisabled={receiptActionPending}
        variant="outline"
        size="sm"
        disabled={disabled}
        tabIndex={workflowActionTabIndex(isActionPending, receiptActionPending)}
        onClick={() => (alreadySent ? setConfirmOpen(true) : onSend())}
      >
        <Receipt aria-hidden="true" />
        {label}
      </Button>
      {alreadySent ? (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resend receipt?</AlertDialogTitle>
              <AlertDialogDescription>
                A receipt was already sent for this gift. The donor will get
                another copy.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={disabled} onClick={onSend}>
                Resend receipt
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}

function ContributionCorrectionSection({
  correctionRequests,
  receiptDelivery,
  onDecided,
}: {
  correctionRequests: ContributionDetailSheetProps["correctionRequests"];
  receiptDelivery: ContributionDetailSheetProps["receiptDelivery"];
  onDecided: ContributionDetailSheetProps["onDecided"];
}) {
  return (
    correctionRequests &&
    correctionRequests.length > 0 && (
      <CorrectionApprovalPanel
        correctionRequests={correctionRequests}
        receiptDelivery={receiptDelivery}
        onDecided={onDecided}
      />
    )
  );
}

function ContributionRecurringSection({
  recurring,
  showRecurringSection,
  isOneTimeGiftWithAgreement,
  formatDate,
}: {
  recurring: ContributionDetailSheetProps["recurring"];
  showRecurringSection: boolean;
  isOneTimeGiftWithAgreement: boolean;
  formatDate: ReturnType<typeof useLocaleFormat>["formatDate"];
}) {
  return (
    recurring &&
    showRecurringSection && (
      <SheetSection title="Recurring giving">
        {isOneTimeGiftWithAgreement && (
          <p className="text-sm text-muted-foreground">
            This gift is linked to a recurring agreement.
          </p>
        )}
        {recurring.providerRecurrenceWithoutAgreement && (
          <Alert>
            <TriangleAlert aria-hidden="true" />
            <AlertDescription>
              The payment provider reports this gift as recurring, but no
              internal recurring agreement is linked. Review and link the
              recurring agreement to close this reconciliation gap.
            </AlertDescription>
          </Alert>
        )}
        {recurring.agreement && (
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <p className="text-sm font-medium text-foreground tabular-nums">
              {formatSharedContributionAmount(
                recurring.agreement.amountCents,
                recurring.agreement.currencyCode,
              )}{" "}
              {recurring.agreement.frequency ?? "· frequency not recorded"}
            </p>
            <p className="text-xs text-muted-foreground">
              {[
                recurring.agreement.fundName,
                recurring.agreement.missionaryName,
                agreementStatusLabel(recurring.agreement.status),
              ]
                .filter(Boolean)
                .join(" · ")}
              {recurring.agreement.nextExpectedGiftAt
                ? ` · Next expected ${formatDate(
                    recurring.agreement.nextExpectedGiftAt,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}`
                : null}
            </p>
            <p className="text-xs text-muted-foreground">
              Gifts under this agreement: {recurring.agreement.linkedGiftCount}
              {recurring.agreement.lastLinkedGiftAt
                ? ` · Last gift ${formatDate(
                    recurring.agreement.lastLinkedGiftAt,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}`
                : null}
            </p>
            {recurring.agreement.stripeSubscriptionId && (
              <p className="font-mono text-xs break-all text-muted-foreground">
                Subscription reference:{" "}
                {recurring.agreement.stripeSubscriptionId}
              </p>
            )}
          </div>
        )}
      </SheetSection>
    )
  );
}

function ContributionProviderSection({
  providerProof,
}: {
  providerProof: ContributionDetailSheetProps["providerProof"];
}) {
  return (
    providerProof && (
      <section className="border-t pt-6">
        <DetailDisclosure
          framed
          triggerClassName="gap-2 px-3 py-2.5 text-sm font-medium text-foreground"
          trigger={<span className="min-w-0 flex-1">Provider proof</span>}
        >
          <div className="flex flex-col gap-3 border-t p-3">
            <dl className="flex flex-col gap-3">
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
            </dl>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {providerProof.dashboardUrls.paymentIntent && (
                <a
                  href={providerProof.dashboardUrls.paymentIntent}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2"
                >
                  Open payment in Stripe
                  <span className="sr-only"> (opens in a new tab)</span>
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              )}
              {providerProof.dashboardUrls.charge && (
                <a
                  href={providerProof.dashboardUrls.charge}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2"
                >
                  Open charge in Stripe
                  <span className="sr-only"> (opens in a new tab)</span>
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              )}
            </div>
          </div>
        </DetailDisclosure>
      </section>
    )
  );
}

function ContributionMetadataSection({
  formatDateTime,
  contribution,
}: {
  formatDateTime: ReturnType<typeof useLocaleFormat>["formatDateTime"];
  contribution: Contribution;
}) {
  return (
    <div className="flex flex-col gap-1 border-t pt-4 text-xs text-muted-foreground">
      <p>
        Created{" "}
        {formatDateTime(contribution.createdAt, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>
      {contribution.updatedAt !== contribution.createdAt && (
        <p>
          Updated{" "}
          {formatDateTime(contribution.updatedAt, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}

function getContributionDetailWorkflow(
  contribution: Contribution,
  {
    actionAvailability,
    crmPostState,
    onRefund,
    onRetryCrmPost,
    recurring,
    pendingAction,
  }: Pick<
    ContributionDetailSheetProps,
    | "actionAvailability"
    | "crmPostState"
    | "onRefund"
    | "onRetryCrmPost"
    | "recurring"
    | "pendingAction"
  >,
) {
  const stagedGiftId = contribution.stagedGiftId;
  const availabilityByAction = actionAvailability
    ? new Map(actionAvailability.map((entry) => [entry.actionType, entry]))
    : null;
  const crmPostingSupported = isContributionCrmPostingSupported();
  const rawApproveEntry =
    availabilityByAction?.get("approve_staged_gift") ?? null;
  const rawRetryEntry = availabilityByAction?.get("retry_staged_gift") ?? null;
  const approveEntry =
    rawApproveEntry && !crmPostingSupported
      ? {
          ...rawApproveEntry,
          available: false,
          blockedReason: CRM_POSTING_UNAVAILABLE_REASON,
          nextStep: CRM_POSTING_UNAVAILABLE_NEXT_STEP,
        }
      : rawApproveEntry;
  const retryEntry =
    rawRetryEntry && !crmPostingSupported
      ? {
          ...rawRetryEntry,
          available: false,
          blockedReason: CRM_POSTING_UNAVAILABLE_REASON,
          nextStep: CRM_POSTING_UNAVAILABLE_NEXT_STEP,
        }
      : rawRetryEntry;
  const receiptEntry = availabilityByAction?.get("resend_receipt") ?? null;
  // The retired-CRM note already states the designation retry guidance, so
  // per-line copies in Historical CRM posting are suppressed.
  const designationRetryGuidanceShownInNote = Boolean(
    retryEntry &&
    !retryEntry.available &&
    retryEntry.blockedReason === CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
  );
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
  const shownWorkflowEntries = missingStagedGiftWorkflow
    ? []
    : blockedWorkflowEntries;
  // Approve and retry never render while CRM posting is retired; their
  // shared reason is background, so it folds into a one-line note instead
  // of leading the Actions list. Reasons for actions staff can see (receipt,
  // refund) stay inline.
  const retiredCrmEntries = shownWorkflowEntries.filter(isRetiredCrmEntry);
  const visibleBlockedEntries = [
    ...shownWorkflowEntries.filter((entry) => !isRetiredCrmEntry(entry)),
    ...(refundBlockedEntry?.blockedReason ? [refundBlockedEntry] : []),
  ];

  const canApproveGift = availabilityByAction
    ? Boolean(crmPostingSupported && stagedGiftId && approveEntry?.available)
    : stagedGiftId &&
      crmPostingSupported &&
      (contribution.stagedGiftStatus === "received" ||
        contribution.stagedGiftStatus === "needs_review");
  const parentRetryScope =
    crmPostState?.failedScopes.find((scope) => scope.scope === "parent") ??
    null;
  const hasExecutableCrmRetryState =
    contribution.stagedGiftStatus === "failed" ||
    contribution.stagedGiftStatus === "ready_to_post";
  const hasRetryableStagedGiftState =
    contribution.stagedGiftStatus === "failed" ||
    (contribution.stagedGiftStatus === "ready_to_post" &&
      (contribution.crmPostStatus === "failed" ||
        contribution.crmPostStatus === "blocked"));
  const hasLegacyCrmRetryState =
    !crmPostState &&
    hasExecutableCrmRetryState &&
    (contribution.crmPostStatus === "failed" ||
      contribution.crmPostStatus === "blocked");
  const hasRetryableParentTarget = Boolean(
    hasRetryableStagedGiftState ||
    (hasExecutableCrmRetryState && parentRetryScope) ||
    hasLegacyCrmRetryState,
  );
  const canRetryGift = Boolean(
    crmPostingSupported &&
    stagedGiftId &&
    hasRetryableParentTarget &&
    (availabilityByAction ? retryEntry?.available : true),
  );
  const canSendReceipt = availabilityByAction
    ? Boolean(stagedGiftId && receiptEntry?.available)
    : !contribution.receiptSent;
  const canRetryCrmScope = Boolean(
    crmPostingSupported &&
    stagedGiftId &&
    hasExecutableCrmRetryState &&
    retryEntry?.available &&
    onRetryCrmPost,
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
  const pendingActionMatches = (
    actionType: ContributionDetailPendingAction["actionType"],
    scope?: CrmPostFailedScope,
  ) => {
    if (
      !pendingAction ||
      pendingAction.actionType !== actionType ||
      pendingAction.contributionId !== contribution.id ||
      pendingAction.stagedGiftId !== stagedGiftId
    ) {
      return false;
    }
    if (pendingAction.actionType !== "retry_staged_gift") {
      return true;
    }
    return crmRetryScopeMatches(pendingAction.scope, scope);
  };
  const receiptActionPending = pendingActionMatches("resend_receipt");
  const approveActionPending = pendingActionMatches("approve_staged_gift");
  const stagedRetryActionPending = pendingActionMatches("retry_staged_gift");
  const parentRetryActionPending = parentRetryScope
    ? pendingActionMatches("retry_staged_gift", parentRetryScope)
    : false;

  // Recurring context renders whenever the gift is recurring OR has an
  // internal agreement link — a one-time gift inside a recurring series
  // still shows its agreement context (ADR-CD-007).
  const hasAgreementLink = Boolean(recurring?.pledgeId || recurring?.agreement);
  const showRecurringSection = Boolean(
    recurring?.isRecurring || hasAgreementLink,
  );
  const isOneTimeGiftWithAgreement = Boolean(
    recurring && !recurring.isRecurring && hasAgreementLink,
  );

  return {
    crmPostStateHasSignal,
    canRetryCrmScope,
    parentRetryScope,
    parentRetryActionPending,
    pendingActionMatches,
    designationRetryGuidanceShownInNote,
    missingStagedGiftWorkflow,
    canSendReceipt,
    receiptActionPending,
    canApproveGift,
    approveActionPending,
    canRetryGift,
    stagedRetryActionPending,
    showRefundAction,
    canRefund,
    visibleBlockedEntries,
    retiredCrmEntries,
    showRecurringSection,
    isOneTimeGiftWithAgreement,
  };
}

function isRetiredCrmEntry(entry: ContributionActionAvailability): boolean {
  return (
    (entry.actionType === "approve_staged_gift" ||
      entry.actionType === "retry_staged_gift") &&
    entry.blockedReason === CRM_POSTING_UNAVAILABLE_REASON
  );
}

function workflowActionTabIndex(
  isActionPending: boolean,
  isInitiator: boolean,
) {
  return isActionPending && !isInitiator ? -1 : undefined;
}
