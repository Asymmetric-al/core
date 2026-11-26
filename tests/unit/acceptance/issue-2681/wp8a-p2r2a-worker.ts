import { tryClaim, tryReport, type Attempt } from "./wp8a-p2r1a-harness";
import {
  runProviderOperation,
  type ProviderOperationRpc,
  type ProviderOperationRpcArgs,
  type ProviderOperationRpcName,
  type RpcResponse,
} from "../../../../packages/api/src/donate/provider-operations/run";
import { createStripePaymentAdapter } from "../../../../packages/api/src/donate/provider-operations/stripe-adapter";

import type { StripeProviderFake } from "../../../fixtures/stripe-provider-fake";
import type pg from "pg";

export type WorkerHooks = {
  beforeReport?: () => Promise<void>;
  dropReport?: boolean;
};

export async function runWorker(
  db: pg.Client,
  operationId: string,
  fake: StripeProviderFake,
  hooks: WorkerHooks = {},
) {
  const rpc: ProviderOperationRpc = async (
    fn: ProviderOperationRpcName,
    args: ProviderOperationRpcArgs[ProviderOperationRpcName],
  ) => {
    if (fn === "claim_provider_operation") {
      const a = args as ProviderOperationRpcArgs["claim_provider_operation"];
      return rpcAnswer(await tryClaim(db, a.p_operation_id, a.p_lease_seconds));
    }
    const a =
      args as ProviderOperationRpcArgs["record_provider_operation_result"];
    await hooks.beforeReport?.();
    if (hooks.dropReport)
      return { data: null, error: { message: "the worker crashed" } };
    return rpcAnswer(
      await tryReport(db, a.p_operation_id, a.p_attempt, a.p_result),
    );
  };
  return runProviderOperation({
    rpc,
    adapter: createStripePaymentAdapter({
      secretKey: "sk_test_provider_fake",
      transport: fake.transport,
    }),
    operationId,
  });
}

const rpcAnswer = (a: Attempt): RpcResponse =>
  a.ok
    ? { data: a.rows[0]?.r ?? null, error: null }
    : { data: null, error: { code: a.code, message: a.message ?? "" } };
