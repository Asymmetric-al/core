"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";

import { useSupportConversations } from "../../hooks/use-support-conversations";
import { useCurrentSupportAgentId } from "../../lib/current-agent";
import { useSupportNow } from "../../lib/now";
import { selectByView, selectConversations } from "../../lib/selectors";
import { INBOX_VIEW_LABELS } from "../../lib/status-labels";

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
  { view: "all", label: INBOX_VIEW_LABELS["all"] },
  { view: "mine", label: INBOX_VIEW_LABELS["mine"] },
  { view: "unassigned", label: INBOX_VIEW_LABELS["unassigned"] },
  { view: "past-due", label: INBOX_VIEW_LABELS["past-due"] },
  { view: "escalated", label: INBOX_VIEW_LABELS["escalated"] },
];

/**
 * Donor-inspired view switcher. Active state, density, and typography mirror
 * the existing Mission Control nav patterns (`mc-shell.tsx`) so the strip
 * reads as part of the shell rather than a pasted donor block.
 */
export function ViewTabs({ value, onValueChange, baseFilter }: ViewTabsProps) {
  const currentAgentId = useCurrentSupportAgentId();
  const conversations = useSupportConversations();
  const showCounts = !conversations.isError && !conversations.isLoading;
  const nowIso = useSupportNow();

  const effectiveNow = (baseFilter?.now as string | Date | undefined) ?? nowIso;
  const rows = baseFilter
    ? selectConversations(conversations.data, {
        ...baseFilter,
        view: "all",
        now: effectiveNow,
      })
    : conversations.data;
  const counts: Record<SupportInboxView, number> = {
    all: 0,
    mine: 0,
    unassigned: 0,
    "past-due": 0,
    escalated: 0,
  };

  for (const tab of TABS) {
    counts[tab.view] = selectByView(
      rows,
      tab.view,
      currentAgentId,
      effectiveNow,
    ).length;
  }

  // Phones choose the view from a select (every view and count fits);
  // wider screens keep the tab strip.
  const selectLabels = Object.fromEntries(
    TABS.map((tab) => [
      tab.view,
      showCounts ? `${tab.label} (${counts[tab.view]})` : tab.label,
    ]),
  ) as Record<SupportInboxView, string>;

  return (
    <>
      <div className="shrink-0 sm:hidden">
        <Select<SupportInboxView>
          items={selectLabels}
          value={value}
          onValueChange={(next) => next && onValueChange(next)}
        >
          <SelectTrigger aria-label="Inbox view">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TABS.map((tab) => (
              <SelectItem key={tab.view} value={tab.view}>
                {selectLabels[tab.view]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden min-w-0 sm:block">
        <Tabs
          className="min-w-0"
          value={value}
          onValueChange={(next) => onValueChange(next as SupportInboxView)}
        >
          <div className="max-w-full overflow-x-auto p-1">
            <TabsList aria-label="Inbox views">
              {TABS.map((tab) => {
                const count = counts[tab.view];
                const isActive = value === tab.view;
                return (
                  <TabsTrigger key={tab.view} value={tab.view}>
                    {tab.label}
                    {showCounts ? (
                      <>
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          aria-hidden
                        >
                          {count}
                        </Badge>
                        <span className="sr-only">
                          , {count}{" "}
                          {count === 1 ? "conversation" : "conversations"}
                        </span>
                      </>
                    ) : null}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </Tabs>
      </div>
    </>
  );
}
