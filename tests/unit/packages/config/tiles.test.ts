import {
  insideForRole,
  quickActionsForRole,
  tiles,
  type Tile,
} from "@asym/config/tiles";
import { mapProfileRoleToMCRole } from "@asym/lib/mission-control/bootstrap";
import { describe, expect, it } from "vitest";

const adminTile = tiles.find((tile) => tile.id === "admin") as Tile;

const features = (line: string) => line.split(" · ");

describe("Administration tile feature line", () => {
  // The Eve page admits admins only (eve/workspace-access.ts), so the
  // "inside" line follows the same role rule as the Eve shortcut.
  it("does not list Eve or the staff directory to finance", () => {
    // Both pages read admin-only data (eve/workspace-access.ts and the
    // admin users endpoint).
    expect(features(insideForRole(adminTile, "finance"))).not.toContain("Eve");
    expect(features(insideForRole(adminTile, "finance"))).not.toContain(
      "Staff directory",
    );
    expect(features(insideForRole(adminTile, "finance"))).toContain(
      "Email delivery",
    );
  });

  it("lists Eve to admins after the shared features", () => {
    expect(features(insideForRole(adminTile, "admin"))).toEqual([
      "Web Studio editors",
      "Email delivery",
      "Staff directory",
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
    const role = mapProfileRoleToMCRole("super_admin");
    expect(role).toBe("admin");
    expect(
      quickActionsForRole(adminTile, role).map((action) => action.href),
    ).toContain("/admin/eve");
    expect(features(insideForRole(adminTile, role))).toContain("Eve");
  });
});
