import { contributionActionTitle } from "@asym/api/admin/contribution-operations/catalog";
import {
  CONTRIBUTION_ACTION_TYPES,
  type ContributionActionType,
} from "@asym/api/admin/contribution-operations/types";
import { readJsonBody } from "@asym/lib/http/fetch-result";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CircleCheck, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { invalidateContributionOperationQueries } from "./contribution-detail-query";
import {
  ReceiptDeliveryChoiceField,
  type ContributionReceiptDeliveryContext,
  type ReceiptDeliveryProposal,
  type ReceiptDeliveryValue,
} from "./receipt-delivery-choice";
import {
  receiptOutcomeStatusLabel,
  receiptSnapshotPdfUrl,
  resolveInitialReceiptDeliveryValue,
  resolveReceiptDeliveryError,
} from "./receipt-delivery-model";

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
  /** Requester's display name, when the detail read model could name them. */
  requestedByName?: string | null;
  createdAt: string;
  /**
   * What the request changes, as current → proposed lines built from its own
   * payload. Null when the payload cannot be read: the change is unknown, so
   * the request cannot be approved here.
   */
  proposedChange?: CorrectionChangeLine[] | null;
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

  const { ok, body } = await readJsonBody<{
    result?: { receiptOutcome?: ReceiptDeliveryOutcome | null } | null;
    error?: string;
  }>(response);

  if (!ok) {
    throw new Error(body?.error ?? "The correction decision failed.");
  }

  return {
    decision: input.decision,
    receiptOutcome: body?.result?.receiptOutcome ?? null,
  };
}

function isContributionActionType(
  value: string,
): value is ContributionActionType {
  return (CONTRIBUTION_ACTION_TYPES as readonly string[]).includes(value);
}

/**
 * Name the amount request as the Needs attention summary does. Other known
 * requests use their catalog title; unknown older keys read generically.
 */
function correctionRequestTitle(actionType: string): string {
  if (actionType === "amount_correction") {
    return "Amount correction";
  }
  return isContributionActionType(actionType)
    ? contributionActionTitle(actionType)
    : "Correction request";
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

export interface CorrectionChangeLine {
  label: string;
  from: string | null;
  to: string;
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
  const headingId = useId();
  if (pendingRequests.length === 0 && decidedEntries.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 border-t pt-6"
      data-testid="correction-approval-panel"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id={headingId} className="text-sm font-medium text-foreground">
          Correction approvals
        </h3>
        {pendingRequests.length > 0 ? (
          <Badge variant="warning">
            {pendingRequests.length} awaiting decision
          </Badge>
        ) : null}
      </div>
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
  const changeLines = request.proposedChange ?? null;
  const changeUnreadable = changeLines === null;
  const affectedFields = request.receiptAffectedFields ?? [];
  const showDelivery = Boolean(receiptDelivery) && affectedFields.length > 0;
  const deliveryValue: ReceiptDeliveryValue =
    delivery ??
    (receiptDelivery
      ? resolveInitialReceiptDeliveryValue({ receiptDelivery, proposal })
      : { choice: null, deferReason: "" });
  const deliveryError = showDelivery
    ? resolveReceiptDeliveryError({
        receiptDelivery,
        value: deliveryValue,
      })
    : null;

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

  // The decision in flight, so its button can show progress in place.
  const pendingDecision = decisionMutation.isPending
    ? (decisionMutation.variables?.decision ?? null)
    : null;

  const submitDecision = (decision: "approve" | "reject") => {
    if (decisionMutation.isPending) {
      return;
    }
    if (decision === "reject" && !decisionReason.trim()) {
      setDecisionReasonError(
        "A reason is required to reject this correction request.",
      );
      return;
    }
    if (decision === "approve" && changeUnreadable) {
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
      className="flex flex-col gap-4 rounded-lg border p-4"
      data-testid={`correction-request-${request.id}`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {correctionRequestTitle(request.actionType)}
        </p>
        <p className="text-xs text-muted-foreground">
          {request.requestedByName
            ? `Requested by ${request.requestedByName} · `
            : "Requested "}
          {formatRequestedAt(request.createdAt)}
        </p>
      </div>
      {changeLines ? (
        <ul
          aria-label="Proposed change"
          className="flex flex-col gap-1.5 rounded-md bg-muted/50 px-3 py-2"
        >
          {changeLines.map((line) => (
            <li
              key={line.label}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm"
            >
              <span className="text-muted-foreground">{line.label}</span>
              {line.from !== null ? (
                <>
                  <span className="text-foreground tabular-nums">
                    {line.from}
                  </span>
                  <ArrowRight
                    className="size-3.5 self-center text-muted-foreground"
                    aria-label="changes to"
                  />
                </>
              ) : null}
              <span className="font-medium text-foreground tabular-nums">
                {line.to}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Alert>
          <TriangleAlert aria-hidden="true" />
          <AlertDescription>
            This request&apos;s change can&apos;t be read, so it can&apos;t be
            approved here. Reject it with a reason and ask for a new request.
          </AlertDescription>
        </Alert>
      )}
      <p className="border-l-2 pl-3 text-sm text-foreground">
        {request.reason}
      </p>

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
          aria-describedby={
            decisionReasonError ? `${decisionReasonId}-error` : undefined
          }
          value={decisionReason}
          onChange={(event) => setDecisionReason(event.target.value)}
          placeholder="Required to reject; optional when approving."
        />
        <FieldError
          id={`${decisionReasonId}-error`}
          errors={decisionReasonError ? [{ message: decisionReasonError }] : []}
        />
      </Field>

      {/* Both buttons stay mounted while a decision submits, so focus stays
          on the clicked one; the always-mounted status announces progress. */}
      <div className="flex flex-wrap justify-end gap-2">
        <span role="status" className="sr-only">
          {pendingDecision === "approve"
            ? "Approving correction…"
            : pendingDecision === "reject"
              ? "Rejecting correction…"
              : ""}
        </span>
        <Button
          variant="outline"
          disabled={decisionMutation.isPending}
          focusableWhenDisabled={pendingDecision === "reject"}
          aria-busy={pendingDecision === "reject" || undefined}
          onClick={() => submitDecision("reject")}
        >
          {pendingDecision === "reject" ? (
            <>
              <Spinner aria-hidden="true" data-icon="inline-start" />
              Rejecting…
            </>
          ) : (
            "Reject"
          )}
        </Button>
        <Button
          disabled={
            decisionMutation.isPending ||
            changeUnreadable ||
            Boolean(deliveryError)
          }
          focusableWhenDisabled={pendingDecision === "approve"}
          aria-busy={pendingDecision === "approve" || undefined}
          onClick={() => submitDecision("approve")}
        >
          {pendingDecision === "approve" ? (
            <>
              <Spinner aria-hidden="true" data-icon="inline-start" />
              Approving…
            </>
          ) : (
            "Approve"
          )}
        </Button>
      </div>
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
      className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4"
      data-testid="correction-decision-result"
    >
      <p
        role="status"
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <CircleCheck className="size-4 text-success" aria-hidden="true" />
        {outcome.decision === "approve"
          ? "Correction request approved."
          : "Correction request rejected."}
      </p>
      {receiptOutcome && receiptOutcome.status !== "not_required" && (
        <p className="text-xs text-muted-foreground">
          Receipt: {receiptOutcomeStatusLabel(receiptOutcome.status)}
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
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
    </div>
  );
}
