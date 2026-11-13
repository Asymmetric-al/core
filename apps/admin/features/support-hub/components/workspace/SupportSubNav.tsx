"use client";

import { NavTabs, NavTabsLink } from "@asym/ui/components/primitives/nav-tabs";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { cn } from "@asym/ui/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

export type SupportSection = "inbox" | "tickets" | "reports" | "settings";

interface SupportSubNavProps {
  section: SupportSection;
}

interface SubNavEntry {
  key: string;
  label: string;
  href: string;
}

const SECTION_LINKS: Array<{
  key: SupportSection;
  label: string;
  href: string;
}> = [
  { key: "inbox", label: "Inbox", href: "/support" },
  { key: "tickets", label: "Tickets", href: "/support/tickets" },
  { key: "reports", label: "Reports", href: "/support/reports/overview" },
  { key: "settings", label: "Settings", href: "/support/settings" },
];

const REPORTS_TABS: SubNavEntry[] = [
  { key: "overview", label: "Overview", href: "/support/reports/overview" },
  { key: "agents", label: "Agents", href: "/support/reports/agents" },
  { key: "teams", label: "Teams", href: "/support/reports/teams" },
  { key: "labels", label: "Labels", href: "/support/reports/labels" },
  // Named by what it charts: "Inbox" is the top tab.
  { key: "inbox", label: "Messages", href: "/support/reports/inbox" },
];

/** Settings pages, grouped the way the side navigation shows them. */
const SETTINGS_GROUPS: Array<{ label: string; tabs: SubNavEntry[] }> = [
  // "Inbox" names only the top tab; here the group is Routing and the page
  // keeps its title, Inbox identity.
  {
    label: "Routing",
    tabs: [
      {
        key: "inbox",
        label: "Inbox identity",
        href: "/support/settings/inbox",
      },
      {
        key: "collaborators",
        label: "Collaborators",
        href: "/support/settings/collaborators",
      },
      {
        key: "assignment",
        label: "Assignment rules",
        href: "/support/settings/assignment",
      },
      {
        key: "business-hours",
        label: "Business hours",
        href: "/support/settings/business-hours",
      },
      { key: "sla", label: "SLA policies", href: "/support/settings/sla" },
    ],
  },
  {
    label: "Replies",
    tabs: [
      {
        key: "signatures",
        label: "Signatures",
        href: "/support/settings/signatures",
      },
      {
        key: "canned-responses",
        label: "Canned responses",
        href: "/support/settings/canned-responses",
      },
      { key: "macros", label: "Macros", href: "/support/settings/macros" },
      { key: "labels", label: "Labels", href: "/support/settings/labels" },
    ],
  },
  {
    label: "Workflow",
    tabs: [
      {
        key: "saved-views",
        label: "Saved views",
        href: "/support/settings/saved-views",
      },
      {
        key: "automations",
        label: "Inbox rules",
        href: "/support/settings/automations",
      },
      {
        key: "notifications",
        label: "Notifications",
        href: "/support/settings/notifications",
      },
    ],
  },
];

const SETTINGS_TABS: SubNavEntry[] = SETTINGS_GROUPS.flatMap(
  (group) => group.tabs,
);

export function supportPageLabel(pathname: string | null): string | undefined {
  return [...SETTINGS_TABS, ...REPORTS_TABS].find(
    (tab) => tab.href === pathname,
  )?.label;
}

/**
 * Sub-nav rendered above each Support Hub workspace page. Top row is the
 * section strip (Inbox / Reports / Settings) as shared line tabs. Reports adds a tab strip;
 * Settings uses `SupportSettingsSideNav` beside the page from md up. Below
 * md both collapse into a `<Select>` so the long settings list stays usable.
 */
export function SupportSubNav({ section }: SupportSubNavProps) {
  const pathname = usePathname() ?? "";
  const tabs =
    section === "reports"
      ? REPORTS_TABS
      : section === "settings"
        ? SETTINGS_TABS
        : [];

  return (
    <div className="flex flex-col gap-3">
      {/* The section strip uses the shared line tabs, like every other
          page's sections; sub-pages below keep the softer button style,
          muted until current so they read a level below the section. */}
      <NavTabs aria-label="Support Hub section">
        {SECTION_LINKS.map((link) => {
          const isActive =
            (link.key === "inbox" && pathname === link.href) ||
            (link.key !== "inbox" &&
              (pathname === `/support/${link.key}` ||
                pathname.startsWith(`/support/${link.key}/`)));
          return (
            <NavTabsLink
              key={link.key}
              href={link.href}
              active={isActive}
              render={<Link href={link.href} />}
            >
              {link.label}
            </NavTabsLink>
          );
        })}
      </NavTabs>

      {tabs.length > 0 ? (
        <>
          {section === "reports" ? (
            <nav
              aria-label="Reports"
              className="hidden md:flex flex-wrap items-center gap-1"
            >
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      buttonVariants({
                        variant: isActive ? "secondary" : "ghost",
                        size: "sm",
                      }),
                      !isActive &&
                        "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
          <MobileTabSelect tabs={tabs} activeHref={pathname} />
        </>
      ) : null}
    </div>
  );
}

/** Grouped settings navigation beside the settings page, from md up. */
export function SupportSettingsSideNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="Settings" className="hidden flex-col gap-4 md:flex">
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-2.5 text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <li key={tab.key}>
                  <Link
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      buttonVariants({
                        variant: isActive ? "secondary" : "ghost",
                        size: "sm",
                      }),
                      "w-full justify-start",
                    )}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

interface MobileTabSelectProps {
  tabs: SubNavEntry[];
  activeHref: string;
}

function MobileTabSelect({ tabs, activeHref }: MobileTabSelectProps) {
  const router = useRouter();
  const [navigating, startNavigation] = React.useTransition();
  const active = tabs.find((tab) => tab.href === activeHref) ?? tabs[0];

  // Client navigation keeps the shell and its state, like the desktop tabs.
  const handleChange = (href: string | null) => {
    if (href === null) return;
    startNavigation(() => router.push(href));
  };

  if (!active) return null;

  return (
    <div className="md:hidden">
      <Select
        items={[...tabs.map((tab) => ({ value: tab.href, label: tab.label }))]}
        value={active.href}
        onValueChange={handleChange}
        disabled={navigating}
      >
        <SelectTrigger aria-label="Support section">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tabs.map((tab) => (
            <SelectItem key={tab.key} value={tab.href}>
              {tab.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
