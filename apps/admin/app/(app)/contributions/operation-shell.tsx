"use client";

// Import values from pure submodules, not the package barrel: the barrel
// re-exports server-only modules (Stripe refunds, Supabase access) that must
// not be evaluated in this client component's bundle.
import {
  OPERATION_CATEGORY_LABELS,
  OPERATION_DEFINITIONS,
  type OperationCategory,
  type OperationDefinition,
  type OperationFieldValues,
  type SupportedOperationActionType,
} from "@asym/api/admin/contribution-operations/catalog";
import {
  CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP,
  CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
  isContributionRouteCrmRetryScopeSupported,
} from "@asym/api/admin/contribution-operations/crm-retry-support";
import { isFailedProviderOutcomeStatus } from "@asym/api/admin/contribution-operations/types";
import { formatSharedContributionAmount } from "@asym/api/admin/contribution-shared";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  CircleCheck,
  CircleX,
  Clock3,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { useId, useMemo, useState } from "react";

import {
  invalidateContributionOperationQueries,
  isContributionGiftParam,
  useContributionDetail,
} from "./contribution-detail-overlay";
import {
  receiptDeliveryChoiceLabel,
  ReceiptDeliveryChoiceField,
  receiptSnapshotPdfUrl,
  resolveInitialReceiptDeliveryValue,
  resolveReceiptDeliveryError,
  type ContributionReceiptDeliveryContext,
  type ReceiptDeliveryProposal,
  type ReceiptDeliveryValue,
} from "./receipt-delivery-choice";

// Type-only imports are erased at compile time, so pulling this one type
// from the barrel does not evaluate its server-only modules in the client
// bundle (matches contribution-detail-overlay.tsx).
import type { CrmPostFailedScope } from "@asym/api/admin/contribution-operations";
import type {
  ContributionActionResult,
  ContributionActionType,
  ContributionSourceSurface,
  ReceiptDeliveryOutcome,
} from "@asym/api/admin/contribution-operations/types";

/**
 * Reusable inline contribution operation shell (ADR-CD-033).
 *
 * The shell owns the shared behavior — server-computed blocked states,
 * current effective values, downstream-effect framing, required reason and
 * confirmation, submit/loading/error state, the in-place result panel, row
 * refresh, and focus return. Each operation only supplies its specific
 * fields, copy, and payload. Submissions always go through the same shared
 * contribution operation contract as contribution detail.
 */

export { OPERATION_CATEGORY_LABELS, OPERATION_DEFINITIONS };
export type {
  OperationCategory,
  OperationDefinition,
  OperationFieldValues,
  SupportedOperationActionType,
};

type ShellPhase =
  | { name: "form" }
  | { name: "submitting" }
  | {
      name: "success";
      result: ContributionActionResult;
      /** The delivery selection submitted with this operation, if any. */
      submittedReceiptDelivery: ReceiptDeliveryProposal | null;
      refreshFailed: boolean;
    }
  | { name: "failure"; message: string; staleSave: boolean };

class ContributionOperationRequestError extends Error {
  constructor(
    message: string,
    readonly status: number | undefined,
  ) {
    super(message);
    this.name = "ContributionOperationRequestError";
  }
}

function retryPayloadForScope(
  scope: CrmPostFailedScope | null,
): Record<string, unknown> {
  if (scope?.scope === "designation" && scope.allocationId?.trim()) {
    return {
      scope: "designation",
      allocationId: scope.allocationId,
    };
  }

  return { scope: "parent" };
}

function retryTargetBlock(
  failedScopes: CrmPostFailedScope[],
): { reason: string; nextStep: string } | null {
  const executableScopes = failedScopes.filter((scope) =>
    isContributionRouteCrmRetryScopeSupported(scope.scope),
  );
  if (executableScopes.length === 1) {
    return null;
  }

  if (failedScopes.length > 1) {
    return {
      reason:
        "More than one CRM posting failed, so this inline action cannot safely choose a retry target.",
      nextStep:
        "Open full contribution detail to retry one failed record at a time.",
    };
  }

  const [scope] = failedScopes;
  if (scope?.scope === "designation" && !scope.allocationId?.trim()) {
    return {
      reason:
        "The failed designation cannot be targeted safely because its allocation identity is missing.",
      nextStep:
        "Open full contribution detail to review the CRM posting state before retrying.",
    };
  }

  if (
    scope?.scope === "designation" &&
    !isContributionRouteCrmRetryScopeSupported(scope.scope)
  ) {
    return {
      reason: CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
      nextStep: CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP,
    };
  }

  return null;
}

async function submitOperation(input: {
  actionType: ContributionActionType;
  contributionId: string;
  stagedGiftId: string | null;
  sourceSurface: ContributionSourceSurface;
  reason: string | null;
  confirmationToken: string | null;
  expectedRevision: string | null;
  idempotencyKey: string;
  payload: Record<string, unknown>;
}): Promise<ContributionActionResult> {
  const response = await fetch("/api/admin/contribution-operations/actions", {
    body: JSON.stringify({
      actionType: input.actionType,
      contributionId: input.contributionId,
      stagedGiftId: input.stagedGiftId,
      sourceSurface: input.sourceSurface,
      reason: input.reason,
      confirmationToken: input.confirmationToken,
      expectedRevision: input.expectedRevision,
      idempotencyKey: input.idempotencyKey,
      payload: input.payload,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  const body = (await response.json().catch(() => null)) as {
    result?: ContributionActionResult;
    error?: string;
  } | null;

  if (!response.ok || !body?.result) {
    throw new ContributionOperationRequestError(
      body?.error ?? "The operation failed.",
      response.status,
    );
  }

  return body.result;
}

/**
 * Receipt-outcome lines for the in-place result panel (AL-263): status,
 * requested vs confirmed delivery when the approver changed it, the defer
 * reason, and a download link for generated updated-receipt PDFs.
 */
function ReceiptOutcomeResultItems({
  outcome,
}: {
  outcome: ReceiptDeliveryOutcome;
}) {
  const requested = outcome.requested ?? null;
  const confirmed = outcome.confirmed ?? null;
  const changedByApprover =
    requested !== null &&
    confirmed !== null &&
    (requested.choice !== confirmed.choice ||
      (requested.deferReason ?? null) !== (confirmed.deferReason ?? null));
  const deferReason =
    outcome.status === "deferred"
      ? (confirmed?.deferReason ?? outcome.reason)
      : null;

  return (
    <>
      <li>Receipt: {outcome.status.replace(/_/g, " ")}</li>
      {changedByApprover && requested && confirmed && (
        <li>
          Requested: {receiptDeliveryChoiceLabel(requested.choice)} · Confirmed:{" "}
          {receiptDeliveryChoiceLabel(confirmed.choice)}
        </li>
      )}
      {deferReason && <li>Defer reason: {deferReason}</li>}
      {outcome.status === "pdf_generated" && outcome.snapshotId && (
        <li>
          <a
            href={receiptSnapshotPdfUrl(outcome.snapshotId)}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Download updated receipt PDF
          </a>
        </li>
      )}
    </>
  );
}

export function ContributionOperationShell({
  open,
  onClose,
  operation,
  donationId,
  sourceSurface,
  onOpenFullDetail,
  onRowRefresh,
}: {
  open: boolean;
  onClose: () => void;
  operation: OperationDefinition | null;
  donationId: string | null;
  sourceSurface: ContributionSourceSurface;
  /** Optional secondary action — never an automatic redirect (ADR-CD-033). */
  onOpenFullDetail?: (donationId: string) => void;
  onRowRefresh?: () => void | Promise<void>;
}) {
  const queryClient = useQueryClient();
  const detailQuery = useContributionDetail(open ? donationId : null);
  const [phase, setPhase] = useState<ShellPhase>({ name: "form" });
  const [values, setValues] = useState<OperationFieldValues>({
    reason: "",
    confirmed: false,
  });
  const [delivery, setDelivery] = useState<ReceiptDeliveryValue | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [draftRevision, setDraftRevision] = useState<string | null>(null);
  const [amountPrefillKey, setAmountPrefillKey] = useState<string | null>(null);
  const reasonId = useId();
  const amountId = useId();
  const fundId = useId();
  const confirmId = useId();

  const resetDraftState = () => {
    setPhase({ name: "form" });
    setValues({ reason: "", confirmed: false });
    setDelivery(null);
    setIdempotencyKey(crypto.randomUUID());
    setDraftRevision(null);
    // Re-arm the refund amount prefill so a reload after a stale draft
    // repopulates the amount from the refreshed detail.
    setAmountPrefillKey(null);
  };

  // Reset the form whenever a different operation/gift opens. State is
  // adjusted during render (React's documented pattern) so no effect-driven
  // cascading renders are needed.
  const nextOpenKey = open
    ? `${donationId ?? ""}:${operation?.actionType ?? ""}`
    : null;
  if (nextOpenKey !== openKey) {
    setOpenKey(nextOpenKey);
    setAmountPrefillKey(null);
    if (nextOpenKey) {
      resetDraftState();
    }
  }

  const detail = detailQuery.data;
  const detailQueryEnabled = isContributionGiftParam(donationId);
  const detailLoading = detailQueryEnabled && detailQuery.isPending;
  const detailLoadBlock =
    !detail && !detailLoading
      ? {
          reason:
            detailQuery.error instanceof Error
              ? detailQuery.error.message
              : "Current gift detail is unavailable for this row.",
          nextStep: "Close this action, refresh the CRM row, and try again.",
        }
      : null;
  const latestRevision = detail?.revision ?? null;
  const hasBackgroundConflict =
    draftRevision !== null &&
    latestRevision !== null &&
    draftRevision !== latestRevision;
  const needsStaleDraftRecovery =
    hasBackgroundConflict || (phase.name === "failure" && phase.staleSave);
  const captureDraftRevision = () => {
    setDraftRevision((current) => current ?? detail?.revision ?? null);
  };
  // Pin the revision the staffer is acting on as soon as detail is ready.
  // Input-free operations (send receipt, retry) never touch a field, so
  // waiting for the first edit would let a background refetch silently
  // re-point expectedRevision at data the staffer never reviewed. State is
  // adjusted during render (React's documented pattern), guarded so it runs
  // once per draft.
  if (nextOpenKey && latestRevision !== null && draftRevision === null) {
    setDraftRevision(latestRevision);
  }
  const isRefundOperation = operation?.actionType === "refund";
  // The refundable basis is the ORIGINAL charged amount (what the provider
  // charged), matching the server availability payload and the refund
  // adapter (#265). The adjusted effective amount (shared.amountCents) can
  // drift above or below it after amount corrections and must not drive the
  // prefill, the validation cap, or the "Remaining refundable" row.
  const remainingRefundableCents =
    isRefundOperation && detail
      ? Math.max(
          0,
          detail.original.amountCents - detail.shared.refundedAmountCents,
        )
      : null;
  // A refund correction that is still pending provider confirmation means
  // money may already be moving; block a second submission client-side. The
  // server live-charge check remains the authority.
  const hasPendingRefundCorrection =
    isRefundOperation && detail
      ? detail.corrections.some(
          (correction) =>
            correction.correctionType === "refund" &&
            correction.status === "pending",
        )
      : false;
  const pendingRefundMessage = hasPendingRefundCorrection
    ? "A refund is pending provider confirmation."
    : null;

  // Refunds default to the full remaining amount: once detail loads, prefill
  // the amount input a single time per open so staff can lower it for a
  // partial refund without re-typing the common full-refund case.
  if (
    nextOpenKey &&
    remainingRefundableCents !== null &&
    amountPrefillKey !== nextOpenKey
  ) {
    setAmountPrefillKey(nextOpenKey);
    setValues((prev) => ({
      ...prev,
      amountDollars: (remainingRefundableCents / 100).toFixed(2),
    }));
  }

  const availability = useMemo(() => {
    if (!detail || !operation) {
      return null;
    }
    return (
      detail.actionAvailability.find(
        (entry) => entry.actionType === operation.actionType,
      ) ?? null
    );
  }, [detail, operation]);

  if (!operation) {
    return null;
  }

  const failedRetryScopes =
    operation.actionType === "retry_staged_gift"
      ? (detail?.crm.failedScopes ?? [])
      : [];
  const hasIndependentStagedGiftRetry = Boolean(
    detail?.stagedGift?.status === "failed" ||
    (detail?.stagedGift?.status === "ready_to_post" &&
      (detail.stagedGift.crmPostStatus === "failed" ||
        detail.stagedGift.crmPostStatus === "blocked")),
  );
  const retryTargetScopes = hasIndependentStagedGiftRetry
    ? []
    : failedRetryScopes;
  const retryTargetScope =
    retryTargetScopes.find((scope) =>
      isContributionRouteCrmRetryScopeSupported(scope.scope),
    ) ??
    retryTargetScopes[0] ??
    null;
  const postingCapabilityBlock =
    (operation.actionType === "approve_staged_gift" ||
      operation.actionType === "retry_staged_gift") &&
    !isContributionCrmPostingSupported()
      ? {
          reason: CRM_POSTING_UNAVAILABLE_REASON,
          nextStep: CRM_POSTING_UNAVAILABLE_NEXT_STEP,
        }
      : null;
  const operationBlock =
    postingCapabilityBlock ??
    detailLoadBlock ??
    (availability?.available ? retryTargetBlock(retryTargetScopes) : null);
  const blocked =
    !detail ||
    Boolean(operationBlock) ||
    (availability ? !availability.available : true);
  const blockedReason =
    operationBlock?.reason ??
    availability?.blockedReason ??
    "This operation is not available for the current gift.";
  const blockedNextStep =
    operationBlock?.nextStep ??
    availability?.nextStep ??
    "Refresh the gift detail or choose another action.";
  const amountCurrencyCode = detail?.shared.currencyCode ?? "USD";
  const amountError = (() => {
    if (!operation.fields.includes("amount")) {
      return null;
    }
    const parsed = Number.parseFloat(values.amountDollars || "");
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return "Enter a valid amount.";
    }
    if (!isRefundOperation) {
      return null;
    }
    // Refund amounts must resolve to whole cents; the provider contract
    // takes integer cents. Client validation is advisory — the server
    // revalidates against current truth on submit.
    const cents = Math.round(parsed * 100);
    const isWholeCents = Math.abs(parsed * 100 - cents) < 1e-6;
    if (!isWholeCents || cents <= 0) {
      return "Enter a valid amount.";
    }
    if (remainingRefundableCents !== null && cents > remainingRefundableCents) {
      return `Enter an amount up to ${formatSharedContributionAmount(
        remainingRefundableCents,
        amountCurrencyCode,
      )}.`;
    }
    return null;
  })();
  const fundError =
    operation.fields.includes("fundId") && !values.fundId?.trim()
      ? "Enter the destination fund."
      : null;

  // Updated receipt delivery (AL-263): only receipt-affecting operations on
  // gifts with a sent receipt render the choice, and only when the server
  // supplied the delivery context. The server stays the policy authority.
  const receiptDelivery: ContributionReceiptDeliveryContext | null =
    detail &&
    operation.receiptFields.length > 0 &&
    detail.shared.receiptStatus === "sent"
      ? (detail.receiptDelivery ?? null)
      : null;
  const deliveryValue: ReceiptDeliveryValue =
    delivery ??
    (receiptDelivery
      ? resolveInitialReceiptDeliveryValue({ receiptDelivery })
      : { choice: null, deferReason: "" });
  const deliveryError = resolveReceiptDeliveryError({
    receiptDelivery,
    value: deliveryValue,
  });

  const reasonError =
    operation.requiresReason && !values.reason.trim()
      ? "A reason is required for this operation."
      : null;
  const confirmError =
    operation.requiresConfirmation && !values.confirmed
      ? "Confirm the change to continue."
      : null;
  const validationMessage =
    amountError ?? fundError ?? deliveryError ?? reasonError ?? confirmError;

  const refreshAfterOperation = async (
    completedResult: ContributionActionResult,
  ) => {
    const refreshResults = await Promise.allSettled([
      Promise.resolve().then(() =>
        // throwOnError: failed refetches must reject so the stale-data
        // warning below can surface them (default invalidation resolves
        // even when the triggered refetches fail).
        invalidateContributionOperationQueries(queryClient, {
          throwOnError: true,
        }),
      ),
      Promise.resolve().then(() => onRowRefresh?.()),
    ]);
    const refreshErrors = refreshResults.flatMap((refreshResult) =>
      refreshResult.status === "rejected" ? [refreshResult.reason] : [],
    );
    if (refreshErrors.length === 0) {
      return;
    }

    console.error(
      "Contribution operation succeeded, but refresh failed.",
      refreshErrors,
    );
    setPhase((currentPhase) =>
      currentPhase.name === "success" && currentPhase.result === completedResult
        ? { ...currentPhase, refreshFailed: true }
        : currentPhase,
    );
  };

  const handleSubmit = async () => {
    if (
      !isContributionGiftParam(donationId) ||
      !detail ||
      !availability?.available ||
      validationMessage ||
      blocked ||
      hasBackgroundConflict ||
      pendingRefundMessage
    ) {
      return;
    }
    const receiptDeliverySelection: ReceiptDeliveryProposal | null =
      receiptDelivery && deliveryValue.choice
        ? {
            choice: deliveryValue.choice,
            deferReason:
              deliveryValue.choice === "defer"
                ? deliveryValue.deferReason.trim() || null
                : null,
          }
        : null;
    const basePayload = operation.buildPayload({
      values,
      stagedGiftId: detail.stagedGift?.id ?? null,
    });
    const payload =
      operation.actionType === "retry_staged_gift"
        ? {
            ...basePayload,
            ...retryPayloadForScope(retryTargetScope),
          }
        : basePayload;
    setPhase({ name: "submitting" });
    let result: ContributionActionResult;
    try {
      result = await submitOperation({
        actionType: operation.actionType,
        contributionId: donationId,
        stagedGiftId: detail.stagedGift?.id ?? null,
        sourceSurface,
        reason: values.reason.trim() || null,
        confirmationToken: operation.requiresConfirmation
          ? idempotencyKey
          : null,
        expectedRevision: draftRevision ?? detail.revision,
        idempotencyKey,
        payload: receiptDeliverySelection
          ? { ...payload, receiptDelivery: receiptDeliverySelection }
          : payload,
      });
    } catch (error) {
      // Failure preserves the entered form state for recovery (ADR-CD-033).
      const message =
        error instanceof Error ? error.message : "The operation failed.";
      const staleSave =
        error instanceof ContributionOperationRequestError &&
        error.status === 409;
      setPhase({ name: "failure", message, staleSave });
      if (staleSave) {
        // The server saw a newer revision than this client. Refresh the
        // cached detail in the background so the "current values" summary
        // is honest and a discarded-then-reopened dialog does not start
        // from the same stale snapshot and hit the same 409 again.
        void detailQuery.refetch();
      }
      return;
    }

    setPhase({
      name: "success",
      result,
      submittedReceiptDelivery: receiptDeliverySelection,
      refreshFailed: false,
    });
    void refreshAfterOperation(result);
  };

  const handleReloadLatestDetail = async () => {
    const refreshed = await detailQuery.refetch();
    if (refreshed.isError) {
      const reason =
        refreshed.error instanceof Error
          ? refreshed.error.message
          : "Could not reload the latest gift detail.";
      setPhase({
        name: "failure",
        message: reason,
        staleSave: true,
      });
      return;
    }
    resetDraftState();
  };

  const effectiveSummary = detail ? (
    <dl className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <dt className="text-muted-foreground">Current amount</dt>
      <dd className="text-right font-mono font-semibold tabular-nums">
        {formatSharedContributionAmount(
          detail.shared.amountCents,
          detail.shared.currencyCode,
        )}
      </dd>
      {isRefundOperation && (
        <>
          {/* Refund figures reconcile against the ORIGINAL charged amount,
              not the effective amount shown above (#265). */}
          <dt className="text-muted-foreground">Original charged amount</dt>
          <dd className="text-right font-mono font-semibold tabular-nums">
            {formatSharedContributionAmount(
              detail.original.amountCents,
              detail.shared.currencyCode,
            )}
          </dd>
          <dt className="text-muted-foreground">Refunded so far</dt>
          <dd className="text-right font-mono font-semibold tabular-nums">
            {formatSharedContributionAmount(
              detail.shared.refundedAmountCents,
              detail.shared.currencyCode,
            )}
          </dd>
          <dt className="text-muted-foreground">Remaining refundable</dt>
          <dd className="text-right font-mono font-semibold tabular-nums">
            {formatSharedContributionAmount(
              remainingRefundableCents ?? 0,
              detail.shared.currencyCode,
            )}
          </dd>
        </>
      )}
      <dt className="text-muted-foreground">Designation</dt>
      <dd className="text-right font-medium">
        {detail.shared.designationSummary.fundName}
      </dd>
      <dt className="text-muted-foreground">Receipt</dt>
      <dd className="text-right font-medium capitalize">
        {detail.shared.receiptStatus.replace(/_/g, " ")}
      </dd>
    </dl>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="gap-4 p-5 max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[92dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:overflow-y-auto max-sm:rounded-b-none sm:max-w-lg"
        data-testid="contribution-operation-shell"
      >
        <DialogTitle className="text-base font-semibold">
          {operation.title}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {operation.description}
        </DialogDescription>

        {detailLoading && (
          <div className="space-y-3">
            <p role="status" className="text-sm text-muted-foreground">
              Loading current gift values…
            </p>
            <div className="flex justify-end">
              <Button variant="outline" className="h-11" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {blocked && !detailLoading && (
          <div
            role="note"
            className="rounded-lg border border-border bg-muted/30 p-4 space-y-1"
          >
            <p className="text-sm font-medium text-foreground">
              {blockedReason}
            </p>
            {blockedNextStep && (
              <p className="text-xs text-muted-foreground">{blockedNextStep}</p>
            )}
            {operationBlock && onOpenFullDetail && donationId && (
              <Button
                variant="outline"
                className="mt-3 h-11"
                onClick={() => onOpenFullDetail(donationId)}
              >
                View full contribution detail
              </Button>
            )}
          </div>
        )}

        {!blocked &&
          !detailQuery.isPending &&
          phase.name !== "success" &&
          phase.name !== "submitting" && (
            <div className="space-y-4">
              {effectiveSummary}

              {pendingRefundMessage && (
                <Alert role="status" data-testid="pending-refund-notice">
                  <Clock3 className="size-4" aria-hidden />
                  <AlertDescription className="text-xs">
                    {pendingRefundMessage} Submitting another refund is blocked
                    until the provider confirms or the pending refund fails.
                  </AlertDescription>
                </Alert>
              )}

              {operation.riskCopy && (
                <Alert role="note">
                  <AlertDescription className="text-xs">
                    {operation.riskCopy}
                  </AlertDescription>
                </Alert>
              )}

              {operation.downstreamEffects.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                  {operation.downstreamEffects.map((effect) => (
                    <li key={effect}>{effect}</li>
                  ))}
                </ul>
              )}

              {operation.fields.includes("amount") && (
                <Field data-invalid={Boolean(amountError)}>
                  <FieldLabel htmlFor={amountId}>
                    Amount ({amountCurrencyCode})
                  </FieldLabel>
                  <Input
                    id={amountId}
                    aria-describedby={
                      amountError ? `${amountId}-error` : undefined
                    }
                    aria-invalid={Boolean(amountError)}
                    inputMode="decimal"
                    value={values.amountDollars ?? ""}
                    onChange={(event) => {
                      captureDraftRevision();
                      setValues((prev) => ({
                        ...prev,
                        amountDollars: event.target.value,
                      }));
                    }}
                    className="h-11"
                  />
                  {isRefundOperation && (
                    <FieldDescription>
                      Enter a lower amount for a partial refund.
                    </FieldDescription>
                  )}
                  <FieldError
                    id={`${amountId}-error`}
                    errors={amountError ? [{ message: amountError }] : []}
                  />
                </Field>
              )}

              {operation.fields.includes("fundId") && (
                <Field data-invalid={Boolean(fundError)}>
                  <FieldLabel htmlFor={fundId}>Destination fund ID</FieldLabel>
                  <Input
                    id={fundId}
                    aria-describedby={fundError ? `${fundId}-error` : undefined}
                    aria-invalid={Boolean(fundError)}
                    value={values.fundId ?? ""}
                    onChange={(event) => {
                      captureDraftRevision();
                      setValues((prev) => ({
                        ...prev,
                        fundId: event.target.value,
                      }));
                    }}
                    className="h-11"
                  />
                  <FieldError
                    id={`${fundId}-error`}
                    errors={fundError ? [{ message: fundError }] : []}
                  />
                </Field>
              )}

              {receiptDelivery && (
                <ReceiptDeliveryChoiceField
                  affectedFields={operation.receiptFields}
                  receiptDelivery={receiptDelivery}
                  value={deliveryValue}
                  onChange={(nextDelivery) => {
                    captureDraftRevision();
                    setDelivery(nextDelivery);
                  }}
                  error={deliveryError}
                />
              )}

              {operation.requiresReason && (
                <Field data-invalid={Boolean(reasonError)}>
                  <FieldLabel htmlFor={reasonId}>Reason</FieldLabel>
                  <Textarea
                    id={reasonId}
                    aria-describedby={
                      reasonError ? `${reasonId}-error` : undefined
                    }
                    aria-invalid={Boolean(reasonError)}
                    value={values.reason}
                    onChange={(event) => {
                      captureDraftRevision();
                      setValues((prev) => ({
                        ...prev,
                        reason: event.target.value,
                      }));
                    }}
                    placeholder="Why is this change needed?"
                  />
                  <FieldError
                    id={`${reasonId}-error`}
                    errors={reasonError ? [{ message: reasonError }] : []}
                  />
                </Field>
              )}

              {operation.requiresConfirmation && (
                <Field
                  data-invalid={Boolean(confirmError)}
                  orientation="horizontal"
                >
                  <Checkbox
                    id={confirmId}
                    aria-describedby={
                      confirmError ? `${confirmId}-error` : undefined
                    }
                    aria-invalid={Boolean(confirmError)}
                    checked={values.confirmed}
                    onCheckedChange={(checked) => {
                      captureDraftRevision();
                      setValues((prev) => ({
                        ...prev,
                        confirmed: checked === true,
                      }));
                    }}
                    className="mt-0.5"
                  />
                  <FieldContent>
                    <Label
                      htmlFor={confirmId}
                      className="text-sm font-normal leading-snug"
                    >
                      I reviewed the current values and downstream effects and
                      want to submit this change.
                    </Label>
                    <FieldError
                      id={`${confirmId}-error`}
                      errors={confirmError ? [{ message: confirmError }] : []}
                    />
                  </FieldContent>
                </Field>
              )}

              {phase.name === "failure" && (
                <p role="alert" className="text-sm text-destructive">
                  <CircleX className="mr-1 inline size-4" aria-hidden />
                  {phase.message}
                </p>
              )}

              {hasBackgroundConflict && phase.name !== "failure" && (
                <p role="alert" className="text-sm text-destructive">
                  <CircleX className="mr-1 inline size-4" aria-hidden />
                  This gift changed while you were editing. Review the latest
                  current values above, then reload to start again or discard
                  this draft.
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Button variant="outline" className="h-11" onClick={onClose}>
                  {needsStaleDraftRecovery ? "Discard draft" : "Cancel"}
                </Button>
                {needsStaleDraftRecovery ? (
                  <Button
                    className="h-11"
                    disabled={detailQuery.isFetching}
                    onClick={() => void handleReloadLatestDetail()}
                  >
                    {detailQuery.isFetching
                      ? "Reloading latest gift…"
                      : "Reload latest gift"}
                  </Button>
                ) : (
                  <Button
                    className="h-11"
                    disabled={
                      Boolean(validationMessage) ||
                      Boolean(pendingRefundMessage) ||
                      !detail ||
                      !availability?.available ||
                      detailQuery.isPending ||
                      hasBackgroundConflict
                    }
                    onClick={() => void handleSubmit()}
                  >
                    {phase.name === "failure" ? "Retry" : operation.title}
                  </Button>
                )}
              </div>
            </div>
          )}

        {phase.name === "submitting" && (
          <p role="status" className="flex items-center gap-2 text-sm">
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Submitting…
          </p>
        )}

        {phase.name === "success" && (
          <OperationResultPanel
            result={phase.result}
            operation={operation}
            donationId={donationId}
            submittedReceiptDelivery={phase.submittedReceiptDelivery}
            refreshFailed={phase.refreshFailed}
            onOpenFullDetail={onOpenFullDetail}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type OperationResultTone = "success" | "pending" | "warning" | "failure";

function resolveResultPresentation(
  result: ContributionActionResult,
  operation: OperationDefinition,
): { headline: string; tone: OperationResultTone } {
  const isRefund = operation.actionType === "refund";
  const providerOutcome = result.providerOutcome ?? null;

  if (result.approvalStatus === "pending_approval") {
    return {
      headline: isRefund
        ? "Refund request submitted for approval."
        : "Correction request submitted for approval.",
      tone: "success",
    };
  }

  // local_update_failed means the PROVIDER action succeeded and only the
  // local record did not converge. It must be checked before the generic
  // failed set: telling staff the refund "did not complete" invites the
  // exact duplicate submission this state must prevent (#265).
  if (providerOutcome?.status === "local_update_failed") {
    return {
      headline: isRefund
        ? "The Stripe refund succeeded, but the gift record was not updated. Do not submit the refund again — reconcile using the provider reference below."
        : "The provider action succeeded, but the gift record was not updated. Do not submit it again — reconcile using the provider reference below.",
      tone: "warning",
    };
  }

  if (
    providerOutcome &&
    isFailedProviderOutcomeStatus(providerOutcome.status)
  ) {
    return {
      headline: isRefund
        ? "The provider refund did not complete."
        : "The provider operation did not complete.",
      tone: "failure",
    };
  }

  if (providerOutcome?.status === "pending") {
    return {
      headline: isRefund
        ? "Stripe accepted the refund; the final state will update when the provider confirms."
        : "The provider accepted the operation; the final state will update when the provider confirms.",
      tone: "pending",
    };
  }

  return { headline: "Operation completed.", tone: "success" };
}

/**
 * In-place result panel (ADR-CD-033). The headline stays honest about the
 * provider outcome — a failed or still-pending provider action is never
 * summarized as "Operation completed" — while audit and correction ids stay
 * visible for follow-up in every state.
 */
function OperationResultPanel({
  result,
  operation,
  donationId,
  submittedReceiptDelivery,
  refreshFailed,
  onOpenFullDetail,
  onClose,
}: {
  result: ContributionActionResult;
  operation: OperationDefinition;
  donationId: string | null;
  submittedReceiptDelivery: ReceiptDeliveryProposal | null;
  refreshFailed: boolean;
  onOpenFullDetail?: (donationId: string) => void;
  onClose: () => void;
}) {
  const providerOutcome = result.providerOutcome ?? null;
  const { headline, tone } = resolveResultPresentation(result, operation);
  const headlineClassName =
    tone === "failure"
      ? "flex items-center gap-2 text-sm font-medium text-destructive"
      : tone === "warning"
        ? "flex items-start gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"
        : "flex items-center gap-2 text-sm font-medium text-foreground";

  return (
    <div className="space-y-3" data-testid="operation-result-panel">
      <p
        role={tone === "failure" || tone === "warning" ? "alert" : "status"}
        className={headlineClassName}
      >
        {tone === "failure" ? (
          <CircleX className="size-4" aria-hidden />
        ) : tone === "warning" ? (
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        ) : tone === "pending" ? (
          <Clock3 className="size-4" aria-hidden />
        ) : (
          <CircleCheck className="size-4" aria-hidden />
        )}
        {headline}
      </p>
      {refreshFailed && (
        <Alert role="alert">
          <AlertDescription>
            The submission succeeded, but the displayed gift data may be stale
            because refresh failed. Closing and reopening this gift will retry
            loading current values.
          </AlertDescription>
        </Alert>
      )}
      <ul className="space-y-0.5 text-xs text-muted-foreground">
        {result.correctionRequestId && (
          <li>Approval request: {result.correctionRequestId}</li>
        )}
        {result.adjustmentId && <li>Adjustment: {result.adjustmentId}</li>}
        {result.approvalStatus === "pending_approval" &&
          submittedReceiptDelivery && (
            <li>
              Proposed receipt delivery:{" "}
              {receiptDeliveryChoiceLabel(submittedReceiptDelivery.choice)}
              {submittedReceiptDelivery.deferReason
                ? ` — ${submittedReceiptDelivery.deferReason}`
                : null}
            </li>
          )}
        {providerOutcome?.referenceId && (
          <li
            className={
              // Reconciliation depends on the provider reference when the
              // local record did not converge — keep it prominent.
              tone === "warning"
                ? "text-sm font-medium text-foreground"
                : undefined
            }
          >
            Provider reference: {providerOutcome.referenceId}
          </li>
        )}
        {(tone === "failure" || tone === "warning") &&
          providerOutcome?.errorCode && (
            <li>Provider error code: {providerOutcome.errorCode}</li>
          )}
        {result.receiptOutcome &&
          result.receiptOutcome.status !== "not_required" && (
            <ReceiptOutcomeResultItems outcome={result.receiptOutcome} />
          )}
        <li>Audit event: {result.auditEventId}</li>
      </ul>
      <div className="flex flex-wrap justify-end gap-2">
        {onOpenFullDetail && donationId && (
          <Button
            variant="outline"
            className="h-11"
            onClick={() => onOpenFullDetail(donationId)}
          >
            View full contribution detail
          </Button>
        )}
        <Button className="h-11" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
