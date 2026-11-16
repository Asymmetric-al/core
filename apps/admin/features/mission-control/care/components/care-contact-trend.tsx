"use client";

import { ChartCard } from "@asym/ui/components/primitives/chart-wrappers";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@asym/ui/components/shadcn/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { getWeeklyCareContacts } from "../care-contact-trend";

import type { ActivityLogEntry } from "../types";

const chartConfig = {
  contacts: { label: "Contacts", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function CareContactTrend({
  activities,
  isLoading = false,
  isError = false,
  onRetry,
}: {
  activities: ActivityLogEntry[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}) {
  const buckets = getWeeklyCareContacts(activities);
  const total = buckets.reduce((sum, bucket) => sum + bucket.contacts, 0);
  const capped = activities.length >= 500;
  const note = capped
    ? "Based on the latest 500 saved entries. Older contacts may be missing; these are not full activity totals."
    : "Counts saved contacts, not unique people. Shared thread posts and private notes are excluded.";

  return (
    <ChartCard
      title="Contacts logged by week"
      headingLevel={2}
      description="Compare contact activity across four seven-day periods ending today."
      summary={`${capped ? "In the loaded entries: " : ""}${total} ${total === 1 ? "contact" : "contacts"}. ${buckets.map((bucket) => `${bucket.range}: ${bucket.contacts}`).join("; ")}. The last period includes today and is still in progress.`}
      note={note}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      isEmpty={total === 0}
      emptyMessage={
        capped
          ? `No contacts in the loaded entries for the last 28 days. ${note}`
          : "No contacts logged in the last 28 days. Log contact from a member’s profile to start their activity history."
      }
    >
      <div className="h-56 w-full">
        <ChartContainer config={chartConfig} layout="fill">
          <BarChart accessibilityLayer data={buckets}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload[0]?.payload.range}
                />
              }
            />
            <Bar
              dataKey="contacts"
              fill="var(--color-contacts)"
              radius={4}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Week starting · Today’s period is still in progress.
      </p>
    </ChartCard>
  );
}
