import { beforeEach, describe, expect, it, vi } from "vitest";

const doubles = vi.hoisted(() => ({
  cookieBound: vi.fn(async () => ({
    rpc: async () => ({
      data: null,
      error: { code: "PGRST301", message: "JWT expired" },
    }),
  })),
  anonymousRpc: vi.fn(async () => ({
    data: [{ connected_account_id: "acct_alpha1", way_back_host: null }],
    error: null,
  })),
}));

vi.mock("@asym/env", () => ({
  serverEnv: { GUEST_GIVING_ENABLED: true },
  clientEnv: { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_51abc" },
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: doubles.cookieBound,
  createAnonymousClient: () => ({ rpc: doubles.anonymousRpc }),
}));

import { POST } from "../../../../../packages/api/src/donate/guest/config-route";

const FUND = "11111111-1111-4111-8111-111111111111";

function request(cookie?: string) {
  const headers: Record<string, string> = {
    host: "give.example.test",
    "content-type": "application/json",
  };
  if (cookie) headers.cookie = cookie;
  return new Request("https://give.example.test/api/checkout/config", {
    method: "POST",
    headers,
    body: JSON.stringify({ targets: [{ fundId: FUND }] }),
  });
}

beforeEach(() => {
  doubles.cookieBound.mockClear();
  doubles.anonymousRpc.mockClear();
});

describe("AL-2681 part 2a fix round F4: the config read is anonymous", () => {
  it("a request carrying an expired session cookie gets the answer a request with none gets; no cookie is read or written", async () => {
    const withCookie = await POST(
      request("sb-127-auth-token=base64-expired-session; theme=dark"),
    );
    const without = await POST(request());
    expect(withCookie.status).toBe(200);
    expect(await withCookie.text()).toBe(await without.text());
    expect(withCookie.headers.get("set-cookie")).toBeNull();
    expect(doubles.cookieBound).not.toHaveBeenCalled();
    expect(doubles.anonymousRpc).toHaveBeenCalledWith(
      "checkout_giving_config",
      {
        p_host: "give.example.test",
        p_targets: [{ fund_id: FUND }],
        p_surface: "website",
        p_source_site: null,
      },
    );
  });
});
