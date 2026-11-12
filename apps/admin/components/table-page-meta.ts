/**
 * Single source of truth for the title, description, and density of admin
 * table routes. Both the route's `loading.tsx` (via `TablePageFallback`) and
 * its client `PageShell` read from here, so the loading skeleton and the
 * loaded page never drift on heading text or spacing.
 */
interface TablePageMeta {
  title: string;
  description: string;
  density: "default" | "compact";
}

export const CRM_PAGE_META: TablePageMeta = {
  title: "CRM",
  description:
    "People, churches and organizations who give to and partner with you.",
  density: "compact",
};

export const CRM_NOTES_PAGE_META: TablePageMeta = {
  title: "CRM notes",
  description:
    "Notes staff keep about the people and organizations they work with.",
  density: "compact",
};

export const CRM_RELATIONSHIPS_PAGE_META: TablePageMeta = {
  title: "CRM relationships",
  description:
    "Search CRM records and review households, pledges and activity.",
  density: "compact",
};

export const CONTRIBUTIONS_PAGE_META: TablePageMeta = {
  title: "Contributions",
  description:
    "Find a gift, check its payment and receipt, and refund, correct or resend it.",
  density: "compact",
};

export const TASKS_PAGE_META: TablePageMeta = {
  title: "Tasks",
  description: "Calls, follow-ups and to-dos for the team.",
  density: "compact",
};

export const EVENTS_PAGE_META: TablePageMeta = {
  title: "Events",
  description: "Plan events, sessions, speakers, registrations, and logistics.",
  density: "compact",
};

export const SUPPORT_TICKETS_PAGE_META: TablePageMeta = {
  title: "Support tickets",
  description:
    "Requests from donors, candidates and missionaries, by support track.",
  density: "compact",
};
