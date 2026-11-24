import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { membershipsForRole } from "../../../../fixtures/auth-memberships";

import type * as AuthContext from "@asym/auth/context";

const state = vi.hoisted(() => ({
  auth: {} as Record<string, unknown>,
  profileSelects: [] as string[],
  missionarySelects: [] as string[],
  missionaryPatches: [] as Record<string, unknown>[],
  profileRow: {} as Record<string, unknown>,
  missionaryRow: null as Record<string, unknown> | null,
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContext>()),
  getAuthContext: async () => state.auth,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: {
      from: (table: string) => {
        if (table !== "profiles") throw new Error(`Unexpected table: ${table}`);
        return {
          select: (columns: string) => {
            state.profileSelects.push(columns);
            return {
              eq: () => ({
                single: async () => ({
                  data: { ...state.profileRow },
                  error: null,
                }),
                maybeSingle: async () => ({
                  data: { ...state.profileRow },
                  error: null,
                }),
              }),
            };
          },
          update: (values: Record<string, unknown>) => ({
            eq: async () => {
              Object.assign(state.profileRow, values);
              return { data: null, error: null };
            },
          }),
        };
      },
      rpc: (name: string, args: Record<string, unknown>) => {
        if (name === "missionary_own_record") {
          return {
            select: (columns: string) => {
              state.missionarySelects.push(columns);
              return {
                maybeSingle: async () => ({
                  data: state.missionaryRow ? { ...state.missionaryRow } : null,
                  error: null,
                }),
              };
            },
          };
        }
        if (name === "missionary_own_record_write") {
          const patch = (args.p_patch ?? {}) as Record<string, unknown>;
          state.missionaryPatches.push(patch);
          if (state.missionaryRow) {
            Object.assign(state.missionaryRow, patch);
          }
          return {
            select: () => ({
              maybeSingle: async () => ({
                data: state.missionaryRow
                  ? { id: state.missionaryRow.id }
                  : null,
                error: null,
              }),
            }),
          };
        }
        throw new Error(`Unexpected RPC: ${name}`);
      },
    },
    error: null,
  }),
}));

const TENANT_ID = "aaaaaaaa-0000-4000-8000-00000000000a";
const USER_ID = "cccccccc-0000-4000-8000-00000000000c";
const PROFILE_ID = "10000000-0000-4000-8000-000000000001";
const MISSIONARY_ID = "20000000-0000-4000-8000-000000000001";
const ASSIGNMENT_ID = "40000000-0000-4000-8000-000000000001";

function setActor(role: "missionary" | "donor") {
  const memberships = membershipsForRole(role, TENANT_ID);
  const membership = memberships[0]!;
  state.auth = {
    isAuthenticated: true,
    email: "worker@example.test",
    memberships,
    assignment: {
      assignmentId: ASSIGNMENT_ID,
      userId: USER_ID,
      tenantId: TENANT_ID,
      membershipRole: membership.role,
      staffRole: membership.staffRole,
      isTenantAdmin: membership.isTenantAdmin,
      revision: "2026-11-24T00:00:00Z",
    },
    userId: USER_ID,
    tenantId: TENANT_ID,
    profileId: PROFILE_ID,
    role,
  };
}

describe("GET and PATCH /api/profile care-excluding projection (W4b-R11)", () => {
  beforeEach(() => {
    state.profileSelects = [];
    state.missionarySelects = [];
    state.missionaryPatches = [];
    setActor("missionary");
    state.profileRow = {
      id: PROFILE_ID,
      user_id: USER_ID,
      tenant_id: TENANT_ID,
      role: "missionary",
      email: "worker@example.test",
      first_name: "Ada",
      last_name: "Lovelace",
      full_name: "Ada Lovelace",
      display_name: "Ada L.",
      phone: "+15559990000",
      avatar_url: "https://example.test/avatar.webp",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    };
    state.missionaryRow = {
      id: MISSIONARY_ID,
      tenant_id: TENANT_ID,
      profile_id: PROFILE_ID,
      phone: "+15551112222",
      location: "Chiang Mai",
      tagline: "Community education",
      bio: "Serving families in northern Thailand.",
      cover_url: "https://example.test/cover.webp",
      social_links: {
        facebook: "https://facebook.com/ada",
        instagram: "https://instagram.com/ada",
        twitter: "https://twitter.com/ada",
        youtube: "https://youtube.com/@ada",
        website: "https://ada.example.test",
        internal_token: "must-not-leak",
      },
      mission_field: "Southeast Asia",
      funding_goal: 5000,
      current_funding: 4200,
      birth_date: "1990-01-01",
      health_status: "at_risk",
      last_check_in: "2026-11-20T00:00:00Z",
      manual_attention: true,
      health_signals: { burn_out: true },
      region: "APAC",
      timezone: "Asia/Bangkok",
    };
  });

  it("GET returns exact profile and missionary key sets with sanitized 5-key social_links and zero care fields", async () => {
    const { GET } =
      await import("../../../../../packages/api/src/profile/index");
    const response = await GET(new NextRequest("http://localhost/api/profile"));

    expect(response.status).toBe(200);
    expect(state.profileSelects).toEqual([
      "id, email, first_name, last_name, avatar_url",
    ]);
    expect(state.missionarySelects).toEqual([
      "id, bio, tagline, location, phone, cover_url, social_links",
    ]);

    const body = (await response.json()) as {
      profile: Record<string, unknown>;
    };
    expect(Object.keys(body.profile).sort()).toEqual([
      "avatar_url",
      "email",
      "first_name",
      "last_name",
      "missionary",
    ]);
    const missionary = body.profile.missionary as Record<string, unknown>;
    expect(Object.keys(missionary).sort()).toEqual([
      "bio",
      "cover_url",
      "id",
      "location",
      "phone",
      "social_links",
      "tagline",
    ]);
    expect(missionary.social_links).toEqual({
      facebook: "https://facebook.com/ada",
      instagram: "https://instagram.com/ada",
      twitter: "https://twitter.com/ada",
      youtube: "https://youtube.com/@ada",
      website: "https://ada.example.test",
    });
    expect(body.profile).toEqual({
      first_name: "Ada",
      last_name: "Lovelace",
      email: "worker@example.test",
      avatar_url: "https://example.test/avatar.webp",
      missionary: {
        id: MISSIONARY_ID,
        phone: "+15551112222",
        location: "Chiang Mai",
        tagline: "Community education",
        bio: "Serving families in northern Thailand.",
        cover_url: "https://example.test/cover.webp",
        social_links: {
          facebook: "https://facebook.com/ada",
          instagram: "https://instagram.com/ada",
          twitter: "https://twitter.com/ada",
          youtube: "https://youtube.com/@ada",
          website: "https://ada.example.test",
        },
      },
    });
  });

  it("GET omits missionary property for non-missionary caller and returns exact profile keys", async () => {
    setActor("donor");
    const { GET } =
      await import("../../../../../packages/api/src/profile/index");
    const response = await GET(new NextRequest("http://localhost/api/profile"));

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      profile: Record<string, unknown>;
    };
    expect(Object.keys(body.profile).sort()).toEqual([
      "avatar_url",
      "email",
      "first_name",
      "last_name",
    ]);
    expect(body.profile).not.toHaveProperty("missionary");
  });

  it("PATCH writes missionField to DB without returning it and serializes exact permitted key sets", async () => {
    const { PATCH } =
      await import("../../../../../packages/api/src/profile/index");
    const response = await PATCH(
      new NextRequest("http://localhost/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bio: "Updated bio",
          missionField: "Central Asia",
          socialLinks: {
            website: "https://updated.example.test",
            disallowed: "secret",
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(state.missionaryPatches).toEqual([
      {
        bio: "Updated bio",
        mission_field: "Central Asia",
        social_links: {
          website: "https://updated.example.test",
          disallowed: "secret",
        },
      },
    ]);
    expect(state.missionaryRow?.mission_field).toBe("Central Asia");
    expect(state.profileSelects).toEqual([
      "id, email, first_name, last_name, avatar_url",
    ]);
    expect(state.missionarySelects).toEqual([
      "id, bio, tagline, location, phone, cover_url, social_links",
    ]);

    const body = (await response.json()) as {
      profile: Record<string, unknown>;
    };
    expect(Object.keys(body.profile).sort()).toEqual([
      "avatar_url",
      "email",
      "first_name",
      "last_name",
      "missionary",
    ]);
    const missionary = body.profile.missionary as Record<string, unknown>;
    expect(Object.keys(missionary).sort()).toEqual([
      "bio",
      "cover_url",
      "id",
      "location",
      "phone",
      "social_links",
      "tagline",
    ]);
    expect(missionary.bio).toBe("Updated bio");
    expect(missionary.social_links).toEqual({
      facebook: null,
      instagram: null,
      twitter: null,
      youtube: null,
      website: "https://updated.example.test",
    });
    expect(missionary).not.toHaveProperty("mission_field");
    expect(missionary).not.toHaveProperty("health_status");
    expect(missionary).not.toHaveProperty("last_check_in");
    expect(missionary).not.toHaveProperty("manual_attention");
    expect(missionary).not.toHaveProperty("health_signals");
  });
});
