"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { usePreferences } from "@payloadcms/ui";
import { FileText, LayoutDashboard, PanelLeftClose, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { WEB_STUDIO_PREF_KEYS } from "../preferences/keys";

export function StudioNavRail({ className }: { className?: string }) {
  const pathname = usePathname();
  const { getPreference, setPreference } = usePreferences();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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

  const pagesActive =
    pathname === "/web-studio/collections/pages" ||
    pathname.startsWith("/web-studio/collections/pages/");

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
          aria-label={collapsed ? "Expand studio navigation" : "Collapse studio navigation"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        <Button
          variant={pagesActive ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "justify-start gap-2 font-semibold text-xs",
            collapsed && "justify-center px-0",
          )}
          asChild
        >
          <Link href="/web-studio/collections/pages" title="Pages">
            <FileText className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Pages</span> : null}
          </Link>
        </Button>
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
    </aside>
  );
}
