import {
  BarChart3,
  CreditCard,
  FileText,
  Heart,
  Home,
  Info,
  ListChecks,
  Newspaper,
  Settings,
  UserRoundPen,
  Users,
} from "lucide-react";

export type UserRole = "donor" | "missionary" | "admin";

export interface NavItem {
  title: string;
  href: string;
  icon: typeof Home;
}

export interface NavGroup {
  /** Omitted for the first, unlabelled group. */
  label?: string;
  items: NavItem[];
}

const donorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/donor-dashboard", icon: Home },
  { title: "Ministry Updates", href: "/donor-dashboard/feed", icon: Newspaper },
  { title: "My Giving", href: "/donor-dashboard/pledges", icon: Heart },
  { title: "Wallet", href: "/donor-dashboard/wallet", icon: CreditCard },
  { title: "History", href: "/donor-dashboard/history", icon: FileText },
  { title: "Settings", href: "/donor-dashboard/settings", icon: Settings },
];

/**
 * The missionary workspace, grouped by job: daily work first, then insight,
 * then the public page. Names match each page's title. Settings, help and
 * sign-out live in the account menu.
 */
const missionaryNavGroups: NavGroup[] = [
  {
    items: [
      { title: "Home", href: "/", icon: Home },
      { title: "Partners", href: "/donors", icon: Users },
      { title: "Tasks", href: "/tasks", icon: ListChecks },
      { title: "Updates", href: "/feed", icon: Newspaper },
    ],
  },
  {
    label: "Insights",
    items: [{ title: "Analytics", href: "/analytics", icon: BarChart3 }],
  },
  {
    label: "Your page",
    items: [{ title: "Giving page", href: "/profile", icon: UserRoundPen }],
  },
];

export function getNavGroups(role: UserRole): NavGroup[] {
  return role === "missionary"
    ? missionaryNavGroups
    : [{ items: donorNavItems }];
}

/** Every destination, flat (search and the current-section label). */
export function getNavItems(role: UserRole): NavItem[] {
  const items = getNavGroups(role).flatMap((group) => group.items);
  return role === "missionary"
    ? [
        ...items,
        { title: "Settings", href: "/settings", icon: Settings },
        { title: "About this app", href: "/help/about", icon: Info },
      ]
    : items;
}
