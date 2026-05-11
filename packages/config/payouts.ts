export type PayoutFeatureProvider =
  | "manual"
  | "wise"
  | "airwallex"
  | "currencycloud"
  | "corpay"
  | "stripeGlobalPayouts";

export type PayoutFeatureEnv = Partial<
  Record<
    | "PAYOUTS_ENABLED"
    | "PAYOUTS_MANUAL_PROVIDER_ENABLED"
    | "PAYOUTS_WISE_ENABLED"
    | "PAYOUTS_AIRWALLEX_ENABLED"
    | "PAYOUTS_CURRENCYCLOUD_ENABLED"
    | "PAYOUTS_CORPAY_ENABLED"
    | "PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED"
    | "PAYOUTS_EXECUTION_ENABLED"
    | "PAYOUTS_SANDBOX_ONLY",
    string | undefined
  >
>;

export interface PayoutProviderFeatureConfig {
  quoteEnabled: boolean;
  executionEnabled: boolean;
}

export interface PayoutFeatureConfig {
  enabled: boolean;
  sandboxOnly: boolean;
  execution: {
    enabled: boolean;
  };
  providers: Record<PayoutFeatureProvider, PayoutProviderFeatureConfig>;
}

export type ClientSafePayoutFeatureConfig = Pick<
  PayoutFeatureConfig,
  "enabled" | "sandboxOnly" | "providers"
>;

const isEnabled = (value: string | undefined) => value === "true";

const providerConfig = ({
  payoutsEnabled,
  providerEnabled,
  executionEnabled,
}: {
  payoutsEnabled: boolean;
  providerEnabled: boolean;
  executionEnabled: boolean;
}): PayoutProviderFeatureConfig => {
  const quoteEnabled = payoutsEnabled && providerEnabled;

  return {
    quoteEnabled,
    executionEnabled: quoteEnabled && executionEnabled,
  };
};

export function resolvePayoutFeatureConfig(
  env: PayoutFeatureEnv = process.env,
): PayoutFeatureConfig {
  const enabled = isEnabled(env.PAYOUTS_ENABLED);
  const executionEnabled = enabled && isEnabled(env.PAYOUTS_EXECUTION_ENABLED);

  return {
    enabled,
    sandboxOnly: enabled && isEnabled(env.PAYOUTS_SANDBOX_ONLY),
    execution: {
      enabled: executionEnabled,
    },
    providers: {
      manual: providerConfig({
        payoutsEnabled: enabled,
        providerEnabled: isEnabled(env.PAYOUTS_MANUAL_PROVIDER_ENABLED),
        executionEnabled,
      }),
      wise: providerConfig({
        payoutsEnabled: enabled,
        providerEnabled: isEnabled(env.PAYOUTS_WISE_ENABLED),
        executionEnabled,
      }),
      airwallex: providerConfig({
        payoutsEnabled: enabled,
        providerEnabled: isEnabled(env.PAYOUTS_AIRWALLEX_ENABLED),
        executionEnabled,
      }),
      currencycloud: providerConfig({
        payoutsEnabled: enabled,
        providerEnabled: isEnabled(env.PAYOUTS_CURRENCYCLOUD_ENABLED),
        executionEnabled,
      }),
      corpay: providerConfig({
        payoutsEnabled: enabled,
        providerEnabled: isEnabled(env.PAYOUTS_CORPAY_ENABLED),
        executionEnabled,
      }),
      stripeGlobalPayouts: providerConfig({
        payoutsEnabled: enabled,
        providerEnabled: isEnabled(env.PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED),
        executionEnabled,
      }),
    },
  };
}

export function getClientSafePayoutFeatureConfig(
  env: PayoutFeatureEnv = process.env,
): ClientSafePayoutFeatureConfig {
  const config = resolvePayoutFeatureConfig(env);

  return {
    enabled: config.enabled,
    sandboxOnly: config.sandboxOnly,
    providers: config.providers,
  };
}
