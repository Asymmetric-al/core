"use client";

import React, { lazy, Suspense, useMemo } from "react";
import {
  type LucideProps,
  type LucideIcon,
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
  Edit,
  UserPlus,
  Phone,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  PenSquare,
  Copy,
  XCircle,
  Receipt,
  Calendar,
  FilePlus,
  ClipboardList,
  FileSearch,
  ArrowUp,
  Send,
  RefreshCw,
  AlertCircle,
  Key,
  Download,
  CheckSquare,
  ClipboardPlus,
  FileHeart,
  DoorOpen,
  Printer,
} from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

// Helper to convert PascalCase to kebab-case for lucide-react/dynamicIconImports
function pascalToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

interface DynamicIconProps extends Omit<LucideProps, "ref" | "name"> {
  name: string | LucideIcon;
  fallback?: React.ReactNode;
}

export function DynamicIcon({ name, fallback, ...props }: DynamicIconProps) {
  // If name is already an icon component, render it directly
  if (typeof name === "function") {
    const IconComponent = name;
    return <IconComponent {...props} />;
  }

  const kebabName = useMemo(() => {
    if (!name || typeof name !== "string") return null;
    // If it's already kebab-case or a valid key in dynamicIconImports, use it
    if (name in dynamicIconImports)
      return name as keyof typeof dynamicIconImports;
    // Otherwise try converting from PascalCase
    const converted = pascalToKebab(name);
    if (converted in dynamicIconImports)
      return converted as keyof typeof dynamicIconImports;
    return null;
  }, [name]);

  if (!kebabName) {
    return <Settings {...props} />;
  }

  const LucideIcon = lazy(dynamicIconImports[kebabName]);

  return (
    <Suspense
      fallback={
        fallback || (
          <div className="w-4 h-4 animate-pulse bg-slate-200 rounded" />
        )
      }
    >
      <LucideIcon {...props} />
    </Suspense>
  );
}

// Icon mapping function
const ICON_MAP: Record<string, LucideIcon> = {
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
  Edit,
  UserPlus,
  Phone,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  PenSquare,
  Copy,
  XCircle,
  Receipt,
  Calendar,
  FilePlus,
  ClipboardList,
  FileSearch,
  ArrowUp,
  Send,
  RefreshCw,
  AlertCircle,
  Key,
  Download,
  CheckSquare,
  ClipboardPlus,
  FileHeart,
  DoorOpen,
  Printer,
};

export function getIcon(iconName: string | LucideIcon): LucideIcon {
  // If it's already an icon component, return it
  if (typeof iconName === "function") {
    return iconName;
  }
  // Otherwise look it up in the map
  return ICON_MAP[iconName] || Settings;
}

export {
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
  Edit,
  UserPlus,
  Phone,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  PenSquare,
  Copy,
  XCircle,
  Receipt,
  Calendar,
  FilePlus,
  ClipboardList,
  FileSearch,
  ArrowUp,
  Send,
  RefreshCw,
  AlertCircle,
  Key,
  Download,
  CheckSquare,
  ClipboardPlus,
  FileHeart,
  DoorOpen,
  Printer,
};
