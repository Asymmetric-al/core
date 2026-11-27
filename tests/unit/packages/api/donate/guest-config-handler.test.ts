import { describe, expect, it, vi } from "vitest";

import {
  createGivingConfigHandler,
  type GivingConfigDeps,
} from "../../../../../packages/api/src/donate/guest/config-handler";

const FUND = "11111111-1111-4111-8111-111111111111";
const UNAVAILABLE = { error: "giving_unavailable" };

function request(payload: unknown, host = "give.example.test") {
  return new Request(`https://${host}/api/checkout/config`, {
    method: "POST",
    headers: { host, "content-type": "application/json" },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

function setup(
  over: Partial<GivingConfigDeps> & { rows?: unknown; error?: unknown } = {},
) {
  const rpc = vi.fn(async () => ({
    data:
      over.rows === undefined
        ? [{ connected_account_id: "acct_alpha1" }]
        : over.rows,
    error: over.error ?? null,
  }));
  const deps: GivingConfigDeps = {
    enabled: () => true,
    publishableKey: () => "pk_test_51abc",
    rpc: () => rpc as never,
    ...over,
  };
  return { handler: createGivingConfigHandler(deps), rpc };
}

describe("AL-2681 PR 2a: the anonymous config read's route (W8-R18)", () => {
  it("answers exactly the publishable key and the connected account for an admitted host and its targets", async () => {
    const s = setup();
    const res = await s.handler(request({ targets: [{ fundId: FUND }] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      publishableKey: "pk_test_51abc",
      connectedAccountId: "acct_alpha1",
    });
    expect(s.rpc).toHaveBeenCalledWith("checkout_giving_config", {
      p_host: "give.example.test",
      p_targets: [{ fund_id: FUND }],
    });
  });

  it("every other case is the same generic unavailable: switch off, no key, a live key, no database, no row, an error, two rows, a malformed body", async () => {
    const cases: Array<[string, ReturnType<typeof setup>, unknown]> = [
      [
        "switch off",
        setup({ enabled: () => false }),
        { targets: [{ fundId: FUND }] },
      ],
      [
        "no key",
        setup({ publishableKey: () => undefined }),
        { targets: [{ fundId: FUND }] },
      ],
      [
        "a live key",
        setup({ publishableKey: () => "pk_live_51abc" }),
        { targets: [{ fundId: FUND }] },
      ],
      [
        "no database",
        setup({ rpc: () => null }),
        { targets: [{ fundId: FUND }] },
      ],
      ["no row", setup({ rows: [] }), { targets: [{ fundId: FUND }] }],
      [
        "an error",
        setup({
          rows: [{ connected_account_id: "acct_alpha1" }],
          error: { message: "boom" },
        }),
        { targets: [{ fundId: FUND }] },
      ],
      [
        "two rows",
        setup({
          rows: [
            { connected_account_id: "acct_a" },
            { connected_account_id: "acct_b" },
          ],
        }),
        { targets: [{ fundId: FUND }] },
      ],
      [
        "a malformed account",
        setup({ rows: [{ connected_account_id: "nope" }] }),
        { targets: [{ fundId: FUND }] },
      ],
      ["no targets", setup(), { targets: [] }],
      ["a malformed target", setup(), { targets: [{ fundId: "x" }] }],
      ["not json", setup(), "nope"],
    ];
    for (const [label, s, payload] of cases) {
      const res = await s.handler(request(payload));
      expect(res.status, label).toBe(503);
      expect(await res.json(), label).toEqual(UNAVAILABLE);
    }
  });

  it("takes the host only from Host: a forwarded host, the front's host, a tenant header, a name-tenant header and Origin change nothing (outcome 2 of 27 November)", async () => {
    const s = setup();
    await s.handler(
      new Request("https://give.example.test/api/checkout/config", {
        method: "POST",
        headers: {
          host: "give.example.test",
          "content-type": "application/json",
          "x-forwarded-host": "other.example.test",
          "x-asym-front-host": "other.example.test",
          "x-asym-tenant": "66666666-6666-4666-8666-666666666666",
          "x-asym-name-tenant": "66666666-6666-4666-8666-666666666666",
          origin: "https://other.example.test",
        },
        body: JSON.stringify({
          targets: [{ fundId: FUND }],
          host: "other.example.test",
          tenantId: "66666666-6666-4666-8666-666666666666",
        }),
      }),
    );
    expect(s.rpc).toHaveBeenCalledWith("checkout_giving_config", {
      p_host: "give.example.test",
      p_targets: [{ fund_id: FUND }],
    });
  });

  it("F6 (a): a throw from reading the switch or the publishable key, or from making the database client (the confirmation's finding 3), is the same generic unavailable", async () => {
    for (const over of [
      {
        enabled: () => {
          throw new Error("environment unreadable");
        },
      },
      {
        publishableKey: () => {
          throw new Error("environment unreadable");
        },
      },
      {
        rpc: () => {
          throw new Error(
            "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.",
          );
        },
      },
    ] as Array<Partial<GivingConfigDeps>>) {
      const s = setup(over);
      const res = await s.handler(request({ targets: [{ fundId: FUND }] }));
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual(UNAVAILABLE);
      expect(s.rpc).not.toHaveBeenCalled();
    }
  });

  it("asks nothing of the database while the switch is off", async () => {
    const s = setup({ enabled: () => false });
    await s.handler(request({ targets: [{ fundId: FUND }] }));
    expect(s.rpc).not.toHaveBeenCalled();
  });
});
