"use client";

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
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { useId, useMemo, useState } from "react";

import {
  invalidateContributionOperationQueries,
  useContributionDetail,
} from "./contribution-detail-overlay";

import type {
  ContributionActionResult,
  ContributionActionType,
  ContributionSourceSurface,
} from "@asym/api/admin/contribution-operations";

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

export type OperationCategory =
  | "correction"
  | "receipt"
  | "refund"
  | "crm"
  | "provider";

export interface OperationFieldValues {
  amountDollars?: string;
  fundId?: string;
  reason: string;
  confirmed: boolean;
}

export type SupportedOperationActionType = Extract<
  ContributionActionType,
  | "amount_correction"
  | "fund_correction"
  | "resend_receipt"
  | "refund"
  | "approve_staged_gift"
  | "retry_staged_gift"
  | "stripe_replay"
>;

export interface OperationDefinition {
  actionType: SupportedOperationActionType;
  title: string;
  description: string;
  category: OperationCategory;
  /** Risky-operation framing shown above the form (ADR-CD-033). */
  riskCopy: string | null;
  downstreamEffects: string[];
  requiresReason: boolean;
  requiresConfirmation: boolean;
  /** Which operation-specific inputs to render. */
  fields: Array<"amount" | "fundId">;
  buildPayload: (input: {
    values: OperationFieldValues;
    stagedGiftId: string | null;
  }) => Record<string, unknown>;
}

export const OPERATION_DEFINITIONS: Record<
  SupportedOperationActionType,
  OperationDefinition
> = {
  amount_correction: {
    actionType: "amount_correction",
    title: "Correct gift amount",
    description:
      "Records an adjustment with the corrected amount. The original donation history is preserved.",
    category: "correction",
    riskCopy:
      "This changes the gift's effective amount everywhere it appears, including receipts and reports. High-risk corrections may require approval.",
    downstreamEffects: [
      "Effective amount changes in CRM, the Contributions Hub, and reports.",
      "A sent receipt becomes receipt-affected and may need an updated receipt.",
    ],
    requiresReason: true,
    requiresConfirmation: true,
    fields: ["amount"],
    buildPayload: ({ values }) => ({
      amount: Math.round(Number.parseFloat(values.amountDollars || "0") * 100),
    }),
  },
  fund_correction: {
    actionType: "fund_correction",
    title: "Correct fund designation",
    description:
      "Moves this gift's designation to a different fund through an audited adjustment.",
    category: "correction",
    riskCopy:
      "Changing the fund affects donor intent records, receipts, and CRM posting. High-risk corrections may require approval.",
    downstreamEffects: [
      "Designation summary changes in CRM and the Contributions Hub.",
      "CRM posting and receipts may need follow-up.",
    ],
    requiresReason: true,
    requiresConfirmation: true,
    fields: ["fundId"],
    buildPayload: ({ values }) => ({ fundId: values.fundId || null }),
  },
  resend_receipt: {
    actionType: "resend_receipt",
    title: "Send receipt",
    description: "Sends the gift receipt to the donor again.",
    category: "receipt",
    riskCopy: null,
    downstreamEffects: ["The donor receives a receipt email."],
    requiresReason: false,
    requiresConfirmation: false,
    fields: [],
    buildPayload: () => ({}),
  },
  refund: {
    actionType: "refund",
    title: "Refund gift",
    description:
      "Refunds the donor through the payment provider. Refunds follow tenant approval policy.",
    category: "refund",
    riskCopy:
      "Money moves back to the donor. This cannot be undone and may require approval before it executes.",
    downstreamEffects: [
      "Refund state changes in CRM, the Contributions Hub, and donor history.",
      "The provider charge is refunded for the entered amount.",
    ],
    requiresReason: true,
    requiresConfirmation: true,
    fields: ["amount"],
    buildPayload: ({ values }) => ({
      amount: Math.round(Number.parseFloat(values.amountDollars || "0") * 100),
    }),
  },
  approve_staged_gift: {
    actionType: "approve_staged_gift",
    title: "Approve and post gift",
    description: "Approves the staged gift and queues it for CRM posting.",
    category: "crm",
    riskCopy: null,
    downstreamEffects: ["The gift posts to the CRM as workflow metadata."],
    requiresReason: false,
    requiresConfirmation: false,
    fields: [],
    buildPayload: () => ({}),
  },
  retry_staged_gift: {
    actionType: "retry_staged_gift",
    title: "Retry CRM posting",
    description: "Retries the failed CRM posting for this gift.",
    category: "crm",
    riskCopy: null,
    downstreamEffects: ["The gift reposts to the CRM."],
    requiresReason: false,
    requiresConfirmation: false,
    fields: [],
    buildPayload: () => ({}),
  },
  stripe_replay: {
    actionType: "stripe_replay",
    title: "Replay provider webhook",
    description:
      "Replays the stored provider event for technical recovery. Role-gated and audited.",
    category: "provider",
    riskCopy:
      "Provider replay is a technical operation. It is idempotent and audited, but should only be used to recover missed events.",
    downstreamEffects: ["The stored provider event is reprocessed."],
    requiresReason: true,
    requiresConfirmation: true,
    fields: [],
    buildPayload: () => ({}),
  },
};

export const OPERATION_CATEGORY_LABELS: Record<OperationCategory, string> = {
  correction: "Correction",
  receipt: "Receipt",
  refund: "Refund",
  crm: "CRM / Twenty",
  provider: "Provider / Admin",
};

type ShellPhase =
  | { name: "form" }
  | { name: "submitting" }
  | { name: "success"; result: ContributionActionResult }
  | { name: "failure"; message: string };

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
    throw new Error(body?.error ?? "The operation failed.");
  }

  return body.result;
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
  onRowRefresh?: () => void;
}) {
  const queryClient = useQueryClient();
  const detailQuery = useContributionDetail(open ? donationId : null);
  const [phase, setPhase] = useState<ShellPhase>({ name: "form" });
  const [values, setValues] = useState<OperationFieldValues>({
    reason: "",
    confirmed: false,
  });
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const reasonId = useId();
  const amountId = useId();
  const fundId = useId();
  const confirmId = useId();

  // Reset the form whenever a different operation/gift opens. State is
  // adjusted during render (React's documented pattern) so no effect-driven
  // cascading renders are needed.
  const nextOpenKey = open
    ? `${donationId ?? ""}:${operation?.actionType ?? ""}`
    : null;
  if (nextOpenKey !== openKey) {
    setOpenKey(nextOpenKey);
    if (nextOpenKey) {
      setPhase({ name: "form" });
      setValues({ reason: "", confirmed: false });
      setIdempotencyKey(crypto.randomUUID());
    }
  }

  const detail = detailQuery.data;
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

  const blocked = availability
    ? !availability.available
    : Boolean(detail && operation);
  const blockedReason =
    availability?.blockedReason ??
    "This operation is not available for the current gift.";
  const blockedNextStep =
    availability?.nextStep ??
    "Refresh the gift detail or choose another action.";
  const amountError = (() => {
    if (!operation.fields.includes("amount")) {
      return null;
    }
    const parsed = Number.parseFloat(values.amountDollars || "");
    return Number.isFinite(parsed) && parsed > 0
      ? null
      : "Enter a valid amount.";
  })();
  const fundError =
    operation.fields.includes("fundId") && !values.fundId?.trim()
      ? "Enter the destination fund."
      : null;
  const reasonError =
    operation.requiresReason && !values.reason.trim()
      ? "A reason is required for this operation."
      : null;
  const confirmError =
    operation.requiresConfirmation && !values.confirmed
      ? "Confirm the change to continue."
      : null;
  const validationMessage =
    amountError ?? fundError ?? reasonError ?? confirmError;

  const handleSubmit = async () => {
    if (!donationId || validationMessage || blocked) {
      return;
    }
    setPhase({ name: "submitting" });
    try {
      const result = await submitOperation({
        actionType: operation.actionType,
        contributionId: donationId,
        stagedGiftId: detail?.stagedGift?.id ?? null,
        sourceSurface,
        reason: values.reason.trim() || null,
        confirmationToken: operation.requiresConfirmation
          ? idempotencyKey
          : null,
        expectedRevision: detail?.revision ?? null,
        idempotencyKey,
        payload: operation.buildPayload({
          values,
          stagedGiftId: detail?.stagedGift?.id ?? null,
        }),
      });
      await invalidateContributionOperationQueries(queryClient);
      onRowRefresh?.();
      setPhase({ name: "success", result });
    } catch (error) {
      // Failure preserves the entered form state for recovery (ADR-CD-033).
      setPhase({
        name: "failure",
        message:
          error instanceof Error ? error.message : "The operation failed.",
      });
    }
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
  const amountCurrencyCode = detail?.shared.currencyCode ?? "USD";

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

        {detailQuery.isPending && (
          <p role="status" className="text-sm text-muted-foreground">
            Loading current gift values…
          </p>
        )}

        {blocked && (
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
          </div>
        )}

        {!blocked &&
          phase.name !== "success" &&
          phase.name !== "submitting" && (
            <div className="space-y-4">
              {effectiveSummary}

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
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        amountDollars: event.target.value,
                      }))
                    }
                    className="h-11"
                  />
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
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        fundId: event.target.value,
                      }))
                    }
                    className="h-11"
                  />
                  <FieldError
                    id={`${fundId}-error`}
                    errors={fundError ? [{ message: fundError }] : []}
                  />
                </Field>
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
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        reason: event.target.value,
                      }))
                    }
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
                    onCheckedChange={(checked) =>
                      setValues((prev) => ({
                        ...prev,
                        confirmed: checked === true,
                      }))
                    }
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

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Button variant="outline" className="h-11" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="h-11"
                  disabled={Boolean(validationMessage) || detailQuery.isPending}
                  onClick={() => void handleSubmit()}
                >
                  {phase.name === "failure" ? "Retry" : operation.title}
                </Button>
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
          <div className="space-y-3" data-testid="operation-result-panel">
            <p
              role="status"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <CircleCheck className="size-4" aria-hidden />
              {phase.result.approvalStatus === "pending_approval"
                ? "Correction request submitted for approval."
                : "Operation completed."}
            </p>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {phase.result.correctionRequestId && (
                <li>Approval request: {phase.result.correctionRequestId}</li>
              )}
              {phase.result.adjustmentId && (
                <li>Adjustment: {phase.result.adjustmentId}</li>
              )}
              {phase.result.receiptOutcome &&
                phase.result.receiptOutcome.status !== "not_required" && (
                  <li>
                    Receipt:{" "}
                    {phase.result.receiptOutcome.status.replace(/_/g, " ")}
                  </li>
                )}
              <li>Audit event: {phase.result.auditEventId}</li>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
