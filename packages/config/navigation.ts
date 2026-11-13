import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  DollarSign,
  FileText,
  Globe,
  Heart,
  House,
  LifeBuoy,
  Mail,
  Megaphone,
  Rocket,
  Shield,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Role =
  | "finance"
  | "fundraising"
  | "mobilizers"
  | "member_care"
  | "events"
  | "staff"
  | "admin";

/** Sidebar group a destination belongs to. */
export type NavSection = "home" | "modules" | "tools" | "system";

/** A page inside a module (sidebar submenu and search result). */
export interface NavSubItem {
  id: string;
  title: string;
  href: string;
  /**
   * Only these roles see the page, when narrower than its module's roles
   * (the page's own access check is the authority; this keeps navigation
   * from offering a page that would answer "No access").
   */
  roles?: Role[];
  /** Other words staff use for this page, matched by search only. */
  keywords?: readonly string[];
}

/**
 * One Mission Control destination. The same entry names the sidebar link,
 * the search result and the page heading, so a destination is called the
 * same thing everywhere.
 */
export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  section: NavSection;
  /** Pages inside the module, first one the module's own home. */
  items?: NavSubItem[];
  /** Other words staff use for this destination, matched by search only. */
  keywords?: readonly string[];
}

export const EVERY_ROLE: Role[] = [
  "finance",
  "fundraising",
  "mobilizers",
  "member_care",
  "events",
  "staff",
  "admin",
];

export const NAV_SECTION_LABELS: Record<NavSection, string | null> = {
  home: null,
  modules: "Modules",
  tools: "Tools",
  system: "System",
};

export const navigation: NavItem[] = [
  {
    id: "home",
    title: "Home",
    href: "/",
    icon: House,
    roles: EVERY_ROLE,
    section: "home",
    keywords: ["dashboard", "start"],
  },
  {
    id: "crm",
    title: "CRM",
    href: "/crm",
    icon: Users,
    roles: [
      "fundraising",
      "mobilizers",
      "member_care",
      "events",
      "staff",
      "admin",
    ],
    section: "modules",
    keywords: ["contacts", "donors", "partners", "people", "organizations"],
    items: [
      {
        id: "crm-records",
        title: "Records",
        href: "/crm",
        keywords: ["contacts", "donors", "churches", "organizations"],
      },
      {
        id: "crm-notes",
        title: "Notes",
        href: "/crm/notes",
        keywords: ["contact notes", "memos"],
      },
      {
        id: "crm-relationships",
        title: "Relationships",
        href: "/crm/relationships",
        keywords: ["households", "pledges", "activity"],
      },
    ],
  },
  {
    id: "contributions",
    title: "Contributions",
    href: "/contributions",
    icon: DollarSign,
    roles: ["finance", "events", "admin"],
    section: "modules",
    keywords: [
      "donations",
      "gifts",
      "giving",
      "payments",
      "receipts",
      "refunds",
    ],
  },
  {
    id: "reports",
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["finance", "fundraising", "member_care", "events", "admin"],
    section: "modules",
    keywords: ["analytics", "giving totals", "insights"],
  },
  {
    id: "feed",
    title: "Ministry Updates",
    href: "/feed",
    icon: Megaphone,
    roles: EVERY_ROLE,
    section: "modules",
    keywords: ["feed", "posts", "missionary updates", "news"],
    items: [
      {
        id: "feed-moderation",
        title: "Moderation",
        href: "/feed",
        keywords: ["review posts", "comments"],
      },
      {
        id: "feed-org-updates",
        title: "Org updates",
        href: "/feed/org-updates",
        keywords: ["organization news", "announcements"],
      },
    ],
  },
  {
    id: "care",
    title: "Member Care",
    href: "/care",
    icon: Heart,
    roles: ["member_care", "admin"],
    section: "modules",
    keywords: ["pastoral care", "missionary care", "follow-up", "check-ins"],
    items: [
      {
        id: "care-overview",
        title: "Overview",
        href: "/care",
        keywords: ["care needs", "field staff"],
      },
      {
        id: "care-directory",
        title: "Directory",
        href: "/care/directory",
        keywords: ["members in care", "missionaries"],
      },
      {
        id: "care-settings",
        title: "Rules",
        href: "/care/settings",
        keywords: ["care rules", "contact schedules", "care settings"],
      },
    ],
  },
  {
    id: "mobilize",
    title: "Mobilize",
    href: "/mobilize",
    icon: Rocket,
    roles: ["mobilizers", "admin"],
    section: "modules",
    keywords: ["applicants", "candidates", "recruiting", "pipeline"],
    items: [
      {
        id: "mobilize-pipeline",
        title: "Pipeline",
        href: "/mobilize",
        keywords: ["applicants", "candidates", "applications"],
      },
      {
        id: "mobilize-locations",
        title: "Locations",
        href: "/mobilize/locations",
        keywords: ["map", "fields", "projects"],
      },
    ],
  },
  {
    id: "web-studio",
    title: "Web Studio",
    href: "/web-studio",
    icon: Globe,
    roles: ["fundraising", "staff", "admin"],
    section: "tools",
    keywords: ["website", "cms", "pages"],
  },
  {
    id: "email",
    title: "Email Studio",
    href: "/email",
    icon: Mail,
    roles: ["fundraising", "admin"],
    section: "tools",
    keywords: ["email templates", "donor email", "newsletters"],
  },
  {
    id: "pdf",
    title: "PDF Studio",
    href: "/pdf",
    icon: FileText,
    roles: ["finance", "admin"],
    section: "tools",
    keywords: [
      "documents",
      "receipt templates",
      "giving statements",
      "letters",
    ],
  },
  {
    id: "tasks",
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    roles: EVERY_ROLE,
    section: "tools",
    keywords: ["to-dos", "follow-ups", "calls"],
  },
  {
    id: "support",
    title: "Support Hub",
    href: "/support",
    icon: LifeBuoy,
    roles: ["member_care", "admin"],
    section: "tools",
    keywords: ["help desk", "email support", "conversations", "tickets"],
    items: [
      {
        id: "support-inbox",
        title: "Inbox",
        href: "/support",
        keywords: ["conversations", "email", "shared inbox"],
      },
      // Same order as the Support Hub tabs (SupportSubNav).
      {
        id: "support-tickets",
        title: "Tickets",
        href: "/support/tickets",
        keywords: ["requests", "support tracks", "new ticket"],
      },
      {
        id: "support-reports",
        title: "Reports",
        href: "/support/reports",
        keywords: ["support analytics", "response time"],
      },
      {
        id: "support-settings",
        title: "Settings",
        href: "/support/settings",
        keywords: [
          "assignment rules",
          "business hours",
          "sla policies",
          "signatures",
          "labels",
        ],
      },
    ],
  },
  {
    id: "events",
    title: "Events",
    href: "/events",
    icon: CalendarDays,
    roles: ["events", "admin"],
    section: "tools",
    keywords: ["registrations", "speakers", "sessions", "venues"],
  },
  {
    id: "automations",
    title: "Automations",
    href: "/automations",
    icon: Zap,
    roles: ["mobilizers", "admin"],
    section: "tools",
    keywords: ["workflows", "rules", "background jobs"],
    items: [
      {
        id: "automations-rules",
        title: "Rules",
        href: "/automations",
        keywords: ["automation rules", "triggers"],
      },
      {
        id: "automations-runs",
        title: "Workflow runs",
        href: "/workflows",
        keywords: ["workflows", "run history", "background jobs"],
      },
    ],
  },
  {
    id: "admin",
    title: "Administration",
    href: "/admin",
    icon: Shield,
    roles: ["finance", "admin"],
    section: "system",
    keywords: ["settings", "access", "roles"],
    items: [
      {
        id: "admin-overview",
        title: "Overview",
        href: "/admin",
        keywords: ["administration"],
      },
      // Reads the admin-only users endpoint, so only admins are offered it.
      {
        id: "admin-teams",
        title: "Staff directory",
        href: "/admin/teams",
        roles: ["admin"],
        keywords: ["staff", "users", "roles", "teams", "people"],
      },
      {
        id: "admin-web-studio-editors",
        title: "Web Studio editors",
        href: "/web-studio/collections/cms-users",
        keywords: ["cms users", "website editors"],
      },
      // Same order as the Administration page: people and access, then
      // services (Email delivery, Eve).
      {
        id: "admin-email-delivery",
        title: "Email delivery",
        href: "/settings/integrations/resend",
        keywords: ["resend", "sending domain", "email settings"],
      },
      // The Eve page admits admins only (eve/workspace-access.ts).
      {
        id: "admin-eve",
        title: "Eve",
        href: "/admin/eve",
        roles: ["admin"],
        keywords: ["assistant", "ai"],
      },
    ],
  },
];

export function getNavItemsByRole(role: Role): NavItem[] {
  return navigation
    .filter((item) => item.roles.includes(role))
    .map((item) =>
      item.items?.some((sub) => sub.roles)
        ? {
            ...item,
            items: item.items.filter(
              (sub) => !sub.roles || sub.roles.includes(role),
            ),
          }
        : item,
    );
}

/** The role's destinations grouped by sidebar section, in display order. */
export function getNavSectionsByRole(
  role: Role,
): Array<{ section: NavSection; label: string | null; items: NavItem[] }> {
  const items = getNavItemsByRole(role);
  return (Object.keys(NAV_SECTION_LABELS) as NavSection[])
    .map((section) => ({
      section,
      label: NAV_SECTION_LABELS[section],
      items: items.filter((item) => item.section === section),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * The destination a path belongs to: the longest href that is the path or a
 * parent of it, a module's sub-page winning over the module on a tie. Used
 * for the sidebar's current link and search.
 */
export function findNavDestination(
  pathname: string,
): { item: NavItem; sub: NavSubItem | null } | null {
  const matches = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  let best: { item: NavItem; sub: NavSubItem | null; length: number } | null =
    null;
  for (const item of navigation) {
    if (matches(item.href) && item.href.length > (best?.length ?? -1)) {
      best = { item, sub: null, length: item.href.length };
    }
    for (const sub of item.items ?? []) {
      if (matches(sub.href) && sub.href.length >= (best?.length ?? -1)) {
        best = { item, sub, length: sub.href.length };
      }
    }
  }
  return best ? { item: best.item, sub: best.sub } : null;
}
