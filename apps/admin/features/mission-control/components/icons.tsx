"use client";

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
import dynamicIconImports from "lucide-react/dynamicIconImports";
import React, { lazy, Suspense, useMemo } from "react";

// Helper to convert PascalCase to kebab-case for lucide-react/dynamicIconImports
function pascalToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export interface DynamicIconProps extends Omit<LucideProps, "ref" | "name"> {
  name: string | LucideIcon;
  fallback?: React.ReactNode;
}

type DynamicImportName = keyof typeof dynamicIconImports;
const LAZY_ICON_MAP = new Map<
  DynamicImportName,
  React.LazyExoticComponent<React.ComponentType<LucideProps>>
>(
  (Object.keys(dynamicIconImports) as DynamicImportName[]).map((iconName) => [
    iconName,
    lazy(dynamicIconImports[iconName]),
  ]),
);

export function DynamicIcon({ name, fallback, ...props }: DynamicIconProps) {
  const kebabName = useMemo(() => {
    if (typeof name === "function") return null;

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
  const lazyIconComponent = kebabName
    ? (LAZY_ICON_MAP.get(kebabName) ?? null)
    : null;

  // If name is already an icon component, render it directly
  if (typeof name === "function") {
    const IconComponent = name;
    return <IconComponent {...props} />;
  }

  if (!lazyIconComponent) {
    return <Settings {...props} />;
  }

  const lazyIconElement = React.createElement(lazyIconComponent, props);

  return (
    <Suspense
      fallback={
        fallback || (
          <div className="w-4 h-4 animate-pulse bg-slate-200 rounded" />
        )
      }
    >
      {lazyIconElement}
    </Suspense>
  );
}

// Map icon names to components
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
  if (typeof name === "function") {
    return name;
  }

  return iconMap[name] || Settings;
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
};
