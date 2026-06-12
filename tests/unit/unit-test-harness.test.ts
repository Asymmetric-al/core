import { describe, expect, it } from "vitest";

import vitestConfig from "../../vitest.config";

describe("unit test harness", () => {
  it("applies SKIP_ENV_VALIDATION from vitest env defaults", () => {
    expect(process.env.SKIP_ENV_VALIDATION).toBe("1");
  });

  it("uses placeholder Supabase URLs from vitest env (not .env.local)", () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("test-anon-key");
  });

  it("clears SUPABASE_SERVICE_ROLE_KEY in unit-env setup", () => {
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });

  it("sets PAYLOAD_SECRET via unit-env setup", () => {
    expect(process.env.PAYLOAD_SECRET).toBe("unit-test-payload-secret");
  });

  it("enables clearMocks in vitest config", () => {
    const testConfig = vitestConfig.test;
    const clearMocks =
      testConfig && typeof testConfig === "object" && "clearMocks" in testConfig
        ? testConfig.clearMocks
        : undefined;

    expect(clearMocks).toBe(true);
  });
});
