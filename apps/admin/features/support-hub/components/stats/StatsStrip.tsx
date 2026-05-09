"use client";

import { StatCard } from "./StatCard";
import { useSupportConversations } from "../../hooks/use-support-conversations";
import { useSupportInboxStats } from "../../hooks/use-support-stats";
import { useCurrentSupportAgentId } from "../../lib/current-agent";

type StatTone = "zinc" | "amber" | "rose" | "emerald";

interface StatsStripProps {
  /** Optional inbox scope; null counts across every inbox in the tenant. */
  inboxId?: string | null;
}

interface StatTile {
  key: string;
  label: string;
  value: React.ReactNode;
  hint: string;
  tone: StatTone;
  mono?: boolean;
}

/**
 * Six-tile metrics strip at the top of the inbox. Mirrors the donor stats
 * idea but rewrites the styling to Mission Control: quiet Maia/Zinc cards,
 * Geist Mono only for the time-shaped value, accent dots in lieu of loud
 * color blocks.
 *
 * Memoization is left to the React Compiler; everything in this body is a
 * pure derivation over the live collections.
 */
export function StatsStrip({ inboxId = null }: StatsStripProps) {
  const stats = useSupportInboxStats({ inboxId });
  const conversations = useSupportConversations();
  const currentAgentId = useCurrentSupportAgentId();

  const myOpenCount = currentAgentId
    ? conversations.data.filter(
        (row) =>
          row.assignee?.id === currentAgentId &&
          (row.status === "open" || row.status === "pending"),
      ).length
    : 0;

  const openCount =
    stats.data.buckets.find((bucket) => bucket.status === "open")?.count ?? 0;

  const tiles: StatTile[] = [
    {
      key: "open",
      label: "Open",
      value: openCount,
      hint: "awaiting agent",
      tone: "amber",
    },
    {
      key: "mine",
      label: "Mine",
      value: myOpenCount,
      hint: currentAgentId ? "open + pending" : "no agent matched",
      tone: "zinc",
    },
    {
      key: "unassigned",
      label: "Unassigned",
      value: stats.data.waitingOnAgentCount,
      hint: "needs routing",
      tone: "amber",
    },
    {
      key: "past-due",
      label: "Past due",
      value: stats.data.pastDueCount,
      hint: "SLA breached",
      tone: "rose",
    },
    {
      key: "avg-first-reply",
      label: "Avg first reply",
      value: formatMinutes(stats.data.averageFirstResponseMinutes),
      hint: "across the inbox",
      tone: "zinc",
      mono: true,
    },
    {
      key: "resolved-today",
      label: "Resolved today",
      value: stats.data.resolvedTodayCount,
      hint: "since midnight",
      tone: "emerald",
    },
  ];

  return (
    <section
      aria-label="Inbox metrics"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {tiles.map((tile, index) => (
        <StatCard
          key={tile.key}
          label={tile.label}
          value={tile.value}
          hint={tile.hint}
          tone={tile.tone}
          mono={tile.mono}
          delay={index * 0.04}
        />
      ))}
    </section>
  );
}

function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "--";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) {
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded}h`;
  }
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days}d`;
}
