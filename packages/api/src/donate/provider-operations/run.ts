import { z } from "zod";

import {
  CALL_TIMEOUT_MS,
  CONNECTED_ACCOUNT,
  ERROR_CODE,
  LEASE_SECONDS,
  LOWER_UUID,
  MIN_SEND_MS,
  PAYMENT_INTENT_ID,
  REPORT_RESERVE_MS,
  claimedSchema,
  retryDelaySeconds,
  type ClaimedOperation,
  type ProviderRequest,
  type ProviderResult,
} from "./contract";

export type RpcError = { code?: string; message: string };

export type RpcResponse = { data: unknown; error: RpcError | null };

export type ProviderOperationRpcArgs = {
  claim_provider_operation: {
    p_operation_id: string;
    p_lease_seconds: number;
  };
  record_provider_operation_result: {
    p_operation_id: string;
    p_attempt: number;
    p_result: ProviderResult;
  };
};

export type ProviderOperationRpcName = keyof ProviderOperationRpcArgs;

export type ProviderOperationRpc = {
  (
    fn: "claim_provider_operation",
    args: ProviderOperationRpcArgs["claim_provider_operation"],
  ): Promise<RpcResponse>;
  (
    fn: "record_provider_operation_result",
    args: ProviderOperationRpcArgs["record_provider_operation_result"],
  ): Promise<RpcResponse>;
};

export type CreatePaymentInput = {
  account: string;
  idempotencyKey: string;
  params: ProviderRequest;
  timeoutMs: number;
};

export type PaymentProviderAnswer =
  | { result: "succeeded"; providerObjectId: string }
  | { result: "refused" | "not_performed" | "unknown"; errorCode: string };

export type PaymentProviderAdapter = {
  createPayment(input: CreatePaymentInput): Promise<PaymentProviderAnswer>;
};

export type ProviderOperationClock = { monotonicMs(): number };

export type ProviderOperationLogEntry = {
  operationId: string;
  attempt: number;
  answer: PaymentProviderAnswer;
  providerObjectId?: string;
  reportError: RpcError;
};

export type ProviderOperationRun =
  | { sent: false; claim: RpcResponse }
  | {
      sent: boolean;
      claim: RpcResponse;
      attempt: number;
      answer: PaymentProviderAnswer;
      report: RpcResponse;
    };

export type RunProviderOperationInput = {
  rpc: ProviderOperationRpc;
  adapter: PaymentProviderAdapter;
  operationId: string;
  clock?: ProviderOperationClock;
  log?: (entry: ProviderOperationLogEntry) => void;
};

const answerSchema = z.union([
  z.strictObject({
    result: z.literal("succeeded"),
    providerObjectId: z.string().regex(PAYMENT_INTENT_ID),
  }),
  z.strictObject({
    result: z.enum(["refused", "not_performed", "unknown"]),
    errorCode: z.string().regex(ERROR_CODE),
  }),
]);

const systemClock: ProviderOperationClock = {
  monotonicMs: () => performance.now(),
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

async function invoke(call: () => Promise<RpcResponse>): Promise<RpcResponse> {
  try {
    const response: unknown = await call();
    if (isRecord(response) && "data" in response && "error" in response)
      return response as RpcResponse;
    return {
      data: null,
      error: { message: "The RPC invoker answered outside its contract." },
    };
  } catch (error) {
    const e: Record<string, unknown> = isRecord(error) ? error : {};
    return {
      data: null,
      error: {
        ...(typeof e.code === "string" ? { code: e.code } : {}),
        message: typeof e.message === "string" ? e.message : String(error),
      },
    };
  }
}

function sendable(claimed: ClaimedOperation, operationId: string): boolean {
  return (
    claimed.operation_id === operationId &&
    claimed.request_kind === "create_payment" &&
    claimed.livemode === false &&
    CONNECTED_ACCOUNT.test(claimed.provider_account) &&
    claimed.request.metadata.asym_operation === operationId &&
    claimed.idempotency_key ===
      `gift:${claimed.request.metadata.asym_intake}:create_payment`
  );
}

function resultOf(
  answer: PaymentProviderAnswer,
  attempt: number,
): ProviderResult {
  if (answer.result === "succeeded")
    return { result: "succeeded", provider_object_id: answer.providerObjectId };
  if (answer.result === "refused")
    return { result: "refused", error_code: answer.errorCode };
  return {
    result: answer.result,
    retry_delay_seconds: retryDelaySeconds(attempt),
    error_code: answer.errorCode,
  };
}

export async function runProviderOperation({
  rpc,
  adapter,
  operationId,
  clock = systemClock,
  log,
}: RunProviderOperationInput): Promise<ProviderOperationRun> {
  if (typeof operationId !== "string" || !LOWER_UUID.test(operationId))
    throw new TypeError("operationId must be a lower-case UUID.");

  const started = clock.monotonicMs();
  const claim = await invoke(() =>
    rpc("claim_provider_operation", {
      p_operation_id: operationId,
      p_lease_seconds: LEASE_SECONDS,
    }),
  );
  const body = claim.data;
  if (claim.error !== null || !isRecord(body) || body.outcome !== "claimed")
    return { sent: false, claim };
  const attempt = body.attempt;
  if (
    typeof attempt !== "number" ||
    !Number.isSafeInteger(attempt) ||
    attempt < 1 ||
    body.operation_id !== operationId
  )
    return { sent: false, claim };

  const finish = async (sent: boolean, answer: PaymentProviderAnswer) => {
    const report = await invoke(() =>
      rpc("record_provider_operation_result", {
        p_operation_id: operationId,
        p_attempt: attempt,
        p_result: resultOf(answer, attempt),
      }),
    );
    if (report.error !== null)
      log?.({
        operationId,
        attempt,
        answer,
        ...(answer.result === "succeeded"
          ? { providerObjectId: answer.providerObjectId }
          : {}),
        reportError: report.error,
      });
    return { sent, claim, attempt, answer, report };
  };

  const checked = claimedSchema.safeParse(body);
  if (!checked.success || !sendable(checked.data, operationId))
    return finish(false, {
      result: "not_performed",
      errorCode: "pre_send_refused",
    });

  const remaining =
    started + LEASE_SECONDS * 1000 - REPORT_RESERVE_MS - clock.monotonicMs();
  if (!(remaining >= MIN_SEND_MS))
    return finish(false, {
      result: "not_performed",
      errorCode: "lease_budget_spent",
    });

  let answer: PaymentProviderAnswer;
  try {
    const given = await adapter.createPayment({
      account: checked.data.provider_account,
      idempotencyKey: checked.data.idempotency_key,
      params: checked.data.request,
      timeoutMs: Math.floor(Math.min(CALL_TIMEOUT_MS, remaining)),
    });
    const parsed = answerSchema.safeParse(given);
    answer = parsed.success
      ? parsed.data
      : { result: "unknown", errorCode: "adapter_fault" };
  } catch {
    answer = { result: "unknown", errorCode: "adapter_fault" };
  }
  return finish(true, answer);
}
