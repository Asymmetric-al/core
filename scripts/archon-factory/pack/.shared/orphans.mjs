#!/usr/bin/env node
// Orphaned factory runs. The engine keeps a run's resource slot until the run
// is terminal and never declares a running run dead by its age. A run whose
// engine process died (service restart, VM reboot) therefore stays "running"
// for good: an orphaned selector blocks every later admission pass, and an
// orphaned round keeps its delivery slot.
//
// Abandoning is the engine's explicit statement that a run is dead. This does
// it only for a factory run whose recorded executing process is provably gone.
// The dead run's check containers are removed first: one of them may still be
// writing the issue workspace the next round reuses, so a run whose containers
// are not confirmed gone is left for the next pass. The intake sweep then
// settles the work item and starts its next round.
//
//   orphans.mjs reap
import { readFileSync } from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { removeLabeledContainers } from "./executor.mjs";

const FACTORY_WORKFLOWS = new Set([
  "core-select",
  "core-deliver",
  "core-answer",
  "core-analyze",
  "core-probe",
]);

// The command line of a process: null when no such process exists, undefined
// when that cannot be told.
export function processCommandLine(pid) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, "utf8").replaceAll("\0", " ");
  } catch (error) {
    return error?.code === "ENOENT" || error?.code === "ESRCH"
      ? null
      : undefined;
  }
}

// True only with proof: the run was executed on this host by a process that
// no longer exists, or whose id now belongs to something that is not an
// engine. Anything unknown counts as still owned.
export function ownerGone(owner, { hosts, cmdline }) {
  if (
    owner === null ||
    typeof owner !== "object" ||
    !hosts.includes(owner.host) ||
    !Number.isSafeInteger(owner.pid) ||
    owner.pid <= 0
  )
    return false;
  const line = cmdline(owner.pid);
  if (line === undefined) return false;
  return line === null || !/archon/i.test(line);
}

export function findOrphans(runs, probes) {
  return (Array.isArray(runs) ? runs : []).filter(
    (run) =>
      run?.status === "running" &&
      FACTORY_WORKFLOWS.has(run.workflow_name) &&
      ownerGone(run.metadata?.execution_owner, probes),
  );
}

export async function reapOrphans({
  port,
  fetchImpl = fetch,
  hosts = [os.hostname()],
  cmdline = processCommandLine,
  dockerExecutable,
  removeContainers = removeLabeledContainers,
}) {
  const base = `http://127.0.0.1:${port}/api/workflows/runs`;
  let runs;
  try {
    const response = await fetchImpl(`${base}?status=running&limit=100`);
    if (!response.ok) throw new Error(`engine answered ${response.status}`);
    runs = (await response.json()).runs;
  } catch (error) {
    return { ok: false, error: error.message, orphans: [] };
  }
  const orphans = [];
  for (const run of findOrphans(runs, { hosts, cmdline })) {
    let cleared = false;
    try {
      cleared =
        (
          await removeContainers({
            dockerExecutable,
            labels: { "core.archon.run": run.id },
          })
        ).ok === true;
    } catch {}
    let status = null;
    if (cleared)
      try {
        status = (
          await fetchImpl(`${base}/${run.id}/abandon`, { method: "POST" })
        ).status;
      } catch {}
    orphans.push({
      id: run.id,
      workflow: run.workflow_name,
      containers: cleared ? "cleared" : "unconfirmed",
      abandoned: status === 200,
      status,
    });
  }
  return { ok: true, orphans };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv[2] !== "reap") {
    console.error("usage: orphans.mjs reap");
    process.exitCode = 1;
  } else {
    const config = loadConfig();
    const result = await reapOrphans({
      port: config.archon.port,
      dockerExecutable: config.executor.docker,
      hosts: [
        ...new Set(
          [os.hostname(), process.env.ARCHON_TRIGGER_HOST].filter(Boolean),
        ),
      ],
    });
    console.log(JSON.stringify(result));
    // A failed pass is reported, not fatal: the admission pass still runs.
    process.exitCode = 0;
  }
}
