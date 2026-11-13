"use client";

import { Button } from "@asym/ui/components/shadcn/button-component";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { RefreshCw, RotateCcw } from "lucide-react";
import { useId, useState } from "react";

import { ControlButton, ViewAuthority } from "./controls";
import { STALE_AFTER_MS, useIssue } from "./data";
import {
  Ago,
  EmptyNote,
  ErrorNote,
  ExternalLink,
  Fact,
  Facts,
  LoadingRows,
  LongText,
  Mono,
  RunButton,
  StaleNotice,
  StatusBadge,
  TextList,
  When,
  useConsole,
} from "./shared";
import { IssueTiming } from "./timing";
import { REFUSAL_MESSAGES, RUN_ID_PATTERN } from "../lib/factory";
import { rebindText } from "../lib/ledger";
import { parkedText } from "../lib/round";

import type {
  ControlAction,
  FeedbackDoc,
  IssueDetailView,
  WorkItem,
} from "../lib/factory";

type EndState = WorkItem["assignment"]["endState"];
type IssueAction = Extract<ControlAction, { kind: "issue" }>["action"];

const END_STATE_TEXT: Record<EndState, string> = {
  PR_READY: "PR ready",
  MERGED: "Merged",
};

const END_STATE_EXPLAIN: Record<EndState, string> = {
  PR_READY:
    "This assignment ends at PR ready: the factory finishes when the pull request passes its required checks and is ready for a person to merge. It does not merge it.",
  MERGED:
    "This assignment ends at Merged: once the pull request is ready, the factory merges it itself through branch protection at the exact head it verified, unless merges are held.",
};

const CONTROL_EXPLAIN: Record<WorkItem["control"], string> = {
  run: "Run: rounds continue normally. Hold and stop take effect at a round's claim or context check; a round already past that check runs to the end of the round, but nothing merges unless the control is run. No work is discarded.",
  hold: "Held: the next claim refuses until the issue is released. A round already past its context check runs to the end of the round. Work, branch and pull request are preserved.",
  stop: "Stop: a round already past its context check runs to the end of the round (it can still build, review and publish, but it does not merge); after that the issue is not claimed again. Once no run is attached it settles as stopped, and Reopen brings it back. Work, branch and pull request are preserved.",
};

const REVIEWERS: readonly (readonly [string, string])[] = [
  ["micaiah", "Micaiah"],
  ["luke", "Luke"],
];

export function IssueSheet({
  issue,
  close,
}: {
  issue: number | null;
  close: () => void;
}) {
  // Keep the last issue on screen while the sheet animates closed.
  const [shown, setShown] = useState<number | null>(issue);
  if (issue !== null && issue !== shown) setShown(issue);
  const current = issue ?? shown;
  return (
    <Sheet
      open={issue !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        {current === null ? null : (
          <IssueBody key={current} issue={current} open={issue !== null} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function IssueBody({ issue, open }: { issue: number; open: boolean }) {
  const { scope, paused, now } = useConsole();
  const query = useIssue(scope, issue, paused || !open);
  const view = query.data ?? null;
  // Measured on the browser clock from when this read arrived.
  const stale = Boolean(
    view && now && now - query.dataUpdatedAt > STALE_AFTER_MS,
  );
  // Controls here act on this read, so its own freshness gates them too.
  const viewReason = query.isError
    ? `The latest read of #${issue} failed; refresh before acting.`
    : stale
      ? `This observation of #${issue} is stale; refresh before acting.`
      : !query.isFetchedAfterMount
        ? `Re-reading #${issue}…`
        : null;
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-6">
      <SheetHeader className="p-0 pr-8">
        <SheetTitle className="text-lg">Issue #{issue}</SheetTitle>
        <SheetDescription>
          <Summary view={view} pending={query.isPending} />
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw aria-hidden="true" />
          Refresh issue #{issue}
        </Button>
        <StaleNotice stale={stale}>
          This observation is stale; refresh before relying on it.
        </StaleNotice>
      </div>
      {query.isError ? (
        <ErrorNote>
          <p className="font-medium">Issue #{issue} could not be read</p>
          <p>{query.error.message}</p>
          {view ? (
            <p className="text-xs">
              Showing the last successful observation, from{" "}
              <When value={view.observedAt} />.
            </p>
          ) : null}
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              <RotateCcw aria-hidden="true" />
              Retry
            </Button>
          </div>
        </ErrorNote>
      ) : null}
      {view ? (
        <ViewAuthority reason={viewReason}>
          <IssueSections view={view} />
        </ViewAuthority>
      ) : query.isPending ? (
        <LoadingRows label={`Loading issue #${issue}…`} rows={6} />
      ) : null}
    </div>
  );
}

function Summary({
  view,
  pending,
}: {
  view: IssueDetailView | null;
  pending: boolean;
}) {
  if (!view)
    return (
      <>
        {pending
          ? "Reading the work item…"
          : "No observation of this issue is available."}
      </>
    );
  const { item } = view;
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {item ? (
        <>
          <span>Status</span>
          <StatusBadge value={item.status} />
          <span>· control</span>
          <StatusBadge value={item.control} />
        </>
      ) : (
        <StatusBadge value="queued" />
      )}
      <span>
        · observed <When value={view.observedAt} /> (
        <Ago value={view.observedAt} />)
      </span>
    </span>
  );
}

function IssueSections({ view }: { view: IssueDetailView }) {
  const { item } = view;
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <RequestBlock view={view} />
      <ControlsBlock view={view} />
      {item ? (
        <>
          <CurrentRoundBlock item={item} lease={view.lease} />
          <Block title="Elapsed time">
            <IssueTiming view={view} item={item} />
          </Block>
          <BlockerBlock item={item} />
          <BriefBlock item={item} />
          <AcceptanceBlock item={item} />
          <CandidateBlock item={item} />
          <ReviewsBlock item={item} />
          <FinalBlock item={item} />
          <PullRequestBlock item={item} />
          <FeedbackBlock feedback={view.feedback} />
          <HistoryBlock item={item} />
          <RequestsBlock item={item} />
        </>
      ) : (
        <Block title="Work item">
          <EmptyNote>
            The selector has not admitted #{view.issue} yet, so there is no work
            item: no round, brief, acceptance, candidate, reviews, pull request
            or history. It admits from the authorized scope at its next pass.
          </EmptyNote>
        </Block>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col gap-3 border-t pt-4"
    >
      <h3 id={id} className="text-base font-semibold">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-medium">{children}</h4>;
}

function Hash({ value }: { value: string | null | undefined }) {
  return value ? <Mono>{value}</Mono> : <>Not recorded</>;
}

function newestFirst<Entry extends { at: string }>(
  entries: readonly Entry[],
): Entry[] {
  const time = (value: string) => {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
  };
  return entries
    .map((entry, index) => ({ entry, index, at: time(entry.at) }))
    .sort((left, right) => right.at - left.at || right.index - left.index)
    .map(({ entry }) => entry);
}

/** The pack records the admission reason as JSON; show its summary when present. */
function admissionReason(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "summary" in parsed) {
      const { summary } = parsed as { summary: unknown };
      if (typeof summary === "string" && summary.trim()) return summary;
    }
  } catch {
    // Plain text reason.
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Request and controls
// ---------------------------------------------------------------------------

function RequestBlock({ view }: { view: IssueDetailView }) {
  const { snapshot } = useConsole();
  const { item } = view;
  const noRepository =
    snapshot !== null && snapshot.settings.repository === null;
  const reason = admissionReason(item?.assignment.reason);
  return (
    <Block title="Request">
      {view.requestUrl && !noRepository ? (
        <p className="text-sm">
          <ExternalLink href={view.requestUrl}>
            Open GitHub issue #{view.issue}
          </ExternalLink>
        </p>
      ) : (
        <EmptyNote>
          No GitHub repository is configured, so there is no link to the
          request.
        </EmptyNote>
      )}
      {item && !view.inScope ? (
        <EmptyNote>
          #{view.issue} is no longer in the authorized scope. Its work item is
          kept, but its priority cannot be set.
        </EmptyNote>
      ) : null}
      {item ? (
        <Facts>
          <Fact term="Owner">{item.assignment.owner}</Fact>
          <Fact term="End state">
            <StatusBadge
              value={item.assignment.endState}
              label={END_STATE_TEXT[item.assignment.endState]}
            />
          </Fact>
          <Fact term="Assigned at">
            <When value={item.assignment.assignedAt} />
          </Fact>
          <Fact term="Assigned by">
            <Hash value={item.assignment.assignedBy} />
          </Fact>
          <Fact term="Admission reason">
            {reason ? <LongText>{reason}</LongText> : "Not recorded"}
          </Fact>
          <Fact term="Assignment">
            <Mono>{item.assignment.id}</Mono>
          </Fact>
          <Fact term="Protected paths">
            <ProtectedPaths grant={view.allowProtected} />
          </Fact>
        </Facts>
      ) : (
        <EmptyNote>
          No assignment yet: the selector has not admitted #{view.issue}.
        </EmptyNote>
      )}
    </Block>
  );
}

/** What core/scope.allowProtected lets this issue's scope reach. */
function ProtectedPaths({
  grant,
}: {
  grant: IssueDetailView["allowProtected"];
}) {
  if (grant === null)
    return <>Not authorized: its scope may not reach protected paths</>;
  if (grant === true) return <>Authorized for every protected path</>;
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span>Authorized for:</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        {grant.map((glob) => (
          <Mono key={glob}>{glob}</Mono>
        ))}
      </span>
    </span>
  );
}

function ControlsBlock({ view }: { view: IssueDetailView }) {
  const { item } = view;
  return (
    <Block title="Controls">
      {item ? (
        <IssueActions issue={view.issue} item={item} lease={view.lease} />
      ) : (
        <EmptyNote>
          The selector has not admitted #{view.issue}, so hold, stop, retry,
          reopen and reconcile do not apply. Only its priority can be set.
        </EmptyNote>
      )}
      <PriorityControl view={view} />
      {item?.run ? (
        <CancelRunControl
          issue={view.issue}
          round={item.round}
          run={item.run}
        />
      ) : null}
    </Block>
  );
}

function IssueActions({
  issue,
  item,
  lease,
}: {
  issue: number;
  item: WorkItem;
  lease: IssueDetailView["lease"];
}) {
  const reasonId = useId();
  const reasonHelpId = useId();
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const make = (action: IssueAction): ControlAction => ({
    kind: "issue",
    issue,
    action,
    ...(trimmed ? { reason: trimmed } : {}),
  });
  const held = item.control === "hold";
  const stopped = item.control === "stop";
  // A stop pressed after the round's context check leaves the round running;
  // when it ends, the issue keeps control stop with another status. A second
  // stop (no run attached) settles it as stopped, so it can be reopened.
  // Only a non-terminal status can be left behind; PR_READY, MERGED and
  // BLOCKED are real outcomes and must never be rewritten by a second stop.
  const settling =
    stopped &&
    !item.run &&
    ["pending", "active", "waiting"].includes(item.status);
  const canRetry = item.status === "BLOCKED" && item.control === "run";
  const canAdopt =
    ["BLOCKED", "stopped"].includes(item.status) && !item.run && !lease?.live;
  const canReopen =
    (item.status === "PR_READY" || item.status === "stopped") && !held;
  // The pack settles only a run whose lease has ended; an idle item's
  // reconcile records the request, which re-arms its next round's start.
  const idle = item.status === "pending" || item.status === "waiting";
  const unsettled = idle || item.status === "active";
  const canReconcile = idle || (item.status === "active" && !lease?.live);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <SubHeading>Issue controls</SubHeading>
      <Facts>
        <Fact term="Control">
          <StatusBadge value={item.control} />
          {item.controlReason ? (
            <span className="mt-1 block break-words text-muted-foreground">
              {item.controlReason}
            </span>
          ) : null}
        </Fact>
        <Fact term="Status">
          <StatusBadge value={item.status} />
        </Fact>
      </Facts>
      <p className="text-sm text-muted-foreground">
        {CONTROL_EXPLAIN[item.control]}
      </p>
      <Field>
        <FieldLabel htmlFor={reasonId}>Reason (optional)</FieldLabel>
        <Input
          id={reasonId}
          value={reason}
          maxLength={600}
          autoComplete="off"
          aria-describedby={reasonHelpId}
          onChange={(event) => setReason(event.target.value)}
        />
        <FieldDescription id={reasonHelpId}>
          Recorded with the request on the work item.
        </FieldDescription>
      </Field>
      {/* Every slot stays mounted, so its requested → observed receipt survives
          the state change it caused; a slot that does not apply is disabled. */}
      <div className="flex min-w-0 flex-col gap-3">
        <ControlButton
          action={make(held ? "release" : "hold")}
          label={held ? `Release issue #${issue}` : `Hold issue #${issue}`}
          disabled={stopped}
          disabledReason={`#${issue} is stopped; reopen it before holding or releasing it.`}
        />
        <ControlButton
          action={make("retry")}
          label={`Retry issue #${issue}`}
          disabled={!canRetry}
          disabledReason="Only a BLOCKED issue whose control is run can be retried."
        />
        <ControlButton
          action={make("reopen")}
          label={`Reopen issue #${issue}`}
          disabled={!canReopen}
          disabledReason={
            settling
              ? `Stop #${issue} again first: its round ended while it was stopping, so it is not settled as stopped yet.`
              : "Only a PR ready or stopped issue that is not held can be reopened."
          }
        />
        <ControlButton
          action={make("stop")}
          label={
            settling
              ? `Stop issue #${issue} again to settle it`
              : `Stop issue #${issue}`
          }
          disabled={stopped && !settling}
          disabledReason={
            item.run
              ? `#${issue} is stopping; its live round runs to the end of the round first.`
              : `#${issue} is already stopped.`
          }
          confirmBody={`A round already past its context check runs to the end of the round; after that #${issue} is not claimed again and settles as stopped until it is reopened. Work, branch and pull request are preserved.`}
        />
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            After a new factory release is installed, an issue stays on the
            release it was assigned under and its retry or reopen is refused.
            Moving it records both releases on the assignment and drops the
            reviews and final acceptance earned under the old one, so its
            candidate is reviewed again before anything is published or merged.
            It starts nothing: retry or reopen the issue afterwards.
          </p>
          <ControlButton
            action={make("adopt-policy")}
            label={`Move issue #${issue} to the installed release`}
            disabled={!canAdopt}
            disabledReason={`Only a BLOCKED or stopped issue that no run owns can be moved; #${issue} is ${item.status}.`}
            confirmBody={`#${issue} is bound to the installed release instead of the one it was assigned under. Its reviews and final acceptance are dropped and must be earned again; its branch, pull request, acceptance and history are kept. The control is refused if the issue is already on the installed release.`}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Reconcile settles an issue that a cancelled run, or a run that
            failed to record its round, left active: once that run has ended,
            the issue waits again on the run&apos;s route. On a pending or
            waiting issue it only records the request, which lets the intake
            sweep start the next round again.
          </p>
          <ControlButton
            action={make("reconcile")}
            label={`Reconcile issue #${issue}`}
            disabled={!canReconcile}
            disabledReason={
              unsettled
                ? `#${issue}'s round is still running: its lease is live. Reconcile settles only a run that ended without recording its round.`
                : `#${issue} has settled (${item.status}); there is nothing to reconcile.`
            }
          />
        </div>
      </div>
    </div>
  );
}

function PriorityControl({ view }: { view: IssueDetailView }) {
  const inputId = useId();
  const helpId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const text = value.trim();
  const parsed = /^\d{1,3}$/.test(text) ? Number(text) : Number.NaN;
  const valid = Number.isInteger(parsed) && parsed >= 0 && parsed <= 100;
  const showError = text !== "" && !valid;
  const problem = !view.inScope
    ? `#${view.issue} is not in the authorized scope, so its priority cannot be set.`
    : !valid
      ? "Enter a whole number from 0 to 100."
      : null;
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <SubHeading>Priority</SubHeading>
      <p className="text-sm">
        Current priority: {view.priority ?? "not set"}.
        {view.inScope
          ? ""
          : " Priorities apply only to issues in the authorized scope."}
      </p>
      <Field>
        <FieldLabel htmlFor={inputId}>Priority (0–100)</FieldLabel>
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          step={1}
          value={value}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? `${helpId} ${errorId}` : helpId}
          onChange={(event) => setValue(event.target.value)}
        />
        <FieldDescription id={helpId}>
          Stored on the authorized scope; the selector reads it when it ranks
          the frontier.
        </FieldDescription>
        {showError ? (
          <FieldError id={errorId}>
            Priority must be a whole number from 0 to 100.
          </FieldError>
        ) : null}
      </Field>
      <ControlButton
        action={{
          kind: "prioritize",
          issue: view.issue,
          priority: valid ? parsed : 0,
        }}
        label="Set priority"
        disabled={problem !== null}
        disabledReason={problem ?? undefined}
      />
    </div>
  );
}

function CancelRunControl({
  issue,
  round,
  run,
}: {
  issue: number;
  round: number;
  run: NonNullable<WorkItem["run"]>;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <SubHeading>Current run</SubHeading>
      {RUN_ID_PATTERN.test(run.id) ? (
        <>
          <p className="text-sm text-muted-foreground">
            Cancelling holds #{issue} and requests cancellation of the engine
            run and its executor containers. Unconfirmed cleanup or native
            faults keep ownership held. Hold or stop alone let the round finish
            its current step instead.
          </p>
          <ControlButton
            action={{ kind: "cancel-run", runId: run.id }}
            label="Cancel the current run"
            confirmTitle="Cancel the current run?"
            confirmBody={`#${issue} is held first, so the cancelled round is not started again. Archon is asked to cancel run ${run.id}, round ${round}, and clean up its executor containers. Cleanup and native safety holds still apply; cancellation does not authorize recovery. Steps the round already finished stay recorded; steps it has not reached do not run.`}
          />
        </>
      ) : (
        <EmptyNote>
          The current run id is not an engine run id the Console can cancel.
        </EmptyNote>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Round, blocker, brief, acceptance, candidate
// ---------------------------------------------------------------------------

function CurrentRoundBlock({
  item,
  lease,
}: {
  item: WorkItem;
  lease: IssueDetailView["lease"];
}) {
  return (
    <Block title="Current round">
      <Facts>
        <Fact term="Round">{item.round}</Fact>
        <Fact term="Route">{item.run?.route ?? item.route ?? "None"}</Fact>
        <Fact term="Run">
          {item.run ? <RunButton run={item.run.id} /> : "No round is running"}
        </Fact>
        <Fact term="Started">
          {item.run ? (
            <>
              <When value={item.run.startedAt} /> (
              <Ago value={item.run.startedAt} />)
            </>
          ) : (
            "Not running"
          )}
        </Fact>
        <Fact term="Lease">
          {lease ? (
            <>
              {lease.live
                ? "Live, held by run "
                : "Not live; last held by run "}
              <Mono>{lease.runId}</Mono>
            </>
          ) : (
            "No lease is held"
          )}
        </Fact>
        <Fact term="Work rounds">
          {item.workRounds}
          <span className="mt-1 block text-muted-foreground">
            Counted toward the round limit until delivery; retry and reopen
            reset it.
          </span>
        </Fact>
        <Fact term="Feedback rounds">
          {item.feedbackRounds}
          <span className="mt-1 block text-muted-foreground">
            Polls of the published pull request, counted toward the feedback
            limit.
          </span>
        </Fact>
        {item.parked ? (
          <Fact term="Parked">
            {parkedText({ ...item.parked, at: item.parked.at ?? null })}
            {item.parked.at ? (
              <span className="mt-1 block text-muted-foreground">
                Since <When value={item.parked.at} />
              </span>
            ) : null}
          </Fact>
        ) : null}
        <Fact term="Last refused claim">
          <RefusalFact refusal={item.lastRefusal} />
        </Fact>
        <Fact term="Work item updated">
          <When value={item.updatedAt} />
        </Fact>
      </Facts>
    </Block>
  );
}

function RefusalFact({ refusal }: { refusal: WorkItem["lastRefusal"] }) {
  if (!refusal) return <>None recorded</>;
  const explanation = REFUSAL_MESSAGES[refusal.code];
  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <span>
        <Mono>{refusal.code}</Mono> · <When value={refusal.at} />
      </span>
      {explanation ? (
        <span className="text-muted-foreground">{explanation}</span>
      ) : null}
      {refusal.run ? <RunButton run={refusal.run} /> : null}
    </span>
  );
}

function BlockerBlock({ item }: { item: WorkItem }) {
  const { blocker } = item;
  return (
    <Block title="Blocker">
      {blocker ? (
        <Facts>
          <Fact term="Code">
            <Mono>{blocker.code}</Mono>
          </Fact>
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
          <Fact term="At">
            <When value={blocker.at} />
          </Fact>
          <Fact term="Retry resumes">
            {blocker.route
              ? `The ${blocker.route} route`
              : "Not recorded; retry resumes the last recorded route"}
          </Fact>
        </Facts>
      ) : (
        <EmptyNote>Nothing is blocking this issue.</EmptyNote>
      )}
    </Block>
  );
}

function SourceList({ items }: { items: readonly string[] | undefined }) {
  if (!items?.length) return <EmptyNote>None recorded</EmptyNote>;
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
      {items.map((item, index) => (
        <li key={`${index}-${item.slice(0, 24)}`} className="break-words">
          <ExternalLink href={item}>{item}</ExternalLink>
        </li>
      ))}
    </ul>
  );
}

function BriefBlock({ item }: { item: WorkItem }) {
  const { brief } = item;
  if (!brief)
    return (
      <Block title="Brief">
        <EmptyNote>
          Samson has not recorded a brief yet; the first round&apos;s scope step
          writes it.
        </EmptyNote>
      </Block>
    );
  return (
    <Block title="Brief">
      {brief.repair ? (
        <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-warning bg-warning/10 p-3 text-sm">
          <p className="font-medium">Repair requested</p>
          {brief.repair.source ? <p>From {brief.repair.source}</p> : null}
          {brief.repair.acceptance.length ? (
            <>
              <SubHeading>For Ezra (acceptance correction)</SubHeading>
              <TextList items={brief.repair.acceptance} />
            </>
          ) : null}
          {brief.repair.implementation.length ? (
            <>
              <SubHeading>For Bezalel (implementation repair)</SubHeading>
              <TextList items={brief.repair.implementation} />
            </>
          ) : null}
          {brief.repair.reviewOnly ? (
            <p>
              Review only: Micaiah and Luke review the frozen candidate again
              without a new build.
            </p>
          ) : null}
          {!brief.repair.acceptance.length &&
          !brief.repair.implementation.length &&
          !brief.repair.reviewOnly ? (
            <EmptyNote>No repair items recorded</EmptyNote>
          ) : null}
        </div>
      ) : null}
      <LongText>{brief.summary}</LongText>
      <Facts>
        <Fact term="Source paths">
          <TextList items={brief.source_paths} />
        </Fact>
        <Fact term="Test paths">
          <TextList items={brief.test_paths} />
        </Fact>
        <Fact term="Docs only">
          {brief.docs_only === undefined
            ? "Not recorded"
            : brief.docs_only
              ? "Yes"
              : "No"}
        </Fact>
        <Fact term="Shared areas">
          <TextList items={brief.shared_areas} />
        </Fact>
        <Fact term="Out of scope">
          <TextList items={brief.out_of_scope} />
        </Fact>
        <Fact term="Sources">
          <SourceList items={brief.sources} />
        </Fact>
        <Fact term="Uncertainty">
          {brief.uncertainty ? (
            <LongText>{brief.uncertainty}</LongText>
          ) : (
            "None recorded"
          )}
        </Fact>
      </Facts>
    </Block>
  );
}

function AcceptanceBlock({ item }: { item: WorkItem }) {
  const { acceptance } = item;
  if (!acceptance)
    return (
      <Block title="Acceptance">
        <EmptyNote>Ezra has not defined acceptance yet.</EmptyNote>
      </Block>
    );
  return (
    <Block title="Acceptance">
      <Facts>
        <Fact term="Revision">
          <Mono>{acceptance.revision}</Mono>
        </Fact>
        <Fact term="Defined at">
          <When value={acceptance.at} />
        </Fact>
        <Fact term="Run">
          <RunButton run={acceptance.run} />
        </Fact>
      </Facts>
      <SubHeading>Criteria</SubHeading>
      {acceptance.criteria.length ? (
        <ol className="flex min-w-0 flex-col gap-3">
          {acceptance.criteria.map((criterion, index) => (
            <li
              key={`${index}-${criterion.id}`}
              className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm"
            >
              <p className="break-words font-medium">
                <Mono>{criterion.id}</Mono> {criterion.statement}
              </p>
              <p className="break-words">
                <span className="text-muted-foreground">Check: </span>
                {criterion.check}
              </p>
              <p className="break-words">
                <span className="text-muted-foreground">Evidence: </span>
                {criterion.evidence}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyNote>No criteria are recorded.</EmptyNote>
      )}
      <SubHeading>Tests</SubHeading>
      {acceptance.tests.length ? (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
          {acceptance.tests.map(([path, digest], index) => (
            <li key={`${index}-${path ?? ""}`} className="break-words">
              <Mono>{path ?? "Unnamed test"}</Mono>
              {digest ? (
                <span className="text-muted-foreground">
                  {" "}
                  · <Mono>{digest}</Mono>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>No tests are recorded.</EmptyNote>
      )}
      <SubHeading>Gaps</SubHeading>
      <TextList items={acceptance.gaps} empty="No gaps recorded" />
      <SubHeading>Checks</SubHeading>
      <TextList items={acceptance.checks} empty="No checks recorded" />
    </Block>
  );
}

function CandidateBlock({ item }: { item: WorkItem }) {
  return (
    <Block title="Candidate">
      {item.branch || item.base || item.head ? (
        <Facts>
          <Fact term="Branch">
            <Hash value={item.branch} />
          </Fact>
          <Fact term="Base">
            <Hash value={item.base} />
          </Fact>
          <Fact term="Head">
            <Hash value={item.head} />
          </Fact>
        </Facts>
      ) : (
        <EmptyNote>No candidate has been built yet.</EmptyNote>
      )}
    </Block>
  );
}

// ---------------------------------------------------------------------------
// Reviews, final acceptance, PR
// ---------------------------------------------------------------------------

function reviewerName(key: string) {
  const known = REVIEWERS.find(([id]) => id === key);
  return known ? known[1] : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function ReviewsBlock({ item }: { item: WorkItem }) {
  const reviews = item.reviews ?? {};
  const recorded = Object.keys(reviews);
  const keys = [
    ...REVIEWERS.map(([id]) => id),
    ...recorded.filter((key) => !REVIEWERS.some(([id]) => id === key)),
  ];
  return (
    <Block title="Reviews">
      <p className="text-sm text-muted-foreground">
        Findings stay sealed in the run; only decisions are shown here.
      </p>
      {recorded.length ? (
        <ul className="flex min-w-0 flex-col gap-3">
          {keys.map((key) => {
            const review = reviews[key];
            return (
              <li
                key={key}
                className="flex min-w-0 flex-col gap-2 rounded-lg border p-3"
              >
                <SubHeading>{reviewerName(key)}</SubHeading>
                {review ? (
                  <>
                    <Facts>
                      <Fact term="Decision">
                        <StatusBadge value={review.decision} />
                      </Fact>
                      <Fact term="Findings">
                        {review.findings} sealed{" "}
                        {review.findings === 1 ? "finding" : "findings"}
                      </Fact>
                      <Fact term="Sealed at">
                        <When value={review.sealedAt} />
                      </Fact>
                      <Fact term="Candidate">
                        <Hash value={review.candidate} />
                      </Fact>
                      <Fact term="Acceptance revision">
                        <Hash value={review.acceptance} />
                      </Fact>
                      <Fact term="Run">
                        <RunButton run={review.run} />
                      </Fact>
                    </Facts>
                    {review.cleared ? (
                      <p className="text-sm font-medium">
                        Cleared by assessment
                      </p>
                    ) : null}
                  </>
                ) : (
                  <EmptyNote>No sealed decision is recorded.</EmptyNote>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyNote>
          No sealed review decisions yet. Micaiah and Luke review each frozen
          candidate independently, and both reports are released together.
        </EmptyNote>
      )}
    </Block>
  );
}

function FinalBlock({ item }: { item: WorkItem }) {
  const { final } = item;
  if (!final)
    return (
      <Block title="Final acceptance">
        <EmptyNote>Ezra has not run final acceptance yet.</EmptyNote>
      </Block>
    );
  return (
    <Block title="Final acceptance">
      <Facts>
        <Fact term="Decision">
          <StatusBadge value={final.decision} />
        </Fact>
        <Fact term="Candidate">
          <Hash value={final.candidate} />
        </Fact>
        <Fact term="Acceptance revision">
          <Hash value={final.acceptanceRevision} />
        </Fact>
        <Fact term="At">
          <When value={final.at} />
        </Fact>
        <Fact term="Run">
          <RunButton run={final.run} />
        </Fact>
      </Facts>
      {final.candidate && item.head && final.candidate !== item.head ? (
        <EmptyNote>
          Final acceptance was taken on an earlier candidate than the current
          head.
        </EmptyNote>
      ) : null}
      {final.acceptanceRevision &&
      item.acceptance &&
      final.acceptanceRevision !== item.acceptance.revision ? (
        <EmptyNote>
          Final acceptance was taken against an earlier acceptance revision than
          the current one.
        </EmptyNote>
      ) : null}
      <SubHeading>Criteria</SubHeading>
      {final.criteria.length ? (
        <ul className="flex min-w-0 flex-col gap-2">
          {final.criteria.map((criterion, index) => (
            <li
              key={`${index}-${criterion.id}`}
              className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm"
            >
              <p className="flex flex-wrap items-center gap-2">
                <Mono>{criterion.id}</Mono>
                <StatusBadge value={criterion.result} />
              </p>
              <p className="break-words">{criterion.evidence}</p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>No per-criterion results are recorded.</EmptyNote>
      )}
    </Block>
  );
}

function PullRequestBlock({ item }: { item: WorkItem }) {
  const { pr } = item;
  const latest = newestFirst(item.history)[0] ?? null;
  return (
    <Block title="PR and readiness">
      {pr ? (
        <>
          <p className="text-sm">
            <ExternalLink href={pr.url}>Pull request #{pr.number}</ExternalLink>
          </p>
          <Facts>
            <Fact term="Head">
              <Hash value={pr.head} />
            </Fact>
            <Fact term="Published at">
              <When value={pr.publishedAt} />
            </Fact>
            <Fact term="Merged at">
              <When value={pr.mergedAt} fallback="Not merged" />
            </Fact>
            <Fact term="Merge commit">
              <Hash value={pr.mergeCommit} />
            </Fact>
            <Fact term="On target">
              {pr.onTarget === undefined
                ? "Not recorded"
                : pr.onTarget
                  ? "Yes"
                  : "No"}
            </Fact>
            {item.status === "MERGED" || pr.mergedAt ? (
              <Fact term="Merged by">{mergedByText(item)}</Fact>
            ) : null}
            {pr.mergeRequest ? (
              <Fact term="Merge requested">
                The factory asked GitHub to merge{" "}
                <Hash value={pr.mergeRequest.head} /> at{" "}
                <When value={pr.mergeRequest.at} />
                {pr.mergeRequest.run ? (
                  <span className="mt-1 block">
                    <RunButton run={pr.mergeRequest.run} />
                  </span>
                ) : null}
              </Fact>
            ) : null}
            {pr.issueClosed === undefined ? null : (
              <Fact term="Issue closed">{pr.issueClosed ? "Yes" : "No"}</Fact>
            )}
            {pr.pending ? (
              <Fact term="Pending base integration">
                <PendingIntegration pending={pr.pending} />
              </Fact>
            ) : null}
          </Facts>
        </>
      ) : (
        <EmptyNote>No pull request has been published yet.</EmptyNote>
      )}
      <p className="text-sm">{END_STATE_EXPLAIN[item.assignment.endState]}</p>
      {latest ? (
        <div className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm">
          <p className="font-medium">Last readiness decision</p>
          <p className="flex flex-wrap items-center gap-2">
            <StatusBadge value={latest.outcome} />
            {latest.next ? <span>next: {latest.next}</span> : null}
            <span className="text-muted-foreground">
              round {latest.round} · <When value={latest.at} />
            </span>
          </p>
          {latest.summary ? <LongText>{latest.summary}</LongText> : null}
        </div>
      ) : (
        <EmptyNote>No readiness decision is recorded yet.</EmptyNote>
      )}
    </Block>
  );
}

/** Who merged a merged pull request, from the work item's own records. */
function mergedByText(item: WorkItem) {
  const by = item.pr?.mergedBy;
  if (by === "factory") return "The factory";
  if (by === "external") return "Outside the factory";
  if (item.history.some((entry) => entry.external))
    return "Outside the factory";
  if (item.status === "MERGED" && item.assignment.endState !== "MERGED")
    return "Outside the factory (this assignment never authorized a factory merge)";
  return "Not recorded";
}

function PendingIntegration({
  pending,
}: {
  pending: NonNullable<NonNullable<WorkItem["pr"]>["pending"]>;
}) {
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span>
        Readiness pushed <Hash value={pending.head} />, which merges base{" "}
        <Hash value={pending.base} /> into <Hash value={pending.from} />, at{" "}
        <When value={pending.at} />.
      </span>
      <span className="text-muted-foreground">
        The next feedback round adopts it once GitHub shows that head
        {pending.carried
          ? "; reviews carry forward because the candidate's own diff did not change."
          : "."}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Feedback, history, operator requests
// ---------------------------------------------------------------------------

const FEEDBACK_KIND: Record<string, string> = {
  "review-thread": "Review thread",
  "review-body": "Review",
  comment: "PR comment",
  "failed-check": "Failed check",
};

function FeedbackBlock({ feedback }: { feedback: FeedbackDoc | null }) {
  const entries = newestFirst(
    Object.entries(feedback?.dispositions ?? {}).map(([id, disposition]) => ({
      id,
      ...disposition,
    })),
  );
  return (
    <Block title="Feedback dispositions">
      {entries.length ? (
        <ul
          aria-label="Feedback dispositions, newest first"
          className="flex min-w-0 flex-col gap-2"
        >
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm"
            >
              <p className="flex min-w-0 flex-wrap items-center gap-2">
                <Mono>{entry.id}</Mono>
                {entry.kind ? (
                  <span className="text-muted-foreground">
                    {FEEDBACK_KIND[entry.kind] ?? entry.kind}
                  </span>
                ) : null}
                <StatusBadge value={entry.action} />
                {entry.status === "fix-pending" ? (
                  <StatusBadge value="waiting" label="Fix pending" />
                ) : entry.status === "fixed" ? (
                  <StatusBadge value="completed" label="Fixed" />
                ) : null}
              </p>
              <p className="break-words">
                {entry.reason ?? (
                  <span className="text-muted-foreground">
                    No reason recorded
                  </span>
                )}
              </p>
              <p className="break-words text-muted-foreground">
                Disposed <When value={entry.at} /> at head{" "}
                <Hash value={entry.head} />
                {entry.status === "fixed" ? (
                  <>
                    {" "}
                    · fixed in <Hash value={entry.fixedIn} />, resolved{" "}
                    <When value={entry.resolvedAt} />
                  </>
                ) : null}
              </p>
              {entry.run ? (
                <div>
                  <RunButton run={entry.run}>{entry.run.slice(0, 8)}</RunButton>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>No feedback has been disposed for this issue.</EmptyNote>
      )}
    </Block>
  );
}

function HistoryBlock({ item }: { item: WorkItem }) {
  const history = newestFirst(item.history);
  return (
    <Block title="History of rounds">
      {history.length ? (
        <>
          <p className="text-sm text-muted-foreground">Newest first.</p>
          <ol className="flex min-w-0 flex-col gap-3">
            {history.map((entry, index) => (
              <li
                key={`${index}-${entry.round}-${entry.at}`}
                className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm"
              >
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">Round {entry.round}</span>
                  {entry.route ? <span>· {entry.route}</span> : null}
                  <StatusBadge value={entry.outcome} />
                  {entry.external ? (
                    <StatusBadge
                      value="external"
                      label="merged outside the factory"
                    />
                  ) : null}
                  {entry.next ? <span>next: {entry.next}</span> : null}
                </p>
                <p className="text-muted-foreground">
                  <When value={entry.at} />
                </p>
                {entry.summary ? <LongText>{entry.summary}</LongText> : null}
                <div>
                  <RunButton run={entry.run} />
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <EmptyNote>No round has finished yet.</EmptyNote>
      )}
    </Block>
  );
}

function RequestsBlock({ item }: { item: WorkItem }) {
  const requests = newestFirst(item.requests);
  return (
    <Block title="Operator requests">
      {requests.length ? (
        <ul className="flex min-w-0 flex-col gap-2">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm"
            >
              <Mono>{request.id}</Mono>
              <p className="break-words">
                {request.action} · by {request.by ?? "not recorded"} ·{" "}
                <When value={request.at} />
              </p>
              {rebindText(request) ? (
                <p className="break-words text-muted-foreground">
                  {rebindText(request)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>
          No operator requests are recorded on this work item.
        </EmptyNote>
      )}
    </Block>
  );
}
