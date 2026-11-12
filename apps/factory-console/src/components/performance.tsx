"use client";

import { Button } from "@asym/ui/components/shadcn/button-component";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { RefreshCw, RotateCcw } from "lucide-react";

import { PERFORMANCE_REFRESH_MS, failureText, usePerformance } from "./data";
import {
  Ago,
  EmptyNote,
  ErrorNote,
  ExternalLink,
  Fact,
  Facts,
  IssueButton,
  LoadingRows,
  Mono,
  Panel,
  StatusBadge,
  Unavailable,
  When,
  useConsole,
} from "./shared";
import { duration } from "../lib/contracts";

import type { Delivery, PerformanceView, Statistic } from "../lib/performance";
import type { ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";

export function Performance({ active }: { active: boolean }) {
  const { scope, paused, now } = useConsole();
  const read = usePerformance(scope, { paused, active });
  const view = read.data ?? null;
  // Measured on the browser clock from when this read arrived.
  const stale = Boolean(
    view && now && now - read.dataUpdatedAt > 2 * PERFORMANCE_REFRESH_MS,
  );
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {stale && !read.isError ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            This observation is stale; refresh before relying on it.
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={read.isFetching}
            onClick={() => void read.refetch()}
          >
            <RefreshCw aria-hidden="true" />
            Refresh performance
          </Button>
        </div>
      ) : null}
      {read.isError ? (
        <ErrorNote>
          <p className="font-medium">Performance could not be read</p>
          <p>{failureText(read.error)}</p>
          {view ? (
            <p className="text-xs">
              Showing the last observation, from{" "}
              <When value={view.observedAt} />.
            </p>
          ) : null}
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={read.isFetching}
              onClick={() => void read.refetch()}
            >
              <RotateCcw aria-hidden="true" />
              Retry
            </Button>
          </div>
        </ErrorNote>
      ) : null}
      {view ? (
        <PerformanceBody view={view} />
      ) : read.isPending && read.fetchStatus !== "idle" ? (
        <LoadingRows label="Loading performance…" rows={6} />
      ) : !read.isError ? (
        <Unavailable>Performance has not been read yet.</Unavailable>
      ) : null}
    </div>
  );
}

function PerformanceBody({
  view,
}: {
  view: PerformanceView & { malformed: { name: string; reason: string }[] };
}) {
  return (
    <>
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel
          title="Verified deliveries"
          description={
            <>
              A delivery is verified only when the published head carries CLEAR
              reviews from Micaiah and Luke and a PASS final acceptance for the
              current acceptance revision. Observed{" "}
              <When value={view.observedAt} /> (<Ago value={view.observedAt} />
              ).
            </>
          }
        >
          <Facts>
            <Fact term="Delivered">{view.totals.delivered}</Fact>
            <Fact term="Verified">{view.totals.verified}</Fact>
            <Fact term="Not verified">{view.totals.unverified}</Fact>
            <Fact term="Blocked now">{view.totals.blocked}</Fact>
          </Facts>
          {view.malformed.length ? (
            <ErrorNote>
              <p className="font-medium">
                {view.malformed.length} work{" "}
                {view.malformed.length === 1 ? "item" : "items"} could not be
                read and {view.malformed.length === 1 ? "is" : "are"} left out
              </p>
            </ErrorNote>
          ) : null}
        </Panel>
        <Panel
          title="Cycle and waiting time"
          description={`Comparable verified deliveries only. With fewer than ${view.minSample}, there is not enough history to estimate and nothing is shown.`}
        >
          <Facts>
            <Fact term="Cycle to PR ready">
              <StatisticText value={view.cycle.PR_READY} min={view.minSample} />
            </Fact>
            <Fact term="Cycle to merged">
              <StatisticText value={view.cycle.MERGED} min={view.minSample} />
            </Fact>
            <Fact term="Waiting between rounds">
              {view.wait.unavailable ? (
                <span>Unavailable: {view.wait.unavailable}</span>
              ) : (
                <StatisticText value={view.wait} min={view.minSample} />
              )}
            </Fact>
            <Fact term="Rework">
              {view.rework.enough && view.rework.share !== null ? (
                <>
                  {view.rework.reworked} of {view.rework.n} verified deliveries
                  ({Math.round(view.rework.share * 100)}%) needed a repair,
                  acceptance correction or review-only round.
                </>
              ) : (
                <>
                  Not enough history: {view.rework.n} of {view.minSample}{" "}
                  verified deliveries ({view.rework.reworked} needed a repair
                  round).
                </>
              )}
            </Fact>
          </Facts>
          <p className="text-xs text-muted-foreground">
            Cycle runs from admission to the recorded outcome. Time inside a
            round (running, waiting on quota or checks) is shown per issue in
            its sheet from the engine&apos;s lifecycle records; it is not
            aggregated across issues here.
          </p>
        </Panel>
      </div>
      <Panel
        title="By owner"
        description="A modest comparison of verified deliveries per owner alias, ordered by verified deliveries. It is never ranked by lines changed, tokens or any invented score."
      >
        {view.owners.length ? (
          <ItemGroup
            aria-label="Owners by verified deliveries"
            className="gap-3"
          >
            {view.owners.map((owner) => (
              <Item key={owner.owner} variant="outline" size="sm">
                <ItemContent className="min-w-0">
                  <ItemTitle>
                    <span className="min-w-0 break-all">{owner.owner}</span>
                  </ItemTitle>
                  <dl className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Verified</dt>
                      <dd>
                        {owner.verified} of {owner.delivered} delivered
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Median cycle</dt>
                      <dd>
                        {owner.medianCycleMs === null
                          ? `Not enough history (${owner.verified} of ${view.minSample})`
                          : duration(owner.medianCycleMs)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Needed rework</dt>
                      <dd>{owner.reworked}</dd>
                    </div>
                  </dl>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <EmptyNote>No delivery is recorded yet.</EmptyNote>
        )}
      </Panel>
      <Panel
        title="Deliveries"
        description="Every PR-ready or merged work item, newest first. Open one to see its rounds, evidence and timing."
      >
        {view.deliveries.length ? (
          <DataTableResponsive
            columns={DELIVERY_COLUMNS}
            data={view.deliveries}
            getRowId={(row) => String(row.issue)}
            config={DELIVERY_TABLE}
            mobileCardConfig={DELIVERY_CARD}
            emptyState={<EmptyNote>No delivery matches.</EmptyNote>}
          />
        ) : (
          <EmptyNote>
            No issue has reached PR ready or merged yet, so there is nothing to
            measure.
          </EmptyNote>
        )}
      </Panel>
    </>
  );
}

function StatisticText({ value, min }: { value: Statistic; min: number }) {
  if (!value.enough || value.median === null)
    return (
      <span>
        Not enough history: {value.n} of {min} comparable verified deliveries.
        {value.latestAt ? (
          <>
            {" "}
            Latest <Ago value={value.latestAt} />.
          </>
        ) : null}
      </span>
    );
  return (
    <span>
      Median {duration(value.median)}; middle half {duration(value.low)} to{" "}
      {duration(value.high)} (n = {value.n}
      {value.latestAt ? (
        <>
          , latest <Ago value={value.latestAt} />
        </>
      ) : null}
      )
    </span>
  );
}

function VerifiedCell({ row }: { row: Delivery }) {
  return row.verified ? (
    <StatusBadge value="PASS" label="verified" />
  ) : (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <StatusBadge value="waiting" label="not verified" />
      <span className="block max-w-64 whitespace-normal break-words text-xs text-muted-foreground">
        {row.reason}
      </span>
    </span>
  );
}

function OutcomeCell({ row }: { row: Delivery }) {
  return (
    <span className="flex flex-col items-start gap-1">
      <StatusBadge value={row.outcome} />
      {row.mergedOutside ? (
        <span className="text-xs text-muted-foreground">
          merged outside the factory
        </span>
      ) : null}
    </span>
  );
}

const DELIVERY_COLUMNS: ColumnDef<Delivery>[] = [
  {
    id: "issue",
    accessorFn: (row) => row.issue,
    header: "Issue",
    cell: ({ row }) => <IssueButton issue={row.original.issue} />,
    enableHiding: false,
    meta: { label: "Issue" },
  },
  {
    id: "outcome",
    accessorFn: (row) => row.outcome,
    header: "Outcome",
    cell: ({ row }) => <OutcomeCell row={row.original} />,
    meta: { label: "Outcome" },
  },
  {
    id: "verified",
    accessorFn: (row) => (row.verified ? 1 : 0),
    header: "Evidence",
    cell: ({ row }) => <VerifiedCell row={row.original} />,
    meta: { label: "Evidence" },
  },
  {
    id: "cycle",
    accessorFn: (row) => row.cycleMs ?? -1,
    header: "Cycle",
    cell: ({ row }) => (
      <span className="text-sm">{duration(row.original.cycleMs)}</span>
    ),
    meta: { label: "Cycle" },
  },
  {
    id: "wait",
    accessorFn: (row) => row.waitMs ?? -1,
    header: "Between rounds",
    cell: ({ row }) => (
      <span className="text-sm">{duration(row.original.waitMs)}</span>
    ),
    meta: { label: "Between rounds" },
  },
  {
    id: "rework",
    accessorFn: (row) => row.repairRounds,
    header: "Repair rounds",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.repairRounds} of {row.original.rounds}
      </span>
    ),
    meta: { label: "Repair rounds" },
  },
  {
    id: "at",
    accessorFn: (row) => row.at ?? "",
    header: "Reached",
    cell: ({ row }) => (
      <span className="text-sm">
        <Ago value={row.original.at} />
      </span>
    ),
    meta: { label: "Reached" },
  },
  {
    id: "pr",
    accessorFn: (row) => row.pr?.number ?? 0,
    header: "PR",
    cell: ({ row }) =>
      row.original.pr ? (
        <ExternalLink href={row.original.pr.url}>
          PR #{row.original.pr.number}
        </ExternalLink>
      ) : (
        <span className="text-sm text-muted-foreground">None</span>
      ),
    meta: { label: "PR" },
  },
];

const DELIVERY_TABLE = {
  enableRowSelection: false,
  enableViewToggle: false,
  defaultViewMode: "table" as const,
};

const DELIVERY_CARD = {
  renderCard: (row: { original: Delivery }) => (
    <DeliveryCard row={row.original} />
  ),
};

function DeliveryCard({ row }: { row: Delivery }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <IssueButton issue={row.issue} />
        <OutcomeCell row={row} />
      </div>
      <VerifiedCell row={row} />
      <dl className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-1">
        <dt className="text-muted-foreground">Cycle</dt>
        <dd>{duration(row.cycleMs)}</dd>
        <dt className="text-muted-foreground">Between rounds</dt>
        <dd>{duration(row.waitMs)}</dd>
        <dt className="text-muted-foreground">Repair rounds</dt>
        <dd>
          {row.repairRounds} of {row.rounds}
        </dd>
        <dt className="text-muted-foreground">Owner</dt>
        <dd className="break-all">
          <Mono>{row.owner}</Mono>
        </dd>
      </dl>
      {row.pr ? (
        <ExternalLink href={row.pr.url}>PR #{row.pr.number}</ExternalLink>
      ) : null}
    </div>
  );
}
