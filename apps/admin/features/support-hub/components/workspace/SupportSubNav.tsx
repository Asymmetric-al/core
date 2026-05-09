"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { cn } from "@asym/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

export type SupportSection = "inbox" | "reports" | "settings";

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
  { key: "reports", label: "Reports", href: "/support/reports" },
  { key: "settings", label: "Settings", href: "/support/settings" },
];

const REPORTS_TABS: SubNavEntry[] = [
  { key: "overview", label: "Overview", href: "/support/reports/overview" },
  { key: "agents", label: "Agents", href: "/support/reports/agents" },
  { key: "teams", label: "Teams", href: "/support/reports/teams" },
  { key: "labels", label: "Labels", href: "/support/reports/labels" },
  { key: "inbox", label: "Inbox", href: "/support/reports/inbox" },
];

const SETTINGS_TABS: SubNavEntry[] = [
  { key: "inbox", label: "Inbox", href: "/support/settings/inbox" },
  {
    key: "collaborators",
    label: "Collaborators",
    href: "/support/settings/collaborators",
  },
  {
    key: "assignment",
    label: "Assignment",
    href: "/support/settings/assignment",
  },
  {
    key: "business-hours",
    label: "Business hours",
    href: "/support/settings/business-hours",
  },
  { key: "sla", label: "SLA", href: "/support/settings/sla" },
  {
    key: "signatures",
    label: "Signatures",
    href: "/support/settings/signatures",
  },
  { key: "labels", label: "Labels", href: "/support/settings/labels" },
  { key: "macros", label: "Macros", href: "/support/settings/macros" },
  {
    key: "canned-responses",
    label: "Canned responses",
    href: "/support/settings/canned-responses",
  },
  {
    key: "saved-views",
    label: "Saved views",
    href: "/support/settings/saved-views",
  },
  {
    key: "automations",
    label: "Automations",
    href: "/support/settings/automations",
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/support/settings/notifications",
  },
];

/**
 * Two-row sub-nav rendered above each Support Hub workspace page. Top row is
 * the section pill strip (Inbox / Reports / Settings). Second row is the
 * sub-section tab strip for the active section; on small viewports it
 * collapses into a `<Select>` dropdown so the long settings list stays usable.
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
      <nav
        aria-label="Support Hub section"
        className="flex items-center gap-1 overflow-x-auto"
      >
        {SECTION_LINKS.map((link) => {
          const isActive =
            (link.key === "inbox" && pathname === link.href) ||
            (link.key !== "inbox" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.key}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full px-3 text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {tabs.length > 0 ? (
        <>
          <nav
            aria-label={section === "reports" ? "Reports" : "Settings"}
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
                    "inline-flex h-10 items-center rounded-xl px-3 text-[12px] font-medium",
                    isActive
                      ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <MobileTabSelect tabs={tabs} activeHref={pathname} />
        </>
      ) : null}
    </div>
  );
}

interface MobileTabSelectProps {
  tabs: SubNavEntry[];
  activeHref: string;
}

function MobileTabSelect({ tabs, activeHref }: MobileTabSelectProps) {
  const [navigating, setNavigating] = React.useState(false);
  const active = tabs.find((tab) => tab.href === activeHref) ?? tabs[0];

  const handleChange = (href: string) => {
    if (typeof window === "undefined") return;
    setNavigating(true);
    window.location.href = href;
  };

  if (!active) return null;

  return (
    <div className="md:hidden">
      <Select
        value={active.href}
        onValueChange={handleChange}
        disabled={navigating}
      >
        <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white text-[12px] font-medium">
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
