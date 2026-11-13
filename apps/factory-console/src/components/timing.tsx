"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";

import {
  EmptyNote,
  Fact,
  Facts,
  RunButton,
  StatusBadge,
  When,
  useConsole,
} from "./shared";
import { duration } from "../lib/contracts";
import { finishedAt, issueTiming, type AttemptState } from "../lib/timing";

import type { IssueDetailView, WorkItem } from "../lib/factory";

const STATE_BADGE: Record<AttemptState, string> = {
  running: "running",
  waiting: "waiting",
  "between steps": "pending",
  finished: "completed",
  "not observed": "unobserved",
};

/**
 * Elapsed time of one issue from durable lifecycle records. The browser clock
 * only extends intervals that are still open, so a refresh, sleep or
 * reconnect shows the same closed totals again.
 */
export function IssueTiming({
  view,
  item,
}: {
  view: IssueDetailView;
  item: WorkItem;
}) {
  const { now } = useConsole();
  if (!now) return <EmptyNote>Measuring…</EmptyNote>;
  const timing = issueTiming({
    assignedAt: item.assignment.assignedAt,
    finishedAt: finishedAt(item),
    rounds: view.rounds,
    now,
  });
  const attempt = timing.attempt;
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Facts>
        <Fact term="Issue wall time">
          {duration(timing.wall.ms)}{" "}
          <span className="text-muted-foreground">
            {timing.wall.open ? "and counting, " : ""}since admission{" "}
            <When value={timing.wall.startedAt} />
            {timing.wall.endedAt ? (
              <>
                {" "}
                until <When value={timing.wall.endedAt} />
              </>
            ) : null}
          </span>
        </Fact>
        <Fact term="This attempt">
          {attempt ? (
            <span className="flex flex-wrap items-center gap-2">
              <span>
                Round {attempt.round ?? "?"}
                {attempt.route ? ` (${attempt.route})` : ""}:{" "}
                {duration(attempt.ms)}
              </span>
              <StatusBadge
                value={STATE_BADGE[attempt.state]}
                label={attempt.state}
              />
              {attempt.detail ? (
                <span className="text-muted-foreground">{attempt.detail}</span>
              ) : null}
              <RunButton run={attempt.run}>
                Run {attempt.run.slice(0, 8)}
              </RunButton>
            </span>
          ) : (
            "No round has started"
          )}
        </Fact>
        {attempt ? (
          <Fact term="This attempt, running vs waiting">
            {duration(attempt.runningMs)} running ·{" "}
            {duration(attempt.waitingMs)} waiting
          </Fact>
        ) : null}
        <Fact term="Running (all rounds)">
          {duration(timing.running.ms)}
          {timing.running.complete
            ? ""
            : " (rounds without a recorded start are not included)"}
        </Fact>
        <Fact term="Waiting (all rounds)">
          {timing.waiting.ms === null ? (
            <>Unavailable: {timing.waiting.reason}</>
          ) : (
            <>
              {duration(timing.waiting.ms)}:{" "}
              {duration(timing.waiting.betweenRoundsMs)} between rounds,{" "}
              {duration(timing.waiting.inRoundMs)} inside rounds
            </>
          )}
        </Fact>
        <Fact term="Local check time">
          {timing.checks.localMs === null ? (
            <>Unavailable: {timing.checks.reason}</>
          ) : (
            <>
              {duration(timing.checks.localMs)} in freeze and publish
              (Core&apos;s hooked commit and pre-push)
            </>
          )}
        </Fact>
        <Fact term="Waiting on GitHub">
          {timing.checks.githubWaitMs === null ? (
            <>Unavailable: {timing.checks.reason}</>
          ) : (
            <>{duration(timing.checks.githubWaitMs)} before feedback rounds</>
          )}
        </Fact>
        {timing.uncertain.ms > 0 ? (
          <Fact term="Uncertain">
            {duration(timing.uncertain.ms)} the engine did not record (for
            example across a restart). It is counted as neither running nor
            waiting.
          </Fact>
        ) : null}
      </Facts>
      {timing.roles.length ? (
        <Table>
          <TableCaption>
            Per-role time. Each role&apos;s own attempts are merged; parallel
            roles overlap, so these totals are not added to wall time.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Role</TableHead>
              <TableHead scope="col">Time</TableHead>
              <TableHead scope="col">Attempts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timing.roles.map((role) => (
              <TableRow key={role.role}>
                <TableHead scope="row">{role.role}</TableHead>
                <TableCell>{duration(role.ms)}</TableCell>
                <TableCell>{role.attempts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyNote>No role attempt is recorded by the engine yet.</EmptyNote>
      )}
      {timing.coverage.missing.length ||
      timing.rounds.some((round) => round.error) ? (
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          {timing.rounds
            .filter((round) => round.error || round.ms === null)
            .map((round) => (
              <li key={`${round.run}-${round.round}`} className="break-words">
                Round {round.round ?? "?"}: {round.error ?? "no recorded start"}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
