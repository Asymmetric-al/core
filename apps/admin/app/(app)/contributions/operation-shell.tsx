"use client";

// Import values from pure submodules, not the package barrel: the barrel
// re-exports server-only modules (Stripe refunds, Supabase access) that must
// not be evaluated in this client component's bundle.
import { parseAmountToCents } from "@asym/api/admin/contribution-operations/catalog";
import {
  CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP,
  CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
  isContributionRouteCrmRetryScopeSupported,
} from "@asym/api/admin/contribution-operations/crm-retry-support";
import { isFailedProviderOutcomeStatus } from "@asym/api/admin/contribution-operations/types";
import {
  formatSharedContributionAmount,
  SHARED_RECEIPT_STATUS_LABELS,
} from "@asym/api/admin/contribution-shared";
import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
import { readJsonBody } from "@asym/lib/http/fetch-result";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CircleCheck,
  CircleX,
  Clock3,
  Info,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  invalidateContributionOperationQueries,
  isContributionGiftParam,
  useContributionDetail,
} from "./contribution-detail-query";
import {
  ReceiptDeliveryChoiceField,
  type ContributionReceiptDeliveryContext,
  type ReceiptDeliveryProposal,
  type ReceiptDeliveryValue,
} from "./receipt-delivery-choice";
import {
  receiptDeliveryChoiceLabel,
  receiptOutcomeStatusLabel,
  receiptSnapshotPdfUrl,
  resolveInitialReceiptDeliveryValue,
  resolveReceiptDeliveryError,
} from "./receipt-delivery-model";

// Type-only imports are erased at compile time, so pulling this one type
// from the barrel does not evaluate its server-only modules in the client
// bundle (matches contribution-detail-overlay.tsx).
import type { CrmPostFailedScope } from "@asym/api/admin/contribution-operations";
import type {
  OperationDefinition,
  OperationFieldValues,
} from "@asym/api/admin/contribution-operations/catalog";
import type {
  ContributionActionResult,
  ContributionActionType,
  ContributionSourceSurface,
  ReceiptDeliveryOutcome,
} from "@asym/api/admin/contribution-operations/types";

/**
 * The operation's name as this gift reads it: the receipt operation is a
 * resend once a receipt was sent (as the gift row's button says), a first
 * send otherwise.
 */
function operationCopy(
  operation: { actionType: string; title: string; description: string },
  receiptStatus: string | undefined,
): { title: string; description: string } {
  if (operation.actionType !== "resend_receipt") {
    return { title: operation.title, description: operation.description };
  }
  return receiptStatus === "sent"
    ? {
        title: "Resend receipt",
        description: "Sends the gift receipt to the donor again.",
      }
    : {
        title: "Send receipt",
        description: "Sends the gift receipt to the donor.",
      };
}

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

export type { OperationDefinition, OperationFieldValues };

type OperationDetail = ReturnType<typeof useContributionDetail>["data"];

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

  const parsed = await readJsonBody<{
    result?: ContributionActionResult;
    error?: string;
  }>(response);
  const body = parsed.body;

  if (!parsed.ok || !body?.result) {
    throw new ContributionOperationRequestError(
      body?.error ?? "The operation failed.",
      parsed.status,
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
  const { requested, confirmed, changedByApprover, deferReason } =
    resolveReceiptOutcomePresentation(outcome);

  return (
    <>
      <li>Receipt: {receiptOutcomeStatusLabel(outcome.status)}</li>
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
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      )}
    </>
  );
}

export function ContributionOperationShell(
  props: Parameters<typeof useContributionOperationSession>[0],
) {
  const session = useContributionOperationSession(props);
  return session ? <ContributionOperationDialog session={session} /> : null;
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
      ? "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-foreground"
      : tone === "warning"
        ? "flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm font-medium text-foreground"
        : "flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-sm font-medium text-foreground";

  return (
    <div className="flex flex-col gap-4" data-testid="operation-result-panel">
      <OperationResultHeadline
        tone={tone}
        headlineClassName={headlineClassName}
        headline={headline}
      />
      {refreshFailed && (
        <Alert role="alert">
          <TriangleAlert aria-hidden="true" />
          <AlertDescription>
            The submission succeeded, but the displayed gift data may be stale
            because refresh failed. Closing and reopening this gift will retry
            loading current values.
          </AlertDescription>
        </Alert>
      )}
      <OperationResultDetails
        result={result}
        submittedReceiptDelivery={submittedReceiptDelivery}
        providerOutcome={providerOutcome}
        tone={tone}
      />
      <OperationResultActions
        onOpenFullDetail={onOpenFullDetail}
        donationId={donationId}
        onClose={onClose}
      />
    </div>
  );
}

function OperationLoadingSection({
  detailLoading,
  onClose,
}: {
  detailLoading: boolean;
  onClose: () => void;
}) {
  return (
    detailLoading && (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-sm text-muted-foreground">
          Loading current gift values…
        </p>
        <div
          aria-hidden="true"
          className="flex flex-col gap-2 rounded-lg border p-3"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </div>
    )
  );
}

function OperationBlockedSection({
  blocked,
  detailLoading,
  blockedReason,
  blockedNextStep,
  operationBlock,
  onOpenFullDetail,
  donationId,
}: {
  blocked: boolean;
  detailLoading: boolean;
  blockedReason: string;
  blockedNextStep: string;
  operationBlock: { reason: string; nextStep: string } | null;
  onOpenFullDetail: ((donationId: string) => void) | undefined;
  donationId: string | null;
}) {
  return (
    blocked &&
    !detailLoading && (
      <div role="note" className="flex gap-3 rounded-lg border bg-muted/30 p-4">
        <Info
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{blockedReason}</p>
          {blockedNextStep && (
            <p className="text-sm text-muted-foreground">{blockedNextStep}</p>
          )}
          {operationBlock && onOpenFullDetail && donationId && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 self-start"
              onClick={() => onOpenFullDetail(donationId)}
            >
              View full contribution detail
            </Button>
          )}
        </div>
      </div>
    )
  );
}

function OperationRiskNotices({
  pendingRefundMessage,
  operation,
}: {
  pendingRefundMessage: string | null;
  operation: OperationDefinition;
}) {
  return (
    <>
      {pendingRefundMessage && (
        <Alert role="status" data-testid="pending-refund-notice">
          <Clock3 aria-hidden="true" />
          <AlertDescription>
            {pendingRefundMessage} Submitting another refund is blocked until
            the provider confirms or the pending refund fails.
          </AlertDescription>
        </Alert>
      )}

      {operation.riskCopy && (
        // Money leaving for good reads as destructive; other risks warn.
        <Alert
          role="note"
          variant={operation.category === "refund" ? "destructive" : "warning"}
        >
          <TriangleAlert aria-hidden="true" />
          <AlertDescription>{operation.riskCopy}</AlertDescription>
        </Alert>
      )}

      {operation.downstreamEffects.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-foreground">What changes</p>
          <ul className="flex list-disc flex-col gap-1 ps-4 text-xs text-muted-foreground">
            {operation.downstreamEffects.map((effect) => (
              <li key={effect}>{effect}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function OperationAmountField({
  operation,
  amountError,
  amountId,
  amountCurrencyCode,
  values,
  captureDraftRevision,
  setValues,
  isRefundOperation,
}: {
  operation: OperationDefinition;
  amountError: string | null;
  amountId: string;
  amountCurrencyCode: string;
  values: OperationFieldValues;
  captureDraftRevision: () => void;
  setValues: React.Dispatch<React.SetStateAction<OperationFieldValues>>;
  isRefundOperation: boolean;
}) {
  return (
    operation.fields.includes("amount") && (
      <Field data-invalid={Boolean(amountError)}>
        <FieldLabel htmlFor={amountId}>
          Amount ({amountCurrencyCode})
        </FieldLabel>
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
    )
  );
}

interface OperationFundRow {
  id: string;
  name: string | null;
  tenant_id: string | null;
}

const OPERATION_FUNDS_QUERY_KEY = [
  "admin",
  "contribution-operations",
  "funds",
] as const;

/** The directory's page size cap; a full page means there may be more. */
const FUND_PAGE_SIZE = 200;
/** Stops a directory that keeps returning full pages from looping forever. */
const MAX_FUND_PAGES = 50;

/**
 * Every fund in the gift's organization, read page by page so a fund past
 * the first page can still be chosen. The server holds non-super-admins to
 * their own tenant whatever `tenantId` says.
 */
async function fetchOperationFunds(
  tenantId: string,
): Promise<{ funds: OperationFundRow[]; complete: boolean }> {
  const funds: OperationFundRow[] = [];
  for (let pageIndex = 0; pageIndex < MAX_FUND_PAGES; pageIndex += 1) {
    const offset = pageIndex * FUND_PAGE_SIZE;
    const params = new URLSearchParams({
      limit: String(FUND_PAGE_SIZE),
      offset: String(offset),
      tenantId,
    });
    const response = await fetch(`/api/admin/funds?${params.toString()}`, {
      headers: { accept: "application/json" },
    });
    const parsed = await readJsonBody<{ funds?: OperationFundRow[] }>(response);
    if (!parsed.ok) {
      throw new Error("Couldn’t load funds.");
    }
    const page = parsed.body?.funds ?? [];
    funds.push(...page);
    if (page.length < FUND_PAGE_SIZE) {
      return { funds, complete: true };
    }
  }
  return { funds, complete: false };
}

function OperationFundField({
  operation,
  fundError,
  fundId,
  values,
  captureDraftRevision,
  setValues,
  detail,
}: {
  operation: OperationDefinition;
  fundError: string | null;
  fundId: string;
  values: OperationFieldValues;
  captureDraftRevision: () => void;
  setValues: React.Dispatch<React.SetStateAction<OperationFieldValues>>;
  detail: OperationDetail;
}) {
  return (
    operation.fields.includes("fundId") && (
      <OperationFundPicker
        fundError={fundError}
        fundId={fundId}
        values={values}
        captureDraftRevision={captureDraftRevision}
        setValues={setValues}
        detail={detail}
      />
    )
  );
}

/**
 * Destination fund chosen by name from the gift's own organization. It
 * submits the fund id the operation expects; staff never type one, and the
 * server still checks the fund belongs to the gift's tenant.
 */
function OperationFundPicker({
  fundError,
  fundId,
  values,
  captureDraftRevision,
  setValues,
  detail,
}: {
  fundError: string | null;
  fundId: string;
  values: OperationFieldValues;
  captureDraftRevision: () => void;
  setValues: React.Dispatch<React.SetStateAction<OperationFieldValues>>;
  detail: OperationDetail;
}) {
  // Without the gift's organization there is no safe list to offer.
  const tenantId = detail?.tenantId ?? null;
  const currentFundId = detail?.shared.designationSummary.fundId ?? null;
  const fundsQuery = useQuery({
    enabled: Boolean(tenantId),
    queryKey: [...OPERATION_FUNDS_QUERY_KEY, tenantId],
    queryFn: () => fetchOperationFunds(tenantId!),
    retry: 1,
    staleTime: 60_000,
  });
  const fundOptions = useMemo(
    () =>
      (fundsQuery.data?.funds ?? [])
        // Backstop for a super admin's cross-tenant directory: only this
        // gift's own funds, and never the fund it already uses.
        .filter(
          (fund) => fund.tenant_id === tenantId && fund.id !== currentFundId,
        )
        .map((fund) => ({
          value: fund.id,
          label: fund.name?.trim() || "Unnamed fund",
        })),
    [currentFundId, fundsQuery.data, tenantId],
  );
  const loadFailed = !tenantId || fundsQuery.isError;
  const loadErrorId = `${fundId}-load-error`;
  const describedBy =
    [fundError ? `${fundId}-error` : null, loadFailed ? loadErrorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Field data-invalid={Boolean(fundError)}>
      <FieldLabel htmlFor={fundId}>Destination fund</FieldLabel>
      <SearchableSelect
        id={fundId}
        aria-label="Destination fund"
        aria-describedby={describedBy}
        aria-invalid={Boolean(fundError)}
        searchLabel="Search funds"
        items={fundOptions}
        value={values.fundId ? values.fundId : null}
        disabled={loadFailed || fundsQuery.isPending}
        placeholder={
          !loadFailed && fundsQuery.isPending
            ? "Loading funds…"
            : "Choose a fund"
        }
        onValueChange={(nextFundId) => {
          captureDraftRevision();
          setValues((prev) => ({
            ...prev,
            fundId: nextFundId ?? "",
          }));
        }}
      />
      {loadFailed ? (
        <div
          id={loadErrorId}
          className="flex flex-wrap items-center gap-2 text-sm text-destructive"
        >
          <span>
            {tenantId
              ? "Couldn’t load funds."
              : "Couldn’t tell which organization this gift belongs to."}
          </span>
          {tenantId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void fundsQuery.refetch()}
            >
              <RotateCcw aria-hidden="true" data-icon="inline-start" />
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}
      {fundsQuery.data && !fundsQuery.data.complete ? (
        <FieldDescription>
          Only the first {(MAX_FUND_PAGES * FUND_PAGE_SIZE).toLocaleString()}{" "}
          funds are listed.
        </FieldDescription>
      ) : null}
      <FieldError
        id={`${fundId}-error`}
        errors={fundError ? [{ message: fundError }] : []}
      />
    </Field>
  );
}

function OperationReceiptField({
  receiptDelivery,
  operation,
  deliveryValue,
  captureDraftRevision,
  setDelivery,
  deliveryError,
  submitting,
}: {
  receiptDelivery: ContributionReceiptDeliveryContext | null;
  operation: OperationDefinition;
  deliveryValue: ReceiptDeliveryValue;
  captureDraftRevision: () => void;
  setDelivery: React.Dispatch<
    React.SetStateAction<ReceiptDeliveryValue | null>
  >;
  deliveryError: string | null;
  submitting: boolean;
}) {
  return (
    receiptDelivery && (
      <ReceiptDeliveryChoiceField
        affectedFields={operation.receiptFields}
        receiptDelivery={receiptDelivery}
        value={deliveryValue}
        onChange={(nextDelivery) => {
          captureDraftRevision();
          setDelivery(nextDelivery);
        }}
        error={deliveryError}
        disabled={submitting}
      />
    )
  );
}

function OperationReasonField({
  operation,
  reasonError,
  reasonId,
  values,
  captureDraftRevision,
  setValues,
  onBlur,
}: {
  operation: OperationDefinition;
  reasonError: string | null;
  reasonId: string;
  values: OperationFieldValues;
  captureDraftRevision: () => void;
  setValues: React.Dispatch<React.SetStateAction<OperationFieldValues>>;
  onBlur: () => void;
}) {
  return (
    operation.requiresReason && (
      <Field data-invalid={Boolean(reasonError)}>
        <FieldLabel htmlFor={reasonId}>Reason</FieldLabel>
        <Textarea
          id={reasonId}
          aria-describedby={reasonError ? `${reasonId}-error` : undefined}
          aria-invalid={Boolean(reasonError)}
          value={values.reason}
          onBlur={onBlur}
          onChange={(event) => {
            captureDraftRevision();
            setValues((prev) => ({
              ...prev,
              reason: event.target.value,
            }));
          }}
          placeholder="Why is this change needed?"
        />
        <FieldDescription>
          Recorded in the gift&apos;s audit trail.
        </FieldDescription>
        <FieldError
          id={`${reasonId}-error`}
          errors={reasonError ? [{ message: reasonError }] : []}
        />
      </Field>
    )
  );
}

function OperationConfirmationField({
  operation,
  confirmError,
  confirmId,
  values,
  captureDraftRevision,
  setValues,
  onTouched,
  submitting,
}: {
  operation: OperationDefinition;
  confirmError: string | null;
  confirmId: string;
  values: OperationFieldValues;
  captureDraftRevision: () => void;
  setValues: React.Dispatch<React.SetStateAction<OperationFieldValues>>;
  onTouched: () => void;
  submitting: boolean;
}) {
  return (
    operation.requiresConfirmation && (
      <Field data-invalid={Boolean(confirmError)} orientation="horizontal">
        {/* Disabled explicitly: a native fieldset does not reach Base UI's
            span-rendered checkbox. */}
        <Checkbox
          id={confirmId}
          disabled={submitting}
          aria-describedby={confirmError ? `${confirmId}-error` : undefined}
          aria-invalid={Boolean(confirmError)}
          checked={values.confirmed}
          onCheckedChange={(checked) => {
            captureDraftRevision();
            onTouched();
            setValues((prev) => ({
              ...prev,
              confirmed: checked === true,
            }));
          }}
        />
        <FieldContent>
          <FieldLabel htmlFor={confirmId}>
            I reviewed the current values and downstream effects and want to
            submit this change.
          </FieldLabel>
          <FieldError
            id={`${confirmId}-error`}
            errors={confirmError ? [{ message: confirmError }] : []}
          />
        </FieldContent>
      </Field>
    )
  );
}

function OperationDraftErrors({
  phase,
  hasBackgroundConflict,
}: {
  phase: ShellPhase;
  hasBackgroundConflict: boolean;
}) {
  return (
    <>
      {phase.name === "failure" && (
        <Alert variant="destructive" role="alert">
          <CircleX aria-hidden="true" />
          <AlertDescription>{phase.message}</AlertDescription>
        </Alert>
      )}

      {hasBackgroundConflict && phase.name !== "failure" && (
        <Alert variant="destructive" role="alert">
          <CircleX aria-hidden="true" />
          <AlertDescription>
            This gift changed while you were editing. Review the latest current
            values above, then reload to start again or discard this draft.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

function OperationFormActions({
  onClose,
  needsStaleDraftRecovery,
  detailQuery,
  confirmId,
  handleReloadLatestDetail,
  validationMessage,
  pendingRefundMessage,
  detail,
  availability,
  hasBackgroundConflict,
  handleSubmit,
  phase,
  operation,
  requirementHint,
}: {
  requirementHint: string | null;
  onClose: () => void;
  needsStaleDraftRecovery: boolean;
  detailQuery: ReturnType<typeof useContributionDetail>;
  confirmId: string;
  handleReloadLatestDetail: () => Promise<void>;
  validationMessage: string | null;
  pendingRefundMessage: string | null;
  detail: ReturnType<typeof useContributionDetail>["data"];
  availability:
    | NonNullable<
        ReturnType<typeof useContributionDetail>["data"]
      >["actionAvailability"][number]
    | null;
  hasBackgroundConflict: boolean;
  handleSubmit: () => Promise<void>;
  phase: ShellPhase;
  operation: OperationDefinition;
}) {
  const submitting = phase.name === "submitting";
  return (
    <div
      data-slot="operation-form-actions"
      className="sticky -bottom-6 z-10 -mx-6 -mb-6 flex flex-col gap-3 border-t bg-background px-6 pt-4 pb-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p
        aria-live="polite"
        className="text-xs text-muted-foreground sm:max-w-1/2"
      >
        {submitting
          ? "Submitting…"
          : needsStaleDraftRecovery
            ? null
            : requirementHint}
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" disabled={submitting} onClick={onClose}>
          {needsStaleDraftRecovery ? "Discard draft" : "Cancel"}
        </Button>
        {needsStaleDraftRecovery ? (
          <Button
            disabled={detailQuery.isFetching}
            focusableWhenDisabled={detailQuery.isFetching}
            aria-labelledby={`${confirmId}-reload-label`}
            onClick={() => void handleReloadLatestDetail()}
          >
            <span id={`${confirmId}-reload-label`}>
              {detailQuery.isFetching
                ? "Reloading latest gift…"
                : "Reload latest gift"}
            </span>
          </Button>
        ) : (
          <Button
            disabled={
              submitting ||
              Boolean(validationMessage) ||
              Boolean(pendingRefundMessage) ||
              !detail ||
              !availability?.available ||
              detailQuery.isPending ||
              hasBackgroundConflict
            }
            // Focus stays on the submit while it works, and is on Retry if
            // the request fails.
            focusableWhenDisabled={submitting}
            aria-busy={submitting || undefined}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <>
                <Spinner aria-hidden="true" data-icon="inline-start" />
                Submitting…
              </>
            ) : phase.name === "failure" ? (
              "Retry"
            ) : (
              operationCopy(operation, detail?.shared.receiptStatus).title
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function OperationResultHeadline({
  tone,
  headlineClassName,
  headline,
}: {
  tone: OperationResultTone;
  headlineClassName: string;
  headline: string;
}) {
  return (
    <p
      role={tone === "failure" || tone === "warning" ? "alert" : "status"}
      className={headlineClassName}
    >
      {tone === "failure" ? (
        <CircleX
          className="mt-0.5 size-4 shrink-0 text-destructive"
          aria-hidden="true"
        />
      ) : tone === "warning" ? (
        <TriangleAlert
          className="mt-0.5 size-4 shrink-0 text-warning"
          aria-hidden="true"
        />
      ) : tone === "pending" ? (
        <Clock3
          className="mt-0.5 size-4 shrink-0 text-info"
          aria-hidden="true"
        />
      ) : (
        <CircleCheck
          className="mt-0.5 size-4 shrink-0 text-success"
          aria-hidden="true"
        />
      )}
      {headline}
    </p>
  );
}

function OperationResultDetails({
  result,
  submittedReceiptDelivery,
  providerOutcome,
  tone,
}: {
  result: ContributionActionResult;
  submittedReceiptDelivery: ReceiptDeliveryProposal | null;
  providerOutcome: ContributionActionResult["providerOutcome"];
  tone: OperationResultTone;
}) {
  return (
    <ul className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 text-xs break-all text-muted-foreground">
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
  );
}

function OperationResultActions({
  onOpenFullDetail,
  donationId,
  onClose,
}: {
  onOpenFullDetail: ((donationId: string) => void) | undefined;
  donationId: string | null;
  onClose: () => void;
}) {
  return (
    <DialogFooter>
      {onOpenFullDetail && donationId && (
        <Button variant="outline" onClick={() => onOpenFullDetail(donationId)}>
          View full contribution detail
        </Button>
      )}
      <Button aria-label="Close operation result" onClick={onClose}>
        Close
      </Button>
    </DialogFooter>
  );
}

function OperationEffectiveSummary({
  detail,
  isRefundOperation,
  remainingRefundableCents,
}: {
  detail: OperationDetail;
  isRefundOperation: boolean;
  remainingRefundableCents: number | null;
}) {
  return detail ? (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
      <dt className="text-muted-foreground">Current amount</dt>
      <dd className="text-right font-medium text-foreground tabular-nums">
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
          <dd className="text-right font-medium text-foreground tabular-nums">
            {formatSharedContributionAmount(
              detail.original.amountCents,
              detail.shared.currencyCode,
            )}
          </dd>
          <dt className="text-muted-foreground">Refunded so far</dt>
          <dd className="text-right font-medium text-foreground tabular-nums">
            {formatSharedContributionAmount(
              detail.shared.refundedAmountCents,
              detail.shared.currencyCode,
            )}
          </dd>
          <dt className="text-muted-foreground">Remaining refundable</dt>
          <dd className="text-right font-medium text-foreground tabular-nums">
            {formatSharedContributionAmount(
              remainingRefundableCents ?? 0,
              detail.shared.currencyCode,
            )}
          </dd>
        </>
      )}
      <dt className="text-muted-foreground">Designation</dt>
      <dd className="text-right font-medium text-foreground">
        {detail.shared.designationSummary.fundName}
      </dd>
      <dt className="text-muted-foreground">Receipt</dt>
      <dd className="text-right font-medium text-foreground">
        {SHARED_RECEIPT_STATUS_LABELS[detail.shared.receiptStatus]}
      </dd>
    </dl>
  ) : null;
}

function resolveOperationAvailability({
  operation,
  detail,
  detailLoadBlock,
  availability,
}: {
  operation: OperationDefinition;
  detail: OperationDetail;
  detailLoadBlock: { reason: string; nextStep: string } | null;
  availability:
    NonNullable<OperationDetail>["actionAvailability"][number] | null;
}) {
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
    retryTargetScope,
    operationBlock,
    blocked,
    blockedReason,
    blockedNextStep,
  };
}

function resolveOperationValidation({
  operation,
  detail,
  values,
  delivery,
  isRefundOperation,
  remainingRefundableCents,
}: {
  operation: OperationDefinition;
  detail: OperationDetail;
  values: OperationFieldValues;
  delivery: ReceiptDeliveryValue | null;
  isRefundOperation: boolean;
  remainingRefundableCents: number | null;
}) {
  const amountCurrencyCode = detail?.shared.currencyCode ?? "USD";
  const amountError = (() => {
    if (!operation.fields.includes("amount")) {
      return null;
    }
    // The same strict parser builds the payload, so the amount checked
    // here is the amount submitted ("1,500.00" is $1,500.00; "600abc" and
    // "0.005" are not amounts at all).
    const cents = parseAmountToCents(values.amountDollars);
    if (cents === null || cents <= 0) {
      return "Enter a valid amount.";
    }
    if (!isRefundOperation) {
      return null;
    }
    // The server revalidates refunds against current truth on submit.
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
      ? "Choose the destination fund."
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

  return {
    amountCurrencyCode,
    amountError,
    fundError,
    receiptDelivery,
    deliveryValue,
    deliveryError,
    reasonError,
    confirmError,
    validationMessage,
  };
}

function resolveOperationRefund({
  isRefundOperation,
  detail,
}: {
  isRefundOperation: boolean;
  detail: OperationDetail;
}) {
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

  return { remainingRefundableCents, pendingRefundMessage };
}

function resolveReceiptOutcomePresentation(outcome: ReceiptDeliveryOutcome) {
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

  return { requested, confirmed, changedByApprover, deferReason };
}

function operationDraftKey(
  open: boolean,
  donationId: string | null,
  operation: OperationDefinition | null,
) {
  return open ? `${donationId ?? ""}:${operation?.actionType ?? ""}` : null;
}

function resolveOperationLoadState(
  detailQuery: ReturnType<typeof useContributionDetail>,
  donationId: string | null,
  draftRevision: string | null,
  phase: ShellPhase,
) {
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
  return {
    detailLoading,
    detailLoadBlock,
    latestRevision,
    hasBackgroundConflict,
    needsStaleDraftRecovery,
  };
}

function receiptDeliverySelectionFor(
  receiptDelivery: ContributionReceiptDeliveryContext | null,
  deliveryValue: ReceiptDeliveryValue,
): ReceiptDeliveryProposal | null {
  return receiptDelivery && deliveryValue.choice
    ? {
        choice: deliveryValue.choice,
        deferReason:
          deliveryValue.choice === "defer"
            ? deliveryValue.deferReason.trim() || null
            : null,
      }
    : null;
}

function operationSubmitPayload(
  operation: OperationDefinition,
  values: OperationFieldValues,
  stagedGiftId: string | null,
  retryTargetScope: CrmPostFailedScope | null,
) {
  const basePayload = operation.buildPayload({
    values,
    stagedGiftId: stagedGiftId,
  });
  const payload =
    operation.actionType === "retry_staged_gift"
      ? {
          ...basePayload,
          ...retryPayloadForScope(retryTargetScope),
        }
      : basePayload;
  return payload;
}

function classifyOperationRequestError(
  error: unknown,
): Extract<ShellPhase, { name: "failure" }> {
  const message =
    error instanceof Error ? error.message : "The operation failed.";
  const staleSave =
    error instanceof ContributionOperationRequestError && error.status === 409;
  return { name: "failure", message, staleSave };
}

/**
 * Quiet explanation for a disabled submit while required inputs are still
 * untouched (field errors appear once the staffer visits a field).
 */
function resolveRequirementHint({
  reasonOutstanding,
  confirmOutstanding,
  otherError,
}: {
  reasonOutstanding: boolean;
  confirmOutstanding: boolean;
  otherError: boolean;
}): string | null {
  if (otherError) return null;
  if (reasonOutstanding && confirmOutstanding) {
    return "Add a reason and confirm the change to submit.";
  }
  if (reasonOutstanding) return "Add a reason to submit.";
  if (confirmOutstanding) return "Confirm the change to submit.";
  return null;
}

function operationDraftVisible(
  blocked: boolean,
  detailPending: boolean,
  phase: ShellPhase,
) {
  // The draft stays mounted (and disabled) while it submits, so focus and
  // the entered values never vanish mid-request.
  return !blocked && !detailPending && phase.name !== "success";
}

/** The pinned row holding Cancel, the submit and why it is disabled. */
const OPERATION_FORM_ACTIONS_SELECTOR = '[data-slot="operation-form-actions"]';

/** The pinned header holding the title, the gift's identity and Close. */
const OPERATION_DIALOG_HEADER_SLOT = "operation-dialog-header";

/** Room left between a revealed field and the pinned header above it. */
const REVEAL_TOP_GAP_PX = 8;

/**
 * Scrolls the focused field so neither pinned edge covers it: the header
 * above, the form-actions row below. Fields keep a bottom scroll margin of
 * the row's height, so scrolling the field into view stops it above the
 * row. Runs after focus moves and whenever the dialog or the row changes
 * size: a field focused at one size can end up
 * under the row after a rotation, a narrower window or a phone keyboard
 * shrinks the dialog.
 */
function revealFocusedOperationField(dialog: HTMLElement) {
  const active = dialog.ownerDocument.activeElement;
  if (
    !(active instanceof HTMLElement) ||
    active === dialog ||
    !dialog.contains(active)
  ) {
    return;
  }
  const actions = dialog.querySelector(OPERATION_FORM_ACTIONS_SELECTOR);
  const header = dialog.querySelector(
    `[data-slot="${OPERATION_DIALOG_HEADER_SLOT}"]`,
  );
  if (actions?.contains(active) || header?.contains(active)) {
    return;
  }
  const bounds = dialog.getBoundingClientRect();
  const visibleTop = header
    ? header.getBoundingClientRect().bottom
    : bounds.top;
  const visibleBottom = actions
    ? actions.getBoundingClientRect().top
    : bounds.bottom;
  const field = active.getBoundingClientRect();
  if (field.bottom > visibleBottom) {
    active.scrollIntoView({ block: "nearest" });
  } else if (field.top < visibleTop) {
    // scrollIntoView would stop it under the pinned header.
    dialog.scrollTop -= visibleTop - field.top + REVEAL_TOP_GAP_PX;
  }
}

/** Keeps the focused field clear of the pinned edges while the dialog shows. */
function useKeepFocusedFieldInView(dialog: HTMLElement | null) {
  useEffect(() => {
    if (!dialog) {
      return;
    }
    // Once the staffer scrolls the form themselves (to re-read the summary,
    // say), a resize must not snap them back to the focused field. The next
    // focus move is a fresh request to see a field.
    let scrolledByUser = false;
    const reveal = () => {
      if (!scrolledByUser) {
        revealFocusedOperationField(dialog);
      }
    };
    // Runs after the browser's own focus scroll, which can leave the field
    // under the row.
    let frame = 0;
    const onFocusIn = () => {
      scrolledByUser = false;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(reveal);
    };
    const onUserScroll = () => {
      scrolledByUser = true;
    };
    dialog.addEventListener("focusin", onFocusIn);
    dialog.addEventListener("wheel", onUserScroll, { passive: true });
    dialog.addEventListener("touchmove", onUserScroll, { passive: true });
    // The dialog resizes with the viewport (rotation, window, keyboard) and
    // as its content loads.
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(reveal);
    observer?.observe(dialog);
    return () => {
      cancelAnimationFrame(frame);
      dialog.removeEventListener("focusin", onFocusIn);
      dialog.removeEventListener("wheel", onUserScroll);
      dialog.removeEventListener("touchmove", onUserScroll);
      observer?.disconnect();
    };
  }, [dialog]);
}

function ContributionOperationDialog({
  session,
}: {
  session: NonNullable<ReturnType<typeof useContributionOperationSession>>;
}) {
  const {
    open,
    onClose,
    operation,
    detailLoading,
    blocked,
    blockedReason,
    blockedNextStep,
    operationBlock,
    onOpenFullDetail,
    donationId,
    detailQuery,
    phase,
    detail,
    isRefundOperation,
    remainingRefundableCents,
    pendingRefundMessage,
    amountError,
    amountId,
    amountCurrencyCode,
    values,
    captureDraftRevision,
    setValues,
    fundError,
    fundId,
    receiptDelivery,
    deliveryValue,
    setDelivery,
    deliveryError,
    reasonError,
    reasonId,
    markReasonTouched,
    confirmError,
    confirmId,
    markConfirmTouched,
    requirementHint,
    hasBackgroundConflict,
    needsStaleDraftRecovery,
    handleReloadLatestDetail,
    validationMessage,
    availability,
    handleSubmit,
  } = session;
  const { formatDate } = useLocaleFormat();
  const [dialogElement, setDialogElementState] =
    useState<HTMLDivElement | null>(null);
  // Base UI asks for the initial focus target after mount, before a state
  // update from this render lands, so it reads the element from a ref.
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const setDialogElement = useCallback((element: HTMLDivElement | null) => {
    dialogRef.current = element;
    setDialogElementState(element);
  }, []);
  useKeepFocusedFieldInView(dialogElement);
  const draftVisible = operationDraftVisible(
    blocked,
    detailQuery.isPending,
    phase,
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        ref={setDialogElement}
        scrollable
        // The close button lives in the pinned header: the dialog's own one
        // would scroll away with the form.
        showCloseButton={false}
        initialFocus={() => dialogRef.current ?? true}
        className="sm:max-w-lg"
        data-testid="contribution-operation-shell"
      >
        {/* One block for the whole dialog, so the header can stay pinned
            while the form below it scrolls. */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* Pinned to the top of the scrolling dialog: revealing a focused
              field on a phone never pushes the title, the gift's donor and
              date, or the close button out of view. */}
          <div
            data-slot={OPERATION_DIALOG_HEADER_SLOT}
            className="sticky -top-6 z-20 -mx-6 -mt-6 flex items-start gap-2 border-b bg-background px-6 pt-6 pb-4"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <DialogTitle>
                {operationCopy(operation, detail?.shared.receiptStatus).title}
              </DialogTitle>
              {detail ? (
                // Financial operations name the donor and gift they act on,
                // so the dialog stands on its own when it covers the detail
                // sheet (phones). The amount is in the current values below.
                <p
                  data-testid="operation-gift-identity"
                  className="text-sm font-medium text-foreground"
                >
                  {detail.shared.donorName ?? "Unknown donor"}
                  {" · "}
                  {formatDate(detail.shared.giftDate, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              ) : null}
              <DialogDescription>
                {
                  operationCopy(operation, detail?.shared.receiptStatus)
                    .description
                }
              </DialogDescription>
            </div>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close"
                  className="-me-3 -mt-3 shrink-0"
                />
              }
            >
              <X aria-hidden="true" />
            </DialogClose>
          </div>
          <OperationLoadingSection
            detailLoading={detailLoading}
            onClose={onClose}
          />

          <OperationBlockedSection
            blocked={blocked}
            detailLoading={detailLoading}
            blockedReason={blockedReason}
            blockedNextStep={blockedNextStep}
            operationBlock={operationBlock}
            onOpenFullDetail={onOpenFullDetail}
            donationId={donationId}
          />

          {draftVisible && (
            // Everything above the pinned form-actions row keeps a bottom
            // scroll margin of the row's height, so a field scrolled into view
            // stops above the row instead of under it (WCAG 2.4.11). The row
            // stacks on phones, so it needs more room. The dialog re-reveals
            // the focused field after focus moves and on every resize.
            <div className="flex min-w-0 flex-col gap-5 [&>:not([data-slot=operation-form-actions])_*]:scroll-mb-48 sm:[&>:not([data-slot=operation-form-actions])_*]:scroll-mb-28">
              {/* Fields only: the pinned actions row stays outside, so the
                focused submit is not disabled and blurred with them. */}
              <fieldset
                disabled={phase.name === "submitting"}
                className="flex min-w-0 flex-col gap-5"
              >
                <legend className="sr-only">Gift operation details</legend>
                <OperationEffectiveSummary
                  detail={detail}
                  isRefundOperation={isRefundOperation}
                  remainingRefundableCents={remainingRefundableCents}
                />

                <OperationRiskNotices
                  pendingRefundMessage={pendingRefundMessage}
                  operation={operation}
                />

                <OperationAmountField
                  operation={operation}
                  amountError={amountError}
                  amountId={amountId}
                  amountCurrencyCode={amountCurrencyCode}
                  values={values}
                  captureDraftRevision={captureDraftRevision}
                  setValues={setValues}
                  isRefundOperation={isRefundOperation}
                />

                <OperationFundField
                  operation={operation}
                  fundError={fundError}
                  fundId={fundId}
                  values={values}
                  captureDraftRevision={captureDraftRevision}
                  setValues={setValues}
                  detail={detail}
                />

                <OperationReceiptField
                  receiptDelivery={receiptDelivery}
                  operation={operation}
                  deliveryValue={deliveryValue}
                  captureDraftRevision={captureDraftRevision}
                  setDelivery={setDelivery}
                  deliveryError={deliveryError}
                  submitting={phase.name === "submitting"}
                />

                <OperationReasonField
                  operation={operation}
                  reasonError={reasonError}
                  reasonId={reasonId}
                  values={values}
                  captureDraftRevision={captureDraftRevision}
                  setValues={setValues}
                  onBlur={markReasonTouched}
                />

                <OperationConfirmationField
                  operation={operation}
                  confirmError={confirmError}
                  confirmId={confirmId}
                  values={values}
                  captureDraftRevision={captureDraftRevision}
                  setValues={setValues}
                  onTouched={markConfirmTouched}
                  submitting={phase.name === "submitting"}
                />

                <OperationDraftErrors
                  phase={phase}
                  hasBackgroundConflict={hasBackgroundConflict}
                />
              </fieldset>

              <OperationFormActions
                onClose={onClose}
                needsStaleDraftRecovery={needsStaleDraftRecovery}
                detailQuery={detailQuery}
                confirmId={confirmId}
                handleReloadLatestDetail={handleReloadLatestDetail}
                validationMessage={validationMessage}
                pendingRefundMessage={pendingRefundMessage}
                detail={detail}
                availability={availability}
                hasBackgroundConflict={hasBackgroundConflict}
                handleSubmit={handleSubmit}
                phase={phase}
                operation={operation}
                requirementHint={requirementHint}
              />
            </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useContributionOperationSession({
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
  // Reason and confirmation errors wait until the staffer has visited the
  // field: a fresh form is not a mistake. The submit stays disabled either
  // way and a hint explains what is still needed.
  const [touchedFields, setTouchedFields] = useState({
    reason: false,
    confirmed: false,
  });
  const reasonId = useId();
  const amountId = useId();
  const fundId = useId();
  const confirmId = useId();

  const resetDraftState = () => {
    setPhase({ name: "form" });
    setValues({ reason: "", confirmed: false });
    setTouchedFields({ reason: false, confirmed: false });
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
  const nextOpenKey = operationDraftKey(open, donationId, operation);
  if (nextOpenKey !== openKey) {
    setOpenKey(nextOpenKey);
    setAmountPrefillKey(null);
    if (nextOpenKey) {
      resetDraftState();
    }
  }

  const detail = detailQuery.data;
  const {
    detailLoading,
    detailLoadBlock,
    latestRevision,
    hasBackgroundConflict,
    needsStaleDraftRecovery,
  } = resolveOperationLoadState(detailQuery, donationId, draftRevision, phase);
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
  const { remainingRefundableCents, pendingRefundMessage } =
    resolveOperationRefund({ isRefundOperation, detail });

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

  const {
    retryTargetScope,
    operationBlock,
    blocked,
    blockedReason,
    blockedNextStep,
  } = resolveOperationAvailability({
    operation,
    detail,
    detailLoadBlock,
    availability,
  });
  const {
    amountCurrencyCode,
    amountError,
    fundError,
    receiptDelivery,
    deliveryValue,
    deliveryError,
    reasonError,
    confirmError,
    validationMessage,
  } = resolveOperationValidation({
    operation,
    detail,
    values,
    delivery,
    isRefundOperation,
    remainingRefundableCents,
  });
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
      phase.name === "submitting" ||
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
    const receiptDeliverySelection = receiptDeliverySelectionFor(
      receiptDelivery,
      deliveryValue,
    );
    const payload = operationSubmitPayload(
      operation,
      values,
      detail.stagedGift?.id ?? null,
      retryTargetScope,
    );
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
      const failure = classifyOperationRequestError(error);
      setPhase(failure);
      if (failure.staleSave) {
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

  return {
    open: open,
    onClose: onClose,
    operation: operation,
    detailLoading: detailLoading,
    blocked: blocked,
    blockedReason: blockedReason,
    blockedNextStep: blockedNextStep,
    operationBlock: operationBlock,
    onOpenFullDetail: onOpenFullDetail,
    donationId: donationId,
    detailQuery: detailQuery,
    phase: phase,
    detail: detail,
    isRefundOperation: isRefundOperation,
    remainingRefundableCents: remainingRefundableCents,
    pendingRefundMessage: pendingRefundMessage,
    amountError: amountError,
    amountId: amountId,
    amountCurrencyCode: amountCurrencyCode,
    values: values,
    captureDraftRevision: captureDraftRevision,
    setValues: setValues,
    fundError: fundError,
    fundId: fundId,
    receiptDelivery: receiptDelivery,
    deliveryValue: deliveryValue,
    setDelivery: setDelivery,
    deliveryError: deliveryError,
    reasonError: touchedFields.reason ? reasonError : null,
    reasonId: reasonId,
    markReasonTouched: () =>
      setTouchedFields((current) => ({ ...current, reason: true })),
    confirmError: touchedFields.confirmed ? confirmError : null,
    confirmId: confirmId,
    markConfirmTouched: () =>
      setTouchedFields((current) => ({ ...current, confirmed: true })),
    requirementHint: resolveRequirementHint({
      reasonOutstanding: Boolean(reasonError) && !touchedFields.reason,
      confirmOutstanding: Boolean(confirmError) && !touchedFields.confirmed,
      otherError: Boolean(amountError ?? fundError ?? deliveryError),
    }),
    hasBackgroundConflict: hasBackgroundConflict,
    needsStaleDraftRecovery: needsStaleDraftRecovery,
    handleReloadLatestDetail: handleReloadLatestDetail,
    validationMessage: validationMessage,
    availability: availability,
    handleSubmit: handleSubmit,
  };
}
