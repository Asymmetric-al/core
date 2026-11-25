import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

import {
  recordMissionaryDonorActivity,
  updateMissionaryDonor,
  updateMissionaryDonorTags,
} from "../../../../../packages/api/src/missionary-portal/donor";
import { toApiHttpError } from "../../../../../packages/api/src/shared/http-errors";

type QueryResult<T> = {
  data: T | null;
  error: { code?: string; message: string } | null;
};

function createSelectQuery<T>(result: QueryResult<T>) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
  };
  return query;
}

const SHOWN_DONOR = {
  id: "donor-1",
  giving_preferences: { defaultAnonymousToRecipient: false },
  donor_is_restricted_party: false,
};

function createGuardQuery() {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(() =>
      Promise.resolve({ data: SHOWN_DONOR, error: null }),
    ),
  };
  return query;
}

function createUpdateQuery<T>(result: QueryResult<T>) {
  const query = {
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    contains: vi.fn(() => query),
    select: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
  };
  return query;
}

function donorTables(update: ReturnType<typeof createUpdateQuery>) {
  const guard = createGuardQuery();
  const from = vi.fn().mockReturnValueOnce(guard).mockReturnValueOnce(update);
  return { guard, from };
}

function expectOwnedBy(query: { eq: ReturnType<typeof vi.fn> }) {
  expect(query.eq).toHaveBeenCalledWith("id", "donor-1");
  expect(query.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
  expect(query.eq).toHaveBeenCalledWith(
    "missionary_id",
    "missionary-profile-1",
  );
}

describe("missionary donor mutations", () => {
  it("maps zod union validation errors to nested field messages", () => {
    const requireFromApi = createRequire(
      path.join(
        fileURLToPath(
          new URL("../../../../../packages/api/package.json", import.meta.url),
        ),
      ),
    );
    const { z } = requireFromApi("zod") as typeof import("zod");

    const schema = z.union([
      z.object({ tags: z.array(z.string()) }).strict(),
      z
        .object({
          email: z.string().email(),
        })
        .strict(),
    ]);

    const error = schema.safeParse({ email: "not-an-email" }).error;
    expect(error).toBeDefined();

    const apiError = toApiHttpError(error);
    expect(apiError.status).toBe(400);
    expect(apiError.message).toMatch(/invalid email/i);
    expect(apiError.message).not.toBe("Invalid input");
  });

  it("records donor activity only after proving missionary-owned donor access (D-18, AL-2678 WP5 part 2-r2s: the stub also answers the guard read on donors, scoped by donor, tenant and missionary)", async () => {
    const accessQuery = createSelectQuery({
      data: { id: "donor-1" },
      error: null,
    });
    const guardQuery = createGuardQuery();
    const supabase = {
      rpc: vi.fn(() => accessQuery),
      from: vi.fn(() => guardQuery),
    };

    await recordMissionaryDonorActivity({
      supabaseAdmin: supabase as never,
      assignmentId: "assignment-1",
      donorId: "donor-1",
      profileId: "missionary-profile-1",
      tenantId: "tenant-1",
      activityType: "call",
      note: "Left voicemail",
      now: new Date("2026-05-21T12:00:00.000Z"),
    });

    expect(supabase.rpc).toHaveBeenCalledWith("missionary_activity_create", {
      p_tenant_id: "tenant-1",
      p_profile_id: "missionary-profile-1",
      p_assignment_id: "assignment-1",
      p_donor_id: "donor-1",
      p_type: "call",
      p_title: "Phone Call",
      p_note: "Left voicemail",
      p_date: "2026-05-21T12:00:00.000Z",
    });
    expectOwnedBy(guardQuery);
  });

  it("scopes donor tag updates by donor, tenant, and missionary (D-18, AL-2678 WP5 part 2-r2s: the guard read and the UPDATE each have their own builder, and the UPDATE's carries the three filters)", async () => {
    const updateQuery = createUpdateQuery({
      data: { id: "donor-1" },
      error: null,
    });
    const { guard, from } = donorTables(updateQuery);
    const supabase = { from };

    await updateMissionaryDonorTags({
      supabaseAdmin: supabase as never,
      donorId: "donor-1",
      profileId: "missionary-profile-1",
      tenantId: "tenant-1",
      tags: ["monthly-partner", "newsletter"],
      now: new Date("2026-05-21T12:00:00.000Z"),
    });

    expect(supabase.from).toHaveBeenNthCalledWith(1, "donors");
    expect(supabase.from).toHaveBeenNthCalledWith(2, "donors");
    expect(updateQuery.update).toHaveBeenCalledWith({
      tags: ["monthly-partner", "newsletter"],
      updated_at: "2026-05-21T12:00:00.000Z",
    });
    expectOwnedBy(updateQuery);
    expectOwnedBy(guard);
  });

  it("builds donor profile updates server-side and ignores client-supplied timestamps (AL-2678 WP5 part 2-r2s: the UPDATE, on its own builder, is scoped by donor, tenant and missionary)", async () => {
    const updateQuery = createUpdateQuery({
      data: { id: "donor-1" },
      error: null,
    });
    const { guard, from } = donorTables(updateQuery);
    const supabase = { from };

    await updateMissionaryDonor({
      supabaseAdmin: supabase as never,
      donorId: "donor-1",
      profileId: "missionary-profile-1",
      tenantId: "tenant-1",
      patch: {
        name: " Ada Lovelace ",
        email: "ada@example.org",
        phone: "",
        mobile: "555-0101",
        work_phone: "",
        preferred_contact: "email",
        type: "Individual",
        status: "Active",
        frequency: "Monthly",
        location: "",
        website: "",
        organization: "",
        title: "",
        spouse: "",
        birthday: "",
        anniversary: "",
        notes: "",
        street: "1 Analytical Engine Way",
        street2: "",
        city: "London",
        state: "",
        zip: "",
      },
      now: new Date("2026-05-21T12:00:00.000Z"),
    });

    expect(updateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada Lovelace",
        phone: null,
        mobile: "555-0101",
        updated_at: "2026-05-21T12:00:00.000Z",
        address: {
          street: "1 Analytical Engine Way",
          street2: "",
          city: "London",
          state: "",
          zip: "",
          country: "USA",
        },
      }),
    );
    expectOwnedBy(updateQuery);
    expectOwnedBy(guard);
  });
});
