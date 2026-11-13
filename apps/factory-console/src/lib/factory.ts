// Core factory state-document contract as the installed pack writes it
// (scripts/archon-factory/pack/.shared/workitem.mjs, control.mjs and the
// workflow record scripts). The Console reads these documents through the
// Archon CLI on the server and forwards only the fields selected here; zod
// strips every other key, so profile digests, lease internals and
// unselected payloads never reach the browser.
import { z } from "zod";

import type { EngineState } from "./contracts";
import type { RoundTrace } from "./timing";

export const ISSUE_STATUSES = [
  "pending",
  "active",
  "waiting",
  "PR_READY",
  "MERGED",
  "BLOCKED",
  "stopped",
] as const;
export const TERMINAL_STATUSES = ["PR_READY", "MERGED", "BLOCKED", "stopped"];
export const ROUTES = [
  "initial",
  "repair",
  "oracle",
  "review",
  "feedback",
  "deliver",
] as const;
export const CONTROLS = ["run", "hold", "stop"] as const;
export const END_STATES = ["PR_READY", "MERGED"] as const;

// Agent- and pack-written text has no length guarantee. Oversized values are
// clipped for display, never a reason to reject a whole document (which would
// hide an issue and its controls).
const text = (max = 20_000) =>
  z
    .string()
    .transform((value) =>
      value.length > max ? `${value.slice(0, max)} [clipped]` : value,
    );
const optionalText = (max = 20_000) => text(max).nullish();
/** Keep the first `max` entries (or the last ones for append-only logs). */
const list = <Item extends z.ZodType>(
  item: Item,
  max: number,
  keep: "first" | "last" = "first",
) =>
  z
    .array(item)
    .transform((items) =>
      keep === "first" ? items.slice(0, max) : items.slice(-max),
    );
const stringList = (max = 200) => list(text(4000), max);
const count = z.number().int().nonnegative();

export const leaseSchema = z
  .object({ runId: text(200), live: z.boolean().optional() })
  .nullish();

export const factoryDocSchema = z.object({
  v: z.literal(1),
  intake: z.enum(["open", "paused"]),
  mode: z.enum(["run", "drain", "stop"]),
  mergeHold: z.boolean(),
  reason: optionalText(600),
  updatedAt: text(64),
  updatedBy: optionalText(80),
  requests: list(
    z.object({
      id: text(128),
      action: text(40),
      by: optionalText(80),
      at: text(64),
    }),
    40,
    "last",
  ).default([]),
});

/** Keep only well-formed per-issue end states; never reject the scope for one. */
const endStatesSchema = z
  .record(z.string(), z.unknown())
  .transform((entries) =>
    Object.fromEntries(
      Object.entries(entries).filter(
        (entry): entry is [string, (typeof END_STATES)[number]] =>
          /^[1-9][0-9]{0,7}$/.test(entry[0]) &&
          (END_STATES as readonly unknown[]).includes(entry[1]),
      ),
    ),
  );

export type ProtectedGrant = true | string[];

/**
 * core/scope.allowProtected: per issue, true (every protected area) or the
 * protected globs after-scope lets its scope reach. A malformed entry is
 * dropped, so the Console never shows a wider grant than the pack reads.
 */
const allowProtectedSchema = z
  .record(z.string(), z.unknown())
  .catch({})
  .transform((entries) =>
    Object.fromEntries(
      Object.entries(entries).flatMap(
        ([issue, grant]): [string, ProtectedGrant][] => {
          if (!/^[1-9][0-9]{0,7}$/.test(issue)) return [];
          if (grant === true) return [[issue, true]];
          if (
            Array.isArray(grant) &&
            grant.length > 0 &&
            grant.length <= 50 &&
            grant.every(
              (glob) => typeof glob === "string" && glob.length <= 200,
            )
          )
            return [[issue, grant as string[]]];
          return [];
        },
      ),
    ),
  );

export const scopeDocSchema = z.object({
  v: z.literal(1),
  issues: z.array(z.number().int().positive()).max(10_000),
  endState: z.enum(END_STATES),
  endStates: endStatesSchema.default({}),
  owner: text(80),
  approvedBy: optionalText(80),
  approvedAt: optionalText(64),
  note: optionalText(600),
  priorities: z.record(z.string(), z.number()).default({}),
  allowProtected: allowProtectedSchema.default({}),
  requests: list(
    z.object({ id: text(128), by: optionalText(80), at: text(64) }),
    40,
    "last",
  ).default([]),
});

const historySchema = z.object({
  round: count,
  run: text(200),
  route: optionalText(40),
  outcome: text(40),
  next: optionalText(40),
  at: text(64),
  /** When the round's run started (recorded by newer packs). */
  startedAt: optionalText(64),
  summary: optionalText(500),
  /** A MERGED round the factory did not perform (merged outside it). */
  external: z
    .boolean()
    .optional()
    .catch(undefined)
    .transform((value) => value === true),
});

/** A policy re-binding recorded on a retry, reopen or release request. */
const rebindSchema = z
  .object({ from: text(128), to: text(128) })
  .nullish()
  .catch(null)
  .transform((value) => value ?? null);

/**
 * One operator request on a work item. retry, reopen and release re-bind the
 * assignment to the installed release and record {policy:{from,to}} (shown)
 * and {profile:{from,to}} (profile digests stay on the server; only the fact
 * that the owner profile was re-bound is forwarded).
 */
const requestSchema = z
  .object({
    id: text(128),
    action: text(40),
    by: optionalText(80),
    at: text(64),
    policy: rebindSchema,
    profile: z.unknown().optional(),
  })
  .transform(({ profile, ...request }) => ({
    ...request,
    profileRebound: profile !== null && typeof profile === "object",
  }));

/**
 * A repair handed to the next round. The pack writes two lists (acceptance
 * for Ezra, implementation for Bezalel) plus an optional review-only flag and
 * the producing stage; older work items carry {kind, items}. Both read as the
 * same shape, so a legacy item is never reported as malformed.
 */
export type Repair = {
  acceptance: string[];
  implementation: string[];
  reviewOnly: boolean;
  source: string | null;
};

const repairSchema = z
  .union([
    z.object({ kind: text(40), items: stringList(100) }),
    z.object({
      acceptance: stringList(100).default([]),
      implementation: stringList(100).default([]),
      reviewOnly: z.boolean().optional(),
      source: optionalText(80),
    }),
  ])
  .transform((repair): Repair =>
    "kind" in repair
      ? {
          acceptance: repair.kind === "acceptance" ? repair.items : [],
          implementation: repair.kind === "acceptance" ? [] : repair.items,
          reviewOnly: false,
          source: null,
        }
      : {
          acceptance: repair.acceptance,
          implementation: repair.implementation,
          reviewOnly: repair.reviewOnly === true,
          source: repair.source ?? null,
        },
  );

const briefSchema = z.object({
  summary: text(6000),
  source_paths: stringList(),
  test_paths: stringList(),
  docs_only: z.boolean().optional(),
  shared_areas: stringList().optional(),
  out_of_scope: stringList().optional(),
  sources: stringList().optional(),
  uncertainty: optionalText(1500),
  repair: repairSchema.nullish(),
  contextFingerprint: optionalText(128),
});

const criterionSchema = z.object({
  id: text(80),
  statement: text(4000),
  check: text(4000),
  evidence: text(4000),
});

const acceptanceSchema = z.object({
  revision: text(128),
  criteria: list(criterionSchema, 100),
  tests: list(list(text(1000), 2), 200).default([]),
  gaps: stringList(40).default([]),
  checks: stringList(60).default([]),
  at: text(64),
  run: text(200),
});

const reviewSchema = z.object({
  decision: text(40),
  candidate: optionalText(128),
  acceptance: optionalText(128),
  findings: count,
  sealedAt: text(64),
  run: text(200),
  cleared: z.boolean().optional(),
  /** Set when readiness carried the review forward over a base integration. */
  carriedFrom: optionalText(128),
});

const finalSchema = z.object({
  decision: text(40),
  candidate: optionalText(128),
  acceptanceRevision: optionalText(128),
  criteria: list(
    z.object({ id: text(80), result: text(40), evidence: text(600) }),
    100,
  ),
  at: text(64),
  run: text(200),
  carriedFrom: optionalText(128),
});

const prSchema = z.object({
  number: z.number().int().positive(),
  url: text(400),
  head: optionalText(128),
  publishedAt: optionalText(64),
  mergedAt: optionalText(64),
  mergeCommit: optionalText(128),
  onTarget: z.boolean().optional(),
  mergedBy: z.enum(["factory", "external"]).nullish().catch(null),
  /** Whether closeout found the issue closed after the merge. */
  issueClosed: z.boolean().optional().catch(undefined),
  /**
   * A base integration readiness pushed but has not recorded yet: the next
   * feedback round adopts it once GitHub shows the pushed head.
   */
  pending: z
    .object({
      head: optionalText(128),
      base: optionalText(128),
      from: optionalText(128),
      carried: z.boolean().optional(),
      at: optionalText(64),
    })
    .nullish()
    .catch(null),
  /** The exact head the factory asked GitHub to merge (makes it "factory"). */
  mergeRequest: z
    .object({
      head: optionalText(128),
      at: optionalText(64),
      run: optionalText(200),
    })
    .nullish()
    .catch(null),
});

/** Shared areas a parked round waits for, and the issues holding them. */
const parkedSchema = z.object({
  areas: stringList(50),
  holders: z
    .record(z.string(), z.unknown())
    .transform((entries) =>
      Object.fromEntries(
        Object.entries(entries).filter(
          (entry): entry is [string, number] =>
            Number.isSafeInteger(entry[1]) && (entry[1] as number) > 0,
        ),
      ),
    )
    .default({}),
  at: optionalText(64),
});

const blockerSchema = z.object({
  code: text(80),
  detail: optionalText(1200),
  recovery: optionalText(600),
  at: optionalText(64),
  /** The route a retry resumes (and reopen, for a stopped item). */
  route: z.enum(ROUTES).nullish().catch(null),
});

/** The last claim a round refused; recording it moves the dispatch key. */
const refusalSchema = z.object({
  run: optionalText(200),
  code: text(80),
  at: optionalText(64),
});

const nativeFaultsSchema = z.object({
  schema: z.literal("core-native-faults/v1"),
  runId: optionalText(200),
  runStatus: optionalText(40),
  action: text(80),
  reason: text(1200),
  preserveOwnership: z.boolean(),
  automaticRetry: z.literal(false),
  faults: list(
    z.object({
      nodeId: text(200),
      eventId: text(200),
      failureKind: optionalText(80),
      providerClass: optionalText(80),
      resetAt: optionalText(64),
      retryAfterMs: z.number().int().nonnegative().safe().nullish(),
    }),
    40,
  ),
  wait: z
    .object({
      owner: text(40),
      nodeId: text(200),
      kind: text(40),
      pauseId: optionalText(200),
      waitingSince: text(64),
      resumeAt: optionalText(64),
    })
    .nullable(),
});

export const workItemSchema = z.object({
  v: z.literal(1),
  issue: z.number().int().positive(),
  assignment: z.object({
    id: text(128),
    owner: text(80),
    endState: z.enum(END_STATES),
    assignedAt: text(64),
    assignedBy: optionalText(200),
    reason: optionalText(1200),
  }),
  control: z.enum(CONTROLS),
  controlReason: optionalText(600),
  status: z.enum(ISSUE_STATUSES),
  route: z.enum(ROUTES).nullable(),
  round: count,
  run: z
    .object({
      id: text(200),
      startedAt: text(64),
      route: optionalText(40),
    })
    .nullable(),
  branch: optionalText(300),
  base: optionalText(128),
  head: optionalText(128),
  acceptance: acceptanceSchema.nullish(),
  reviews: z.record(z.string(), reviewSchema).nullish(),
  final: finalSchema.nullish(),
  pr: prSchema.nullish(),
  brief: briefSchema.nullish(),
  blocker: blockerSchema.nullish(),
  nativeFaults: nativeFaultsSchema.nullish().catch(null),
  parked: parkedSchema.nullish(),
  /** Work rounds count toward maxRounds, feedback rounds toward maxFeedbackRounds. */
  workRounds: count.default(0),
  feedbackRounds: count.default(0),
  lastRefusal: refusalSchema
    .nullish()
    .catch(null)
    .transform((value) => value ?? null),
  history: list(historySchema, 40, "last"),
  requests: list(requestSchema, 40, "last").default([]),
  updatedAt: text(64),
});

export const FIX_STATES = ["fix-pending", "fixed"] as const;

/**
 * Samson's feedback dispositions. The comment identity (lastComment) and
 * GitHub's own update time only let readiness notice a newer reply, so they
 * are stripped. An accepted fix shows whether it is still pending or fixed,
 * and where.
 */
export const feedbackDocSchema = z.object({
  v: z.literal(1),
  dispositions: z.record(
    z.string(),
    z.object({
      action: text(40),
      reason: optionalText(600),
      head: optionalText(128),
      kind: optionalText(40),
      status: z.enum(FIX_STATES).nullish().catch(null),
      fixedIn: optionalText(128),
      resolvedAt: optionalText(64),
      at: text(64),
      run: optionalText(200),
    }),
  ),
});

export const selectionDocSchema = z.object({
  v: z.literal(1),
  decisions: list(
    z.object({
      at: text(64),
      run: text(200),
      issue: z.number().int().positive(),
      assignment: optionalText(128),
      frontier: list(text(40), 200).default([]),
      reason: z
        .object({
          summary: optionalText(2000),
          sources: stringList(40).optional(),
          expectedBenefit: optionalText(2000),
          affectedAreas: stringList(40).optional(),
          uncertainty: optionalText(2000),
        })
        .nullish(),
    }),
    40,
    "last",
  ),
});

export const OPERATION_KINDS = [
  "pause-intake",
  "resume-intake",
  "drain",
  "stop",
  "resume",
  "hold-merge",
  "release-merge",
  "hold",
  "release",
  "retry",
  "reopen",
  "assign-scope",
  "reprioritize",
] as const;

export const chatDocSchema = z.object({
  v: z.literal(1),
  messages: list(
    z.object({
      role: z.enum(["operator", "samson"]),
      text: text(4000),
      request: optionalText(128),
      at: text(64),
      run: optionalText(200),
      sources: stringList(16).optional(),
      failed: z.boolean().optional(),
      operation: z
        .object({
          kind: z.enum(OPERATION_KINDS),
          // answer.yaml declares plain integers; apply() validates them.
          issue: z.number().int(),
          issues: list(z.number().int(), 500),
          endState: z.enum(["PR_READY", "MERGED", "unchanged"]),
          reason: text(2000),
          status: optionalText(40),
        })
        .nullish(),
    }),
    60,
    "last",
  ),
});

export const analysisIndexSchema = z.object({
  v: z.literal(1),
  reports: list(
    z.object({
      run: text(200),
      scope: text(40),
      trigger: text(40),
      digest: optionalText(128),
      status: text(40),
      at: text(64),
      findings: count.default(0),
    }),
    80,
    "last",
  ),
});

export const analysisReportSchema = z.object({
  v: z.literal(1),
  run: text(200),
  scope: text(40),
  trigger: text(40),
  status: text(40),
  problem: optionalText(2000),
  at: text(64),
  result: z
    .object({
      result: text(40),
      observations: list(
        z.object({ text: text(4000), evidence: stringList(40) }),
        16,
      ),
      findings: list(
        z.object({
          title: text(400),
          material: z.boolean(),
          explanation: text(4000),
          alternatives: stringList(20),
          evidence: stringList(40),
          next_step: text(2000),
          how_to_tell: text(2000),
        }),
        10,
      ),
      coverage_limits: stringList(40),
    })
    .nullish(),
});

export const attentionDocSchema = z.object({
  v: z.literal(1),
  items: list(
    z.object({
      fingerprint: text(80),
      title: text(400),
      scope: text(40),
      report: optionalText(200),
      status: text(40),
      at: text(64),
    }),
    100,
    "last",
  ),
});

export type FactoryDoc = z.infer<typeof factoryDocSchema>;
export type ScopeDoc = z.infer<typeof scopeDocSchema>;
export type WorkItem = z.infer<typeof workItemSchema>;
export type FeedbackDoc = z.infer<typeof feedbackDocSchema>;
export type SelectionDecision = z.infer<
  typeof selectionDocSchema
>["decisions"][number];
export type ChatDoc = z.infer<typeof chatDocSchema>;
export type ChatMessage = ChatDoc["messages"][number];
export type ProposedOperation = NonNullable<ChatMessage["operation"]>;
export type AnalysisIndexEntry = z.infer<
  typeof analysisIndexSchema
>["reports"][number];
export type AnalysisReport = z.infer<typeof analysisReportSchema>;
export type AttentionItem = z.infer<typeof attentionDocSchema>["items"][number];
export type Lease = z.infer<typeof leaseSchema>;

// ---------------------------------------------------------------------------
// Operator controls. One validated union shared by the browser (types only)
// and the server (runtime validation before any process is spawned).
// ---------------------------------------------------------------------------

export const FACTORY_ACTIONS = [
  "pause-intake",
  "resume-intake",
  "drain",
  "stop",
  "resume",
  "hold-merge",
  "release-merge",
] as const;
export const ISSUE_ACTIONS = [
  "hold",
  "release",
  "stop",
  "retry",
  "reopen",
  "reconcile",
  "adopt-policy",
  "recover-native",
] as const;

const issueNumber = z.number().int().positive().max(10_000_000);
const reason = z.string().trim().max(600).optional();
export const RUN_ID_PATTERN = /^[a-f0-9-]{36}$/;
export const CONVERSATION_PATTERN = /^[a-z0-9-]{8,64}$/;

export const controlActionSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("factory"),
      action: z.enum(FACTORY_ACTIONS),
      reason,
    })
    .strict(),
  z
    .object({
      kind: z.literal("issue"),
      issue: issueNumber,
      action: z.enum(ISSUE_ACTIONS),
      reason,
    })
    .strict(),
  z
    .object({
      kind: z.literal("scope"),
      issues: z.array(issueNumber).min(1).max(200),
      endState: z.enum(END_STATES),
      owner: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/),
      note: z.string().trim().max(600).optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("prioritize"),
      issue: issueNumber,
      priority: z.number().int().min(0).max(100),
    })
    .strict(),
  z
    .object({
      kind: z.literal("cancel-run"),
      runId: z.string().regex(RUN_ID_PATTERN),
    })
    .strict(),
  z
    .object({
      kind: z.literal("analyze"),
      scope: z.string().regex(/^(factory|issue:[1-9][0-9]{0,7})$/),
    })
    .strict(),
]);
export type ControlAction = z.infer<typeof controlActionSchema>;

export const DESTRUCTIVE: ReadonlySet<string> = new Set([
  "factory:stop",
  "factory:drain",
  "issue:stop",
  // It ends the held run when the engine reports it paused or failed.
  "issue:recover-native",
  "cancel-run",
]);

export function actionKey(action: ControlAction) {
  return action.kind === "factory" || action.kind === "issue"
    ? `${action.kind}:${action.action}`
    : action.kind;
}

export function describeAction(action: ControlAction): string {
  switch (action.kind) {
    case "factory":
      return {
        "pause-intake": "Pause intake",
        "resume-intake": "Resume intake",
        drain: "Drain the factory",
        stop: "Stop the factory",
        resume: "Resume the factory",
        "hold-merge": "Hold merges",
        "release-merge": "Release the merge hold",
      }[action.action];
    case "issue":
      if (action.action === "adopt-policy")
        return `Move issue #${action.issue} to the installed release`;
      if (action.action === "recover-native")
        return `Clear the provider-fault hold on issue #${action.issue}`;
      return `${
        {
          hold: "Hold",
          release: "Release",
          stop: "Stop",
          retry: "Retry",
          reopen: "Reopen",
          reconcile: "Reconcile",
        }[action.action]
      } issue #${action.issue}`;
    case "scope":
      return `Assign scope: ${action.issues.map((issue) => `#${issue}`).join(", ")} → ${action.endState} for ${action.owner}`;
    case "prioritize":
      return `Set #${action.issue} priority to ${action.priority}`;
    case "cancel-run":
      return `Cancel run ${action.runId}`;
    case "analyze":
      return action.scope === "factory"
        ? "Analyze the factory now"
        : `Analyze ${action.scope.replace("issue:", "issue #")} now`;
  }
}

export type ControlOutcome =
  | "applied"
  | "already-applied"
  | "requested"
  | "started"
  | "refused"
  | "failed"
  | "unknown"
  /** Took effect but left something behind (a cancelled run's containers). */
  | "incomplete";

/** Outcomes a same-id retry can settle; control.mjs is idempotent per id. */
export function isRetryable(outcome: ControlOutcome) {
  return (
    outcome === "unknown" || outcome === "failed" || outcome === "incomplete"
  );
}

export type ControlReceipt = {
  requestId: string;
  label: string;
  requestedAt: string;
  outcome: ControlOutcome;
  message: string;
  code: string | null;
  revision: number | null;
  runId: string | null;
  /** Observation re-read from durable state after the control returned. */
  observed: {
    at: string;
    summary: string;
    /** Whether the target document lists this request id. */
    recorded: boolean | null;
  } | null;
};

// ---------------------------------------------------------------------------
// Snapshot views sent to the browser.
// ---------------------------------------------------------------------------

export type Availability<T> =
  | { state: "available"; data: T; observedAt: string }
  | { state: "unavailable"; reason: string; observedAt: string };

export type IssueSummary = {
  issue: number;
  admitted: boolean;
  /** When the selector admitted the issue; the start of its wall time. */
  assignedAt: string | null;
  status: (typeof ISSUE_STATUSES)[number] | "queued";
  control: (typeof CONTROLS)[number] | null;
  controlReason: string | null;
  round: number;
  route: string | null;
  run: { id: string; startedAt: string; route: string | null } | null;
  lease: { runId: string; live: boolean } | null;
  branch: string | null;
  head: string | null;
  pr: { number: number; url: string; mergedAt: string | null } | null;
  blocker: {
    code: string;
    detail: string | null;
    recovery: string | null;
    at: string | null;
    /** The route a retry resumes. */
    route: string | null;
  } | null;
  priority: number | null;
  endState: string | null;
  owner: string | null;
  inScope: boolean;
  /** Repair lists handed to the next round (counts only). */
  repair: {
    acceptance: number;
    implementation: number;
    reviewOnly: boolean;
    source: string | null;
  } | null;
  /** Shared areas this issue waits for and the issues holding them. */
  parked: {
    areas: string[];
    holders: Record<string, number>;
    at: string | null;
  } | null;
  /**
   * For a MERGED issue: true when it was merged outside the factory, false
   * when the factory merged it, null when the work item does not say.
   */
  mergedOutside: boolean | null;
  history: WorkItem["history"];
  reviews: Record<
    string,
    { decision: string; findings: number; sealedAt: string }
  > | null;
  finalDecision: string | null;
  updatedAt: string | null;
};

export type FactoryState = {
  factory: FactoryDoc | null;
  scope: ScopeDoc | null;
  issues: IssueSummary[];
  malformed: { name: string; reason: string }[];
  selection: SelectionDecision[];
  attention: AttentionItem[];
  analysis: AnalysisIndexEntry[];
};

export type Snapshot = {
  identity: { instance: string; operator: string; codebase: string };
  observedAt: string;
  engine: Availability<EngineState>;
  factory: Availability<FactoryState>;
  /** Issues whose recorded rounds ran as each engine run on this page. */
  runIssues: Record<string, number[]>;
  settings: {
    capacity: number;
    owners: string[];
    repository: string | null;
    /** Set only for TEST-ONLY synthetic fixtures; the UI labels every view. */
    fixture: string | null;
  };
};

export type IssueDetailView = {
  issue: number;
  observedAt: string;
  requestUrl: string | null;
  item: WorkItem | null;
  lease: { runId: string; live: boolean } | null;
  feedback: FeedbackDoc | null;
  inScope: boolean;
  priority: number | null;
  /** Protected paths the scope lets this issue reach; null when none. */
  allowProtected: ProtectedGrant | null;
  /** Each round of the work item, oldest first, with the engine's records. */
  rounds: RoundTrace[];
};

export type ChatView = {
  observedAt: string;
  conversations: {
    id: string;
    messages: (ChatMessage & {
      /**
       * recorded: true when the target document lists the proposal's request
       * id; false when it does not and its retained history covers the turn;
       * null when the turn is older than the history the pack retains (the
       * last 20 requests), so whether it was applied cannot be observed.
       */
      applied: { requestId: string; recorded: boolean | null } | null;
    })[];
    updatedAt: string | null;
  }[];
  /** Engine runs of the core-answer workflow that have not finished. */
  answering: { runId: string; status: string; startedAt: string }[];
  answeringError: string | null;
  malformed: { name: string; reason: string }[];
};

export const REFUSAL_MESSAGES: Record<string, string> = {
  "request-id-required": "The control needs a valid request id.",
  "invalid-issue": "That issue number is not valid.",
  "no-assignment": "This issue has no work item yet; it has not been admitted.",
  "malformed-work-item":
    "The work item is malformed; reconcile it from the runbook before acting.",
  "invalid-observation": "The state read was not a valid observation.",
  stopped: "The issue is stopped. Reopen it first.",
  held: "The issue is held.",
  "not-held": "The issue is not held, so there is nothing to release.",
  "not-running": "The issue control is not 'run'; release or reopen it first.",
  "not-blocked": "Only a BLOCKED issue can be retried.",
  "not-reopenable": "Only a PR_READY or stopped issue can be reopened.",
  "unknown-action": "The pack does not know that action.",
  "factory-stopped": "The factory is stopped. Resume it before opening intake.",
  "scope-issues-required": "Choose at least one issue for the scope.",
  "end-state-required": "Choose PR_READY or MERGED as the end state.",
  "unknown-owner": "That owner has no configured profile in the factory.",
  "invalid-priority": "Priority must be an integer from 0 to 100.",
  "no-scope": "There is no authorized scope yet.",
  "not-in-scope": "That issue is not in the authorized scope.",
  "invalid-run": "That run id is not valid.",
  "invalid-question": "The question or conversation id is not valid.",
  conflict:
    "The document kept changing while the control ran. Read it again and retry with the same request.",
  "unknown-command": "The control command is not known to the pack.",
  "not-active":
    "Only an active, pending or waiting issue can be reconciled; this one has already settled.",
  "lease-live":
    "A live run still owns the issue's lease, so nothing was settled. Reconcile settles only a run that ended without recording its round, and a provider-fault hold cannot be cleared while another run owns the issue. Hold or stop the issue, or cancel the run.",
  "run-not-terminal":
    "The engine does not report the run as ended, so the issue was not settled. Reconcile needs a completed or cancelled run (a failed or paused run can still resume; cancel it first if it should not continue). Clearing a provider-fault hold ends a failed or paused run itself and is refused only while the run is still working.",
  "run-changed":
    "The engine reports a different run than the one on the work item. Refresh and check the issue before acting.",
  "run-unconfirmed":
    "Neither the engine nor the lease record confirms that the run ended, so the issue was not settled.",
  "cleanup-unconfirmed":
    "Cleanup is unconfirmed, so the action was refused. Preserve the run, lease, reservations and evidence until cleanup is independently confirmed; that confirmation does not clear native or identity holds.",
  "native-fault-held":
    "The issue is held because a round failed on a provider fault, so the action was refused. Its identity, work, lease, reservations and evidence are kept. Retry, reopen, release and ordinary reconcile cannot clear this hold. Deal with the cause, then use Clear the provider-fault hold; a usage limit or an outage is cleared by the intake pass itself after any reset the provider reported.",
  "no-native-hold": "This issue has no provider-fault hold to clear.",
  "effects-unreconciled":
    "What is on GitHub for this issue could not be confirmed: a merge the factory requested is still pending, the branch could not be read, or it holds a commit the factory did not publish and there is no pull request to read. The hold stays.",
  "containers-unconfirmed":
    "The held run's check containers are not confirmed gone, so the hold stays. Repeat the action.",
  "run-not-ended":
    "The engine did not end the held run, so the hold stays. Its leftover check containers were removed.",
  "policy-unavailable":
    "The installed policy could not be verified, so the action was refused. Preserve the retained assignment and identity binding; restore trusted policy evidence before acting.",
  "policy-transition-required":
    "The installed release differs from the one this assignment is bound to, so the action was refused: retry, reopen and release never change the release. Its identity binding and work are kept. Move the issue to the installed release first (BLOCKED or stopped issues only), then repeat the action.",
  "policy-current":
    "This assignment is already bound to the installed release; there is nothing to move.",
  "not-adoptable":
    "Only a BLOCKED or stopped issue that no run owns can be moved to the installed release. Stop the issue first if it is waiting or PR ready.",
  "identity-proof-unavailable":
    "Fresh native identity proof is unavailable, so the action was refused. Preserve the original identity binding and work until the retained identity can be independently verified.",
  "identity-drift":
    "The installed native identity does not match this attempt, so the action was refused. Preserve the original identity binding and evidence; sign-in, retry, reopen or release cannot authorize rebinding or clear safety holds.",
  "unreconciled-run":
    "The issue is still active under a run that ended without recording its round; reconcile it before another round can start.",
  "lease-held": "Another live round run holds the issue's lease.",
  terminal:
    "The issue has a final status (PR ready, merged, blocked or stopped); retry or reopen it first.",
  "no-route": "The work item has no route for its next round.",
  "policy-changed":
    "The installed factory release changed since this assignment was bound, so its round was refused. Move the issue to the installed release, then retry it.",
  "assignment-mismatch":
    "The round was started for a different assignment of this issue.",
};
