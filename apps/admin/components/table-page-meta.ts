/**
 * Single source of truth for the title, description, and density of admin
 * table routes. Both the route's `loading.tsx` (via `TablePageFallback`) and
 * its client `PageShell` read from here, so the loading skeleton and the
 * loaded page never drift on heading text or spacing.
 */
export interface TablePageMeta {
  title: string;
  description: string;
  density: "default" | "compact";
}

export const CRM_PAGE_META: TablePageMeta = {
  title: "CRM",
  description: "Manage contacts, donors, and partner relationships.",
  density: "compact",
};

export const CRM_NOTES_PAGE_META: TablePageMeta = {
  title: "CRM Notes",
  description: "Relationship notes for staff follow-up.",
  density: "default",
};

export const CRM_RELATIONSHIPS_PAGE_META: TablePageMeta = {
  title: "CRM Relationships",
  description:
    "Relationship graph, search, and reporting for staff operations.",
  density: "default",
};

export const CRM_PROJECTIONS_PAGE_META: TablePageMeta = {
  title: "CRM Projections",
  description: "Shadow-mode projection health across Asym surfaces.",
  density: "default",
};

export const TASKS_PAGE_META: TablePageMeta = {
  title: "Mission Pipeline",
  description: "Coordinate donor outreach and field operations.",
  density: "compact",
};

export const EVENTS_PAGE_META: TablePageMeta = {
  title: "Events",
  description: "Plan events, sessions, speakers, registrations, and logistics.",
  density: "compact",
};

export const SUPPORT_TICKETS_PAGE_META: TablePageMeta = {
  title: "Support Tickets",
  description:
    "Review Donor Care, Mobilization, and Existing Missionary Support requests.",
  density: "default",
};
