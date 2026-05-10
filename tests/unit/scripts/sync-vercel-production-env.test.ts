import { describe, expect, it } from "vitest";

import {
  allInputRequirements,
  envEntriesForProject,
  providerRequirementsForProject,
  validateInputEnv,
} from "../../../scripts/sync-vercel-production-env.mjs";

const validEnv = {
  VERCEL_TOKEN: "vercel-token",
  STRIPE_SECRET_KEY: "sk_live_123",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_123",
  ADMIN_STRIPE_WEBHOOK_SECRET: "whsec_admin",
  DONOR_STRIPE_WEBHOOK_SECRET: "whsec_donor",
  MISSIONARY_STRIPE_WEBHOOK_SECRET: "whsec_missionary",
  SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
  NEXT_PUBLIC_SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
  RESEND_API_KEY: "re_123",
  RESEND_WEBHOOK_SECRET: "whsec_resend",
  RESEND_ENCRYPTION_KEY: "x".repeat(32),
};

describe("sync Vercel production env helpers", () => {
  it("deduplicates common input requirements while preserving app-specific webhook secrets", () => {
    expect(allInputRequirements().map((entry) => entry.inputKey)).toEqual([
      "ADMIN_STRIPE_WEBHOOK_SECRET",
      "DONOR_STRIPE_WEBHOOK_SECRET",
      "MISSIONARY_STRIPE_WEBHOOK_SECRET",
      "NEXT_PUBLIC_SENTRY_DSN",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "RESEND_API_KEY",
      "RESEND_ENCRYPTION_KEY",
      "RESEND_WEBHOOK_SECRET",
      "SENTRY_DSN",
      "STRIPE_SECRET_KEY",
    ]);
  });

  it("uses app-specific Stripe webhook input names for the shared Vercel env key", () => {
    expect(
      providerRequirementsForProject("admin").find(
        (entry) => entry.vercelKey === "STRIPE_WEBHOOK_SECRET",
      )?.inputKey,
    ).toBe("ADMIN_STRIPE_WEBHOOK_SECRET");
    expect(
      providerRequirementsForProject("donor").find(
        (entry) => entry.vercelKey === "STRIPE_WEBHOOK_SECRET",
      )?.inputKey,
    ).toBe("DONOR_STRIPE_WEBHOOK_SECRET");
    expect(
      providerRequirementsForProject("missionary").find(
        (entry) => entry.vercelKey === "STRIPE_WEBHOOK_SECRET",
      )?.inputKey,
    ).toBe("MISSIONARY_STRIPE_WEBHOOK_SECRET");
  });

  it("validates required env names and value shapes before syncing", () => {
    expect(validateInputEnv(validEnv)).toEqual({ missing: [], invalid: [] });

    expect(
      validateInputEnv({
        ...validEnv,
        STRIPE_SECRET_KEY: "sk_test_123",
        RESEND_ENCRYPTION_KEY: "short",
        SENTRY_DSN: "not-a-url",
      }).invalid,
    ).toEqual([
      {
        inputKey: "RESEND_ENCRYPTION_KEY",
        reason: "must be at least 32 characters",
      },
      { inputKey: "SENTRY_DSN", reason: "must be a URL" },
      { inputKey: "STRIPE_SECRET_KEY", reason: "must start with sk_live_" },
    ]);
  });

  it("fails closed when secrets are missing", () => {
    const { missing } = validateInputEnv({
      ...validEnv,
      VERCEL_TOKEN: "",
      ADMIN_STRIPE_WEBHOOK_SECRET: "",
      RESEND_WEBHOOK_SECRET: undefined,
    });

    expect(missing).toEqual([
      "ADMIN_STRIPE_WEBHOOK_SECRET",
      "RESEND_WEBHOOK_SECRET",
      "VERCEL_TOKEN",
    ]);
  });

  it("maps provider inputs to the production Vercel env names without exposing values in names", () => {
    expect(envEntriesForProject("donor", validEnv)).toEqual([
      {
        vercelKey: "STRIPE_SECRET_KEY",
        inputKey: "STRIPE_SECRET_KEY",
        value: "sk_live_123",
        sensitive: true,
      },
      {
        vercelKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        inputKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        value: "pk_live_123",
        sensitive: false,
      },
      {
        vercelKey: "SENTRY_DSN",
        inputKey: "SENTRY_DSN",
        value: "https://public@example.ingest.sentry.io/1",
        sensitive: true,
      },
      {
        vercelKey: "NEXT_PUBLIC_SENTRY_DSN",
        inputKey: "NEXT_PUBLIC_SENTRY_DSN",
        value: "https://public@example.ingest.sentry.io/1",
        sensitive: false,
      },
      {
        vercelKey: "RESEND_API_KEY",
        inputKey: "RESEND_API_KEY",
        value: "re_123",
        sensitive: true,
      },
      {
        vercelKey: "RESEND_WEBHOOK_SECRET",
        inputKey: "RESEND_WEBHOOK_SECRET",
        value: "whsec_resend",
        sensitive: true,
      },
      {
        vercelKey: "RESEND_ENCRYPTION_KEY",
        inputKey: "RESEND_ENCRYPTION_KEY",
        value: "x".repeat(32),
        sensitive: true,
      },
      {
        vercelKey: "STRIPE_WEBHOOK_SECRET",
        inputKey: "DONOR_STRIPE_WEBHOOK_SECRET",
        value: "whsec_donor",
        sensitive: true,
      },
    ]);
  });
});
