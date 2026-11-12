import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import { CheckCleanupError } from "../../../scripts/archon-factory/pack/.shared/executor.mjs";
import { createGit } from "../../../scripts/archon-factory/pack/.shared/git.mjs";
import { createAssignment } from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";
import { settleRound } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";

const state = vi.hoisted(() => ({
  round: null as any,
  document: null as any,
  build: null as any,
  output: null as any,
  install: vi.fn(),
  execute: vi.fn(),
}));

vi.mock(
  "../../../scripts/archon-factory/pack/.shared/round.mjs",
  async (original) => {
    const actual = await original<Record<string, any>>();
    return {
      ...actual,
      openRound: () => state.round,
      input: () => state.build,
      workItem: async () => state.document,
      writeWorkItem: async (_round: unknown, plan: any) => {
        state.document = {
          ...state.document,
          value: plan.value,
          revision: state.document.revision + 1,
        };
      },
      ensureInstall: (...args: unknown[]) => state.install(...args),
      runInIssueRepo: (round: unknown, options: unknown) =>
        actual.runInIssueRepo(round, options, { execute: state.execute }),
      emit: (output: unknown) => {
        state.output = output;
      },
    };
  },
);

const actualRound = await vi.importActual<Record<string, any>>(
  "../../../scripts/archon-factory/pack/.shared/round.mjs",
);
const RUN = "run-0123456789abcdef";
const roots: string[] = [];
const gitExecutable =
  process.platform === "win32"
    ? execFileSync("where.exe", ["git.exe"], { encoding: "utf8" })
        .trim()
        .split(/\r?\n/)[0]
    : execFileSync("which", ["git"], { encoding: "utf8" }).trim();

afterEach(() => {
  vi.restoreAllMocks();
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function fixture(route = "review") {
  vi.resetModules();
  state.execute.mockReset();
  state.install.mockReset();
  state.output = null;
  state.build = null;
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-freeze-caller-")),
  ).replace(/\\/g, "/");
  roots.push(root);
  const repo = `${root}/issue/repo`;
  mkdirSync(`${repo}/src`, { recursive: true });
  mkdirSync(`${repo}/tests`, { recursive: true });
  mkdirSync(`${repo}/.husky`, { recursive: true });
  writeFileSync(`${repo}/bun.lock`, "{}\n");
  writeFileSync(`${repo}/src/value.js`, "export const value = 1;\n");
  writeFileSync(`${repo}/.gitignore`, "node_modules/\n.husky/_/\n");
  writeFileSync(`${repo}/.husky/pre-commit`, "exit 0\n");
  const plain = (...args: string[]) =>
    execFileSync(
      gitExecutable,
      ["-c", "core.hooksPath=", "-c", "core.autocrlf=false", ...args],
      {
        cwd: repo,
        encoding: "utf8",
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: "Fixture",
          GIT_AUTHOR_EMAIL: "fixture@example.invalid",
          GIT_COMMITTER_NAME: "Fixture",
          GIT_COMMITTER_EMAIL: "fixture@example.invalid",
        },
      },
    ).trim();
  plain("init", "--quiet");
  plain("add", ".");
  plain("commit", "--quiet", "-m", "base");
  const head = plain("rev-parse", "HEAD");
  const where = {
    root: `${root}/issue`,
    repo,
    trust: `${root}/issue/git-trust.json`,
  };
  writeFileSync(
    where.trust,
    JSON.stringify({
      v: 1,
      repoConfig: readFileSync(`${repo}/.git/config`, "utf8"),
      alternates: "",
      outboxConfig: "",
    }),
  );
  const now = "2026-11-12T00:00:00Z";
  const value = createAssignment({
    issue: 7,
    assignmentId: "A-7",
    owner: "fixture",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: "c".repeat(64),
    endState: "PR_READY",
    now,
  });
  Object.assign(value, {
    status: "active",
    route: null,
    round: 1,
    run: { id: RUN, route, head },
    base: head,
    head,
    brief: {
      summary: "Fixture",
      out_of_scope: [],
      source_paths: ["src/**"],
      test_paths: ["tests/**"],
    },
    acceptance: {
      revision: "d".repeat(64),
      criteria: [],
      tests: [],
      run: "run-earlier000",
    },
  });
  state.document = { revision: 2, value, lease: { runId: RUN } };
  const entries: Record<string, any> = {
    "claim-lease": { taken: true },
    claim: { route },
  };
  state.round = {
    where,
    runId: RUN,
    runDir: `${root}/run`,
    assignment: "A-7",
    issue: 7,
    git: createGit({ executable: gitExecutable }),
    config: {
      executor: {
        docker: "/usr/bin/docker",
        image: `sha256:${"c".repeat(64)}`,
      },
      git: { authorName: "Fixture", authorEmail: "fixture@example.invalid" },
    },
    paths: {
      root,
      locks: `${root}/locks`,
      mirror: `${root}/mirror.git`,
      cache: `${root}/cache`,
      views: `${root}/views`,
    },
    ledger: {
      read: (name: string) => entries[name] ?? null,
      write: (name: string, entry: unknown) => {
        entries[name] = entry;
      },
    },
    now: () => now,
  };
  state.install.mockImplementation((round, options) =>
    actualRound.ensureInstall(round, { ...options, execute: state.execute }),
  );
  const receipt = {
    status: "timed_out",
    exitCode: null,
    containerId: "f".repeat(64),
    containerName: "core-check-11111111-1111-4111-8111-111111111111",
    labels: {
      "core.archon.executor": "candidate-check",
      "core.archon.attempt": "11111111-1111-4111-8111-111111111111",
      "core.archon.run": RUN,
      "core.archon.issue": "7",
    },
    image: state.round.config.executor.image,
    workspaceDirectory: repo,
    workspaceTarget: repo,
    network: "bridge",
    mounts: [
      { source: `${root}/cache/bun`, target: "/bun-cache", readOnly: false },
    ],
    command: ["bun", "install", "--frozen-lockfile"],
    limits: { timeoutMs: 1_800_000 },
    stdout: `begin-${"evidence".repeat(650)}-end`,
    stderr: "cleanup could not be confirmed",
    cleanupConfirmed: false,
    reusable: false,
    configDirectory: `${root}/issue/.docker-check-fixture`,
  };
  return { root, repo, head, receipt, entries, plain };
}

async function runFreeze() {
  const stopped = new Error("freeze stopped");
  vi.spyOn(process, "exit").mockImplementation(() => {
    throw stopped;
  });
  await expect(
    import("../../../scripts/archon-factory/pack/deliver/scripts/freeze.ts"),
  ).rejects.toBe(stopped);
}

describe("freeze caller cleanup boundary", () => {
  it.each(["executor cleanup error", "failed install receipt"])(
    "retains exact cleanup evidence instead of a code repair after %s",
    async (failure) => {
      const { head, receipt, entries } = fixture();
      state.execute.mockImplementation(async () => {
        if (failure === "executor cleanup error")
          throw new CheckCleanupError(receipt);
        return receipt;
      });

      await runFreeze();

      expect(entries.freeze.cleanup).toEqual({
        step: "install",
        runId: RUN,
        assignment: "A-7",
        issue: 7,
        error: {
          name: "CheckCleanupError",
          message:
            "Owned check cleanup is uncertain; retain workspace and do not reuse the slot",
        },
        receipt,
      });
      expect(entries.freeze.blocked.code).toBe("cleanup-unconfirmed");
      expect(entries.freeze.review).toBe(true);
      expect(entries.freeze.prepared).toBe(false);
      expect(entries.freeze.candidate).toBe(head);
      expect(entries.freeze.repair).toBeUndefined();
      expect(state.output).toMatchObject({
        review: "no",
        micaiah_assignment: "",
        luke_assignment: "",
      });
      expect(state.execute).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ["hooks-add", "thrown"],
    ["hooks-commit", "thrown"],
    ["hooks-add", "returned"],
    ["hooks-commit", "returned"],
  ])(
    "records a cleanup hold at %s from a %s receipt without starting another command",
    async (step, failure) => {
      const { repo, receipt, entries } = fixture("initial");
      state.build = {
        task_status: "DONE",
        oracle_requests: [],
        gaps: [],
        checks_run: [],
      };
      writeFileSync(`${repo}/src/value.js`, "export const value = 2;\n");
      state.install.mockResolvedValue({ reused: false });
      state.execute.mockImplementation(async (input) => {
        const operation = input.command.includes("commit")
          ? "hooks-commit"
          : "hooks-add";
        if (operation === step) {
          receipt.command = input.command;
          if (failure === "thrown") throw new CheckCleanupError(receipt);
          return receipt;
        }
        return {
          ...receipt,
          status: "passed",
          cleanupConfirmed: true,
          reusable: true,
        };
      });

      await runFreeze();

      expect(entries.freeze.cleanup).toMatchObject({
        step,
        runId: RUN,
        assignment: "A-7",
        issue: 7,
        receipt,
      });
      expect(entries.freeze.blocked.code).toBe("cleanup-unconfirmed");
      expect(entries.freeze.review).toBe(false);
      expect(entries.freeze.repair).toBeUndefined();
      expect(state.execute).toHaveBeenCalledTimes(step === "hooks-add" ? 1 : 2);
    },
  );

  it.each([false, true])(
    "does not release or dispatch after freeze cleanup is unconfirmed (failed node: %s)",
    async (failedNode) => {
      const { receipt, entries } = fixture();
      state.execute.mockRejectedValue(new CheckCleanupError(receipt));
      await runFreeze();
      const issueName = "core/issues/7";
      const documents = new Map<string, any>([
        [
          issueName,
          {
            ...structuredClone(state.document),
            lease: { runId: RUN, live: true },
          },
        ],
        [
          "core/reservations",
          { revision: 3, value: { v: 1, areas: { lockfile: 7 } }, lease: null },
        ],
        [
          "core/factory",
          {
            revision: 1,
            value: { v: 1, intake: "open", mode: "run", mergeHold: false },
            lease: null,
          },
        ],
      ]);
      const archon = {
        get: vi.fn(async (name: string) => ({
          name,
          ...structuredClone(documents.get(name)),
        })),
        put: vi.fn(
          async (
            name: string,
            value: unknown,
            options: { ifRevision: number; lease?: string },
          ) => {
            const document = documents.get(name);
            if (document.revision !== options.ifRevision)
              throw new StateConflict("conflict", null);
            const lease =
              options.lease === "release"
                ? { ...document.lease, live: false }
                : document.lease;
            const updated = {
              revision: document.revision + 1,
              value: structuredClone(value),
              lease,
            };
            documents.set(name, updated);
            return { name, ...updated };
          },
        ),
      };
      const fire = vi.fn(async () => ({
        ok: true,
        outcome: "accepted",
        deliveryId: "unexpected-successor",
      }));

      const result = await settleRound({
        archon,
        issue: 7,
        runId: RUN,
        assignment: "A-7",
        ledger: entries,
        nodes: failedNode
          ? [
              {
                state: "failed",
                node_id: "freeze",
                error: "executor interrupted",
              },
            ]
          : [],
        now: state.round.now(),
        limits: { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 },
        fire,
      });

      expect(result).toMatchObject({ next: "", reservations: "kept" });
      expect(fire).not.toHaveBeenCalled();
      expect(documents.get(issueName).lease).toEqual({
        runId: RUN,
        live: true,
      });
      expect(documents.get("core/reservations").value.areas).toEqual({
        lockfile: 7,
      });
      expect(JSON.stringify(documents.get(issueName).value)).toContain(
        JSON.stringify(receipt),
      );
    },
  );
});

describe("freeze install receipt contract", () => {
  it.each([
    { cleanupConfirmed: false, reusable: false },
    { cleanupConfirmed: true, reusable: false },
    { cleanupConfirmed: false, reusable: true },
  ])(
    "refuses successful install without both cleanup confirmations: %j",
    async (flags) => {
      const { root, receipt } = fixture();
      Object.assign(receipt, { status: "passed", exitCode: 0 }, flags);
      state.execute.mockResolvedValue(receipt);

      await expect(
        actualRound.ensureInstall(state.round, {
          clean: true,
          execute: state.execute,
        }),
      ).rejects.toMatchObject({
        name: "CheckCleanupError",
        receipt,
      });

      expect(existsSync(`${root}/issue/install.json`)).toBe(false);
      expect(state.execute).toHaveBeenCalledTimes(1);
    },
  );
});

describe("freeze caller hook dependencies", () => {
  it("reinstalls writer-controlled dependencies before retaining the normal commit hook", async () => {
    const { repo, receipt, entries } = fixture("initial");
    state.build = {
      task_status: "DONE",
      oracle_requests: [],
      gaps: [],
      checks_run: [],
    };
    writeFileSync(`${repo}/src/value.js`, "export const value = 2;\n");
    const poisoned = `${repo}/node_modules/lint-staged/writer.cjs`;
    mkdirSync(path.posix.dirname(poisoned), { recursive: true });
    writeFileSync(poisoned, "writer-controlled hook dependency\n");
    const events: string[] = [];
    const dependenciesAtHook: boolean[] = [];
    const hookCacheDirectories: string[] = [];
    const hookSharedCacheMounts: boolean[] = [];
    state.execute.mockImplementation(async (input) => {
      const operation = input.command.includes("install")
        ? "install"
        : input.command.includes("commit")
          ? "commit"
          : "add";
      events.push(operation);
      if (operation === "commit") {
        dependenciesAtHook.push(existsSync(poisoned));
        hookCacheDirectories.push(input.env.BUN_INSTALL_CACHE_DIR);
        hookSharedCacheMounts.push(
          input.mounts.some(
            (mount: { target: string }) => mount.target === "/bun-cache",
          ),
        );
        expect(input.command).toContain(`core.hooksPath=${repo}/.husky/_`);
        expect(readFileSync(`${repo}/.husky/_/pre-commit`, "utf8")).toContain(
          'sh -e "$s" "$@"',
        );
      }
      return {
        ...receipt,
        status: operation === "commit" ? "failed" : "passed",
        exitCode: operation === "commit" ? 1 : 0,
        cleanupConfirmed: true,
        reusable: true,
      };
    });

    await runFreeze();

    // The clean install seeds the lockfile cache without scripts, then
    // installs from a private view of it.
    expect(events).toEqual(["install", "install", "add", "commit"]);
    expect(state.install).toHaveBeenCalledWith(state.round, { clean: true });
    expect(dependenciesAtHook).toEqual([false]);
    expect(hookSharedCacheMounts).toEqual([false]);
    expect(hookCacheDirectories).toEqual(["/tmp/bun-install-cache"]);
    expect(entries.freeze.reason).toBe("Normal commit hooks failed");
  });

  it("does not start hooks when cleaning their dependencies leaves an owned workload unconfirmed", async () => {
    const { repo, receipt, entries } = fixture("initial");
    state.build = {
      task_status: "DONE",
      oracle_requests: [],
      gaps: [],
      checks_run: [],
    };
    writeFileSync(`${repo}/src/value.js`, "export const value = 2;\n");
    state.install.mockRejectedValue(new CheckCleanupError(receipt));
    state.execute.mockResolvedValue({
      ...receipt,
      status: "failed",
      cleanupConfirmed: true,
      reusable: true,
    });

    await runFreeze();

    expect(entries.freeze.cleanup).toMatchObject({
      step: "hook-dependencies",
      receipt,
    });
    expect(entries.freeze.blocked.code).toBe("cleanup-unconfirmed");
    expect(state.execute).not.toHaveBeenCalled();
  });
});
