#!/usr/bin/env node
// Operator controls for the Core factory: the one seam the Console, the
// runbook and an operator's shell all use. Every mutation carries a request id,
// is a conditional write validated by workitem.mjs, and reports the observed
// state afterwards. Server-owned runs are cancelled through the server's API.
//
//   control.mjs status
//   control.mjs factory <pause-intake|resume-intake|drain|stop|resume|hold-merge|release-merge> --request <id> --by <who> [--reason <text>]
//   control.mjs issue <n> <hold|release|stop|retry|reopen|reconcile|adopt-policy|recover-native> --request <id> --by <who> [--reason <text>]
//   control.mjs scope --issues 12,13 --end-state PR_READY|MERGED --owner conrad --request <id> --by <who> [--note <text>]
//   control.mjs prioritize <n> <0-100> --request <id> --by <who>
//   control.mjs allow-protected <n> <all|none|glob[,glob...]> --request <id> --by <who>
//   control.mjs cancel-run <runId> --request <id> --by <who>
//   control.mjs ask --conversation <id> --request <id> --question <text>
//   control.mjs analyze --scope factory|issue:<n> --trigger operator --request <id>
//
// retry, reopen and release require the retained policy and native identity.
// reconcile settles an item left active by a run the engine reports ended
// (never while its lease is live), or re-arms an idle item's dispatch.
// allow-protected authorizes (or with none revokes) an in-scope issue's scope
// to reach protected repository paths: core/scope.allowProtected[<n>] is true
// or a list of protected globs, which after-scope's check reads.
// recover-native is the way out of a native-fault hold (a round that failed on
// a provider error keeps its issue until a person says the cause is dealt
// with). It reads back the issue's remote branch, proves the policy and the
// native identity, ends the failed run through the engine (its containers
// first, then the engine's abandon, as the orphan pass does) and only then
// clears the hold; the issue waits on the route the interrupted round calls
// for and the next pass starts it.
// cancel-run first holds the issue whose round the run is (a cancelled round
// is never requeued automatically), then removes the run's labelled executor
// containers; it is ok only once the run is terminal and none remain.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { StateConflict, createArchon } from "./archon.mjs";
import { factoryPaths, limits, loadConfig } from "./config.mjs";
import { removeLabeledContainers } from "./executor.mjs";
import { createGit, remoteHead } from "./git.mjs";
import { NativeIdentityRefusal, verifyNativeIdentity } from "./identity.mjs";
import { fireWebhook } from "./webhook.mjs";
import {
  Refusal,
  issueDocument,
  planControl,
  planFactoryControl,
} from "./workitem.mjs";
import { PROTECTED_GLOBS } from "../deliver/scripts/scope-logic.mjs";

const posix = path.posix;
const requestPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

export function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value.startsWith("--")) {
      flags[value.slice(2)] = argv[index + 1];
      index += 1;
    } else positional.push(value);
  }
  return { positional, flags };
}

async function conditional(archon, name, plan) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const document = await archon.get(name);
    let planned;
    try {
      planned = await plan(document);
    } catch (error) {
      if (error instanceof Refusal || error instanceof NativeIdentityRefusal)
        return { ok: false, code: error.code, message: error.message };
      throw error;
    }
    if (planned.noop) return { ok: true, noop: true, value: planned.value };
    try {
      const receipt = await archon.put(planned.name, planned.value, {
        ifRevision: planned.ifRevision,
      });
      return { ok: true, revision: receipt.revision, value: planned.value };
    } catch (error) {
      if (error instanceof StateConflict) continue;
      throw error;
    }
  }
  return {
    ok: false,
    code: "conflict",
    message: "The document kept changing; read it again and retry",
  };
}

// The installed release, or undefined when none is readable.
function installedRelease(paths) {
  try {
    return JSON.parse(
      readFileSync(
        posix.join(paths.control, ".archon", "core-factory-release.json"),
        "utf8",
      ),
    );
  } catch {
    return undefined;
  }
}

// The record of the release an assignment was bound under, kept by the
// installer beside that release's files. It is evidence for the identity
// proof, never trusted by itself.
function predecessorRelease(installed, policyRevision) {
  try {
    const record = JSON.parse(
      readFileSync(
        posix.join(
          posix.dirname(installed.release),
          policyRevision.slice(0, 16),
          "release.json",
        ),
        "utf8",
      ),
    );
    return record?.policyRevision === policyRevision ? record : undefined;
  } catch {
    return undefined;
  }
}

async function engineRun(fetchImpl, config, runId) {
  try {
    const response = await fetchImpl(
      `http://127.0.0.1:${config.archon.port}/api/workflows/runs/${runId}`,
    );
    const body = await response.json();
    const status = body?.run?.status;
    if (!response.ok || typeof status !== "string") return null;
    return { id: body.run.id ?? runId, status };
  } catch {
    return null;
  }
}

// Executor containers carry core.archon.run=<runId>. executor.mjs's shared
// reconcile force-removes every one of them and lists again; only that second
// listing proves none remain. `removed` (found, and gone from that listing) is
// what the Console reports. A reconcile that throws is reported, not raised.
async function removeRunContainers(removeContainers, config, runId) {
  let result;
  try {
    result = await removeContainers({
      dockerExecutable: config.executor.docker,
      labels: { "core.archon.run": runId },
    });
  } catch (error) {
    result = {
      ok: false,
      found: [],
      remaining: null,
      error: String(error?.message ?? error).slice(0, 600),
    };
  }
  const removed =
    Array.isArray(result?.found) && Array.isArray(result.remaining)
      ? result.found.filter((id) => !result.remaining.includes(id))
      : [];
  return { ...result, removed };
}

const ENDED_RUNS = new Set(["completed", "cancelled"]);
// Not executing, yet still the owner in the engine's eyes.
const RESUMABLE_RUNS = new Set(["failed", "paused"]);

// What a held run may have left on GitHub, read from GitHub and not from the
// run's own evidence. The issue branch's remote head must be a commit the work
// item recorded (its candidate or its published head) or absent, and a merge
// the factory requested must not be pending. Anything else needs a person.
export async function nativeEffects({ config, value, readRemoteHead }) {
  if (value?.pr?.mergeRequest?.status === "requested")
    return {
      ok: false,
      detail:
        "A merge the factory requested is unconfirmed; read the pull request and settle it first",
    };
  if (!value?.branch) return { ok: true, remoteHead: null };
  let head;
  try {
    head = await (
      readRemoteHead ??
      ((branch) =>
        remoteHead(
          {
            git: createGit({ executable: config.git.executable }),
            remote: config.repository.remote,
          },
          branch,
        ))
    )(value.branch);
  } catch (error) {
    return {
      ok: false,
      detail: `The remote branch could not be read: ${String(error?.message ?? error).slice(0, 200)}`,
    };
  }
  if (head === null) return { ok: true, remoteHead: null };
  if (![value.head, value.pr?.head].filter(Boolean).includes(head))
    return {
      ok: false,
      detail: `The remote branch ${value.branch} is at ${head.slice(0, 12)}, a commit the work item never recorded`,
    };
  return { ok: true, remoteHead: head };
}

// I11: true for every protected area, null to revoke, or the named protected
// globs in PROTECTED_GLOBS order. A name that is not exactly a protected area
// would never match after-scope's check, so it refuses the whole request.
function protectedGrant(what) {
  const text = String(what ?? "").trim();
  if (text === "all") return true;
  if (text === "none") return null;
  const asked = text
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!asked.length) throw new Refusal("invalid-protected", text);
  for (const glob of asked)
    if (!PROTECTED_GLOBS.includes(glob))
      throw new Refusal("invalid-protected", glob);
  return PROTECTED_GLOBS.filter((glob) => asked.includes(glob));
}

const withAllowProtected = (value, allowProtected) => {
  const rest = { ...value };
  delete rest.allowProtected;
  return Object.keys(allowProtected).length
    ? { ...rest, allowProtected }
    : rest;
};

export async function runControl(
  argv,
  {
    archon,
    config,
    fetchImpl = fetch,
    removeContainers = removeLabeledContainers,
    verifyIdentity = verifyNativeIdentity,
    readEffects = nativeEffects,
    now = () => new Date().toISOString(),
  },
) {
  const { positional, flags } = parseArgs(argv);
  const [command, ...rest] = positional;
  const request = flags.request;
  const by = String(flags.by ?? "operator").slice(0, 80);
  const reason = flags.reason ? String(flags.reason).slice(0, 600) : null;
  const needRequest = () => {
    if (!requestPattern.test(request ?? ""))
      throw new Refusal("request-id-required");
  };
  const paths = factoryPaths(config);
  switch (command) {
    case "status": {
      const [factory, scope, issues] = await Promise.all([
        archon.get("core/factory"),
        archon.get("core/scope"),
        archon.list("core/issues/", { values: true }),
      ]);
      return {
        ok: true,
        factory: factory.value,
        scope: scope.value,
        issues: (issues.documents ?? [])
          .filter((doc) => /^core\/issues\/\d+$/.test(doc.name))
          .map((doc) => ({
            issue: doc.value.issue,
            status: doc.value.status,
            control: doc.value.control,
            round: doc.value.round,
            route: doc.value.route,
            pr: doc.value.pr?.url ?? null,
            blocker: doc.value.blocker,
            lease: doc.lease,
          })),
      };
    }
    case "factory": {
      needRequest();
      return conditional(archon, "core/factory", (document) =>
        planFactoryControl(document, {
          action: rest[0],
          reason,
          by,
          now: now(),
          requestId: request,
        }),
      );
    }
    case "issue": {
      needRequest();
      const issue = Number(rest[0]);
      if (!Number.isSafeInteger(issue) || issue <= 0)
        throw new Refusal("invalid-issue");
      const action = rest[1];
      // Ask the engine about the run a reconcile would settle.
      let runStatus = null;
      if (action === "reconcile") {
        const runId = (await archon.get(issueDocument(issue))).value?.run?.id;
        if (runId) runStatus = await engineRun(fetchImpl, config, runId);
      }
      // adopt-policy is the explicit policy transition. Like the recovery
      // controls it needs the installed release and the retained identity; it
      // proves that identity against the record of the release the assignment
      // was bound under, because the profile digest binds the release.
      const transition = action === "adopt-policy";
      const nativeRecovery = action === "recover-native";
      const recovery =
        transition ||
        nativeRecovery ||
        ["retry", "reopen", "release"].includes(action);
      // Set once the held run has been ended and read again.
      let ended = null;
      return conditional(archon, issueDocument(issue), async (document) => {
        const installed = recovery ? installedRelease(paths) : undefined;
        const heldRun = nativeRecovery ? document.value?.run?.id : null;
        // The remote readback comes before anything is changed.
        const effects =
          nativeRecovery && document.value
            ? await readEffects({ config, value: document.value })
            : undefined;
        const plan = (identity, status = runStatus) =>
          planControl(document, {
            action,
            reason,
            by,
            now: now(),
            requestId: request,
            runStatus: status,
            limits: limits(config),
            installed,
            identity,
            effects,
          });
        // Every refusal that needs no identity proof comes first (for the
        // transition, against a placeholder digest that is never written; for
        // a native recovery, as if the held run had already ended, so nothing
        // is ended for a request that would be refused anyway).
        const planned = plan(
          transition ? { profileDigest: "0".repeat(64) } : undefined,
          heldRun ? { id: heldRun, status: "cancelled" } : runStatus,
        );
        if (planned.noop || !recovery) return planned;
        const assignment = document.value.assignment;
        let predecessor;
        if (transition) {
          predecessor = predecessorRelease(
            installed,
            assignment.policyRevision,
          );
          if (!predecessor)
            throw new Refusal(
              "predecessor-release-unavailable",
              "The record of the release this assignment was bound under is missing or does not name it; retained assignment unchanged",
            );
        }
        const identity = await verifyIdentity({
          config,
          owner: assignment.owner,
          expectedDigest: assignment.profileDigest,
          ...(transition ? { predecessor } : {}),
        });
        if (
          !identity ||
          typeof identity.profileDigest !== "string" ||
          !/^[a-f0-9]{64}$/.test(identity.profileDigest)
        )
          throw new Refusal("identity-proof-unavailable");
        if (
          identity.owner !== assignment.owner ||
          (!transition && identity.profileDigest !== assignment.profileDigest)
        )
          throw new Refusal("identity-drift");
        if (!isDeepStrictEqual(installed, installedRelease(paths)))
          throw new Refusal(
            "policy-transition-required",
            "Installed release changed during identity verification; retained assignment unchanged",
          );
        if (transition) return plan({ profileDigest: identity.profileDigest });
        if (!nativeRecovery) return planned;
        if (!heldRun) return plan(undefined, null);
        // A failed run can be resumed, and a run the engine paused for a
        // provider wait (a usage limit with a reported reset) resumes by
        // itself, so the engine still counts either as the issue's owner and
        // keeps its lease live. Neither executes. End it the way the orphan
        // pass does: its containers first, then the engine's own abandon. A
        // run that still executes is never touched here (cancel-run is the
        // control for that).
        if (!ended || ended.id !== heldRun) {
          let status = await engineRun(fetchImpl, config, heldRun);
          if (RESUMABLE_RUNS.has(status?.status)) {
            const containers = await removeRunContainers(
              removeContainers,
              config,
              heldRun,
            );
            if (
              containers.ok !== true ||
              !Array.isArray(containers.remaining) ||
              containers.remaining.length
            )
              throw new Refusal(
                "containers-unconfirmed",
                "The held run's check containers are not confirmed gone; nothing was changed",
              );
            let answered = null;
            try {
              answered = (
                await fetchImpl(
                  `http://127.0.0.1:${config.archon.port}/api/workflows/runs/${heldRun}/abandon`,
                  { method: "POST" },
                )
              ).status;
            } catch {}
            if (answered !== 200)
              throw new Refusal(
                "run-not-ended",
                `The engine did not end run ${heldRun} (answered ${answered ?? "nothing"}); the hold stays`,
              );
            status = await engineRun(fetchImpl, config, heldRun);
          }
          ended = status;
        }
        return plan(undefined, ended);
      });
    }
    case "scope": {
      needRequest();
      // Fail closed: a malformed entry refuses the whole scope rather than
      // silently authorizing the remainder.
      const issues = String(flags.issues ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map(Number);
      const endState = flags["end-state"];
      const owner = flags.owner;
      if (!issues.length) throw new Refusal("scope-issues-required");
      if (!issues.every((value) => Number.isSafeInteger(value) && value > 0))
        throw new Refusal("invalid-issue");
      if (!["PR_READY", "MERGED"].includes(endState))
        throw new Refusal("end-state-required");
      if (!config.owners[owner]) throw new Refusal("unknown-owner", owner);
      // Optional per-issue end states, e.g. --end-states 2233=MERGED,2234=PR_READY
      const endStates = {};
      for (const pair of String(flags["end-states"] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)) {
        const [issueText, state] = pair.split("=");
        const issue = Number(issueText);
        if (!issues.includes(issue) || !["PR_READY", "MERGED"].includes(state))
          throw new Refusal("invalid-end-states", pair);
        endStates[issue] = state;
      }
      return conditional(archon, "core/scope", (document) => {
        if (
          (document.value?.requests ?? []).some((item) => item.id === request)
        )
          return { noop: true, value: document.value };
        const approved = [...new Set(issues)].sort((a, b) => a - b);
        // Protected-path authorizations survive only for issues still in scope.
        const allowProtected = Object.fromEntries(
          Object.entries(document.value?.allowProtected ?? {}).filter(([key]) =>
            approved.includes(Number(key)),
          ),
        );
        return {
          name: "core/scope",
          ifRevision: document.revision,
          value: withAllowProtected(
            {
              v: 1,
              issues: approved,
              endState,
              endStates,
              owner,
              approvedBy: by,
              approvedAt: now(),
              note: flags.note ? String(flags.note).slice(0, 600) : null,
              priorities: document.value?.priorities ?? {},
              requests: [
                ...(document.value?.requests ?? []),
                { id: request, by, at: now() },
              ].slice(-20),
            },
            allowProtected,
          ),
        };
      });
    }
    case "prioritize": {
      needRequest();
      const issue = Number(rest[0]);
      const priority = Number(rest[1]);
      if (
        !Number.isSafeInteger(issue) ||
        !Number.isInteger(priority) ||
        priority < 0 ||
        priority > 100
      )
        throw new Refusal("invalid-priority");
      return conditional(archon, "core/scope", (document) => {
        if (!document.value) throw new Refusal("no-scope");
        if ((document.value.requests ?? []).some((item) => item.id === request))
          return { noop: true, value: document.value };
        if (!document.value.issues.includes(issue))
          throw new Refusal("not-in-scope");
        return {
          name: "core/scope",
          ifRevision: document.revision,
          value: {
            ...document.value,
            priorities: {
              ...(document.value.priorities ?? {}),
              [issue]: priority,
            },
            requests: [
              ...(document.value.requests ?? []),
              { id: request, by, at: now() },
            ].slice(-20),
          },
        };
      });
    }
    case "allow-protected": {
      needRequest();
      const issue = Number(rest[0]);
      if (!Number.isSafeInteger(issue) || issue <= 0)
        throw new Refusal("invalid-issue");
      const grant = protectedGrant(rest[1]);
      return conditional(archon, "core/scope", (document) => {
        if (!document.value) throw new Refusal("no-scope");
        if ((document.value.requests ?? []).some((item) => item.id === request))
          return { noop: true, value: document.value };
        if (!document.value.issues.includes(issue))
          throw new Refusal("not-in-scope");
        const allowProtected = { ...(document.value.allowProtected ?? {}) };
        if (grant === null) delete allowProtected[issue];
        else allowProtected[issue] = grant;
        return {
          name: "core/scope",
          ifRevision: document.revision,
          value: withAllowProtected(
            {
              ...document.value,
              requests: [
                ...(document.value.requests ?? []),
                { id: request, by, at: now() },
              ].slice(-20),
            },
            allowProtected,
          ),
        };
      });
    }
    case "cancel-run": {
      needRequest();
      const runId = rest[0];
      if (!/^[a-f0-9-]{36}$/.test(runId ?? ""))
        throw new Refusal("invalid-run");
      // A cancelled round is not requeued automatically: hold its issue first,
      // so reconciling the ended run leaves it waiting until a release.
      const listing = await archon.list("core/issues/", { values: true });
      const owner = (listing.documents ?? []).find(
        (doc) =>
          /^core\/issues\/\d+$/.test(doc.name) && doc.value?.run?.id === runId,
      );
      let held = null;
      if (owner) {
        const hold = await conditional(archon, owner.name, (document) =>
          planControl(document, {
            action: "hold",
            reason: reason ?? `Run ${runId} cancelled by ${by}`,
            by,
            now: now(),
            requestId: request,
          }),
        );
        const confirmed = hold.ok && hold.value?.control === "hold";
        held = {
          issue: owner.value.issue,
          ok: confirmed,
          code: confirmed ? null : (hold.code ?? "not-held"),
        };
        if (!confirmed)
          return {
            ok: false,
            code: held.code,
            message:
              "The issue hold was not confirmed; the run was not cancelled. Read the issue and retry.",
            held,
          };
      }
      let response = null;
      let body = "";
      let observed = null;
      let containers;
      const errors = [];
      const recordError = (operation, error) => {
        errors.push({
          operation,
          detail: String(error?.message ?? error).slice(0, 600),
        });
      };
      try {
        try {
          response = await fetchImpl(
            `http://127.0.0.1:${config.archon.port}/api/workflows/runs/${runId}/cancel`,
            { method: "POST" },
          );
        } catch (error) {
          recordError("cancel", error);
        }
        if (response) {
          try {
            body = await response.text();
          } catch (error) {
            recordError("cancel-body", error);
          }
        }
        let statusResponse;
        try {
          statusResponse = await fetchImpl(
            `http://127.0.0.1:${config.archon.port}/api/workflows/runs/${runId}`,
          );
        } catch (error) {
          recordError("status", error);
        }
        if (statusResponse) {
          try {
            const after = await statusResponse.json();
            if (statusResponse.ok && typeof after?.run?.status === "string")
              observed = after.run.status;
          } catch (error) {
            recordError("status-body", error);
          }
        }
      } finally {
        containers = await removeRunContainers(removeContainers, config, runId);
      }
      return {
        ok:
          response?.ok === true &&
          errors.length === 0 &&
          ENDED_RUNS.has(observed) &&
          containers?.ok === true &&
          Array.isArray(containers.remaining) &&
          containers.remaining.length === 0,
        status: response?.status ?? null,
        detail: body.slice(0, 600),
        observed,
        containers,
        ...(errors.length ? { errors } : {}),
        ...(held ? { held } : {}),
      };
    }
    case "ask":
    case "analyze": {
      needRequest();
      const inputs =
        command === "ask"
          ? {
              question: String(flags.question ?? "").slice(0, 2000),
              conversation: String(flags.conversation ?? ""),
              request,
            }
          : {
              scope: String(flags.scope ?? "factory"),
              trigger: String(flags.trigger ?? "operator"),
              request,
            };
      if (
        command === "ask" &&
        (!inputs.question.trim() ||
          !/^[a-z0-9-]{8,64}$/.test(inputs.conversation))
      )
        throw new Refusal("invalid-question");
      const dir = posix.join(paths.runs, "operator-requests");
      mkdirSync(dir, { recursive: true });
      writeFileSync(posix.join(dir, `${request}.json`), JSON.stringify(inputs));
      if (command === "ask") {
        // Record the question now so the conversation shows it as pending
        // across reloads; the answer turn adds Samson's reply.
        const recorded = await conditional(
          archon,
          `core/chat/${inputs.conversation}`,
          (document) => {
            const messages = document.value?.messages ?? [];
            if (
              messages.some(
                (message) =>
                  message.request === request && message.role === "operator",
              )
            )
              return { noop: true, value: document.value };
            return {
              name: `core/chat/${inputs.conversation}`,
              ifRevision: document.revision,
              value: {
                v: 1,
                messages: [
                  ...messages,
                  {
                    role: "operator",
                    text: inputs.question,
                    request,
                    at: now(),
                    status: "pending",
                  },
                ].slice(-24),
              },
            };
          },
        );
        if (!recorded.ok) return recorded;
      }
      const fired = await fireWebhook({
        config,
        workflow: command === "ask" ? "answer" : "analyze",
        deliveryId: `${command}:${request}`,
        body: inputs,
        fetchImpl,
      });
      return {
        ok: fired.ok,
        outcome: fired.outcome,
        status: fired.status,
        receipt: fired.receipt?.receiptId ?? fired.receipt?.id ?? null,
        detail: fired.detail,
      };
    }
    default:
      throw new Refusal("unknown-command", command);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const config = loadConfig();
  const archon = createArchon({
    command: [config.archon.executable],
    project: "_folder/control",
    env: {
      HOME: config.archon.serviceHome ?? "/home/admin",
      PATH: "/usr/bin:/bin",
      ARCHON_HOME: config.archon.home,
      ARCHON_USER_ID: "core-factory",
    },
    cwd: posix.join(config.root, "control"),
  });
  runControl(process.argv.slice(2), { archon, config })
    .then((result) => {
      process.stdout.write(JSON.stringify(result) + "\n");
      process.exitCode = result.ok ? 0 : 2;
    })
    .catch((error) => {
      process.stdout.write(
        JSON.stringify({
          ok: false,
          code: error.code ?? "error",
          message: error.message,
        }) + "\n",
      );
      process.exitCode = 1;
    });
}
