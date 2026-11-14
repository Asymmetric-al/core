// Scope validation for Samson's result, the shared-area reservations a scoped
// issue holds while it is delivered, and the stages a round runs after scope.
import { isDeepStrictEqual } from "node:util";

import { conditionalWrite } from "../../.shared/archon.mjs";
import { RESERVATIONS } from "../../.shared/workitem.mjs";
import {
  allToAcceptance,
  ezraCorrections,
  withContextChange,
} from "./repair-logic.mjs";

// The document record releases on every terminal outcome (I4).
export { RESERVATIONS };

// CI workflows, Git hooks and their implementation, the factory's own policy,
// agent settings, package-manager configuration and the root CI gates. The
// root package.json is where the hooks resolve `ci:preflight` and lint-staged
// and where bun reads trustedDependencies and packageManager, so dependency
// work needs the same authorization. A scope may touch these paths only with
// an operator's explicit allow-list in core/scope.
export const PROTECTED_GLOBS = [
  ".github/**",
  ".husky/**",
  "scripts/git/**",
  "scripts/archon-factory/**",
  ".archon/**",
  ".claude/**",
  "bunfig.toml",
  ".npmrc",
  "package.json",
  "scripts/verify/ci-*.mjs",
];

export const validGlob = (glob) =>
  typeof glob === "string" &&
  glob.length > 0 &&
  glob.length < 200 &&
  !glob.startsWith("/") &&
  !glob
    .split("/")
    .some(
      (segment) => segment === ".." || segment === "." || segment === ".git",
    ) &&
  !/[\0\r\n\\]/.test(glob);

// The globs follow policy.mjs globToRegExp: `*` and `?` stay inside one path
// segment, `**/` is zero or more whole segments and any other `**` is anything.
const NON_SLASH = 1;
const ANY = 2;

function automaton(glob) {
  const edges = [[]];
  const empty = [[]];
  const add = () => {
    edges.push([]);
    empty.push([]);
    return edges.length - 1;
  };
  let state = 0;
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    const next = add();
    if (char === "*" && glob[index + 1] === "*" && glob[index + 2] === "/") {
      const loop = add();
      empty[state].push(next);
      edges[state].push({ label: ANY, to: loop }, { label: "/", to: next });
      edges[loop].push({ label: ANY, to: loop }, { label: "/", to: next });
      index += 2;
    } else if (char === "*") {
      const wide = glob[index + 1] === "*";
      empty[state].push(next);
      edges[state].push({ label: wide ? ANY : NON_SLASH, to: state });
      if (wide) index += 1;
    } else
      edges[state].push({ label: char === "?" ? NON_SLASH : char, to: next });
    state = next;
  }
  return { edges, empty, accept: state };
}

const compatible = (a, b) => {
  if (typeof a === "string" && typeof b === "string") return a === b;
  if (typeof a === "string") return b === ANY || a !== "/";
  if (typeof b === "string") return a === ANY || b !== "/";
  return true;
};

// True when some path matches both globs (product of the two automata).
export function globsOverlap(a, b) {
  const left = automaton(a);
  const right = automaton(b);
  const seen = new Set();
  const queue = [[0, 0]];
  while (queue.length) {
    const [p, q] = queue.pop();
    const key = `${p},${q}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (p === left.accept && q === right.accept) return true;
    for (const to of left.empty[p]) queue.push([to, q]);
    for (const to of right.empty[q]) queue.push([p, to]);
    for (const x of left.edges[p])
      for (const y of right.edges[q])
        if (compatible(x.label, y.label)) queue.push([x.to, y.to]);
  }
  return false;
}

const allowed = (allowProtected, area) =>
  allowProtected === true ||
  (Array.isArray(allowProtected) && allowProtected.includes(area));

export function protectedTouches(globs, allowProtected) {
  const touches = [];
  for (const glob of globs)
    for (const area of PROTECTED_GLOBS)
      if (!allowed(allowProtected, area) && globsOverlap(glob, area))
        touches.push({ glob, area });
  return touches;
}

export const protectedBlock = (touches) => ({
  code: "protected-path",
  detail: touches
    .map(({ glob, area }) => `${glob} can touch ${area}`)
    .join("; ")
    .slice(0, 1200),
  recovery:
    "Narrow the scope away from protected paths, or have an operator authorize them for this issue in core/scope (allowProtected), then retry",
});

export function validateScope(scope, { allowProtected } = {}) {
  const stop = (reason, blocked) => ({ ok: false, reason, blocked });
  if (!scope || scope.task_status !== "DONE")
    return stop("Samson did not complete scoping", {
      code: "scope-incomplete",
      detail: scope?.blocker ?? "No scope result",
    });
  if (scope.decision === "blocked")
    return stop(`Samson blocked the issue: ${scope.blocker}`, {
      code: "scope-blocked",
      detail: scope.blocker,
      recovery: scope.uncertainty,
    });
  const sources = scope.source_paths.filter(validGlob);
  const tests = scope.test_paths.filter(validGlob);
  // No implementation path is a valid scope when the issue changes acceptance
  // tests alone; no path at all is not.
  if (
    sources.length !== scope.source_paths.length ||
    tests.length !== scope.test_paths.length ||
    sources.length + tests.length === 0
  )
    return stop("Scope paths are not valid repository-relative globs", {
      code: "scope-paths",
      detail: JSON.stringify({
        source: scope.source_paths,
        test: scope.test_paths,
      }),
    });
  const touches = protectedTouches([...sources, ...tests], allowProtected);
  if (touches.length)
    return stop(
      "Scope paths reach protected repository policy",
      protectedBlock(touches),
    );
  const overlaps = sources.flatMap((source) =>
    tests
      .filter((test) => globsOverlap(source, test))
      .map((test) => `${source} and ${test}`),
  );
  if (overlaps.length)
    return stop("Source and acceptance-test paths overlap", {
      code: "scope-overlap",
      detail: `One writer per path: ${overlaps.join("; ")}`.slice(0, 1200),
    });
  return { ok: true, sources, tests };
}

const globsOf = (list) => (Array.isArray(list) ? list : []);

// A recorded brief names at least one path to change.
export const hasScope = (brief) =>
  globsOf(brief?.source_paths).length + globsOf(brief?.test_paths).length > 0;

// An issue owned by Acceptance: test paths and no implementation path. Ezra is
// its only writer; Bezalel confirms the tests against the unchanged code.
export const acceptanceOnly = (brief) =>
  globsOf(brief?.source_paths).length === 0 &&
  globsOf(brief?.test_paths).length > 0;

// The "Paths" section of each writer's assignment.
export function ezraPaths(brief) {
  const tests = `You may write acceptance tests only under: ${globsOf(brief?.test_paths).join(", ") || "(none: use documentary checks)"}`;
  return acceptanceOnly(brief)
    ? `${tests}\nImplementation paths: none. This issue changes acceptance tests only: nothing else in the repository will change, so the tests must pass against the code as it is. Show what the change now catches (for example a case the previous check let through).`
    : `${tests}\nImplementation paths (read-only for you): ${globsOf(brief?.source_paths).join(", ")}`;
}

export function bezalelPaths(brief) {
  const tests = `Acceptance tests (read-only for you): ${globsOf(brief?.test_paths).join(", ") || "none"}`;
  return acceptanceOnly(brief)
    ? [
        "You may edit: nothing. This issue changes acceptance tests only and Ezra has made that change.",
        tests,
        "Run the acceptance tests with run_check against the unchanged code and report the outcome. If they need an implementation change or are wrong, say so in oracle_requests.",
      ].join("\n")
    : `You may edit only: ${globsOf(brief?.source_paths).join(", ")}\n${tests}`;
}

export function sharedAreas(areas) {
  const result = [];
  for (const area of Array.isArray(areas) ? areas : []) {
    const name = typeof area === "string" ? area.trim() : "";
    if (name && name.length <= 200 && !result.includes(name)) result.push(name);
  }
  return result.slice(0, 12);
}

export function scopedBrief(scope, { sources, tests }, contextFingerprint) {
  return {
    summary: String(scope.brief).slice(0, 6000),
    source_paths: sources,
    test_paths: tests,
    docs_only: Boolean(scope.docs_only),
    shared_areas: sharedAreas(scope.shared_areas),
    out_of_scope: scope.out_of_scope.slice(0, 20),
    sources: scope.sources.slice(0, 32),
    contextFingerprint,
    uncertainty: String(scope.uncertainty).slice(0, 1500),
    repair: null,
  };
}

// The issue holds exactly its requested areas; any area another issue holds
// parks it without writing.
export function planReservation(document, { issue, areas }) {
  const requested = sharedAreas(areas);
  const holder = Number(issue);
  const stored = document?.value?.areas;
  const current =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? stored
      : {};
  const holders = {};
  for (const area of requested)
    if (Object.hasOwn(current, area) && Number(current[area]) !== holder)
      holders[area] = current[area];
  if (Object.keys(holders).length)
    return { kind: "parked", areas: requested, holders };
  const next = {};
  for (const [area, held] of Object.entries(current))
    if (Number(held) !== holder || requested.includes(area)) next[area] = held;
  for (const area of requested) next[area] = holder;
  if (isDeepStrictEqual(next, current))
    return { kind: "held", areas: requested };
  return {
    kind: "write",
    areas: requested,
    ifRevision: document?.revision ?? 0,
    value: { ...(document?.value ?? {}), v: 1, areas: next },
  };
}

// A conditional write on the observed revision, re-planned after each
// StateConflict: the first attempt plus up to four retries (I4).
export async function reserveAreas(archon, { issue, areas, retries = 4 }) {
  let plan;
  const result = await conditionalWrite(
    archon,
    RESERVATIONS,
    (document) => {
      plan = planReservation(document, { issue, areas });
      if (plan.kind === "held" && plan.areas.length)
        return {
          name: RESERVATIONS,
          ifRevision: document.revision,
          value: document.value,
        };
      return plan.kind === "write"
        ? { name: RESERVATIONS, ifRevision: plan.ifRevision, value: plan.value }
        : { noop: true };
    },
    { attempts: retries + 1 },
  );
  if (result.written) return { kind: "reserved", areas: plan.areas };
  if (result.noop) return plan;
  throw new Error(
    `${RESERVATIONS} kept changing while reserving shared areas; the next round retries`,
  );
}

// The after-scope ledger entry for a parked round (I4): record reads
// entry.parked and keeps the issue waiting without counting the round.
export function parkingStop({ areas, holders }) {
  const held = Object.entries(holders)
    .map(([area, holder]) => `${area} (#${holder})`)
    .join(", ");
  return {
    reason: `Parked: shared areas reserved by other issues: ${held}`,
    ledger: {
      define: false,
      build: false,
      parked: { code: "area-reserved", areas, holders },
    },
  };
}

// Which stages follow scope. A context change is added to pending repairs.
// A review-only round runs no AI stage and continues (I1); a context change
// waits in brief.repair for Ezra, and after-assess returns the candidate to
// her instead of final acceptance.
export function planScopeStages({ route, brief, contextChanged, fingerprint }) {
  const contextual = Boolean(contextChanged) && route !== "initial";
  const withContext = contextual
    ? {
        ...brief,
        repair: withContextChange(brief.repair),
        contextFingerprint: fingerprint,
      }
    : brief;
  // An acceptance-only issue has no implementation writer: Ezra takes every
  // repair, whoever it was addressed to.
  const moved = acceptanceOnly(withContext)
    ? allToAcceptance(withContext.repair)
    : null;
  const next = moved ? { ...withContext, repair: moved } : withContext;
  const changed = contextual || Boolean(moved);
  if (route === "review")
    return {
      kind: "proceed",
      brief: next,
      briefChanged: changed,
      define: false,
      build: false,
      stage: null,
      reason: contextual
        ? "Review-only round on the recorded head; the context change is recorded for Ezra"
        : "Review-only round on the recorded head",
    };
  const define =
    route === "initial" ||
    route === "oracle" ||
    ezraCorrections(next.repair).length > 0;
  const stage = route === "initial" ? "design" : "oracle_repair";
  return {
    kind: "proceed",
    brief: next,
    briefChanged: changed,
    define,
    build: define || route === "repair",
    stage,
    reason: define ? `Ezra ${stage}` : "Acceptance unchanged",
  };
}
