// Claim's decisions that depend only on the claimed work item: which stages
// a route runs, the role nodes' trusted read/write/check context, and how long
// a feedback round waits before it observes the PR.

const STAGES = {
  initial: { scope: "yes", define: "yes", build: "yes", feedback: "no" },
  repair: { scope: "no", define: "no", build: "yes", feedback: "no" },
  oracle: { scope: "no", define: "yes", build: "yes", feedback: "no" },
  // I1: build "yes" opens the build-round gates; after-scope and after-define
  // run no AI stage for a review round, and freeze reuses the recorded head.
  review: { scope: "no", define: "no", build: "yes", feedback: "no" },
  feedback: { scope: "no", define: "no", build: "no", feedback: "yes" },
  deliver: { scope: "no", define: "no", build: "no", feedback: "yes" },
};

export function roundStages(route) {
  const stages = Object.hasOwn(STAGES, route) ? STAGES[route] : null;
  if (!stages) return null;
  return {
    do_scope: stages.scope,
    do_define: stages.define,
    do_build: stages.build,
    do_feedback: stages.feedback,
  };
}

// Routes whose freeze commits work. Only these take an unrecorded commit back
// into the working tree; a review or feedback round works on the recorded one.
export const commitsWork = (route) =>
  ["initial", "repair", "oracle"].includes(route);

// A feedback round observes the PR no sooner than checkWaitMs after the last
// recorded round; waits shorter than fifteen seconds are not worth a node.
export function feedbackWait({ lastAt, nowMs, checkWaitMs }) {
  const last = Date.parse(lastAt ?? "");
  const due = (Number.isFinite(last) ? last : nowMs) + checkWaitMs;
  return due > nowMs + 15_000 ? new Date(due).toISOString() : "";
}

// The trusted context each role node runs with. Writers (Ezra's tests, Bezalel's
// sources) get a run_check workspace on the issue clone in which the mirror's
// objects and the clone's own .git are read-only: a check command can neither
// commit, plant Git config nor move refs (S5.10/S6.10).
export function roleNodes({ where, mirror, materials, brief }) {
  const check = {
    workspaceRoot: where.root,
    workspaceDirectory: where.repo,
    workspaceTarget: where.repo,
    mounts: [
      {
        source: `${mirror}/objects`,
        target: `${mirror}/objects`,
        readOnly: true,
      },
      {
        source: `${where.repo}/.git`,
        target: `${where.repo}/.git`,
        readOnly: true,
      },
    ],
  };
  const sourceGlobs = Array.isArray(brief?.source_paths)
    ? brief.source_paths
    : [];
  const testGlobs = Array.isArray(brief?.test_paths) ? brief.test_paths : [];
  return {
    scope: { role: "samson", read: [where.repo, materials("scope")] },
    define: {
      role: "ezra",
      read: [where.repo, materials("ezra")],
      write: [{ root: where.repo, globs: testGlobs }],
      check,
    },
    build: {
      role: "bezalel",
      read: [where.repo, materials("bezalel")],
      write: [{ root: where.repo, globs: sourceGlobs }],
      denyWrite: [{ root: where.repo, globs: testGlobs }],
      check,
    },
    assess: { role: "samson", read: [materials("assess")] },
    dispose: { role: "samson", read: [where.repo, materials("dispose")] },
  };
}
