import { describe, expect, it } from "vitest";

import {
  recordMissionaryDonorActivity,
  updateMissionaryDonor,
  updateMissionaryDonorTags,
} from "../../../../../packages/api/src/missionary-portal/donor";

type DonorRow = {
  id: string;
  tenant_id: string;
  missionary_id: string;
  giving_preferences: unknown;
  donor_is_restricted_party: unknown;
  name: string;
  tags: string[];
};

const MISSING = Symbol("the column is not read");

function database(preferences: unknown, ...fact: unknown[]) {
  const restricted = fact.length === 0 ? false : fact[0];
  const row: DonorRow = {
    id: "donor-1",
    tenant_id: "tenant-1",
    missionary_id: "missionary-1",
    giving_preferences: preferences,
    donor_is_restricted_party: restricted,
    name: "Hidden real name",
    tags: ["hidden-tag"],
  };
  const activities: unknown[] = [];
  const from = (table: string) => {
    expect(table).toBe("donors");
    const conditions: Array<(value: DonorRow) => boolean> = [];
    let columns = "";
    let patch: Record<string, unknown> | null = null;
    const matches = () => conditions.every((condition) => condition(row));
    const query = {
      update(value: Record<string, unknown>) {
        patch = value;
        return query;
      },
      eq(column: keyof DonorRow, value: unknown) {
        conditions.push((record) => record[column] === value);
        return query;
      },
      contains(column: keyof DonorRow, value: Record<string, unknown>) {
        conditions.push((record) => {
          const stored = record[column];
          return (
            !!stored &&
            typeof stored === "object" &&
            !Array.isArray(stored) &&
            Object.entries(value).every(
              ([key, item]) => Reflect.get(stored, key) === item,
            )
          );
        });
        return query;
      },
      select(value = "*") {
        columns = value;
        return query;
      },
      async maybeSingle() {
        if (patch) throw new Error("a write is read with single()");
        if (!matches()) return { data: null, error: null };
        const picked = Object.fromEntries(
          columns
            .split(",")
            .map((column) => column.trim())
            .filter(Boolean)
            .filter((column) => Reflect.get(row, column) !== MISSING)
            .map((column) => [column, Reflect.get(row, column)]),
        );
        return { data: picked, error: null };
      },
      async single() {
        if (!patch || !matches())
          return {
            data: null,
            error: { code: "PGRST116", message: "No matching donor" },
          };
        Object.assign(row, patch);
        return { data: { id: row.id }, error: null };
      },
    };
    return query;
  };
  const rpc = (name: string, args: Record<string, unknown>) => {
    expect(name).toBe("missionary_activity_create");
    activities.push(args);
    const query = {
      select: () => query,
      single: async () => ({ data: { id: "activity-1" }, error: null }),
    };
    return query;
  };
  return { row, activities, client: { from, rpc } };
}

const profilePatch = {
  name: "Anonymous donor",
  email: "typed@example.test",
  phone: "",
  mobile: "",
  work_phone: "",
  preferred_contact: "email" as const,
  type: "Individual" as const,
  status: "Active" as const,
  frequency: "Monthly",
  location: "",
  website: "",
  organization: "",
  title: "",
  spouse: "",
  birthday: "",
  anniversary: "",
  notes: "",
  street: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
};

async function save(
  kind: "tags" | "profile" | "activity",
  fixture: ReturnType<typeof database>,
  ownership = { tenantId: "tenant-1", profileId: "missionary-1" },
) {
  const input = {
    supabaseAdmin: fixture.client as never,
    donorId: "donor-1",
    ...ownership,
  };
  if (kind === "activity")
    return recordMissionaryDonorActivity({
      ...input,
      assignmentId: "assignment-1",
      activityType: "note",
      note: "A note",
    });
  return kind === "tags"
    ? updateMissionaryDonorTags({ ...input, tags: [] })
    : updateMissionaryDonor({ ...input, patch: profilePatch });
}

describe.each(["tags", "profile"] as const)(
  "missionary %s mutation identity boundary (D-18, AL-2678 WP5 part 2-r2s: the stub answers the guard read before the write, each call with its own chain)",
  (kind) => {
    it.each([true, null, undefined, "false"])(
      "does not overwrite redacted donor data for preference %j",
      async (value) => {
        const fixture = database(
          value === undefined ? {} : { defaultAnonymousToRecipient: value },
        );
        await expect(save(kind, fixture)).rejects.toMatchObject({
          status: 404,
        });
        expect(fixture.row.name).toBe("Hidden real name");
        expect(fixture.row.tags).toEqual(["hidden-tag"]);
      },
    );
    it("allows a named relationship with an explicit boolean false preference", async () => {
      const fixture = database({ defaultAnonymousToRecipient: false });
      await save(kind, fixture);
      expect(kind === "tags" ? fixture.row.tags : fixture.row.name).toEqual(
        kind === "tags" ? [] : "Anonymous donor",
      );
    });
    it.each([
      { tenantId: "other-tenant", profileId: "missionary-1" },
      { tenantId: "tenant-1", profileId: "other-missionary" },
    ])(
      "preserves tenant and missionary ownership for %j",
      async (ownership) => {
        const fixture = database({ defaultAnonymousToRecipient: false });
        await expect(save(kind, fixture, ownership)).rejects.toMatchObject({
          status: 404,
        });
        expect(fixture.row.name).toBe("Hidden real name");
        expect(fixture.row.tags).toEqual(["hidden-tag"]);
      },
    );
  },
);

describe.each(["tags", "profile", "activity"] as const)(
  "AL-2678 WP5 part 2-r2s: a %s write on a hidden donor answers 404, as for an anonymous partner (Q2)",
  (kind) => {
    it.each([true, null, undefined, "false", 0, MISSING])(
      "a donor who chose to be named but whose restriction fact is %s is refused",
      async (fact) => {
        const fixture = database({ defaultAnonymousToRecipient: false }, fact);
        await expect(save(kind, fixture)).rejects.toMatchObject({
          status: 404,
          message: "Donor relationship not found",
        });
        expect(fixture.row.name).toBe("Hidden real name");
        expect(fixture.row.tags).toEqual(["hidden-tag"]);
        expect(fixture.activities).toEqual([]);
      },
    );
    it("an ordinary anonymous partner is refused the same way", async () => {
      const fixture = database({ defaultAnonymousToRecipient: true });
      await expect(save(kind, fixture)).rejects.toMatchObject({
        status: 404,
        message: "Donor relationship not found",
      });
      expect(fixture.activities).toEqual([]);
    });
    it("a donor of another missionary is refused the same way", async () => {
      const fixture = database({ defaultAnonymousToRecipient: false });
      await expect(
        save(kind, fixture, {
          tenantId: "tenant-1",
          profileId: "other-missionary",
        }),
      ).rejects.toMatchObject({
        status: 404,
        message: "Donor relationship not found",
      });
      expect(fixture.activities).toEqual([]);
    });
  },
);

describe("AL-2678 WP5 part 2-r2s: a shown donor's activity is recorded", () => {
  it("records the activity after the guard reads false", async () => {
    const fixture = database({ defaultAnonymousToRecipient: false });
    await save("activity", fixture);
    expect(fixture.activities).toEqual([
      expect.objectContaining({ p_donor_id: "donor-1", p_type: "note" }),
    ]);
  });
});
