"use client";

import {
  Button,
  ButtonLink,
  buttonVariants,
} from "@asym/ui/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@asym/ui/components/shadcn/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { cn } from "@asym/ui/lib/utils";
import { useAuth, usePreferences } from "@payloadcms/ui";
import {
  Building2,
  ChevronLeft,
  LayoutGrid,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  Users,
  UsersRound,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import {
  getEnabledWebStudioCollections,
  getGroupedWebStudioCollections,
} from "../collections/config";
import { WEB_STUDIO_PREF_KEYS } from "../preferences/keys";
import { Link, usePathname } from "../routing";
import { readableAdminCollections } from "./admin-collections";

import type { WebStudioAdminCollectionSlug } from "./admin-collections";
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
  onNavigate?: () => void;
};

type NavRailGroup = {
  id: string;
  label: string | null;
  links: Array<Omit<NavRailLinkProps, "collapsed" | "onNavigate">>;
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

function useStudioNavRailState() {
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
        if (cancelled) return;
        if (pref && typeof pref.collapsed === "boolean") {
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

  const groupedCollections = useMemo(() => {
    void webStudioNativeRolloutKey;
    return getGroupedWebStudioCollections();
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
            .slice(0, 5),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabledCollections, getPreference, recentDocsPreferenceKeys]);

  return {
    collapsed,
    groupedCollections,
    hydrated,
    persistCollapsed,
    recentDocs,
  };
}

const ADMIN_ICONS: Record<
  WebStudioAdminCollectionSlug,
  ComponentType<{ className?: string }>
> = {
  "cms-users": UsersRound,
  tenants: Building2,
};

function isWithin(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function buildNavRailGroups(
  groupedCollections: ReturnType<typeof getGroupedWebStudioCollections>,
  adminLinks: ReturnType<typeof readableAdminCollections>,
  pathname: string,
): NavRailGroup[] {
  const admin: NavRailGroup[] =
    adminLinks.length > 0
      ? [
          {
            id: "admin",
            label: "Administration",
            links: adminLinks.map((link) => ({
              active: isWithin(pathname, link.href),
              href: link.href,
              icon: ADMIN_ICONS[link.slug],
              title: link.title,
            })),
          },
        ]
      : [];
  return [
    {
      id: "studio",
      label: null,
      links: [
        {
          active: pathname.replace(/\/+$/, "") === "/web-studio",
          href: "/web-studio",
          icon: LayoutGrid,
          title: "Overview",
        },
        {
          active: pathname.startsWith("/web-studio/templates"),
          href: "/web-studio/templates",
          icon: Sparkles,
          title: "Template gallery",
        },
        {
          active: pathname.startsWith("/web-studio/missionaries"),
          href: "/web-studio/missionaries",
          icon: Users,
          title: "Missionaries",
        },
      ],
    },
    ...groupedCollections.map((group) => ({
      id: group.id,
      label: group.label,
      links: group.collections.map((collection) => ({
        active: isWithin(pathname, collection.listPath),
        href: collection.listPath,
        icon: collection.icon,
        title: collection.titlePlural,
      })),
    })),
    ...admin,
  ];
}

function StudioNavRailHeader({
  collapsed,
  persistCollapsed,
}: {
  collapsed: boolean;
  persistCollapsed: (next: boolean) => Promise<void>;
}) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-1 px-2",
        collapsed ? "justify-center" : "justify-between",
      )}
    >
      {!collapsed ? (
        <span className="px-2 text-xs font-medium text-muted-foreground">
          Web Studio
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
              size="icon-sm"
              onClick={() => void persistCollapsed(!collapsed)}
              aria-label={
                collapsed
                  ? "Expand studio navigation"
                  : "Collapse studio navigation"
              }
            >
              {collapsed ? (
                <PanelLeft aria-hidden="true" />
              ) : (
                <PanelLeftClose aria-hidden="true" />
              )}
            </Button>
          }
        />
        <TooltipContent side="right">
          {collapsed ? "Expand navigation" : "Collapse navigation"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * A document opened before it had a title was saved to recents under its ID;
 * the lists and the Studio home call those "Untitled (ID)".
 */
function recentDocLabel(doc: RecentDocLink): string {
  return doc.title === doc.id ? `Untitled (${doc.id})` : doc.title;
}

function StudioNavRailRecentDocs({
  recentDocs,
  onNavigate,
}: {
  recentDocs: RecentDocLink[];
  onNavigate?: () => void;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-1">
      <p
        id={labelId}
        className="px-4 text-xs font-medium text-muted-foreground"
      >
        Recent
      </p>
      <ul aria-labelledby={labelId} className="flex flex-col gap-0.5 px-2">
        {recentDocs.map((doc) => (
          <li key={`${doc.id}-${doc.href}`}>
            <Link
              href={doc.href}
              onClick={onNavigate}
              title={recentDocLabel(doc)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full justify-start font-normal text-muted-foreground",
              )}
            >
              <span className="truncate">{recentDocLabel(doc)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StudioNavRail({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    collapsed,
    groupedCollections,
    hydrated,
    persistCollapsed,
    recentDocs,
  } = useStudioNavRailState();
  // Payload's sanitized permissions: stock admin lists show for anyone who
  // may read them, tenant-scoped or not, as in Payload's own sidebar.
  const { permissions } = useAuth();
  const groups = buildNavRailGroups(
    groupedCollections,
    readableAdminCollections(permissions),
    pathname,
  );

  return (
    <>
      <div className="border-b bg-background px-2 py-2 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="sm">
                <Menu aria-hidden="true" />
                Studio navigation
              </Button>
            }
            aria-label="Open studio navigation"
          />
          <SheetContent side="left">
            <SheetHeader className="shrink-0">
              <SheetTitle>Web Studio navigation</SheetTitle>
              <SheetDescription>
                Browse your content and recent documents.
              </SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
              <StudioNavRailSections
                collapsed={false}
                groups={groups}
                onNavigate={() => setMobileOpen(false)}
              />
              {recentDocs.length > 0 ? (
                <StudioNavRailRecentDocs
                  recentDocs={recentDocs}
                  onNavigate={() => setMobileOpen(false)}
                />
              ) : null}
              {/* The top bar drops its Mission Control link on phones. */}
              <div className="border-t px-2 pt-4">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "w-full justify-start font-normal text-muted-foreground",
                  )}
                >
                  <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
                  Mission Control
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <aside
        className={cn(
          "hidden shrink-0 border-r bg-muted/30 md:block",
          collapsed ? "w-14" : "w-56",
          className,
        )}
        data-collapsed={collapsed ? "true" : "false"}
        data-hydrated={hydrated ? "true" : "false"}
      >
        <div className="sticky top-14 flex flex-col gap-4 py-2">
          <TooltipProvider delay={200}>
            <StudioNavRailHeader
              collapsed={collapsed}
              persistCollapsed={persistCollapsed}
            />
            <StudioNavRailSections collapsed={collapsed} groups={groups} />
          </TooltipProvider>
          {!collapsed && recentDocs.length > 0 ? (
            <StudioNavRailRecentDocs recentDocs={recentDocs} />
          ) : null}
        </div>
      </aside>
    </>
  );
}

function StudioNavRailSections({
  collapsed,
  groups,
  onNavigate,
}: {
  collapsed: boolean;
  groups: NavRailGroup[];
  onNavigate?: () => void;
}) {
  const idPrefix = useId();
  return (
    <nav aria-label="Studio sections" className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          {group.label && !collapsed ? (
            <p
              id={`${idPrefix}-${group.id}`}
              className="px-4 text-xs font-medium text-muted-foreground"
            >
              {group.label}
            </p>
          ) : null}
          <ul
            aria-labelledby={
              group.label && !collapsed ? `${idPrefix}-${group.id}` : undefined
            }
            aria-label={collapsed ? (group.label ?? undefined) : undefined}
            className={cn(
              "flex flex-col gap-0.5 px-2",
              collapsed && "items-center",
            )}
          >
            {group.links.map((link) => (
              <li key={link.href}>
                <NavRailLink
                  {...link}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavRailLink({
  active = false,
  collapsed,
  href,
  icon: Icon,
  title,
  onNavigate,
}: NavRailLinkProps) {
  if (!collapsed) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "w-full justify-start",
          active
            ? "bg-muted font-medium text-foreground"
            : "font-normal text-muted-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{title}</span>
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ButtonLink
            variant={active ? "secondary" : "ghost"}
            size="icon-sm"
            render={
              <Link
                href={href}
                onClick={onNavigate}
                aria-label={title}
                aria-current={active ? "page" : undefined}
              />
            }
          >
            <Icon aria-hidden="true" />
          </ButtonLink>
        }
      />
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );
}
