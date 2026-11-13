import { describe, expect, it } from "vitest";

import {
  describeSavedViewFilter,
  savedViewHref,
} from "../../../../../../apps/admin/features/support-hub/lib/saved-view-links";

import type { SupportSavedViewFilter } from "../../../../../../apps/admin/features/support-hub/types";

const defaults: SupportSavedViewFilter = {
  view: "all",
  layout: "board",
  status: "all",
  q: "",
  labelSlugs: [],
  assignee: "",
};

describe("savedViewHref", () => {
  it("opens the plain inbox when every filter is the default", () => {
    expect(savedViewHref(defaults)).toBe("/support");
  });

  it("writes only non-default filters, with the inbox's own param keys", () => {
    const href = savedViewHref({
      view: "mine",
      layout: "table",
      status: "open",
      q: "receipt",
      labelSlugs: ["receipts", "address"],
      assignee: "agent-1",
    });
    const url = new URL(href, "https://example.org");
    expect(url.pathname).toBe("/support");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      view: "mine",
      layout: "table",
      status: "open",
      q: "receipt",
      label: "receipts,address",
      assignee: "agent-1",
    });
  });
});

describe("describeSavedViewFilter", () => {
  it("reads every filter in plain words", () => {
    expect(
      describeSavedViewFilter({
        view: "mine",
        layout: "board",
        status: "open",
        q: " receipt ",
        labelSlugs: ["receipts", "address"],
        assignee: "",
      }),
    ).toBe("My conversations · Open · 2 labels · “receipt” · Board layout");
  });

  it("names the assignee, falling back when the agent is unknown", () => {
    const agentName = (id: string) => (id === "agent-1" ? "Anita" : undefined);
    expect(
      describeSavedViewFilter(
        { ...defaults, assignee: "agent-1", labelSlugs: ["vip"] },
        { agentName },
      ),
    ).toBe(
      "All conversations · Any status · Assigned to Anita · 1 label · Board layout",
    );
    expect(
      describeSavedViewFilter(
        { ...defaults, assignee: "agent-9" },
        { agentName },
      ),
    ).toContain("Assigned to an agent");
    expect(describeSavedViewFilter({ ...defaults, assignee: "me" })).toContain(
      "Assigned to me",
    );
    expect(
      describeSavedViewFilter({
        ...defaults,
        assignee: "unassigned",
        layout: "table",
      }),
    ).toBe("All conversations · Any status · No assignee · Table layout");
  });

  it("never prints a raw key such as past-due", () => {
    expect(
      describeSavedViewFilter({
        ...defaults,
        view: "past-due",
        status: "snoozed",
      }),
    ).toBe("Past due · Snoozed · Board layout");
  });
});
