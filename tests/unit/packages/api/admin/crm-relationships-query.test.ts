import { describe, expect, it } from "vitest";

import {
  decodeCrmRelationshipCursor,
  encodeCrmRelationshipCursor,
  parseAdminCrmRelationshipsParams,
} from "../../../../../packages/api/src/admin/crm/relationships/query";

describe("api/admin/crm/relationships/query", () => {
  it("uses stable defaults for the first relationship request", () => {
    expect(parseAdminCrmRelationshipsParams(new URLSearchParams())).toEqual({
      cursor: null,
      domains: [],
      limit: 50,
      search: null,
      sort: {
        direction: "desc",
        field: "updatedAt",
      },
    });
  });

  it("clamps limits, trims search, and parses domain filters", () => {
    const params = parseAdminCrmRelationshipsParams(
      new URLSearchParams(
        "limit=500&q=%20church%20&domain=churches&domain=households,pledges&domain=unknown&sort=displayName&dir=asc",
      ),
    );

    expect(params).toMatchObject({
      domains: ["churches", "households", "pledges"],
      limit: 100,
      search: "church",
      sort: {
        direction: "asc",
        field: "displayName",
      },
    });
  });

  it("round-trips cursors and rejects malformed cursors", () => {
    const cursor = encodeCrmRelationshipCursor({ offset: 25 });
    expect(decodeCrmRelationshipCursor(cursor)).toEqual({ offset: 25 });
    expect(decodeCrmRelationshipCursor("not-json")).toBeNull();
  });
});
