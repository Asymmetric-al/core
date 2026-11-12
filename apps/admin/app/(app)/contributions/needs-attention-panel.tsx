"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  AlertCircle,
  ArrowRight,
  ListFilter,
  RotateCw,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useId } from "react";

import {
  attentionUrgency,
  FOLLOW_UP_NOT_LINKED,
  followUpLink,
} from "../../../features/mission-control/needs-attention/attention-vocabulary";

import type { MissionControlNeedsAttentionGroup } from "@asym/database/hooks";

const VISIBLE_GROUP_COUNT = 3;

/**
 * The needs-attention read returns at most this many open issues
 * (`listContributionNeedsAttention` in packages/api), so a total at the
 * limit may be short of the real queue.
 */
const NEEDS_ATTENTION_READ_LIMIT = 100;

/**
 * A follow-up without a gift opens its donor in CRM; one with neither says
 * so rather than offering a button that leads nowhere.
 */
function FollowUpFallbackAction({
  item,
  groupTitle,
}: {
  item: MissionControlNeedsAttentionGroup["items"][number];
  groupTitle: string;
}) {
  const link = followUpLink(item);
  if (!link) {
    return (
      <span className="text-xs text-muted-foreground">
        {FOLLOW_UP_NOT_LINKED}
      </span>
    );
  }
  return (
    <ButtonLink
      render={<Link href={link.href} />}
      variant="outline"
      size="sm"
      aria-label={`${link.label}: ${groupTitle}`}
    >
      {link.label}
      <ArrowRight data-icon="inline-end" aria-hidden="true" />
    </ButtonLink>
  );
}

/** "Receipt, critical (2)": a group named in running text with its count. */
function groupMention(group: MissionControlNeedsAttentionGroup): string {
  const urgency = attentionUrgency(group.urgency).label.toLowerCase();
  return `${group.title}, ${urgency} (${group.count})`;
}

/** "Receipt · Critical": a group's name for filters and announcements. */
export function needsAttentionGroupLabel(
  group: Pick<MissionControlNeedsAttentionGroup, "title" | "urgency">,
): string {
  return `${group.title} · ${attentionUrgency(group.urgency).label}`;
}

/**
 * Mission Control needs-attention groups for contributions. Shows the three
 * most urgent groups with their first item and a direct link into the gift.
 * Everything beyond those three cards (later items in a group, later groups)
 * is one step away: "Show in grid" filters the gifts grid to the affected
 * gifts. Every card offers it, a single-item group included, so the action
 * rows line up.
 *
 * Layout: three columns from lg, each showing its whole summary (staff
 * triage from it) with both actions on one row; between lg and xl the open
 * action reads "Open" to fit, keeping its full name. Below lg (phones and
 * tablets) only the most urgent group gets a card, its actions beside the
 * summary from sm and under it on phones, so the gifts start within about a
 * screen; the other groups are named on one line and "Show all" reaches
 * them.
 */
export function ContributionNeedsAttentionPanel({
  groups,
  failed = false,
  onRetry,
  onOpenContribution,
  onShowInGrid,
}: {
  groups: MissionControlNeedsAttentionGroup[];
  /**
   * The needs-attention check itself failed. Its empty groups are then not
   * "nothing needs attention", so the panel says so instead of vanishing.
   */
  failed?: boolean;
  onRetry?: () => void;
  onOpenContribution: (contributionId: string) => void;
  /** Filters the gifts grid to the gifts behind these group keys. */
  onShowInGrid?: (groupKeys: string[]) => void;
}) {
  const headingId = useId();

  if (failed) {
    // Same quiet inline idiom as the gifts load-issue note.
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
      >
        <AlertCircle aria-hidden="true" className="size-4 text-destructive" />
        <span>
          Couldn&apos;t check Needs attention; open issues may be missing.
        </span>
        {onRetry ? (
          <Button type="button" variant="outline" size="xs" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  if (groups.length === 0) {
    return null;
  }

  const totalCount = groups.reduce((sum, group) => sum + group.count, 0);
  const atReadLimit = totalCount >= NEEDS_ATTENTION_READ_LIMIT;
  const visibleGroups = groups.slice(0, VISIBLE_GROUP_COUNT);
  const hasHiddenGroups = groups.length > VISIBLE_GROUP_COUNT;
  // The cards reach the first item of each visible group; offer the grid
  // whenever anything is left beyond them.
  const hasUnreachedItems =
    hasHiddenGroups || visibleGroups.some((group) => group.count > 1);
  // Below lg only the first group shows, so anything after its first item
  // is left for the grid there.
  const hasUnreachedItemsOnPhone =
    groups.length > 1 || (groups[0]?.count ?? 0) > 1;
  const description = hasHiddenGroups
    ? `The ${VISIBLE_GROUP_COUNT} most urgent of ${groups.length} issue groups.`
    : "Gift problems to resolve, most urgent first.";
  const phoneDescription =
    groups.length > 1
      ? `The most urgent of ${groups.length} issue groups.`
      : description;

  return (
    <Card aria-labelledby={headingId} className="gap-0 py-0" role="region">
      <CardHeader className="py-4">
        <CardTitle>
          {/* The title keeps one line; only on the narrowest phones does the
              count wrap below it rather than split "Needs attention". */}
          <h2
            id={headingId}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-foreground"
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <TriangleAlert
                aria-hidden="true"
                className="size-4 text-warning"
              />
              Needs attention
            </span>
            <Badge variant="secondary">
              {atReadLimit
                ? `${NEEDS_ATTENTION_READ_LIMIT}+ items`
                : `${totalCount} ${totalCount === 1 ? "item" : "items"}`}
            </Badge>
          </h2>
        </CardTitle>
        <CardDescription>
          {phoneDescription === description ? (
            description
          ) : (
            <>
              <span className="lg:hidden">{phoneDescription}</span>
              <span className="hidden lg:inline">{description}</span>
            </>
          )}
          {atReadLimit ? (
            <span className="block">
              Shows the {NEEDS_ATTENTION_READ_LIMIT} most recent open issues;
              there may be more.
            </span>
          ) : null}
        </CardDescription>
        {onShowInGrid && hasUnreachedItemsOnPhone ? (
          <CardAction>
            {/* From lg every group card shows; Show all stays only while
                something is beyond them. */}
            <span className={hasUnreachedItems ? "flex" : "flex lg:hidden"}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                // Phones show the short label without the icon so the
                // title, count and button share one line at 390px; the name
                // always says where the items open.
                aria-label="Show all in grid"
                onClick={() => onShowInGrid(groups.map((group) => group.key))}
              >
                <ListFilter aria-hidden="true" className="hidden sm:block" />
                <span>
                  Show all<span className="hidden sm:inline"> in grid</span>
                </span>
              </Button>
            </span>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="px-0">
        <ul className="grid divide-y border-t lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {visibleGroups.map((group, index) => {
            const firstItem = group.items[0];
            const firstContributionId = firstItem?.contributionId;
            const urgency = attentionUrgency(group.urgency);
            return (
              <li
                key={group.key}
                // The one row below lg puts its actions under the text on
                // phones and beside it from sm, so tablets spend no extra
                // line before the gifts; lg columns stack them again.
                className={`${index === 0 ? "flex" : "hidden lg:flex"} min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 lg:flex-col lg:items-stretch lg:gap-3`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {/* Wrap the title and count rather than hiding the issue
                      name when three groups share a narrow laptop row. */}
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Badge variant={urgency.variant}>{urgency.label}</Badge>
                    <p className="min-w-0 flex-1 text-sm font-medium break-words text-foreground">
                      {group.title}
                    </p>
                    <span className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                      {group.count} item{group.count === 1 ? "" : "s"}
                    </span>
                  </div>
                  {firstItem ? (
                    <p className="text-sm text-muted-foreground">
                      {firstItem.summary}
                    </p>
                  ) : null}
                </div>
                {/* Show in grid stays for a single-item group too: it
                    works there (the grid lists that one gift) and keeps
                    every card's action row the same. */}
                {firstItem || onShowInGrid ? (
                  <div className="flex shrink-0 flex-wrap items-center gap-2 lg:mt-auto">
                    {firstContributionId ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Open contribution: ${group.title}`}
                        onClick={() => onOpenContribution(firstContributionId)}
                      >
                        <span>
                          Open
                          <span className="lg:hidden xl:inline">
                            {" "}
                            contribution
                          </span>
                        </span>
                        <ArrowRight data-icon="inline-end" aria-hidden="true" />
                      </Button>
                    ) : firstItem ? (
                      <FollowUpFallbackAction
                        item={firstItem}
                        groupTitle={group.title}
                      />
                    ) : null}
                    {onShowInGrid ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Show in grid: ${group.title}`}
                        onClick={() => onShowInGrid([group.key])}
                      >
                        Show in grid
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        {/* Phones and tablets show only the most urgent group's card, lg
            three; the rest are still named, with urgency and count. */}
        {groups.length > 1 ? (
          <p className="border-t px-4 py-3 text-xs text-muted-foreground lg:hidden">
            Also: {groups.slice(1).map(groupMention).join(" · ")}
          </p>
        ) : null}
        {groups.length > visibleGroups.length ? (
          <p className="hidden border-t px-4 py-3 text-xs text-muted-foreground lg:block">
            Also, not shown above:{" "}
            {groups.slice(visibleGroups.length).map(groupMention).join(" · ")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
