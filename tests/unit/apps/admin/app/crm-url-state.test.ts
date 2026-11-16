import { describe, expect, it } from "vitest";

import {
  crmUrlStateKey,
  readCrmUrlState,
  writeCrmUrlState,
} from "../../../../../apps/admin/app/(app)/crm/crm-url-state";

/**
 * /crm keeps its search, filters, sort and board view in the address, so a
 * reload, a shared link or Back returns to the same list. Defaults stay out
 * of the address, and the donor, gift and Support Hub parameters survive.
 */
describe("CRM list URL state", () => {
  it("reads the defaults from an empty address", () => {
    expect(readCrmUrlState(new URLSearchParams())).toEqual({
      columnFilters: [],
      sorting: [{ id: "lastTouchAt", desc: true }],
      view: "table",
    });
  });

  it("round-trips search, filters, sort and the board view", () => {
    const state = {
      columnFilters: [
        { id: "displayName", value: "hale" },
        { id: "recordType", value: ["individual", "church"] },
        { id: "lifecycleStatus", value: ["at_risk"] },
        { id: "tags", value: ["board", "major donor"] },
        { id: "portalAccessLabel", value: ["linked"] },
      ],
      sorting: [{ id: "lifetimeGiving", desc: false }],
      view: "kanban" as const,
    };
    const params = writeCrmUrlState(new URLSearchParams(), state);

    expect(params.get("q")).toBe("hale");
    expect(params.getAll("recordType")).toEqual(["individual", "church"]);
    expect(params.get("sort")).toBe("lifetimeGiving");
    expect(params.get("dir")).toBe("asc");
    expect(params.get("view")).toBe("board");
    expect(readCrmUrlState(params)).toEqual(state);
  });

  it("leaves defaults out and keeps the donor, gift and email parameters", () => {
    const params = writeCrmUrlState(
      new URLSearchParams(
        "donor=d-1&gift=g-1&email=a%40b.org&q=old&sort=displayName&dir=asc&view=board",
      ),
      readCrmUrlState(new URLSearchParams()),
    );

    expect(params.toString()).toBe("donor=d-1&gift=g-1&email=a%40b.org");
  });

  it("drops a blank search and empty filters", () => {
    const params = writeCrmUrlState(new URLSearchParams(), {
      columnFilters: [
        { id: "displayName", value: "   " },
        { id: "recordType", value: [] },
      ],
      sorting: [],
      view: "table",
    });

    expect(params.toString()).toBe("");
  });

  it("ignores unknown sorts, directions and filter fields", () => {
    expect(
      readCrmUrlState(
        new URLSearchParams("sort=email&dir=sideways&view=grid&color=red"),
      ),
    ).toEqual(readCrmUrlState(new URLSearchParams()));
    expect(
      readCrmUrlState(new URLSearchParams("sort=displayName&dir=sideways"))
        .sorting,
    ).toEqual([{ id: "displayName", desc: true }]);
  });

  it("gives equal states one key, whatever else is in the address", () => {
    const a = readCrmUrlState(new URLSearchParams("q=hale&donor=d-1"));
    const b = readCrmUrlState(new URLSearchParams("q=hale"));
    expect(crmUrlStateKey(a)).toBe(crmUrlStateKey(b));
    expect(crmUrlStateKey(a)).not.toBe(
      crmUrlStateKey(readCrmUrlState(new URLSearchParams())),
    );
  });
});
