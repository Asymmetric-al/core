"use client";

import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";

import { useSupportConversations } from "../../hooks/use-support-conversations";
import { useSupportInboxStats } from "../../hooks/use-support-stats";
import { formatSupportDuration } from "../../lib/format-duration";
import { selectUnassigned } from "../../lib/selectors";

interface StatsStripProps {
  /** Optional inbox scope; null counts across every inbox in the tenant. */
  inboxId?: string | null;
}

/**
 * The inbox totals on Mission Control's shared metric cards. "Unassigned"
 * counts exactly what the Unassigned view lists, so the card and the tab
 * never disagree. Details stay one line on a phone card, so the first
 * conversation is not pushed below the fold.
 */
export function StatsStrip({ inboxId = null }: StatsStripProps) {
  const stats = useSupportInboxStats({ inboxId });
  const conversations = useSupportConversations();
  const loading = conversations.isLoading || stats.isLoading;
  const unavailable = conversations.isError || stats.isError;
  const state = unavailable ? "unavailable" : loading ? "loading" : "ready";
  const metricState = {
    state,
    unavailableReason: "Couldn't load the inbox totals.",
  } as const;
  const rows = inboxId
    ? conversations.data.filter((row) => row.inboxId === inboxId)
    : conversations.data;

  const openCount =
    stats.data.buckets.find((bucket) => bucket.status === "open")?.count ?? 0;
  const unassignedCount = selectUnassigned(rows).length;

  return (
    <MetricGrid label="Inbox summary" busy={loading}>
      <MetricCard
        label="Open"
        value={openCount}
        {...metricState}
        detail="Awaiting first reply"
      />
      <MetricCard
        label="Unassigned"
        value={unassignedCount}
        {...metricState}
        detail="Active, no agent yet"
        tone={
          !loading && !unavailable && unassignedCount > 0
            ? "attention"
            : "default"
        }
      />
      <MetricCard
        label="Past due"
        value={stats.data.pastDueCount}
        {...metricState}
        detail="Past the reply target"
        tone={
          !loading && !unavailable && stats.data.pastDueCount > 0
            ? "critical"
            : "default"
        }
      />
      <MetricCard
        label="First reply"
        value={formatSupportDuration(stats.data.averageFirstResponseMinutes)}
        {...metricState}
        detail="Inbox average"
      />
    </MetricGrid>
  );
}
