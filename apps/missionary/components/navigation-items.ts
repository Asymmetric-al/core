import {
  Home,
  Users,
  Heart,
  Settings,
  BarChart3,
  UserCircle,
  CreditCard,
  FileText,
  Newspaper,
  CheckSquare,
} from "lucide-react";

export type UserRole = "donor" | "missionary" | "admin";

interface NavItem {
  title: string;
  href: string;
  icon: typeof Home;
}

const donorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/donor-dashboard", icon: Home },
  { title: "Ministry Updates", href: "/donor-dashboard/feed", icon: Newspaper },
  { title: "My Giving", href: "/donor-dashboard/pledges", icon: Heart },
  { title: "Wallet", href: "/donor-dashboard/wallet", icon: CreditCard },
  { title: "History", href: "/donor-dashboard/history", icon: FileText },
  { title: "Settings", href: "/donor-dashboard/settings", icon: Settings },
];

const missionaryNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Donors", href: "/donors", icon: Users },
  {
    title: "Ministry Updates",
    href: "/feed",
    icon: Newspaper,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Profile", href: "/profile", icon: UserCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "donor":
      return donorNavItems;
    case "missionary":
      return missionaryNavItems;
    default:
      return donorNavItems;
  }
}
