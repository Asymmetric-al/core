import { serverEnv } from "@asym/env";

import {
  ACCOUNT_READ_DEADLINE_MS,
  runMoneySchedule,
  type AccountReader,
  type MoneyScheduleRpc,
} from "../../donate/money-schedule";
import { createStripePaymentAdapter } from "../../donate/provider-operations/stripe-adapter";
import { createStripeClient } from "../../stripe/client";
import {
  fetchConnectedAccountSnapshot,
  type StripeConnectClient,
} from "../../stripe/connect";
import { assertStripeTestModeKey } from "../../stripe/test-mode-key";
import { requireWorkflowAdminClient } from "../admin-client";
import { inngest } from "../inngest/client";

export function accountReaderFor(secretKey: string): AccountReader {
  const stripe = createStripeClient(secretKey, {
    timeout: ACCOUNT_READ_DEADLINE_MS,
    maxNetworkRetries: 0,
  }) as unknown as StripeConnectClient;
  return {
    retrieve: (accountId: string) =>
      fetchConnectedAccountSnapshot(stripe, accountId),
  };
}

async function runWithAdminClient() {
  const client = requireWorkflowAdminClient("money_schedule") as unknown as {
    rpc: MoneyScheduleRpc;
  };
  const testKey = () =>
    assertStripeTestModeKey(serverEnv.STRIPE_SECRET_KEY ?? "");
  return runMoneySchedule({
    rpc: (fn, args) => client.rpc(fn, args),
    paymentAdapter: () => createStripePaymentAdapter({ secretKey: testKey() }),
    accountReader: () => accountReaderFor(testKey()),
  });
}

export async function moneyScheduleHandler(
  _context: { step: unknown },
  run: () => Promise<unknown> = runWithAdminClient,
) {
  return run();
}

export const moneySchedule = inngest.createFunction(
  {
    id: "money-schedule",
    triggers: [{ cron: "*/30 * * * *" }],
    retries: 0,
    concurrency: [{ limit: 1 }],
  },
  async ({ step }) => moneyScheduleHandler({ step }),
);
