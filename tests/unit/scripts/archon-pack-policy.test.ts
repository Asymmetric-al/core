import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  decide,
  globToRegExp,
  ROLE_TOOLS,
} from "../../../scripts/archon-factory/pack/.shared/policy.mjs";

// The policy works on VM 100's POSIX paths. The filesystem is faked at the
// realpath boundary so these expectations hold on Windows and Linux alike.
const posix = path.posix;
const RUN = "run-0123456789abcdef";
const ISSUE = "/srv/core-factory/issues/12";
const REPO = `${ISSUE}/repo`;
const MATERIALS = `/srv/core-factory/runs/${RUN}/materials`;
const VIEW = `/srv/core-factory/views/${RUN}/micaiah`;
const CONTROL_FILE = "/srv/core-factory/control/core-factory.json";
const CHECK_TOOL = "mcp__core-check__run_check";
const REPO_CHECK = {
  workspaceRoot: ISSUE,
  workspaceDirectory: REPO,
  workspaceTarget: REPO,
  mounts: [],
};

const EXISTING = [
  `${REPO}/packages/api/src/donations.ts`,
  `${REPO}/packages/api/src/donations.test.ts`,
  `${REPO}/tests/unit/donations.test.ts`,
  `${REPO}/apps/admin/page.tsx`,
  `${REPO}/docs/analysis.ipynb`,
  `${REPO}/.git/config`,
  `${REPO}/.git/hooks/pre-commit.sample`,
  `${REPO}/sub/.git/HEAD`,
  `${REPO}/.gitignore`,
  `${REPO}/.github/workflows/ci.yml`,
  `${REPO}-evil/a.ts`,
  `${MATERIALS}/bezalel/request.md`,
  `${MATERIALS}/micaiah/request.md`,
  `${VIEW}/src/a.ts`,
  CONTROL_FILE,
];

type Links = Record<string, string>;

/** A realpath over a fixed tree: `links` maps a symlink path to its target. */
function realpathOver(existing: string[] = EXISTING, links: Links = {}) {
  const present = new Set<string>(["/"]);
  for (const entry of existing) {
    for (let at = entry; at !== "/"; at = posix.dirname(at)) present.add(at);
  }
  return (target: string): string => {
    let resolved = target;
    for (let hops = 0; hops < 40; hops += 1) {
      const link = Object.keys(links).find(
        (candidate) =>
          resolved === candidate || resolved.startsWith(`${candidate}/`),
      );
      if (!link) break;
      resolved = links[link] + resolved.slice(link.length);
    }
    if (!present.has(resolved))
      throw Object.assign(new Error(`ENOENT: ${target}`), { code: "ENOENT" });
    return resolved;
  };
}

/**
 * lstat over the same tree: it does not follow the final component, so a
 * symlink exists even when its target does not (a dangling link).
 */
function lstatOver(existing: string[] = EXISTING, links: Links = {}) {
  const realpath = realpathOver(existing, links);
  return (target: string) => {
    if (Object.hasOwn(links, target))
      return { isSymbolicLink: () => true, isDirectory: () => false };
    const real = realpath(target);
    const directory =
      real === "/" || existing.some((entry) => entry.startsWith(`${real}/`));
    return { isSymbolicLink: () => false, isDirectory: () => directory };
  };
}

function runContext() {
  return {
    v: 1,
    runId: RUN,
    issue: 12,
    round: 1,
    nodes: {
      scope: { role: "samson", read: [REPO, `${MATERIALS}/scope`] },
      define: {
        role: "ezra",
        read: [REPO, `${MATERIALS}/ezra`],
        write: [{ root: REPO, globs: ["tests/unit/**/*.test.ts"] }],
        check: REPO_CHECK,
      },
      build: {
        role: "bezalel",
        read: [REPO, `${MATERIALS}/bezalel`],
        write: [{ root: REPO, globs: ["packages/api/src/**", "docs/*.ipynb"] }],
        denyWrite: [{ root: REPO, globs: ["**/*.test.ts"] }],
        check: REPO_CHECK,
      },
      micaiah: {
        role: "micaiah",
        read: [VIEW, `${MATERIALS}/micaiah`],
        check: {
          workspaceRoot: posix.dirname(VIEW),
          workspaceDirectory: VIEW,
          workspaceTarget: "/candidate",
          mounts: [],
        },
      },
      luke: { role: "luke", read: [VIEW] },
      assess: { role: "samson", read: [`${MATERIALS}/assess`] },
      analysis: { role: "analyst", read: [REPO] },
    },
  };
}

type Options = {
  context?: unknown;
  cwd?: unknown;
  realpath?: (target: string) => string;
  /** `null` leaves lstat out of the call entirely. */
  lstat?: ((target: string) => unknown) | null;
};

function decideFor(
  nodePath: string | undefined,
  tool: string,
  input: unknown = {},
  {
    context = runContext(),
    cwd = REPO,
    realpath = realpathOver(),
    lstat = lstatOver(),
  }: Options = {},
) {
  return decide({
    context,
    nodePath,
    tool,
    input,
    cwd,
    realpath,
    lstat: lstat ?? undefined,
  });
}

const deny = (reason: string) => ({ decision: "deny", reason });

describe("decide: trusted run context", () => {
  it("denies every tool when there is no run context", () => {
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: `${REPO}/apps/admin/page.tsx` },
        {
          context: null,
        },
      ),
    ).toEqual(deny("No trusted run context"));
  });

  it("denies a run context with an unsupported version", () => {
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: `${REPO}/apps/admin/page.tsx` },
        {
          context: { ...runContext(), v: 2 },
        },
      ),
    ).toEqual(deny("No trusted run context"));
  });

  it("denies a run context that records no version", () => {
    const context: Record<string, unknown> = runContext();
    delete context.v;
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: `${REPO}/apps/admin/page.tsx` },
        { context },
      ),
    ).toEqual(deny("No trusted run context"));
  });

  it("denies a node the run context does not name", () => {
    expect(
      decideFor("publish", "Read", {
        file_path: `${REPO}/apps/admin/page.tsx`,
      }),
    ).toEqual(deny("Node publish has no factory role"));
  });

  it("denies a call with no node identity", () => {
    expect(
      decideFor(undefined, "Read", {
        file_path: `${REPO}/apps/admin/page.tsx`,
      }),
    ).toEqual(deny("Node (unknown) has no factory role"));
  });

  it("denies a run context that has no nodes", () => {
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: `${REPO}/apps/admin/page.tsx` },
        {
          context: { v: 1, runId: RUN },
        },
      ),
    ).toEqual(deny("Node build has no factory role"));
  });

  it("denies a node whose role is not a factory role", () => {
    const context = runContext();
    (context.nodes as Record<string, unknown>).rogue = {
      role: "mallory",
      read: [REPO],
    };
    expect(
      decideFor(
        "rogue",
        "Read",
        { file_path: `${REPO}/apps/admin/page.tsx` },
        {
          context,
        },
      ),
    ).toEqual(deny("mallory may not use Read"));
  });
});

describe("decide: StructuredOutput result channel", () => {
  it("allows StructuredOutput for a role that has no other tools", () => {
    expect(
      decideFor("analysis", "StructuredOutput", { result: {} }, { cwd: null }),
    ).toEqual({ decision: "allow", reason: "result channel" });
  });

  it("denies StructuredOutput without a trusted run context", () => {
    expect(
      decideFor(
        "analysis",
        "StructuredOutput",
        { result: {} },
        {
          context: null,
        },
      ),
    ).toEqual(deny("No trusted run context"));
  });

  it("denies StructuredOutput for a node outside the run context", () => {
    expect(decideFor("publish", "StructuredOutput", { result: {} })).toEqual(
      deny("Node publish has no factory role"),
    );
  });

  it("denies an MCP tool that is merely named StructuredOutput", () => {
    expect(
      decideFor("micaiah", "mcp__rogue__StructuredOutput", { result: {} }),
    ).toEqual(deny("micaiah may not use mcp__rogue__StructuredOutput"));
  });
});

describe("decide: role tool lists", () => {
  const expectedTools: Record<string, string[]> = {
    samson: ["Read", "Grep", "Glob", "TodoWrite"],
    ezra: ["Read", "Grep", "Glob", "TodoWrite", "Write", "Edit", CHECK_TOOL],
    bezalel: [
      "Read",
      "Grep",
      "Glob",
      "TodoWrite",
      "Write",
      "Edit",
      "NotebookEdit",
      CHECK_TOOL,
    ],
    micaiah: ["Read", "Grep", "Glob", "TodoWrite", CHECK_TOOL],
    luke: ["Read", "Grep", "Glob", "TodoWrite", CHECK_TOOL],
    agabus: ["Read", "Grep", "Glob", "TodoWrite", CHECK_TOOL],
    analyst: [],
  };

  it("grants each role exactly its declared tools", () => {
    const sorted = (table: Record<string, string[]>) =>
      Object.fromEntries(
        Object.entries(table).map(([role, tools]) => [role, [...tools].sort()]),
      );
    expect(sorted(ROLE_TOOLS)).toEqual(sorted(expectedTools));
  });

  const editable = `${REPO}/apps/admin/page.tsx`;
  const toolInputs: Record<string, unknown> = {
    Read: { file_path: editable },
    Grep: { pattern: "donation", path: REPO },
    Glob: { pattern: "**/*.ts", path: REPO },
    TodoWrite: { todos: [] },
    Write: { file_path: editable, content: "export {};\n" },
    Edit: { file_path: editable, old_string: "a", new_string: "b" },
    NotebookEdit: {
      notebook_path: `${REPO}/docs/analysis.ipynb`,
      new_source: "1 + 1",
    },
    [CHECK_TOOL]: { command: ["bun", "run", "test:unit"] },
    Bash: { command: "ls" },
    WebFetch: { url: "https://example.com", prompt: "read" },
    Task: { prompt: "delegate" },
    MultiEdit: { file_path: editable, edits: [] },
  };

  // Every path, write and check boundary is open for this node, so only the
  // role's tool list decides.
  const openNode = (role: string) => ({
    v: 1,
    runId: RUN,
    nodes: {
      node: {
        role,
        read: [REPO],
        write: [{ root: REPO, globs: ["**"] }],
        check: REPO_CHECK,
      },
    },
  });

  // The reason the policy gives for each tool it grants.
  const grantReason: Record<string, string> = {
    Read: "allowed root",
    Grep: "allowed root",
    Glob: "allowed root",
    TodoWrite: "planning",
    Write: "assigned path",
    Edit: "assigned path",
    NotebookEdit: "assigned path",
    [CHECK_TOOL]: "qualified check executor",
  };

  const cases = Object.entries(expectedTools).flatMap(([role, tools]) =>
    Object.keys(toolInputs).map((tool) => ({
      role,
      tool,
      granted: tools.includes(tool),
    })),
  );

  it.each(cases)(
    "$role using $tool is granted: $granted",
    ({ role, tool, granted }) => {
      const result = decideFor("node", tool, toolInputs[tool], {
        context: openNode(role),
      });
      expect(result).toEqual(
        granted
          ? { decision: "allow", reason: grantReason[tool] }
          : deny(`${role} may not use ${tool}`),
      );
    },
  );
});

describe("decide: check executor tool", () => {
  it("allows the check tool for a node with a check workspace", () => {
    expect(
      decideFor("micaiah", CHECK_TOOL, { command: ["bun", "test"] }),
    ).toEqual({
      decision: "allow",
      reason: "qualified check executor",
    });
  });

  it("denies the check tool for a node without a check workspace", () => {
    expect(decideFor("luke", CHECK_TOOL, { command: ["bun", "test"] })).toEqual(
      deny("luke has no check workspace"),
    );
  });

  it("denies the check tool to Samson even with a check workspace", () => {
    const context = runContext();
    (context.nodes.scope as Record<string, unknown>).check = REPO_CHECK;
    expect(
      decideFor("scope", CHECK_TOOL, { command: ["bun", "test"] }, { context }),
    ).toEqual(deny(`samson may not use ${CHECK_TOOL}`));
  });

  it("denies an MCP tool that is not the check tool", () => {
    expect(
      decideFor("micaiah", "mcp__github__create_pull_request", {}),
    ).toEqual(deny("micaiah may not use mcp__github__create_pull_request"));
  });
});

describe("decide: planning", () => {
  it("allows TodoWrite without a path or working directory", () => {
    expect(
      decideFor("scope", "TodoWrite", { todos: [] }, { cwd: null }),
    ).toEqual({ decision: "allow", reason: "planning" });
  });
});

describe("decide: read roots", () => {
  it("allows a read inside one of the node's read roots", () => {
    expect(
      decideFor("build", "Read", { file_path: `${REPO}/apps/admin/page.tsx` }),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("allows a read of a second read root", () => {
    expect(
      decideFor("build", "Read", {
        file_path: `${MATERIALS}/bezalel/request.md`,
      }),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("allows a search rooted exactly at a read root", () => {
    expect(
      decideFor("micaiah", "Grep", { pattern: "export", path: VIEW }),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("denies a read outside every read root", () => {
    expect(decideFor("build", "Read", { file_path: CONTROL_FILE })).toEqual(
      deny(`bezalel may not read ${CONTROL_FILE}`),
    );
  });

  it("denies another role's materials", () => {
    expect(
      decideFor("build", "Read", {
        file_path: `${MATERIALS}/micaiah/request.md`,
      }),
    ).toEqual(deny(`bezalel may not read ${MATERIALS}/micaiah/request.md`));
  });

  it("denies a sibling directory that only shares the root's name prefix", () => {
    expect(
      decideFor("build", "Read", { file_path: `${REPO}-evil/a.ts` }),
    ).toEqual(deny(`bezalel may not read ${REPO}-evil/a.ts`));
  });

  it("allows a root recorded with a trailing slash", () => {
    const context = runContext();
    context.nodes.luke.read = [`${VIEW}/`];
    expect(
      decideFor("luke", "Read", { file_path: `${VIEW}/src/a.ts` }, { context }),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("does not let write roots grant reads", () => {
    const context = runContext();
    context.nodes.define.read = [`${MATERIALS}/ezra`];
    expect(
      decideFor(
        "define",
        "Read",
        { file_path: `${REPO}/tests/unit/donations.test.ts` },
        { context },
      ),
    ).toEqual(deny(`ezra may not read ${REPO}/tests/unit/donations.test.ts`));
  });

  it("resolves a relative path against the working directory", () => {
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: "apps/admin/page.tsx" },
        {
          cwd: REPO,
        },
      ),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("denies a relative path that climbs out of the read root", () => {
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: "../../../control/core-factory.json" },
        { cwd: REPO },
      ),
    ).toEqual(deny(`bezalel may not read ${CONTROL_FILE}`));
  });

  it("searches the working directory when Glob has no path", () => {
    expect(
      decideFor("build", "Glob", { pattern: "**/*.ts" }, { cwd: REPO }),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("denies a pathless search from a working directory outside the roots", () => {
    expect(
      decideFor(
        "build",
        "Grep",
        { pattern: "secret" },
        {
          cwd: "/srv/core-factory/control",
        },
      ),
    ).toEqual(deny("bezalel may not read /srv/core-factory/control"));
  });

  it("denies a pathless search without an absolute working directory", () => {
    expect(
      decideFor("build", "Glob", { pattern: "**/*.ts" }, { cwd: "repo" }),
    ).toEqual(deny("No working directory"));
  });

  it("allows an absolute read when the hook reports no working directory", () => {
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: `${REPO}/apps/admin/page.tsx` },
        { cwd: null },
      ),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("denies a read whose path does not resolve", () => {
    expect(
      decideFor("build", "Read", { file_path: `${REPO}/missing.ts` }),
    ).toEqual(deny("Path does not resolve"));
  });

  it("denies a search whose path does not resolve, even inside a read root", () => {
    expect(
      decideFor("build", "Grep", {
        pattern: "donation",
        path: `${REPO}/missing-dir`,
      }),
    ).toEqual(deny("Path does not resolve"));
  });

  it("denies a path containing a NUL byte", () => {
    expect(
      decideFor("build", "Read", { file_path: `${REPO}/apps\0/page.tsx` }),
    ).toEqual(deny("Malformed path"));
  });

  // Tool input is model-controlled; a throw here would crash the hook, and a
  // crashed hook does not block the call.
  it.each([[42], [null], [{ path: "a" }], [["a"]]])(
    "denies the non-string path argument %j rather than throwing",
    (filePath) => {
      expect(decideFor("build", "Read", { file_path: filePath })).toEqual(
        deny("Malformed path"),
      );
    },
  );
});

describe("decide: symlinks", () => {
  it("denies an in-root symlink whose target is outside the roots", () => {
    const realpath = realpathOver(EXISTING, {
      [`${REPO}/apps/config.json`]: CONTROL_FILE,
    });
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: `${REPO}/apps/config.json` },
        {
          realpath,
        },
      ),
    ).toEqual(deny(`bezalel may not read ${CONTROL_FILE}`));
  });

  it("denies a path through an in-root directory symlink that escapes", () => {
    const realpath = realpathOver(EXISTING, {
      [`${REPO}/control`]: "/srv/core-factory/control",
    });
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: `${REPO}/control/core-factory.json` },
        { realpath },
      ),
    ).toEqual(deny(`bezalel may not read ${CONTROL_FILE}`));
  });

  it("allows an out-of-root path that resolves into a read root", () => {
    const realpath = realpathOver(EXISTING, {
      "/srv/shortcut": `${REPO}/apps`,
    });
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: "/srv/shortcut/admin/page.tsx" },
        {
          realpath,
        },
      ),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("denies a write through an in-root symlink to a non-writable file", () => {
    const realpath = realpathOver(EXISTING, {
      [`${REPO}/packages/api/src/linked.ts`]: `${REPO}/apps/admin/page.tsx`,
    });
    expect(
      decideFor(
        "build",
        "Edit",
        {
          file_path: `${REPO}/packages/api/src/linked.ts`,
          old_string: "a",
          new_string: "b",
        },
        { realpath },
      ),
    ).toEqual(deny(`bezalel may not write ${REPO}/apps/admin/page.tsx`));
  });
});

describe("decide: Git metadata", () => {
  it("denies reading the repository's .git directory contents", () => {
    expect(
      decideFor("build", "Read", { file_path: `${REPO}/.git/config` }),
    ).toEqual(deny("Git metadata is factory-owned"));
  });

  it("denies searching the .git directory itself", () => {
    expect(
      decideFor("build", "Grep", { pattern: "url", path: `${REPO}/.git` }),
    ).toEqual(deny("Git metadata is factory-owned"));
  });

  it("denies a nested .git path segment", () => {
    expect(
      decideFor("build", "Read", { file_path: `${REPO}/sub/.git/HEAD` }),
    ).toEqual(deny("Git metadata is factory-owned"));
  });

  it("denies a symlink that resolves into .git", () => {
    const realpath = realpathOver(EXISTING, {
      [`${REPO}/apps/notes.txt`]: `${REPO}/.git/config`,
    });
    expect(
      decideFor(
        "build",
        "Read",
        { file_path: `${REPO}/apps/notes.txt` },
        {
          realpath,
        },
      ),
    ).toEqual(deny("Git metadata is factory-owned"));
  });

  it("denies writing Git hooks even under a write-everything glob", () => {
    const context = runContext();
    context.nodes.build.write = [{ root: REPO, globs: ["**"] }];
    context.nodes.build.denyWrite = [];
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: `${REPO}/.git/hooks/pre-commit`, content: "#!/bin/sh\n" },
        { context },
      ),
    ).toEqual(deny("Git metadata is factory-owned"));
  });

  it("still allows files whose names only start with .git", () => {
    expect(
      decideFor("build", "Read", { file_path: `${REPO}/.gitignore` }),
    ).toEqual({
      decision: "allow",
      reason: "allowed root",
    });
  });

  it("still allows the .github directory", () => {
    expect(
      decideFor("build", "Read", {
        file_path: `${REPO}/.github/workflows/ci.yml`,
      }),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });
});

describe("decide: write globs", () => {
  it("allows a write that matches the node's write glob", () => {
    expect(
      decideFor("build", "Write", {
        file_path: `${REPO}/packages/api/src/donations.ts`,
        content: "export {};\n",
      }),
    ).toEqual({ decision: "allow", reason: "assigned path" });
  });

  it("denies a write that matches no write glob", () => {
    expect(
      decideFor("build", "Edit", {
        file_path: `${REPO}/apps/admin/page.tsx`,
        old_string: "a",
        new_string: "b",
      }),
    ).toEqual(deny(`bezalel may not write ${REPO}/apps/admin/page.tsx`));
  });

  it("denies a write that matches both a write glob and a denyWrite glob", () => {
    expect(
      decideFor("build", "Edit", {
        file_path: `${REPO}/packages/api/src/donations.test.ts`,
        old_string: "a",
        new_string: "b",
      }),
    ).toEqual(
      deny(`bezalel may not write ${REPO}/packages/api/src/donations.test.ts`),
    );
  });

  it("ignores denyWrite globs recorded for a different root", () => {
    const context = runContext();
    context.nodes.build.denyWrite = [{ root: "/srv/elsewhere", globs: ["**"] }];
    expect(
      decideFor(
        "build",
        "Write",
        {
          file_path: `${REPO}/packages/api/src/donations.ts`,
          content: "export {};\n",
        },
        { context },
      ),
    ).toEqual({ decision: "allow", reason: "assigned path" });
  });

  it("denies a write that a later denyWrite entry excludes", () => {
    const context = runContext();
    context.nodes.build.denyWrite = [
      { root: "/srv/elsewhere", globs: ["**"] },
      { root: REPO, globs: ["**/*.test.ts"] },
    ];
    expect(
      decideFor(
        "build",
        "Edit",
        {
          file_path: `${REPO}/packages/api/src/donations.test.ts`,
          old_string: "a",
          new_string: "b",
        },
        { context },
      ),
    ).toEqual(
      deny(`bezalel may not write ${REPO}/packages/api/src/donations.test.ts`),
    );
  });

  it("denies a write that matches any one of several denyWrite globs", () => {
    const context = runContext();
    context.nodes.build.denyWrite = [
      { root: REPO, globs: ["tests/unit/**", "packages/**/*.test.ts"] },
    ];
    expect(
      decideFor(
        "build",
        "Edit",
        {
          file_path: `${REPO}/packages/api/src/donations.test.ts`,
          old_string: "a",
          new_string: "b",
        },
        { context },
      ),
    ).toEqual(
      deny(`bezalel may not write ${REPO}/packages/api/src/donations.test.ts`),
    );
  });

  it("allows a write that only a later write root permits", () => {
    const context = runContext();
    context.nodes.build.write = [
      { root: "/srv/elsewhere", globs: ["**"] },
      { root: REPO, globs: ["packages/api/src/**"] },
    ];
    expect(
      decideFor(
        "build",
        "Write",
        {
          file_path: `${REPO}/packages/api/src/donations.ts`,
          content: "export {};\n",
        },
        { context },
      ),
    ).toEqual({ decision: "allow", reason: "assigned path" });
  });

  it("denies a write to a sibling directory that shares the write root's name prefix", () => {
    const context = runContext();
    context.nodes.build.write = [{ root: REPO, globs: ["**"] }];
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: `${REPO}-evil/a.ts`, content: "x" },
        { context },
      ),
    ).toEqual(deny(`bezalel may not write ${REPO}-evil/a.ts`));
  });

  it("denies a write outside the write root even when its glob is **", () => {
    const context = runContext();
    context.nodes.build.write = [{ root: REPO, globs: ["**"] }];
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: CONTROL_FILE, content: "{}" },
        { context },
      ),
    ).toEqual(deny(`bezalel may not write ${CONTROL_FILE}`));
  });

  it("denies a write for a node with no write roots", () => {
    const context = runContext();
    context.nodes.define.write = undefined as never;
    expect(
      decideFor(
        "define",
        "Write",
        {
          file_path: `${REPO}/tests/unit/donations.test.ts`,
          content: "export {};\n",
        },
        { context },
      ),
    ).toEqual(deny(`ezra may not write ${REPO}/tests/unit/donations.test.ts`));
  });

  it("allows Ezra to write the assigned test path", () => {
    expect(
      decideFor("define", "Edit", {
        file_path: `${REPO}/tests/unit/donations.test.ts`,
        old_string: "a",
        new_string: "b",
      }),
    ).toEqual({ decision: "allow", reason: "assigned path" });
  });

  it("denies Ezra writing source outside the test globs", () => {
    expect(
      decideFor("define", "Write", {
        file_path: `${REPO}/packages/api/src/donations.ts`,
        content: "export {};\n",
      }),
    ).toEqual(deny(`ezra may not write ${REPO}/packages/api/src/donations.ts`));
  });

  it("allows creating a new file whose parent resolves inside the write root", () => {
    expect(
      decideFor("build", "Write", {
        file_path: `${REPO}/packages/api/src/refunds.ts`,
        content: "export {};\n",
      }),
    ).toEqual({ decision: "allow", reason: "assigned path" });
  });

  it("denies creating a new file whose parent symlink escapes the write root", () => {
    const context = runContext();
    context.nodes.build.write = [{ root: REPO, globs: ["**"] }];
    const realpath = realpathOver(EXISTING, {
      [`${REPO}/packages/api/out`]: "/srv/core-factory/control",
    });
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: `${REPO}/packages/api/out/probe-write.txt`, content: "x" },
        { context, realpath },
      ),
    ).toEqual(
      deny("bezalel may not write /srv/core-factory/control/probe-write.txt"),
    );
  });

  // realpath fails on a dangling symlink exactly as on a new file, but the
  // Write tool follows the link and creates its target wherever it points.
  it.each([
    ["Git metadata", `${REPO}/.git/hooks/pre-push`],
    ["a path outside every root", "/home/admin/.gitconfig"],
  ])("denies a write through a dangling symlink to %s", (_label, target) => {
    const links = { [`${REPO}/packages/api/src/hook.ts`]: target };
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: `${REPO}/packages/api/src/hook.ts`, content: "x" },
        {
          realpath: realpathOver(EXISTING, links),
          lstat: lstatOver(EXISTING, links),
        },
      ),
    ).toEqual(deny("Write target is a link that does not resolve"));
  });

  it("denies creating a new file when lstat cannot confirm nothing is there", () => {
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: `${REPO}/packages/api/src/refunds.ts`, content: "x" },
        { lstat: null },
      ),
    ).toEqual(deny("Path does not resolve"));
  });

  it("denies creating a new file when lstat fails for a reason other than absence", () => {
    const lstat = () => {
      throw Object.assign(new Error("EACCES"), { code: "EACCES" });
    };
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: `${REPO}/packages/api/src/refunds.ts`, content: "x" },
        { lstat },
      ),
    ).toEqual(deny("Path does not resolve"));
  });

  // Deliberately changed: a Write that creates new directories under a real
  // directory inside the write root is ordinary feature work, not a risk.
  it.each([
    ["one new directory", `${REPO}/packages/api/src/new-dir/refunds.ts`],
    ["several new directories", `${REPO}/packages/api/src/a/b/c/refunds.ts`],
  ])("allows creating a file in %s inside the write root", (_label, file) => {
    expect(
      decideFor("build", "Write", { file_path: file, content: "export {};\n" }),
    ).toEqual({ decision: "allow", reason: "assigned path" });
  });

  it("denies creating new directories outside the write globs", () => {
    expect(
      decideFor("build", "Write", {
        file_path: `${REPO}/apps/admin/new-dir/page.tsx`,
        content: "x",
      }),
    ).toEqual(
      deny(`bezalel may not write ${REPO}/apps/admin/new-dir/page.tsx`),
    );
  });

  it("denies creating new directories under Git metadata", () => {
    const context = runContext();
    context.nodes.build.write = [{ root: REPO, globs: ["**"] }];
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: `${REPO}/.git/new-dir/x`, content: "x" },
        { context },
      ),
    ).toEqual(deny("Git metadata is factory-owned"));
  });

  it("resolves the nearest existing ancestor through its real path", () => {
    const realpath = realpathOver(EXISTING, {
      [`${REPO}/packages/api/src`]: "/srv/core-factory/control",
    });
    const lstat = lstatOver(EXISTING, {
      [`${REPO}/packages/api/src`]: "/srv/core-factory/control",
    });
    expect(
      decideFor(
        "build",
        "Write",
        { file_path: `${REPO}/packages/api/src/new-dir/x.ts`, content: "x" },
        { realpath, lstat },
      ),
    ).toEqual(deny("Parent directory is a link"));
  });

  it("denies creating new directories under an existing file", () => {
    expect(
      decideFor("build", "Write", {
        file_path: `${REPO}/packages/api/src/donations.ts/x/y.ts`,
        content: "x",
      }),
    ).toEqual(deny("Parent directory does not resolve"));
  });

  it("denies creating new directories when lstat cannot confirm what exists", () => {
    expect(
      decideFor(
        "build",
        "Write",
        {
          file_path: `${REPO}/packages/api/src/new-dir/refunds.ts`,
          content: "x",
        },
        { lstat: null },
      ),
    ).toEqual(deny("Path does not resolve"));
  });

  it("allows NotebookEdit on its notebook_path", () => {
    expect(
      decideFor("build", "NotebookEdit", {
        notebook_path: `${REPO}/docs/analysis.ipynb`,
        new_source: "1 + 1",
      }),
    ).toEqual({ decision: "allow", reason: "assigned path" });
  });

  it("denies NotebookEdit that names its file only as file_path", () => {
    expect(
      decideFor("build", "NotebookEdit", {
        file_path: `${REPO}/docs/analysis.ipynb`,
        new_source: "1 + 1",
      }),
    ).toEqual(deny("Write tool without a path"));
  });

  it("denies Write without a file path even from a writable working directory", () => {
    const context = runContext();
    context.nodes.build.write = [{ root: REPO, globs: ["**"] }];
    expect(
      decideFor("build", "Write", { content: "x" }, { context, cwd: REPO }),
    ).toEqual(deny("Write tool without a path"));
  });

  it("denies Edit without a file path", () => {
    expect(
      decideFor("build", "Edit", { old_string: "a", new_string: "b" }),
    ).toEqual(deny("Write tool without a path"));
  });
});

describe("decide: search patterns", () => {
  it("allows a relative Glob pattern", () => {
    expect(
      decideFor("build", "Glob", { pattern: "packages/**/*.ts", path: REPO }),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("denies an absolute Glob pattern", () => {
    expect(
      decideFor("build", "Glob", {
        pattern: "/srv/core-factory/**",
        path: REPO,
      }),
    ).toEqual(deny("Search patterns must be relative without '..'"));
  });

  it("denies a Glob pattern that starts with ..", () => {
    expect(
      decideFor("build", "Glob", { pattern: "../**/*.json", path: REPO }),
    ).toEqual(deny("Search patterns must be relative without '..'"));
  });

  it("denies a Glob pattern with an inner .. segment", () => {
    expect(
      decideFor("build", "Glob", { pattern: "packages/../../*", path: REPO }),
    ).toEqual(deny("Search patterns must be relative without '..'"));
  });

  it("denies any '..' in a glob, including one hidden in braces", () => {
    expect(
      decideFor("build", "Glob", { pattern: "{..,src}/**", path: REPO }),
    ).toEqual(deny("Search patterns must be relative without '..'"));
  });

  it("does not treat a Grep regular expression as a path", () => {
    expect(
      decideFor("build", "Grep", { pattern: "/api/v1/..", path: REPO }),
    ).toEqual({ decision: "allow", reason: "allowed root" });
  });

  it("denies an absolute Grep glob filter", () => {
    expect(
      decideFor("build", "Grep", {
        pattern: "token",
        path: REPO,
        glob: "/etc/*",
      }),
    ).toEqual(deny("Search patterns must be relative without '..'"));
  });

  it("denies a Grep glob filter with a .. segment", () => {
    expect(
      decideFor("build", "Grep", {
        pattern: "token",
        path: REPO,
        glob: "../control/*.json",
      }),
    ).toEqual(deny("Search patterns must be relative without '..'"));
  });
});

describe("globToRegExp", () => {
  it("matches * within one path segment", () => {
    expect(globToRegExp("*.ts").test("donations.ts")).toBe(true);
  });

  it("matches * against zero characters", () => {
    expect(globToRegExp("donations*.ts").test("donations.ts")).toBe(true);
  });

  it("does not match * across a slash", () => {
    expect(globToRegExp("*.ts").test("src/donations.ts")).toBe(false);
  });

  it("matches ** across any number of segments", () => {
    expect(globToRegExp("src/**").test("src/a/b/c.ts")).toBe(true);
  });

  it("matches a bare ** against the empty relative path", () => {
    expect(globToRegExp("**").test("")).toBe(true);
  });

  it("lets a ** that is not followed by a slash cross segments", () => {
    expect(globToRegExp("docs/**.md").test("docs/guides/a.md")).toBe(true);
  });

  it("keeps the character after a ** that is not followed by a slash", () => {
    expect(globToRegExp("docs/**.md").test("docs/guides/amd")).toBe(false);
  });

  it("does not match dir/** against the directory itself", () => {
    expect(globToRegExp("src/**").test("src")).toBe(false);
  });

  it("matches a leading **/ against zero directories", () => {
    expect(globToRegExp("**/*.test.ts").test("a.test.ts")).toBe(true);
  });

  it("matches a leading **/ against nested directories", () => {
    expect(globToRegExp("**/*.test.ts").test("x/y/a.test.ts")).toBe(true);
  });

  it("matches an inner /**/ against zero directories", () => {
    expect(globToRegExp("src/**/x.ts").test("src/x.ts")).toBe(true);
  });

  it("matches an inner /**/ against several directories", () => {
    expect(globToRegExp("src/**/x.ts").test("src/a/b/x.ts")).toBe(true);
  });

  it("does not let **/ match a partial segment name", () => {
    expect(globToRegExp("**/x.ts").test("ax.ts")).toBe(false);
  });

  it("matches ? against exactly one character", () => {
    expect(globToRegExp("a?.ts").test("ab.ts")).toBe(true);
  });

  it("does not match ? against a slash", () => {
    expect(globToRegExp("a?.ts").test("a/.ts")).toBe(false);
  });

  it("does not match ? against two characters", () => {
    expect(globToRegExp("a?.ts").test("abc.ts")).toBe(false);
  });

  it("anchors the end of the path", () => {
    expect(globToRegExp("*.ts").test("page.tsx")).toBe(false);
  });

  it("anchors the start of the path", () => {
    expect(globToRegExp("src/*.ts").test("lib/src/a.ts")).toBe(false);
  });

  it("treats a dot literally", () => {
    expect(globToRegExp("a.ts").test("abts")).toBe(false);
  });

  it.each([
    ["file(1).ts", "file(1).ts"],
    ["[ab].ts", "[ab].ts"],
    ["a+b.ts", "a+b.ts"],
    ["$x^.ts", "$x^.ts"],
    ["{a,b}.ts", "{a,b}.ts"],
    ["a|b.ts", "a|b.ts"],
    ["back\\slash.ts", "back\\slash.ts"],
  ])("matches regex metacharacters in %s literally", (glob, literal) => {
    expect(globToRegExp(glob).test(literal)).toBe(true);
  });

  it.each([
    ["[ab].ts", "a.ts"],
    ["{a,b}.ts", "a.ts"],
    ["a|b.ts", "a"],
    ["a+b.ts", "aab.ts"],
  ])("does not give %s regex meaning against %s", (glob, candidate) => {
    expect(globToRegExp(glob).test(candidate)).toBe(false);
  });
});
