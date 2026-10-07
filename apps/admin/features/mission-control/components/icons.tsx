"use client";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  type LucideIcon,
  type LucideProps,
  Settings,
  Globe,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import React, { lazy, Suspense, useMemo } from "react";

import { resolveDynamicIconKebabName } from "./dynamic-icon-name";
import { isLucideIconComponent } from "./icon-map";

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
    if (isLucideIconComponent(name)) return null;

    if (!name) return null;

    return resolveDynamicIconKebabName(name, dynamicIconImports);
  }, [name]);
  const lazyIconComponent = kebabName
    ? (LAZY_ICON_MAP.get(kebabName) ?? null)
    : null;

  if (isLucideIconComponent(name)) {
    const IconComponent = name;
    return <IconComponent {...props} />;
  }

  if (!lazyIconComponent) {
    if (process.env.NODE_ENV === "development" && typeof name === "string") {
      console.warn(`[DynamicIcon] Unknown icon name: "${name}"`);
    }
    return <Settings {...props} />;
  }

  const lazyIconElement = React.createElement(lazyIconComponent, props);

  return (
    <Suspense fallback={fallback || <Skeleton className="size-4 rounded" />}>
      {lazyIconElement}
    </Suspense>
  );
}

export { ChevronRight, ArrowRight, Globe, Settings };
