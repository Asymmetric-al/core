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
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { APPS, resolveBuildDecision } from "../vercel/should-ignore-build.mjs";
import { EXPECTED_PROJECTS } from "../verify/vercel-build-controls.mjs";

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

export class ReleaseStop extends Error {}
const stop = (message) => {
  throw new ReleaseStop(message);
};

export function projectFor(app) {
  const project = EXPECTED_PROJECTS.find((item) => item.key === app);
  if (!project || !Object.hasOwn(PRODUCTION_HOSTS, app)) {
    stop(`Unknown app ${app}.`);
  }
  return project;
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

/**
 * Apps whose files changed since the commit each app is serving. An app whose
 * live commit is unknown, or not an ancestor of this release, is built.
 * When `buildAll` is true, every app is built regardless of its live commit.
 */
export function selectReleaseApps({
  liveCommits,
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
    let changedFiles;
    try {
      changedFiles = listChangedFiles(live);
    } catch {
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
  request = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  attempts = 6,
}) {
  let last = "no response";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;
    let body;
    try {
      response = await request(new URL(MIGRATION_HEALTH_PATH, url), {
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
        headers: bypassSecret
          ? { "x-vercel-protection-bypass": bypassSecret }
          : {},
      });
      body = await response.json();
    } catch {
      last = "the health route could not be reached";
      if (attempt < attempts) await sleep(5_000);
      continue;
    }
    const status = body?.status;
    const seenId = body?.release?.deploymentId ?? null;
    // When verifying a specific deployment, an answer from another deployment
    // (e.g. the previous one during alias propagation) keeps retrying instead
    // of attributing the old deployment's status or project ref to the new one.
    if (deploymentId && body?.release && seenId !== deploymentId) {
      last = `expected deployment ${deploymentId}, saw ${seenId ?? "unknown"}`;
      if (attempt < attempts) await sleep(5_000);
      continue;
    }
    if (status === "behind") {
      stop(
        `The database is behind this build (${JSON.stringify(body.migrations)}); not promoted.`,
      );
    }
    if (response.status === 200 && status === "ok") {
      // The route gives its detail only to the bypass header (A6f).
      if (!body?.release) {
        stop(
          "The migration health route answered without its detail: it did not accept the deployment-protection bypass header; not promoted.",
        );
      }
      if (sha && body?.release?.commit !== sha) {
        stop("The deployment reports a different commit; not promoted.");
      }
      if (projectRef && body?.database?.supabaseProjectRef !== projectRef) {
        stop(
          `The deployment reads Supabase project ${body?.database?.supabaseProjectRef ?? "unknown"}, not ${projectRef}; not promoted.`,
        );
      }
      return body;
    }
    last = `HTTP ${response.status}, status ${status ?? "unknown"}${body?.error?.code ? ` (${body.error.code})` : ""}`;
    if (attempt < attempts) await sleep(5_000);
  }
  stop(`The migration health check did not pass: ${last}; not promoted.`);
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
export async function readLiveCommit({ app, request = fetch }) {
  try {
    const response = await request(
      `https://${PRODUCTION_HOSTS[app]}/api/health`,
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
  request = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  attempts = 18,
}) {
  if (!/^dpl_[A-Za-z0-9]+$/.test(deploymentId ?? "")) {
    stop("The deployment to verify has no valid identity.");
  }
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await checkDeploymentHealth({
        url: `https://${PRODUCTION_HOSTS[app]}`,
        bypassSecret,
        sha,
        projectRef,
        deploymentId,
        request,
        sleep,
        attempts: 1,
      });
    } catch (error) {
      if (attempt === attempts) throw error;
      if (
        /behind|different commit|different Supabase|reads Supabase|without its detail/.test(
          error.message,
        )
      ) {
        throw error;
      }
      await sleep(10_000);
    }
  }
}

/**
 * The whole deployment phase: stage every app the release builds, check every
 * staged deployment, and only then promote them and confirm each production
 * domain. A failed build or health check promotes nothing. Promotion itself
 * is one API call per app, one after the other, so it is not all or nothing:
 * if a later promotion fails, the apps serve different commits until the
 * recovery in docs/ops/release-job.md ("If a promotion fails part way").
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
  if (!PROJECT_REF.test(projectRef ?? "")) {
    stop("RELEASE_SUPABASE_PROJECT_REF is not a valid Supabase project ref.");
  }
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
      request,
      sleep,
    });
    log(`${deployment.app}: migration health check passed.`);
  }
  for (const deployment of staged) {
    await promoteDeployment({
      call,
      app: deployment.app,
      deploymentId: deployment.id,
    });
    log(`${deployment.app}: promoted ${deployment.id} without a rebuild.`);
  }
  for (const deployment of staged) {
    await verifyLive({
      app: deployment.app,
      sha,
      projectRef,
      deploymentId: deployment.id,
      bypassSecret: env[BYPASS_SECRETS[deployment.app]],
      request,
      sleep,
    });
    log(
      `${deployment.app}: the production domain serves ${deployment.id} for this release.`,
    );
  }
  return staged;
}

/**
 * Registers the job functions with Inngest once Git deployment is off
 * (council reservation 7): the serve route syncs on PUT.
 */
export async function registerJobFunctions({ request = fetch }) {
  let response;
  try {
    response = await request(`https://${PRODUCTION_HOSTS.admin}/api/inngest`, {
      method: "PUT",
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
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
  { request = fetch, listChangedFiles } = {},
) {
  const [step, ...rest] = argv;
  if (!STEPS.includes(step))
    stop(`Usage: vercel-release.mjs ${STEPS.join("|")}`);
  const app = option(rest, "--app");
  if (step === "plan") {
    const mode = readAppsMode(env);
    const sha = releaseSha(env);
    const buildAll = mode === "all";
    const liveCommits = {};
    if (!buildAll) {
      for (const name of Object.keys(APPS)) {
        liveCommits[name] = await readLiveCommit({ app: name, request });
      }
    }
    const plan = selectReleaseApps({
      liveCommits,
      buildAll,
      listChangedFiles:
        listChangedFiles ??
        ((live) => {
          execFileSync("git", ["merge-base", "--is-ancestor", live, sha], {
            stdio: "ignore",
          });
          return execFileSync("git", ["diff", "--name-only", live, sha], {
            encoding: "utf8",
          })
            .split("\n")
            .filter(Boolean);
        }),
    });
    for (const item of plan) {
      log(`${item.app}: ${item.build ? "build" : "skip"} - ${item.reason}`);
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
    await registerJobFunctions({});
    log("Job functions registered with the admin app's serve route.");
    return;
  }
  if (step === "check") {
    const url = option(rest, "--url");
    if (!url || !app) stop("check needs --app and --url.");
    projectFor(app);
    const body = await checkDeploymentHealth({
      url,
      bypassSecret: env[BYPASS_SECRETS[app]],
      sha: env.RELEASE_SHA?.trim() || undefined,
      projectRef: env.RELEASE_SUPABASE_PROJECT_REF,
    });
    log(
      `${app}: migration health ok on ${body.database.supabaseProjectRef} (${body.database.environment}).`,
    );
    return;
  }
  const call = createVercelClient({ token: env.VERCEL_TOKEN });
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
