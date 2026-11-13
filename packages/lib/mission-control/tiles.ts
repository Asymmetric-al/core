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

/**
 * Common tasks and the page each one starts on. Each entry opens that page;
 * the description says what is there, not a multi-step flow.
 */
export const WORKFLOWS: Workflow[] = [
  {
    id: "gift-lifecycle",
    title: "Review gifts and receipts",
    description: "Contributions: new gifts, receipts to send and corrections.",
    primaryTile: "contributions",
    route: "/contributions",
  },
  {
    id: "support-inbox",
    title: "Answer support email",
    description: "Support Hub: donor, applicant and missionary email.",
    primaryTile: "support",
    route: "/support",
  },
  {
    id: "field-locations",
    title: "Update field locations",
    description: "Mobilize: the places shown on the public map.",
    primaryTile: "mobilize",
    route: "/mobilize/locations",
  },
  {
    id: "care-signal-action",
    title: "Follow up on member care",
    description: "Member Care: who needs follow-up and recent check-ins.",
    primaryTile: "care",
    route: "/care",
  },
];

export function getTileById(id: string): Tile | undefined {
  return TILES.find((tile) => tile.id === id);
}

export function getTilesByRole(roleIds: string[]): Tile[] {
  const roleIdSet = new Set(roleIds);
  return TILES.filter((tile) => tile.roles.some((r) => roleIdSet.has(r)));
}
