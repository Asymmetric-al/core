"use client";

import { Badge } from "@asym/ui/components/shadcn/badge-component";
import { Button } from "@asym/ui/components/shadcn/button-component";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import {
  CornerDownLeft,
  Hourglass,
  LayoutGrid,
  List,
  RefreshCw,
} from "lucide-react";
import { useId, useState } from "react";

import {
  Ago,
  EmptyNote,
  Fact,
  Facts,
  Mono,
  Panel,
  RunButton,
  Section,
  StatusBadge,
  Unavailable,
  When,
  useConsole,
} from "./shared";
import { duration, elapsed } from "../lib/contracts";
import { deriveLanes, focusLanes } from "../lib/round";

import type { EngineState } from "../lib/contracts";
import type { Availability, IssueSummary } from "../lib/factory";
import type { Lane, RoundStep, StepRole, StepState } from "../lib/round";

type View = "lanes" | "list";

const STATE_WORD: Record<StepState, string> = {
  pending: "pending",
  running: "running",
  completed: "completed",
  failed: "failed",
  skipped: "skipped",
  "not-planned": "not in this route",
  unobserved: "not observed",
};

function laneTitle(lane: Lane) {
  const route = lane.issue.run?.route ?? lane.issue.route;
  return `#${lane.issue.issue} · round ${lane.issue.round} · ${route ?? "no"} route`;
}

/** Why a lane with a run has no node states, or null when it has them. */
function missingDetail(lane: Lane, engineReason: string | null) {
  if (!lane.runId || lane.detail) return null;
  return (
    lane.detailError ??
    engineReason ??
    "The engine did not return this run's detail in this observation."
  );
}

function modelText(role: StepRole) {
  const model = role.timing?.model;
  if (!model) return "model not reported";
  return role.timing?.effort
    ? `model ${model} · effort ${role.timing.effort}`
    : `model ${model}`;
}

/** Re-read the snapshot the shell owns (the same read as "Refresh now"). */
function ReadAgain() {
  const { scope } = useConsole();
  const client = useQueryClient();
  const fetching = useIsFetching({ queryKey: [scope, "snapshot"] }) > 0;
  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        disabled={fetching}
        onClick={() =>
          void client.refetchQueries({
            queryKey: [scope, "snapshot"],
            type: "active",
          })
        }
      >
        <RefreshCw aria-hidden="true" />
        Read the factory again
      </Button>
    </div>
  );
}

export function WorkMap({ loading }: { loading: boolean }) {
  const { snapshot } = useConsole();
  const [view, setView] = useState<View>("lanes");
  return (
    <Panel
      title="Live work map"
      description="Issues with a live or pending round, one lane each. Step states come only from the engine's node states for the issue's live round run; nothing is inferred from the work item."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          aria-label="Work map view"
          variant="outline"
          size="sm"
          value={[view]}
          onValueChange={(next) => {
            const chosen = next[0];
            if (chosen === "lanes" || chosen === "list") setView(chosen);
          }}
        >
          <ToggleGroupItem value="lanes">
            <LayoutGrid aria-hidden="true" />
            Lanes
          </ToggleGroupItem>
          <ToggleGroupItem value="list">
            <List aria-hidden="true" />
            List
          </ToggleGroupItem>
        </ToggleGroup>
        {snapshot ? (
          <Observations factory={snapshot.factory} engine={snapshot.engine} />
        ) : null}
      </div>
      <Section
        value={snapshot?.factory}
        loading={loading}
        label="factory state"
      >
        {(factory) => (
          <MapBody
            issues={factory.issues}
            engine={snapshot?.engine ?? null}
            view={view}
          />
        )}
      </Section>
      {snapshot && snapshot.factory.state === "unavailable" ? (
        <ReadAgain />
      ) : null}
    </Panel>
  );
}

function Observations({
  factory,
  engine,
}: {
  factory: Availability<unknown>;
  engine: Availability<EngineState>;
}) {
  return (
    <dl className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
      <div className="flex flex-wrap gap-x-1">
        <dt>Factory state observed</dt>
        <dd>
          <When value={factory.observedAt} /> (
          <Ago value={factory.observedAt} />)
        </dd>
      </div>
      <div className="flex flex-wrap gap-x-1">
        <dt>
          Engine{" "}
          {engine.state === "available" ? "observed" : "unavailable, checked"}
        </dt>
        <dd>
          <When value={engine.observedAt} /> (<Ago value={engine.observedAt} />)
        </dd>
      </div>
    </dl>
  );
}

function MapBody({
  issues,
  engine,
  view,
}: {
  issues: IssueSummary[];
  engine: Availability<EngineState> | null;
  view: View;
}) {
  const data = engine?.state === "available" ? engine.data : null;
  const engineReason =
    engine?.state === "unavailable"
      ? engine.reason
      : engine
        ? null
        : "The engine has not been read yet.";
  const [everyLane, setEveryLane] = useState(false);
  // Live rounds first; the map stays focused on active work and shows at
  // most LANE_LIMIT lanes until the operator asks for the rest.
  const { shown, total } = focusLanes(
    deriveLanes(issues, data?.details ?? {}, data?.detailErrors ?? {}),
    LANE_LIMIT,
    everyLane,
  );
  if (!total)
    return (
      <EmptyNote>
        No issue has a live or pending round. Admitted issues appear here when
        their round is claimed or queued.
      </EmptyNote>
    );
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {shown.map((lane) => (
        <LaneSection
          key={lane.issue.issue}
          lane={lane}
          engineReason={engineReason}
          view={view}
        />
      ))}
      {total > LANE_LIMIT ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p>
            Showing {shown.length} of {total} lanes with live or pending rounds.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEveryLane(!everyLane)}
          >
            {everyLane
              ? `Show the first ${LANE_LIMIT} lanes`
              : `Show all ${total} lanes`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

const LANE_LIMIT = 24;

function LaneSection({
  lane,
  engineReason,
  view,
}: {
  lane: Lane;
  engineReason: string | null;
  view: View;
}) {
  const headingId = useId();
  const missing = missingDetail(lane, engineReason);
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 rounded-xl border p-4"
    >
      <LaneHeader lane={lane} headingId={headingId} />
      {lane.returnedFrom ? <Returned value={lane.returnedFrom} /> : null}
      {lane.waiting ? (
        <p className="flex items-start gap-2 text-sm">
          <Hourglass
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <span className="min-w-0 break-words">{lane.waiting}</span>
        </p>
      ) : null}
      {missing ? (
        <Unavailable title={`Node states unavailable: ${missing}`}>
          Steps show as not observed. The Console does not guess progress from
          the work item.
        </Unavailable>
      ) : null}
      {lane.steps.length === 0 ? (
        <EmptyNote>
          No round run is live for this issue, so there are no steps to show
          yet.
        </EmptyNote>
      ) : view === "lanes" ? (
        <ol
          aria-label={`Round steps for #${lane.issue.issue}`}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {lane.steps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </ol>
      ) : (
        <ol
          aria-label={`Round steps for #${lane.issue.issue}`}
          className="flex list-decimal flex-col gap-2 pl-5 text-sm"
        >
          {lane.steps.map((step) => (
            <li
              key={step.id}
              aria-current={step.state === "running" ? "step" : undefined}
              className={`break-words ${step.planned ? "" : "text-muted-foreground"}`}
            >
              <StepSentence step={step} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function LaneHeader({ lane, headingId }: { lane: Lane; headingId: string }) {
  const { openIssue } = useConsole();
  const { issue, detail } = lane;
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <h3 id={headingId} className="break-words text-base font-semibold">
            {laneTitle(lane)}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={issue.status} />
            {issue.control ? (
              <StatusBadge
                value={issue.control}
                label={`control ${issue.control}`}
              />
            ) : null}
            {detail ? (
              <StatusBadge
                value={detail.run.status}
                label={`run ${detail.run.status}`}
              />
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openIssue(issue.issue)}
          >
            Open issue #{issue.issue}
          </Button>
          {lane.runId ? <RunButton run={lane.runId}>Open run</RunButton> : null}
        </div>
      </div>
      <Facts>
        <Fact term="Round run">
          {lane.runId ? <Mono>{lane.runId}</Mono> : "No live run"}
        </Fact>
        <Fact term="Round started">
          <When value={issue.run?.startedAt} />
        </Fact>
        <Fact term="Node states observed">
          {detail ? <When value={detail.observedAt} /> : "Not observed"}
        </Fact>
        {issue.controlReason ? (
          <Fact term="Control reason">{issue.controlReason}</Fact>
        ) : null}
      </Facts>
    </div>
  );
}

function Returned({ value }: { value: NonNullable<Lane["returnedFrom"]> }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-3 text-sm">
      <CornerDownLeft
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-warning"
      />
      <div className="min-w-0">
        <p className="font-medium">
          Returned from round {value.round} to {value.to}
        </p>
        {value.summary ? (
          <p className="mt-1 whitespace-pre-wrap break-words">
            {value.summary}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function stepTone(step: RoundStep) {
  if (step.state === "running") return "border-info";
  if (step.state === "failed") return "border-destructive";
  if (!step.planned) return "border-dashed text-muted-foreground";
  return "";
}

function StepCard({ step }: { step: RoundStep }) {
  return (
    <li
      aria-current={step.state === "running" ? "step" : undefined}
      className={`flex min-w-0 flex-col gap-2 rounded-lg border p-3 text-sm ${stepTone(step)} ${step.parallel ? "sm:col-span-2" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="break-words font-medium">{step.label}</h4>
        <StatusBadge value={step.state} />
      </div>
      {step.parallel ||
      step.conditional ||
      (!step.planned && step.state !== "not-planned") ? (
        <div className="flex flex-wrap gap-2">
          {step.parallel ? <Badge variant="outline">in parallel</Badge> : null}
          {step.conditional ? (
            <Badge variant="outline">only on genuine disputes</Badge>
          ) : null}
          {!step.planned && step.state !== "not-planned" ? (
            <Badge variant="secondary">not in this route</Badge>
          ) : null}
        </div>
      ) : null}
      {step.note ? (
        <p className="break-words text-xs text-muted-foreground">{step.note}</p>
      ) : null}
      {step.roles.length ? (
        <ul
          aria-label={step.parallel ? "Reviewers working in parallel" : "Roles"}
          className={
            step.parallel ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"
          }
        >
          {step.roles.map((role) => (
            <RoleLine key={role.node} role={role} />
          ))}
        </ul>
      ) : (
        <StepTimes step={step} />
      )}
      {step.scripts.length ? (
        <ul
          aria-label="Trusted scripts"
          className="flex flex-col gap-0.5 text-xs text-muted-foreground"
        >
          {step.scripts.map((script) => (
            <li key={script.node} className="break-words">
              Trusted script <span className="font-mono">{script.node}</span>:{" "}
              {STATE_WORD[script.state]}
              {script.error ? ` · error: ${script.error}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function StepTimes({ step }: { step: RoundStep }) {
  if (!step.startedAt && !step.endedAt) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {step.startedAt ? (
        <>
          Started <When value={step.startedAt} />
        </>
      ) : null}
      {step.startedAt && step.endedAt ? " · " : null}
      {step.endedAt ? (
        <>
          Ended <When value={step.endedAt} />
        </>
      ) : null}
    </p>
  );
}

function RoleLine({ role }: { role: StepRole }) {
  const { now } = useConsole();
  const timing = role.timing;
  const running =
    role.state === "running" && timing?.startedAt && now
      ? elapsed(timing.startedAt, null, now)
      : null;
  return (
    <li className="flex min-w-0 flex-col gap-1 rounded-md border p-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="break-words font-medium">{role.name}</span>
        <StatusBadge value={role.state} />
      </div>
      <p className="break-words text-xs text-muted-foreground">
        node <Mono>{role.node}</Mono>
      </p>
      <p className="break-words text-xs">{modelText(role)}</p>
      {timing?.startedAt ? (
        <p className="break-words text-xs text-muted-foreground">
          Started <When value={timing.startedAt} />
          {running !== null ? ` · running for ${duration(running)}` : ""}
        </p>
      ) : null}
      {timing?.endedAt ? (
        <p className="break-words text-xs text-muted-foreground">
          Ended <When value={timing.endedAt} />
        </p>
      ) : null}
      {timing && timing.attempts > 1 ? (
        <p className="text-xs">Attempt {timing.attempts}</p>
      ) : null}
      {role.error ? (
        <p className="break-words text-xs text-destructive">
          Error: {role.error}
        </p>
      ) : null}
    </li>
  );
}

/** One step as a sentence, e.g. "Build: running. Bezalel, node build, model …, started …." */
function StepSentence({ step }: { step: RoundStep }) {
  const qualifiers = [
    step.parallel ? "in parallel" : null,
    step.conditional ? "only on genuine disputes" : null,
  ].filter(Boolean);
  return (
    <>
      <span className="font-medium">
        {step.label}
        {qualifiers.length ? ` (${qualifiers.join(", ")})` : ""}:{" "}
        {STATE_WORD[step.state]}.
      </span>
      {!step.planned && step.state !== "not-planned"
        ? " Not in this route."
        : null}
      {step.note ? ` ${step.note}.` : null}
      {step.roles.map((role) => (
        <RoleSentence key={role.node} role={role} stepState={step.state} />
      ))}
      {!step.roles.length && step.startedAt ? (
        <>
          {" "}
          Started <When value={step.startedAt} />
          {step.endedAt ? (
            <>
              , ended <When value={step.endedAt} />
            </>
          ) : null}
          .
        </>
      ) : null}
      {step.scripts.length
        ? ` Trusted scripts: ${step.scripts.map((script) => `${script.node} ${STATE_WORD[script.state]}`).join(", ")}.`
        : null}
    </>
  );
}

function RoleSentence({
  role,
  stepState,
}: {
  role: StepRole;
  stepState: StepState;
}) {
  const timing = role.timing;
  return (
    <>
      {` ${role.name}, node ${role.node}`}
      {role.state !== stepState ? `, ${STATE_WORD[role.state]}` : ""}
      {`, ${modelText(role)}`}
      {timing?.startedAt ? (
        <>
          , started <When value={timing.startedAt} />
        </>
      ) : null}
      {timing?.endedAt ? (
        <>
          , ended <When value={timing.endedAt} />
        </>
      ) : null}
      {timing && timing.attempts > 1 ? `, attempt ${timing.attempts}` : ""}
      {role.error ? `, error: ${role.error}` : ""}.
    </>
  );
}
