import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

function withProtectedDeploymentEnv() {
  process.env = {
    ...originalEnv,
    NODE_ENV: "development",
    VERCEL_ENV: "preview",
    VERCEL_TARGET_ENV: "core-development",
    SKIP_ENV_VALIDATION: "false",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_WEBHOOK_SECRET: "whsec_test_123",
    INNGEST_EVENT_KEY: "test-event-key",
    INNGEST_SIGNING_KEY: "signkey-test",
    RESEND_API_KEY: "re_test_123",
    RESEND_WEBHOOK_SECRET: "whsec_test_123",
    RESEND_ENCRYPTION_KEY: "12345678901234567890123456789012",
    SENTRY_DSN: "https://public@example.com/1",
    E2E_AUTH_BYPASS: "true",
  };
}

describe("env schema", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("does not treat false-like SKIP_ENV_VALIDATION values as skipping protected E2E bypass guards", async () => {
    withProtectedDeploymentEnv();
    vi.resetModules();

    await expect(import("../../../../packages/env/src/schema")).rejects.toThrow(
      "E2E_AUTH_BYPASS must not be enabled",
    );
  });
});
