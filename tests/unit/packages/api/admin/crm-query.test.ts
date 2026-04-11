import { describe, expect, it } from "vitest";

import {
  decodeCrmCursor,
  encodeCrmCursor,
  parseAdminCrmParams,
} from "../../../../../packages/api/src/admin/crm/query";

describe("api/admin/crm/query", () => {
  it("uses stable defaults for the initial CRM grid request", () => {
    const params = parseAdminCrmParams(new URLSearchParams());

    expect(params.limit).toBe(50);
    expect(params.search).toBeNull();
    expect(params.sort.field).toBe("updatedAt");
    expect(params.sort.direction).toBe("desc");
    expect(params.cursor).toBeNull();
    expect(params.filters).toEqual({
      recordTypes: [],
      lifecycleStatuses: [],
      tags: [],
      hasPortal: null,
    });
  });

  it("clamps limit and maps filters", () => {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", "999");
    searchParams.set("q", "  jane  ");
    searchParams.set("sort", "name");
    searchParams.set("dir", "asc");
    searchParams.append("recordType", "individual");
    searchParams.append("recordType", "Church");
    searchParams.append("status", "active");
    searchParams.append("tag", "Major Donor");
    searchParams.set("hasPortal", "true");

    const params = parseAdminCrmParams(searchParams);

    expect(params.limit).toBe(100);
    expect(params.search).toBe("jane");
    expect(params.sort).toEqual({ field: "name", direction: "asc" });
    expect(params.filters.recordTypes).toEqual(["individual", "Church"]);
    expect(params.filters.lifecycleStatuses).toEqual(["active"]);
    expect(params.filters.tags).toEqual(["Major Donor"]);
    expect(params.filters.hasPortal).toBe(true);
  });

  it("round-trips CRM cursors", () => {
    const cursor = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      field: "lifetimeGiving" as const,
      direction: "desc" as const,
      value: 1250,
    };
    const encoded = encodeCrmCursor(cursor);
    expect(decodeCrmCursor(encoded)).toEqual(cursor);
  });

  it("rejects invalid sort fields", () => {
    const params = parseAdminCrmParams(
      new URLSearchParams([["sort", "not-a-field"]]),
    );
    expect(params.sort.field).toBe("updatedAt");
  });
});
