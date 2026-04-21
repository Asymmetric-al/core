"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";

import { useSupportConversations } from "../../hooks/use-support-conversations";
import { useCurrentSupportAgentId } from "../../lib/current-agent";
import { useSupportNow } from "../../lib/now";
import { selectByView, selectConversations } from "../../lib/selectors";

import type { SupportConversationFilter } from "../../lib/selectors";
import type { SupportInboxView } from "../../types";

interface ViewTabsProps {
  value: SupportInboxView;
  onValueChange: (next: SupportInboxView) => void;
  /**
   * Filter applied OUTSIDE of `view` so the per-tab counts reflect every other
   * active facet (status / labels / assignee / search). Pass `null` to count
   * over the unfiltered conversation set.
   */
  baseFilter: Omit<SupportConversationFilter, "view"> | null;
}

interface TabDefinition {
  view: SupportInboxView;
  label: string;
}

const TABS: TabDefinition[] = [
  { view: "all", label: "All" },
  { view: "mine", label: "Mine" },
  { view: "unassigned", label: "Unassigned" },
  { view: "past-due", label: "Past Due" },
  { view: "escalated", label: "Escalated" },
];

/**
 * Donor-inspired view switcher. Active state, density, and typography mirror
 * the existing Mission Control nav patterns (`mc-shell.tsx`) so the strip
 * reads as part of the shell rather than a pasted donor block.
 */
export function ViewTabs({ value, onValueChange, baseFilter }: ViewTabsProps) {
  const currentAgentId = useCurrentSupportAgentId();
  const conversations = useSupportConversations();
  const nowIso = useSupportNow();

  const rows = conversations.data;
  const counts: Record<SupportInboxView, number> = {
    all: 0,
    mine: 0,
    unassigned: 0,
    "past-due": 0,
    escalated: 0,
  };

  const effectiveNow = baseFilter?.now ?? nowIso;
  for (const tab of TABS) {
    counts[tab.view] = baseFilter
      ? selectConversations(rows, {
          ...baseFilter,
          view: tab.view,
          now: effectiveNow,
        }).length
      : selectByView(rows, tab.view, currentAgentId, effectiveNow).length;
  }

  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as SupportInboxView)}
    >
      <TabsList
        aria-label="Inbox views"
        className="h-10 gap-1 overflow-x-auto rounded-xl bg-zinc-100/60 p-1"
      >
        {TABS.map((tab) => {
          const count = counts[tab.view];
          const isActive = value === tab.view;
          return (
            <TabsTrigger
              key={tab.view}
              value={tab.view}
              className={cn(
                "h-8 gap-2 rounded-lg px-3 text-[13px] font-medium",
                "data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm",
                "text-zinc-600",
              )}
            >
              {tab.label}
              <Badge
                variant="secondary"
                aria-hidden
                className={cn(
                  "h-5 min-w-[1.5rem] justify-center rounded-md border-transparent px-1.5 text-[11px] font-semibold tabular-nums",
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-200 text-zinc-700",
                )}
              >
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
