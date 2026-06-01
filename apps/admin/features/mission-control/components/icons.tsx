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

import { resolveDynamicIconKebabName } from "./dynamic-icon-name";

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

function isLucideIconComponent(name: string | LucideIcon): name is LucideIcon {
  return typeof name !== "string";
}

export function DynamicIcon({ name, fallback, ...props }: DynamicIconProps) {
  const kebabName = useMemo(() => {
    if (isLucideIconComponent(name)) return null;

    if (!name) return null;

    return resolveDynamicIconKebabName(
      name,
      dynamicIconImports as Record<string, unknown>,
    ) as keyof typeof dynamicIconImports | null;
  }, [name]);
  const lazyIconComponent = kebabName
    ? (LAZY_ICON_MAP.get(kebabName) ?? null)
    : null;

  if (isLucideIconComponent(name)) {
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
        fallback || <div className="size-4 animate-pulse bg-zinc-200 rounded" />
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
  if (isLucideIconComponent(name)) {
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
