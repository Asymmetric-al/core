import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { membershipsForRole } from "../../../../fixtures/auth-memberships";

import type * as AuthContext from "@asym/auth/context";

const state = vi.hoisted(() => ({
  auth: {} as Record<string, unknown>,
  selectArgs: [] as string[],
  rows: [] as Record<string, unknown>[],
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContext>()),
  getAuthContext: async () => state.auth,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: {
      rpc: () => ({
        select: (columns: string) => {
          state.selectArgs.push(columns);
          return {
            range: async () => ({
              data: state.rows,
              error: null,
            }),
          };
        },
      }),
    },
    error: null,
  }),
}));

const TENANT_ID = "aaaaaaaa-0000-4000-8000-00000000000a";
const USER_ID = "cccccccc-0000-4000-8000-00000000000c";
const PROFILE_ID = "10000000-0000-4000-8000-000000000001";
const ASSIGNMENT_ID = "40000000-0000-4000-8000-000000000001";

describe("GET /api/missionaries care-excluding projection (W4b-R11)", () => {
  beforeEach(() => {
    state.selectArgs = [];
    const memberships = membershipsForRole("missionary", TENANT_ID);
    const membership = memberships[0]!;
    state.auth = {
      isAuthenticated: true,
      email: "m@example.test",
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
      role: "missionary",
    };
    state.rows = [
      {
        id: "20000000-0000-4000-8000-000000000001",
        tenant_id: TENANT_ID,
        profile_id: PROFILE_ID,
        bio: "Public bio",
        mission_field: "Southeast Asia",
        tagline: "Serving locally",
        cover_url: "https://example.test/cover.webp",
        health_status: "at_risk",
        last_check_in: "2026-11-20T00:00:00Z",
        manual_attention: true,
        health_signals: { crisis: true },
        region: "APAC",
        timezone: "Asia/Bangkok",
        phone: "+15550001111",
        location: "Chiang Mai",
        social_links: { facebook: "https://fb.me/peer" },
        funding_goal: 5000,
        current_funding: 4200,
        birth_date: "1990-01-01",
        profile: {
          id: PROFILE_ID,
          email: "peer@example.test",
          first_name: "Peer",
          last_name: "Worker",
          avatar_url: "https://example.test/avatar.webp",
          role: "missionary",
          tenant_id: TENANT_ID,
          user_id: USER_ID,
        },
      },
    ];
  });

  it("selects only id and profile.id and serializes exact keys with no care or extra fields", async () => {
    const { GET } =
      await import("../../../../../packages/api/src/missionaries/index");
    const response = await GET(
      new NextRequest("http://localhost/api/missionaries?limit=10&offset=0"),
    );

    expect(response.status).toBe(200);
    expect(state.selectArgs).toEqual(["id, profile:profiles!profile_id(id)"]);

    const body = (await response.json()) as {
      missionaries: Record<string, unknown>[];
    };
    expect(body.missionaries).toEqual([
      {
        id: "20000000-0000-4000-8000-000000000001",
        profile: { id: PROFILE_ID },
      },
    ]);
    expect(Object.keys(body.missionaries[0]!).sort()).toEqual([
      "id",
      "profile",
    ]);
    expect(
      Object.keys(
        body.missionaries[0]!.profile as Record<string, unknown>,
      ).sort(),
    ).toEqual(["id"]);
  });
});
