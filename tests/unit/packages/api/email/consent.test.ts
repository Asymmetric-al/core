import { describe, expect, it, vi } from "vitest";

import { evaluateEmailConsent } from "../../../../../packages/api/src/email/consent";

type TableResult = {
  data?: unknown;
  error?: { message: string } | null;
};

/**
 * Minimal chainable Supabase mock. Filter methods return the chain; `limit`
 * returns a thenable that also exposes `maybeSingle`, so both the donor lookup
 * (`.limit(1).maybeSingle()`) and the suppression lookup (`.limit(10)` awaited
 * directly) resolve their per-table result. Records eq/ilike args for scoping
 * assertions.
 */
function buildClient(handlers: Record<string, () => TableResult>) {
  const calls: Record<string, { eq: unknown[][]; ilike: unknown[][] }> = {};

  const client = {
    from: vi.fn((table: string) => {
      if (!handlers[table]) {
        throw new Error(`Unexpected table in mock: ${table}`);
      }
      calls[table] ??= { eq: [], ilike: [] };

      const chain: Record<string, unknown> = {};
      chain.select = vi.fn(() => chain);
      chain.eq = vi.fn((...args: unknown[]) => {
        calls[table].eq.push(args);
        return chain;
      });
      chain.ilike = vi.fn((...args: unknown[]) => {
        calls[table].ilike.push(args);
        return chain;
      });
      chain.limit = vi.fn(() => {
        const settled = Promise.resolve(handlers[table]());
        return {
          maybeSingle: vi.fn(() => settled),
          then: settled.then.bind(settled),
          catch: settled.catch.bind(settled),
          finally: settled.finally.bind(settled),
        };
      });
      return chain;
    }),
  };

  return { client: client as never, calls };
}

const cleanDonor = () => ({
  data: { do_not_email: false, do_not_contact: false },
  error: null,
});
const noDonor = () => ({ data: null, error: null });
const noSuppression = () => ({ data: [], error: null });
const suppressedWith =
  (...types: string[]) =>
  () => ({
    data: types.map((suppression_type) => ({ suppression_type })),
    error: null,
  });

describe("evaluateEmailConsent", () => {
  it("allows transactional and marketing sends to a clean recipient", async () => {
    for (const messageType of ["transactional", "marketing"] as const) {
      const { client } = buildClient({
        donors: cleanDonor,
        email_suppressions: noSuppression,
      });
      const decision = await evaluateEmailConsent({
        supabaseAdmin: client,
        tenantId: "tenant-1",
        email: "ada@example.com",
        donorId: "donor-1",
        messageType,
      });
      expect(decision).toEqual({ allowed: true });
    }
  });

  it("blocks all mail when the donor has do_not_contact set", async () => {
    for (const messageType of ["transactional", "marketing"] as const) {
      const { client } = buildClient({
        donors: () => ({
          data: { do_not_email: false, do_not_contact: true },
          error: null,
        }),
        email_suppressions: noSuppression,
      });
      const decision = await evaluateEmailConsent({
        supabaseAdmin: client,
        tenantId: "tenant-1",
        email: "ada@example.com",
        donorId: "donor-1",
        messageType,
      });
      expect(decision).toEqual({ allowed: false, reason: "do_not_contact" });
    }
  });

  it("blocks marketing but allows transactional for a do_not_email donor", async () => {
    const donors = () => ({
      data: { do_not_email: true, do_not_contact: false },
      error: null,
    });

    const marketing = await evaluateEmailConsent({
      supabaseAdmin: buildClient({ donors, email_suppressions: noSuppression })
        .client,
      tenantId: "tenant-1",
      email: "ada@example.com",
      donorId: "donor-1",
      messageType: "marketing",
    });
    expect(marketing).toEqual({ allowed: false, reason: "do_not_email" });

    const transactional = await evaluateEmailConsent({
      supabaseAdmin: buildClient({ donors, email_suppressions: noSuppression })
        .client,
      tenantId: "tenant-1",
      email: "ada@example.com",
      donorId: "donor-1",
      messageType: "transactional",
    });
    expect(transactional).toEqual({ allowed: true });
  });

  it("blocks marketing but allows transactional for an unsubscribe suppression", async () => {
    const marketing = await evaluateEmailConsent({
      supabaseAdmin: buildClient({
        donors: cleanDonor,
        email_suppressions: suppressedWith("unsubscribe"),
      }).client,
      tenantId: "tenant-1",
      email: "ada@example.com",
      donorId: "donor-1",
      messageType: "marketing",
    });
    expect(marketing).toEqual({
      allowed: false,
      reason: "suppressed",
      suppressionType: "unsubscribe",
    });

    const transactional = await evaluateEmailConsent({
      supabaseAdmin: buildClient({
        donors: cleanDonor,
        email_suppressions: suppressedWith("unsubscribe"),
      }).client,
      tenantId: "tenant-1",
      email: "ada@example.com",
      donorId: "donor-1",
      messageType: "transactional",
    });
    expect(transactional).toEqual({ allowed: true });
  });

  it.each(["bounce", "spam", "manual"])(
    "blocks even transactional mail for a %s suppression",
    async (suppressionType) => {
      const { client } = buildClient({
        donors: cleanDonor,
        email_suppressions: suppressedWith(suppressionType),
      });
      const decision = await evaluateEmailConsent({
        supabaseAdmin: client,
        tenantId: "tenant-1",
        email: "bounced@example.com",
        donorId: "donor-1",
        messageType: "transactional",
      });
      expect(decision).toEqual({
        allowed: false,
        reason: "suppressed",
        suppressionType,
      });
    },
  );

  it("lets a hard bounce block transactional mail even alongside an unsubscribe", async () => {
    const { client } = buildClient({
      donors: cleanDonor,
      email_suppressions: suppressedWith("unsubscribe", "bounce"),
    });
    const decision = await evaluateEmailConsent({
      supabaseAdmin: client,
      tenantId: "tenant-1",
      email: "ada@example.com",
      donorId: "donor-1",
      messageType: "transactional",
    });
    expect(decision).toEqual({
      allowed: false,
      reason: "suppressed",
      suppressionType: "bounce",
    });
  });

  it("reports do_not_contact ahead of a suppression when both apply", async () => {
    const { client } = buildClient({
      donors: () => ({
        data: { do_not_email: true, do_not_contact: true },
        error: null,
      }),
      email_suppressions: suppressedWith("bounce"),
    });
    const decision = await evaluateEmailConsent({
      supabaseAdmin: client,
      tenantId: "tenant-1",
      email: "ada@example.com",
      donorId: "donor-1",
      messageType: "marketing",
    });
    expect(decision).toEqual({ allowed: false, reason: "do_not_contact" });
  });

  it("allows when no donor row exists and the address is not suppressed", async () => {
    const { client } = buildClient({
      donors: noDonor,
      email_suppressions: noSuppression,
    });
    const decision = await evaluateEmailConsent({
      supabaseAdmin: client,
      tenantId: "tenant-1",
      email: "stranger@example.com",
      messageType: "marketing",
    });
    expect(decision).toEqual({ allowed: true });
  });

  it("resolves donor consent by donor id scoped to tenant when donorId is given", async () => {
    const { client, calls } = buildClient({
      donors: cleanDonor,
      email_suppressions: noSuppression,
    });

    const decision = await evaluateEmailConsent({
      supabaseAdmin: client,
      tenantId: "tenant-1",
      email: "ada@example.com",
      donorId: "donor-1",
      messageType: "transactional",
    });

    expect(decision).toEqual({ allowed: true });
    expect(calls.donors.eq).toContainEqual(["id", "donor-1"]);
    expect(calls.donors.eq).toContainEqual(["tenant_id", "tenant-1"]);
  });

  it("resolves donor consent by tenant + email (escaped) when no donorId is given", async () => {
    const { client, calls } = buildClient({
      donors: () => ({
        data: { do_not_email: true, do_not_contact: false },
        error: null,
      }),
      email_suppressions: noSuppression,
    });

    const decision = await evaluateEmailConsent({
      supabaseAdmin: client,
      tenantId: "tenant-1",
      email: "ada_lovelace@example.com",
      messageType: "marketing",
    });

    expect(decision).toEqual({ allowed: false, reason: "do_not_email" });
    expect(calls.donors.eq).toContainEqual(["tenant_id", "tenant-1"]);
    expect(calls.donors.ilike).toContainEqual([
      "email",
      "ada\\_lovelace@example.com",
    ]);
    expect(calls.email_suppressions.ilike).toContainEqual([
      "email",
      "ada\\_lovelace@example.com",
    ]);
  });

  it("fails closed (throws) when the donor consent lookup errors", async () => {
    const { client } = buildClient({
      donors: () => ({ data: null, error: { message: "donor boom" } }),
      email_suppressions: noSuppression,
    });
    await expect(
      evaluateEmailConsent({
        supabaseAdmin: client,
        tenantId: "tenant-1",
        email: "ada@example.com",
        donorId: "donor-1",
        messageType: "transactional",
      }),
    ).rejects.toThrow("Failed to load donor consent flags");
  });

  it("fails closed (throws) when the suppression lookup errors", async () => {
    const { client } = buildClient({
      donors: cleanDonor,
      email_suppressions: () => ({
        data: null,
        error: { message: "suppression boom" },
      }),
    });
    await expect(
      evaluateEmailConsent({
        supabaseAdmin: client,
        tenantId: "tenant-1",
        email: "ada@example.com",
        donorId: "donor-1",
        messageType: "transactional",
      }),
    ).rejects.toThrow("Failed to load email suppression");
  });

  it("throws when the recipient address is blank", async () => {
    const { client } = buildClient({
      donors: cleanDonor,
      email_suppressions: noSuppression,
    });
    await expect(
      evaluateEmailConsent({
        supabaseAdmin: client,
        tenantId: "tenant-1",
        email: "   ",
        donorId: "donor-1",
        messageType: "transactional",
      }),
    ).rejects.toThrow("without a recipient address");
  });
});
