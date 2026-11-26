import { serverEnv } from "@asym/env";

import type Stripe from "stripe";

type AccountCreateParams = Stripe.V2.Core.AccountCreateParams;
type AccountRetrieveParams = Stripe.V2.Core.AccountRetrieveParams;
type AccountLinkCreateParams = Stripe.V2.Core.AccountLinkCreateParams;

export const STRIPE_CONNECT_ACCOUNT_CONFIGURATION = {
  dashboard: "full",
  defaults: {
    responsibilities: {
      fees_collector: "stripe",
      losses_collector: "stripe",
    },
  },
  configuration: {
    merchant: {
      capabilities: {
        card_payments: { requested: true },
      },
    },
  },
} as const satisfies Pick<
  AccountCreateParams,
  "dashboard" | "defaults" | "configuration"
>;

export const ONBOARDING_INTENT_METADATA_KEY = "asym_onboarding_intent";

export const CONNECTED_ACCOUNT_INCLUDE = [
  "configuration.merchant",
  "requirements",
] as const satisfies NonNullable<AccountRetrieveParams["include"]>;

export const ONBOARDING_INTENT_PROVIDER_WINDOW_DAYS = 29;

export const STRIPE_CONNECT_UNKNOWN_OUTCOME_ATTEMPTS = 3;

export interface ConnectedAccountLike {
  id: string;
  livemode: boolean;
  closed?: boolean | null;
  dashboard?: string | null;
  metadata?: Record<string, string> | null;
  configuration?: {
    merchant?: {
      capabilities?: {
        card_payments?: { status?: string | null } | null;
      } | null;
    } | null;
  } | null;
}

export interface StripeConnectClient {
  v2: {
    core: {
      accounts: {
        create(
          params: AccountCreateParams,
          options?: Stripe.RequestOptions,
        ): Promise<ConnectedAccountLike>;
        retrieve(
          id: string,
          params?: AccountRetrieveParams,
          options?: Stripe.RequestOptions,
        ): Promise<ConnectedAccountLike>;
      };
      accountLinks: {
        create(
          params: AccountLinkCreateParams,
          options?: Stripe.RequestOptions,
        ): Promise<{ url: string; expires_at: string }>;
      };
    };
  };
}

export interface ConnectedAccountSnapshot {
  id: string;
  livemode: boolean;
  closed: boolean;
  dashboard: string | null;
  card_payments_status: string | null;
  metadata: { [ONBOARDING_INTENT_METADATA_KEY]: string | null };
}

export function onboardingIntentIdempotencyKey(intentId: string): string {
  return `asym-wp8a-onboarding:${intentId}:account`;
}

export function buildConnectedAccountCreateParams(input: {
  intentId: string;
  countryCode: string;
  currency: string;
  legalName: string;
}): AccountCreateParams {
  return {
    display_name: input.legalName,
    dashboard: STRIPE_CONNECT_ACCOUNT_CONFIGURATION.dashboard,
    identity: { country: input.countryCode },
    defaults: {
      currency: input.currency,
      responsibilities: {
        ...STRIPE_CONNECT_ACCOUNT_CONFIGURATION.defaults.responsibilities,
      },
    },
    configuration: {
      merchant: {
        capabilities: {
          card_payments: {
            ...STRIPE_CONNECT_ACCOUNT_CONFIGURATION.configuration.merchant
              .capabilities.card_payments,
          },
        },
      },
    },
    metadata: { [ONBOARDING_INTENT_METADATA_KEY]: input.intentId },
    include: [...CONNECTED_ACCOUNT_INCLUDE],
  };
}

export function normalizeConnectedAccount(
  account: ConnectedAccountLike,
): ConnectedAccountSnapshot {
  return {
    id: account.id,
    livemode: account.livemode === true,
    closed: account.closed === true,
    dashboard: account.dashboard ?? null,
    card_payments_status:
      account.configuration?.merchant?.capabilities?.card_payments?.status ??
      null,
    metadata: {
      [ONBOARDING_INTENT_METADATA_KEY]:
        account.metadata?.[ONBOARDING_INTENT_METADATA_KEY] ?? null,
    },
  };
}

export class ConnectedAccountMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectedAccountMismatchError";
  }
}

export function assertAccountBelongsToIntent(
  account: ConnectedAccountLike,
  intent: { intentId: string; livemode: boolean },
): ConnectedAccountSnapshot {
  const snapshot = normalizeConnectedAccount(account);
  if (snapshot.metadata[ONBOARDING_INTENT_METADATA_KEY] !== intent.intentId) {
    throw new ConnectedAccountMismatchError(
      "The Stripe account does not carry this onboarding intent.",
    );
  }
  if (snapshot.livemode !== intent.livemode) {
    throw new ConnectedAccountMismatchError(
      "The Stripe account is in the other mode.",
    );
  }
  if (snapshot.closed) {
    throw new ConnectedAccountMismatchError("The Stripe account is closed.");
  }
  if (snapshot.dashboard !== STRIPE_CONNECT_ACCOUNT_CONFIGURATION.dashboard) {
    throw new ConnectedAccountMismatchError(
      "The Stripe account does not have the ruled dashboard access.",
    );
  }
  return snapshot;
}

export function isUnknownProviderOutcome(error: unknown): boolean {
  if (!error || typeof error !== "object") return true;
  const candidate = error as { type?: unknown; statusCode?: unknown };
  if (
    candidate.type === "StripeConnectionError" ||
    candidate.type === "StripeAPIError" ||
    candidate.type === "StripeRateLimitError"
  ) {
    return true;
  }
  if (typeof candidate.statusCode === "number") {
    return candidate.statusCode >= 500 || candidate.statusCode === 429;
  }
  return typeof candidate.type !== "string";
}

export async function ensureConnectedAccountForIntent(
  stripe: StripeConnectClient,
  intent: {
    intentId: string;
    livemode: boolean;
    countryCode: string;
    currency: string;
    legalName: string;
  },
): Promise<ConnectedAccountSnapshot> {
  const params = buildConnectedAccountCreateParams(intent);
  const idempotencyKey = onboardingIntentIdempotencyKey(intent.intentId);
  let lastError: unknown = null;
  for (
    let attempt = 1;
    attempt <= STRIPE_CONNECT_UNKNOWN_OUTCOME_ATTEMPTS;
    attempt += 1
  ) {
    try {
      const account = await stripe.v2.core.accounts.create(params, {
        idempotencyKey,
      });
      return assertAccountBelongsToIntent(account, intent);
    } catch (error) {
      if (!isUnknownProviderOutcome(error)) throw error;
      lastError = error;
    }
  }
  throw lastError;
}

export async function verifyConnectedAccountForIntent(
  stripe: StripeConnectClient,
  accountId: string,
  intent: { intentId: string; livemode: boolean },
): Promise<ConnectedAccountSnapshot> {
  const account = await stripe.v2.core.accounts.retrieve(
    assertConnectedAccountId(accountId),
    { include: [...CONNECTED_ACCOUNT_INCLUDE] },
  );
  if (account.id !== accountId) {
    throw new ConnectedAccountMismatchError(
      "Stripe returned a different account.",
    );
  }
  return assertAccountBelongsToIntent(account, intent);
}

export async function fetchConnectedAccountSnapshot(
  stripe: StripeConnectClient,
  accountId: string,
): Promise<ConnectedAccountSnapshot> {
  const account = await stripe.v2.core.accounts.retrieve(
    assertConnectedAccountId(accountId),
    { include: [...CONNECTED_ACCOUNT_INCLUDE] },
  );
  return normalizeConnectedAccount(account);
}

export function resolveAdminConfiguredOrigin(envSource?: {
  NEXT_PUBLIC_APP_URL?: string | null;
  NEXT_PUBLIC_SITE_URL?: string | null;
}): string {
  const raw = envSource
    ? envSource.NEXT_PUBLIC_APP_URL?.trim() ||
      envSource.NEXT_PUBLIC_SITE_URL?.trim() ||
      ""
    : serverEnv.NEXT_PUBLIC_APP_URL?.trim() ||
      serverEnv.NEXT_PUBLIC_SITE_URL?.trim() ||
      "";
  if (!raw) {
    throw new Error(
      "Admin origin is not configured. Set NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL.",
    );
  }
  const parsed = new URL(raw);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Admin origin must use http or https.");
  }
  return parsed.origin;
}

export function buildConnectOnboardingUrls(origin: string): {
  returnUrl: string;
  refreshUrl: string;
} {
  const base = new URL(origin).origin;
  return {
    returnUrl: `${base}/settings/payments?onboarding=return`,
    refreshUrl: `${base}/settings/payments?onboarding=refresh`,
  };
}

export function buildAccountLinkParams(input: {
  accountId: string;
  origin: string;
  useCase: "account_onboarding" | "account_update";
}): AccountLinkCreateParams {
  const { returnUrl, refreshUrl } = buildConnectOnboardingUrls(input.origin);
  const link = {
    configurations: ["merchant" as const],
    return_url: returnUrl,
    refresh_url: refreshUrl,
  };
  return input.useCase === "account_onboarding"
    ? {
        account: assertConnectedAccountId(input.accountId),
        use_case: { type: "account_onboarding", account_onboarding: link },
      }
    : {
        account: assertConnectedAccountId(input.accountId),
        use_case: { type: "account_update", account_update: link },
      };
}

export async function issueConnectedAccountLink(
  stripe: StripeConnectClient,
  input: {
    accountId: string;
    origin: string;
    useCase: "account_onboarding" | "account_update";
  },
): Promise<{ url: string; expiresAt: string }> {
  const link = await stripe.v2.core.accountLinks.create(
    buildAccountLinkParams(input),
  );
  return { url: link.url, expiresAt: link.expires_at };
}

export function assertConnectedAccountId(
  accountId: string | null | undefined,
): string {
  const trimmed = typeof accountId === "string" ? accountId.trim() : "";
  if (!/^acct_[A-Za-z0-9]+$/.test(trimmed)) {
    throw new Error("A connected Stripe account id (acct_...) is required.");
  }
  return trimmed;
}

export function connectedAccountRequestOptions(
  accountId: string,
  idempotencyKey?: string,
): Stripe.RequestOptions {
  const stripeAccount = assertConnectedAccountId(accountId);
  return idempotencyKey ? { stripeAccount, idempotencyKey } : { stripeAccount };
}

export {
  StripeLiveModeRefusedError,
  assertStripeTestModeKey,
} from "./test-mode-key";
