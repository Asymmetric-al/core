"use client";

// Import values from pure submodules, not the package barrel: the barrel
// re-exports server-only modules (Stripe refunds, Supabase access) that must
// not be evaluated in this client component's bundle.
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
import { readJsonBody } from "@asym/lib/http/fetch-result";
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
import { useId, useState, type Dispatch, type SetStateAction } from "react";

import {
  invalidateContributionOperationQueries,
  isContributionGiftParam,
} from "./contribution-detail-model";
import { useContributionDetail } from "./contribution-detail-overlay";
import {
  ReceiptDeliveryChoiceField,
  type ContributionReceiptDeliveryContext,
  type ReceiptDeliveryProposal,
  type ReceiptDeliveryValue,
} from "./receipt-delivery-choice";
import {
  receiptDeliveryChoiceLabel,
  receiptSnapshotPdfUrl,
  resolveInitialReceiptDeliveryValue,
  resolveReceiptDeliveryError,
} from "./receipt-delivery-model";

import type {
  OperationDefinition,
  OperationFieldValues,
} from "./operation-definitions";
// Type-only imports are erased at compile time, so pulling this one type
// from the barrel does not evaluate its server-only modules in the client
// bundle (matches contribution-detail-overlay.tsx).
import type {
  CrmPostFailedScope,
  ViewerProjectedContributionDetail,
} from "@asym/api/admin/contribution-operations";
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

export type {
  OperationCategory,
  OperationDefinition,
  OperationFieldValues,
  SupportedOperationActionType,
} from "./operation-definitions";

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

  const { ok, status, body } = await readJsonBody<{
    result?: ContributionActionResult;
    error?: string;
  }>(response);

  if (!ok || !body?.result) {
    throw new ContributionOperationRequestError(
      body?.error ?? "The operation failed.",
      status,
    );
  }

  return body.result;
}

function receiptOutcomeChangedByApprover(
  requested: ReceiptDeliveryOutcome["requested"],
  confirmed: ReceiptDeliveryOutcome["confirmed"],
): boolean {
  return Boolean(
    requested &&
    confirmed &&
    (requested.choice !== confirmed.choice ||
      (requested.deferReason ?? null) !== (confirmed.deferReason ?? null)),
  );
}

function ReceiptOutcomeChangedByApproverItem({
  confirmed,
  requested,
}: {
  confirmed: NonNullable<ReceiptDeliveryOutcome["confirmed"]>;
  requested: NonNullable<ReceiptDeliveryOutcome["requested"]>;
}) {
  return (
    <li>
      Requested: {receiptDeliveryChoiceLabel(requested.choice)} · Confirmed:{" "}
      {receiptDeliveryChoiceLabel(confirmed.choice)}
    </li>
  );
}

function ReceiptOutcomePdfLinkItem({ snapshotId }: { snapshotId: string }) {
  return (
    <li>
      <a
        href={receiptSnapshotPdfUrl(snapshotId)}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground underline underline-offset-2"
      >
        Download updated receipt PDF
      </a>
    </li>
  );
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
  const changedByApprover = receiptOutcomeChangedByApprover(
    requested,
    confirmed,
  );
  const deferReason =
    outcome.status === "deferred"
      ? (confirmed?.deferReason ?? outcome.reason)
      : null;

  return (
    <>
      <li>Receipt: {outcome.status.replace(/_/g, " ")}</li>
      {changedByApprover && requested && confirmed ? (
        <ReceiptOutcomeChangedByApproverItem
          confirmed={confirmed}
          requested={requested}
        />
      ) : null}
      {deferReason ? <li>Defer reason: {deferReason}</li> : null}
      {outcome.status === "pdf_generated" && outcome.snapshotId ? (
        <ReceiptOutcomePdfLinkItem snapshotId={outcome.snapshotId} />
      ) : null}
    </>
  );
}

function remainingRefundableCentsForOperation(
  isRefundOperation: boolean,
  detail: ViewerProjectedContributionDetail | undefined,
): number | null {
  return isRefundOperation && detail
    ? Math.max(
        0,
        detail.original.amountCents - detail.shared.refundedAmountCents,
      )
    : null;
}

function pendingRefundMessageForOperation(
  isRefundOperation: boolean,
  detail: ViewerProjectedContributionDetail | undefined,
): string | null {
  const hasPendingRefundCorrection =
    isRefundOperation && detail
      ? detail.corrections.some(
          (correction) =>
            correction.correctionType === "refund" &&
            correction.status === "pending",
        )
      : false;
  return hasPendingRefundCorrection
    ? "A refund is pending provider confirmation."
    : null;
}

function resolveOperationAmountError({
  amountCurrencyCode,
  isRefundOperation,
  operation,
  remainingRefundableCents,
  values,
}: {
  amountCurrencyCode: string;
  isRefundOperation: boolean;
  operation: OperationDefinition;
  remainingRefundableCents: number | null;
  values: OperationFieldValues;
}): string | null {
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
}

function resolveOperationBlockedState({
  availability,
  detail,
  detailLoadBlock,
  operation,
}: {
  availability:
    | ViewerProjectedContributionDetail["actionAvailability"][number]
    | null;
  detail: ViewerProjectedContributionDetail | undefined;
  detailLoadBlock: { reason: string; nextStep: string } | null;
  operation: OperationDefinition;
}): {
  blocked: boolean;
  blockedNextStep: string;
  blockedReason: string;
  failedRetryScopes: CrmPostFailedScope[];
  hasIndependentStagedGiftRetry: boolean;
  operationBlock: { reason: string; nextStep: string } | null;
  retryTargetScope: CrmPostFailedScope | null;
} {
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

  return {
    blocked,
    blockedNextStep,
    blockedReason,
    failedRetryScopes,
    hasIndependentStagedGiftRetry,
    operationBlock,
    retryTargetScope,
  };
}

function useOperationDraftLifecycle({
  actionType,
  donationId,
  latestRevision,
  open,
  remainingRefundableCents,
}: {
  actionType: string | undefined;
  donationId: string | null;
  latestRevision: string | null;
  open: boolean;
  remainingRefundableCents: number | null;
}) {
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

  const resetDraftState = () => {
    setPhase({ name: "form" });
    setValues({ reason: "", confirmed: false });
    setDelivery(null);
    setIdempotencyKey(crypto.randomUUID());
    setDraftRevision(null);
    setAmountPrefillKey(null);
  };

  const nextOpenKey = open ? `${donationId ?? ""}:${actionType ?? ""}` : null;
  if (nextOpenKey !== openKey) {
    setOpenKey(nextOpenKey);
    setAmountPrefillKey(null);
    if (nextOpenKey) {
      resetDraftState();
    }
  }
  if (nextOpenKey && latestRevision !== null && draftRevision === null) {
    setDraftRevision(latestRevision);
  }
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

  const captureDraftRevision = () => {
    setDraftRevision((current) => current ?? latestRevision);
  };

  return {
    captureDraftRevision,
    delivery,
    draftRevision,
    idempotencyKey,
    phase,
    resetDraftState,
    setDelivery,
    setPhase,
    setValues,
    values,
  };
}

function resolveOperationShellViewModel({
  delivery,
  detail,
  detailQueryError,
  detailQueryIsPending,
  donationId,
  draftRevision,
  isRefundOperation,
  latestRevision,
  operation,
  phase,
  remainingRefundableCents,
  values,
}: {
  delivery: ReceiptDeliveryValue | null;
  detail: ViewerProjectedContributionDetail | undefined;
  detailQueryError: unknown;
  detailQueryIsPending: boolean;
  donationId: string | null;
  draftRevision: string | null;
  isRefundOperation: boolean;
  latestRevision: string | null;
  operation: OperationDefinition | null;
  phase: ShellPhase;
  remainingRefundableCents: number | null;
  values: OperationFieldValues;
}): OperationShellViewModel | null {
  if (!operation) {
    return null;
  }

  const detailQueryEnabled = isContributionGiftParam(donationId);
  const detailLoading = detailQueryEnabled && detailQueryIsPending;
  const detailLoadBlock =
    !detail && !detailLoading
      ? {
          reason:
            detailQueryError instanceof Error
              ? detailQueryError.message
              : "Current gift detail is unavailable for this row.",
          nextStep: "Close this action, refresh the CRM row, and try again.",
        }
      : null;
  const hasBackgroundConflict =
    draftRevision !== null &&
    latestRevision !== null &&
    draftRevision !== latestRevision;
  const needsStaleDraftRecovery =
    hasBackgroundConflict || (phase.name === "failure" && phase.staleSave);
  const pendingRefundMessage = pendingRefundMessageForOperation(
    isRefundOperation,
    detail,
  );
  const availability = detail
    ? (detail.actionAvailability.find(
        (entry) => entry.actionType === operation.actionType,
      ) ?? null)
    : null;
  const blockedState = resolveOperationBlockedState({
    availability,
    detail,
    detailLoadBlock,
    operation,
  });
  const amountCurrencyCode = detail?.shared.currencyCode ?? "USD";
  const amountError = resolveOperationAmountError({
    amountCurrencyCode,
    isRefundOperation,
    operation,
    remainingRefundableCents,
    values,
  });
  const fundError =
    operation.fields.includes("fundId") && !values.fundId?.trim()
      ? "Enter the destination fund."
      : null;
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
  const showForm =
    !blockedState.blocked &&
    !detailQueryIsPending &&
    phase.name !== "success" &&
    phase.name !== "submitting";

  return {
    amountCurrencyCode,
    amountError,
    availability,
    blocked: blockedState.blocked,
    blockedNextStep: blockedState.blockedNextStep,
    blockedReason: blockedState.blockedReason,
    confirmError,
    deliveryError,
    deliveryValue,
    detailLoading,
    fundError,
    hasBackgroundConflict,
    isRefundOperation,
    needsStaleDraftRecovery,
    operationBlock: blockedState.operationBlock,
    pendingRefundMessage,
    receiptDelivery,
    reasonError,
    retryTargetScope: blockedState.retryTargetScope,
    showForm,
    validationMessage,
  };
}

type OperationShellViewModel = {
  amountCurrencyCode: string;
  amountError: string | null;
  availability:
    | ViewerProjectedContributionDetail["actionAvailability"][number]
    | null;
  blocked: boolean;
  blockedNextStep: string;
  blockedReason: string;
  confirmError: string | null;
  deliveryError: string | null;
  deliveryValue: ReceiptDeliveryValue;
  detailLoading: boolean;
  fundError: string | null;
  hasBackgroundConflict: boolean;
  isRefundOperation: boolean;
  needsStaleDraftRecovery: boolean;
  operationBlock: { reason: string; nextStep: string } | null;
  pendingRefundMessage: string | null;
  receiptDelivery: ContributionReceiptDeliveryContext | null;
  reasonError: string | null;
  retryTargetScope: CrmPostFailedScope | null;
  showForm: boolean;
  validationMessage: string | null;
};

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
  const reasonId = useId();
  const amountId = useId();
  const fundId = useId();
  const confirmId = useId();
  const detail = detailQuery.data;
  const isRefundOperation = operation?.actionType === "refund";
  const remainingRefundableCents = remainingRefundableCentsForOperation(
    Boolean(isRefundOperation),
    detail,
  );
  const latestRevision = detail?.revision ?? null;
  const {
    captureDraftRevision,
    delivery,
    draftRevision,
    idempotencyKey,
    phase,
    resetDraftState,
    setDelivery,
    setPhase,
    setValues,
    values,
  } = useOperationDraftLifecycle({
    actionType: operation?.actionType,
    donationId,
    latestRevision,
    open,
    remainingRefundableCents,
  });

  const view = resolveOperationShellViewModel({
    delivery,
    detail,
    detailQueryError: detailQuery.error,
    detailQueryIsPending: detailQuery.isPending,
    donationId,
    draftRevision,
    isRefundOperation: Boolean(isRefundOperation),
    latestRevision,
    operation,
    phase,
    remainingRefundableCents,
    values,
  });

  if (!operation || view === null) {
    return null;
  }

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
      !view.availability?.available ||
      view.validationMessage ||
      view.blocked ||
      view.hasBackgroundConflict ||
      view.pendingRefundMessage
    ) {
      return;
    }
    const receiptDeliverySelection: ReceiptDeliveryProposal | null =
      view.receiptDelivery && view.deliveryValue.choice
        ? {
            choice: view.deliveryValue.choice,
            deferReason:
              view.deliveryValue.choice === "defer"
                ? view.deliveryValue.deferReason.trim() || null
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
            ...retryPayloadForScope(view.retryTargetScope),
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
        <OperationShellDialogBody
          amountId={amountId}
          captureDraftRevision={captureDraftRevision}
          confirmId={confirmId}
          detail={detail}
          detailQueryIsFetching={detailQuery.isFetching}
          detailQueryIsPending={detailQuery.isPending}
          donationId={donationId}
          fundId={fundId}
          onClose={onClose}
          onOpenFullDetail={onOpenFullDetail}
          onReloadLatestDetail={() => void handleReloadLatestDetail()}
          onSubmit={() => void handleSubmit()}
          operation={operation}
          phase={phase}
          reasonId={reasonId}
          remainingRefundableCents={remainingRefundableCents}
          setDelivery={setDelivery}
          setValues={setValues}
          values={values}
          view={view}
        />
      </DialogContent>
    </Dialog>
  );
}

function OperationEffectiveSummary({
  detail,
  isRefundOperation,
  remainingRefundableCents,
}: {
  detail: ViewerProjectedContributionDetail;
  isRefundOperation: boolean;
  remainingRefundableCents: number | null;
}) {
  return (
    <dl className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <dt className="text-muted-foreground">Current amount</dt>
      <dd className="text-right font-mono font-semibold tabular-nums">
        {formatSharedContributionAmount(
          detail.shared.amountCents,
          detail.shared.currencyCode,
        )}
      </dd>
      {isRefundOperation ? (
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
      ) : null}
      <dt className="text-muted-foreground">Designation</dt>
      <dd className="text-right font-medium">
        {detail.shared.designationSummary.fundName}
      </dd>
      <dt className="text-muted-foreground">Receipt</dt>
      <dd className="text-right font-medium capitalize">
        {detail.shared.receiptStatus.replace(/_/g, " ")}
      </dd>
    </dl>
  );
}

function OperationShellLoading({ onClose }: { onClose: () => void }) {
  return (
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
  );
}

function OperationShellBlocked({
  blockedNextStep,
  blockedReason,
  donationId,
  onOpenFullDetail,
  operationBlock,
}: {
  blockedNextStep: string;
  blockedReason: string;
  donationId: string | null;
  onOpenFullDetail?: (donationId: string) => void;
  operationBlock: { reason: string; nextStep: string } | null;
}) {
  return (
    <div
      role="note"
      className="rounded-lg border border-border bg-muted/30 p-4 space-y-1"
    >
      <p className="text-sm font-medium text-foreground">{blockedReason}</p>
      {blockedNextStep ? (
        <p className="text-xs text-muted-foreground">{blockedNextStep}</p>
      ) : null}
      {operationBlock && onOpenFullDetail && donationId ? (
        <Button
          variant="outline"
          className="mt-3 h-11"
          onClick={() => onOpenFullDetail(donationId)}
        >
          View full contribution detail
        </Button>
      ) : null}
    </div>
  );
}

function OperationAmountField({
  amountCurrencyCode,
  amountError,
  amountId,
  captureDraftRevision,
  isRefundOperation,
  setValues,
  values,
}: {
  amountCurrencyCode: string;
  amountError: string | null;
  amountId: string;
  captureDraftRevision: () => void;
  isRefundOperation: boolean;
  setValues: Dispatch<SetStateAction<OperationFieldValues>>;
  values: OperationFieldValues;
}) {
  return (
    <Field data-invalid={Boolean(amountError)}>
      <FieldLabel htmlFor={amountId}>Amount ({amountCurrencyCode})</FieldLabel>
      <Input
        id={amountId}
        aria-describedby={amountError ? `${amountId}-error` : undefined}
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
      {isRefundOperation ? (
        <FieldDescription>
          Enter a lower amount for a partial refund.
        </FieldDescription>
      ) : null}
      <FieldError
        id={`${amountId}-error`}
        errors={amountError ? [{ message: amountError }] : []}
      />
    </Field>
  );
}

function OperationFundField({
  captureDraftRevision,
  fundError,
  fundId,
  setValues,
  values,
}: {
  captureDraftRevision: () => void;
  fundError: string | null;
  fundId: string;
  setValues: Dispatch<SetStateAction<OperationFieldValues>>;
  values: OperationFieldValues;
}) {
  return (
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
  );
}

function OperationReasonField({
  captureDraftRevision,
  reasonError,
  reasonId,
  setValues,
  values,
}: {
  captureDraftRevision: () => void;
  reasonError: string | null;
  reasonId: string;
  setValues: Dispatch<SetStateAction<OperationFieldValues>>;
  values: OperationFieldValues;
}) {
  return (
    <Field data-invalid={Boolean(reasonError)}>
      <FieldLabel htmlFor={reasonId}>Reason</FieldLabel>
      <Textarea
        id={reasonId}
        aria-describedby={reasonError ? `${reasonId}-error` : undefined}
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
  );
}

function OperationConfirmField({
  captureDraftRevision,
  confirmError,
  confirmId,
  setValues,
  values,
}: {
  captureDraftRevision: () => void;
  confirmError: string | null;
  confirmId: string;
  setValues: Dispatch<SetStateAction<OperationFieldValues>>;
  values: OperationFieldValues;
}) {
  return (
    <Field data-invalid={Boolean(confirmError)} orientation="horizontal">
      <Checkbox
        id={confirmId}
        aria-describedby={confirmError ? `${confirmId}-error` : undefined}
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
        <Label htmlFor={confirmId} className="text-sm font-normal leading-snug">
          I reviewed the current values and downstream effects and want to
          submit this change.
        </Label>
        <FieldError
          id={`${confirmId}-error`}
          errors={confirmError ? [{ message: confirmError }] : []}
        />
      </FieldContent>
    </Field>
  );
}

function OperationDraftAlerts({
  hasBackgroundConflict,
  phase,
}: {
  hasBackgroundConflict: boolean;
  phase: ShellPhase;
}) {
  if (phase.name === "failure") {
    return (
      <p role="alert" className="text-sm text-destructive">
        <CircleX className="mr-1 inline size-4" aria-hidden />
        {phase.message}
      </p>
    );
  }

  if (!hasBackgroundConflict) {
    return null;
  }

  return (
    <p role="alert" className="text-sm text-destructive">
      <CircleX className="mr-1 inline size-4" aria-hidden />
      This gift changed while you were editing. Review the latest current values
      above, then reload to start again or discard this draft.
    </p>
  );
}

function OperationSubmitBar({
  availability,
  detail,
  detailQueryIsFetching,
  detailQueryIsPending,
  hasBackgroundConflict,
  needsStaleDraftRecovery,
  onClose,
  onReloadLatestDetail,
  onSubmit,
  operation,
  pendingRefundMessage,
  phase,
  validationMessage,
}: {
  availability:
    | ViewerProjectedContributionDetail["actionAvailability"][number]
    | null;
  detail: ViewerProjectedContributionDetail | undefined;
  detailQueryIsFetching: boolean;
  detailQueryIsPending: boolean;
  hasBackgroundConflict: boolean;
  needsStaleDraftRecovery: boolean;
  onClose: () => void;
  onReloadLatestDetail: () => void;
  onSubmit: () => void;
  operation: OperationDefinition;
  pendingRefundMessage: string | null;
  phase: ShellPhase;
  validationMessage: string | null;
}) {
  const submitDisabled =
    Boolean(validationMessage) ||
    Boolean(pendingRefundMessage) ||
    !detail ||
    !availability?.available ||
    detailQueryIsPending ||
    hasBackgroundConflict;

  return (
    <div className="flex flex-wrap justify-end gap-2 pt-1">
      <Button variant="outline" className="h-11" onClick={onClose}>
        {needsStaleDraftRecovery ? "Discard draft" : "Cancel"}
      </Button>
      {needsStaleDraftRecovery ? (
        <Button
          className="h-11"
          disabled={detailQueryIsFetching}
          onClick={onReloadLatestDetail}
        >
          {detailQueryIsFetching
            ? "Reloading latest gift…"
            : "Reload latest gift"}
        </Button>
      ) : (
        <Button className="h-11" disabled={submitDisabled} onClick={onSubmit}>
          {phase.name === "failure" ? "Retry" : operation.title}
        </Button>
      )}
    </div>
  );
}

function OperationShellForm({
  amountId,
  captureDraftRevision,
  confirmId,
  detail,
  detailQueryIsFetching,
  detailQueryIsPending,
  fundId,
  onClose,
  onReloadLatestDetail,
  onSubmit,
  operation,
  phase,
  reasonId,
  remainingRefundableCents,
  setDelivery,
  setValues,
  values,
  view,
}: {
  amountId: string;
  captureDraftRevision: () => void;
  confirmId: string;
  detail: ViewerProjectedContributionDetail | undefined;
  detailQueryIsFetching: boolean;
  detailQueryIsPending: boolean;
  fundId: string;
  onClose: () => void;
  onReloadLatestDetail: () => void;
  onSubmit: () => void;
  operation: OperationDefinition;
  phase: ShellPhase;
  reasonId: string;
  remainingRefundableCents: number | null;
  setDelivery: Dispatch<SetStateAction<ReceiptDeliveryValue | null>>;
  setValues: Dispatch<SetStateAction<OperationFieldValues>>;
  values: OperationFieldValues;
  view: OperationShellViewModel;
}) {
  return (
    <div className="space-y-4">
      {detail ? (
        <OperationEffectiveSummary
          detail={detail}
          isRefundOperation={view.isRefundOperation}
          remainingRefundableCents={remainingRefundableCents}
        />
      ) : null}

      {view.pendingRefundMessage ? (
        <Alert role="status" data-testid="pending-refund-notice">
          <Clock3 className="size-4" aria-hidden />
          <AlertDescription className="text-xs">
            {view.pendingRefundMessage} Submitting another refund is blocked
            until the provider confirms or the pending refund fails.
          </AlertDescription>
        </Alert>
      ) : null}

      {operation.riskCopy ? (
        <Alert role="note">
          <AlertDescription className="text-xs">
            {operation.riskCopy}
          </AlertDescription>
        </Alert>
      ) : null}

      {operation.downstreamEffects.length > 0 ? (
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
          {operation.downstreamEffects.map((effect) => (
            <li key={effect}>{effect}</li>
          ))}
        </ul>
      ) : null}

      {operation.fields.includes("amount") ? (
        <OperationAmountField
          amountCurrencyCode={view.amountCurrencyCode}
          amountError={view.amountError}
          amountId={amountId}
          captureDraftRevision={captureDraftRevision}
          isRefundOperation={view.isRefundOperation}
          setValues={setValues}
          values={values}
        />
      ) : null}

      {operation.fields.includes("fundId") ? (
        <OperationFundField
          captureDraftRevision={captureDraftRevision}
          fundError={view.fundError}
          fundId={fundId}
          setValues={setValues}
          values={values}
        />
      ) : null}

      {view.receiptDelivery ? (
        <ReceiptDeliveryChoiceField
          affectedFields={operation.receiptFields}
          receiptDelivery={view.receiptDelivery}
          value={view.deliveryValue}
          onChange={(nextDelivery) => {
            captureDraftRevision();
            setDelivery(nextDelivery);
          }}
          error={view.deliveryError}
        />
      ) : null}

      {operation.requiresReason ? (
        <OperationReasonField
          captureDraftRevision={captureDraftRevision}
          reasonError={view.reasonError}
          reasonId={reasonId}
          setValues={setValues}
          values={values}
        />
      ) : null}

      {operation.requiresConfirmation ? (
        <OperationConfirmField
          captureDraftRevision={captureDraftRevision}
          confirmError={view.confirmError}
          confirmId={confirmId}
          setValues={setValues}
          values={values}
        />
      ) : null}

      <OperationDraftAlerts
        hasBackgroundConflict={view.hasBackgroundConflict}
        phase={phase}
      />

      <OperationSubmitBar
        availability={view.availability}
        detail={detail}
        detailQueryIsFetching={detailQueryIsFetching}
        detailQueryIsPending={detailQueryIsPending}
        hasBackgroundConflict={view.hasBackgroundConflict}
        needsStaleDraftRecovery={view.needsStaleDraftRecovery}
        onClose={onClose}
        onReloadLatestDetail={onReloadLatestDetail}
        onSubmit={onSubmit}
        operation={operation}
        pendingRefundMessage={view.pendingRefundMessage}
        phase={phase}
        validationMessage={view.validationMessage}
      />
    </div>
  );
}

function OperationShellSubmitting() {
  return (
    <p role="status" className="flex items-center gap-2 text-sm">
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      Submitting…
    </p>
  );
}

function OperationShellDialogBody({
  amountId,
  captureDraftRevision,
  confirmId,
  detail,
  detailQueryIsFetching,
  detailQueryIsPending,
  donationId,
  fundId,
  onClose,
  onOpenFullDetail,
  onReloadLatestDetail,
  onSubmit,
  operation,
  phase,
  reasonId,
  remainingRefundableCents,
  setDelivery,
  setValues,
  values,
  view,
}: {
  amountId: string;
  captureDraftRevision: () => void;
  confirmId: string;
  detail: ViewerProjectedContributionDetail | undefined;
  detailQueryIsFetching: boolean;
  detailQueryIsPending: boolean;
  donationId: string | null;
  fundId: string;
  onClose: () => void;
  onOpenFullDetail?: (donationId: string) => void;
  onReloadLatestDetail: () => void;
  onSubmit: () => void;
  operation: OperationDefinition;
  phase: ShellPhase;
  reasonId: string;
  remainingRefundableCents: number | null;
  setDelivery: Dispatch<SetStateAction<ReceiptDeliveryValue | null>>;
  setValues: Dispatch<SetStateAction<OperationFieldValues>>;
  values: OperationFieldValues;
  view: OperationShellViewModel;
}) {
  return (
    <>
      {view.detailLoading ? <OperationShellLoading onClose={onClose} /> : null}

      {view.blocked && !view.detailLoading ? (
        <OperationShellBlocked
          blockedNextStep={view.blockedNextStep}
          blockedReason={view.blockedReason}
          donationId={donationId}
          onOpenFullDetail={onOpenFullDetail}
          operationBlock={view.operationBlock}
        />
      ) : null}

      {view.showForm ? (
        <OperationShellForm
          amountId={amountId}
          captureDraftRevision={captureDraftRevision}
          confirmId={confirmId}
          detail={detail}
          detailQueryIsFetching={detailQueryIsFetching}
          detailQueryIsPending={detailQueryIsPending}
          fundId={fundId}
          onClose={onClose}
          onReloadLatestDetail={onReloadLatestDetail}
          onSubmit={onSubmit}
          operation={operation}
          phase={phase}
          reasonId={reasonId}
          remainingRefundableCents={remainingRefundableCents}
          setDelivery={setDelivery}
          setValues={setValues}
          values={values}
          view={view}
        />
      ) : null}

      {phase.name === "submitting" ? <OperationShellSubmitting /> : null}

      {phase.name === "success" ? (
        <OperationResultPanel
          result={phase.result}
          operation={operation}
          donationId={donationId}
          submittedReceiptDelivery={phase.submittedReceiptDelivery}
          refreshFailed={phase.refreshFailed}
          onOpenFullDetail={onOpenFullDetail}
          onClose={onClose}
        />
      ) : null}
    </>
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

function OperationResultHeadline({
  headline,
  tone,
}: {
  headline: string;
  tone: OperationResultTone;
}) {
  const headlineClassName =
    tone === "failure"
      ? "flex items-center gap-2 text-sm font-medium text-destructive"
      : tone === "warning"
        ? "flex items-start gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"
        : "flex items-center gap-2 text-sm font-medium text-foreground";
  const role = tone === "failure" || tone === "warning" ? "alert" : "status";
  const Icon =
    tone === "failure"
      ? CircleX
      : tone === "warning"
        ? TriangleAlert
        : tone === "pending"
          ? Clock3
          : CircleCheck;

  return (
    <p role={role} className={headlineClassName}>
      <Icon
        className={tone === "warning" ? "mt-0.5 size-4 shrink-0" : "size-4"}
        aria-hidden
      />
      {headline}
    </p>
  );
}

function OperationResultCorrectionItem({
  correctionRequestId,
}: {
  correctionRequestId: string | null | undefined;
}) {
  if (!correctionRequestId) {
    return null;
  }

  return <li>Approval request: {correctionRequestId}</li>;
}

function OperationResultAdjustmentItem({
  adjustmentId,
}: {
  adjustmentId: string | null | undefined;
}) {
  if (!adjustmentId) {
    return null;
  }

  return <li>Adjustment: {adjustmentId}</li>;
}

function OperationResultProposedReceiptItem({
  approvalStatus,
  submittedReceiptDelivery,
}: {
  approvalStatus: ContributionActionResult["approvalStatus"];
  submittedReceiptDelivery: ReceiptDeliveryProposal | null;
}) {
  if (approvalStatus !== "pending_approval" || !submittedReceiptDelivery) {
    return null;
  }

  return (
    <li>
      Proposed receipt delivery:{" "}
      {receiptDeliveryChoiceLabel(submittedReceiptDelivery.choice)}
      {submittedReceiptDelivery.deferReason
        ? ` — ${submittedReceiptDelivery.deferReason}`
        : null}
    </li>
  );
}

function OperationResultProviderReferenceItem({
  referenceId,
  tone,
}: {
  referenceId: string | null | undefined;
  tone: OperationResultTone;
}) {
  if (!referenceId) {
    return null;
  }

  return (
    <li
      className={
        // Reconciliation depends on the provider reference when the
        // local record did not converge — keep it prominent.
        tone === "warning" ? "text-sm font-medium text-foreground" : undefined
      }
    >
      Provider reference: {referenceId}
    </li>
  );
}

function OperationResultProviderErrorItem({
  errorCode,
  tone,
}: {
  errorCode: string | null | undefined;
  tone: OperationResultTone;
}) {
  if ((tone !== "failure" && tone !== "warning") || !errorCode) {
    return null;
  }

  return <li>Provider error code: {errorCode}</li>;
}

function OperationResultReceiptOutcomeItem({
  outcome,
}: {
  outcome: ContributionActionResult["receiptOutcome"];
}) {
  if (!outcome || outcome.status === "not_required") {
    return null;
  }

  return <ReceiptOutcomeResultItems outcome={outcome} />;
}

function OperationResultDetailsList({
  result,
  submittedReceiptDelivery,
  tone,
}: {
  result: ContributionActionResult;
  submittedReceiptDelivery: ReceiptDeliveryProposal | null;
  tone: OperationResultTone;
}) {
  const providerOutcome = result.providerOutcome ?? null;

  return (
    <ul className="space-y-0.5 text-xs text-muted-foreground">
      <OperationResultCorrectionItem
        correctionRequestId={result.correctionRequestId}
      />
      <OperationResultAdjustmentItem adjustmentId={result.adjustmentId} />
      <OperationResultProposedReceiptItem
        approvalStatus={result.approvalStatus}
        submittedReceiptDelivery={submittedReceiptDelivery}
      />
      <OperationResultProviderReferenceItem
        referenceId={providerOutcome?.referenceId}
        tone={tone}
      />
      <OperationResultProviderErrorItem
        errorCode={providerOutcome?.errorCode}
        tone={tone}
      />
      <OperationResultReceiptOutcomeItem outcome={result.receiptOutcome} />
      <li>Audit event: {result.auditEventId}</li>
    </ul>
  );
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
  const { headline, tone } = resolveResultPresentation(result, operation);

  return (
    <div className="space-y-3" data-testid="operation-result-panel">
      <OperationResultHeadline headline={headline} tone={tone} />
      {refreshFailed ? (
        <Alert role="alert">
          <AlertDescription>
            The submission succeeded, but the displayed gift data may be stale
            because refresh failed. Closing and reopening this gift will retry
            loading current values.
          </AlertDescription>
        </Alert>
      ) : null}
      <OperationResultDetailsList
        result={result}
        submittedReceiptDelivery={submittedReceiptDelivery}
        tone={tone}
      />
      <div className="flex flex-wrap justify-end gap-2">
        {onOpenFullDetail && donationId ? (
          <Button
            variant="outline"
            className="h-11"
            onClick={() => onOpenFullDetail(donationId)}
          >
            View full contribution detail
          </Button>
        ) : null}
        <Button className="h-11" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
