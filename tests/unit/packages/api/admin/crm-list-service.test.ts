import { describe, expect, it } from "vitest";

import {
  canonicalStoredValue,
  expandStoredValueSpellings,
} from "../../../../../packages/api/src/admin/crm/filter-variants";
import { buildCrmGridRow } from "../../../../../packages/api/src/admin/crm/model";
import { parseAdminCrmParams } from "../../../../../packages/api/src/admin/crm/query";
import { listAdminCrmRecords } from "../../../../../packages/api/src/admin/crm/service";

type Call = { method: string; args: unknown[] };

/** Records the filter calls the list read makes and answers with no rows. */
function createRecordingSupabase() {
  const calls: Call[] = [];
  const builder: Record<string, unknown> = {};
  for (const method of [
    "select",
    "eq",
    "in",
    "overlaps",
    "not",
    "is",
    "or",
    "order",
    "lt",
    "gt",
  ]) {
    builder[method] = (...args: unknown[]) => {
      calls.push({ args, method });
      return builder;
    };
  }
  builder.limit = async () => ({ data: [], error: null });
  return {
    calls,
    client: { from: () => builder },
  };
}

function inValues(calls: Call[], column: string): unknown[] {
  const call = calls.find(
    (entry) => entry.method === "in" && entry.args[0] === column,
  );
  return (call?.args[1] as unknown[]) ?? [];
}

describe("CRM stored-value spellings", () => {
  it("lists every separator and casing a writer may have stored", () => {
    const spellings = expandStoredValueSpellings(["at_risk"]);

    expect(spellings).toEqual(
      expect.arrayContaining([
        "at_risk",
        "at risk",
        "at-risk",
        "At Risk",
        "At risk",
        "AT_RISK",
      ]),
    );
  });

  it("reduces any spelling to one canonical key", () => {
    expect(canonicalStoredValue("At Risk")).toBe("at_risk");
    expect(canonicalStoredValue("at-risk")).toBe("at_risk");
    expect(canonicalStoredValue(" Church ")).toBe("church");
  });
});

describe("CRM records list filters", () => {
  it("matches every stored spelling of a type and status filter", async () => {
    const searchParams = new URLSearchParams();
    searchParams.append("recordType", "church");
    searchParams.append("status", "at_risk");
    const { calls, client } = createRecordingSupabase();

    await listAdminCrmRecords(
      client as never,
      "tenant-1",
      parseAdminCrmParams(searchParams),
    );

    expect(inValues(calls, "type")).toEqual(
      expect.arrayContaining(["church", "Church"]),
    );
    expect(inValues(calls, "status")).toEqual(
      expect.arrayContaining(["at_risk", "At Risk", "at-risk", "At risk"]),
    );
    expect(calls).toContainEqual({
      args: ["tenant_id", "tenant-1"],
      method: "eq",
    });
  });
});

describe("CRM grid row", () => {
  const donor = {
    avatar_url: null,
    created_at: "2026-01-01T00:00:00.000Z",
    email: "ada@example.test",
    id: "donor-1",
    last_gift_date: null,
    location: null,
    missionary_id: null,
    name: "Ada",
    notes: null,
    organization: null,
    phone: "555-0100",
    profile_id: null,
    status: "active",
    tags: [],
    title: "Board chair",
    total_given: 0,
    type: "individual",
    updated_at: "2026-01-02T00:00:00.000Z",
  };

  it("uses the email, then the phone, as the primary contact, never the job title", () => {
    expect(buildCrmGridRow(donor, null).primaryContactLine).toBe(
      "ada@example.test",
    );
    expect(
      buildCrmGridRow({ ...donor, email: null }, null).primaryContactLine,
    ).toBe("555-0100");
    expect(
      buildCrmGridRow({ ...donor, email: null, phone: null }, null)
        .primaryContactLine,
    ).toBeNull();
  });
});
