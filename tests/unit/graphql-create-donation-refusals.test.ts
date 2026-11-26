import { beforeEach, describe, expect, it, vi } from "vitest";

import { createGraphQLHandler } from "../../packages/graphql/handler";
import { membershipsForRole } from "../fixtures/auth-memberships";

import type * as AuthModule from "../../packages/auth/context";

const h = vi.hoisted(() => ({
  intake: { ok: false, code: "conflict" } as Record<string, unknown>,
  reads: [] as string[],
}));

vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => ({
    userId: "user-d",
    email: null,
    tenantId: "tenant-a",
    role: "donor",
    memberships: membershipsForRole("donor", "tenant-a"),
    profileId: "profile-d",
    isAuthenticated: true,
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: {
      from: (table: string) => {
        h.reads.push(table);
        throw new Error(`no read expected after a refused intake: ${table}`);
      },
      rpc: () => {
        throw new Error("the intake is mocked");
      },
    },
    error: null,
  }),
}));
vi.mock("@asym/api/donate/begin-gift-intake", () => ({
  beginGiftIntake: async () => h.intake,
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

async function createDonation() {
  const res = await createGraphQLHandler().POST(
    new Request("http://localhost/api/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key":
          "gift:00000000-0000-4000-8000-0000000000f1:create_payment",
      },
      body: JSON.stringify({
        query:
          'mutation { createDonation(input: { missionaryId: "00000000-0000-4000-8000-0000000000a1", amount: 2500 }) { id } }',
      }),
    }),
  );
  return (await res.json()) as {
    data?: unknown;
    errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
  };
}

describe("GraphQL createDonation names the gift intake's refusals through the real handler (AL-2678 WP5 rest, fix round F3)", () => {
  beforeEach(() => {
    h.reads.length = 0;
  });

  it("a key a provider request holds: Idempotency key already used, IDEMPOTENCY_KEY_REUSED, never the masked Unexpected error (red: Unexpected error.)", async () => {
    h.intake = { ok: false, code: "conflict" };
    const r = await createDonation();
    expect(r.errors).toEqual([
      expect.objectContaining({
        message: "Idempotency key already used",
        extensions: { code: "IDEMPOTENCY_KEY_REUSED" },
      }),
    ]);
    expect(h.reads).toEqual([]);
  });

  it("a person with two donors on their Party: Multiple donor records for this account, MULTIPLE_DONORS (fix round F2; red: Unexpected error.)", async () => {
    h.intake = { ok: false, code: "multiple_donors" };
    const r = await createDonation();
    expect(r.errors).toEqual([
      expect.objectContaining({
        message: "Multiple donor records for this account",
        extensions: { code: "MULTIPLE_DONORS" },
      }),
    ]);
    expect(h.reads).toEqual([]);
  });
});
