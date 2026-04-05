import { describe, expect, it, vi } from "vitest";

import {
  type DonorRecord,
  findOrCreateDonor,
} from "../../../../../packages/api/src/donate/queries";

function createLookupQuery(result: {
  data: DonorRecord | null;
  error: { message: string } | null;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnThis();
  const select = vi.fn().mockReturnThis();
  return { select, eq, single };
}

function createInsertQuery(result: {
  data: DonorRecord | null;
  error: { message: string } | null;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnThis();
  const insert = vi.fn().mockReturnThis();
  return { insert, select, single };
}

describe("api/donate/queries", () => {
  it("returns existing donor without creating a new one (happy path)", async () => {
    const existingDonor: DonorRecord = {
      id: "donor-1",
      stripe_customer_id: "cus_123",
      profile_id: "profile-1",
    };
    const lookupQuery = createLookupQuery({ data: existingDonor, error: null });

    const from = vi
      .fn()
      .mockImplementationOnce(() => lookupQuery)
      .mockImplementation(() => {
        throw new Error("Unexpected extra from() call");
      });
    const supabase = { from };

    const result = await findOrCreateDonor(supabase, "profile-1", "tenant-1");

    expect(result).toEqual({ data: existingDonor, error: null });
    expect(from).toHaveBeenCalledTimes(1);
    expect(lookupQuery.select).toHaveBeenCalledWith(
      "id, stripe_customer_id, profile_id",
    );
    expect(lookupQuery.eq).toHaveBeenNthCalledWith(
      1,
      "profile_id",
      "profile-1",
    );
    expect(lookupQuery.eq).toHaveBeenNthCalledWith(2, "tenant_id", "tenant-1");
  });

  it("creates a donor when not found", async () => {
    const createdDonor: DonorRecord = {
      id: "donor-2",
      stripe_customer_id: null,
      profile_id: "profile-1",
    };
    const lookupQuery = createLookupQuery({
      data: null,
      error: { message: "No rows found" },
    });
    const insertQuery = createInsertQuery({ data: createdDonor, error: null });

    const from = vi
      .fn()
      .mockImplementationOnce(() => lookupQuery)
      .mockImplementationOnce(() => insertQuery)
      .mockImplementation(() => {
        throw new Error("Unexpected extra from() call");
      });
    const supabase = { from };

    const result = await findOrCreateDonor(supabase, "profile-1", "tenant-1");

    expect(result).toEqual({ data: createdDonor, error: null });
    expect(from).toHaveBeenCalledTimes(2);
    expect(insertQuery.insert).toHaveBeenCalledWith({
      tenant_id: "tenant-1",
      profile_id: "profile-1",
      giving_preferences: {},
      total_given: 0,
    });
    expect(insertQuery.select).toHaveBeenCalledWith(
      "id, stripe_customer_id, profile_id",
    );
  });

  it("returns error when donor creation fails (error path)", async () => {
    const lookupQuery = createLookupQuery({
      data: null,
      error: { message: "No rows found" },
    });
    const insertQuery = createInsertQuery({
      data: null,
      error: { message: "insert failed" },
    });

    const from = vi
      .fn()
      .mockImplementationOnce(() => lookupQuery)
      .mockImplementationOnce(() => insertQuery)
      .mockImplementation(() => {
        throw new Error("Unexpected extra from() call");
      });
    const supabase = { from };

    const result = await findOrCreateDonor(supabase, "profile-1", "tenant-1");

    expect(result).toEqual({ data: null, error: "insert failed" });
  });
});
