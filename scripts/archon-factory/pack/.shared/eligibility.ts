export type Condition =
  "implemented" | "integrated" | "dispatch-ready" | "qualified" | "released";

export type Dependency =
  | {
      kind: "implementation";
      targetId: string;
      requires: "implemented" | "integrated";
    }
  | { kind: "dispatch"; targetId: string; requires: "dispatch-ready" }
  | {
      kind: "qualification";
      targetId: string;
      requires: "qualified";
      gatesAdmission: boolean;
    }
  | {
      kind: "release";
      targetId: string;
      requires: "released";
      gatesAdmission: boolean;
    }
  | { kind: "informational" | "optional"; targetId: string };

export type AdmissionGate = "hold" | "owner" | "sharedArea" | "resources";

export interface WorkItem {
  id: string;
  contextRevision: string;
  eligibleSinceMs: number;
  dependenciesReconciled: boolean;
  dependencies: Dependency[];
  evidence: {
    condition: Condition;
    source: string;
    revision: string;
    contextRevision: string;
  }[];
  admission: Record<
    "hold" | "owner" | "sharedArea" | "resources",
    "clear" | "conflict" | "unavailable"
  >;
}

export type Observation =
  | { status: "found"; value: WorkItem }
  | { status: "missing" }
  | { status: "unavailable" };

export interface EligibilityInput {
  scope: { revision: string; approvedIssueIds: string[] };
  items: Record<string, Observation>;
}

export interface Blocker {
  issueId: string;
  code:
    | "api-unavailable"
    | "missing-issue"
    | "malformed-issue"
    | "cyclic-dependency"
    | "self-dependency"
    | "unreconciled-dependencies"
    | "malformed-dependency"
    | "unsatisfied-dependency"
    | `${AdmissionGate}-${"conflict" | "unavailable"}`;
  dependencyId?: string;
}

export interface EligibilityResult {
  scopeRevision: string;
  eligible: WorkItem[];
  blocked: { issueId: string; reasons: Blocker[] }[];
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isText(value: unknown): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= 2048
  );
}

function isWorkItem(value: unknown, id: string): value is WorkItem {
  return (
    isRecord(value) &&
    value.id === id &&
    isText(value.contextRevision) &&
    Number.isSafeInteger(value.eligibleSinceMs) &&
    (value.eligibleSinceMs as number) >= 0 &&
    typeof value.dependenciesReconciled === "boolean" &&
    Array.isArray(value.dependencies) &&
    Array.isArray(value.evidence) &&
    isRecord(value.admission)
  );
}

function hardDependency(value: unknown): "soft" | "malformed" | Dependency {
  if (!isRecord(value)) return "malformed";
  if (value.kind === "optional" || value.kind === "informational")
    return "soft";
  if (!isText(value.targetId)) return "malformed";
  if (
    value.kind === "implementation" &&
    (value.requires === "implemented" || value.requires === "integrated")
  )
    return value as Dependency;
  if (value.kind === "dispatch" && value.requires === "dispatch-ready")
    return value as Dependency;
  if (
    (value.kind === "qualification" && value.requires === "qualified") ||
    (value.kind === "release" && value.requires === "released")
  ) {
    if (typeof value.gatesAdmission !== "boolean") return "malformed";
    return value.gatesAdmission ? (value as Dependency) : "soft";
  }
  return "malformed";
}

export function evaluateEligibility(
  input: EligibilityInput,
): EligibilityResult {
  if (
    !isRecord(input) ||
    !isRecord(input.scope) ||
    !isText(input.scope.revision) ||
    !Array.isArray(input.scope.approvedIssueIds) ||
    !input.scope.approvedIssueIds.every(isText) ||
    new Set(input.scope.approvedIssueIds).size !==
      input.scope.approvedIssueIds.length ||
    !isRecord(input.items)
  )
    throw new TypeError(
      "Explicit unique approved issue scope and observations required",
    );

  const result: EligibilityResult = {
    scopeRevision: input.scope.revision,
    eligible: [],
    blocked: [],
  };
  for (const issueId of [...input.scope.approvedIssueIds].sort()) {
    const reasons: Blocker[] = [];
    const add = (code: Blocker["code"], dependencyId?: string) => {
      reasons.push({
        issueId,
        code,
        ...(dependencyId === undefined ? {} : { dependencyId }),
      });
    };
    const read = (id: string): WorkItem | undefined => {
      const observation: unknown = Object.hasOwn(input.items, id)
        ? input.items[id]
        : undefined;
      if (!isRecord(observation) || observation.status === "unavailable") {
        add("api-unavailable", id);
      } else if (observation.status === "missing") {
        add("missing-issue", id);
      } else if (
        observation.status !== "found" ||
        !isWorkItem(observation.value, id)
      ) {
        add("malformed-issue", id);
      } else return observation.value;
    };
    const checked = new Set<string>();
    const inspect = (initial: WorkItem) => {
      const active = new Set<string>();
      const pending = [{ work: initial, exit: false }];
      while (pending.length > 0) {
        const frame = pending.pop()!;
        const work = frame.work;
        if (frame.exit) {
          active.delete(work.id);
          continue;
        }
        if (active.has(work.id)) {
          add("cyclic-dependency", work.id);
          continue;
        }
        if (checked.has(work.id)) continue;
        checked.add(work.id);
        active.add(work.id);
        pending.push({ work, exit: true });
        if (!work.dependenciesReconciled)
          add("unreconciled-dependencies", work.id);
        for (const raw of work.dependencies) {
          const edge = hardDependency(raw);
          if (edge === "soft") continue;
          if (edge === "malformed") {
            add("malformed-dependency", work.id);
            continue;
          }
          if (edge.targetId === work.id) {
            add("self-dependency", work.id);
            continue;
          }
          const prerequisite = read(edge.targetId);
          if (!prerequisite) continue;
          const satisfied = prerequisite.evidence.some(
            (evidence: unknown) =>
              isRecord(evidence) &&
              "requires" in edge &&
              evidence.condition === edge.requires &&
              isText(evidence.source) &&
              isText(evidence.revision) &&
              evidence.contextRevision === prerequisite.contextRevision,
          );
          if (!satisfied) add("unsatisfied-dependency", edge.targetId);
          pending.push({ work: prerequisite, exit: false });
        }
      }
    };
    const work = read(issueId);
    if (work) {
      for (const gate of [
        "hold",
        "owner",
        "sharedArea",
        "resources",
      ] as const) {
        const observation = Object.hasOwn(work.admission, gate)
          ? work.admission[gate]
          : "unavailable";
        if (observation !== "clear")
          add(
            `${gate}-${observation === "conflict" ? "conflict" : "unavailable"}`,
          );
      }
      inspect(work);
      if (reasons.length === 0) result.eligible.push(work);
    }
    if (reasons.length > 0) result.blocked.push({ issueId, reasons });
  }
  return result;
}
