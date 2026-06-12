"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@asym/ui/components/shadcn/breadcrumb";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { useAuth } from "@payloadcms/ui";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";

import { getEnabledWebStudioCollections } from "../collections/config";

type StudioTopBarProps = {
  sectionLabel?: string;
  currentLabel?: string;
  className?: string;
};

export function StudioTopBar({
  sectionLabel,
  currentLabel,
  className,
}: StudioTopBarProps) {
  const { user } = useAuth();
  const enabledCollections = getEnabledWebStudioCollections();
  const sectionHref =
    enabledCollections.find((entry) => entry.sectionLabel === sectionLabel)
      ?.listPath ?? "/web-studio";
  const display =
    user && typeof user === "object" && "email" in user && user.email
      ? String(user.email)
      : "Signed in";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-border border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5",
          )}
        >
          <ChevronLeft className="size-4" />
          <span className="font-semibold text-xs uppercase tracking-wide">
            Mission Control
          </span>
        </Link>

        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-wrap">
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/web-studio" />}>
                Web Studio
              </BreadcrumbLink>
            </BreadcrumbItem>
            {sectionLabel ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {currentLabel ? (
                    <BreadcrumbLink render={<Link href={sectionHref} />}>
                      {sectionLabel}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            ) : null}
            {currentLabel ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[min(40vw,20rem)] truncate">
                    {currentLabel}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : null}
          </BreadcrumbList>
        </Breadcrumb>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden gap-2 sm:inline-flex"
          disabled
          title="Command palette (coming soon)"
        >
          <Search className="size-4" />
          <span className="font-semibold text-[10px] uppercase tracking-wider">
            Search
          </span>
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden max-w-[12rem] truncate text-muted-foreground text-xs sm:inline">
            {display}
          </span>
        </div>
      </div>
    </header>
  );
}
