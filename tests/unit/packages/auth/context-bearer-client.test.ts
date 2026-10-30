/**
 * #2308 spec r1 §4 C15: the bearer-scoped Supabase client factory.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  admin: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: mocks.admin,
}));

import { createBearerSupabaseClient } from "../../../../packages/auth/context";

describe("#2308 C15 createBearerSupabaseClient (B)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "unit-anon-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    mocks.createClient.mockReturnValue({ storage: {} });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ["url", "", "unit-anon-key"],
    ["key", "https://example.supabase.co", ""],
  ])("returns null without the public %s", (_part, url, key) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", key);

    expect(createBearerSupabaseClient("caller-token")).toBeNull();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("sends the caller's bearer with the public key and no persisted session", () => {
    const client = createBearerSupabaseClient("caller-token");

    expect(client).toBe(mocks.createClient.mock.results[0]!.value);
    expect(mocks.createClient).toHaveBeenCalledTimes(1);
    expect(mocks.createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "unit-anon-key",
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: "Bearer caller-token" } },
      },
    );
  });

  it("prefers the publishable key and never reaches for the service-role client", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_unit");

    createBearerSupabaseClient("caller-token");

    expect(mocks.createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "sb_publishable_unit",
      expect.anything(),
    );
    expect(mocks.admin).not.toHaveBeenCalled();
  });
});
