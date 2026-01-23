"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@asym/ui/components/shadcn/breadcrumb";
import { cn } from "@asym/ui/lib/utils";

interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface DashboardFooterProps {
  className?: string;
  brandName?: string;
  brandHref?: string;
  tagline?: string;
  breadcrumbs?: BreadcrumbItemData[];
  showBreadcrumbs?: boolean;
  labelMap?: Record<string, string>;
}

const defaultLabelMap: Record<string, string> = {
  mc: "Mission Control",
};

const CURRENT_YEAR = 2025;

function generateBreadcrumbsFromPath(
  pathname: string,
  labelMap: Record<string, string> = {},
): BreadcrumbItemData[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItemData[] = [];
  const mergedLabelMap = { ...defaultLabelMap, ...labelMap };

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;

    currentPath += `/${segment}`;

    const label =
      mergedLabelMap[segment.toLowerCase()] ||
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    breadcrumbs.push({
      label,
      href: i < segments.length - 1 ? currentPath : undefined,
    });
  }

  return breadcrumbs;
}

export function DashboardFooter({
  className,
  brandName = "Asym",
  brandHref = "/",
  tagline = "Ministry Support, Simplified",
  breadcrumbs: customBreadcrumbs,
  showBreadcrumbs = true,
  labelMap,
}: DashboardFooterProps) {
  const pathname = usePathname();
  const breadcrumbs =
    customBreadcrumbs || generateBreadcrumbsFromPath(pathname, labelMap);

  return (
    <footer
      className={cn(
        "bg-card/80 backdrop-blur-sm sticky bottom-0 z-40 flex items-center justify-between border-t border-border/50 px-4 py-2.5 sm:px-6",
        "max-md:flex-col max-md:gap-1.5 md:gap-4",
        className,
      )}
    >
      <p className="text-muted-foreground text-xs leading-relaxed">
        © {CURRENT_YEAR}{" "}
        <Link
          href={brandHref}
          className="text-foreground/80 font-medium hover:text-primary transition-colors"
        >
          {brandName}
        </Link>
        {tagline && (
          <span className="text-muted-foreground/70"> · {tagline}</span>
        )}
      </p>
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList className="gap-1 sm:gap-1.5 text-xs">
            {breadcrumbs.map((item, index) => (
              <Fragment key={index}>
                <BreadcrumbItem className="gap-1">
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href}
                        className="text-muted-foreground/70 hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-foreground/80 font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="[&>svg]:size-3 text-muted-foreground/50" />
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </footer>
  );
}
