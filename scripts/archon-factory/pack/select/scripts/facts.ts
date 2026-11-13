// Selector facts: build trusted observations for the authorized scope, compute
// the eligible frontier deterministically, and sweep admitted work items:
// restart idle rounds whose start was missed or refused, and reconcile items
// whose run ended without recording. Samson only ranks what this code admits.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createArchon } from "../../.shared/archon.mjs";
import { factoryPaths, limits, loadConfig } from "../../.shared/config.mjs";
import { evaluateEligibility } from "../../.shared/eligibility.ts";
import { createGitHub, githubToken } from "../../.shared/github.mjs";
import { createGit } from "../../.shared/git.mjs";
import {
  ensureInitialRunIdentity,
  serviceNativeIdentity,
} from "../../.shared/identity.mjs";
import { fireRound } from "../../.shared/webhook.mjs";
import { writeRunContext } from "../../.shared/runctx.mjs";
import { RESERVATIONS, factoryPermitsIntake } from "../../.shared/workitem.mjs";
import { observeAdmission } from "./admission-observations.mjs";
import { removeNodeModules } from "../../.shared/round.mjs";
import {
  announceBlocked,
  observeMerges,
  pruneFinished,
  releaseStaleReservations,
  scopeDigest,
  sweepItems,
} from "./intake-logic.mjs";
import { openAttention, rankAssignment } from "./rank-logic.mjs";

const config = loadConfig();
const paths = factoryPaths(config);
const archon = createArchon();
const runId = process.env.WORKFLOW_ID!;
const artifacts = process.env.ARTIFACTS_DIR!;
const now = Date.now();
const out = (
  value: Record<string, string>,
  ledger: Record<string, unknown>,
) => {
  mkdirSync(path.posix.join(artifacts, "select"), { recursive: true });
  writeFileSync(
    path.posix.join(artifacts, "select", "facts.json"),
    JSON.stringify(ledger, null, 2),
  );
  process.stdout.write(JSON.stringify(value) + "\n");
  process.exit(0);
};

const factory = (await archon.get("core/factory")).value;
const scopeDoc = await archon.get("core/scope");
const scope = scopeDoc.value;
if (scope) serviceNativeIdentity(config, scope.owner);
await ensureInitialRunIdentity({ config, runId });
const listing = await archon.list("core/issues/", { values: true });
const items = new Map<number, any>();
for (const entry of listing.documents ?? [])
  if (/^core\/issues\/\d+$/.test(entry.name))
    items.set(Number(entry.name.split("/")[2]), { ...entry });

const releasedAreas = await releaseStaleReservations({
  archon,
  items: new Map([...items].map(([issue, entry]) => [issue, entry.value])),
});
const reservations = (await archon.get(RESERVATIONS)).value?.areas ?? {};

// Sweep: start idle rounds under their revision key, reconcile active items
// whose run ended without recording, keep parked items parked while another
// issue holds their areas.
const sweep = await sweepItems({
  archon,
  names: [...items.keys()].map((issue) => `core/issues/${issue}`),
  factory,
  reservations,
  now: new Date(now).toISOString(),
  limits: limits(config),
  fire: ({ value, revision }: { value: any; revision: number }) =>
    fireRound({ config, value, revision }),
});
const swept: any[] = sweep.filter((entry) => entry.action !== "skip");

// GitHub is asked for the pass's own notices only; nothing here can fail the
// pass, and all of it runs whether or not intake is open.
let sweepGitHub: ReturnType<typeof createGitHub> | null = null;
const noticeGitHub = async () =>
  (sweepGitHub ??= createGitHub({
    token: await githubToken({
      gh: config.github.executable,
      configDir: config.github.configDir,
    }),
    repo: config.repository.slug,
  }));

// Tell the owner on GitHub about issues the factory stopped on.
const stopped = new Map(
  [...items]
    .filter(([, entry]) => entry.value?.status === "BLOCKED")
    .map(([issue, entry]) => [issue, entry.value]),
);
if (stopped.size)
  try {
    const notices = await announceBlocked({
      github: await noticeGitHub(),
      items: stopped,
      nowMs: now,
    });
    swept.push(
      ...notices.map((notice: any) => ({ ...notice, action: "announce" })),
    );
  } catch {}

// Record ready pull requests that somebody merged, then drop the dependency
// trees of every merged issue.
const values = () =>
  new Map([...items].map(([issue, entry]) => [issue, entry.value]));
if ([...items.values()].some((entry) => entry.value?.status === "PR_READY"))
  try {
    const merges = await observeMerges({
      archon,
      github: await noticeGitHub(),
      items: values(),
      targetBranch: config.repository.targetBranch,
      by: runId,
      now: new Date(now).toISOString(),
      nowMs: now,
    });
    for (const merge of merges)
      if (merge.pr)
        items.set(merge.issue, {
          ...(await archon.get(`core/issues/${merge.issue}`)),
        });
    swept.push(...merges);
  } catch {}
try {
  swept.push(
    ...pruneFinished({
      items: values(),
      paths,
      removeTrees: removeNodeModules,
    }),
  );
} catch {}

const intake = factoryPermitsIntake(factory);
if (!intake.ok)
  out(
    {
      rank: "no",
      admit: "no",
      samson_assignment: "",
      reason: `Intake closed: ${intake.code}`,
    },
    { intake: intake.code, swept },
  );
if (
  !scope ||
  scope.v !== 1 ||
  !Array.isArray(scope.issues) ||
  !scope.issues.length
)
  out(
    {
      rank: "no",
      admit: "no",
      samson_assignment: "",
      reason: "No authorized scope",
    },
    { swept },
  );
const scopeRevision = scopeDigest(scope);

let github;
try {
  github = createGitHub({
    token: await githubToken({
      gh: config.github.executable,
      configDir: config.github.configDir,
    }),
    repo: config.repository.slug,
  });
} catch (error) {
  out(
    {
      rank: "no",
      admit: "no",
      samson_assignment: "",
      reason: (error as Error).message,
    },
    { code: "github-auth", swept },
  );
}
let fresh;
try {
  fresh = await observeAdmission({ github, archon, config, nowMs: now });
} catch (error) {
  out(
    {
      rank: "no",
      admit: "no",
      samson_assignment: "",
      reason: (error as Error).message,
    },
    { code: "admission-observations-unavailable", swept },
  );
}
if (
  fresh.scopeRevision !== scopeRevision ||
  fresh.scopeDocumentRevision !== scopeDoc.revision
)
  out(
    {
      rank: "no",
      admit: "no",
      samson_assignment: "",
      reason:
        "The authorized scope changed during observation; the next pass re-evaluates it",
    },
    { code: "scope-changed", swept },
  );
const { input, summaries, capacity, active } = fresh;
const result = evaluateEligibility(input as any);
const ledger = {
  scopeRevision,
  scopeDocumentRevision: fresh.scopeDocumentRevision,
  observedAt: fresh.observedAt,
  releasedAreas,
  capacity,
  active: active.map((entry: any) => entry.value.issue),
  frontier: result.eligible.map((item) => item.id),
  blocked: result.blocked,
  swept,
  input,
  summaries,
  reservations: fresh.reservations,
};
mkdirSync(path.posix.join(paths.runs, runId), { recursive: true });
writeFileSync(
  path.posix.join(paths.runs, runId, "eligibility.json"),
  JSON.stringify(ledger, null, 2),
);
if (!result.eligible.length || capacity === 0)
  out(
    {
      rank: "no",
      admit: "no",
      samson_assignment: "",
      reason:
        capacity === 0
          ? "Delivery capacity is full"
          : "No eligible issue in the authorized scope",
    },
    ledger,
  );
if (result.eligible.length === 1)
  out(
    {
      rank: "no",
      admit: "yes",
      samson_assignment: "",
      reason: `One eligible issue: ${result.eligible[0].id}`,
    },
    ledger,
  );
const materials = path.posix.join(paths.runs, runId, "materials", "rank");
mkdirSync(materials, { recursive: true });
const git = createGit({ executable: config.git.executable });
for (const [file, name] of [
  ["docs/prds/sitestacker-parity/roadmap.md", "roadmap.md"],
  ["docs/ai/document-authority.md", "document-authority.md"],
]) {
  const shown = await git.git(
    ["show", `refs/remotes/origin/${config.repository.targetBranch}:${file}`],
    { gitDir: paths.mirror },
  );
  if (shown.code === 0)
    writeFileSync(path.posix.join(materials, name), shown.stdout);
}
writeRunContext(
  {
    v: 1,
    runId,
    issue: 0,
    round: 0,
    nodes: { rank: { role: "samson", read: [materials] } },
  },
  paths.runs,
);
const frontier = result.eligible.map((item) => ({
  ...summaries.find((summary: any) => summary.id === item.id),
  contextRevision: item.contextRevision,
  eligibleSinceMs: item.eligibleSinceMs,
}));
// S11.40: open analysis findings reach Samson's ranking as data.
const attention = (await archon.get("core/attention")).value;
const assignment = rankAssignment({
  scopeRevision,
  scope,
  nowMs: now,
  agingIntervalMs: config.limits?.agingIntervalMs ?? 86_400_000,
  maxAgingBonus: config.limits?.maxAgingBonus ?? 10,
  frontier,
  active: active.map((entry: any) => ({
    issue: entry.value.issue,
    status: entry.value.status,
    areas: entry.value.areas,
  })),
  materials,
  attention,
});
out(
  {
    rank: "yes",
    admit: "yes",
    samson_assignment: assignment,
    reason: `${result.eligible.length} eligible issues`,
  },
  {
    ...ledger,
    attention: openAttention(attention).map((item) => item.fingerprint),
  },
);
