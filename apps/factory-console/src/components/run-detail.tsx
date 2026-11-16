"use client";

import { Button } from "@asym/ui/components/shadcn/button-component";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { FolderOpen, ListTree, RefreshCw } from "lucide-react";
import { useState } from "react";

import { ControlButton, ViewAuthority } from "./controls";
import { STALE_AFTER_MS, useArtifacts, useRun } from "./data";
import { linkedIssues, nodeRole } from "./runs";
import {
  Ago,
  EmptyNote,
  ErrorNote,
  Fact,
  Facts,
  IssueButton,
  LoadingRows,
  LongText,
  Mono,
  RunButton,
  StaleNotice,
  StatusBadge,
  When,
  useConsole,
} from "./shared";
import { duration, elapsed } from "../lib/contracts";
import { RUN_ID_PATTERN } from "../lib/factory";

import type { Run, RunDetailView } from "../lib/contracts";

const CANCELLABLE: ReadonlySet<string> = new Set([
  "running",
  "paused",
  "pending",
]);

export function RunDialog({
  run,
  close,
}: {
  run: string | null;
  close: () => void;
}) {
  return (
    <Dialog
      open={run !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent scrollable className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Run detail</DialogTitle>
          <DialogDescription>
            Engine run <Mono>{run ?? "none"}</Mono>
          </DialogDescription>
        </DialogHeader>
        {run ? <RunBody key={run} run={run} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function RefreshButton({
  fetching,
  refetch,
}: {
  fetching: boolean;
  refetch: () => unknown;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={fetching}
      onClick={() => void refetch()}
    >
      <RefreshCw aria-hidden="true" />
      Refresh
    </Button>
  );
}

function RunBody({ run }: { run: string }) {
  const { scope, paused, now } = useConsole();
  const query = useRun(scope, run, paused);
  // Measured on the browser clock from when this read arrived.
  const stale = Boolean(
    query.data && now && now - query.dataUpdatedAt > STALE_AFTER_MS,
  );
  // Cancel acts on this read, so its own freshness gates it too.
  const viewReason = query.isError
    ? "The latest read of this run failed; refresh before acting."
    : stale
      ? "This observation of the run is stale; refresh before acting."
      : !query.isFetchedAfterMount
        ? "Re-reading this run…"
        : null;
  if (query.isPending)
    return <LoadingRows label="Loading run detail…" rows={4} />;
  if (!query.data)
    return (
      <div className="flex min-w-0 flex-col gap-3">
        <ErrorNote>
          <p className="font-medium">Run detail could not be read</p>
          <p>{query.error?.message ?? "The engine did not return this run."}</p>
          <p className="text-xs">
            Nothing is shown from an older observation, because none was read.
          </p>
        </ErrorNote>
        <div>
          <RefreshButton fetching={query.isFetching} refetch={query.refetch} />
        </div>
      </div>
    );
  const detail = query.data;
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            Observed <When value={detail.observedAt} /> (
            <Ago value={detail.observedAt} />)
            {paused ? " · live updates paused" : " · re-read every 10 seconds"}
          </p>
          <StaleNotice stale={stale}>
            This observation of the run is stale; refresh before relying on it.
          </StaleNotice>
        </div>
        <RefreshButton fetching={query.isFetching} refetch={query.refetch} />
      </div>
      {query.isError ? (
        <ErrorNote>
          <p className="font-medium">The latest read failed</p>
          <p>{query.error.message}</p>
          <p className="text-xs">
            What follows is the observation from{" "}
            <When value={detail.observedAt} />, not the current state.
          </p>
        </ErrorNote>
      ) : null}
      <RunFacts detail={detail} />
      <ViewAuthority reason={viewReason}>
        <CancelRun run={detail.run} />
      </ViewAuthority>
      <NodeTable detail={detail} />
      <Events events={detail.events} />
      <Artifacts run={run} />
    </div>
  );
}

function RunFacts({ detail }: { detail: RunDetailView }) {
  const { snapshot, now } = useConsole();
  const { run } = detail;
  const issues =
    snapshot?.factory.state === "available"
      ? linkedIssues(snapshot.factory.data.issues, run.id, {
          history: true,
          recorded: snapshot.runIssues,
        })
      : null;
  const span = elapsed(run.started_at, run.completed_at, now);
  return (
    <Facts>
      <Fact term="Workflow">{run.workflow_name}</Fact>
      <Fact term="Status">
        <span className="flex flex-wrap gap-1">
          <StatusBadge value={run.status} />
          {run.needs_attention ? (
            <StatusBadge value="waiting" label="needs attention" />
          ) : null}
        </span>
      </Fact>
      <Fact term="Owner observation">
        {run.owner_observation ?? "Not reported by the engine"}
      </Fact>
      <Fact term="Started">
        <When value={run.started_at} />
      </Fact>
      <Fact term="Completed">
        <When value={run.completed_at} fallback="Not completed" />
      </Fact>
      <Fact term="Last activity">
        {run.last_activity_at ? (
          <>
            <When value={run.last_activity_at} /> (
            <Ago value={run.last_activity_at} />)
          </>
        ) : (
          "Not recorded"
        )}
      </Fact>
      <Fact term="Elapsed">
        {span === null && !run.completed_at ? "Measuring…" : duration(span)}
      </Fact>
      <Fact term="Active nodes">
        {run.active_nodes?.length ? (
          <Mono>{run.active_nodes.join(", ")}</Mono>
        ) : (
          "None"
        )}
      </Fact>
      <Fact term="Linked issue">
        {issues === null ? (
          "Factory state unavailable, so the link cannot be checked"
        ) : issues.length ? (
          <span className="flex flex-wrap gap-1">
            {issues.map((issue) => (
              <IssueButton key={issue} issue={issue} />
            ))}
          </span>
        ) : (
          "No issue in the current factory observation names this run"
        )}
      </Fact>
      {run.parent_run_id ? (
        <Fact term="Parent run">
          <RunButton run={run.parent_run_id} />
        </Fact>
      ) : null}
      <Fact term="Request">
        {run.user_message ? (
          <LongText>{run.user_message}</LongText>
        ) : (
          "No request text"
        )}
      </Fact>
    </Facts>
  );
}

/**
 * Cancellation for a run that was cancellable when the dialog first observed
 * it. It stays mounted after the run ends so the receipt (requested →
 * observed) remains readable; the button itself disables.
 */
function CancelRun({ run }: { run: Run }) {
  const cancellable =
    CANCELLABLE.has(run.status) && RUN_ID_PATTERN.test(run.id);
  const [offered] = useState(cancellable);
  if (!offered && !cancellable) return null;
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">
        Cancelling first holds the issue this run is a round of, so the round is
        not started again, then stops the engine run and removes its executor
        containers. Release the issue to resume.
      </p>
      <ControlButton
        action={{ kind: "cancel-run", runId: run.id }}
        label="Cancel this run"
        disabled={!cancellable}
        disabledReason={`The run is ${run.status}; only a pending, running or paused run can be cancelled.`}
        confirmTitle="Cancel this run?"
        confirmBody={
          <>
            The factory holds the issue whose round this is, cancels engine run{" "}
            {run.id} and removes the containers the executor started for it. The
            issue keeps its assignment and stays held until you release it.
            Effects the run already applied, such as commits, pushes, comments
            or state writes, are not undone.
          </>
        }
      />
    </div>
  );
}

function NodeTable({ detail }: { detail: RunDetailView }) {
  const { run, nodes, timings } = detail;
  if (!nodes.length)
    return (
      <EmptyNote>The engine reported no node states for this run.</EmptyNote>
    );
  return (
    <Table>
      <TableCaption>Engine node states</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Node</TableHead>
          <TableHead scope="col">Role</TableHead>
          <TableHead scope="col">State</TableHead>
          <TableHead scope="col">Attempts</TableHead>
          <TableHead scope="col">Started</TableHead>
          <TableHead scope="col">Ended</TableHead>
          <TableHead scope="col">Model</TableHead>
          <TableHead scope="col">Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => {
          const timing = timings[node.node_id] ?? null;
          return (
            <TableRow key={node.node_id}>
              <TableHead scope="row">
                <span className="font-mono text-xs">{node.node_id}</span>
              </TableHead>
              <TableCell>{nodeRole(run.workflow_name, node.node_id)}</TableCell>
              <TableCell>
                <StatusBadge value={node.state} />
              </TableCell>
              <TableCell>{timing ? timing.attempts : "Not recorded"}</TableCell>
              <TableCell>
                <When value={timing?.startedAt} />
              </TableCell>
              <TableCell>
                <When
                  value={timing?.endedAt}
                  fallback={
                    node.state === "running" ? "Still running" : "Not recorded"
                  }
                />
              </TableCell>
              <TableCell>
                {timing?.model ? (
                  <>
                    {timing.model}
                    {timing.effort ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {timing.effort}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-muted-foreground">Not reported</span>
                )}
              </TableCell>
              <TableCell>
                {node.error ? (
                  <span className="block min-w-48 max-w-sm whitespace-normal break-words text-destructive">
                    {node.error}
                  </span>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function Events({ events }: { events: RunDetailView["events"] }) {
  return (
    <Collapsible className="flex min-w-0 flex-col gap-3">
      <div>
        <CollapsibleTrigger
          render={
            <Button size="sm" variant="outline">
              <ListTree aria-hidden="true" />
              Lifecycle events ({events.length})
            </Button>
          }
        />
      </div>
      <CollapsibleContent className="flex min-w-0 flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          The latest 200 lifecycle events the engine recorded, oldest first.
          Node outputs are never part of this view.
        </p>
        {events.length ? (
          <Table>
            <TableCaption>Lifecycle events for this run</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Event</TableHead>
                <TableHead scope="col">Step</TableHead>
                <TableHead scope="col">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {event.event_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {event.step_name ? (
                      <span className="font-mono text-xs">
                        {event.step_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Run</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <When value={event.created_at} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyNote>
            The engine recorded no lifecycle events for this run.
          </EmptyNote>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function size(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Artifacts({ run }: { run: string }) {
  const { scope } = useConsole();
  const [open, setOpen] = useState(false);
  const query = useArtifacts(scope, run, open);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex min-w-0 flex-col gap-3"
    >
      <div>
        <CollapsibleTrigger
          render={
            <Button size="sm" variant="outline">
              <FolderOpen aria-hidden="true" />
              Artifact inventory
            </Button>
          }
        />
      </div>
      <CollapsibleContent className="flex min-w-0 flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Inventory is not evidence approval: a file listed here has not been
          reviewed or accepted. Private host paths are redacted by the server.
        </p>
        <ArtifactList query={query} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function ArtifactList({ query }: { query: ReturnType<typeof useArtifacts> }) {
  if (query.isPending)
    return <LoadingRows label="Loading the artifact inventory…" rows={2} />;
  if (!query.data)
    return (
      <div className="flex min-w-0 flex-col gap-2">
        <ErrorNote>
          <p className="font-medium">
            The artifact inventory could not be read
          </p>
          <p>
            {query.error?.message ?? "The engine did not return an inventory."}
          </p>
        </ErrorNote>
        <div>
          <RefreshButton fetching={query.isFetching} refetch={query.refetch} />
        </div>
      </div>
    );
  const { files } = query.data;
  if (!files.length)
    return <EmptyNote>The engine lists no artifacts for this run.</EmptyNote>;
  return (
    <Table>
      <TableCaption>
        {files.length} artifact{files.length === 1 ? "" : "s"} listed by the
        engine
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Path</TableHead>
          <TableHead scope="col">Size</TableHead>
          <TableHead scope="col">Modified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={`${file.path}:${file.modifiedAt}`}>
            <TableCell>
              <span className="block min-w-48 max-w-md whitespace-normal break-all font-mono text-xs">
                {file.path}
              </span>
            </TableCell>
            <TableCell>{size(file.size)}</TableCell>
            <TableCell>
              <When value={file.modifiedAt} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
