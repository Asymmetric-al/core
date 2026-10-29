import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
const m = vi.hoisted(() => ({
  ctx: {} as Row,
  stored: { profile: null as string | null, donor: null as string | null },
  writes: [] as { table: string; values: Row }[],
}));

/** Only updates reach the admin client; reads go through the mocked service. */
function fakeAdmin() {
  return {
    from(table: string) {
      const q: Row = {
        eq: () => q,
        update: (values: Row) => (m.writes.push({ table, values }), q),
        then: (ok: (v: unknown) => unknown) =>
          Promise.resolve({ data: null, error: null }).then(ok),
      };
      return q;
    },
  };
}

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: fakeAdmin(), error: null }),
}));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => m.ctx,
  requireAuth: () => undefined,
  requireRole: () => undefined,
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({ log: async () => undefined }),
}));
vi.mock("../../../../../packages/api/src/donor-portal/service", () => ({
  resolveDonorPortalContext: async () => ({
    profile: { id: "p-1", avatar_url: m.stored.profile },
    donor: { id: "d-1", avatar_url: m.stored.donor },
  }),
  getDonorPortalSnapshot: async () => ({}),
}));
vi.mock(
  "../../../../../packages/api/src/profile/image-url",
  async (importOriginal) => {
    const actual = await importOriginal<typeof ImageUrl>();
    return {
      ...actual,
      checkProfileImageUrl: vi.fn(actual.checkProfileImageUrl),
    };
  },
);

import { PATCH } from "../../../../../packages/api/src/donor-portal";
import { checkProfileImageUrl } from "../../../../../packages/api/src/profile/image-url";

import type * as ImageUrl from "../../../../../packages/api/src/profile/image-url";

const ORIGIN = "https://proj.supabase.co";
const T = "aaaaaaaa-0000-4000-8000-00000000000a";
const U = "dddddddd-0000-4000-8000-00000000000d";
const P = `${ORIGIN}/storage/v1/object/public/profiles`;
const OWN = `${P}/avatars/${T}/${U}/x.webp`;

async function patch(body: Row) {
  m.ctx = { userId: U, tenantId: T, profileId: "p-1", role: "donor" };
  const res = await PATCH(
    new NextRequest("https://app.test/api/donor/portal", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, body: (await res.json()) as Row };
}
const avatarWrites = () =>
  m.writes.filter((w) => "avatar_url" in w.values).map((w) => w.table);

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ORIGIN);
  vi.mocked(checkProfileImageUrl).mockClear();
  m.writes = [];
  m.stored = { profile: `${P}/avatars/${U}-123.webp`, donor: null };
});

describe("PATCH /api/donor/portal avatarUrl (#2406)", () => {
  it("validates with ctx.tenantId, ctx.userId and both stored avatars, then writes both tables", async () => {
    const r = await patch({ avatarUrl: OWN });
    expect(r.status).toBe(200);
    expect(checkProfileImageUrl).toHaveBeenCalledWith(OWN, {
      purpose: "avatars",
      tenantId: T,
      userId: U,
      stored: [m.stored.profile, null],
    });
    expect(avatarWrites()).toEqual(["profiles", "donors"]);
  });

  it.each([
    ["an external URL", "https://images.unsplash.com/photo-2?w=400"],
    ["another user's folder", `${P}/avatars/${T}/someone-else/x.webp`],
    ["the covers purpose", `${P}/covers/${T}/${U}/x.webp`],
  ])("rejects %s with 400 before any write", async (_label, avatarUrl) => {
    const r = await patch({ firstName: "Changed", phone: "1", avatarUrl });
    expect(r.status).toBe(400);
    expect(typeof r.body.error).toBe("string");
    expect(m.writes).toEqual([]);
  });

  const X = "https://images.unsplash.com/photo-1?w=400";
  it.each([
    ["donors X, profiles NULL", { profile: null, donor: X }, { profiles: X }],
    ["profiles X, donors NULL", { profile: X, donor: null }, { donors: X }],
    ["both X", { profile: X, donor: X }, {}],
  ] as const)(
    "%s, resend X: only a column that differs gets X (OQ2, criterion 8)",
    async (_label, stored, expected) => {
      m.stored = { ...stored };
      const r = await patch({ phone: "555-0100", avatarUrl: X });
      expect(r.status).toBe(200);
      expect(m.writes.length).toBeGreaterThan(0);
      const avatars = m.writes
        .filter((w) => "avatar_url" in w.values)
        .map((w) => [w.table, w.values.avatar_url]);
      expect(Object.fromEntries(avatars)).toEqual(expected);
    },
  );

  it("returns 503 with no write for a new URL when NEXT_PUBLIC_SUPABASE_URL is unset; null still clears", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    const r = await patch({ firstName: "Changed", avatarUrl: OWN });
    expect(r.status).toBe(503);
    expect(m.writes).toEqual([]);
    expect((await patch({ avatarUrl: null })).status).toBe(200);
    expect(avatarWrites()).toEqual(["profiles"]);
  });
});
