import { describe, expect, it } from "vitest";

import { parseSupportInboxRouteState } from "../../../../../../apps/admin/features/support-hub/lib/route-state";

describe("parseSupportInboxRouteState", () => {
  it("falls back to defaults when no params are supplied", () => {
    const state = parseSupportInboxRouteState({});
    expect(state.view).toBe("all");
    expect(state.layout).toBe("board");
    expect(state.status).toBe("all");
    expect(state.q).toBe("");
    expect(state.labelSlugs).toEqual([]);
    expect(state.assignee).toBe("");
  });

  it("round-trips a saved view filter through search params", () => {
    const state = parseSupportInboxRouteState({
      view: "mine",
      layout: "table",
      status: "open",
      q: "receipt",
      label: "finance,recurring",
      assignee: "me",
      id: "conv-1",
    });
    expect(state.view).toBe("mine");
    expect(state.layout).toBe("table");
    expect(state.status).toBe("open");
    expect(state.q).toBe("receipt");
    expect(state.labelSlugs).toEqual(["finance", "recurring"]);
    expect(state.assignee).toBe("me");
    expect(state.selectedConversationId).toBe("conv-1");
  });

  it("clamps unknown values to the documented defaults", () => {
    const state = parseSupportInboxRouteState({
      view: "not-a-view",
      layout: "card",
    });
    expect(state.view).toBe("all");
    expect(state.layout).toBe("board");
  });
});
