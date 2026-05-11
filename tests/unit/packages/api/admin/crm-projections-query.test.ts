import { describe, expect, it } from "vitest";

import { parseAdminCrmProjectionShadowParams } from "../../../../../packages/api/src/admin/crm/projections/query";

describe("api/admin/crm/projections/query", () => {
  it("uses stable defaults for the projection shadow request", () => {
    expect(parseAdminCrmProjectionShadowParams(new URLSearchParams())).toEqual({
      search: null,
      targetSurfaces: [],
    });
  });

  it("trims search and parses target surface filters", () => {
    expect(
      parseAdminCrmProjectionShadowParams(
        new URLSearchParams(
          "q=%20drift%20&surface=donor&surface=missionary,event&surface=unknown&surface=donor",
        ),
      ),
    ).toEqual({
      search: "drift",
      targetSurfaces: ["donor", "missionary", "event"],
    });
  });
});
