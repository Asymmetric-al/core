import { EVERY_ROLE, type Role } from "./navigation";

export interface QuickAction {
  label: string;
  href: string;
  icon?: string;
  /** Only these roles get the shortcut, when narrower than the tile's. */
  roles?: Role[];
}

/** A feature only some of the tile's roles may open. */
export interface RoleFeature {
  label: string;
  roles: Role[];
}

export interface Tile {
  id: string;
  title: string;
  route: string;
  unavailableReason?: string;
  icon: string;
  purpose: string;
  /**
   * Features every role with the tile can open, joined with " · ". Use
   * `insideForRole` to add the role-limited ones in `roleInside`.
   */
  inside: string;
  /** Features listed after `inside`, only to these roles. */
  roleInside?: RoleFeature[];
  quickActions: QuickAction[];
  roles: Role[];
}

export const tiles: Tile[] = [
  {
    id: "web-studio",
    title: "Web Studio",
    route: "/web-studio",
    icon: "Globe",
    purpose:
      "Build and publish the public website, giving pages and ministry updates.",
    inside:
      "Pages · Ministry updates · Giving pages · Project pages · Media · Navigation",
    quickActions: [
      { label: "Open Web Studio", href: "/web-studio", icon: "Globe" },
    ],
    roles: ["fundraising", "staff", "admin"],
  },
  {
    id: "crm",
    title: "CRM",
    route: "/crm",
    icon: "Users",
    purpose:
      "Search and work with people, churches and organizations in one place.",
    inside: "Records · Gift history · Notes · Relationships · Saved views",
    quickActions: [
      { label: "Browse CRM", href: "/crm", icon: "Users" },
      { label: "View notes", href: "/crm/notes", icon: "FileText" },
      {
        label: "View relationships",
        href: "/crm/relationships",
        icon: "Users",
      },
    ],
    roles: [
      "fundraising",
      "mobilizers",
      "member_care",
      "events",
      "staff",
      "admin",
    ],
  },
  {
    id: "contributions",
    title: "Contributions",
    route: "/contributions",
    icon: "DollarSign",
    purpose: "Every gift in one place: review, receipt, refund and correct.",
    inside: "Gift feed · Receipts · Refunds · Corrections · Needs attention",
    quickActions: [
      {
        label: "View contributions",
        href: "/contributions",
        icon: "DollarSign",
      },
    ],
    roles: ["finance", "events", "admin"],
  },
  {
    id: "email",
    title: "Email Studio",
    route: "/email",
    icon: "Mail",
    purpose: "Design email templates with merge tags and send test emails.",
    inside: "Templates · Merge tags · Test sends · HTML export",
    quickActions: [
      { label: "Open Email Studio", href: "/email", icon: "Mail" },
    ],
    roles: ["fundraising", "admin"],
  },
  {
    id: "pdf",
    title: "PDF Studio",
    route: "/pdf",
    icon: "FileText",
    purpose:
      "Design receipts, statements and other documents as reusable templates.",
    inside: "Templates · Page setup · Merge fields · PDF export",
    quickActions: [
      { label: "Open PDF Studio", href: "/pdf", icon: "FileText" },
    ],
    roles: ["finance", "admin"],
  },
  {
    id: "sign",
    title: "Sign Studio",
    route: "/sign",
    unavailableReason: "Sign Studio is not set up yet.",
    icon: "PenTool",
    purpose: "Send documents for signature and keep the signed copies.",
    inside: "Signature requests · Templates · Signed documents",
    quickActions: [],
    roles: ["mobilizers", "events", "admin"],
  },
  {
    id: "mobilize",
    title: "Mobilize",
    route: "/mobilize",
    icon: "Rocket",
    // /mobilize says the applicant pipeline is not connected; Locations is.
    purpose:
      "Manage the locations on the public map. The applicant pipeline is not set up yet.",
    inside: "Locations map",
    quickActions: [
      {
        label: "Manage locations",
        href: "/mobilize/locations",
        icon: "Globe",
      },
    ],
    roles: ["mobilizers", "admin"],
  },
  {
    id: "reports",
    title: "Reports",
    route: "/reports",
    icon: "BarChart3",
    purpose: "See giving by fund, with gift and donor counts.",
    inside: "Fund totals · Gift counts · Donor counts · Summary",
    quickActions: [
      { label: "View reports", href: "/reports", icon: "BarChart3" },
    ],
    roles: ["finance", "fundraising", "member_care", "events", "admin"],
  },
  {
    id: "support",
    title: "Support Hub",
    route: "/support",
    icon: "HelpCircle",
    purpose:
      "Answer donor, applicant and missionary email together in shared inboxes.",
    inside: "Inbox · Assignment · SLAs · Macros · Saved views · Reports",
    quickActions: [
      { label: "Open inbox", href: "/support", icon: "HelpCircle" },
      { label: "Support reports", href: "/support/reports", icon: "BarChart3" },
    ],
    roles: ["member_care", "admin"],
  },
  {
    id: "automations",
    title: "Automations",
    route: "/automations",
    icon: "Zap",
    purpose: "See the rules that run automatically and how they performed.",
    inside: "Rules · Triggers · Run modes · Activity in the last 24 hours",
    quickActions: [
      { label: "Open Automations", href: "/automations", icon: "Zap" },
    ],
    roles: ["mobilizers", "admin"],
  },
  {
    id: "admin",
    title: "Administration",
    route: "/admin",
    icon: "Settings",
    purpose: "Who can use Mission Control and the services it connects to.",
    inside: "Web Studio editors · Email delivery",
    // The staff directory reads the admin-only users endpoint, and the Eve
    // page admits admins only (eve/workspace-access.ts).
    roleInside: [
      { label: "Staff directory", roles: ["admin"] },
      { label: "Eve", roles: ["admin"] },
    ],
    quickActions: [
      { label: "Open administration", href: "/admin", icon: "Settings" },
      {
        label: "View staff directory",
        href: "/admin/teams",
        icon: "Users",
        roles: ["admin"],
      },
      // The Eve page admits admins only (eve/workspace-access.ts).
      { label: "Eve", href: "/admin/eve", icon: "Settings", roles: ["admin"] },
    ],
    roles: ["finance", "admin"],
  },
  {
    id: "care",
    title: "Member Care",
    route: "/care",
    icon: "Heart",
    purpose: "See how field staff are doing and follow up on care needs.",
    inside: "Care dashboard · Directory · Profiles · Care plans · Check-ins",
    quickActions: [
      { label: "Open Member Care", href: "/care", icon: "Heart" },
      { label: "View care directory", href: "/care/directory", icon: "Users" },
    ],
    roles: ["member_care", "admin"],
  },
  {
    id: "events",
    title: "Events",
    route: "/events",
    // /events says it is not connected: no registrations or attendees yet.
    unavailableReason: "Events is not connected yet.",
    icon: "CalendarDays",
    purpose: "Event registrations, venues, speakers and attendees.",
    inside: "Registrations · Venues · Speakers · Attendees",
    quickActions: [],
    roles: ["events", "admin"],
  },
  {
    id: "feed",
    title: "Ministry Updates",
    route: "/feed",
    icon: "Megaphone",
    // Organization updates cannot be published yet (Publish is disabled),
    // so Home offers moderation only.
    purpose: "Review missionary posts and flagged comments.",
    inside: "Moderation · Flagged comments",
    quickActions: [{ label: "Review posts", href: "/feed", icon: "Megaphone" }],
    roles: EVERY_ROLE,
  },
  {
    id: "tasks",
    title: "Tasks",
    route: "/tasks",
    icon: "CheckSquare",
    // The Tasks page is Mission Control's follow-up queue.
    purpose:
      "Follow-ups Mission Control raised, each linked to its gift or donor.",
    inside: "Open follow-ups · Urgency · Linked gifts and donors",
    quickActions: [
      { label: "View follow-ups", href: "/tasks", icon: "CheckSquare" },
    ],
    roles: EVERY_ROLE,
  },
];

export function getTileById(id: string): Tile | undefined {
  return tiles.find((tile) => tile.id === id);
}

export function getTilesByRole(roles: Role[]): Tile[] {
  return tiles.filter((tile) => tile.roles.some((r) => roles.includes(r)));
}

/** The tile's shortcuts this role may follow. */
export function quickActionsForRole(tile: Tile, role: Role): QuickAction[] {
  return tile.quickActions.filter(
    (action) => !action.roles || action.roles.includes(role),
  );
}

const FEATURE_SEPARATOR = " · ";

/** The tile's feature line as this role may follow it. */
export function insideForRole(tile: Tile, role: Role): string {
  const limited = (tile.roleInside ?? [])
    .filter((feature) => feature.roles.includes(role))
    .map((feature) => feature.label);
  return [tile.inside, ...limited].join(FEATURE_SEPARATOR);
}
