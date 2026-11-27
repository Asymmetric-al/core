import Stripe from "stripe";

import { CONNECTED_ACCOUNT, MIN_SEND_MS, PAYMENT_INTENT_ID } from "./contract";
import {
  createOneSend,
  type OneSend,
  type OneSendHeaders,
  type OneSendTransport,
} from "./one-send";
import { STRIPE_API_VERSION } from "../../stripe/api-version";
import { assertStripeTestModeKey } from "../../stripe/test-mode-key";

import type { PaymentProviderAdapter, PaymentProviderAnswer } from "./run";

export type StripeAnswer =
  | {
      kind: "resolved";
      value: unknown;
      status?: number;
      headers?: OneSendHeaders;
    }
  | {
      kind: "rejected";
      error: unknown;
      status?: number;
      headers?: OneSendHeaders;
    }
  | { kind: "timed_out" };

export type ClassifiedRequest = {
  amount: number;
  currency: string;
  metadata: { asym_operation: string; asym_intake: string };
};

export type StripePaymentAdapterOptions = {
  secretKey: string;
  transport?: OneSendTransport;
};

const RATE_LIMITED_REASONS = new Set([
  "global-rate",
  "endpoint-rate",
  "global-concurrency",
  "endpoint-concurrency",
  "resource-specific",
]);
const UNREACHABLE_CODES = new Set(["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"]);

const unknownAnswer = (errorCode: string): PaymentProviderAnswer => ({
  result: "unknown",
  errorCode,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function headerValues(headers: unknown, name: string): string[] {
  if (!isRecord(headers)) return [];
  const values: string[] = [];
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== name) continue;
    for (const item of Array.isArray(value) ? value : [value])
      values.push(
        String(item)
          .replace(/^[ \t]+|[ \t]+$/g, "")
          .toLowerCase(),
      );
  }
  return values;
}

function replayMarked(...sources: unknown[]): boolean {
  return sources.some(
    (headers) =>
      isRecord(headers) &&
      Object.entries(headers).some(
        ([key, value]) =>
          key.toLowerCase() === "idempotent-replayed" && value !== "false",
      ),
  );
}

function classifyResolved(
  value: unknown,
  status: number | undefined,
  request: ClassifiedRequest,
): PaymentProviderAnswer {
  if (
    status !== undefined &&
    Number.isInteger(status) &&
    status >= 200 &&
    status <= 299 &&
    isRecord(value) &&
    value.object === "payment_intent" &&
    typeof value.id === "string" &&
    PAYMENT_INTENT_ID.test(value.id) &&
    value.livemode === false &&
    value.amount === request.amount &&
    value.currency === request.currency &&
    isRecord(value.metadata) &&
    value.metadata.asym_operation === request.metadata.asym_operation &&
    value.metadata.asym_intake === request.metadata.asym_intake
  )
    return { result: "succeeded", providerObjectId: value.id };
  return unknownAnswer("stripe_unexpected_object");
}

function classifyRejected(
  error: unknown,
  sentStatus: number | undefined,
  sentHeaders: OneSendHeaders | undefined,
): PaymentProviderAnswer {
  if (!(error instanceof Stripe.errors.StripeError))
    return unknownAnswer("adapter_fault");
  const ownStatus =
    typeof error.statusCode === "number" ? error.statusCode : undefined;
  const detail: unknown = error.detail;
  if (ownStatus === undefined && isRecord(detail)) {
    const cause = isRecord(detail.cause) ? detail.cause : {};
    const codes = [detail.code, cause.code].filter(
      (code): code is string => typeof code === "string",
    );
    if (codes.includes("ETIMEDOUT")) return unknownAnswer("stripe_timeout");
    if (codes.some((code) => UNREACHABLE_CODES.has(code)))
      return unknownAnswer("stripe_unreachable");
    return unknownAnswer("stripe_connection_lost");
  }
  const status =
    ownStatus !== undefined && ownStatus === sentStatus ? ownStatus : undefined;
  if (status === undefined) return unknownAnswer("stripe_unclassified");
  const rawType = error.rawType;
  const replayed = replayMarked(error.headers, sentHeaders);
  const reasons = headerValues(error.headers, "stripe-rate-limited-reason");
  if (status === 409) return unknownAnswer("stripe_idempotency_in_flight");
  if (rawType === "idempotency_error")
    return unknownAnswer("stripe_idempotency_mismatch");
  if (
    status === 429 &&
    !replayed &&
    ((reasons.length === 1 && RATE_LIMITED_REASONS.has(reasons[0] ?? "")) ||
      error.code === "lock_timeout")
  )
    return { result: "not_performed", errorCode: "stripe_rate_limited" };
  if (
    status === 402 &&
    rawType === "card_error" &&
    (error.payment_intent === undefined || error.payment_intent === null)
  )
    return { result: "refused", errorCode: "stripe_card_error" };
  if (status === 400 || status === 404)
    return unknownAnswer("stripe_invalid_request");
  if (status === 401 && !replayed)
    return { result: "not_performed", errorCode: "stripe_authentication" };
  if (status === 403) return unknownAnswer("stripe_permission");
  if (status >= 500 && status <= 599)
    return unknownAnswer("stripe_server_error");
  return unknownAnswer("stripe_unclassified");
}

export function classifyStripeAnswer(
  answer: StripeAnswer,
  request: ClassifiedRequest,
): PaymentProviderAnswer {
  if (answer.kind === "timed_out") return unknownAnswer("stripe_timeout");
  if (answer.kind === "rejected")
    return classifyRejected(answer.error, answer.status, answer.headers);
  return classifyResolved(answer.value, answer.status, request);
}

function fetchTransport(callSignal: AbortSignal): OneSendTransport {
  return Stripe.createFetchHttpClient((input, init) =>
    fetch(input, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.any(
        [init?.signal, callSignal].filter(
          (signal): signal is AbortSignal => signal instanceof AbortSignal,
        ),
      ),
    }),
  );
}

function sentAnswer(settled: StripeAnswer, send: OneSend): StripeAnswer {
  if (settled.kind === "timed_out") return settled;
  return { ...settled, status: send.status(), headers: send.headers() };
}

export type ClassifiedCancel = { payment_intent: string };

export function classifyStripeCancelAnswer(
  answer: StripeAnswer,
  request: ClassifiedCancel,
): PaymentProviderAnswer {
  if (answer.kind === "timed_out") return unknownAnswer("stripe_timeout");
  if (answer.kind === "rejected") {
    const error = answer.error;
    if (
      error instanceof Stripe.errors.StripeError &&
      error.statusCode === 400 &&
      answer.status === 400 &&
      error.code === "payment_intent_unexpected_state" &&
      !replayMarked(error.headers, answer.headers)
    )
      return { result: "refused", errorCode: "stripe_unexpected_state" };
    return classifyRejected(answer.error, answer.status, answer.headers);
  }
  const value = answer.value;
  const status = answer.status;
  if (
    status !== undefined &&
    Number.isInteger(status) &&
    status >= 200 &&
    status <= 299 &&
    isRecord(value) &&
    value.object === "payment_intent" &&
    value.id === request.payment_intent &&
    value.livemode === false &&
    value.status === "canceled"
  )
    return { result: "succeeded", providerObjectId: request.payment_intent };
  return unknownAnswer("stripe_unexpected_object");
}

type SendInput = {
  account: string;
  idempotencyKey: string;
  timeoutMs: number;
  remainingMs?: () => number;
};

export function createStripePaymentAdapter({
  secretKey,
  transport,
}: StripePaymentAdapterOptions): PaymentProviderAdapter {
  const key = assertStripeTestModeKey(secretKey);

  async function sendOnce(
    { account, idempotencyKey, timeoutMs, remainingMs }: SendInput,
    call: (
      stripe: Stripe,
      options: Stripe.RequestOptions & { timeout: number },
    ) => Promise<unknown>,
    classify: (answer: StripeAnswer) => PaymentProviderAnswer,
  ): Promise<PaymentProviderAnswer> {
    const asked = Math.floor(timeoutMs);
    if (!Number.isFinite(asked) || asked < 1)
      throw new RangeError(
        "timeoutMs must be a finite number of at least 1 millisecond.",
      );
    if (typeof account !== "string" || !CONNECTED_ACCOUNT.test(account))
      throw new TypeError("A connected account id (acct_...) is required.");
    if (typeof idempotencyKey !== "string" || idempotencyKey === "")
      throw new TypeError("An idempotency key is required.");
    const left = remainingMs === undefined ? asked : remainingMs();
    if (remainingMs !== undefined && !(left >= MIN_SEND_MS))
      return { result: "not_performed", errorCode: "lease_budget_spent" };
    const timeout = Math.floor(Math.min(asked, left));
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const expiry = new Promise<StripeAnswer>((resolve) => {
        timer = setTimeout(() => {
          controller.abort();
          resolve({ kind: "timed_out" });
        }, timeout);
      });
      const send = createOneSend(
        transport ?? fetchTransport(controller.signal),
      );
      const stripe = new Stripe(key, {
        apiVersion: STRIPE_API_VERSION,
        maxNetworkRetries: 0,
        timeout,
        httpClient: send.client,
        telemetry: false,
      });
      const pending: Promise<StripeAnswer> = call(stripe, {
        idempotencyKey,
        stripeAccount: account,
        maxNetworkRetries: 0,
        timeout,
      }).then(
        (value): StripeAnswer => ({ kind: "resolved", value }),
        (error: unknown): StripeAnswer => ({ kind: "rejected", error }),
      );
      const settled = await Promise.race([pending, expiry]);
      return classify(sentAnswer(settled, send));
    } catch {
      return unknownAnswer("adapter_fault");
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    createPayment({ params, ...input }) {
      return sendOnce(
        input,
        (stripe, options) =>
          stripe.paymentIntents.create(
            params as Stripe.PaymentIntentCreateParams,
            options,
          ),
        (answer) => classifyStripeAnswer(answer, params),
      );
    },
    cancelPayment({ params, ...input }) {
      if (!PAYMENT_INTENT_ID.test(params.payment_intent))
        throw new TypeError("A PaymentIntent id (pi_...) is required.");
      return sendOnce(
        input,
        (stripe, options) =>
          stripe.paymentIntents.cancel(
            params.payment_intent,
            { cancellation_reason: params.cancellation_reason },
            options,
          ),
        (answer) => classifyStripeCancelAnswer(answer, params),
      );
    },
  };
}
