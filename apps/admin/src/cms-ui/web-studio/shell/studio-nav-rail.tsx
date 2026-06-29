"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { cn } from "@asym/ui/lib/utils";
import { usePreferences } from "@payloadcms/ui";
import {
  Clock3,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getEnabledWebStudioCollections } from "../collections/config";
import { WEB_STUDIO_PREF_KEYS } from "../preferences/keys";
import { Link, usePathname } from "../routing";

import type { ComponentType } from "react";

type RecentDocLink = {
  href: string;
  id: string;
  title: string;
  updatedAt?: string;
};

type NavRailLinkProps = {
  active?: boolean;
  collapsed: boolean;
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
};

function isRecentDocLink(value: unknown): value is RecentDocLink {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RecentDocLink>;
  return (
    typeof candidate.href === "string" &&
    candidate.href.length > 0 &&
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.length > 0
  );
}

export function StudioNavRail({ className }: { className?: string }) {
  const pathname = usePathname();
  const { getPreference, setPreference } = usePreferences();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [recentDocs, setRecentDocs] = useState<RecentDocLink[]>([]);

  /** Snapshot of collection rollout flags — stable string when env is unchanged (avoids new array ref every render). */
  const webStudioNativeRolloutKey = [
    process.env.CMS_WEB_STUDIO_NATIVE_MEDIA ?? "",
    process.env.CMS_WEB_STUDIO_NATIVE_MISSIONARY_PROFILES ?? "",
    process.env.CMS_WEB_STUDIO_NATIVE_MINISTRY_UPDATES ?? "",
    process.env.CMS_WEB_STUDIO_NATIVE_NAVIGATION ?? "",
    process.env.CMS_WEB_STUDIO_NATIVE_PAGES ?? "",
    process.env.CMS_WEB_STUDIO_NATIVE_PAGE_TEMPLATES ?? "",
    process.env.CMS_WEB_STUDIO_NATIVE_MISSIONARY_GIVING_PAGES ?? "",
    process.env.CMS_WEB_STUDIO_NATIVE_PROJECT_PAGES ?? "",
  ].join("|");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const pref = await getPreference<{ collapsed?: boolean }>(
          WEB_STUDIO_PREF_KEYS.navCollapsed,
        );
        if (!cancelled && pref && typeof pref.collapsed === "boolean") {
          setCollapsed(pref.collapsed);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getPreference]);

  const persistCollapsed = async (next: boolean) => {
    setCollapsed(next);
    try {
      await setPreference(WEB_STUDIO_PREF_KEYS.navCollapsed, {
        collapsed: next,
      });
    } catch {
      /* ignore */
    }
  };

  const enabledCollections = useMemo(() => {
    void webStudioNativeRolloutKey;
    return getEnabledWebStudioCollections();
  }, [webStudioNativeRolloutKey]);

  const recentDocsPreferenceKeys = useMemo(
    () => enabledCollections.map((c) => c.preferences.recentDocs).join("\0"),
    [enabledCollections],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const entries = await Promise.all(
        enabledCollections.map(async (collection) => {
          try {
            return (
              (await getPreference<unknown[]>(
                collection.preferences.recentDocs,
              )) ?? []
            );
          } catch {
            return [];
          }
        }),
      );

      if (!cancelled) {
        setRecentDocs(
          entries
            .flat()
            .filter(isRecentDocLink)
            .sort((a: { updatedAt?: string }, b: { updatedAt?: string }) =>
              (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
            )
            .slice(0, 6),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabledCollections, getPreference, recentDocsPreferenceKeys]);

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-border border-r bg-card/40 md:flex md:flex-col",
        collapsed ? "w-14" : "w-52",
        className,
      )}
      data-collapsed={collapsed ? "true" : "false"}
      data-hydrated={hydrated ? "true" : "false"}
    >
      <TooltipProvider delay={200}>
        <div className="flex items-center justify-between gap-1 border-border border-b p-2">
          {!collapsed ? (
            <span className="px-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">
              Studio
            </span>
          ) : (
            <span className="sr-only">Web Studio navigation</span>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => void persistCollapsed(!collapsed)}
                  aria-pressed={collapsed}
                  aria-label={
                    collapsed
                      ? "Expand studio navigation"
                      : "Collapse studio navigation"
                  }
                />
              }
            >
              {collapsed ? (
                <PanelLeft className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expand navigation" : "Collapse navigation"}
            </TooltipContent>
          </Tooltip>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          <NavRailLink
            active={pathname.startsWith("/web-studio/templates")}
            collapsed={collapsed}
            href="/web-studio/templates"
            icon={Sparkles}
            title="Templates"
          />
          <NavRailLink
            active={pathname.startsWith("/web-studio/missionaries")}
            collapsed={collapsed}
            href="/web-studio/missionaries"
            icon={Users}
            title="Missionaries"
          />
          {enabledCollections.map((collection) => {
            const isActive =
              pathname === collection.listPath ||
              pathname.startsWith(`${collection.listPath}/`);

            return (
              <NavRailLink
                key={collection.slug}
                active={isActive}
                collapsed={collapsed}
                href={collection.listPath}
                icon={collection.icon}
                title={collection.titlePlural}
              />
            );
          })}
          <NavRailLink
            collapsed={collapsed}
            href="/"
            icon={LayoutDashboard}
            title="Dashboard"
          />
        </nav>
      </TooltipProvider>
      {!collapsed && recentDocs.length > 0 ? (
        <div className="border-border border-t px-2 py-3">
          <div className="mb-2 flex items-center gap-2 px-2 text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
            <Clock3 className="size-3.5" />
            Recent
          </div>
          <div className="flex flex-col gap-1">
            {recentDocs.map((doc) => (
              <Button
                key={`${doc.id}-${doc.href}`}
                variant="ghost"
                size="sm"
                className="justify-start overflow-hidden text-left text-xs"
                render={<Link href={doc.href} title={doc.title} />}
              >
                <span className="truncate">{doc.title}</span>
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function NavRailLink({
  active = false,
  collapsed,
  href,
  icon: Icon,
  title,
}: NavRailLinkProps) {
  if (!collapsed) {
    return (
      <Button
        variant={active ? "secondary" : "ghost"}
        size="sm"
        className="justify-start gap-2 font-semibold text-xs"
        render={<Link href={href} title={title} />}
      >
        <Icon className="size-4 shrink-0" />
        <span>{title}</span>
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={active ? "secondary" : "ghost"}
            size="sm"
            className={cn("justify-center gap-2 px-0 font-semibold text-xs")}
          />
        }
      >
        <Icon className="size-4 shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );
}
