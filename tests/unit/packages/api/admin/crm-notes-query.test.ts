import { describe, expect, it } from "vitest";

import {
  decodeCrmNoteCursor,
  encodeCrmNoteCursor,
  parseAdminCrmNotesParams,
} from "../../../../../packages/api/src/admin/crm/notes/query";

describe("api/admin/crm/notes/query", () => {
  it("uses stable defaults for the first CRM notes request", () => {
    const params = parseAdminCrmNotesParams(new URLSearchParams());

    expect(params.limit).toBe(50);
    expect(params.search).toBeNull();
    expect(params.sort).toEqual({
      field: "updatedAt",
      direction: "desc",
    });
    expect(params.cursor).toBeNull();
  });

  it("clamps, trims, and validates query params", () => {
    const params = parseAdminCrmNotesParams(
      new URLSearchParams([
        ["limit", "999"],
        ["q", "  pledge  "],
        ["sort", "title"],
        ["dir", "asc"],
      ]),
    );

    expect(params.limit).toBe(100);
    expect(params.search).toBe("pledge");
    expect(params.sort).toEqual({
      field: "title",
      direction: "asc",
    });
  });

  it("round-trips note cursors", () => {
    const encoded = encodeCrmNoteCursor({ offset: 50 });
    expect(decodeCrmNoteCursor(encoded)).toEqual({ offset: 50 });
  });

  it("rejects malformed cursors instead of throwing", () => {
    expect(decodeCrmNoteCursor("not-json")).toBeNull();
  });
});
