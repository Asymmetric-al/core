#!/usr/bin/env node
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { EXPECTED_PROJECTS } from "../verify/vercel-build-controls.mjs";

const TEAM = "team_YrLB8jJARcRH0jnF1HPpPGTB";
const REPOSITORY_ID = "1132484374";
const WAIT_MS = 12 * 60 * 1000;
const STATES = new Set([
  "QUEUED",
  "INITIALIZING",
  "BUILDING",
  "READY",
  "ERROR",
  "CANCELED",
]);
const TERMINAL = new Set(["READY", "ERROR", "CANCELED"]);

export async function deployHostedPreview({
  app,
  env = process.env,
  request = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  now = Date.now,
}) {
  const project = EXPECTED_PROJECTS.find((item) => item.key === app);
  const branch = env.CORE_PREVIEW_GIT_BRANCH;
  const sha = env.CORE_PREVIEW_GIT_SHA;
  if (
    !project ||
    env.GITHUB_ACTIONS !== "true" ||
    env.GITHUB_REPOSITORY !== "Asymmetric-al/core" ||
    env.VERCEL_PROJECT_ID !== project.projectId ||
    env.VERCEL_ORG_ID !== TEAM ||
    !env.VERCEL_TOKEN ||
    typeof branch !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/.test(branch) ||
    branch === "HEAD" ||
    branch.includes("..") ||
    branch.includes("//") ||
    /[/.]$|\.lock$/.test(branch) ||
    !/^[a-f0-9]{40}$/.test(sha ?? "")
  ) {
    throw new Error(
      "Hosted preview requires the approved Actions repository, app, team, PR branch and exact SHA",
    );
  }
  async function call(path, method = "GET", body) {
    let response;
    try {
      response = await request(`https://api.vercel.com${path}`, {
        method,
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
        headers: {
          Authorization: `Bearer ${env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      throw new Error(
        "Hosted preview API transport failed; provider details withheld",
      );
    }
    if (!response.ok) {
      const status =
        Number.isInteger(response.status) &&
        response.status >= 100 &&
        response.status <= 599
          ? response.status
          : "unknown";
      throw new Error(
        `Hosted preview API failed (HTTP ${status}); provider details withheld`,
      );
    }
    return response;
  }
  async function json(response) {
    try {
      return await response.json();
    } catch {
      throw new Error("Hosted preview API returned invalid JSON");
    }
  }
  function assertIdentity(deployment, id) {
    const source = deployment?.gitSource;
    if (
      deployment?.id !== id ||
      deployment?.projectId !== project.projectId ||
      deployment?.target !== null ||
      source?.type !== "github" ||
      String(source?.repoId) !== REPOSITORY_ID ||
      source?.sha !== sha ||
      source?.ref !== branch ||
      !STATES.has(deployment?.readyState)
    ) {
      throw new Error(
        "Hosted preview identity or state did not match the approved project, branch, SHA and preview target",
      );
    }
  }
  const created = await json(
    await call(`/v13/deployments?teamId=${TEAM}&forceNew=1`, "POST", {
      name: app,
      project: project.projectId,
      gitSource: { type: "github", repoId: REPOSITORY_ID, ref: branch, sha },
      gitMetadata: {
        commitRef: branch,
        commitSha: sha,
        remoteUrl: "https://github.com/Asymmetric-al/core",
      },
      // Omitted target means Preview. Confirm null target in the provider readback.
      // Only admin needs the larger machine qualified by its observed 8 GiB OOM.
      ...(app === "admin" ? { buildMachine: "turbo" } : {}),
    }),
  );
  const id = created?.id;
  if (typeof id !== "string" || !/^dpl_[A-Za-z0-9]+$/.test(id))
    throw new Error(
      "Hosted preview creation did not return a valid deployment identity",
    );
  const deadline = now() + WAIT_MS;
  const readPath = `/v13/deployments/${id}?teamId=${TEAM}&withGitRepoInfo=true`;
  let owned = false;
  let state;
  try {
    if (created.gitSource) {
      assertIdentity(created, id);
      owned = true;
      state = created.readyState;
    }
    while (true) {
      const deployment = await json(await call(readPath));
      assertIdentity(deployment, id);
      owned = true;
      state = deployment.readyState;
      if (state === "READY") {
        const host = deployment.url;
        if (
          typeof host !== "string" ||
          !/^[A-Za-z0-9-]+\.vercel\.app$/.test(host)
        )
          throw new Error(
            "Hosted preview did not return a plain Vercel deployment URL",
          );
        return `https://${host}`;
      }
      if (TERMINAL.has(state))
        throw new Error(
          `Hosted preview ended in ${state}; provider details withheld`,
        );
      if (now() >= deadline) throw new Error("Hosted preview build timed out");
      await sleep(5_000);
    }
  } finally {
    if (!owned) {
      try {
        const recovered = await json(await call(readPath));
        assertIdentity(recovered, id);
        owned = true;
        state = recovered.readyState;
      } catch {
        throw new Error(
          "Hosted preview ownership recovery failed; cleanup unconfirmed",
        );
      }
    }
    if (owned && !TERMINAL.has(state)) {
      try {
        await call(`/v12/deployments/${id}/cancel?teamId=${TEAM}`, "PATCH");
      } catch {
        // Cancellation may race completion. Only exact owned terminal readback confirms cleanup.
        const last = await json(await call(readPath));
        assertIdentity(last, id);
        if (!TERMINAL.has(last.readyState))
          throw new Error("Hosted preview cleanup is unconfirmed");
      }
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const url = await deployHostedPreview({ app: process.argv[2] });
    if (process.env.GITHUB_OUTPUT)
      appendFileSync(process.env.GITHUB_OUTPUT, `url=${url}\n`);
    console.log(
      "Hosted preview READY at the approved PR SHA; application Secrets stayed with the provider.",
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
