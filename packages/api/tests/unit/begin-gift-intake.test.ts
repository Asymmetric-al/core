import { describe, expect, it, vi } from "vitest";

import { beginGiftIntake } from "../../src/donate/begin-gift-intake";

import type { GiftIntakeRpcInvoker } from "../../src/donate/begin-gift-intake";

const BASE_INPUT = {
  tenantId: "tenant-1",
  profileId: "profile-1",
  actorUserId: "user-1",
  missionaryId: "missionary-1",
  fundId: null as string | null,
  amountCents: 2500,
  currency: "USD",
  idempotencyKey: "idem-1",
  ipAddress: "127.0.0.1",
  userAgent: "vitest",
};

function mockRpc(
  result: Awaited<ReturnType<GiftIntakeRpcInvoker>>,
): GiftIntakeRpcInvoker {
  return vi.fn().mockResolvedValue(result);
}

describe("beginGiftIntake", () => {
  it("calls begin_donation_saga with amountCents and a lowercased currency", async () => {
    const rpc = mockRpc({
      data: {
        donation_id: "don-1",
        outbox_id: "out-1",
        replayed: false,
      },
      error: null,
    });

    const result = await beginGiftIntake({ ...BASE_INPUT, rpc });

    expect(result).toEqual({
      ok: true,
      donationId: "don-1",
      outboxId: "out-1",
      replayed: false,
    });
    expect(rpc).toHaveBeenCalledWith("begin_donation_saga", {
      p_tenant_id: "tenant-1",
      p_profile_id: "profile-1",
      p_actor_user_id: "user-1",
      p_missionary_id: "missionary-1",
      p_fund_id: null,
      p_amount: 2500,
      p_currency: "usd",
      p_idempotency_key: "idem-1",
      p_ip_address: "127.0.0.1",
      p_user_agent: "vitest",
    });
  });

  it("names the donor a fresh gift was stored for, as the saga returns it, and none on a replay (AL-2678 WP5 rest 2a, fix round F1; red: no donorId)", async () => {
    const fresh = await beginGiftIntake({
      ...BASE_INPUT,
      rpc: mockRpc({
        data: {
          donation_id: "don-1",
          outbox_id: "out-1",
          replayed: false,
          donor_id: "donor-1",
        },
        error: null,
      }),
    });
    expect(fresh).toEqual({
      ok: true,
      donationId: "don-1",
      outboxId: "out-1",
      replayed: false,
      donorId: "donor-1",
    });
    const replay = await beginGiftIntake({
      ...BASE_INPUT,
      rpc: mockRpc({
        data: {
          donation_id: "don-1",
          outbox_id: "out-1",
          replayed: true,
          donor_id: "donor-1",
        },
        error: null,
      }),
    });
    expect(replay.ok && replay.donorId).toBeUndefined();
    const blank = await beginGiftIntake({
      ...BASE_INPUT,
      rpc: mockRpc({
        data: {
          donation_id: "don-1",
          outbox_id: "out-1",
          replayed: false,
          donor_id: "",
        },
        error: null,
      }),
    });
    expect(blank.ok && blank.donorId).toBeUndefined();
  });

  it("leaves one line an operator can find when the saga refuses 21000, with the organization and login ids alone, and answers as before (AL-2678 WP5 rest 2a, fix round F5; red: no line)", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const result = await beginGiftIntake({
        ...BASE_INPUT,
        rpc: mockRpc({
          data: null,
          error: {
            code: "21000",
            message: "Multiple donor records for this account",
          },
        }),
      });
      expect(result).toEqual({ ok: false, code: "multiple_donors" });
      expect(spy).toHaveBeenCalledTimes(1);
      const [line, fields] = spy.mock.calls[0]!;
      expect(typeof line).toBe("string");
      expect(fields).toEqual({ tenantId: "tenant-1", loginId: "user-1" });
    } finally {
      spy.mockRestore();
    }
  });

  it("trims then lowercases currency before the saga RPC", async () => {
    const rpc = mockRpc({
      data: {
        donation_id: "don-1",
        outbox_id: "out-1",
        replayed: false,
      },
      error: null,
    });

    await beginGiftIntake({ ...BASE_INPUT, rpc, currency: " USD " });

    expect(rpc).toHaveBeenCalledWith(
      "begin_donation_saga",
      expect.objectContaining({ p_currency: "usd" }),
    );

    await beginGiftIntake({ ...BASE_INPUT, rpc, currency: " usd" });

    expect(rpc).toHaveBeenLastCalledWith(
      "begin_donation_saga",
      expect.objectContaining({ p_currency: "usd" }),
    );
  });

  it("parses an array-shaped RPC payload", async () => {
    const rpc = mockRpc({
      data: [
        {
          donation_id: "don-2",
          outbox_id: "out-2",
          replayed: true,
        },
      ],
      error: null,
    });

    await expect(beginGiftIntake({ ...BASE_INPUT, rpc })).resolves.toEqual({
      ok: true,
      donationId: "don-2",
      outboxId: "out-2",
      replayed: true,
    });
  });

  it("maps P0002 to not_found", async () => {
    const rpc = mockRpc({
      data: null,
      error: { code: "P0002", message: "no rows" },
    });

    await expect(beginGiftIntake({ ...BASE_INPUT, rpc })).resolves.toEqual({
      ok: false,
      code: "not_found",
    });
  });

  it("maps 22023 to invalid with the RPC message", async () => {
    const rpc = mockRpc({
      data: null,
      error: { code: "22023", message: "amount must be positive" },
    });

    await expect(beginGiftIntake({ ...BASE_INPUT, rpc })).resolves.toEqual({
      ok: false,
      code: "invalid",
      message: "amount must be positive",
    });
  });

  it("maps 23505, a key another kind of request holds, to conflict (AL-2678 WP5 rest, ruling Q-C: the saga answers only its own rows as replays)", async () => {
    const rpc = mockRpc({
      data: null,
      error: {
        code: "23505",
        message:
          'duplicate key value violates unique constraint "donation_saga_outbox_tenant_idempotency_key"',
      },
    });

    await expect(beginGiftIntake({ ...BASE_INPUT, rpc })).resolves.toEqual({
      ok: false,
      code: "conflict",
    });
  });

  it("maps 21000, a person whose Party has two donors in the organization, to multiple_donors (AL-2678 WP5 rest, fix round F2)", async () => {
    const rpc = mockRpc({
      data: null,
      error: {
        code: "21000",
        message: "More than one donor for this person in the organization",
      },
    });

    await expect(beginGiftIntake({ ...BASE_INPUT, rpc })).resolves.toEqual({
      ok: false,
      code: "multiple_donors",
    });
  });

  it("maps other RPC errors to failed with the RPC message", async () => {
    const rpc = mockRpc({
      data: null,
      error: { code: "XX000", message: "database exploded" },
    });

    await expect(beginGiftIntake({ ...BASE_INPUT, rpc })).resolves.toEqual({
      ok: false,
      code: "failed",
      message: "database exploded",
    });
  });

  it("treats a missing donation_id as incomplete", async () => {
    const rpc = mockRpc({
      data: { outbox_id: "out-1" },
      error: null,
    });

    await expect(beginGiftIntake({ ...BASE_INPUT, rpc })).resolves.toEqual({
      ok: false,
      code: "incomplete",
    });
  });

  it("treats an empty outbox_id as incomplete", async () => {
    const rpc = mockRpc({
      data: { donation_id: "don-1", outbox_id: "" },
      error: null,
    });

    await expect(beginGiftIntake({ ...BASE_INPUT, rpc })).resolves.toEqual({
      ok: false,
      code: "incomplete",
    });
  });

  it("forwards p_fee_extras when feeExtras is provided", async () => {
    const rpc = mockRpc({
      data: {
        donation_id: "don-1",
        outbox_id: "out-1",
        replayed: false,
      },
      error: null,
    });
    const feeExtras = {
      gift_amount_cents: "2500",
      cover_fees: "true",
      payment_method: "card" as const,
      cover_amount_cents: "103",
      estimated_fee_cents: "103",
    };

    await beginGiftIntake({ ...BASE_INPUT, rpc, feeExtras });

    expect(rpc).toHaveBeenCalledWith("begin_donation_saga", {
      p_tenant_id: "tenant-1",
      p_profile_id: "profile-1",
      p_actor_user_id: "user-1",
      p_missionary_id: "missionary-1",
      p_fund_id: null,
      p_amount: 2500,
      p_currency: "usd",
      p_idempotency_key: "idem-1",
      p_ip_address: "127.0.0.1",
      p_user_agent: "vitest",
      p_fee_extras: feeExtras,
    });
  });

  it("omits p_fee_extras when feeExtras is not provided", async () => {
    const rpc = mockRpc({
      data: {
        donation_id: "don-1",
        outbox_id: "out-1",
        replayed: false,
      },
      error: null,
    });

    await beginGiftIntake({ ...BASE_INPUT, rpc });

    const rpcArgs = vi.mocked(rpc).mock.calls[0]?.[1];
    expect(rpcArgs).toBeDefined();
    expect(rpcArgs).not.toHaveProperty("p_fee_extras");
  });
});
