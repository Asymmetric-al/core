import { describe, expect, it } from "vitest";

import { navigation } from "../../../../../packages/config/navigation";
import { NAV_ITEMS } from "../../../../../packages/lib/mission-control/nav";
import { resolveMissionControlHref } from "../../../../../packages/lib/mission-control/routes";
import { TILES } from "../../../../../packages/lib/mission-control/tiles";

describe("resolveMissionControlHref", () => {
  it("removes the legacy /mc prefix from admin app routes", () => {
    expect(resolveMissionControlHref("/mc")).toBe("/");
    expect(resolveMissionControlHref("/mc/contributions")).toBe(
      "/contributions",
    );
    expect(resolveMissionControlHref("/contributions")).toBe("/contributions");
  });

  it("keeps canonical tile routes and quick actions in the admin app namespace", () => {
    const contributionsTile = TILES.find((tile) => tile.id === "contributions");
    const newBatchAction = contributionsTile?.quickActions.find(
      (action) => action.label === "New batch",
    );

    expect(contributionsTile?.route).toBe("/contributions");
    expect(resolveMissionControlHref(newBatchAction?.href ?? "/missing")).toBe(
      "/contributions/batches/new",
    );
  });
});

describe("mission control contributions navigation", () => {
  it("uses canonical contributions hrefs in shared nav configs", () => {
    expect(navigation.find((item) => item.id === "contributions")?.href).toBe(
      "/contributions",
    );
    expect(NAV_ITEMS.find((item) => item.id === "contributions")?.href).toBe(
      "/contributions",
    );
  });
});
