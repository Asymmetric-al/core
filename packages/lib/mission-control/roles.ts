import type { Role } from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  finance: "Finance",
  fundraising: "Fundraising",
  mobilizers: "Mobilizers",
  member_care: "Member Care",
  events: "Events",
  staff: "Basic Staff",
  admin: "Administrator",
};

export const ROLE_TILE_ACCESS: Record<Role, string[]> = {
  finance: ["contributions", "reports", "pdf", "admin"],
  fundraising: ["crm", "web-studio", "email", "reports"],
  mobilizers: ["mobilize", "crm", "sign", "automations"],
  member_care: ["care", "crm", "support", "reports"],
  events: ["events", "sign", "contributions", "reports"],
  staff: ["crm", "web-studio"],
  admin: [
    "web-studio",
    "crm",
    "contributions",
    "email",
    "pdf",
    "sign",
    "mobilize",
    "reports",
    "support",
    "automations",
    "care",
    "events",
    "admin",
  ],
};

export function canAccessTile(role: Role, tileId: string): boolean {
  return ROLE_TILE_ACCESS[role]?.includes(tileId) ?? false;
}

export function getAccessibleTileIds(role: Role): string[] {
  return ROLE_TILE_ACCESS[role] ?? [];
}
