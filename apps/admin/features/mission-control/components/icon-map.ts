import {
  type LucideIcon,
  type LucideProps,
  Settings,
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
  Heart,
  CalendarDays,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Menu,
  Bell,
  Command,
  LogOut,
  Building2,
  ChevronsUpDown,
  Check,
  Search,
  User,
  ArrowRight,
} from "lucide-react";

import type React from "react";

export function isLucideIconComponent(
  name: string | LucideIcon,
): name is LucideIcon {
  if (name == null) return false;
  return typeof name !== "string";
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
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
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Menu,
  Bell,
  Command,
  LogOut,
  Building2,
  ChevronsUpDown,
  Check,
  Search,
  User,
  ArrowRight,
};

export function getIcon(
  name: string | LucideIcon,
): React.ComponentType<LucideProps> {
  if (isLucideIconComponent(name)) {
    return name;
  }

  return iconMap[name] || Settings;
}
