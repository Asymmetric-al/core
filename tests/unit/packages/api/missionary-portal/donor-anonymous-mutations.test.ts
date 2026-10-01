import { describe, expect, it } from "vitest";

import {
  updateMissionaryDonor,
  updateMissionaryDonorTags,
} from "../../../../../packages/api/src/missionary-portal/donor";

type DonorRow = {
  id: string;
  tenant_id: string;
  missionary_id: string;
  giving_preferences: unknown;
  name: string;
  tags: string[];
};

function database(preferences: unknown) {
  const row: DonorRow = {
    id: "donor-1",
    tenant_id: "tenant-1",
    missionary_id: "missionary-1",
    giving_preferences: preferences,
    name: "Hidden real name",
    tags: ["hidden-tag"],
  };
  const conditions: Array<(value: DonorRow) => boolean> = [];
  let patch: Record<string, unknown> = {};
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
    select() {
      return query;
    },
    async single() {
      if (!conditions.every((condition) => condition(row)))
        return {
          data: null,
          error: { code: "PGRST116", message: "No matching donor" },
        };
      Object.assign(row, patch);
      return { data: { id: row.id }, error: null };
    },
  };
  return {
    row,
    client: {
      from(table: string) {
        expect(table).toBe("donors");
        return query;
      },
    },
  };
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
  kind: "tags" | "profile",
  fixture: ReturnType<typeof database>,
  ownership = { tenantId: "tenant-1", profileId: "missionary-1" },
) {
  const input = {
    supabaseAdmin: fixture.client as never,
    donorId: "donor-1",
    ...ownership,
  };
  return kind === "tags"
    ? updateMissionaryDonorTags({ ...input, tags: [] })
    : updateMissionaryDonor({ ...input, patch: profilePatch });
}

describe.each(["tags", "profile"] as const)(
  "missionary %s mutation identity boundary",
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
