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
});
