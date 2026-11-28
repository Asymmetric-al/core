#!/usr/bin/env node
// The deployment half of the release job (plan 7.4; WP1). Production
// deployment moves from Vercel's Git integration into this job: it stages a
// production-target deployment of each affected app without assigning the
// production domains, checks each staged deployment's /api/health/migrations
// against the heads the database recorded, and only then promotes every staged
// deployment, without a rebuild. The build runs on Vercel, so application
// secrets stay with Vercel.
//
//   node scripts/release/vercel-release.mjs <step> [--app <app>] ...
//
// Steps: plan, preflight, deploy, check (the preview workflow's), register-jobs.
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { APPS, resolveBuildDecision } from "../vercel/should-ignore-build.mjs";
import { EXPECTED_PROJECTS } from "../verify/vercel-build-controls.mjs";
import {
  deploymentPathPrefix,
  resolveServeUnderPaths,
} from "./serve-under-paths.mjs";

export const TEAM = "team_YrLB8jJARcRH0jnF1HPpPGTB";
export const REPOSITORY_ID = "1132484374";
export const REPOSITORY = "Asymmetric-al/core";
export const PRODUCTION_BRANCH = "production";
export const PRODUCTION_HOSTS = Object.freeze({
  admin: "admin.asymmetric.al",
  donor: "donor.asymmetric.al",
  missionary: "missionary.asymmetric.al",
});
export const BYPASS_SECRETS = Object.freeze({
  admin: "VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET",
  donor: "VERCEL_DONOR_AUTOMATION_BYPASS_SECRET",
  missionary: "VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET",
});
export const MIGRATION_HEALTH_PATH = "/api/health/migrations";

const STATES = new Set([
  "QUEUED",
  "INITIALIZING",
  "BUILDING",
  "READY",
  "ERROR",
  "CANCELED",
]);
const TERMINAL = new Set(["READY", "ERROR", "CANCELED"]);
const SHA = /^[a-f0-9]{40}$/;
const PROJECT_REF = /^[a-z0-9]{20}$/;

export class ReleaseStop extends Error {
  constructor(message, options) {
    super(message);
    this.fatal = options?.fatal ?? false;
    this.seenId = options?.seenId ?? null;
    this.providerRejected = options?.providerRejected ?? false;
  }
}
const stop = (message, options) => {
  throw new ReleaseStop(message, options);
};

export function projectFor(app) {
  const project = EXPECTED_PROJECTS.find((item) => item.key === app);
  if (!project || !Object.hasOwn(PRODUCTION_HOSTS, app)) {
    stop(`Unknown app ${app}.`);
  }
  return project;
}

function productionPathPrefixes(apps, env) {
  return Object.fromEntries(
    apps.map((app) => {
      projectFor(app);
      return [
        app,
        deploymentPathPrefix(app, { ...env, VERCEL_TARGET_ENV: "production" }),
      ];
    }),
  );
}

/** A Vercel API caller that never repeats a provider body or the token. */
export function createVercelClient({ token, request = fetch }) {
  if (!token) stop("VERCEL_TOKEN is not set.");
  return async function call(pathname, method = "GET", body) {
    let response;
    try {
      response = await request(`https://api.vercel.com${pathname}`, {
        method,
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      stop("Vercel API transport failed; provider details withheld.");
    }
    if (!response.ok) {
      const status = Number.isInteger(response.status)
        ? response.status
        : "unknown";
      stop(
        `Vercel API ${method} failed (HTTP ${status}); provider details withheld.`,
        { providerRejected: true },
      );
    }
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch {
      stop("Vercel API returned invalid JSON.");
    }
  };
}

/**
 * Staging needs the project to leave production domains unassigned until
 * promotion. Refuse to deploy otherwise, rather than assign domains before
 * the health check.
 */
export async function assertStagingEnabled({ call, app }) {
  const project = projectFor(app);
  const settings = await call(
    `/v9/projects/${project.projectId}?teamId=${TEAM}`,
  );
  if (settings?.id !== project.projectId) {
    stop(`Vercel returned a different project for ${app}.`);
  }
  if (settings?.autoAssignCustomDomains !== false) {
    stop(
      `${app}: production domains are assigned automatically, so a deployment would go live before its health check. Turn off auto-assignment (docs/ops/release-job.md, step 3).`,
    );
  }
  if (settings?.link?.productionBranch !== PRODUCTION_BRANCH) {
    stop(`${app}: the Vercel production branch is not ${PRODUCTION_BRANCH}.`);
  }
}

const APPS_MODES = new Set(["changed", "all"]);

class AncestryCheckError extends Error {}
class DiffReadError extends Error {}

function isGitAncestor(live, sha) {
  const result = spawnSync("git", ["merge-base", "--is-ancestor", live, sha], {
    stdio: "ignore",
  });
  if (result.error) {
    throw new AncestryCheckError(
      `could not determine ancestry: ${result.error.message}`,
    );
  }
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new AncestryCheckError(
    `could not determine ancestry: ${result.signal ? `signal ${result.signal}` : `exit ${result.status ?? "unknown"}`}`,
  );
}

function listGitChangedFiles(live, sha) {
  const result = spawnSync(
    "git",
    ["diff", "--name-only", "-z", "--no-renames", live, sha, "--"],
    { encoding: "utf8", maxBuffer: Infinity },
  );
  if (result.error || result.status !== 0) {
    const detail =
      result.error?.message ||
      result.stderr?.trim() ||
      `exit ${result.status ?? "unknown"}`;
    throw new DiffReadError(`could not read git diff: ${detail}`);
  }
  return (result.stdout ?? "").split("\0").filter(Boolean);
}

/**
 * Apps whose files changed since the commit each app is serving. An app whose
 * live commit is unknown, not an ancestor of this release, or whose git diff
 * cannot be read, is built. When `buildAll` is true, every app is built
 * regardless of its live commit.
 */
export function selectReleaseApps({
  liveCommits,
  isAncestor,
  listChangedFiles,
  buildAll = false,
}) {
  if (buildAll) {
    return Object.keys(APPS).map((app) => ({
      app,
      build: true,
      reason: "release input requested all apps",
    }));
  }
  return Object.keys(APPS).map((app) => {
    const live = liveCommits[app];
    if (!SHA.test(live ?? "")) {
      return { app, build: true, reason: "live commit unknown" };
    }
    if (isAncestor) {
      let ancestor;
      try {
        ancestor = Boolean(isAncestor(live));
      } catch {
        return { app, build: true, reason: "could not determine ancestry" };
      }
      if (!ancestor) {
        return { app, build: true, reason: "live commit is not an ancestor" };
      }
    }
    let changedFiles;
    try {
      changedFiles = listChangedFiles(live);
    } catch (error) {
      if (isAncestor || error instanceof DiffReadError) {
        return {
          app,
          build: true,
          reason: "could not read git diff from live commit",
        };
      }
      return { app, build: true, reason: "live commit is not an ancestor" };
    }
    if (changedFiles.length === 0) {
      return { app, build: false, reason: "already serving this commit" };
    }
    const decision = resolveBuildDecision({ app, changedFiles });
    return { app, build: decision.build, reason: decision.reason };
  });
}

function assertDeployment(deployment, { id, project, sha, target }) {
  const source = deployment?.gitSource;
  if (
    deployment?.id !== id ||
    deployment?.projectId !== project.projectId ||
    deployment?.target !== target ||
    source?.type !== "github" ||
    String(source?.repoId) !== REPOSITORY_ID ||
    source?.sha !== sha ||
    source?.ref !== PRODUCTION_BRANCH ||
    !STATES.has(deployment?.readyState)
  ) {
    stop(
      "The deployment's identity or state did not match the approved project, production branch, SHA and target.",
    );
  }
}

/** A production-target build of `sha` that Vercel stages, not serves. */
export async function stageDeployment({
  call,
  app,
  sha,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now = Date.now,
  waitMs = 20 * 60 * 1000,
}) {
  const project = projectFor(app);
  if (!SHA.test(sha ?? "")) stop("The release SHA is not a full commit SHA.");
  const created = await call(
    `/v13/deployments?teamId=${TEAM}&forceNew=1`,
    "POST",
    {
      name: app,
      project: project.projectId,
      target: "production",
      gitSource: {
        type: "github",
        repoId: REPOSITORY_ID,
        ref: PRODUCTION_BRANCH,
        sha,
      },
      // The job chose to build this app; the ignored-build step honours it.
      build: { env: { CORE_RELEASE_FORCE_BUILD_SHA: sha } },
      gitMetadata: {
        commitRef: PRODUCTION_BRANCH,
        commitSha: sha,
        remoteUrl: `https://github.com/${REPOSITORY}`,
      },
      ...(app === "admin" ? { buildMachine: "turbo" } : {}),
    },
  );
  const id = created?.id;
  if (typeof id !== "string" || !/^dpl_[A-Za-z0-9]+$/.test(id)) {
    stop("Vercel returned no valid deployment identity.");
  }
  const read = `/v13/deployments/${id}?teamId=${TEAM}&withGitRepoInfo=true`;
  const deadline = now() + waitMs;
  let state = created.readyState;
  try {
    while (true) {
      const deployment = await call(read);
      assertDeployment(deployment, {
        id,
        project,
        sha,
        target: "production",
      });
      state = deployment.readyState;
      if (state === "READY") {
        if (!/^[A-Za-z0-9-]+\.vercel\.app$/.test(deployment.url ?? "")) {
          stop("The staged deployment has no plain Vercel URL.");
        }
        return { app, id, url: `https://${deployment.url}` };
      }
      if (TERMINAL.has(state)) {
        stop(`${app}: the staged build ended ${state}; nothing was promoted.`);
      }
      if (now() >= deadline) stop(`${app}: the staged build timed out.`);
      await sleep(10_000);
    }
  } finally {
    if (!TERMINAL.has(state)) {
      try {
        await call(`/v12/deployments/${id}/cancel?teamId=${TEAM}`, "PATCH");
      } catch {
        // The cancellation may race completion; the deployment stays unpromoted.
      }
    }
  }
}

/**
 * The health gate: the deployment must answer 200 from its migration health
 * route, built from this commit, on the expected Supabase project. A database
 * behind the build answers 503 and stops the release.
 */
export async function checkDeploymentHealth({
  url,
  bypassSecret,
  sha,
  projectRef,
  deploymentId,
  phase = "staged",
  pathPrefix = "",
  serveUnderPaths = false,
  request = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  attempts = 6,
}) {
  const isLive = phase === "live";
  const suffix = isLive ? "." : "; not promoted.";
  let last = "no response";
  let lastSeenId = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;
    let body;
    try {
      response = await request(
        new URL(`${pathPrefix}${MIGRATION_HEALTH_PATH}`, url),
        {
          redirect: "error",
          cache: "no-store",
          signal: AbortSignal.timeout(30_000),
          headers: bypassSecret
            ? { "x-vercel-protection-bypass": bypassSecret }
            : {},
        },
      );
      body = await response.json();
    } catch {
      last = "the health route could not be reached";
      if (attempt < attempts) await sleep(5_000);
      continue;
    }
    const status = body?.status;
    const seenId = body?.release?.deploymentId ?? null;
    if (seenId) lastSeenId = seenId;

    // On a production domain after promotion, an answer that does not identify
    // itself (e.g. an older deployment rejecting a rotated bypass secret and
    // answering status-only) or identifies another deployment is never accepted
    // and never final: keep retrying within the attempt bound.
    if (deploymentId && isLive) {
      if (!body?.release || !seenId) {
        last = `expected deployment ${deploymentId}, saw none identified (HTTP ${response.status}, status ${status ?? "unknown"})`;
        if (attempt < attempts) await sleep(5_000);
        continue;
      }
      if (seenId !== deploymentId) {
        last = `expected deployment ${deploymentId}, saw ${seenId}`;
        if (attempt < attempts) await sleep(5_000);
        continue;
      }
    } else if (deploymentId && body?.release && seenId !== deploymentId) {
      last = `expected deployment ${deploymentId}, saw ${seenId ?? "unknown"}`;
      if (attempt < attempts) await sleep(5_000);
      continue;
    }

    // Compare a supplied Supabase project ref as soon as the target deployment
    // is confirmed (whatever its HTTP status); answers without a ref keep
    // retrying.
    const reportedRef = body?.database?.supabaseProjectRef;
    if (projectRef && reportedRef && reportedRef !== projectRef) {
      stop(
        `The deployment reads Supabase project ${reportedRef}, not ${projectRef}${suffix}`,
        { fatal: true, seenId },
      );
    }

    if (status === "behind") {
      stop(
        `The database is behind this build (${JSON.stringify(body.migrations)})${suffix}`,
        { fatal: true, seenId },
      );
    }
    if (response.status === 200 && status === "ok") {
      // The route gives its detail only to the bypass header (A6f).
      if (!body?.release) {
        stop(
          `The migration health route answered without its detail: it did not accept the deployment-protection bypass header${suffix}`,
          { fatal: true },
        );
      }
      if (sha && body?.release?.commit !== sha) {
        stop(`The deployment reports a different commit${suffix}`, {
          fatal: true,
          seenId,
        });
      }
      if (projectRef && reportedRef !== projectRef) {
        stop(
          `The deployment reads Supabase project ${reportedRef ?? "unknown"}, not ${projectRef}${suffix}`,
          { fatal: true, seenId },
        );
      }
      if (body.release.serveUnderPaths !== serveUnderPaths) {
        stop(
          `The deployment did not report the release's serveUnderPaths=${serveUnderPaths}${suffix}`,
          { fatal: true, seenId },
        );
      }
      return body;
    }
    last = `HTTP ${response.status}, status ${status ?? "unknown"}${body?.error?.code ? ` (${body.error.code})` : ""}`;
    if (attempt < attempts) await sleep(5_000);
  }
  stop(
    isLive
      ? `${last}.`
      : `The migration health check did not pass: ${last}; not promoted.`,
    { fatal: false, seenId: lastSeenId },
  );
}

/** Points production traffic at a staged deployment. Vercel does not rebuild. */
export async function promoteDeployment({ call, app, deploymentId }) {
  const project = projectFor(app);
  if (!/^dpl_[A-Za-z0-9]+$/.test(deploymentId ?? "")) {
    stop("The deployment to promote has no valid identity.");
  }
  await call(
    `/v10/projects/${project.projectId}/promote/${deploymentId}?teamId=${TEAM}`,
    "POST",
  );
}

/** Reads the commit an app's production domain serves, from /api/health. */
export async function readLiveCommit({
  app,
  request = fetch,
  pathPrefix = "",
}) {
  try {
    const response = await request(
      `https://${PRODUCTION_HOSTS[app]}${pathPrefix}/api/health`,
      {
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );
    const body = await response.json();
    const commit = body?.observability?.release?.commit;
    return SHA.test(commit ?? "") ? commit : null;
  } catch {
    return null;
  }
}

export async function readLiveRelease({
  app,
  request = fetch,
  pathPrefix = "",
  bypassSecret = undefined,
}) {
  try {
    const response = await request(
      `https://${PRODUCTION_HOSTS[app]}${pathPrefix}${MIGRATION_HEALTH_PATH}`,
      {
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
        headers: bypassSecret
          ? { "x-vercel-protection-bypass": bypassSecret }
          : {},
      },
    );
    if (response.status !== 200) return null;
    const body = await response.json();
    if (
      body?.status !== "ok" ||
      !body.release ||
      typeof body.release !== "object"
    )
      return null;
    const { commit, deploymentId, serveUnderPaths } = body.release;
    if (serveUnderPaths !== undefined && typeof serveUnderPaths !== "boolean")
      return null;
    return {
      commit: SHA.test(commit ?? "") ? commit : null,
      deploymentId: /^dpl_[A-Za-z0-9]+$/.test(deploymentId ?? "")
        ? deploymentId
        : null,
      serveUnderPaths,
    };
  } catch {
    return null;
  }
}

/**
 * After promotion: each promoted app's production domain serves this commit
 * and passes its migration health check. The route gives the commit and the
 * project only to the bypass header, so it is sent here too.
 */
export async function verifyLive({
  app,
  sha,
  projectRef,
  deploymentId,
  bypassSecret,
  pathPrefix = "",
  serveUnderPaths = false,
  request = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  attempts = 18,
}) {
  if (!/^dpl_[A-Za-z0-9]+$/.test(deploymentId ?? "")) {
    stop("The deployment to verify has no valid identity.");
  }
  const domain = PRODUCTION_HOSTS[app];
  let lastSeenId = null;
  let sawAnyIdentified = false;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await checkDeploymentHealth({
        url: `https://${domain}`,
        bypassSecret,
        sha,
        projectRef,
        deploymentId,
        phase: "live",
        serveUnderPaths,
        pathPrefix,
        request,
        sleep,
        attempts: 1,
      });
    } catch (error) {
      if (error instanceof ReleaseStop && error.seenId) {
        lastSeenId = error.seenId;
        sawAnyIdentified = true;
      }
      const fatal = error instanceof ReleaseStop && error.fatal;
      if (fatal || attempt === attempts) {
        const seen = lastSeenId ?? "none identified";
        const detail = sawAnyIdentified
          ? error.message
          : `never saw an identified answer (${error.message.replace(/\.$/, "")}).`;
        stop(
          `${app} (${domain}): promotion of ${deploymentId} was requested and could not be verified (expected ${deploymentId}, last seen ${seen}): ${detail} Check what ${domain} serves before dispatching again or rolling back.`,
          { fatal: true, seenId: lastSeenId },
        );
      }
      await sleep(10_000);
    }
  }
}

/**
 * Check every staged deployment's built state before promoting any. The donor
 * goes first when enabling paths and last when disabling them. Each promoted
 * app must be seen live in the release's state before the next is promoted; a
 * failed call or a failed live check stops promotion, with no retry and no
 * rollback. Dispatching anew reconciles all projects whose live states
 * disagree with the release.
 */
export async function deployRelease({
  apps,
  sha,
  projectRef,
  env,
  call,
  request = fetch,
  sleep,
  log = console.log,
}) {
  const pathPrefixes = productionPathPrefixes(
    apps.length > 0 ? apps : Object.keys(APPS),
    env,
  );
  if (!PROJECT_REF.test(projectRef ?? "")) {
    stop("RELEASE_SUPABASE_PROJECT_REF is not a valid Supabase project ref.");
  }
  const serveUnderPaths = resolveServeUnderPaths(env);
  const staged = [];
  for (const app of apps) {
    await assertStagingEnabled({ call, app });
    staged.push(await stageDeployment({ call, app, sha, sleep }));
    log(`${app}: staged ${staged.at(-1).id}.`);
  }
  for (const deployment of staged) {
    await checkDeploymentHealth({
      url: deployment.url,
      bypassSecret: env[BYPASS_SECRETS[deployment.app]],
      sha,
      projectRef,
      deploymentId: deployment.id,
      pathPrefix: pathPrefixes[deployment.app],
      serveUnderPaths,
      request,
      sleep,
    });
    log(`${deployment.app}: migration health check passed.`);
  }
  const order = serveUnderPaths
    ? ["donor", "admin", "missionary"]
    : ["admin", "missionary", "donor"];
  const promotions = order.flatMap((app) =>
    staged.filter((deployment) => deployment.app === app),
  );
  const stopPartWay = (index, outcome) => {
    const report = [
      ...promotions
        .slice(0, index)
        .map(({ app, id }) => `${app}: promoted ${id}`),
      `${promotions[index].app}: ${outcome}`,
      ...promotions.slice(index + 1).map(({ app }) => `${app}: not attempted`),
    ];
    stop(
      `promotion stopped part way: ${report.join("; ")}. Dispatch Release anew from production, operation release, the same apps value; plan builds all three if their switch states differ. Do not roll back. See docs/ops/release-job.md, If a promotion fails part way.`,
    );
  };
  for (const [index, deployment] of promotions.entries()) {
    try {
      await promoteDeployment({
        call,
        app: deployment.app,
        deploymentId: deployment.id,
      });
    } catch (error) {
      stopPartWay(
        index,
        error instanceof ReleaseStop && error.providerRejected
          ? "not promoted"
          : "outcome unknown",
      );
    }
    log(`${deployment.app}: promoted ${deployment.id} without a rebuild.`);
    try {
      await verifyLive({
        app: deployment.app,
        sha,
        projectRef,
        deploymentId: deployment.id,
        bypassSecret: env[BYPASS_SECRETS[deployment.app]],
        pathPrefix: pathPrefixes[deployment.app],
        serveUnderPaths,
        request,
        sleep,
      });
    } catch (error) {
      const seen =
        error instanceof ReleaseStop && error.seenId
          ? error.seenId
          : "none identified";
      stopPartWay(
        index,
        `promoted ${deployment.id}, not seen live (last seen ${seen})`,
      );
    }
    log(
      `${deployment.app}: the production domain serves ${deployment.id} for this release.`,
    );
  }
  return staged;
}

/**
 * Registers the job functions with Inngest once Git deployment is off
 * (council reservation 7): the serve route syncs on a PUT that carries the
 * admin deployment's automation-bypass secret as its proof.
 */
export async function registerJobFunctions({
  request = fetch,
  pathPrefix = "",
  bypassSecret,
}) {
  if (!bypassSecret) {
    stop(
      `The job-function registration needs ${BYPASS_SECRETS.admin}; nothing was sent.`,
    );
  }
  let response;
  try {
    response = await request(
      `https://${PRODUCTION_HOSTS.admin}${pathPrefix}/api/inngest`,
      {
        method: "PUT",
        headers: { "x-vercel-protection-bypass": bypassSecret },
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      },
    );
  } catch {
    stop("The job-function registration could not reach the admin app.");
  }
  if (!response.ok) {
    stop(`The job-function registration failed (HTTP ${response.status}).`);
  }
}

function option(argv, name) {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

function output(env, values) {
  if (!env.GITHUB_OUTPUT) return;
  appendFileSync(
    env.GITHUB_OUTPUT,
    Object.entries(values)
      .map(([key, value]) => `${key}=${value}\n`)
      .join(""),
  );
}

function releaseSha(env) {
  const sha = env.RELEASE_SHA?.trim();
  if (!SHA.test(sha ?? "")) stop("RELEASE_SHA is not a full commit SHA.");
  return sha;
}

function releaseProjectRef(env) {
  const ref = env.RELEASE_SUPABASE_PROJECT_REF?.trim();
  if (!PROJECT_REF.test(ref ?? "")) {
    stop("RELEASE_SUPABASE_PROJECT_REF is not a valid Supabase project ref.");
  }
  return ref;
}

function readAppsMode(env) {
  if (env.RELEASE_APPS_MODE === undefined) return "changed";
  const mode = env.RELEASE_APPS_MODE;
  if (!APPS_MODES.has(mode)) {
    stop(
      `RELEASE_APPS_MODE must be "changed" or "all" (got ${JSON.stringify(mode)}).`,
    );
  }
  return mode;
}

const STEPS = ["plan", "preflight", "deploy", "check", "register-jobs"];

export async function runCli(
  argv,
  env = process.env,
  log = console.log,
  { request = fetch, sleep, isAncestor, listChangedFiles } = {},
) {
  const [step, ...rest] = argv;
  if (!STEPS.includes(step))
    stop(`Usage: vercel-release.mjs ${STEPS.join("|")}`);
  const app = option(rest, "--app");
  if (step === "plan") {
    const mode = readAppsMode(env);
    const sha = releaseSha(env);
    const serveUnderPaths = resolveServeUnderPaths(env);
    const pathPrefixes = productionPathPrefixes(Object.keys(APPS), env);
    const liveStates = {};
    const liveCommits = {};
    const credentialed = Object.values(BYPASS_SECRETS).some((key) => env[key]);
    for (const app of Object.keys(APPS)) {
      const options = { app, request, pathPrefix: pathPrefixes[app] };
      if (credentialed) {
        const bypassSecret = env[BYPASS_SECRETS[app]];
        const live = bypassSecret
          ? await readLiveRelease({ ...options, bypassSecret })
          : null;
        liveStates[app] = live;
        liveCommits[app] = live?.commit;
      } else if (!serveUnderPaths && mode !== "all") {
        liveCommits[app] = await readLiveCommit(options);
      }
    }
    const reconcile = serveUnderPaths
      ? Object.keys(APPS).some(
          (app) =>
            liveStates[app]?.serveUnderPaths !== true ||
            !liveStates[app]?.commit,
        )
      : Object.values(liveStates).some(
          (live) => live?.serveUnderPaths === true,
        );
    const useDefaultGit = !listChangedFiles;
    const plan = selectReleaseApps({
      liveCommits,
      buildAll: mode === "all" || reconcile,
      isAncestor:
        isAncestor ??
        (useDefaultGit ? (live) => isGitAncestor(live, sha) : undefined),
      listChangedFiles:
        listChangedFiles ?? ((live) => listGitChangedFiles(live, sha)),
    });
    for (const item of plan) {
      const live = liveStates[item.app];
      const state = live ? (live.serveUnderPaths ?? "absent") : "unreadable";
      const reason = reconcile
        ? "reconcile the three apps to the release switch state"
        : item.reason;
      const detail = credentialed
        ? ` [deploymentId=${live?.deploymentId ?? "unreported"} serveUnderPaths=${state}]`
        : "";
      log(`${item.app}: ${item.build ? "build" : "skip"} - ${reason}${detail}`);
    }
    output(env, {
      apps: plan
        .filter((item) => item.build)
        .map((item) => item.app)
        .join(","),
    });
    return;
  }
  if (step === "register-jobs") {
    const { admin: pathPrefix } = productionPathPrefixes(["admin"], env);
    await registerJobFunctions({
      request,
      pathPrefix,
      bypassSecret: env[BYPASS_SECRETS.admin],
    });
    log("Job functions registered with the admin app's serve route.");
    return;
  }
  if (step === "check") {
    const url = option(rest, "--url");
    if (!url || !app) stop("check needs --app and --url.");
    projectFor(app);
    const pathPrefix = deploymentPathPrefix(app, env);
    const body = await checkDeploymentHealth({
      url,
      bypassSecret: env[BYPASS_SECRETS[app]],
      sha: env.RELEASE_SHA?.trim() || undefined,
      projectRef: env.RELEASE_SUPABASE_PROJECT_REF,
      serveUnderPaths: resolveServeUnderPaths(env),
      pathPrefix,
      request,
      sleep,
    });
    log(
      `${app}: migration health ok on ${body.database.supabaseProjectRef} (${body.database.environment}).`,
    );
    return;
  }
  productionPathPrefixes(Object.keys(APPS), env);
  const call = createVercelClient({ token: env.VERCEL_TOKEN, request });
  if (env.VERCEL_ORG_ID && env.VERCEL_ORG_ID !== TEAM) {
    stop("VERCEL_ORG_ID is not the Core team.");
  }
  if (step === "preflight") {
    for (const name of Object.keys(APPS)) {
      await assertStagingEnabled({ call, app: name });
    }
    log("Every project stages production deployments until promotion.");
    return;
  }
  if (step === "deploy") {
    const projectRef = releaseProjectRef(env);
    const apps = (env.RELEASE_APPS ?? "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    for (const name of apps) projectFor(name);
    if (apps.length === 0) {
      log("No app changed since the commit it serves; nothing to deploy.");
      return;
    }
    await deployRelease({
      apps,
      sha: releaseSha(env),
      projectRef,
      env,
      call,
      request,
      sleep,
    });
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(`vercel-release: ${error.message}`);
    process.exitCode = 1;
  });
}
