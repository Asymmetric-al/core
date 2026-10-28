/** #2406 spec r2 criteria 11-18 against the real PATCH /api/profile and
 * PATCH /api/donor/portal handlers (real zod, auth role helpers, error mapping).
 * Only getAuthContext, the admin client (an in-memory table recorder) and the
 * audit logger are faked. Modules reload per test so a handler that reads
 * NEXT_PUBLIC_SUPABASE_URL at import time sees each test's value (OQ9).
 * Mutants: M7 "prefix" hosts, M8 "profiles-archive"/".." cases, M9 criterion
 * 14 (writes before validating), M11 "another user's folder", M12 "another
 * tenant's folder", M13 purpose swaps, M17 "super_admin with tenant T".
 */
import { existsSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO } from "./harness";

import type * as AuthContext from "@asym/auth/context";

type Row = Record<string, unknown>;
type Write = { table: string; op: string; values: unknown };
const m = vi.hoisted(() => ({
  auth: {} as Row,
  tables: {} as Record<string, Row[]>,
  writes: [] as Write[],
}));

/** Supabase-shaped query builder over m.tables; every write is recorded. */
function fakeAdmin() {
  return {
    from(table: string) {
      const filters: ((r: Row) => boolean)[] = [];
      let write: Omit<Write, "table"> | null = null;
      let mode: "many" | "single" | "maybe" = "many";
      const hit = () =>
        (m.tables[table] ?? []).filter((r) => filters.every((f) => f(r)));
      const run = () => {
        if (write) {
          m.writes.push({ table, ...write });
          const rows = write.op === "update" ? hit() : [];
          for (const r of rows) Object.assign(r, write.values);
          return { data: rows.map((r) => ({ ...r })), error: null };
        }
        const rows = hit().map((r) => ({ ...r }));
        if (mode === "many") return { data: rows, error: null };
        if (rows.length === 1 || (mode === "maybe" && rows.length === 0))
          return { data: rows[0] ?? null, error: null };
        return { data: null, error: { code: "PGRST116", message: "no row" } };
      };
      const q: Row = {};
      const chain =
        (fn: (...a: never[]) => unknown = () => undefined) =>
        (...a: never[]) => {
          fn(...a);
          return q;
        };
      const where = (test: (a: unknown, b: unknown) => boolean) =>
        chain(((k: string, v: unknown) =>
          filters.push((r) => test(r[k] ?? null, v))) as never);
      const op = (name: string) =>
        chain(((values: unknown) => (write = { op: name, values })) as never);
      for (const name of "select order limit range gte gt lt lte not or filter".split(
        " ",
      ))
        q[name] = chain();
      Object.assign(q, {
        eq: where((a, b) => a === b),
        neq: where((a, b) => a !== b),
        is: where((a, b) => a === b),
        in: where((a, b) => (b as unknown[]).includes(a)),
        match: chain(((o: Row) =>
          Object.entries(o).forEach(([k, v]) =>
            filters.push((r) => r[k] === v),
          )) as never),
        update: op("update"),
        insert: op("insert"),
        upsert: op("upsert"),
        delete: op("delete"),
        single: chain(() => (mode = "single")),
        maybeSingle: chain(() => (mode = "maybe")),
        then: (ok: (v: unknown) => unknown, fail: (e: unknown) => unknown) =>
          Promise.resolve().then(run).then(ok, fail),
      });
      return q;
    },
    rpc: async () => ({ data: null, error: { message: "rpc not faked" } }),
  };
}

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: fakeAdmin(), error: null }),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContext>()),
  getAuthContext: async () => m.auth,
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({ log: async () => undefined }),
}));

const ORIGIN = "https://acc2406.supabase.co";
const P = `${ORIGIN}/storage/v1/object/public/profiles`;
// Fixed ids with hex letters so the case-change cases really differ.
const T = "aaaaaaaa-0000-4000-8000-00000000000a";
const T2 = "bbbbbbbb-0000-4000-8000-00000000000b";
const X = "eeeeeeee-0000-4000-8000-00000000000e";
const A = {
  M: {
    userId: "cccccccc-0000-4000-8000-00000000000c",
    tenantId: T,
    role: "missionary",
  },
  D: {
    userId: "dddddddd-0000-4000-8000-00000000000d",
    tenantId: T,
    role: "donor",
  },
  SA: {
    userId: "fafafafa-0000-4000-8000-0000000000fa",
    tenantId: DEMO,
    role: "super_admin",
  },
  SAT: {
    userId: "fbfbfbfb-0000-4000-8000-0000000000fb",
    tenantId: T,
    role: "super_admin",
  },
} as const;
type Actor = keyof typeof A;
const PROFILE = Object.fromEntries(
  Object.keys(A).map((k, i) => [k, `10000000-0000-4000-8000-00000000000${i}`]),
) as Record<Actor, string>;
const F = "0b0e6c3e-7d1a-4b55-9b52-6a3f1d2c4e5f.webp";
const UM = A.M.userId;
const UD = A.D.userId;
const own = (purpose: string, actor: Actor = "M", file = F) =>
  `${P}/${purpose}/${A[actor].tenantId}/${A[actor].userId}/${file}`;
const STORED = {
  external:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  cover: `${P}/covers/${UM}-1.webp`,
  donor: `${P}/avatars/${UD}-123.webp`,
};

function seed() {
  m.writes = [];
  m.tables = {
    profiles: (Object.keys(A) as Actor[]).map((k) => ({
      id: PROFILE[k],
      user_id: A[k].userId,
      // The route reads profiles by ctx.tenantId (DEMO for SA), so rows use it too.
      tenant_id: A[k].tenantId,
      role: A[k].role,
      email: `${k.toLowerCase()}@example.test`,
      first_name: "First",
      last_name: "Last",
      full_name: "First Last",
      display_name: "First Last",
      phone: null,
      avatar_url: k === "M" ? STORED.external : k === "D" ? STORED.donor : null,
    })),
    missionaries: [
      {
        id: "20000000-0000-4000-8000-000000000001",
        profile_id: PROFILE.M,
        tenant_id: T,
        cover_url: STORED.cover,
        bio: null,
      },
    ],
    donors: [
      {
        id: "30000000-0000-4000-8000-000000000001",
        profile_id: PROFILE.D,
        tenant_id: T,
        name: "First Last",
        email: "d@example.test",
        avatar_url: STORED.donor,
      },
    ],
  };
}
const row = (table: string, profileKey: string, id: string) =>
  m.tables[table]!.find((r) => r[profileKey] === id)!;
const wrote = (column: string) =>
  m.writes.some(
    (w) =>
      typeof w.values === "object" && w.values !== null && column in w.values,
  );

async function send(route: "profile" | "donor", actor: Actor, body: Row) {
  m.auth = {
    isAuthenticated: true,
    email: null,
    memberships: [],
    userId: A[actor].userId,
    tenantId: A[actor].tenantId,
    profileId: PROFILE[actor],
    role: A[actor].role,
    profileRole: A[actor].role,
  };
  const mod =
    route === "profile"
      ? await import("../../../../packages/api/src/profile")
      : await import("../../../../packages/api/src/donor-portal");
  const path = route === "profile" ? "/api/profile" : "/api/donor/portal";
  const res = await mod.PATCH(
    new NextRequest(`https://app.example.test${path}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
  );
  return { status: res.status, body: (await res.json()) as Row };
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", ORIGIN);
  seed();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

async function accepted(route: "profile" | "donor", actor: Actor, body: Row) {
  const r = await send(route, actor, body);
  expect(r.status, JSON.stringify(r.body)).toBe(200);
}
async function rejected(
  route: "profile" | "donor",
  actor: Actor,
  body: Row,
  status = 400,
) {
  const before = structuredClone(m.tables);
  const r = await send(route, actor, body);
  expect(r.status, JSON.stringify(r.body)).toBe(status);
  expect(typeof r.body.error).toBe("string");
  expect(m.writes).toEqual([]);
  expect(m.tables).toEqual(before);
}

describe("#2406 PATCH /api/profile", () => {
  it("#2406 criterion 11: own avatars/T/U URL returns 200 and is stored in profiles.avatar_url", async () => {
    await accepted("profile", "M", { avatarUrl: own("avatars") });
    expect(row("profiles", "id", PROFILE.M).avatar_url).toBe(own("avatars"));
  });
  it("#2406 criterion 11: missionary's own covers/T/U URL is stored in missionaries.cover_url", async () => {
    const url = own("covers", "M", F.replace("webp", "jpg"));
    await accepted("profile", "M", { coverUrl: url });
    expect(row("missionaries", "profile_id", PROFILE.M).cover_url).toBe(url);
  });
  // Follow-up: 'Profile API: super_admin with no tenant can't save PATCH /api/profile' (addendum 1: criterion 11 third bullet is validator-only).
  it("#2406 criterion 11: super_admin without a tenant may use avatars/<DEMO_TENANT_ID>/U/", async () => {
    await accepted("profile", "SA", { avatarUrl: own("avatars", "SA") });
    expect(row("profiles", "id", PROFILE.SA).avatar_url).toBe(
      own("avatars", "SA"),
    );
  });
  it("#2406 criterion 11 (addendum 1, validator-only): isOwnProfileImageUrl accepts avatars/<DEMO_TENANT_ID>/U/ for a tenant-less super_admin resolved to DEMO", async () => {
    const { isOwnProfileImageUrl } =
      await import("../../../../packages/api/src/profile/image-url");
    const expected = {
      purpose: "avatars",
      tenantId: DEMO,
      userId: A.SA.userId,
      origin: ORIGIN,
    } as const;
    expect(isOwnProfileImageUrl(own("avatars", "SA"), expected)).toBe(true);
    expect(
      isOwnProfileImageUrl(own("avatars", "SA"), { ...expected, tenantId: T }),
    ).toBe(false);
  });
  it("#2406 criterion 11: supabase-js getPublicUrl for #2308-layout keys is accepted (avatar and cover)", async () => {
    const bucket = createClient(ORIGIN, "anon-key").storage.from("profiles");
    const avatar = bucket.getPublicUrl(`avatars/${T}/${UM}/${F}`).data
      .publicUrl;
    const cover = bucket.getPublicUrl(`covers/${T}/${UM}/${F}`).data.publicUrl;
    await accepted("profile", "M", { avatarUrl: avatar, coverUrl: cover });
    expect(row("profiles", "id", PROFILE.M).avatar_url).toBe(avatar);
    expect(row("missionaries", "profile_id", PROFILE.M).cover_url).toBe(cover);
  });
  it("#2406 criterion 11: the exact URL PR #2415's upload route returns is accepted", async (t) => {
    const route = "packages/api/src/upload/image.ts";
    if (!existsSync(route))
      t.skip(
        "PR #2415 (#2308 POST /api/upload/image) is not on this base; runs once it is",
      );
    const { buildProfileImageKey } = (await import(
      /* @vite-ignore */ `../../../../${route}`
    )) as { buildProfileImageKey: (i: Row) => string };
    const key = buildProfileImageKey({
      purpose: "avatars",
      tenantId: T,
      userId: UM,
      type: "image/webp",
    });
    // The route returns storage.getPublicUrl(path).data.publicUrl.
    const url = createClient(ORIGIN, "anon-key")
      .storage.from("profiles")
      .getPublicUrl(key).data.publicUrl;
    await accepted("profile", "M", { avatarUrl: url });
    expect(row("profiles", "id", PROFILE.M).avatar_url).toBe(url);
  });
  it("#2406 criterion 12: avatarUrl null and coverUrl null (missionary) return 200 and store NULL", async () => {
    await accepted("profile", "M", { avatarUrl: null, coverUrl: null });
    expect(row("profiles", "id", PROFILE.M).avatar_url).toBeNull();
    expect(row("missionaries", "profile_id", PROFILE.M).cover_url).toBeNull();
  });

  const mine = (purpose = "avatars") => `${purpose}/${T}/${UM}`;
  const host = (h: string) =>
    `${h}/storage/v1/object/public/profiles/${mine()}/${F}`;
  const BAD: [string, Actor, "avatarUrl" | "coverUrl", string][] = [
    [
      "another user's folder (M11)",
      "M",
      "avatarUrl",
      `${P}/avatars/${T}/${X}/${F}`,
    ],
    [
      "another tenant's folder (M12)",
      "M",
      "avatarUrl",
      `${P}/avatars/${T2}/${UM}/${F}`,
    ],
    [
      "super_admin with tenant T into the demo folder (M17)",
      "SAT",
      "avatarUrl",
      own("avatars", "SA").replace(A.SA.userId, A.SAT.userId),
    ],
    [
      "avatarUrl with covers/ (M13)",
      "M",
      "avatarUrl",
      `${P}/${mine("covers")}/${F}`,
    ],
    ["coverUrl with avatars/ (M13)", "M", "coverUrl", `${P}/${mine()}/${F}`],
    [
      "unknown purpose documents/",
      "M",
      "avatarUrl",
      `${P}/${mine("documents")}/${F}`,
    ],
    [
      "legacy object avatars/U-123.webp",
      "M",
      "avatarUrl",
      `${P}/avatars/${UM}-123.webp`,
    ],
    ["legacy object at the bucket root", "M", "avatarUrl", `${P}/${UM}.webp`],
    ["folder with no file", "M", "avatarUrl", `${P}/${mine()}/`],
    [
      "upper-cased tenant segment",
      "M",
      "avatarUrl",
      `${P}/avatars/${T.toUpperCase()}/${UM}/${F}`,
    ],
    [
      "upper-cased uid segment",
      "M",
      "avatarUrl",
      `${P}/avatars/${T}/${UM.toUpperCase()}/${F}`,
    ],
    ["another origin", "M", "avatarUrl", host("https://evil.example.com")],
    [
      "host sharing a string prefix (M7)",
      "M",
      "avatarUrl",
      host(`${ORIGIN}.evil.example`),
    ],
    [
      "hostname extended by a prefix match (M7)",
      "M",
      "avatarUrl",
      host(`${ORIGIN}evil.example`),
    ],
    [
      "http when configured https",
      "M",
      "avatarUrl",
      host(ORIGIN.replace("https", "http")),
    ],
    ["a different port", "M", "avatarUrl", host(`${ORIGIN}:8443`)],
    [
      "credentials in the URL",
      "M",
      "avatarUrl",
      host(ORIGIN.replace("//", "//user:pass@")),
    ],
    [
      "username in the URL",
      "M",
      "avatarUrl",
      host(ORIGIN.replace("//", "//user@")),
    ],
    [
      "another bucket",
      "M",
      "avatarUrl",
      `${ORIGIN}/storage/v1/object/public/documents/${mine()}/${F}`,
    ],
    [
      "bucket name starting with profiles (M8)",
      "M",
      "avatarUrl",
      `${ORIGIN}/storage/v1/object/public/profiles-archive/${mine()}/${F}`,
    ],
    [
      "/object/sign/ endpoint",
      "M",
      "avatarUrl",
      `${ORIGIN}/storage/v1/object/sign/profiles/${mine()}/${F}`,
    ],
    [
      "/object/authenticated/ endpoint",
      "M",
      "avatarUrl",
      `${ORIGIN}/storage/v1/object/authenticated/profiles/${mine()}/${F}`,
    ],
    [
      "/render/image/public/ endpoint",
      "M",
      "avatarUrl",
      `${ORIGIN}/storage/v1/render/image/public/profiles/${mine()}/${F}`,
    ],
    ["a query string", "M", "avatarUrl", `${P}/${mine()}/${F}?width=64`],
    ["a fragment", "M", "avatarUrl", `${P}/${mine()}/${F}#top`],
    ["raw . segment", "M", "avatarUrl", `${P}/${mine()}/./${F}`],
    [
      "raw .. segment resolving into own folder (M8)",
      "M",
      "avatarUrl",
      `${P}/${mine()}/../${UM}/${F}`,
    ],
    [
      "raw .. segment from another user's folder",
      "M",
      "avatarUrl",
      `${P}/avatars/${T}/${X}/../${UM}/${F}`,
    ],
    [
      "percent-encoded .. segment",
      "M",
      "avatarUrl",
      `${P}/${mine()}/%2e%2e/${UM}/${F}`,
    ],
    ["percent-encoded . segment", "M", "avatarUrl", `${P}/${mine()}/%2E/${F}`],
    ["encoded / in the file name", "M", "avatarUrl", `${P}/${mine()}/a%2F${F}`],
    [
      "encoded / joining folder segments",
      "M",
      "avatarUrl",
      `${P}/avatars%2F${T}/${UM}/${F}`,
    ],
    ["empty object path", "M", "avatarUrl", `${P}/`],
    ["no object path", "M", "avatarUrl", P],
    ["ftp: scheme", "M", "avatarUrl", host(ORIGIN.replace("https", "ftp"))],
    ["javascript: scheme", "M", "avatarUrl", "javascript:alert(1)"],
    ["empty string", "M", "avatarUrl", ""],
    [
      "coverUrl: another user's folder",
      "M",
      "coverUrl",
      `${P}/covers/${T}/${X}/${F}`,
    ],
    [
      "coverUrl: another origin",
      "M",
      "coverUrl",
      `https://evil.example.com/storage/v1/object/public/profiles/${mine("covers")}/${F}`,
    ],
  ];
  it.each(BAD)(
    "#2406 criterion 13: %s returns 400 { error }",
    (_l, actor, field, value) => rejected("profile", actor, { [field]: value }),
  );
  it.each(BAD)(
    "#2406 criterion 14: %s alongside valid other fields changes no row and makes no write (M9)",
    (_l, actor, field, value) =>
      rejected("profile", actor, {
        firstName: "Changed",
        phone: "555-0100",
        bio: "New bio",
        [field]: value,
      }),
  );

  it("#2406 criterion 15: resending the stored external avatar and legacy cover unchanged returns 200 without rewriting them (OQ2)", async () => {
    await accepted("profile", "M", {
      firstName: "Changed",
      avatarUrl: STORED.external,
      coverUrl: STORED.cover,
    });
    expect(row("profiles", "id", PROFILE.M).first_name).toBe("Changed");
    expect(row("profiles", "id", PROFILE.M).avatar_url).toBe(STORED.external);
    expect(row("missionaries", "profile_id", PROFILE.M).cover_url).toBe(
      STORED.cover,
    );
    expect(wrote("avatar_url"), "avatar_url rewritten").toBe(false);
    expect(wrote("cover_url"), "cover_url rewritten").toBe(false);
  });
  it("#2406 criterion 15: resending a stored legacy-object avatar in this bucket unchanged returns 200 without rewrite", async () => {
    await accepted("profile", "D", { avatarUrl: STORED.donor });
    expect(row("profiles", "id", PROFILE.D).avatar_url).toBe(STORED.donor);
    expect(wrote("avatar_url")).toBe(false);
  });
  it.each([
    ["a different external URL", "https://images.unsplash.com/photo-2?w=400"],
    ["a different legacy-object URL", `${P}/avatars/${UM}-999.webp`],
    ["another user's folder URL", `${P}/avatars/${T}/${X}/${F}`],
  ])("#2406 criterion 15: changing to %s returns 400", (_l, value) =>
    rejected("profile", "M", { avatarUrl: value }),
  );

  it("#2406 criterion 16: NEXT_PUBLIC_SUPABASE_URL unset: a changed URL returns 503 { error } with no write (OQ9)", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    await rejected(
      "profile",
      "M",
      { firstName: "Changed", avatarUrl: own("avatars") },
      503,
    );
  });
  it("#2406 criterion 16: NEXT_PUBLIC_SUPABASE_URL unset: null still returns 200", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    await accepted("profile", "M", { avatarUrl: null });
    expect(row("profiles", "id", PROFILE.M).avatar_url).toBeNull();
  });

  it("#2406 criterion 17: a non-missionary with a valid own coverUrl still gets 403", async () => {
    await rejected("profile", "D", { coverUrl: own("covers", "D") }, 403);
  });
  it("#2406 criterion 17: a non-missionary with an invalid coverUrl gets 400 (validated before the role check)", async () => {
    await rejected("profile", "D", {
      coverUrl: "https://evil.example.com/cover.webp",
    });
  });
});

describe("#2406 criterion 18: PATCH /api/donor/portal avatarUrl (OQ3)", () => {
  it("#2406 criterion 18 (c11): own avatars/T/U URL writes profiles.avatar_url and donors.avatar_url", async () => {
    await accepted("donor", "D", { avatarUrl: own("avatars", "D") });
    expect(row("profiles", "id", PROFILE.D).avatar_url).toBe(
      own("avatars", "D"),
    );
    expect(row("donors", "profile_id", PROFILE.D).avatar_url).toBe(
      own("avatars", "D"),
    );
  });
  it("#2406 criterion 18 (c12): null clears both columns", async () => {
    await accepted("donor", "D", { avatarUrl: null });
    expect(row("profiles", "id", PROFILE.D).avatar_url).toBeNull();
    expect(row("donors", "profile_id", PROFILE.D).avatar_url).toBeNull();
  });
  it("#2406 criterion 18 (c15): the stored legacy-object URL resent unchanged returns 200 without rewrite", async () => {
    await accepted("donor", "D", {
      phone: "555-0100",
      avatarUrl: STORED.donor,
    });
    expect(wrote("avatar_url")).toBe(false);
    expect(row("donors", "profile_id", PROFILE.D).avatar_url).toBe(
      STORED.donor,
    );
  });
  const mineD = `avatars/${T}/${UD}`;
  it.each([
    ["a different external URL", "https://images.unsplash.com/photo-2?w=400"],
    ["another user's folder", `${P}/avatars/${T}/${UM}/${F}`],
    ["another tenant's folder", `${P}/avatars/${T2}/${UD}/${F}`],
    ["the covers/ purpose", `${P}/covers/${T}/${UD}/${F}`],
    ["a different legacy-object URL", `${P}/avatars/${UD}-999.webp`],
    [
      "a host sharing a string prefix",
      `${ORIGIN}.evil.example/storage/v1/object/public/profiles/${mineD}/${F}`,
    ],
    ["a raw .. segment", `${P}/${mineD}/../${UD}/${F}`],
    ["a query string", `${P}/${mineD}/${F}?x=1`],
  ])(
    "#2406 criterion 18 (c13/c14): %s returns 400 with no write",
    (_l, value) =>
      rejected("donor", "D", { firstName: "Changed", avatarUrl: value }),
  );
  // Addendum 1 criterion 8: a value stored in only one of the two columns is
  // backfilled into the other; stored in both, neither column is written.
  const backfill = async (profiles: string | null, donors: string | null) => {
    row("profiles", "id", PROFILE.D).avatar_url = profiles;
    row("donors", "profile_id", PROFILE.D).avatar_url = donors;
    await accepted("donor", "D", { avatarUrl: own("avatars", "D") });
    expect(row("profiles", "id", PROFILE.D).avatar_url).toBe(
      own("avatars", "D"),
    );
    expect(row("donors", "profile_id", PROFILE.D).avatar_url).toBe(
      own("avatars", "D"),
    );
  };
  it("#2406 criterion 8 (addendum 1): donors X and profiles NULL, send X: both become X", () =>
    backfill(null, own("avatars", "D")));
  it("#2406 criterion 8 (addendum 1): profiles X and donors NULL, send X: both become X", () =>
    backfill(own("avatars", "D"), null));
  it("#2406 criterion 8 (addendum 1): both X, send X: avatar_url is in neither update payload", async () => {
    await backfill(own("avatars", "D"), own("avatars", "D"));
    expect(wrote("avatar_url")).toBe(false);
  });
  it("#2406 criterion 18 (c16): NEXT_PUBLIC_SUPABASE_URL unset: changed URL 503 with no write, null 200", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    await rejected("donor", "D", { avatarUrl: own("avatars", "D") }, 503);
    await accepted("donor", "D", { avatarUrl: null });
  });
});
