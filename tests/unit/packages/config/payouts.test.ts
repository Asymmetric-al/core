import { describe, expect, it } from "vitest";

import {
  getClientSafePayoutFeatureConfig,
  resolvePayoutFeatureConfig,
} from "../../../../packages/config/payouts";

describe("payout feature config", () => {
  it("keeps payouts disabled by default", () => {
    const config = resolvePayoutFeatureConfig({});

    expect(config.enabled).toBe(false);
    expect(config.sandboxOnly).toBe(false);
    expect(config.execution.enabled).toBe(false);
    expect(config.providers.manual.quoteEnabled).toBe(false);
    expect(config.providers.wise.quoteEnabled).toBe(false);
    expect(config.providers.airwallex.quoteEnabled).toBe(false);
    expect(config.providers.currencycloud.quoteEnabled).toBe(false);
    expect(config.providers.corpay.quoteEnabled).toBe(false);
    expect(config.providers.stripeGlobalPayouts.quoteEnabled).toBe(false);
  });

  it("allows manual mode without enabling provider execution", () => {
    const config = resolvePayoutFeatureConfig({
      PAYOUTS_ENABLED: "true",
      PAYOUTS_MANUAL_PROVIDER_ENABLED: "true",
      PAYOUTS_EXECUTION_ENABLED: "false",
    });

    expect(config.enabled).toBe(true);
    expect(config.execution.enabled).toBe(false);
    expect(config.providers.manual.quoteEnabled).toBe(true);
    expect(config.providers.manual.executionEnabled).toBe(false);
  });

  it("enables provider quote availability independently", () => {
    const config = resolvePayoutFeatureConfig({
      PAYOUTS_ENABLED: "true",
      PAYOUTS_WISE_ENABLED: "true",
      PAYOUTS_AIRWALLEX_ENABLED: "false",
      PAYOUTS_CURRENCYCLOUD_ENABLED: "true",
      PAYOUTS_CORPAY_ENABLED: "false",
      PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED: "true",
    });

    expect(config.providers.wise.quoteEnabled).toBe(true);
    expect(config.providers.airwallex.quoteEnabled).toBe(false);
    expect(config.providers.currencycloud.quoteEnabled).toBe(true);
    expect(config.providers.corpay.quoteEnabled).toBe(false);
    expect(config.providers.stripeGlobalPayouts.quoteEnabled).toBe(true);
  });

  it("blocks provider execution when the global execution flag is false", () => {
    const config = resolvePayoutFeatureConfig({
      PAYOUTS_ENABLED: "true",
      PAYOUTS_WISE_ENABLED: "true",
      PAYOUTS_EXECUTION_ENABLED: "false",
    });

    expect(config.execution.enabled).toBe(false);
    expect(config.providers.wise.quoteEnabled).toBe(true);
    expect(config.providers.wise.executionEnabled).toBe(false);
  });

  it("exposes sandbox-only mode to server configuration code", () => {
    const config = resolvePayoutFeatureConfig({
      PAYOUTS_ENABLED: "true",
      PAYOUTS_SANDBOX_ONLY: "true",
    });

    expect(config.sandboxOnly).toBe(true);
  });

  it("returns client-safe flags without leaking secret-shaped env values", () => {
    const config = getClientSafePayoutFeatureConfig({
      PAYOUTS_ENABLED: "true",
      PAYOUTS_WISE_ENABLED: "true",
      PAYOUTS_EXECUTION_ENABLED: "true",
      WISE_API_TOKEN: "should-not-leak",
      PAYOUTS_PROVIDER_SECRET: "should-not-leak",
    });

    const serialized = JSON.stringify(config);

    expect(serialized).not.toContain("should-not-leak");
    expect(serialized).not.toContain("WISE_API_TOKEN");
    expect(serialized).not.toContain("PAYOUTS_PROVIDER_SECRET");
    expect(Object.keys(config)).toEqual([
      "enabled",
      "sandboxOnly",
      "providers",
    ]);
  });
});
