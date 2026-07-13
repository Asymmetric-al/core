import { tiles } from "@asym/config/tiles";

import type { Tile, Workflow } from "./types";

/**
 * Mission Control tile catalog and workflows.
 *
 * The tile catalog is owned by `@asym/config/tiles` (the static product
 * config, which also owns the `Tile`/`QuickAction` types). This module
 * re-exports it as `TILES` and layers the Mission-Control-specific workflows
 * on top, so the two surfaces that render tiles (the Mission Control home and
 * the teams admin) cannot drift apart.
 */
export const TILES: Tile[] = tiles;

export const WORKFLOWS: Workflow[] = [
  {
    id: "gift-lifecycle",
    title: "Gift Lifecycle",
    description: "From donation to receipt to year-end statement",
    primaryTile: "contributions",
    route: "/contributions",
  },
  {
    id: "missionary-onboarding",
    title: "Missionary Onboarding",
    description: "Application through training to field deployment",
    primaryTile: "mobilize",
    route: "/mobilize",
  },
  {
    id: "event-registration-giving",
    title: "Event Registration with Giving",
    description: "Register, attend, and give at conferences",
    primaryTile: "events",
    route: "/events",
  },
  {
    id: "care-signal-action",
    title: "Care Signal to Action",
    description: "Identify needs and respond with care plans",
    primaryTile: "care",
    route: "/care",
  },
];

export function getTileById(id: string): Tile | undefined {
  return TILES.find((tile) => tile.id === id);
}

export function getTilesByRole(roleIds: string[]): Tile[] {
  return TILES.filter((tile) => tile.roles.some((r) => roleIds.includes(r)));
}
