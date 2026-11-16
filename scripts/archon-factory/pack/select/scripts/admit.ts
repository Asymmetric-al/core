// Admit: validate Samson's choice against the recomputed frontier, preflight
// the owner's native profile, re-check intake and the authorized scope right
// before recording the durable assignment, and fire the first delivery round
// keyed by the assignment write's revision. The selector never holds the
// delivery run's lease.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { StateConflict, createArchon } from "../../.shared/archon.mjs";
import { factoryPaths, loadConfig } from "../../.shared/config.mjs";
import { evaluateEligibility } from "../../.shared/eligibility.ts";
import { createGitHub, githubToken } from "../../.shared/github.mjs";
import {
  NativeIdentityRefusal,
  readRunIdentity,
  verifyNativeIdentity,
} from "../../.shared/identity.mjs";
import { policyRevision } from "../../.shared/round.mjs";
import { validateSamsonSelection } from "../../.shared/selection.ts";
import { checkFactoryStorage } from "../../.shared/storage-policy.mjs";
import {
  createAssignment,
  freeLane,
  issueDocument,
} from "../../.shared/workitem.mjs";
import { fireRound } from "../../.shared/webhook.mjs";
import { observeAdmission } from "./admission-observations.mjs";
import { admissionCheck } from "./intake-logic.mjs";

const config = loadConfig();
const paths = factoryPaths(config);
const archon = createArchon();
const runId = process.env.WORKFLOW_ID!;
const ledger = JSON.parse(
  readFileSync(path.posix.join(paths.runs, runId, "eligibility.json"), "utf8"),
);
const rank = (() => {
  try {
    return JSON.parse(process.env.INPUTS_RANK ?? "null");
  } catch {
    return null;
  }
})();
const done = (
  admitted: string,
  reason: string,
  extra: Record<string, unknown> = {},
) => {
  writeFileSync(
    path.posix.join(paths.runs, runId, "admission.json"),
    JSON.stringify(
      { admitted, reason, ...extra, at: new Date().toISOString() },
      null,
      2,
    ),
  );
  process.stdout.write(JSON.stringify({ admitted, reason }) + "\n");
  process.exit(0);
};

let chosen: string;
let reason: unknown;
if (ledger.frontier.length === 1) {
  chosen = ledger.frontier[0];
  reason = {
    summary: "Only eligible issue in the authorized scope",
    sources: ["deterministic eligibility"],
  };
} else {
  const policy = {
    nowMs: Date.now(),
    agingIntervalMs: config.limits?.agingIntervalMs ?? 86_400_000,
    maxAgingBonus: config.limits?.maxAgingBonus ?? 10,
  };
  const verdict = validateSamsonSelection(ledger.input, rank, policy);
  if (!verdict.ok)
    done("", `Samson's selection was rejected: ${verdict.code}`, { rank });
  // The trusted frontier's own id, not Samson's spelling of it.
  chosen = verdict.ok ? verdict.issueId : "";
  reason = rank.reason;
}
const issue = Number(chosen.slice(1));
const scope = (await archon.get("core/scope")).value;
if (!scope) done("", "No authorized scope");
const ownerAlias = scope.owner;
const release = policyRevision(paths);
let profileDigest: string;
try {
  const binding = readRunIdentity({ config, runId });
  if (binding.owner !== ownerAlias)
    throw new NativeIdentityRefusal("identity-owner-mismatch");
  const observed = await verifyNativeIdentity({
    config,
    owner: ownerAlias,
    expectedDigest: binding.profileDigest,
  });
  profileDigest = observed.profileDigest;
} catch (error) {
  if (error instanceof NativeIdentityRefusal)
    done("", `Native identity refused: ${error.code}`, { code: error.code });
  throw error;
}

// Ranking is historical evidence. Re-observe the selected issue and all of
// its admission dependencies before recording ownership.
let fresh;
let verdict;
try {
  const github = createGitHub({
    token: await githubToken({
      gh: config.github.executable,
      configDir: config.github.configDir,
    }),
    repo: config.repository.slug,
  });
  fresh = await observeAdmission({ github, archon, config });
  verdict = evaluateEligibility(fresh.input);
} catch {
  done("", "Fresh admission evidence is unavailable", {
    code: "admission-observations-unavailable",
  });
}
if (
  fresh.scopeRevision !== ledger.scopeRevision ||
  fresh.scopeDocumentRevision !== ledger.scopeDocumentRevision
)
  done("", "The authorized scope changed during admission", {
    code: "scope-changed",
  });
const selected = verdict.eligible.find((entry) => entry.id === chosen);
const previous = ledger.input?.items?.[chosen];
if (
  !Number.isSafeInteger(fresh.capacity) ||
  fresh.capacity <= 0 ||
  !selected ||
  previous?.status !== "found" ||
  typeof previous.value?.contextRevision !== "string" ||
  previous.value.contextRevision !== selected.contextRevision
)
  done(
    "",
    "The selected issue's admission evidence changed; the next pass re-evaluates it",
    { code: "admission-changed" },
  );

const assignmentId = `a${issue}-${runId.replace(/-/g, "").slice(0, 12)}`;
const name = issueDocument(issue);
// The factory, the scope and the issue's document as they are now: Samson's
// ranking may have taken minutes (installer-ops#0, installer-ops#4).
const [factoryNow, scopeNow, existing] = await Promise.all([
  archon.get("core/factory"),
  archon.get("core/scope"),
  archon.get(name),
]);
const check = admissionCheck({
  factory: factoryNow.value,
  scope: scopeNow,
  recorded: {
    scopeRevision: ledger.scopeRevision,
    scopeDocumentRevision: ledger.scopeDocumentRevision,
  },
  issue,
  existing: existing.value,
});
if (!check.ok) done("", check.reason, { code: check.code });
if (scopeNow.value.owner !== ownerAlias)
  done(
    "",
    "The scope owner changed during admission; the next pass re-evaluates it",
    { code: "scope-changed" },
  );
const value = createAssignment({
  issue,
  assignmentId,
  owner: ownerAlias,
  profileDigest,
  scopeRevision: ledger.scopeRevision,
  policyRevision: release.policyRevision,
  endState: check.endState,
  reason: JSON.stringify(reason).slice(0, 1200),
  by: `selector:${runId}`,
  now: new Date().toISOString(),
  lane: freeLane(
    (fresh.active ?? []).map((entry: any) => entry.value?.lane),
    config.limits?.admittedIssues ?? 2,
  ),
});
let receipt;
try {
  const storage = await checkFactoryStorage({
    config,
    operation: "admission",
    runId,
    artifacts: process.env.ARTIFACTS_DIR,
  });
  if (storage.ok !== true || storage.code !== "STORAGE_READY")
    done("", `Storage refused: ${storage.code}`, {
      code: storage.code,
      storage,
    });
  receipt = await archon.put(name, value, { ifRevision: existing.revision });
} catch (error) {
  if (error instanceof StateConflict)
    done("", `#${issue} changed concurrently; the next sweep re-evaluates it`);
  throw error;
}
const selection = await archon.get("core/selection");
const log = [
  ...(selection.value?.decisions ?? []),
  {
    at: new Date().toISOString(),
    run: runId,
    issue,
    assignment: assignmentId,
    frontier: ledger.frontier,
    reason,
  },
].slice(-20);
await archon
  .put(
    "core/selection",
    { v: 1, decisions: log },
    { ifRevision: selection.revision },
  )
  .catch(() => null);
const fired = await fireRound({
  config,
  value,
  revision: receipt.revision,
}).catch((error) => ({
  ok: false,
  outcome: "error",
  detail: String(error.message),
  deliveryId: null,
}));
if (!fired.ok)
  done(
    `#${issue}`,
    `Assignment recorded; first round not started (${fired.outcome}); the next sweep starts it`,
    { assignmentId, deliveryId: fired.deliveryId },
  );
done(`#${issue}`, `Admitted #${issue} as ${assignmentId}`, {
  assignmentId,
  reason,
});
