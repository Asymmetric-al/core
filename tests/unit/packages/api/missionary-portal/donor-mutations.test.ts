import { describe, expect, it, vi } from "vitest";

import {
  recordMissionaryDonorActivity,
  updateMissionaryDonor,
  updateMissionaryDonorTags,
} from "../../../../../packages/api/src/missionary-portal/donor";

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

function createInsertQuery<T>(result: QueryResult<T>) {
  const query = {
    insert: vi.fn(() => Promise.resolve(result)),
  };
  return query;
}

function createUpdateQuery<T>(result: QueryResult<T>) {
  const query = {
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    select: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
  };
  return query;
}

describe("missionary donor mutations", () => {
  it("records donor activity only after proving missionary-owned donor access", async () => {
    const accessQuery = createSelectQuery({
      data: { id: "donor-1" },
      error: null,
    });
    const insertQuery = createInsertQuery({ data: null, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "donors") return accessQuery;
        if (table === "donor_activities") return insertQuery;
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    await recordMissionaryDonorActivity({
      supabaseAdmin: supabase as never,
      donorId: "donor-1",
      profileId: "missionary-profile-1",
      tenantId: "tenant-1",
      activityType: "call",
      note: "Left voicemail",
      now: new Date("2026-05-21T12:00:00.000Z"),
    });

    expect(supabase.from).toHaveBeenNthCalledWith(1, "donors");
    expect(accessQuery.eq).toHaveBeenCalledWith("id", "donor-1");
    expect(accessQuery.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(accessQuery.eq).toHaveBeenCalledWith(
      "missionary_id",
      "missionary-profile-1",
    );
    expect(supabase.from).toHaveBeenNthCalledWith(2, "donor_activities");
    expect(insertQuery.insert).toHaveBeenCalledWith({
      donor_id: "donor-1",
      type: "call",
      title: "Phone Call",
      description: "Left voicemail",
      date: "2026-05-21T12:00:00.000Z",
    });
  });

  it("scopes donor tag updates by donor, tenant, and missionary", async () => {
    const updateQuery = createUpdateQuery({
      data: { id: "donor-1" },
      error: null,
    });
    const supabase = { from: vi.fn(() => updateQuery) };

    await updateMissionaryDonorTags({
      supabaseAdmin: supabase as never,
      donorId: "donor-1",
      profileId: "missionary-profile-1",
      tenantId: "tenant-1",
      tags: ["monthly-partner", "newsletter"],
      now: new Date("2026-05-21T12:00:00.000Z"),
    });

    expect(supabase.from).toHaveBeenCalledWith("donors");
    expect(updateQuery.update).toHaveBeenCalledWith({
      tags: ["monthly-partner", "newsletter"],
      updated_at: "2026-05-21T12:00:00.000Z",
    });
    expect(updateQuery.eq).toHaveBeenCalledWith("id", "donor-1");
    expect(updateQuery.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(updateQuery.eq).toHaveBeenCalledWith(
      "missionary_id",
      "missionary-profile-1",
    );
  });

  it("builds donor profile updates server-side and ignores client-supplied timestamps", async () => {
    const updateQuery = createUpdateQuery({
      data: { id: "donor-1" },
      error: null,
    });
    const supabase = { from: vi.fn(() => updateQuery) };

    await updateMissionaryDonor({
      supabaseAdmin: supabase as never,
      donorId: "donor-1",
      profileId: "missionary-profile-1",
      tenantId: "tenant-1",
      input: {
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
  });
});
