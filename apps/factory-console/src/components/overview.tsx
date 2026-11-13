"use client";

import { Button } from "@asym/ui/components/shadcn/button-component";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { ControlButton } from "./controls";
import {
  Ago,
  EmptyNote,
  ExternalLink,
  Fact,
  Facts,
  IssueButton,
  LongText,
  Mono,
  Panel,
  RunButton,
  Section,
  StatusBadge,
  TextList,
  Unavailable,
  When,
  useConsole,
} from "./shared";
import {
  deriveLanes,
  parkedText,
  type Lane,
  type RoundStep,
  type StepRole,
} from "../lib/round";

import type { EngineState, Run } from "../lib/contracts";
import type {
  Availability,
  ControlAction,
  FACTORY_ACTIONS,
  FactoryDoc,
  FactoryState,
  IssueSummary,
  SelectionDecision,
} from "../lib/factory";

type FactoryValue = Availability<FactoryState> | undefined;
type EngineValue = Availability<EngineState> | undefined;
type FactoryAction = (typeof FACTORY_ACTIONS)[number];

const FACTORY_LABEL = "factory state";

/** Milliseconds for sorting; unparseable or missing stamps sort last. */
function time(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function scopeLabel(scope: string) {
  if (scope === "factory") return "Whole factory";
  const match = /^issue:(\d+)$/.exec(scope);
  return match ? `Issue #${match[1]}` : scope;
}

/** "Observed <time> (<ago>)" as its own fact, never merged into the data it qualifies. */
function Observed({ what, at }: { what: string; at: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      {what} observed <When value={at} /> (<Ago value={at} />)
    </p>
  );
}

export function Overview({ loading }: { loading: boolean }) {
  const { snapshot } = useConsole();
  const factory = snapshot?.factory;
  const engine = snapshot?.engine;
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Counts factory={factory} loading={loading} />
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <FactoryPanel factory={factory} loading={loading} />
        </div>
        <div className="min-w-0">
          <NeedsYou factory={factory} engine={engine} loading={loading} />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <RunningNow factory={factory} engine={engine} loading={loading} />
        </div>
        <div className="min-w-0">
          <NextPanel factory={factory} loading={loading} />
        </div>
        <div className="min-w-0">
          <BlockedPanel factory={factory} loading={loading} />
        </div>
        <div className="min-w-0">
          <CompletedPanel factory={factory} loading={loading} />
        </div>
        <div className="min-w-0">
          <SelectionPanel factory={factory} loading={loading} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------

const COUNTS: { label: string; status: IssueSummary["status"] }[] = [
  { label: "Active", status: "active" },
  { label: "Waiting", status: "waiting" },
  { label: "Blocked", status: "BLOCKED" },
  { label: "PR ready", status: "PR_READY" },
  { label: "Merged", status: "MERGED" },
  { label: "Not admitted (queued)", status: "queued" },
];

function Counts({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-2"
    >
      <h2 id={headingId} className="sr-only">
        Issue counts
      </h2>
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data, observedAt) => (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {COUNTS.map(({ label, status }) => (
                <li
                  key={status}
                  className="flex min-w-0 flex-col gap-1 rounded-xl border bg-card p-3"
                >
                  <span className="break-words text-xs text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-2xl font-semibold tabular-nums">
                    {
                      data.issues.filter((issue) => issue.status === status)
                        .length
                    }
                  </span>
                </li>
              ))}
            </ul>
            <Observed what="Counts" at={observedAt} />
          </>
        )}
      </Section>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Factory mode, intake and merge hold
// ---------------------------------------------------------------------------

const MODE_TEXT: Record<
  FactoryDoc["mode"],
  { label: string; meaning: string }
> = {
  run: {
    label: "run",
    meaning:
      "Admits new issues while intake is open and continues admitted work.",
  },
  drain: {
    label: "drain",
    meaning:
      "Admitted issues continue round by round; nothing new is admitted and nothing merges (a ready pull request ends as PR ready).",
  },
  stop: {
    label: "stop",
    meaning:
      "Nothing is admitted and no new round starts. A round that reaches its claim or context check ends its issue as stopped (Reopen brings it back); a round already past that check runs to its end but does not merge.",
  },
};

function FactoryPanel({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  return (
    <Panel
      title="Factory"
      description="Mode, intake and the merge hold, as the factory document records them."
    >
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data, observedAt) =>
          data.factory ? (
            <FactoryControls doc={data.factory} observedAt={observedAt} />
          ) : (
            <Unavailable title="Factory document unavailable">
              <p>The factory document is not installed yet.</p>
              <p className="mt-1 text-xs">
                Observed <When value={observedAt} />. No factory control can be
                confirmed until it exists.
              </p>
            </Unavailable>
          )
        }
      </Section>
    </Panel>
  );
}

function FactoryControls({
  doc,
  observedAt,
}: {
  doc: FactoryDoc;
  observedAt: string;
}) {
  const reasonId = useId();
  const hintId = useId();
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const act = (action: FactoryAction): ControlAction =>
    trimmed
      ? { kind: "factory", action, reason: trimmed }
      : { kind: "factory", action };
  const stopped = doc.mode === "stop";
  return (
    <>
      <Facts>
        <Fact term="Mode">
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge value={doc.mode} label={MODE_TEXT[doc.mode].label} />
            <span className="text-muted-foreground">
              {MODE_TEXT[doc.mode].meaning}
            </span>
          </span>
        </Fact>
        <Fact term="Intake">
          <StatusBadge value={doc.intake} />
        </Fact>
        <Fact term="Merge hold">
          <span className="flex flex-wrap items-center gap-2">
            {doc.mergeHold ? (
              <StatusBadge value="hold" label="merges held" />
            ) : (
              <StatusBadge value="run" label="not held" />
            )}
            {doc.mergeHold ? (
              <span className="text-muted-foreground">
                Ready PRs stop at PR ready instead of merging.
              </span>
            ) : null}
          </span>
        </Fact>
        <Fact term="Reason">
          {doc.reason ? <LongText>{doc.reason}</LongText> : "None recorded"}
        </Fact>
        <Fact term="Updated at">
          <When value={doc.updatedAt} /> (<Ago value={doc.updatedAt} />)
        </Fact>
        <Fact term="Updated by">{doc.updatedBy ?? "Not recorded"}</Fact>
        <Fact term="Observed">
          <When value={observedAt} /> (<Ago value={observedAt} />)
        </Fact>
      </Facts>
      <div className="flex min-w-0 flex-col gap-2">
        <Label htmlFor={reasonId}>Reason (optional)</Label>
        <Input
          id={reasonId}
          value={reason}
          maxLength={600}
          aria-describedby={hintId}
          onChange={(event) => setReason(event.target.value)}
        />
        <p id={hintId} className="text-xs text-muted-foreground">
          Recorded with the next factory control you send. Stop and drain take
          effect at a round&apos;s claim or context check; they never abandon a
          run or discard work. Resume does not reopen intake: use Resume intake
          for that.
        </p>
      </div>
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        {/* Each slot stays mounted so its receipt survives the state change it caused. */}
        <ControlButton
          action={act(doc.intake === "open" ? "pause-intake" : "resume-intake")}
          disabled={doc.intake === "paused" && stopped}
          disabledReason="The factory is stopped. Resume it before opening intake."
        />
        <ControlButton
          action={act(doc.mode === "run" ? "drain" : "resume")}
          confirmTitle="Drain the factory?"
          confirmBody="Intake pauses and nothing new is admitted. Issues already admitted keep going round by round, but nothing merges while draining: a ready pull request ends as PR ready. Nothing is discarded. Resume returns the factory to run, but intake stays paused until you also choose Resume intake."
        />
        <ControlButton
          action={act("stop")}
          disabled={stopped}
          disabledReason="The factory is already stopped."
          confirmTitle="Stop the factory?"
          confirmBody="Intake pauses and no new round starts. A round already past its context check runs to the end of the round, but it will not merge. A round that reaches its claim or context check while the factory is stopped ends its issue as stopped, and that issue needs Reopen. Nothing is discarded. Resume returns the factory to run and restarts waiting rounds; intake stays paused until you choose Resume intake."
        />
        <ControlButton
          action={act(doc.mergeHold ? "release-merge" : "hold-merge")}
        />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Running now
// ---------------------------------------------------------------------------

function RunningNow({
  factory,
  engine,
  loading,
}: {
  factory: FactoryValue;
  engine: EngineValue;
  loading: boolean;
}) {
  return (
    <Panel
      title="Running now"
      description="Delivery rounds with a recorded run or a live lease. Step progress comes only from the engine's node states."
    >
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data, observedAt) => (
          <Lanes issues={data.issues} observedAt={observedAt} engine={engine} />
        )}
      </Section>
    </Panel>
  );
}

function Lanes({
  issues,
  observedAt,
  engine,
}: {
  issues: IssueSummary[];
  observedAt: string;
  engine: EngineValue;
}) {
  const engineData = engine?.state === "available" ? engine.data : null;
  const lanes = deriveLanes(
    issues,
    engineData?.details ?? {},
    engineData?.detailErrors ?? {},
  ).filter((lane) => lane.runId !== null);
  if (!lanes.length)
    return (
      <>
        <EmptyNote>No delivery round is running.</EmptyNote>
        <Observed what="Work items" at={observedAt} />
      </>
    );
  return (
    <>
      {engine?.state === "unavailable" ? (
        <Unavailable title="Step progress unavailable">
          <p>{engine.reason}</p>
          <p className="mt-1 text-xs">
            Observed <When value={engine.observedAt} />. Steps are not guessed
            while the engine is unavailable.
          </p>
        </Unavailable>
      ) : null}
      <div className="flex flex-col gap-1">
        <Observed what="Work items" at={observedAt} />
        {engine?.state === "available" ? (
          <Observed what="Engine runs" at={engine.observedAt} />
        ) : null}
      </div>
      <ul className="flex min-w-0 flex-col gap-3">
        {lanes.map((lane) => (
          <LaneItem
            key={lane.issue.issue}
            lane={lane}
            engineUp={Boolean(engineData)}
          />
        ))}
      </ul>
    </>
  );
}

function LaneItem({ lane, engineUp }: { lane: Lane; engineUp: boolean }) {
  const { issue, runId, detail, returnedFrom } = lane;
  const route = issue.run?.route ?? issue.route;
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h3 className="min-w-0 text-sm font-medium">
          <IssueButton issue={issue.issue}>Issue #{issue.issue}</IssueButton>
        </h3>
        <StatusBadge value={issue.status} />
        {issue.control && issue.control !== "run" ? (
          <StatusBadge
            value={issue.control}
            label={`control: ${issue.control}`}
          />
        ) : null}
        {detail ? (
          <StatusBadge
            value={detail.run.status}
            label={`run ${detail.run.status}`}
          />
        ) : null}
      </div>
      <p className="break-words text-sm text-muted-foreground">
        Round {issue.round} · {route ?? "no"} route
        {issue.run ? (
          <>
            {" "}
            · round started <Ago value={issue.run.startedAt} />
          </>
        ) : null}
        {detail?.run.last_activity_at ? (
          <>
            {" "}
            · last engine activity <Ago value={detail.run.last_activity_at} />
          </>
        ) : null}
      </p>
      {runId ? (
        <div className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
          <span className="text-muted-foreground">Round run</span>
          <RunButton run={runId} />
        </div>
      ) : null}
      {returnedFrom ? (
        <p className="break-words text-sm">
          Round {returnedFrom.round} returned the work to {returnedFrom.to}
          {returnedFrom.summary ? `: ${returnedFrom.summary}` : "."}
        </p>
      ) : null}
      {engineUp ? <RunningSteps lane={lane} /> : null}
    </li>
  );
}

function RunningSteps({ lane }: { lane: Lane }) {
  if (!lane.detail)
    return (
      <p className="break-words text-sm text-muted-foreground">
        {lane.detailError
          ? `Step progress unavailable: ${lane.detailError}`
          : "Step progress was not read for this run in this observation."}
      </p>
    );
  const running = lane.steps.filter((step) => step.state === "running");
  if (!running.length)
    return (
      <p className="text-sm text-muted-foreground">
        The engine reports no step running at this instant.
      </p>
    );
  return (
    <ul
      aria-label={`Running steps for issue #${lane.issue.issue}`}
      className="flex min-w-0 flex-col gap-2"
    >
      {running.map((step) => (
        <RunningStep key={step.id} step={step} />
      ))}
    </ul>
  );
}

function RunningStep({ step }: { step: RoundStep }) {
  // Parallel steps show every role so a finished sibling is visible too.
  const members = step.parallel
    ? step.roles
    : [...step.roles, ...step.scripts].filter(
        (member) => member.state === "running",
      );
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-md border p-3 text-sm">
      <p className="font-medium">
        {step.label}
        {step.parallel ? " (parallel)" : ""}
      </p>
      {step.note ? (
        <p className="text-xs text-muted-foreground">{step.note}</p>
      ) : null}
      {members.length ? (
        <ul className="flex min-w-0 flex-col gap-1">
          {members.map((member) => (
            <li key={member.node} className="min-w-0">
              <RoleLine role={member} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Between nodes; no node of this step is running right now.
        </p>
      )}
    </li>
  );
}

function RoleLine({ role }: { role: StepRole }) {
  const timing = role.timing;
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <StatusBadge value={role.state} />
      <span className="font-medium">{role.name}</span>
      <Mono>{role.node}</Mono>
      {timing?.startedAt ? (
        <span className="text-muted-foreground">
          since <Ago value={timing.startedAt} />
        </span>
      ) : (
        <span className="text-muted-foreground">start not reported</span>
      )}
      {timing?.model ? (
        <span className="min-w-0 text-muted-foreground">
          model <Mono>{timing.model}</Mono>
          {timing.effort ? ` · ${timing.effort} effort` : ""}
        </span>
      ) : null}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Next
// ---------------------------------------------------------------------------

function isNext(issue: IssueSummary) {
  if (issue.status === "queued") return true;
  return (
    (issue.status === "pending" || issue.status === "waiting") &&
    issue.control === "run" &&
    !issue.run &&
    !issue.lease?.live
  );
}

function byPriority(left: IssueSummary, right: IssueSummary) {
  return (
    (right.priority ?? -1) - (left.priority ?? -1) || left.issue - right.issue
  );
}

function NextPanel({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  return (
    <Panel
      title="Next"
      description="Samson ranks the eligible frontier at admission, so this is the scope's priority order, not a promise of what runs next."
    >
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data, observedAt) => <NextList data={data} observedAt={observedAt} />}
      </Section>
    </Panel>
  );
}

function intakeNote(doc: FactoryDoc | null) {
  if (!doc)
    return "The factory document is not installed, so nothing is admitted.";
  if (doc.mode === "stop")
    return "The factory is stopped: nothing is admitted and no new round starts; a round already past its context check runs to its end without merging. After Resume, intake stays paused until you also choose Resume intake.";
  if (doc.mode === "drain")
    return "The factory is draining: admitted issues continue without merging, and nothing new is admitted.";
  if (doc.intake !== "open")
    return "Intake is paused: nothing new is admitted until it resumes.";
  return null;
}

function NextList({
  data,
  observedAt,
}: {
  data: FactoryState;
  observedAt: string;
}) {
  const next = data.issues.filter(isNext).sort(byPriority);
  const note = intakeNote(data.factory);
  return (
    <>
      {note ? <p className="text-sm font-medium">{note}</p> : null}
      {next.length ? (
        <ol className="flex min-w-0 flex-col gap-2">
          {next.map((issue) => (
            <li
              key={issue.issue}
              className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm"
            >
              <IssueButton issue={issue.issue} />
              <StatusBadge value={issue.status} />
              <span className="text-muted-foreground">
                {issue.priority === null
                  ? "no priority set"
                  : `priority ${issue.priority}`}
              </span>
              <span className="text-muted-foreground">
                · route {issue.route ?? "not chosen yet"}
              </span>
              <span className="text-muted-foreground">
                · control {issue.control ?? "none (not admitted)"}
              </span>
              {issue.parked ? (
                <span className="basis-full break-words text-muted-foreground">
                  {parkedText(issue.parked)}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyNote>
          Nothing is waiting: no admitted issue is pending or waiting, and no
          scope issue is left to admit.
        </EmptyNote>
      )}
      <Observed what="Work items" at={observedAt} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Blocked
// ---------------------------------------------------------------------------

function BlockedPanel({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  return (
    <Panel
      title="Blocked"
      description="Issues the round could not move forward, with the recorded recovery."
    >
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data, observedAt) => {
          const blocked = data.issues.filter(
            (issue) => issue.status === "BLOCKED",
          );
          return (
            <>
              {blocked.length ? (
                <ul className="flex min-w-0 flex-col gap-3">
                  {blocked.map((issue) => (
                    <BlockedItem key={issue.issue} issue={issue} />
                  ))}
                </ul>
              ) : (
                <EmptyNote>No issue is blocked.</EmptyNote>
              )}
              <Observed what="Work items" at={observedAt} />
            </>
          );
        }}
      </Section>
    </Panel>
  );
}

function BlockedItem({ issue }: { issue: IssueSummary }) {
  const { blocker } = issue;
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-lg border p-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h3 className="min-w-0 text-sm font-medium">
          <IssueButton issue={issue.issue}>Issue #{issue.issue}</IssueButton>
        </h3>
        <StatusBadge value="BLOCKED" />
        {blocker ? <Mono>{blocker.code}</Mono> : null}
      </div>
      {blocker ? (
        <Facts>
          <Fact term="Detail">
            {blocker.detail ? (
              <LongText>{blocker.detail}</LongText>
            ) : (
              "Not recorded"
            )}
          </Fact>
          <Fact term="Recovery">
            {blocker.recovery ? (
              <LongText>{blocker.recovery}</LongText>
            ) : (
              "Not recorded"
            )}
          </Fact>
          <Fact term="Blocked at">
            {blocker.at ? (
              <>
                <When value={blocker.at} /> (<Ago value={blocker.at} />)
              </>
            ) : (
              "Not recorded"
            )}
          </Fact>
          <Fact term="Retry resumes">
            {blocker.route ? `The ${blocker.route} route` : "Not recorded"}
          </Fact>
        </Facts>
      ) : (
        <EmptyNote>
          No blocker was recorded; open the issue to read its history.
        </EmptyNote>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Needs you
// ---------------------------------------------------------------------------

type Need = {
  key: string;
  badge: { value: string; label: string };
  text: React.ReactNode;
  todo: React.ReactNode;
  action: React.ReactNode;
};

function issueNeeds(issues: IssueSummary[]): Need[] {
  const needs: Need[] = [];
  for (const issue of issues) {
    const open = (
      <IssueButton issue={issue.issue}>Open issue #{issue.issue}</IssueButton>
    );
    if (issue.control === "hold")
      needs.push({
        key: `hold-${issue.issue}`,
        badge: { value: "hold", label: "held" },
        text: `Issue #${issue.issue} is held${issue.controlReason ? `: ${issue.controlReason}` : "."}`,
        todo: "Release it from the issue view when it may continue; the next claim refuses while it is held.",
        action: open,
      });
    if (issue.status === "stopped" || issue.control === "stop")
      needs.push({
        key: `stop-${issue.issue}`,
        badge: { value: "stopped", label: "stopped" },
        text: `Issue #${issue.issue} is stopped${issue.controlReason ? `: ${issue.controlReason}` : "."}`,
        todo: "A stopped issue stays stopped until an operator reopens it from the issue view.",
        action: open,
      });
    if (issue.status === "BLOCKED")
      needs.push({
        key: `blocked-${issue.issue}`,
        badge: { value: "BLOCKED", label: "blocked" },
        text: `Issue #${issue.issue} is blocked${issue.blocker ? ` (${issue.blocker.code})` : ""}.`,
        todo:
          issue.blocker?.recovery ??
          "No recovery was recorded; open the issue to read its history.",
        action: open,
      });
  }
  return needs;
}

function NeedsYou({
  factory,
  engine,
  loading,
}: {
  factory: FactoryValue;
  engine: EngineValue;
  loading: boolean;
}) {
  const { openReport, selectTab } = useConsole();
  const factoryData = factory?.state === "available" ? factory.data : null;
  const engineData = engine?.state === "available" ? engine.data : null;
  const needs: Need[] = [];
  if (factoryData) {
    needs.push(...issueNeeds(factoryData.issues));
    for (const item of factoryData.attention.filter(
      (entry) => entry.status === "open",
    )) {
      const report = item.report;
      needs.push({
        key: `attention-${item.fingerprint}`,
        badge: { value: "FINDINGS", label: "attention" },
        text: `${item.title} (${scopeLabel(item.scope)})`,
        todo: report
          ? "Read the analysis report; Samson also sees open material findings."
          : "No report is linked; review it with the analyses on Health & capacity.",
        action: report ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openReport(report)}
          >
            Open report
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => selectTab("health")}
          >
            Go to Health & capacity
          </Button>
        ),
      });
    }
    for (const entry of factoryData.malformed)
      needs.push({
        key: `malformed-${entry.name}`,
        badge: { value: "failed", label: "malformed" },
        text: (
          <>
            Document <Mono>{entry.name}</Mono> is malformed: {entry.reason}
          </>
        ),
        todo: "Reconcile it from the runbook; the Console ignores it until it parses.",
        action: null,
      });
  }
  if (engineData) needs.push(...runNeeds(engineData.runs));
  return (
    <Panel
      title="Needs you"
      description="Held, stopped and blocked issues, open attention items, flagged or failed runs on the current engine page, and malformed documents."
    >
      {factory?.state !== "available" ? (
        <Section value={factory} loading={loading} label={FACTORY_LABEL}>
          {() => null}
        </Section>
      ) : null}
      {engine?.state !== "available" ? (
        <Section value={engine} loading={loading} label="engine">
          {() => null}
        </Section>
      ) : null}
      {needs.length ? (
        <ul className="flex min-w-0 flex-col gap-3">
          {needs.map((need) => (
            <li
              key={need.key}
              className="flex min-w-0 flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <StatusBadge
                  value={need.badge.value}
                  label={need.badge.label}
                />
                <span className="min-w-0 break-words text-sm font-medium">
                  {need.text}
                </span>
              </div>
              <p className="break-words text-sm text-muted-foreground">
                {need.todo}
              </p>
              {need.action ? (
                <div className="min-w-0">{need.action}</div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : factoryData || engineData ? (
        <EmptyNote>
          {factoryData && engineData
            ? "Nothing needs you right now."
            : "Nothing needs you in the part of the factory that could be read."}
        </EmptyNote>
      ) : null}
      {factoryData && factory?.state === "available" ? (
        <Observed what="Factory state" at={factory.observedAt} />
      ) : null}
      {engineData && engine?.state === "available" ? (
        <Observed
          what={`Engine runs (offset ${engineData.offset})`}
          at={engine.observedAt}
        />
      ) : null}
    </Panel>
  );
}

function runNeeds(runs: Run[]): Need[] {
  return runs
    .filter((run) => run.needs_attention || run.status === "failed")
    .map((run) => {
      const failed = run.status === "failed";
      const at = run.completed_at ?? run.last_activity_at ?? run.started_at;
      return {
        key: `run-${run.id}`,
        badge: failed
          ? { value: "failed", label: "run failed" }
          : { value: "waiting", label: "needs attention" },
        text: (
          <>
            {run.workflow_name} run {failed ? "failed" : "needs attention"}
            {failed && run.needs_attention
              ? " and is flagged for attention"
              : ""}{" "}
            · <Ago value={at} />
          </>
        ),
        todo: failed
          ? "Open the run to see which node failed and why."
          : "Open the run to see what the engine flagged.",
        action: <RunButton run={run.id} />,
      };
    });
}

// ---------------------------------------------------------------------------
// Completed recently
// ---------------------------------------------------------------------------

function CompletedPanel({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  return (
    <Panel
      title="Completed recently"
      description="Issues that reached PR ready or merged, newest first."
    >
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data, observedAt) => {
          const done = data.issues
            .filter(
              (issue) =>
                issue.status === "PR_READY" || issue.status === "MERGED",
            )
            .sort((left, right) => time(right.updatedAt) - time(left.updatedAt))
            .slice(0, 6);
          return (
            <>
              {done.length ? (
                <ul className="flex min-w-0 flex-col gap-2">
                  {done.map((issue) => (
                    <li
                      key={issue.issue}
                      className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm"
                    >
                      <IssueButton issue={issue.issue} />
                      <StatusBadge value={issue.status} />
                      {issue.pr ? (
                        <ExternalLink href={issue.pr.url}>
                          PR #{issue.pr.number}
                        </ExternalLink>
                      ) : (
                        <span className="text-muted-foreground">
                          No PR recorded
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        · updated <When value={issue.updatedAt} /> (
                        <Ago value={issue.updatedAt} />)
                      </span>
                      {issue.pr?.mergedAt ? (
                        <span className="text-muted-foreground">
                          · merged <When value={issue.pr.mergedAt} />
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyNote>
                  No issue has reached PR ready or merged yet.
                </EmptyNote>
              )}
              <Observed what="Work items" at={observedAt} />
            </>
          );
        }}
      </Section>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Samson's last selection
// ---------------------------------------------------------------------------

function SelectionPanel({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  return (
    <Panel
      title="Samson's last selection"
      description="The selector's most recent admission decision, as recorded."
    >
      <Section value={factory} loading={loading} label={FACTORY_LABEL}>
        {(data) => <Selection decisions={data.selection} />}
      </Section>
    </Panel>
  );
}

function Selection({ decisions }: { decisions: SelectionDecision[] }) {
  const last = decisions.at(-1);
  if (!last)
    return <EmptyNote>No selection decision has been recorded yet.</EmptyNote>;
  const earlier = decisions.slice(0, -1).slice(-5).reverse();
  return (
    <>
      <Decision decision={last} />
      {earlier.length ? (
        <Collapsible className="flex min-w-0 flex-col items-start gap-3">
          <CollapsibleTrigger
            render={
              <Button variant="outline" size="sm">
                <ChevronDown aria-hidden="true" />
                Earlier selection decisions
              </Button>
            }
          />
          <CollapsibleContent className="w-full min-w-0">
            <ol
              aria-label="Earlier selection decisions, newest first"
              className="flex min-w-0 flex-col gap-3"
            >
              {earlier.map((decision) => (
                <li
                  key={`${decision.at}-${decision.issue}`}
                  className="min-w-0 rounded-lg border p-3"
                >
                  <Decision decision={decision} />
                </li>
              ))}
            </ol>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </>
  );
}

function Frontier({ items }: { items: string[] }) {
  if (!items.length) return <>Not recorded</>;
  return (
    <ul
      aria-label="Eligible frontier"
      className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1"
    >
      {items.map((item, index) => {
        const match = /^#([1-9][0-9]{0,7})$/.exec(item.trim());
        return (
          <li key={`${index}-${item}`} className="min-w-0">
            {match ? (
              <IssueButton issue={Number(match[1])}>{item}</IssueButton>
            ) : (
              <span className="break-words">{item}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Decision({ decision }: { decision: SelectionDecision }) {
  const reason = decision.reason;
  return (
    <Facts>
      <Fact term="Decided at">
        <When value={decision.at} /> (<Ago value={decision.at} />)
      </Fact>
      <Fact term="Chose">
        <IssueButton issue={decision.issue} />
      </Fact>
      <Fact term="Frontier">
        <Frontier items={decision.frontier} />
      </Fact>
      <Fact term="Reason summary">
        {reason?.summary ? (
          <LongText>{reason.summary}</LongText>
        ) : (
          "Not recorded"
        )}
      </Fact>
      <Fact term="Expected benefit">
        {reason?.expectedBenefit ? (
          <LongText>{reason.expectedBenefit}</LongText>
        ) : (
          "Not recorded"
        )}
      </Fact>
      <Fact term="Uncertainty">
        {reason?.uncertainty ? (
          <LongText>{reason.uncertainty}</LongText>
        ) : (
          "Not recorded"
        )}
      </Fact>
      <Fact term="Affected areas">
        <TextList items={reason?.affectedAreas} empty="Not recorded" />
      </Fact>
      <Fact term="Sources">
        <TextList items={reason?.sources} empty="Not recorded" />
      </Fact>
      <Fact term="Selector run">
        <RunButton run={decision.run} />
      </Fact>
    </Facts>
  );
}
