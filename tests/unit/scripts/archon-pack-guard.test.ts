import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { evaluateHook } from "../../../scripts/archon-factory/pack/.shared/guard.mjs";

const RUN = "run-0123456789abcdef";
const OTHER_RUN = "run-fedcba9876543210";
// The configured factory root is a POSIX path the injected readFile serves, so
// no test reads /srv on the host.
const FACTORY_ROOT = "/srv/test-factory";
const CONTEXT_FILE = `${FACTORY_ROOT}/runs/${RUN}/context.json`;
const REPO = `${FACTORY_ROOT}/issues/12/repo`;
const CONTROL = `${FACTORY_ROOT}/control`;
const GUARD = realpathSync(
  fileURLToPath(
    new URL(
      "../../../scripts/archon-factory/pack/.shared/guard.mjs",
      import.meta.url,
    ),
  ),
);

const roots: string[] = [];
function temporaryDirectory() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-guard-")),
  );
  roots.push(root);
  return root;
}

beforeEach(() => {
  const root = temporaryDirectory();
  const config = path.join(root, "core-factory.json");
  writeFileSync(config, JSON.stringify({ version: 1, root: FACTORY_ROOT }));
  vi.stubEnv("CORE_FACTORY_CONFIG", config);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function runContext(runId = RUN) {
  return {
    v: 1,
    runId,
    issue: 12,
    round: 1,
    nodes: {
      build: {
        role: "bezalel",
        read: [REPO],
        write: [{ root: REPO, globs: ["src/**"] }],
      },
    },
  };
}

function hookInput(
  tool = "Read",
  toolInput: unknown = { file_path: `${REPO}/src/a.ts` },
  cwd = CONTROL,
) {
  return JSON.stringify({
    session_id: "session",
    hook_event_name: "PreToolUse",
    tool_name: tool,
    tool_input: toolInput,
    cwd,
  });
}

function nodeEnv(
  overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
  return {
    WORKFLOW_ID: RUN,
    ARCHON_NODE_EXECUTION: JSON.stringify({
      runId: RUN,
      path: "build",
      nodeId: "build",
    }),
    ...overrides,
  };
}

type HookOptions = {
  stdin?: string;
  env?: Record<string, string | undefined>;
  files?: Record<string, string>;
  realpath?: (file: string) => string;
  lstat?: (file: string) => unknown;
  withLog?: boolean;
};

const missing = (file: string) =>
  Object.assign(new Error(`ENOENT: ${file}`), { code: "ENOENT" });

function runHook({
  stdin = hookInput(),
  env = nodeEnv(),
  files = { [CONTEXT_FILE]: JSON.stringify(runContext()) },
  realpath = (file: string) => file,
  lstat,
  withLog = true,
}: HookOptions = {}) {
  const readFile = vi.fn((file: string) => {
    if (Object.hasOwn(files, file)) return files[file];
    throw missing(file);
  });
  const log = vi.fn();
  const result = evaluateHook({
    stdin,
    env,
    readFile,
    realpath,
    lstat,
    log: withLog ? log : undefined,
  });
  return { result, readFile, log };
}

const denied = { decision: "deny", reason: "No trusted run context" };

describe("evaluateHook: run identity", () => {
  it("allows a call the node's recorded policy permits", () => {
    expect(runHook().result).toEqual({
      decision: "allow",
      reason: "allowed root",
    });
  });

  it("reads the run context from the configured factory runs root", () => {
    const { readFile } = runHook();
    expect(readFile.mock.calls).toEqual([[CONTEXT_FILE]]);
  });

  it("falls back to the VM 100 runs root when the factory config is unreadable", () => {
    vi.stubEnv(
      "CORE_FACTORY_CONFIG",
      path.join(temporaryDirectory(), "missing.json"),
    );
    const { readFile } = runHook();
    expect(readFile.mock.calls).toEqual([
      [`/srv/core-factory/runs/${RUN}/context.json`],
    ]);
  });

  it("denies when WORKFLOW_ID is missing", () => {
    expect(
      runHook({ env: nodeEnv({ WORKFLOW_ID: undefined }) }).result,
    ).toEqual(denied);
  });

  it("does not read any context when WORKFLOW_ID is missing", () => {
    const { readFile } = runHook({ env: nodeEnv({ WORKFLOW_ID: undefined }) });
    expect(readFile).not.toHaveBeenCalled();
  });

  it("denies when ARCHON_NODE_EXECUTION is missing", () => {
    expect(
      runHook({ env: nodeEnv({ ARCHON_NODE_EXECUTION: undefined }) }).result,
    ).toEqual(denied);
  });

  it("denies when ARCHON_NODE_EXECUTION is not valid JSON", () => {
    expect(
      runHook({ env: nodeEnv({ ARCHON_NODE_EXECUTION: '{"runId":' }) }).result,
    ).toEqual(denied);
  });

  it("denies a node execution that belongs to a different run", () => {
    const env = nodeEnv({
      ARCHON_NODE_EXECUTION: JSON.stringify({
        runId: OTHER_RUN,
        path: "build",
      }),
    });
    expect(runHook({ env }).result).toEqual(denied);
  });

  it("does not read the context of a run the node execution does not name", () => {
    const env = nodeEnv({
      ARCHON_NODE_EXECUTION: JSON.stringify({
        runId: OTHER_RUN,
        path: "build",
      }),
    });
    expect(runHook({ env }).readFile).not.toHaveBeenCalled();
  });

  it("denies when the context file records a different run", () => {
    const files = { [CONTEXT_FILE]: JSON.stringify(runContext(OTHER_RUN)) };
    expect(runHook({ files }).result).toEqual(denied);
  });

  it("denies when the context file has an unsupported version", () => {
    const files = {
      [CONTEXT_FILE]: JSON.stringify({ ...runContext(), v: 2 }),
    };
    expect(runHook({ files }).result).toEqual(denied);
  });

  it("denies when the context file cannot be read", () => {
    expect(runHook({ files: {} }).result).toEqual(denied);
  });

  it("denies when the context file is not valid JSON", () => {
    expect(runHook({ files: { [CONTEXT_FILE]: "{ not json" } }).result).toEqual(
      denied,
    );
  });

  it("denies a node execution that records no run id", () => {
    const env = nodeEnv({
      ARCHON_NODE_EXECUTION: JSON.stringify({ path: "build" }),
    });
    expect(runHook({ env }).result).toEqual(denied);
  });

  it("denies a run id that is not a safe path segment", () => {
    const runId = "../../control";
    const env = {
      WORKFLOW_ID: runId,
      ARCHON_NODE_EXECUTION: JSON.stringify({ runId, path: "build" }),
    };
    // A permissive context waits where the traversal would land, so only the
    // run id check stands between this call and an allow.
    const files = {
      "/srv/control/context.json": JSON.stringify(runContext(runId)),
    };
    expect(runHook({ env, files }).result).toEqual(denied);
  });

  it("uses the node path, not the node id, from ARCHON_NODE_EXECUTION", () => {
    const env = nodeEnv({
      ARCHON_NODE_EXECUTION: JSON.stringify({
        runId: RUN,
        path: "define",
        nodeId: "build",
      }),
    });
    expect(runHook({ env }).result).toEqual({
      decision: "deny",
      reason: "Node define has no factory role",
    });
  });
});

describe("evaluateHook: hook input", () => {
  it("denies hook input that is not JSON", () => {
    expect(runHook({ stdin: "PreToolUse" }).result).toEqual({
      decision: "deny",
      reason: "Unreadable hook input",
    });
  });

  it("denies hook input that is JSON null instead of throwing", () => {
    expect(runHook({ stdin: "null" }).result).toEqual({
      decision: "deny",
      reason: "Unreadable hook input",
    });
  });

  it.each(["42", '"Read"', "true"])(
    "denies hook input that is the JSON scalar %s",
    (stdin) => {
      expect(runHook({ stdin }).result).toEqual({
        decision: "deny",
        reason: "Unreadable hook input",
      });
    },
  );

  it("prints a deny decision rather than crashing on null hook input", () => {
    const child = spawnSync(process.execPath, [GUARD], {
      input: "null",
      env: { ...process.env, WORKFLOW_ID: "", ARCHON_NODE_EXECUTION: "" },
      encoding: "utf8",
      timeout: 30_000,
    });
    expect({
      status: child.status,
      output: child.stdout ? JSON.parse(child.stdout) : child.stderr,
    }).toEqual({
      status: 0,
      output: {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "Unreadable hook input",
        },
      },
    });
  });

  it("resolves relative tool paths against the hook event's cwd", () => {
    const stdin = hookInput("Read", { file_path: "src/a.ts" }, REPO);
    expect(runHook({ stdin }).result).toEqual({
      decision: "allow",
      reason: "allowed root",
    });
  });

  it("decides on the path the injected realpath resolves", () => {
    const outside = `${CONTROL}/core-factory.json`;
    const realpath = (file: string) =>
      file === `${REPO}/src/a.ts` ? outside : file;
    expect(runHook({ realpath }).result).toEqual({
      decision: "deny",
      reason: `bezalel may not read ${outside}`,
    });
  });

  it("passes the policy's write decision through", () => {
    const stdin = hookInput("Write", {
      file_path: `${REPO}/README.md`,
      content: "x",
    });
    expect(runHook({ stdin }).result).toEqual({
      decision: "deny",
      reason: `bezalel may not write ${REPO}/README.md`,
    });
  });

  describe("a write target that does not resolve", () => {
    const target = `${REPO}/src/new.ts`;
    const stdin = hookInput("Write", { file_path: target, content: "x" });
    const realpath = (file: string) => {
      if (file === target) throw missing(file);
      return file;
    };

    it("allows a new file when the injected lstat confirms nothing is there", () => {
      const lstat = (file: string) => {
        throw missing(file);
      };
      expect(runHook({ stdin, realpath, lstat }).result).toEqual({
        decision: "allow",
        reason: "assigned path",
      });
    });

    it("denies a dangling link the injected lstat finds", () => {
      const lstat = () => ({ isSymbolicLink: () => true });
      expect(runHook({ stdin, realpath, lstat }).result).toEqual({
        decision: "deny",
        reason: "Write target is a link that does not resolve",
      });
    });
  });

  it("decides without a log sink", () => {
    expect(runHook({ withLog: false }).result).toEqual({
      decision: "allow",
      reason: "allowed root",
    });
  });
});

describe("evaluateHook: decision log", () => {
  it("logs a denial with run, node, tool and reason", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T12:00:00.000Z"));
    const stdin = hookInput("Bash", { command: "cat /etc/shadow" });
    const { log } = runHook({ stdin });
    expect(log.mock.calls).toEqual([
      [
        {
          at: "2026-11-11T12:00:00.000Z",
          run: RUN,
          node: "build",
          tool: "Bash",
          decision: "deny",
          reason: "bezalel may not use Bash",
        },
      ],
    ]);
  });

  it("logs an allowed call", () => {
    const { log } = runHook();
    expect(log.mock.calls).toEqual([
      [
        {
          at: expect.any(String),
          run: RUN,
          node: "build",
          tool: "Read",
          decision: "allow",
          reason: "allowed root",
        },
      ],
    ]);
  });

  it("logs a foreign node execution under the WORKFLOW_ID run", () => {
    const env = nodeEnv({
      ARCHON_NODE_EXECUTION: JSON.stringify({
        runId: OTHER_RUN,
        path: "build",
      }),
    });
    const { log } = runHook({ env });
    expect(log.mock.calls).toEqual([
      [
        {
          at: expect.any(String),
          run: RUN,
          node: "build",
          tool: "Read",
          decision: "deny",
          reason: "No trusted run context",
        },
      ],
    ]);
  });

  it("logs a call with no run identity as run and node null", () => {
    const { log } = runHook({ env: {} });
    expect(log.mock.calls).toEqual([
      [
        {
          at: expect.any(String),
          run: null,
          node: null,
          tool: "Read",
          decision: "deny",
          reason: "No trusted run context",
        },
      ],
    ]);
  });
});

describe("guard.mjs as the PreToolUse hook command", () => {
  function factory() {
    const root = temporaryDirectory();
    const config = path.join(root, "core-factory.json");
    writeFileSync(config, JSON.stringify({ version: 1, root }));
    const runDirectory = path.join(root, "runs", RUN);
    mkdirSync(runDirectory, { recursive: true });
    writeFileSync(
      path.join(runDirectory, "context.json"),
      JSON.stringify({
        v: 1,
        runId: RUN,
        issue: 0,
        round: 0,
        nodes: { answer: { role: "samson", read: [] } },
      }),
    );
    return { root, config, runDirectory };
  }

  function runGuard(config: string, env: Record<string, string | undefined>) {
    const childEnv: Record<string, string | undefined> = { ...process.env };
    delete childEnv.WORKFLOW_ID;
    delete childEnv.ARCHON_NODE_EXECUTION;
    const child = spawnSync(process.execPath, [GUARD], {
      input: hookInput("StructuredOutput", { result: {} }),
      env: { ...childEnv, CORE_FACTORY_CONFIG: config, ...env },
      encoding: "utf8",
      timeout: 30_000,
    });
    return {
      status: child.status,
      output: child.stdout ? JSON.parse(child.stdout) : child.stderr,
    };
  }

  const identity = {
    WORKFLOW_ID: RUN,
    ARCHON_NODE_EXECUTION: JSON.stringify({ runId: RUN, path: "answer" }),
  };

  it("prints an allow decision in Claude Code's PreToolUse output shape", () => {
    const { config } = factory();
    expect(runGuard(config, identity)).toEqual({
      status: 0,
      output: {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "allow",
          permissionDecisionReason: "result channel",
        },
      },
    });
  });

  it("prints a deny decision in Claude Code's PreToolUse output shape", () => {
    const { config } = factory();
    expect(runGuard(config, { ...identity, WORKFLOW_ID: undefined })).toEqual({
      status: 0,
      output: {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "No trusted run context",
        },
      },
    });
  });

  it("appends each decision to the run's guard.jsonl", () => {
    const { config, runDirectory } = factory();
    runGuard(config, identity);
    runGuard(config, {
      ...identity,
      ARCHON_NODE_EXECUTION: JSON.stringify({ runId: RUN, path: "ghost" }),
    });
    const lines = readFileSync(path.join(runDirectory, "guard.jsonl"), "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(lines).toEqual([
      {
        at: expect.any(String),
        run: RUN,
        node: "answer",
        tool: "StructuredOutput",
        decision: "allow",
        reason: "result channel",
      },
      {
        at: expect.any(String),
        run: RUN,
        node: "ghost",
        tool: "StructuredOutput",
        decision: "deny",
        reason: "Node ghost has no factory role",
      },
    ]);
  });

  it("fails closed with a deny decision and exit 2 when the guard itself crashes", () => {
    const { root, config, runDirectory } = factory();
    // A malformed trusted context makes the policy throw mid-decision.
    writeFileSync(
      path.join(runDirectory, "context.json"),
      JSON.stringify({
        v: 1,
        runId: RUN,
        issue: 0,
        round: 0,
        nodes: {
          answer: {
            role: "bezalel",
            read: [],
            write: [{ root: 5, globs: ["**"] }],
          },
        },
      }),
    );
    const childEnv: Record<string, string | undefined> = { ...process.env };
    const child = spawnSync(process.execPath, [GUARD], {
      input: hookInput("Write", { file_path: config, content: "x" }),
      env: { ...childEnv, ...identity, CORE_FACTORY_CONFIG: config },
      encoding: "utf8",
      timeout: 30_000,
    });
    expect({
      status: child.status,
      output: child.stdout ? JSON.parse(child.stdout) : null,
      root: typeof root,
    }).toEqual({
      status: 2,
      output: {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: expect.stringMatching(
            /^Guard failed; denied: /,
          ),
        },
      },
      root: "string",
    });
  });

  it("does not write a guard log for a run id that would leave the runs root", () => {
    const { root, config } = factory();
    const escape = path.join(root, "escape");
    mkdirSync(escape);
    runGuard(config, {
      WORKFLOW_ID: "../escape",
      ARCHON_NODE_EXECUTION: JSON.stringify({
        runId: "../escape",
        path: "answer",
      }),
    });
    expect(existsSync(path.join(escape, "guard.jsonl"))).toBe(false);
  });
});

// The policy is POSIX-only (VM 100), and creating symlinks on Windows needs
// privileges, so these real-filesystem cases run on Linux CI.
describe.skipIf(process.platform === "win32")(
  "guard.mjs write decisions on a real filesystem",
  () => {
    function repository() {
      const root = temporaryDirectory();
      const repo = path.join(root, "issues", "12", "repo");
      mkdirSync(path.join(repo, "src"), { recursive: true });
      mkdirSync(path.join(root, "outside"));
      const config = path.join(root, "core-factory.json");
      writeFileSync(config, JSON.stringify({ version: 1, root }));
      const runDirectory = path.join(root, "runs", RUN);
      mkdirSync(runDirectory, { recursive: true });
      writeFileSync(
        path.join(runDirectory, "context.json"),
        JSON.stringify({
          v: 1,
          runId: RUN,
          issue: 12,
          round: 1,
          nodes: {
            build: {
              role: "bezalel",
              read: [repo],
              write: [{ root: repo, globs: ["src/**"] }],
            },
          },
        }),
      );
      return { root, repo, config };
    }

    function decision(config: string, filePath: string) {
      const childEnv: Record<string, string | undefined> = { ...process.env };
      const child = spawnSync(process.execPath, [GUARD], {
        input: hookInput("Write", { file_path: filePath, content: "x" }),
        env: { ...childEnv, ...nodeEnv(), CORE_FACTORY_CONFIG: config },
        encoding: "utf8",
        timeout: 30_000,
      });
      const output = JSON.parse(child.stdout).hookSpecificOutput;
      return [output.permissionDecision, output.permissionDecisionReason];
    }

    it("allows creating a genuinely new file inside the write root", () => {
      const { repo, config } = repository();
      expect(decision(config, path.join(repo, "src", "new.ts"))).toEqual([
        "allow",
        "assigned path",
      ]);
    });

    it("denies a write through a dangling symlink planted in the write root", () => {
      const { root, repo, config } = repository();
      const link = path.join(repo, "src", "hook.ts");
      symlinkSync(path.join(root, "outside", "planted.txt"), link);
      expect(decision(config, link)).toEqual([
        "deny",
        "Write target is a link that does not resolve",
      ]);
    });
  },
);
