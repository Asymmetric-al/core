"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { usePreferences } from "@payloadcms/ui";
import {
  Clock3,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getEnabledWebStudioCollections } from "../collections/config";
import { WEB_STUDIO_PREF_KEYS } from "../preferences/keys";

export function StudioNavRail({ className }: { className?: string }) {
  const pathname = usePathname();
  const { getPreference, setPreference } = usePreferences();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [recentDocs, setRecentDocs] = useState<
    Array<{ href: string; id: string; title: string; updatedAt?: string }>
  >([]);

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

  const enabledCollections = useMemo(() => getEnabledWebStudioCollections(), []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const entries = await Promise.all(
        enabledCollections.map(async (collection) => {
          try {
            return (
              (await getPreference<
                Array<{
                  href: string;
                  id: string;
                  title: string;
                  updatedAt?: string;
                }>
              >(collection.preferences.recentDocs)) ?? []
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
            .sort((a, b) =>
              (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
            )
            .slice(0, 6),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabledCollections, getPreference]);

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
      <div className="flex items-center justify-between gap-1 border-border border-b p-2">
        {!collapsed ? (
          <span className="px-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">
            Studio
          </span>
        ) : (
          <span className="sr-only">Web Studio navigation</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => void persistCollapsed(!collapsed)}
          aria-pressed={collapsed}
          aria-label={
            collapsed
              ? "Expand studio navigation"
              : "Collapse studio navigation"
          }
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {enabledCollections.map((collection) => {
          const isActive =
            pathname === collection.listPath ||
            pathname.startsWith(`${collection.listPath}/`);
          const Icon = collection.icon;

          return (
            <Button
              key={collection.slug}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "justify-start gap-2 font-semibold text-xs",
                collapsed && "justify-center px-0",
              )}
              asChild
            >
              <Link href={collection.listPath} title={collection.titlePlural}>
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span>{collection.titlePlural}</span> : null}
              </Link>
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "justify-start gap-2 font-semibold text-xs",
            collapsed && "justify-center px-0",
          )}
          asChild
        >
          <Link href="/" title="Mission Control home">
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Dashboard</span> : null}
          </Link>
        </Button>
      </nav>
      {!collapsed && recentDocs.length > 0 ? (
        <div className="border-border border-t px-2 py-3">
          <div className="mb-2 flex items-center gap-2 px-2 text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
            <Clock3 className="h-3.5 w-3.5" />
            Recent
          </div>
          <div className="flex flex-col gap-1">
            {recentDocs.map((doc) => (
              <Button
                key={`${doc.id}-${doc.href}`}
                variant="ghost"
                size="sm"
                className="justify-start overflow-hidden text-left text-xs"
                asChild
              >
                <Link href={doc.href} title={doc.title}>
                  <span className="truncate">{doc.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
