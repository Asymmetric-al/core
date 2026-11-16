// Claim: verify controls, take the issue lease for this round, prepare the
// issue workspace and decide which stages run.
import { StateConflict } from "../../.shared/archon.mjs";
import {
  ensureIssueRepo,
  ensureMirror,
  fetchMirror,
  prepareBranch,
  revParse,
} from "../../.shared/git.mjs";
import { NativeIdentityRefusal } from "../../.shared/identity.mjs";
import {
  emit,
  ensureInstall,
  inheritRoundIdentity,
  openRound,
  policyRevision,
  writeWorkItem,
} from "../../.shared/round.mjs";
import {
  Refusal,
  factoryPermitsRound,
  planCheckpoint,
  planClaim,
} from "../../.shared/workitem.mjs";
import {
  commitsWork,
  feedbackWait,
  roleNodes,
  roundStages,
} from "./claim-logic.mjs";

const round = openRound();
const no = (reason: string, extra: Record<string, unknown> = {}) => {
  round.ledger.write("claim", { proceed: false, reason, ...extra });
  emit({
    proceed: "no",
    route: "",
    do_scope: "no",
    do_define: "no",
    do_build: "no",
    do_feedback: "no",
    needs_wait: "no",
    wait_until: "",
    reason,
  });
  process.exit(0);
};

const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "work";

const factory = await round.archon.get("core/factory");
const permitted = factoryPermitsRound(factory.value);
if (!permitted.ok)
  no(`Factory does not permit rounds: ${permitted.code}`, {
    code: permitted.code,
    leaseTaken: false,
  });

const release = policyRevision(round.paths);
let document = await round.archon.get(`core/issues/${round.issue}`);
let plan;
try {
  plan = planClaim(document, {
    runId: round.runId,
    assignmentId: round.assignment,
    policyRevision: release.policyRevision,
    now: round.now(),
  });
} catch (error) {
  if (error instanceof Refusal)
    no(`Claim refused: ${error.message}`, {
      code: error.code,
      leaseTaken: false,
    });
  throw error;
}
try {
  await inheritRoundIdentity(round, document.value.assignment);
} catch (error) {
  if (error instanceof NativeIdentityRefusal)
    no(`Identity refused: ${error.code}`, {
      code: error.code,
      leaseTaken: false,
    });
  throw error;
}
try {
  await writeWorkItem(round, plan);
} catch (error) {
  if (error instanceof StateConflict)
    no("Another writer changed the work item or holds its lease", {
      code: "conflict",
      leaseTaken: false,
    });
  throw error;
}
round.ledger.write("claim-lease", {
  taken: true,
  resuming: plan.resuming,
  round: plan.value.round,
  at: round.now(),
});

const value = plan.value;
const route: string = value.run.route;
const stages = roundStages(route);
if (!stages)
  no(`Unknown route ${route}`, { code: "unknown-route", leaseTaken: true });
try {
  await ensureMirror({
    git: round.git,
    paths: round.paths,
    remote: round.config.repository.remote,
  });
  const mirror = await fetchMirror({ git: round.git, paths: round.paths });
  await ensureIssueRepo({
    git: round.git,
    paths: round.paths,
    issue: round.issue,
  });
  const target = round.config.repository.targetBranch;
  const base =
    value.base ??
    (await revParse(
      { git: round.git, cwd: round.where.repo },
      `refs/remotes/origin/${target}`,
    ));
  let branch = value.branch;
  if (!branch) {
    const title = await (async () => {
      try {
        const { githubToken, createGitHub } =
          await import("../../.shared/github.mjs");
        const token = await githubToken({
          gh: round.config.github.executable,
          configDir: round.config.github.configDir,
        });
        const issue = await createGitHub({
          token,
          repo: round.config.repository.slug,
        }).issue(round.issue);
        return String(issue.title ?? "");
      } catch {
        return "";
      }
    })();
    branch = `factory/${round.issue}-${slug(title)}`;
  }
  const prepared = await prepareBranch({
    git: round.git,
    repo: round.where.repo,
    branch,
    head: value.head,
    base,
    keepUnrecorded: commitsWork(route),
  });
  const install = await ensureInstall(round);
  document = await round.archon.get(`core/issues/${round.issue}`);
  await writeWorkItem(
    round,
    planCheckpoint(document, {
      runId: round.runId,
      fields: { branch, base },
      now: round.now(),
    }),
  );

  const nodes = roleNodes({
    where: round.where,
    mirror: round.paths.mirror,
    materials: (role: string) => round.materials(role),
    brief: value.brief,
  });
  round.context.write({
    v: 1,
    runId: round.runId,
    issue: round.issue,
    assignment: round.assignment,
    artifacts: round.artifacts,
    round: value.round,
    nodes,
  });

  const waitUntil =
    route === "feedback"
      ? feedbackWait({
          lastAt: value.history.at(-1)?.at,
          nowMs: Date.now(),
          checkWaitMs: round.limits.checkWaitMs,
        })
      : "";
  round.ledger.write("claim", {
    proceed: true,
    route,
    round: value.round,
    branch,
    base,
    head: value.head,
    reusedWorkspace: prepared.reused,
    ...(prepared.restored ? { restoredCommit: prepared.restored } : {}),
    ...(mirror.attempts > 1 ? { mirrorFetchAttempts: mirror.attempts } : {}),
    install,
    policy: release,
  });
  emit({
    proceed: "yes",
    route,
    ...stages,
    needs_wait: waitUntil ? "yes" : "no",
    wait_until: waitUntil,
    reason: `Round ${value.round} (${route}) on ${branch}`,
  });
} catch (error) {
  const err = error as Error & { code?: string };
  round.ledger.write("claim", {
    proceed: false,
    leaseTaken: true,
    failed: true,
    code: err.code ?? "workspace",
    reason: err.message.slice(0, 1500),
  });
  emit({
    proceed: "no",
    route,
    do_scope: "no",
    do_define: "no",
    do_build: "no",
    do_feedback: "no",
    needs_wait: "no",
    wait_until: "",
    reason: `Workspace preparation failed: ${err.message.slice(0, 500)}`,
  });
}
