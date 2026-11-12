// The core-deliver round as the installed pack defines it
// (scripts/archon-factory/pack/deliver/deliver.yaml). Step states are derived
// only from the engine's node states for the issue's live round run; the
// route decides which steps the round plans (claim.ts stage table).
import type { NodeTiming, RunDetailView } from "./contracts";
import type { IssueSummary } from "./factory";

export type StepState =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "not-planned"
  | "unobserved";

export type StepRole = {
  name: string;
  node: string;
  state: StepState;
  timing: NodeTiming | null;
  error: string | null;
};

export type RoundStep = {
  id: StepId;
  label: string;
  /** Roles that run in this step; two entries for the parallel reviews. */
  roles: StepRole[];
  /** Trusted pack scripts that validate or settle the step. */
  scripts: StepRole[];
  parallel: boolean;
  conditional: boolean;
  planned: boolean;
  state: StepState;
  startedAt: string | null;
  endedAt: string | null;
  note: string | null;
};

type StepId =
  | "claim"
  | "scope"
  | "define"
  | "build"
  | "freeze"
  | "reviews"
  | "assess"
  | "adjudicate"
  | "final"
  | "publish"
  | "feedback"
  | "readiness"
  | "record";

type StepDefinition = {
  id: StepId;
  label: string;
  roles: { name: string; node: string }[];
  scripts: string[];
  parallel?: boolean;
  conditional?: boolean;
};

export const ROUND_STEPS: StepDefinition[] = [
  {
    id: "claim",
    label: "Claim",
    roles: [],
    scripts: ["claim", "cooldown", "context"],
  },
  {
    id: "scope",
    label: "Scope",
    roles: [{ name: "Samson", node: "scope" }],
    scripts: ["after-scope"],
  },
  {
    id: "define",
    label: "Define acceptance",
    roles: [{ name: "Ezra", node: "define" }],
    scripts: ["after-define"],
  },
  {
    id: "build",
    label: "Build",
    roles: [{ name: "Bezalel", node: "build" }],
    scripts: [],
  },
  { id: "freeze", label: "Freeze candidate", roles: [], scripts: ["freeze"] },
  {
    id: "reviews",
    label: "Independent reviews",
    roles: [
      { name: "Micaiah", node: "micaiah" },
      { name: "Luke", node: "luke" },
    ],
    scripts: ["seal"],
    parallel: true,
  },
  {
    id: "assess",
    label: "Assess",
    roles: [{ name: "Samson", node: "assess" }],
    scripts: ["after-assess"],
  },
  {
    id: "adjudicate",
    label: "Adjudicate",
    roles: [{ name: "Agabus", node: "agabus" }],
    scripts: ["after-adjudicate"],
    conditional: true,
  },
  {
    id: "final",
    label: "Final acceptance",
    roles: [{ name: "Ezra", node: "final" }],
    scripts: [],
  },
  { id: "publish", label: "Publish", roles: [], scripts: ["publish"] },
  {
    id: "feedback",
    label: "Feedback",
    roles: [{ name: "Samson", node: "dispose" }],
    scripts: ["feedback-facts"],
  },
  { id: "readiness", label: "Readiness", roles: [], scripts: ["readiness"] },
  { id: "record", label: "Record", roles: [], scripts: ["record"] },
];

/** Every node id the round graph defines, mapped to its role (or trusted script). */
export const NODE_ROLES: Record<string, string> = Object.fromEntries(
  ROUND_STEPS.flatMap((step) => [
    ...step.roles.map((role) => [role.node, role.name] as const),
    ...step.scripts.map((node) => [node, "Trusted script"] as const),
  ]),
);

const BUILD_STEPS: StepId[] = [
  "freeze",
  "reviews",
  "assess",
  "adjudicate",
  "final",
  "publish",
];

/** Steps a route plans, from the pack's claim stage table. */
export function plannedSteps(route: string | null): Set<StepId> {
  switch (route) {
    case "initial":
      return new Set([
        "claim",
        "scope",
        "define",
        "build",
        ...BUILD_STEPS,
        "record",
      ]);
    // Samson scopes only the initial round (the pack's roundStages table).
    case "repair":
      return new Set(["claim", "build", ...BUILD_STEPS, "record"]);
    case "oracle":
      return new Set(["claim", "define", "build", ...BUILD_STEPS, "record"]);
    case "review":
      // The frozen candidate is reviewed again: freeze re-verifies it without
      // a new commit, then both reviews, assessment, final and publication.
      return new Set(["claim", ...BUILD_STEPS, "record"]);
    case "feedback":
    case "deliver":
      return new Set(["claim", "feedback", "readiness", "record"]);
    default:
      return new Set(ROUND_STEPS.map((step) => step.id));
  }
}

function combine(states: StepState[]): StepState {
  if (!states.length) return "pending";
  if (states.includes("failed")) return "failed";
  if (states.includes("running")) return "running";
  if (states.every((state) => state === "skipped")) return "skipped";
  if (states.every((state) => state === "completed" || state === "skipped"))
    return "completed";
  if (states.some((state) => state === "completed" || state === "skipped"))
    return "running";
  return "pending";
}

function earliest(values: (string | null)[]) {
  const sorted = values
    .filter((value): value is string => Boolean(value))
    .sort();
  return sorted[0] ?? null;
}

function latest(values: (string | null)[]) {
  const sorted = values
    .filter((value): value is string => Boolean(value))
    .sort();
  return sorted.at(-1) ?? null;
}

/**
 * Derive the round's steps. Without a run detail every step is "unobserved":
 * the Console never guesses node progress from the work item.
 */
export function deriveSteps(
  route: string | null,
  detail: RunDetailView | null,
): RoundStep[] {
  const planned = plannedSteps(route);
  const nodes = new Map(
    detail?.nodes.map((node) => [node.node_id, node]) ?? [],
  );
  const role = (name: string, node: string): StepRole => {
    const observed = nodes.get(node);
    return {
      name,
      node,
      state: !detail ? "unobserved" : (observed?.state ?? "pending"),
      timing: detail?.timings[node] ?? null,
      error: observed?.error ?? null,
    };
  };
  return ROUND_STEPS.map((definition) => {
    const roles = definition.roles.map((entry) => role(entry.name, entry.node));
    const scripts = definition.scripts.map((node) =>
      role("Trusted script", node),
    );
    const members = [...roles, ...scripts];
    // The engine's evidence overrides the static plan: e.g. a repair round
    // runs Ezra's define when the issue context changed.
    const roleRan = roles.some(
      (entry) =>
        entry.state === "running" ||
        entry.state === "completed" ||
        entry.state === "failed",
    );
    const isPlanned = planned.has(definition.id) || roleRan;
    let state: StepState;
    if (!detail) state = "unobserved";
    else {
      const seen = members.filter((member) => nodes.has(member.node));
      state = seen.length
        ? combine(seen.map((member) => member.state))
        : "pending";
      // A step whose role nodes were all skipped did not happen, even though
      // its trusted script ran to pass the round along.
      if (
        state === "completed" &&
        roles.length > 0 &&
        roles.every((entry) => entry.state === "skipped")
      )
        state = "skipped";
      if (state === "pending" && !isPlanned) state = "not-planned";
    }
    let note: string | null = null;
    if (
      definition.conditional &&
      roles.every((entry) => entry.state === "skipped")
    )
      note = "Not needed: no genuine dispute reached Agabus";
    else if (
      definition.id === "scope" &&
      roles[0]?.state === "skipped" &&
      route !== "initial"
    )
      note = "Reuses the recorded brief";
    else if (
      definition.id === "define" &&
      roles[0]?.state === "skipped" &&
      (route === "repair" || route === "review")
    )
      note = "Acceptance unchanged";
    else if (
      definition.id === "build" &&
      route === "review" &&
      roles[0]?.state !== "running" &&
      roles[0]?.state !== "completed" &&
      roles[0]?.state !== "failed"
    )
      note =
        "Review only: the frozen candidate is reviewed again without a new build";
    else if (
      definition.id === "claim" &&
      nodes.get("cooldown")?.state === "running"
    )
      note = "Waiting for the cooldown to elapse";
    return {
      id: definition.id,
      label: definition.label,
      roles,
      scripts,
      parallel: Boolean(definition.parallel),
      conditional: Boolean(definition.conditional),
      planned: isPlanned,
      state,
      startedAt: earliest(
        members.map((member) => member.timing?.startedAt ?? null),
      ),
      endedAt:
        state === "completed" || state === "failed" || state === "skipped"
          ? latest(members.map((member) => member.timing?.endedAt ?? null))
          : null,
      note,
    };
  });
}

export type Lane = {
  issue: IssueSummary;
  runId: string | null;
  detail: RunDetailView | null;
  detailError: string | null;
  steps: RoundStep[];
  /** The previous round returned the work to a role (repair or oracle). */
  returnedFrom: { round: number; to: string; summary: string | null } | null;
  waiting: string | null;
};

const RETURN_TARGETS: Record<string, string> = {
  repair: "Bezalel (repair)",
  oracle: "Ezra (acceptance correction)",
  review: "Micaiah and Luke (review only)",
  feedback: "feedback round",
};

/** Why a parked issue waits: each reserved area and the issue holding it. */
export function parkedText(parked: NonNullable<IssueSummary["parked"]>) {
  const areas = parked.areas.length ? parked.areas : ["a shared area"];
  const parts = areas.map((area) => {
    const holder = parked.holders[area];
    return holder ? `${area} is reserved by #${holder}` : `${area} is reserved`;
  });
  return `Parked: ${parts.join("; ")}. It starts when the ${
    areas.length === 1 ? "area is" : "areas are"
  } released.`;
}

/** Lanes for issues with live or pending round work. */
export function deriveLanes(
  issues: IssueSummary[],
  details: Record<string, RunDetailView>,
  detailErrors: Record<string, string>,
): Lane[] {
  return issues
    .filter(
      (issue) =>
        issue.admitted &&
        (issue.status === "active" ||
          issue.status === "waiting" ||
          issue.status === "pending" ||
          Boolean(issue.lease?.live)),
    )
    .map((issue) => {
      const runId =
        issue.run?.id ?? (issue.lease?.live ? issue.lease.runId : null);
      const detail = runId ? (details[runId] ?? null) : null;
      const previous = issue.history.at(-1) ?? null;
      const route = issue.run?.route ?? issue.route;
      const returnedFrom =
        previous &&
        previous.outcome === "continue" &&
        previous.next &&
        RETURN_TARGETS[previous.next] &&
        previous.next !== "feedback"
          ? {
              round: previous.round,
              to: RETURN_TARGETS[previous.next],
              summary: previous.summary ?? null,
            }
          : null;
      let waiting: string | null = null;
      if (!runId)
        waiting =
          issue.control === "hold"
            ? "Held by an operator; the next claim refuses"
            : issue.parked
              ? parkedText(issue.parked)
              : issue.status === "pending"
                ? "Admitted; waiting for its first round to start"
                : `Waiting for the next round (${issue.route ?? "no route"})`;
      return {
        issue,
        runId,
        detail,
        detailError: runId ? (detailErrors[runId] ?? null) : null,
        steps: runId ? deriveSteps(route, detail) : [],
        returnedFrom,
        waiting,
      };
    })
    .sort((left, right) => left.issue.issue - right.issue.issue);
}

/**
 * The live work map stays focused on active work: lanes with a live round
 * first (otherwise in issue order), at most `limit` until every lane is asked
 * for.
 */
export function focusLanes<Entry extends { runId: string | null }>(
  lanes: readonly Entry[],
  limit: number,
  every: boolean,
): { shown: Entry[]; total: number } {
  const ordered = [...lanes].sort(
    (left, right) => Number(right.runId !== null) - Number(left.runId !== null),
  );
  return {
    shown: every ? ordered : ordered.slice(0, limit),
    total: ordered.length,
  };
}
