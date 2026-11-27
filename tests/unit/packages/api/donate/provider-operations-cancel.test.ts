import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runProviderOperation } from "../../../../../packages/api/src/donate/provider-operations/run";
import {
  classifyStripeCancelAnswer,
  createStripePaymentAdapter,
} from "../../../../../packages/api/src/donate/provider-operations/stripe-adapter";
import {
  createStripeProviderFake,
  serverError,
  succeed,
  unexpectedState,
} from "../../../../fixtures/stripe-provider-fake";

import type {
  ProviderOperationRpc,
  RpcResponse,
} from "../../../../../packages/api/src/donate/provider-operations/run";

const TEST_KEY = "sk_test_provider_fake";
const OPERATION = "6f1c2c1e-6a43-4c8e-9a51-0d8f2d6c1a10";
const INTAKE = "1b7d4e2a-3c5f-4a6b-8d9e-0f1a2b3c4d5e";
const TENANT = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const ACCOUNT = "acct_1ProviderFake0001";
const PI = "pi_3ProviderFakeObject0001";
const KEY = `gift:${INTAKE}:cancel_payment`;

const claimed = (over: Record<string, unknown> = {}) => ({
  outcome: "claimed",
  operation_id: OPERATION,
  tenant_id: TENANT,
  attempt: 1,
  lease_expires_at: "2026-11-27T10:02:00Z",
  send_deadline: "2026-11-28T09:00:00Z",
  request_kind: "cancel_payment",
  idempotency_key: KEY,
  request: { payment_intent: PI, cancellation_reason: "abandoned" },
  request_digest: "0".repeat(64),
  provider_account: ACCOUNT,
  livemode: false,
  ...over,
});

function rpcFor(claim: unknown) {
  const calls: { fn: string; args: unknown }[] = [];
  const rpc = (async (fn: string, args: unknown): Promise<RpcResponse> => {
    calls.push({ fn, args });
    if (fn === "claim_provider_operation") return { data: claim, error: null };
    return { data: { outcome: "linked" }, error: null };
  }) as ProviderOperationRpc;
  return { rpc, calls };
}

describe("AL-2681 WP8a part 2 rest, PR 1: the worker's cancel_payment over the fake provider (stub fetch; no network)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", () => {
      throw new Error("the cancel tests must not reach the network");
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("a claimed cancel is sent once to POST /v1/payment_intents/{pi}/cancel on the connected account with its key and reason, and a canceled answer reports succeeded with the intake's PaymentIntent", async () => {
    const fake = createStripeProviderFake();
    fake.script(succeed());
    const { rpc, calls } = rpcFor(claimed());
    const run = await runProviderOperation({
      rpc,
      adapter: createStripePaymentAdapter({
        secretKey: TEST_KEY,
        transport: fake.transport,
      }),
      operationId: OPERATION,
    });
    expect(run.sent).toBe(true);
    const [request] = fake.requests();
    expect(request).toMatchObject({
      method: "POST",
      path: `/v1/payment_intents/${PI}/cancel`,
      key: KEY,
      account: ACCOUNT,
      body: { cancellation_reason: "abandoned" },
    });
    expect(calls.at(-1)).toEqual({
      fn: "record_provider_operation_result",
      args: {
        p_operation_id: OPERATION,
        p_attempt: 1,
        p_result: { result: "succeeded", provider_object_id: PI },
      },
    });
  });

  it("a PaymentIntent the provider will not cancel (it succeeded) is refused stripe_unexpected_state; a server error is unknown", async () => {
    for (const [behaviour, result] of [
      [
        unexpectedState(),
        { result: "refused", error_code: "stripe_unexpected_state" },
      ],
      [
        serverError(),
        {
          result: "unknown",
          retry_delay_seconds: 30,
          error_code: "stripe_server_error",
        },
      ],
    ] as const) {
      const fake = createStripeProviderFake();
      fake.script(behaviour);
      const { rpc, calls } = rpcFor(claimed());
      await runProviderOperation({
        rpc,
        adapter: createStripePaymentAdapter({
          secretKey: TEST_KEY,
          transport: fake.transport,
        }),
        operationId: OPERATION,
      });
      expect((calls.at(-1)!.args as { p_result: unknown }).p_result).toEqual(
        result,
      );
    }
  });

  it("pre-send checks for a cancel: another request kind's key, a live mode, a parameters shape of the other kind, or a key of create_payment send nothing and report pre_send_refused", async () => {
    for (const bad of [
      claimed({ idempotency_key: `gift:${INTAKE}:create_payment` }),
      claimed({ livemode: true }),
      claimed({ request_kind: "create_payment" }),
      claimed({
        request: {
          payment_intent: "ch_notAnIntent",
          cancellation_reason: "abandoned",
        },
      }),
      claimed({
        request: { payment_intent: PI, cancellation_reason: "duplicate" },
      }),
    ]) {
      const fake = createStripeProviderFake();
      const { rpc, calls } = rpcFor(bad);
      await runProviderOperation({
        rpc,
        adapter: createStripePaymentAdapter({
          secretKey: TEST_KEY,
          transport: fake.transport,
        }),
        operationId: OPERATION,
      });
      expect(fake.requests()).toEqual([]);
      expect((calls.at(-1)!.args as { p_result: unknown }).p_result).toEqual({
        result: "not_performed",
        retry_delay_seconds: 30,
        error_code: "pre_send_refused",
      });
    }
  });

  it("a canceled object for another PaymentIntent, a live one or one not canceled is unknown, never succeeded", () => {
    const base = {
      object: "payment_intent",
      id: PI,
      livemode: false,
      status: "canceled",
    };
    for (const value of [
      { ...base, id: "pi_somethingElse" },
      { ...base, livemode: true },
      { ...base, status: "succeeded" },
    ])
      expect(
        classifyStripeCancelAnswer(
          { kind: "resolved", value, status: 200 },
          { payment_intent: PI },
        ),
      ).toEqual({ result: "unknown", errorCode: "stripe_unexpected_object" });
    expect(
      classifyStripeCancelAnswer(
        { kind: "resolved", value: base, status: 200 },
        { payment_intent: PI },
      ),
    ).toEqual({ result: "succeeded", providerObjectId: PI });
  });
});
