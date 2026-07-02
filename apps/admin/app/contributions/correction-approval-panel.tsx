import { Button } from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { invalidateContributionOperationQueries } from "./contribution-detail-overlay";
import {
  ReceiptDeliveryChoiceField,
  receiptSnapshotPdfUrl,
  resolveInitialReceiptDeliveryValue,
  type ContributionReceiptDeliveryContext,
  type ReceiptDeliveryProposal,
  type ReceiptDeliveryValue,
} from "./receipt-delivery-choice";

import type { ReceiptDeliveryOutcome } from "@asym/api/admin/contribution-operations";

/**
 * Inline approval panel for pending contribution correction requests
 * (AL-263, ADR-CD-005 / ADR-CD-030).
 *
 * Deciders review the requester's reason and proposed updated receipt
 * delivery, confirm or change the delivery at approval time, and approve or
 * reject in place. The server enforces decision policy; this panel only
 * mirrors it for a usable form.
 */

/**
 * Correction request entry from `detail.correctionRequests` (AL-263).
 * Structurally matches `ViewerProjectedContributionDetail["correctionRequests"]`
 * entries; the receipt fields stay optional because older payloads and
 * action-result projections omit them.
 */
export interface ContributionCorrectionRequestView {
  id: string;
  actionType: string;
  status: string;
  reason: string;
  requestedByProfileId: string | null;
  createdAt: string;
  receiptDeliveryProposal?: ReceiptDeliveryProposal | null;
  receiptAffectedFields?: string[];
  viewerCanDecide?: boolean;
}

interface CorrectionDecisionSuccess {
  decision: "approve" | "reject";
  receiptOutcome: ReceiptDeliveryOutcome | null;
}

async function postCorrectionRequestDecision(input: {
  requestId: string;
  decision: "approve" | "reject";
  reason: string | null;
  /** Null means the approver kept the requester's proposal. */
  receiptDelivery: ReceiptDeliveryProposal | null;
}): Promise<CorrectionDecisionSuccess> {
  const response = await fetch(
    `/api/admin/contribution-operations/correction-requests/${encodeURIComponent(
      input.requestId,
    )}/decision`,
    {
      body: JSON.stringify({
        decision: input.decision,
        reason: input.reason,
        receiptDelivery: input.receiptDelivery,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    },
  );

  const body = (await response.json().catch(() => null)) as {
    result?: { receiptOutcome?: ReceiptDeliveryOutcome | null } | null;
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(body?.error ?? "The correction decision failed.");
  }

  return {
    decision: input.decision,
    receiptOutcome: body?.result?.receiptOutcome ?? null,
  };
}

function formatRequestedAt(createdAt: string): string {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CorrectionApprovalPanel({
  correctionRequests,
  receiptDelivery,
  onDecided,
}: {
  correctionRequests: ContributionCorrectionRequestView[];
  receiptDelivery?: ContributionReceiptDeliveryContext | null;
  onDecided?: () => void;
}) {
  // Decisions made in this session stay visible (with their receipt outcome
  // and PDF link) even after the refetched detail drops the pending entry.
  const [decidedOutcomes, setDecidedOutcomes] = useState<
    Record<string, CorrectionDecisionSuccess>
  >({});

  const pendingRequests = correctionRequests.filter(
    (request) =>
      request.status === "pending" &&
      request.viewerCanDecide === true &&
      !decidedOutcomes[request.id],
  );
  const decidedEntries = Object.entries(decidedOutcomes);

  if (pendingRequests.length === 0 && decidedEntries.length === 0) {
    return null;
  }

  return (
    <>
      <Separator />
      <section
        aria-label="Correction approvals"
        className="space-y-3"
        data-testid="correction-approval-panel"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Correction approvals
        </p>
        {pendingRequests.map((request) => (
          <CorrectionApprovalRequestCard
            key={request.id}
            request={request}
            receiptDelivery={receiptDelivery ?? null}
            onDecided={(outcome) => {
              setDecidedOutcomes((previous) => ({
                ...previous,
                [request.id]: outcome,
              }));
              onDecided?.();
            }}
          />
        ))}
        {decidedEntries.map(([requestId, outcome]) => (
          <CorrectionDecisionResult key={requestId} outcome={outcome} />
        ))}
      </section>
    </>
  );
}

function CorrectionApprovalRequestCard({
  request,
  receiptDelivery,
  onDecided,
}: {
  request: ContributionCorrectionRequestView;
  receiptDelivery: ContributionReceiptDeliveryContext | null;
  onDecided: (outcome: CorrectionDecisionSuccess) => void;
}) {
  const queryClient = useQueryClient();
  const decisionReasonId = useId();
  const [delivery, setDelivery] = useState<ReceiptDeliveryValue | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionReasonError, setDecisionReasonError] = useState<string | null>(
    null,
  );

  const proposal = request.receiptDeliveryProposal ?? null;
  const affectedFields = request.receiptAffectedFields ?? [];
  const showDelivery = Boolean(receiptDelivery) && affectedFields.length > 0;
  const deliveryValue: ReceiptDeliveryValue =
    delivery ??
    (receiptDelivery
      ? resolveInitialReceiptDeliveryValue({ receiptDelivery, proposal })
      : { choice: null, deferReason: "" });

  const deliveryError = (() => {
    if (!showDelivery || !receiptDelivery) {
      return null;
    }
    if (!deliveryValue.choice) {
      return receiptDelivery.requireDeliveryAction
        ? "Choose how the updated receipt is delivered."
        : null;
    }
    if (
      deliveryValue.choice === "defer" &&
      receiptDelivery.deferReasonRequired &&
      !deliveryValue.deferReason.trim()
    ) {
      return "A reason is required when deferring the updated receipt.";
    }
    return null;
  })();

  const decisionMutation = useMutation({
    mutationFn: postCorrectionRequestDecision,
    onError(error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The correction decision failed.",
      );
    },
    async onSuccess(outcome) {
      toast.success(
        outcome.decision === "approve"
          ? "Correction request approved."
          : "Correction request rejected.",
      );
      await invalidateContributionOperationQueries(queryClient);
      onDecided(outcome);
    },
  });

  const submitDecision = (decision: "approve" | "reject") => {
    if (decision === "reject" && !decisionReason.trim()) {
      setDecisionReasonError(
        "A reason is required to reject this correction request.",
      );
      return;
    }
    if (decision === "approve" && deliveryError) {
      // The delivery field already shows the error inline.
      return;
    }
    setDecisionReasonError(null);

    // Only send a delivery selection when the approver changed the
    // requester's proposal; null tells the server to keep the proposal.
    const selection: ReceiptDeliveryProposal | null =
      showDelivery && deliveryValue.choice
        ? {
            choice: deliveryValue.choice,
            deferReason:
              deliveryValue.choice === "defer"
                ? deliveryValue.deferReason.trim() || null
                : null,
          }
        : null;
    const changedFromProposal =
      selection !== null &&
      (proposal === null ||
        selection.choice !== proposal.choice ||
        (selection.deferReason ?? null) !== (proposal.deferReason ?? null));

    decisionMutation.mutate({
      requestId: request.id,
      decision,
      reason: decisionReason.trim() || null,
      receiptDelivery:
        decision === "approve" && changedFromProposal ? selection : null,
    });
  };

  return (
    <div
      className="space-y-3 rounded-lg border border-border bg-card p-4"
      data-testid={`correction-request-${request.id}`}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold capitalize text-foreground">
          {request.actionType.replace(/_/g, " ")}
        </p>
        <p className="text-xs text-muted-foreground">
          Requested {formatRequestedAt(request.createdAt)}
        </p>
        <p className="text-sm text-muted-foreground">{request.reason}</p>
      </div>

      {showDelivery && receiptDelivery && (
        <ReceiptDeliveryChoiceField
          affectedFields={affectedFields}
          receiptDelivery={receiptDelivery}
          value={deliveryValue}
          onChange={setDelivery}
          proposal={proposal}
          error={deliveryError}
        />
      )}

      <Field data-invalid={Boolean(decisionReasonError)}>
        <FieldLabel htmlFor={decisionReasonId}>Decision reason</FieldLabel>
        <Textarea
          id={decisionReasonId}
          aria-invalid={Boolean(decisionReasonError)}
          value={decisionReason}
          onChange={(event) => setDecisionReason(event.target.value)}
          placeholder="Required to reject; optional when approving."
        />
        <FieldError
          errors={decisionReasonError ? [{ message: decisionReasonError }] : []}
        />
      </Field>

      {decisionMutation.isPending ? (
        <p role="status" className="flex items-center gap-2 text-sm">
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          Submitting decision…
        </p>
      ) : (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="h-9"
            onClick={() => submitDecision("reject")}
          >
            Reject
          </Button>
          <Button className="h-9" onClick={() => submitDecision("approve")}>
            Approve
          </Button>
        </div>
      )}
    </div>
  );
}

function CorrectionDecisionResult({
  outcome,
}: {
  outcome: CorrectionDecisionSuccess;
}) {
  const receiptOutcome = outcome.receiptOutcome;

  return (
    <div
      className="space-y-2 rounded-lg border border-border bg-muted/30 p-4"
      data-testid="correction-decision-result"
    >
      <p
        role="status"
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <CircleCheck className="size-4" aria-hidden />
        {outcome.decision === "approve"
          ? "Correction request approved."
          : "Correction request rejected."}
      </p>
      {receiptOutcome && receiptOutcome.status !== "not_required" && (
        <p className="text-xs text-muted-foreground">
          Receipt: {receiptOutcome.status.replace(/_/g, " ")}
        </p>
      )}
      {receiptOutcome?.status === "pdf_generated" &&
        receiptOutcome.snapshotId && (
          <a
            href={receiptSnapshotPdfUrl(receiptOutcome.snapshotId)}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-foreground underline underline-offset-2"
          >
            Download updated receipt PDF
          </a>
        )}
    </div>
  );
}
