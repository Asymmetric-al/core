import Stripe from "stripe";

import { CONNECTED_ACCOUNT, PAYMENT_INTENT_ID } from "./contract";
import {
  createOneSend,
  type OneSend,
  type OneSendHeaders,
  type OneSendTransport,
} from "./one-send";
import { STRIPE_API_VERSION } from "../../stripe/api-version";
import { assertStripeTestModeKey } from "../../stripe/connect";

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
  const replayed =
    headerValues(error.headers, "idempotent-replayed").includes("true") ||
    headerValues(sentHeaders, "idempotent-replayed").includes("true");
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

export function createStripePaymentAdapter({
  secretKey,
  transport,
}: StripePaymentAdapterOptions): PaymentProviderAdapter {
  const key = assertStripeTestModeKey(secretKey);
  return {
    async createPayment({ account, idempotencyKey, params, timeoutMs }) {
      const timeout = Math.floor(timeoutMs);
      if (!Number.isFinite(timeout) || timeout < 1)
        throw new RangeError(
          "timeoutMs must be a finite number of at least 1 millisecond.",
        );
      if (typeof account !== "string" || !CONNECTED_ACCOUNT.test(account))
        throw new TypeError("A connected account id (acct_...) is required.");
      if (typeof idempotencyKey !== "string" || idempotencyKey === "")
        throw new TypeError("An idempotency key is required.");
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
        });
        const call: Promise<StripeAnswer> = stripe.paymentIntents
          .create(params as Stripe.PaymentIntentCreateParams, {
            idempotencyKey,
            stripeAccount: account,
            maxNetworkRetries: 0,
            timeout,
          })
          .then(
            (value): StripeAnswer => ({ kind: "resolved", value }),
            (error: unknown): StripeAnswer => ({ kind: "rejected", error }),
          );
        const settled = await Promise.race([call, expiry]);
        return classifyStripeAnswer(sentAnswer(settled, send), params);
      } catch {
        return unknownAnswer("adapter_fault");
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
