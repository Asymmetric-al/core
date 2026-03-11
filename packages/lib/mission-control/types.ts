export type { Role, NavItem } from "@asym/config/navigation";
export type { Tile, QuickAction } from "@asym/config/tiles";
import type { Role } from "@asym/config/navigation";

export interface Workflow {
  id: string;
  title: string;
  description: string;
  primaryTile: string;
  route: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  avatarUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}
