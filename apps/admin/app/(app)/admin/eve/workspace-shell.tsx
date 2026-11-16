"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import {
  Activity,
  BellRing,
  GitPullRequest,
  MessageSquareText,
  PanelsTopLeft,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

export type EveTab = "overview" | "approvals" | "policy" | "connections";

export const EVE_TABS: ReadonlyArray<{ value: EveTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "approvals", label: "Approvals and budgets" },
  { value: "policy", label: "Policy and memory" },
  { value: "connections", label: "Connections" },
];

const EVE_TAB_LABELS = Object.fromEntries(
  EVE_TABS.map((tab) => [tab.value, tab.label]),
) as Record<EveTab, string>;

const WORKSPACE_SECTIONS = [
  {
    id: "eve-launch-readiness",
    tab: "overview",
    label: "Launch readiness",
    description: "Checks to pass before Eve goes live",
  },
  {
    id: "eve-active-runs",
    tab: "overview",
    label: "Active runs",
    description: "Work Eve is doing now or did recently",
  },
  {
    id: "eve-approvals",
    tab: "approvals",
    label: "Approvals",
    description: "Actions waiting for a person to approve",
  },
  {
    id: "eve-recent-actions",
    tab: "approvals",
    label: "Recent actions",
    description: "What Eve did and what policy allowed",
  },
  {
    id: "eve-budgets",
    tab: "approvals",
    label: "Budgets",
    description: "Spending so far and hard limits",
  },
  {
    id: "eve-failures",
    tab: "overview",
    label: "Failures",
    description: "Runs that failed, with their errors",
  },
  {
    id: "eve-github-activity",
    tab: "connections",
    label: "GitHub activity",
    description: "Whether GitHub is connected",
  },
  {
    id: "eve-eval-health",
    tab: "policy",
    label: "Eval health",
    description: "Test results for the model policy",
  },
  {
    id: "eve-memory-title",
    tab: "policy",
    label: "Memory",
    description: "What Eve remembers, and its controls",
  },
  {
    id: "eve-model-policy",
    tab: "policy",
    label: "Model policy",
    description: "Which models Eve may use",
  },
  {
    id: "eve-subagents",
    tab: "policy",
    label: "Subagents",
    description: "Helper agents and their overrides",
  },
  {
    id: "eve-notifications",
    tab: "connections",
    label: "Notifications",
    description: "Whether alerts can be delivered",
  },
  {
    id: "eve-engineering-monitors",
    tab: "connections",
    label: "Engineering monitors",
    description: "Signals watched, findings and run health",
  },
  {
    id: "eve-audit",
    tab: "overview",
    label: "Audit",
    description: "Eve's decisions, private details removed",
  },
  {
    id: "eve-retention",
    tab: "policy",
    label: "Retention",
    description: "How long records are kept, and holds",
  },
  {
    id: "eve-emergency-controls",
    tab: "overview",
    label: "Emergency controls",
    description: "Stop Eve at once; every use is recorded",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  tab: EveTab;
  label: string;
  description: string;
}>;

/**
 * Records the open tab in `?tab=` (none for Overview). A section chosen from
 * the index pushes a history entry, so Back returns to where staff were;
 * tab switches and links arriving from elsewhere replace the current one.
 */
function writeTabToUrl(
  tab: EveTab,
  sectionId?: string,
  mode: "push" | "replace" = "replace",
) {
  const url = new URL(window.location.href);
  if (tab === "overview") url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  url.hash = sectionId ?? "";
  if (url.href === window.location.href) return;
  if (mode === "push") window.history.pushState(window.history.state, "", url);
  else window.history.replaceState(window.history.state, "", url);
}

function tabFromUrl(): EveTab {
  const fromQuery = new URL(window.location.href).searchParams.get("tab");
  return EVE_TABS.some((entry) => entry.value === fromQuery)
    ? (fromQuery as EveTab)
    : "overview";
}

function tabForSection(sectionId: string): EveTab | null {
  return (
    WORKSPACE_SECTIONS.find((section) => section.id === sectionId)?.tab ?? null
  );
}

export function EveWorkspaceIndex({
  onSelectSection,
}: {
  onSelectSection?: (sectionId: string) => void;
} = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle aria-level={2} role="heading">
          <span className="flex items-center gap-2">
            <PanelsTopLeft aria-hidden="true" className="size-5" />
            Operations workspace
          </span>
        </CardTitle>
        <CardDescription>
          Every Eve setting and record, without using chat. Each panel opens in
          the tab named above it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <nav aria-label="Eve operations panels">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            {EVE_TABS.map((tab) => (
              <div key={tab.value} className="flex flex-col gap-1">
                <p
                  id={`eve-index-${tab.value}`}
                  className="px-2 text-xs font-medium text-muted-foreground"
                >
                  {tab.label}
                </p>
                <ul aria-labelledby={`eve-index-${tab.value}`}>
                  {WORKSPACE_SECTIONS.filter(
                    (section) => section.tab === tab.value,
                  ).map((section) => (
                    <li key={section.id}>
                      <a
                        className="flex flex-col rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                        href={`#${section.id}`}
                        onClick={() => onSelectSection?.(section.id)}
                      >
                        <span className="text-sm font-medium text-foreground">
                          {section.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {section.description}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}

export function EveOperationsWorkspace({
  panels,
  statusRow,
}: {
  panels: Record<EveTab, ReactNode>;
  statusRow?: ReactNode;
}) {
  const [tab, setTabState] = useState<EveTab>("overview");
  const pendingSection = useRef<string | null>(null);

  // The chosen tab lives in the URL (?tab=), so a reload, a shared link or
  // the back button returns to it; a #section still wins on open.
  const setTab = useCallback((next: EveTab) => {
    setTabState(next);
    writeTabToUrl(next);
  }, []);

  useEffect(() => {
    const fromQuery = () => {
      if (!window.location.hash) setTabState(tabFromUrl());
    };
    fromQuery();
    window.addEventListener("popstate", fromQuery);
    return () => window.removeEventListener("popstate", fromQuery);
  }, []);

  const [sectionRequest, setSectionRequest] = useState(0);

  const scrollToSection = useCallback((sectionId: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView?.({ block: "start" });
    });
  }, []);

  const openSection = useCallback(
    (sectionId: string, mode: "push" | "replace" = "replace") => {
      const next = tabForSection(sectionId);
      if (!next) return;
      // ?tab= follows the section's tab, so it never names a tab other
      // than the one on screen; the #section stays for the scroll.
      writeTabToUrl(next, sectionId, mode);
      pendingSection.current = sectionId;
      setTabState(next);
      setSectionRequest((current) => current + 1);
    },
    [],
  );

  // A #section link from elsewhere (or the back button) opens its tab.
  useEffect(() => {
    const fromHash = () => openSection(window.location.hash.slice(1));
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [openSection]);

  useEffect(() => {
    const sectionId = pendingSection.current;
    if (!sectionId) return;
    pendingSection.current = null;
    scrollToSection(sectionId);
  }, [tab, sectionRequest, scrollToSection]);

  return (
    <div className="flex flex-col gap-6">
      <EveWorkspaceIndex
        onSelectSection={(sectionId) => openSection(sectionId, "push")}
      />
      {statusRow}
      <Tabs
        value={tab}
        onValueChange={(next) => setTab(next as EveTab)}
        className="flex flex-col gap-6"
      >
        <div className="sm:hidden">
          <Select<EveTab>
            items={EVE_TAB_LABELS}
            value={tab}
            onValueChange={(next) => next && setTab(next)}
          >
            <SelectTrigger aria-label="Eve operations section">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVE_TABS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden overflow-x-auto sm:block">
          <TabsList aria-label="Eve operations" variant="line">
            {EVE_TABS.map((entry) => (
              <TabsTrigger key={entry.value} value={entry.value}>
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {EVE_TABS.map((entry) => (
          <TabsContent
            key={entry.value}
            value={entry.value}
            className="flex flex-col gap-6"
          >
            {panels[entry.value]}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ConnectionState({
  availability = "Unavailable",
  description,
  icon,
  id,
  panelHref,
  title,
}: {
  availability?: "Managed in panel" | "Mounted" | "Unavailable";
  description: string;
  icon: ReactNode;
  id: string;
  panelHref?: string;
  title: string;
}) {
  return (
    <article id={id} className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
        <Badge variant="outline">{availability}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      {panelHref ? (
        <a
          href={panelHref}
          className={buttonVariants({
            variant: "link",
            className: "mt-2 h-auto p-0",
          })}
        >
          Open notification controls
        </a>
      ) : null}
    </article>
  );
}

export function EveCapabilityConnectionsPanel() {
  return (
    <section aria-labelledby="eve-connections-title">
      <Card>
        <CardHeader>
          <CardTitle id="eve-connections-title" aria-level={2} role="heading">
            <span className="flex items-center gap-2">
              <Activity aria-hidden="true" className="size-5" />
              Capability connections
            </span>
          </CardTitle>
          <CardDescription>
            Future integrations are labeled unavailable. This workspace never
            invents activity, health, or delivery results.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <ConnectionState
            id="eve-github-activity"
            title="GitHub activity"
            description="The governed GitHub read and review path is not connected, so no commits, checks, reviews, or issues are presented as live activity."
            icon={<GitPullRequest aria-hidden="true" className="size-4" />}
          />
          <ConnectionState
            availability="Managed in panel"
            id="eve-notification-connection"
            title="Notifications"
            description="Notification policies, channels, and delivery history are reported by the Notifications panel. Availability follows the server readiness response."
            panelHref="#eve-notifications"
            icon={<BellRing aria-hidden="true" className="size-4" />}
          />
          <ConnectionState
            availability="Mounted"
            id="eve-chat"
            title="Chat runtime"
            description="The authenticated Eve runtime is mounted as a global, operations-secondary panel with an explicit allowlist for page context."
            icon={<MessageSquareText aria-hidden="true" className="size-4" />}
          />
        </CardContent>
      </Card>
    </section>
  );
}
