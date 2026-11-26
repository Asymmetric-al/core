import {
  insideForRole,
  quickActionsForRole,
  tiles,
  type Tile,
} from "@asym/config/tiles";
import { mapRoleToMCRole } from "@asym/lib/mission-control/bootstrap";
import { describe, expect, it } from "vitest";

const adminTile = tiles.find((tile) => tile.id === "admin") as Tile;

const features = (line: string) => line.split(" · ");

describe("Administration tile feature line", () => {
  // The Eve page admits admins only (eve/workspace-access.ts), so the
  // "inside" line follows the same role rule as the Eve shortcut.
  it("does not list Eve to finance while listing Members to finance", () => {
    expect(features(insideForRole(adminTile, "finance"))).not.toContain("Eve");
    expect(features(insideForRole(adminTile, "finance"))).toContain("Members");
    expect(features(insideForRole(adminTile, "finance"))).toContain(
      "Email delivery",
    );
  });

  it("lists Eve to admins after the shared features (D-18: WP6 part 2b retires the Web Studio editors list)", () => {
    expect(features(insideForRole(adminTile, "admin"))).toEqual([
      "Members",
      "Email delivery",
      "Eve",
    ]);
  });

  it("keeps the plain feature line to what every role of the tile can open", () => {
    // Surfaces that print `tile.inside` without a role must not over-promise.
    expect(features(adminTile.inside)).not.toContain("Eve");
  });

  it("returns the plain feature line for tiles with no role-limited features", () => {
    for (const tile of tiles.filter((entry) => !entry.roleInside)) {
      for (const role of tile.roles) {
        expect(insideForRole(tile, role)).toBe(tile.inside);
      }
    }
  });

  it("only limits features to roles that can open the tile", () => {
    for (const tile of tiles) {
      for (const feature of tile.roleInside ?? []) {
        for (const role of feature.roles) {
          expect(tile.roles).toContain(role);
        }
      }
    }
  });
});

describe("super admins on Home", () => {
  // Navigation knows no super_admin role: the shell maps a super admin
  // profile to "admin" (packages/lib/mission-control/bootstrap.ts), which the
  // Eve page also admits, so Home must still offer them Eve.
  it("offers Eve to a super admin through the admin role", () => {
    const role = mapRoleToMCRole("super_admin");
    expect(role).toBe("admin");
    const adminHrefs = quickActionsForRole(adminTile, role).map(
      (action) => action.href,
    );
    expect(adminHrefs).toContain("/settings/eve");
    expect(adminHrefs).not.toContain("/admin/eve");
    expect(features(insideForRole(adminTile, role))).toContain("Eve");
  });

  it("points the Administration tile and its quick actions at /settings routes", () => {
    expect(adminTile.route).toBe("/settings");
    expect(adminTile.route).not.toBe("/admin");
    const adminActions = quickActionsForRole(adminTile, "admin").map(
      (action) => action.href,
    );
    expect(adminActions).toEqual([
      "/settings",
      "/settings/teams",
      "/settings/eve",
    ]);
    expect(
      adminActions.filter(
        (href) => href === "/admin" || href.startsWith("/admin/"),
      ),
    ).toEqual([]);
    expect(
      quickActionsForRole(adminTile, "finance").map((action) => action.href),
    ).toEqual(["/settings", "/settings/teams"]);
  });
});
