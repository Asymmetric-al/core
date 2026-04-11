import {
  LayoutDashboard,
  Globe,
  Users,
  DollarSign,
  Mail,
  FileText,
  PenTool,
  Rocket,
  BarChart3,
  HelpCircle,
  Zap,
  Settings,
  Heart,
  CalendarDays,
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

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  section: "main" | "tools";
}

export const navigation: NavItem[] = [
  {
    id: "home",
    title: "Mission Control",
    href: "/",
    icon: LayoutDashboard,
    roles: [
      "finance",
      "fundraising",
      "mobilizers",
      "member_care",
      "events",
      "staff",
      "admin",
    ],
    section: "main",
  },
  {
    id: "web-studio",
    title: "Web Studio",
    href: "/web-studio",
    icon: Globe,
    roles: ["fundraising", "staff", "admin"],
    section: "main",
  },
  {
    id: "crm",
    title: "People & Churches",
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
    section: "main",
  },
  {
    id: "contributions",
    title: "Contributions",
    href: "/contributions",
    icon: DollarSign,
    roles: ["finance", "events", "admin"],
    section: "main",
  },
  {
    id: "email",
    title: "Email Studio",
    href: "/email",
    icon: Mail,
    roles: ["fundraising", "admin"],
    section: "main",
  },
  {
    id: "pdf",
    title: "PDF Studio",
    href: "/pdf",
    icon: FileText,
    roles: ["finance", "admin"],
    section: "main",
  },
  {
    id: "sign",
    title: "Sign Studio",
    href: "/sign",
    icon: PenTool,
    roles: ["mobilizers", "events", "admin"],
    section: "main",
  },
  {
    id: "mobilize",
    title: "Mobilize",
    href: "/mobilize",
    icon: Rocket,
    roles: ["mobilizers", "admin"],
    section: "main",
  },
  {
    id: "support",
    title: "Support Hub",
    href: "/support",
    icon: HelpCircle,
    roles: ["member_care", "admin"],
    section: "main",
  },
  {
    id: "care",
    title: "Member Care",
    href: "/care",
    icon: Heart,
    roles: ["member_care", "admin"],
    section: "main",
  },
  {
    id: "events",
    title: "Event Hub",
    href: "/events",
    icon: CalendarDays,
    roles: ["events", "admin"],
    section: "main",
  },
  {
    id: "reports",
    title: "Report Studio",
    href: "/reports",
    icon: BarChart3,
    roles: ["finance", "fundraising", "member_care", "events", "admin"],
    section: "tools",
  },
  {
    id: "automations",
    title: "Automations",
    href: "/automations",
    icon: Zap,
    roles: ["mobilizers", "admin"],
    section: "tools",
  },
  {
    id: "admin",
    title: "Admin",
    href: "/admin",
    icon: Settings,
    roles: ["finance", "admin"],
    section: "tools",
  },
];

export function getNavItemsByRole(role: Role): NavItem[] {
  return navigation.filter((item) => item.roles.includes(role));
}

export function getMainNavItems(role: Role): NavItem[] {
  return navigation.filter(
    (item) => item.section === "main" && item.roles.includes(role),
  );
}

export function getToolsNavItems(role: Role): NavItem[] {
  return navigation.filter(
    (item) => item.section === "tools" && item.roles.includes(role),
  );
}
