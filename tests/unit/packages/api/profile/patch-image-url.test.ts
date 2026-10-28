import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
const m = vi.hoisted(() => ({
  ctx: {} as Row,
  rows: {} as Record<string, Row | null>,
  writes: [] as { table: string; values: Row }[],
}));

/** Reads return m.rows[table]; updates are recorded in m.writes. */
function fakeAdmin() {
  return {
    from(table: string) {
      let values: Row | null = null;
      const result = () => {
        if (values) m.writes.push({ table, values });
        return { data: values ? null : (m.rows[table] ?? null), error: null };
      };
      const q: Row = {
        select: () => q,
        eq: () => q,
        update: (v: Row) => ((values = v), q),
        single: async () => result(),
        maybeSingle: async () => result(),
        then: (ok: (v: unknown) => unknown) =>
          Promise.resolve(result()).then(ok),
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
  hasContextRole: (ctx: Row, role: string) => ctx.role === role,
}));
vi.mock(
  "../../../../../packages/api/src/profile/image-url",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../../packages/api/src/profile/image-url")
      >();
    return {
      ...actual,
      checkProfileImageUrl: vi.fn(actual.checkProfileImageUrl),
    };
  },
);

import { PATCH } from "../../../../../packages/api/src/profile";
import { checkProfileImageUrl } from "../../../../../packages/api/src/profile/image-url";

const ORIGIN = "https://proj.supabase.co";
const T = "aaaaaaaa-0000-4000-8000-00000000000a";
const U = "cccccccc-0000-4000-8000-00000000000c";
const own = (purpose: string) =>
  `${ORIGIN}/storage/v1/object/public/profiles/${purpose}/${T}/${U}/x.webp`;
const STORED_AVATAR = "https://images.unsplash.com/photo-1?w=400";
const STORED_COVER = `${ORIGIN}/storage/v1/object/public/profiles/covers/${U}-1.webp`;

async function patch(body: Row, role = "missionary") {
  m.ctx = { userId: U, tenantId: T, profileId: "p-1", role };
  const res = await PATCH(
    new NextRequest("https://app.test/api/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, body: (await res.json()) as Row };
}
const written = (table: string) =>
  m.writes.filter((w) => w.table === table).map((w) => w.values);

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ORIGIN);
  vi.mocked(checkProfileImageUrl).mockClear();
  m.writes = [];
  m.rows = {
    profiles: { id: "p-1", avatar_url: STORED_AVATAR },
    missionaries: { profile_id: "p-1", cover_url: STORED_COVER },
  };
});

describe("PATCH /api/profile image URLs (#2406)", () => {
  it("passes ctx.tenantId, ctx.userId and the stored values to the validator", async () => {
    await patch({ avatarUrl: own("avatars"), coverUrl: own("covers") });
    expect(checkProfileImageUrl).toHaveBeenCalledWith(own("avatars"), {
      purpose: "avatars",
      tenantId: T,
      userId: U,
      stored: [STORED_AVATAR],
    });
    expect(checkProfileImageUrl).toHaveBeenCalledWith(own("covers"), {
      purpose: "covers",
      tenantId: T,
      userId: U,
      stored: [STORED_COVER],
    });
  });

  it("writes new own-folder avatarUrl and coverUrl", async () => {
    const r = await patch({
      avatarUrl: own("avatars"),
      coverUrl: own("covers"),
    });
    expect(r.status).toBe(200);
    expect(written("profiles")[0]).toMatchObject({
      avatar_url: own("avatars"),
    });
    expect(written("missionaries")[0]).toMatchObject({
      cover_url: own("covers"),
    });
  });

  it("rejects an invalid avatarUrl with 400 before writing other fields", async () => {
    const r = await patch({
      firstName: "Changed",
      bio: "New",
      avatarUrl: "https://evil.example/x.webp",
    });
    expect(r.status).toBe(400);
    expect(typeof r.body.error).toBe("string");
    expect(m.writes).toEqual([]);
  });

  it("rejects an invalid coverUrl with 400 before the profile write and the role check", async () => {
    for (const role of ["missionary", "donor"]) {
      const r = await patch(
        { firstName: "Changed", coverUrl: own("avatars") },
        role,
      );
      expect(r.status).toBe(400);
    }
    expect(m.writes).toEqual([]);
  });

  it("does not rewrite unchanged stored values (OQ2)", async () => {
    const r = await patch({
      firstName: "Changed",
      avatarUrl: STORED_AVATAR,
      coverUrl: STORED_COVER,
    });
    expect(r.status).toBe(200);
    expect(written("profiles")).toHaveLength(1);
    expect(written("profiles")[0]).not.toHaveProperty("avatar_url");
    expect(written("missionaries")).toEqual([]);
  });

  it("returns 503 with no write for a new URL when NEXT_PUBLIC_SUPABASE_URL is unset; null still clears", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    const r = await patch({ firstName: "Changed", avatarUrl: own("avatars") });
    expect(r.status).toBe(503);
    expect(m.writes).toEqual([]);
    const cleared = await patch({ avatarUrl: null });
    expect(cleared.status).toBe(200);
    expect(written("profiles")[0]).toMatchObject({ avatar_url: null });
  });
});
