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
    client: {
      from: () => builder,
      rpc(method: string, args: unknown) {
        calls.push({ method, args: [args] });
        return builder;
      },
    },
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
  it("passes the same substring wildcards and punctuation to the scoped search", async () => {
    const { calls, client } = createRecordingSupabase();
    await listAdminCrmRecords(
      client as never,
      "tenant-1",
      parseAdminCrmParams(new URLSearchParams({ q: "A*d_a,(b)%" })),
    );
    expect(calls).toContainEqual({
      method: "search_crm_donors",
      args: [{ p_tenant_id: "tenant-1", p_term: "A%d_a  b  " }],
    });
  });

  it("bounds a first text page before merging the indexed and long-key ranges", async () => {
    const { calls, client } = createRecordingSupabase();
    await listAdminCrmRecords(
      client as never,
      "tenant-1",
      parseAdminCrmParams(
        new URLSearchParams({ sort: "name", dir: "asc", limit: "20" }),
      ),
    );
    expect(calls).toContainEqual({
      method: "crm_donor_text_page",
      args: [
        {
          p_tenant_id: "tenant-1",
          p_column: "name",
          p_descending: false,
          p_limit: 21,
        },
      ],
    });
  });

  it("applies filters and cursors to all records before limiting a text page", async () => {
    for (const query of [
      "sort=name&status=active",
      "sort=recordType&tag=partner",
      "sort=lifecycleStatus&hasPortal=false",
      "sort=name&recordType=church",
    ]) {
      const { calls, client } = createRecordingSupabase();
      await listAdminCrmRecords(
        client as never,
        "tenant-1",
        parseAdminCrmParams(new URLSearchParams(query)),
      );
      expect(calls.some((call) => call.method === "crm_donor_text_page")).toBe(
        false,
      );
    }
    const { calls, client } = createRecordingSupabase();
    const params = parseAdminCrmParams(new URLSearchParams("sort=name"));
    await listAdminCrmRecords(client as never, "tenant-1", {
      ...params,
      cursor: { direction: "desc", field: "name", id: "last", value: "Smith" },
    });
    expect(calls.some((call) => call.method === "crm_donor_text_page")).toBe(
      false,
    );
    expect(calls.some((call) => call.method === "or")).toBe(true);
  });

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

const donor = {
  avatar_url: null,
  created_at: "2026-01-01T00:00:00.000Z",
  email: "ada@example.test",
  id: "donor-1",
  last_gift_date: null,
  location: null,
  missionary_id: null,
  ministry_assignment_id: null,
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

describe("CRM grid row", () => {
  it("D-18 (AL-2678 r3: a row carries its assignment key, and the builder takes the owner's key as a third argument): uses the email, then the phone, as the primary contact, never the job title", () => {
    expect(buildCrmGridRow(donor, null, null).primaryContactLine).toBe(
      "ada@example.test",
    );
    expect(
      buildCrmGridRow({ ...donor, email: null }, null, null).primaryContactLine,
    ).toBe("555-0100");
    expect(
      buildCrmGridRow({ ...donor, email: null, phone: null }, null, null)
        .primaryContactLine,
    ).toBeNull();
  });

  it("carries the owner's assignment key, or null", () => {
    expect(
      buildCrmGridRow(donor, "Pat Worker", "assignment-a").ownerAssignmentId,
    ).toBe("assignment-a");
    expect(buildCrmGridRow(donor, null, null).ownerAssignmentId).toBeNull();
  });
});

describe("CRM records list owner (AL-2678 r3, plan line 997)", () => {
  function listClient(rows: Record<string, unknown>[]) {
    const calls: Call[] = [];
    const builder: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "in", "not", "is", "or"])
      builder[method] = (...args: unknown[]) => {
        calls.push({ args, method });
        return builder;
      };
    builder.limit = async () => ({ data: rows, error: null });
    return {
      calls,
      client: {
        from: () => builder,
        rpc(method: string, args: Record<string, unknown>) {
          calls.push({ method, args: [args] });
          if (method === "crm_missionary_labels")
            return Promise.resolve({
              data: (args.p_ids as string[])
                .filter((id) => id === "assignment-a")
                .map((id) => ({
                  id,
                  profile_id: "profile-p",
                  member_profile_id: "profile-p",
                  display_name: "Pat Worker",
                  email: "pat@example.test",
                })),
              error: null,
            });
          return builder;
        },
      },
    };
  }

  it.each([
    ["the table", ""],
    ["the search", "q=Ada"],
    ["the first text page", "sort=name&dir=asc"],
  ])("selects ministry_assignment_id through %s", async (_path, query) => {
    const { calls, client } = listClient([]);
    await listAdminCrmRecords(
      client as never,
      "tenant-1",
      parseAdminCrmParams(new URLSearchParams(query)),
    );
    const select = calls.find((call) => call.method === "select");
    expect(String(select?.args[0]).split(", ")).toContain(
      "ministry_assignment_id",
    );
  });

  it("names the owner by the assignment key through crm_missionary_labels, once per page, and emits the key only when the selected organization's labels return it", async () => {
    const { calls, client } = listClient([
      {
        ...donor,
        id: "donor-p",
        missionary_id: "profile-p",
        ministry_assignment_id: "assignment-a",
      },
      {
        ...donor,
        id: "donor-q",
        missionary_id: "profile-q",
        ministry_assignment_id: null,
      },
      {
        ...donor,
        id: "donor-x",
        missionary_id: "profile-x",
        ministry_assignment_id: "assignment-elsewhere",
      },
    ]);
    const list = await listAdminCrmRecords(
      client as never,
      "tenant-1",
      parseAdminCrmParams(new URLSearchParams("")),
    );
    expect(
      list.rows.map((row) => [
        row.id,
        row.assignedMissionaryName,
        row.ownerAssignmentId,
      ]),
    ).toEqual([
      ["donor-p", "Pat Worker", "assignment-a"],
      ["donor-q", null, null],
      ["donor-x", null, null],
    ]);
    const rpcs = calls.filter((call) =>
      ["crm_missionary_labels", "tenant_member_directory"].includes(
        call.method,
      ),
    );
    expect(rpcs).toEqual([
      {
        method: "crm_missionary_labels",
        args: [
          {
            p_tenant_id: "tenant-1",
            p_ids: ["assignment-a", "assignment-elsewhere"],
          },
        ],
      },
    ]);
    expect(JSON.stringify(list)).not.toContain("assignment-elsewhere");
  });
});
