import { afterEach, describe, expect, it, vi } from "vitest";

const doubles = vi.hoisted(() => ({
  createClient: vi.fn(() => ({ rpc: vi.fn() })),
  cookies: vi.fn(async () => {
    throw new Error("an anonymous client reads no cookie");
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: doubles.createClient,
}));
vi.mock("next/headers", () => ({ cookies: doubles.cookies }));

import { createAnonymousClient } from "../../../../packages/database/supabase/server";

afterEach(() => {
  vi.unstubAllEnvs();
  doubles.createClient.mockClear();
});

describe("AL-2681 part 2a fix round F4: an anonymous server client carries no session", () => {
  it("is made from the public key with no session kept or refreshed, and reads no cookie", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    expect(createAnonymousClient()).not.toBeNull();
    expect(doubles.createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    expect(doubles.cookies).not.toHaveBeenCalled();
  });

  it("is absent when the public configuration is", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(createAnonymousClient()).toBeNull();
    expect(doubles.createClient).not.toHaveBeenCalled();
  });
});
