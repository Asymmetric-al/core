import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { evaluateEligibility } from "../../../scripts/archon-factory/pack/.shared/eligibility";
import { createAssignment } from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

import type * as FileSystem from "node:fs";

const state = vi.hoisted(() => ({
  config: null as any,
  archon: null as any,
  github: null as any,
  writes: new Map<string, string>(),
  events: [] as string[],
}));

vi.mock("node:fs", async (original) => ({
  ...(await original<typeof FileSystem>()),
  mkdirSync: vi.fn(),
  writeFileSync: (file: string, data: string) =>
    state.writes.set(String(file), String(data)),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/config.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    loadConfig: () => state.config,
    factoryPaths: () => ({
      runs: "/factory/runs",
      mirror: "/factory/mirror.git",
    }),
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/archon.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    createArchon: () => state.archon,
  }),
);
vi.mock("../../../scripts/archon-factory/pack/.shared/github.mjs", () => ({
  createGitHub: () => state.github,
  githubToken: async () => "fixture-token",
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/identity.mjs", () => ({
  serviceNativeIdentity: () => state.events.push("owner"),
  ensureInitialRunIdentity: async () => {
    await Promise.resolve();
    state.events.push("identity");
  },
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/git.mjs", () => ({
  createGit: () => ({ git: async () => ({ code: 1, stdout: "" }) }),
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/runctx.mjs", () => ({
  writeRunContext: vi.fn(),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/select/scripts/intake-logic.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    releaseStaleReservations: async () => [],
    sweepItems: async () => [],
  }),
);

const EXIT = new Error("selector fixture exited");
const MERGE = "2".repeat(40);
let scope: any;
let documents: Map<string, any>;
let issues: Map<number, any>;
let timelines: Map<number, any[]>;
let comments: Map<number, any[]>;
let dependencies: Map<number, any[]>;
let pulls: Map<number, any>;
let openPulls: any[];
let sources: Map<string, string>;
let listing: any[] | null;
let output: string;

function issue(number: number, body = "", extra: Record<string, unknown> = {}) {
  return {
    number,
    body,
    title: `Issue ${number}`,
    state: "open",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-12T00:00:00Z",
    html_url: `https://github.com/Asymmetric-al/core/issues/${number}`,
    labels: [],
    ...extra,
  };
}

function assigned(number: number, extra: Record<string, unknown> = {}) {
  return {
    ...createAssignment({
      issue: number,
      assignmentId: `a${number}-fixture`,
      owner: "conrad",
      profileDigest: "a".repeat(64),
      scopeRevision: "b".repeat(64),
      policyRevision: "c".repeat(64),
      endState: "PR_READY",
      now: "2026-11-12T00:00:00Z",
    }),
    ...extra,
  };
}

function mergedPull(target: number, extra: Record<string, unknown> = {}) {
  const number = 1000 + target;
  return {
    number,
    body: `Closes #${target}`,
    state: "closed",
    merged: true,
    merged_at: "2026-11-11T00:00:00Z",
    merge_commit_sha: MERGE,
    base: { ref: "develop", repo: { full_name: "Asymmetric-al/core" } },
    head: { ref: "feature/fixture", repo: { full_name: "Asymmetric-al/core" } },
    html_url: `https://github.com/Asymmetric-al/core/pull/${number}`,
    ...extra,
  };
}

function linkPull(target: number, pull = mergedPull(target)) {
  pulls.set(pull.number, pull);
  timelines.set(target, [
    {
      event: "cross-referenced",
      source: {
        issue: {
          number: pull.number,
          html_url: pull.html_url,
          pull_request: { merged_at: pull.merged_at },
        },
      },
    },
  ]);
}

beforeEach(() => {
  vi.resetModules();
  state.writes.clear();
  state.events = [];
  state.config = {
    repository: { slug: "Asymmetric-al/core", targetBranch: "develop" },
    github: { executable: "/bin/gh", configDir: "/profiles/gh" },
    git: { executable: "/bin/git" },
    limits: { admittedIssues: 2 },
  };
  scope = {
    v: 1,
    issues: [12, 14],
    owner: "conrad",
    approvedBy: "operator",
    approvedAt: "2026-11-12T00:00:00Z",
    endState: "PR_READY",
    priorities: {},
  };
  documents = new Map([
    [
      "core/factory",
      {
        value: { v: 1, intake: "open", mode: "run", mergeHold: false },
        revision: 1,
      },
    ],
    ["core/scope", { value: scope, revision: 2 }],
    ["core/reservations", { value: { v: 1, areas: {} }, revision: 3 }],
  ]);
  issues = new Map([
    [12, issue(12)],
    [14, issue(14)],
  ]);
  timelines = new Map();
  comments = new Map();
  dependencies = new Map();
  pulls = new Map();
  openPulls = [];
  sources = new Map();
  listing = null;
  output = "";
  state.archon = {
    get: vi.fn(async (name: string) =>
      structuredClone(documents.get(name) ?? { value: null, revision: 0 }),
    ),
    list: vi.fn(async () => {
      state.events.push("list");
      return {
        documents: structuredClone(
          listing ??
            [...documents]
              .filter(([name]) => /^core\/issues\/\d+$/.test(name))
              .map(([name, document]) => ({ name, ...document })),
        ),
      };
    }),
  };
  state.github = {
    issue: vi.fn(async (number: number) => {
      if (!issues.has(number))
        throw Object.assign(new Error("Not found"), { status: 404 });
      return structuredClone(issues.get(number));
    }),
    issueComments: vi.fn(async (number: number) =>
      structuredClone(comments.get(number) ?? []),
    ),
    blockedBy: vi.fn(async (number: number) =>
      structuredClone(dependencies.get(number) ?? []),
    ),
    openPulls: vi.fn(async () => structuredClone(openPulls)),
    paginate: vi.fn(async (route: string) => {
      const target = Number(/issues\/(\d+)\//.exec(route)?.[1]);
      return structuredClone(
        (route.includes("/dependencies/blocked_by")
          ? dependencies
          : timelines
        ).get(target) ?? [],
      );
    }),
    pull: vi.fn(async (number: number) => structuredClone(pulls.get(number))),
    compare: vi.fn(async () => ({
      status: "ahead",
      merge_base_commit: { sha: MERGE },
    })),
    request: vi.fn(async (_method: string, route: string) => {
      const relative = decodeURIComponent(
        route.split("/contents/")[1]?.split("?")[0] ?? "",
      );
      if (!sources.has(relative))
        throw Object.assign(new Error("Not found"), { status: 404 });
      return {
        data: {
          type: "file",
          encoding: "base64",
          sha: "d".repeat(40),
          content: Buffer.from(sources.get(relative)!).toString("base64"),
        },
      };
    }),
  };
  vi.stubEnv("WORKFLOW_ID", "select-observations");
  vi.stubEnv("ARTIFACTS_DIR", "/factory/artifacts");
  vi.spyOn(process, "stdout", "get").mockReturnValue({
    write: (text: string) => {
      output += text;
      return true;
    },
  } as any);
  vi.spyOn(process, "exit").mockImplementation(() => {
    throw EXIT;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

async function facts() {
  await expect(
    import("../../../scripts/archon-factory/pack/select/scripts/facts.ts"),
  ).rejects.toBe(EXIT);
  return JSON.parse(
    state.writes.get("/factory/runs/select-observations/eligibility.json")!,
  );
}

describe("selector admission observations through facts.ts", () => {
  it("awaits native identity before listing or GitHub observations", async () => {
    await facts();
    expect(state.events.slice(0, 3)).toEqual(["owner", "identity", "list"]);
  });

  it("blocks multiline prerequisite lists while leaving unrelated work selectable", async () => {
    issues.set(
      12,
      issue(12, "## Prerequisites\n\n- #50\n- #51\n\n## Outcome\nShip it."),
    );
    issues.set(50, issue(50));
    issues.set(51, issue(51));
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(ledger.input.items["#12"].value.dependencies).toEqual([
      { kind: "implementation", targetId: "#50", requires: "integrated" },
      { kind: "implementation", targetId: "#51", requires: "integrated" },
    ]);
  });

  // Observed on issue #2233 (12 November 2026): the document it asks to edit
  // says "GitHub requires that context" and "remains informational
  // (non-blocking)". Neither sentence declares a prerequisite.
  it("does not read directive words inside ordinary prose as unresolved prerequisites", async () => {
    issues.set(
      12,
      issue(
        12,
        "Follow-up, non-blocking.\n\n- `docs/guides/fixture.md:41-42` lists only one job; it requires three.\n\nDocs only, related cleanup after the rollout.",
      ),
    );
    sources.set(
      "docs/guides/fixture.md",
      "A passing check alone does not prove that GitHub requires that context. The canonical repository\n- On develop, the full job remains informational (non-blocking)\nRun it after the queue is enabled; optional notes are related reading.\n",
    );
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#12", "#14"]);
    expect(ledger.summaries[0].dependencyProblems).toEqual([]);
    expect(ledger.input.items["#12"].value.dependencies).toEqual([]);
  });

  it("still blocks a statement that opens with a prerequisite it cannot resolve", async () => {
    issues.set(12, issue(12, "Requires: the new producer service\n\nShip it."));
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(ledger.summaries[0].dependencyProblems).toContainEqual(
      expect.objectContaining({ code: "unresolved-dependency" }),
    );
  });

  it("still reads a prerequisite stated mid-sentence when it names an issue", async () => {
    issues.set(12, issue(12, "This work depends on #50 landing first."));
    issues.set(50, issue(50));
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(ledger.input.items["#12"].value.dependencies).toEqual([
      { kind: "implementation", targetId: "#50", requires: "integrated" },
    ]);
  });

  it("retains typed dispatch, qualification, release, optional and informational edges", async () => {
    issues.set(
      12,
      issue(
        12,
        "Dispatch prerequisites: #50\nQualification gate (does not gate admission): #51\nRelease gate (blocks admission): #52\nOptional: #53\nInformational: #54",
      ),
    );
    for (const number of [50, 51, 52, 53, 54])
      issues.set(number, issue(number));
    const ledger = await facts();
    expect(ledger.input.items["#12"].value.dependencies).toEqual([
      { kind: "dispatch", targetId: "#50", requires: "dispatch-ready" },
      {
        kind: "qualification",
        targetId: "#51",
        requires: "qualified",
        gatesAdmission: false,
      },
      {
        kind: "release",
        targetId: "#52",
        requires: "released",
        gatesAdmission: true,
      },
      { kind: "optional", targetId: "#53" },
      { kind: "informational", targetId: "#54" },
    ]);
  });

  it("accepts reconciled multiline typed lists without treating their labels as unresolved work", async () => {
    issues.set(
      12,
      issue(
        12,
        "Implementation prerequisites:\n- #50\n\nOptional:\n- #51\n\nQualification gate (does not gate admission):\n- #52\n\nRelease gate (does not gate admission):\n- #53",
      ),
    );
    issues.set(50, issue(50, "", { state: "closed" }));
    linkPull(50);
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#12", "#14"]);
    expect(ledger.input.items["#12"].value.dependencies).toEqual([
      { kind: "implementation", targetId: "#50", requires: "integrated" },
      { kind: "optional", targetId: "#51" },
      {
        kind: "qualification",
        targetId: "#52",
        requires: "qualified",
        gatesAdmission: false,
      },
      {
        kind: "release",
        targetId: "#53",
        requires: "released",
        gatesAdmission: false,
      },
    ]);
  });

  it("loads owning contract dependencies at the configured target", async () => {
    issues.set(
      12,
      issue(12, "Governing specification: `openspec/specs/fixture/spec.md`"),
    );
    sources.set("openspec/specs/fixture/spec.md", "## Prerequisites\n- #50\n");
    issues.set(50, issue(50));
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(state.github.request).toHaveBeenCalledWith(
      "GET",
      expect.stringContaining(
        "/contents/openspec/specs/fixture/spec.md?ref=develop",
      ),
    );
  });

  it("fails closed when native and owning dependency classifications disagree", async () => {
    issues.set(
      12,
      issue(12, "Governing specification: `openspec/specs/fixture/spec.md`"),
    );
    dependencies.set(12, [{ number: 50 }]);
    sources.set("openspec/specs/fixture/spec.md", "Optional: #50");
    issues.set(50, issue(50, "", { state: "closed" }));
    linkPull(50);
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(ledger.input.items["#12"].value.dependenciesReconciled).toBe(false);
  });

  it("does not turn closed status or a closing commit into integration proof", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50, "", { state: "closed" }));
    timelines.set(50, [{ event: "closed", commit_id: MERGE }]);
    expect((await facts()).frontier).toEqual(["#14"]);
  });

  it("does not trust a local MERGED label without live target evidence", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50, "", { state: "closed" }));
    documents.set("core/issues/50", {
      value: assigned(50, { status: "MERGED" }),
      revision: 5,
    });
    expect((await facts()).frontier).toEqual(["#14"]);
  });

  it("rejects an unrelated merged cross-reference", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50, "", { state: "closed" }));
    linkPull(50, mergedPull(50, { body: "Closes #99; discusses #50" }));
    expect((await facts()).frontier).toEqual(["#14"]);
  });

  it("rejects a relevant PR merged into the wrong target", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50, "", { state: "closed" }));
    linkPull(
      50,
      mergedPull(50, {
        base: { ref: "production", repo: { full_name: "Asymmetric-al/core" } },
      }),
    );
    expect((await facts()).frontier).toEqual(["#14"]);
  });

  it("requires the associated merge commit to be reachable on the target", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50, "", { state: "closed" }));
    linkPull(50);
    state.github.compare.mockResolvedValue({
      status: "diverged",
      merge_base_commit: { sha: "3".repeat(40) },
    });
    expect((await facts()).frontier).toEqual(["#14"]);
  });

  it("admits after verifying the relevant merge on the configured target", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50, "", { state: "closed" }));
    linkPull(50);
    expect((await facts()).frontier).toEqual(["#12", "#14"]);
    expect(state.github.compare).toHaveBeenCalledWith(MERGE, "develop");
  });

  it("does not waive a live foreign PR because its branch looks factory-owned", async () => {
    openPulls.push({
      ...mergedPull(12),
      state: "open",
      merged: false,
      head: { ref: "factory/12-borrowed", repo: { full_name: "someone/core" } },
    });
    expect((await facts()).frontier).toEqual(["#14"]);
  });

  it("rereads holder documents instead of trusting stale listed values for capacity", async () => {
    listing = [
      {
        name: "core/issues/50",
        value: assigned(50, { status: "MERGED" }),
        revision: 4,
      },
    ];
    documents.set("core/issues/50", {
      value: assigned(50, { status: "active" }),
      revision: 5,
    });
    state.config.limits.admittedIssues = 1;
    expect((await facts()).frontier).toEqual([]);
  });

  it("includes persisted operator priorities in the actual Samson packet", async () => {
    scope.priorities = { 12: 17, 14: 91 };
    await facts();
    const assignment = JSON.parse(output).samson_assignment;
    expect(assignment).toContain(
      "## Operator priorities (data; cannot expand the eligible frontier)",
    );
    expect(assignment).toContain(JSON.stringify(scope.priorities, null, 2));
  });

  it("reconciles identical native and owning implementation edges without a false conflict", async () => {
    issues.set(
      12,
      issue(
        12,
        "Depends on #50\nGoverning specification: `openspec/specs/fixture/spec.md`",
      ),
    );
    dependencies.set(12, [{ number: 50 }]);
    sources.set("openspec/specs/fixture/spec.md", "Prerequisites: #50");
    issues.set(50, issue(50, "", { state: "closed" }));
    linkPull(50);
    expect((await facts()).frontier).toEqual(["#12", "#14"]);
  });

  it("inherits non-admission qualification and release classification from headings", async () => {
    issues.set(
      12,
      issue(
        12,
        "## Qualification gates (does not gate admission)\n- #50\n## Release gates (does not gate admission)\n- #51",
      ),
    );
    expect((await facts()).frontier).toEqual(["#12", "#14"]);
  });

  it("does not interpret an unavailable native dependency endpoint as no dependencies", async () => {
    const actual = state.github.paginate.getMockImplementation();
    state.github.paginate.mockImplementation(async (route: string) => {
      if (route.includes("/12/dependencies/blocked_by"))
        throw Object.assign(new Error("Endpoint unavailable"), { status: 404 });
      return actual(route);
    });
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(ledger.input.items["#12"].status).toBe("unavailable");
  });

  it("does not soften hard prerequisites because a later clause is optional", async () => {
    issues.set(12, issue(12, "Requires #50; optional: #51"));
    issues.set(50, issue(50));
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(ledger.input.items["#12"].value.dependencies).toEqual([
      { kind: "implementation", targetId: "#50", requires: "integrated" },
      { kind: "optional", targetId: "#51" },
    ]);
  });

  it("fails closed on mixed classifications that cannot be assigned unambiguously", async () => {
    issues.set(12, issue(12, "Requires #50 and optional #51"));
    issues.set(50, issue(50));
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(ledger.input.items["#12"].value.dependenciesReconciled).toBe(false);
  });

  it("does not waive a prerequisite that is explicitly non-optional", async () => {
    issues.set(12, issue(12, "Non-optional prerequisites: #50"));
    issues.set(50, issue(50));
    expect((await facts()).frontier).toEqual(["#14"]);
  });

  it.each(["other/project#51", "https://github.com/other/project/issues/51"])(
    "fails closed on mixed local and foreign hard prerequisites: %s",
    async (foreign) => {
      issues.set(12, issue(12, `Requires #50 and ${foreign}`));
      issues.set(50, issue(50, "", { state: "closed" }));
      linkPull(50);
      const ledger = await facts();
      expect(ledger.frontier).toEqual(["#14"]);
      expect(ledger.input.items["#12"].value.dependenciesReconciled).toBe(
        false,
      );
      expect(ledger.summaries[0].dependencyProblems).toContainEqual(
        expect.objectContaining({
          source: issues.get(12).html_url,
          code: "unresolved-foreign-dependency",
          targetIds: ["other/project#51"],
        }),
      );
    },
  );

  it.each([
    "Optional",
    "Informational",
    "Qualification gate (does not gate admission)",
    "Release gate (does not gate admission)",
  ])(
    "does not make a foreign soft reference an admission gate: %s",
    async (kind) => {
      issues.set(12, issue(12, `${kind}: other/project#51`));
      expect((await facts()).frontier).toEqual(["#12", "#14"]);
      expect(state.github.issue).not.toHaveBeenCalledWith(51);
    },
  );

  it("never substitutes a same-named local file for a foreign owning link", async () => {
    issues.set(
      12,
      issue(
        12,
        "Governing specification: https://github.com/other/project/blob/develop/openspec/specs/fixture/spec.md",
      ),
    );
    sources.set("openspec/specs/fixture/spec.md", "Optional: #50");
    const ledger = await facts();
    expect(ledger.frontier).toEqual(["#14"]);
    expect(ledger.input.items["#12"].value.dependenciesReconciled).toBe(false);
  });
});

async function observe(
  candidateAreas: Record<number, string[]> = {},
  extra: Record<string, unknown> = {},
) {
  const { observeAdmission } =
    await import("../../../scripts/archon-factory/pack/select/scripts/admission-observations.mjs");
  return observeAdmission({
    github: state.github,
    archon: state.archon,
    config: state.config,
    candidateAreas,
    ...extra,
  });
}

describe("fresh admission observation contract", () => {
  it.each([false, true])(
    "uses paginated REST adapter responses without network (native unavailable: %s)",
    async (unavailableNative) => {
      const { createGitHub } = await vi.importActual<Record<string, any>>(
        "../../../scripts/archon-factory/pack/.shared/github.mjs",
      );
      const prefix = "/repos/Asymmetric-al/core";
      const calls: {
        pathname: string;
        ref: string | null;
        method: string;
        version: string;
      }[] = [];
      const unexpected: string[] = [];
      issues.set(50, issue(50, "", { state: "closed" }));
      const pages = new Map<string, { body: unknown; next?: string }>([
        [
          `${prefix}/pulls`,
          { body: [], next: `${prefix}/pulls?state=open&page=2` },
        ],
        [
          `${prefix}/pulls?page=2`,
          {
            body: [
              {
                ...mergedPull(14),
                state: "open",
                merged: false,
                head: { ref: "archon/issue-14-round-1" },
              },
            ],
          },
        ],
        [
          `${prefix}/issues/12/dependencies/blocked_by`,
          {
            body: [],
            next: `${prefix}/issues/12/dependencies/blocked_by?page=2`,
          },
        ],
        [
          `${prefix}/issues/12/dependencies/blocked_by?page=2`,
          { body: [issue(50)] },
        ],
        [
          `${prefix}/issues/12/comments`,
          { body: [], next: `${prefix}/issues/12/comments?page=2` },
        ],
        [
          `${prefix}/issues/12/comments?page=2`,
          {
            body: [
              {
                id: 3,
                body: "Governing contract: openspec/contracts/fixture.md",
                html_url: `${issues.get(12).html_url}#issuecomment-3`,
              },
            ],
          },
        ],
        [
          `${prefix}/issues/50/timeline`,
          { body: [], next: `${prefix}/issues/50/timeline?page=2` },
        ],
        [
          `${prefix}/issues/50/timeline?page=2`,
          {
            body: [
              {
                event: "cross-referenced",
                source: {
                  issue: {
                    number: 1050,
                    html_url: `https://github.com/Asymmetric-al/core/pull/1050`,
                    pull_request: { merged_at: "2026-11-11T00:00:00Z" },
                  },
                },
              },
            ],
          },
        ],
        [`${prefix}/pulls/1050`, { body: mergedPull(50) }],
        [
          `${prefix}/compare/${MERGE}...develop`,
          { body: { status: "ahead", merge_base_commit: { sha: MERGE } } },
        ],
        [
          `${prefix}/contents/openspec/contracts/fixture.md`,
          {
            body: {
              type: "file",
              encoding: "base64",
              sha: "d".repeat(40),
              content: Buffer.from("Optional: #51").toString("base64"),
            },
          },
        ],
      ]);
      state.github = createGitHub({
        token: "fixture-token",
        repo: "Asymmetric-al/core",
        retries: 0,
        fetchImpl: async (address: string, options: RequestInit) => {
          const url = new URL(address);
          expect(url.origin).toBe("https://api.github.com");
          const headers = new Headers(options.headers);
          calls.push({
            pathname: url.pathname,
            ref: url.searchParams.get("ref"),
            method: options.method!,
            version: headers.get("x-github-api-version")!,
          });
          if (
            unavailableNative &&
            url.pathname === `${prefix}/issues/12/dependencies/blocked_by`
          )
            return new Response(JSON.stringify({ message: "Not Found" }), {
              status: 404,
            });
          const key = `${url.pathname}${url.searchParams.get("page") === "2" ? "?page=2" : ""}`;
          const page = pages.get(key);
          let body = page?.body;
          if (!page) {
            const match = new RegExp(
              `^${prefix}/issues/(\\d+)(/(?:comments|dependencies/blocked_by))?$`,
            ).exec(url.pathname);
            if (match && issues.has(Number(match[1])))
              body = match[2] ? [] : issues.get(Number(match[1]));
            else unexpected.push(key);
          }
          return new Response(JSON.stringify(body ?? []), {
            status: 200,
            headers: page?.next
              ? { link: `<https://api.github.com${page.next}>; rel="next"` }
              : {},
          });
        },
      });
      const fresh = await observe();
      expect(
        evaluateEligibility(fresh.input as any).eligible.map((item) => item.id),
      ).toEqual(unavailableNative ? [] : ["#12"]);
      expect(fresh.input.items["#12"].status).toBe(
        unavailableNative ? "unavailable" : "found",
      );
      expect(fresh.input.items["#14"].value.admission.owner).toBe("conflict");
      expect(
        calls.every(
          (call) => call.method === "GET" && call.version === "2022-11-28",
        ),
      ).toBe(true);
      expect(unexpected).toEqual([]);
      if (!unavailableNative) {
        expect(fresh.input.items["#50"].value.evidence).toContainEqual(
          expect.objectContaining({
            condition: "integrated",
            source: "https://github.com/Asymmetric-al/core/pull/1050",
            revision: MERGE,
          }),
        );
        expect(calls).toContainEqual(
          expect.objectContaining({
            pathname: `${prefix}/contents/openspec/contracts/fixture.md`,
            ref: "develop",
          }),
        );
      }
    },
  );

  it("rechecks live PR and dependency changes between ranking and final admission", async () => {
    const ranked = await observe();
    expect(
      evaluateEligibility(ranked.input as any).eligible.map((item) => item.id),
    ).toEqual(["#12", "#14"]);
    issues.set(12, issue(12, "Prerequisites:\n- #50"));
    issues.set(50, issue(50));
    openPulls.push({ ...mergedPull(14), state: "open", merged: false });
    const fresh = await observe();
    expect(evaluateEligibility(fresh.input as any).eligible).toEqual([]);
    expect(fresh.input.items["#12"].value.contextRevision).not.toBe(
      ranked.input.items["#12"].value.contextRevision,
    );
    expect(state.github.openPulls).toHaveBeenCalledTimes(2);
  });

  it("rereads reservation-only holders and current capacity without writes", async () => {
    const ranked = await observe({ 12: ["shared-ui"] });
    expect(ranked.capacity).toBe(2);
    documents.set("core/reservations", {
      value: { v: 1, areas: { "shared-ui": 50 } },
      revision: 4,
    });
    documents.set("core/issues/50", {
      value: assigned(50, { status: "waiting", control: "hold" }),
      revision: 5,
    });
    listing = [];
    const fresh = await observe({ 12: ["shared-ui"] });
    expect(fresh.capacity).toBe(1);
    expect(fresh.reservationDocument.revision).toBe(4);
    expect(fresh.items.get(50)?.revision).toBe(5);
    expect(fresh.input.items["#12"].value.admission.sharedArea).toBe(
      "conflict",
    );
    expect(
      evaluateEligibility(fresh.input as any).eligible.map((item) => item.id),
    ).toEqual(["#14"]);
    expect(state.writes.size).toBe(0);
  });

  it("retains capacity for a terminal holder with a live execution lease", async () => {
    documents.set("core/issues/50", {
      value: assigned(50, { status: "BLOCKED" }),
      revision: 5,
      lease: { live: true },
    });
    state.config.limits.admittedIssues = 1;
    const fresh = await observe();
    expect(fresh.capacity).toBe(0);
    expect(evaluateEligibility(fresh.input as any).eligible).toEqual([]);
  });

  it("fails closed on missing reservation holders and failed open-PR reads", async () => {
    documents.set("core/reservations", {
      value: { v: 1, areas: { migrations: 50 } },
      revision: 4,
    });
    state.github.openPulls.mockRejectedValue(new Error("Unavailable"));
    const fresh = await observe();
    expect(fresh.input.items["#12"].value.admission).toMatchObject({
      owner: "unavailable",
      resources: "unavailable",
      sharedArea: "unavailable",
    });
    expect(evaluateEligibility(fresh.input as any).eligible).toEqual([]);
  });

  it("binds comments and complete owning source content to the context revision", async () => {
    issues.set(
      12,
      issue(12, "Governing specification: `openspec/specs/fixture/spec.md`"),
    );
    sources.set("openspec/specs/fixture/spec.md", "Optional: #50");
    const ranked = await observe();
    comments.set(12, [
      {
        id: 1,
        body: "Accepted amendment: requires #51",
        html_url:
          "https://github.com/Asymmetric-al/core/issues/12#issuecomment-1",
      },
    ]);
    sources.set(
      "openspec/specs/fixture/spec.md",
      "Optional: #50\nPrerequisites: #52",
    );
    issues.set(51, issue(51));
    issues.set(52, issue(52));
    const fresh = await observe();
    expect(fresh.input.items["#12"].value.contextRevision).not.toBe(
      ranked.input.items["#12"].value.contextRevision,
    );
    expect(
      evaluateEligibility(fresh.input as any).eligible.map((item) => item.id),
    ).toEqual(["#14"]);
    expect(
      fresh.summaries
        .find((item) => item.id === "#12")
        ?.dependencySources.map((edge) => edge.source),
    ).toContain(
      "https://github.com/Asymmetric-al/core/issues/12#issuecomment-1",
    );
  });

  it("keeps missing prerequisites distinct from failed prerequisite reads", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    const missing = await observe();
    expect(missing.input.items["#50"].status).toBe("missing");
    const original = state.github.issue.getMockImplementation();
    state.github.issue.mockImplementation(async (target: number) => {
      if (target === 50) throw new Error("API unavailable");
      return original(target);
    });
    const unavailable = await observe();
    expect(unavailable.input.items["#50"].status).toBe("unavailable");
    expect(
      evaluateEligibility(unavailable.input as any).eligible.map(
        (item) => item.id,
      ),
    ).toEqual(["#14"]);
  });

  it("fails closed for unresolved owning text without blocking independent work", async () => {
    issues.set(
      12,
      issue(12, "Governing specification: `openspec/specs/fixture/spec.md`"),
    );
    sources.set(
      "openspec/specs/fixture/spec.md",
      "## Prerequisites\n- Phase 28 producer qualification",
    );
    const fresh = await observe();
    expect(fresh.input.items["#12"].value.dependenciesReconciled).toBe(false);
    expect(
      evaluateEligibility(fresh.input as any).eligible.map((item) => item.id),
    ).toEqual(["#14"]);
    expect(fresh.summaries[0].dependencyProblems).toContainEqual(
      expect.objectContaining({
        code: "unresolved-dependency",
        source: expect.stringContaining("/blob/develop/"),
      }),
    );
  });

  it("does not substitute merged implementation for a dispatch qualification", async () => {
    issues.set(12, issue(12, "Dispatch prerequisites: #50"));
    issues.set(50, issue(50, "", { state: "closed" }));
    linkPull(50);
    expect(
      evaluateEligibility((await observe()).input as any).eligible.map(
        (item) => item.id,
      ),
    ).toEqual(["#14"]);
  });

  it("blocks a hard cycle between authorized issues", async () => {
    issues.set(12, issue(12, "Depends on #14"));
    issues.set(14, issue(14, "Depends on #12"));
    const result = evaluateEligibility((await observe()).input as any);
    expect(result.eligible).toEqual([]);
    expect(result.blocked[0]?.reasons).toContainEqual(
      expect.objectContaining({ code: "cyclic-dependency" }),
    );
  });

  it("blocks on an unmerged prerequisite outside the scope whatever its own text says", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50, "Depends on #12"));
    const result = evaluateEligibility((await observe()).input as any);
    expect(result.eligible.map((item) => item.id)).toEqual(["#14"]);
    expect(result.blocked[0]?.reasons).toEqual([
      { issueId: "#12", code: "unsatisfied-dependency", dependencyId: "#50" },
    ]);
  });

  // A prerequisite is often named by its pull request ("Depends on #1050").
  it("settles a prerequisite named by its pull request once that pull request is merged", async () => {
    issues.set(12, issue(12, "Depends on #1050"));
    issues.set(1050, {
      ...issue(1050, "", { state: "closed" }),
      pull_request: { merged_at: "2026-11-11T00:00:00Z" },
    });
    pulls.set(1050, mergedPull(50, { body: "Refs #50" }));
    const fresh = await observe();
    expect(fresh.input.items["#1050"].status).toBe("found");
    expect(
      evaluateEligibility(fresh.input as any)
        .eligible.map((item) => item.id)
        .sort(),
    ).toEqual(["#12", "#14"]);
  });

  it("keeps a prerequisite named by its pull request blocked until that pull request is merged", async () => {
    issues.set(12, issue(12, "Depends on #1050"));
    issues.set(1050, {
      ...issue(1050),
      pull_request: { merged_at: null },
    });
    pulls.set(
      1050,
      mergedPull(50, { state: "open", merged: false, merged_at: null }),
    );
    const result = evaluateEligibility((await observe()).input as any);
    expect(result.eligible.map((item) => item.id)).toEqual(["#14"]);
    expect(result.blocked[0]?.reasons).toEqual([
      { issueId: "#12", code: "unsatisfied-dependency", dependencyId: "#1050" },
    ]);
  });

  it("does not accept a pull request merged into another branch", async () => {
    issues.set(12, issue(12, "Depends on #1050"));
    issues.set(1050, {
      ...issue(1050, "", { state: "closed" }),
      pull_request: { merged_at: "2026-11-11T00:00:00Z" },
    });
    pulls.set(
      1050,
      mergedPull(50, {
        base: { ref: "production", repo: { full_name: "Asymmetric-al/core" } },
      }),
    );
    const result = evaluateEligibility((await observe()).input as any);
    expect(result.eligible.map((item) => item.id)).toEqual(["#14"]);
  });

  it("keeps a prerequisite blocked while its pull request is green but not merged", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50));
    linkPull(
      50,
      mergedPull(50, { state: "open", merged: false, merged_at: null }),
    );
    const result = evaluateEligibility((await observe()).input as any);
    expect(result.eligible.map((item) => item.id)).toEqual(["#14"]);
  });

  it("reads incorporated contract files and blocks when one is unavailable", async () => {
    issues.set(
      12,
      issue(12, "Governing specification: `openspec/specs/fixture/spec.md`"),
    );
    sources.set(
      "openspec/specs/fixture/spec.md",
      "Binding contract: openspec/contracts/fixture.md#all-scenarios",
    );
    const fresh = await observe();
    expect(
      evaluateEligibility(fresh.input as any).eligible.map((item) => item.id),
    ).toEqual(["#14"]);
    expect(fresh.summaries[0].dependencyProblems).toContainEqual(
      expect.objectContaining({
        code: "governing-source-unavailable",
        source: expect.stringContaining("openspec/contracts/fixture.md"),
      }),
    );
  });

  it("does not replace a foreign incorporated contract with a same-named local file", async () => {
    issues.set(
      12,
      issue(12, "Governing specification: `openspec/specs/fixture/spec.md`"),
    );
    sources.set(
      "openspec/specs/fixture/spec.md",
      "Binding contract: https://github.com/other/project/blob/develop/openspec/contracts/fixture.md",
    );
    sources.set("openspec/contracts/fixture.md", "No dependencies");
    const fresh = await observe();
    expect(
      evaluateEligibility(fresh.input as any).eligible.map((item) => item.id),
    ).toEqual(["#14"]);
    expect(fresh.summaries[0].dependencyProblems).toContainEqual(
      expect.objectContaining({
        code: "foreign-or-unresolved-governing-source",
      }),
    );
    expect(state.github.request).not.toHaveBeenCalledWith(
      "GET",
      expect.stringContaining("/contents/openspec/contracts/fixture.md"),
    );
  });
});

describe("bounded admission observation", () => {
  it("treats a prerequisite merged on the target as settled and does not walk its history", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(
      50,
      issue(50, "Depends on #60\nDepends on #61\nRequires the producer", {
        state: "closed",
      }),
    );
    linkPull(50);
    const fresh = await observe();
    expect(
      evaluateEligibility(fresh.input as any).eligible.map((item) => item.id),
    ).toEqual(["#12", "#14"]);
    expect(fresh.input.items["#50"].value.evidence).toContainEqual(
      expect.objectContaining({ condition: "integrated", revision: MERGE }),
    );
    expect(fresh.input.items["#60"]).toBeUndefined();
    expect(state.github.issue).not.toHaveBeenCalledWith(60);
    expect(state.github.issueComments).not.toHaveBeenCalledWith(50);
  });

  it("observes an unmerged direct prerequisite and nothing beyond it", async () => {
    issues.set(12, issue(12, "Depends on #50"));
    issues.set(50, issue(50, "Depends on #60", { state: "closed" }));
    issues.set(60, issue(60, "Depends on #61"));
    const fresh = await observe();
    expect(fresh.input.items["#50"].value.dependencies).toEqual([]);
    expect(fresh.input.items["#60"]).toBeUndefined();
    expect(state.github.issue).not.toHaveBeenCalledWith(60);
    expect(state.github.issueComments).not.toHaveBeenCalledWith(50);
    const result = evaluateEligibility(fresh.input as any);
    expect(result.eligible.map((item) => item.id)).toEqual(["#14"]);
    // The one reason is the real one; nothing unread is reported unavailable.
    expect(result.blocked[0]?.reasons).toEqual([
      { issueId: "#12", code: "unsatisfied-dependency", dependencyId: "#50" },
    ]);
  });

  it("does not read the factory's own comments as dependency statements", async () => {
    comments.set(12, [
      {
        id: 9,
        body: "The factory stopped. Requires the owner. Blocked by #50.\n\n<!-- core-factory -->",
      },
    ]);
    const fresh = await observe();
    expect(fresh.input.items["#12"].value.dependencies).toEqual([]);
    expect(fresh.input.items["#12"].value.dependenciesReconciled).toBe(true);
  });

  it("reads a governing file once however many issues cite it", async () => {
    issues.set(12, issue(12, "Governing source: docs/shared.md"));
    issues.set(14, issue(14, "Governing source: docs/shared.md"));
    sources.set("docs/shared.md", "Shared rules.");
    const fresh = await observe();
    expect(
      fresh.summaries.map((item: any) => item.governingSources.length),
    ).toEqual([1, 1]);
    expect(
      state.github.request.mock.calls.filter(([, route]: [string, string]) =>
        route.includes("/contents/docs/shared.md"),
      ),
    ).toHaveLength(1);
  });

  it("stops observing at its time budget without hiding work already observed", async () => {
    let now = 0;
    const original = state.github.issue.getMockImplementation();
    state.github.issue.mockImplementation(async (target: number) => {
      now += 100;
      return original(target);
    });
    const fresh = await observe({}, { budgetMs: 50, clock: () => now });
    expect(fresh.input.items["#12"].status).toBe("found");
    expect(fresh.input.items["#14"].status).toBe("unavailable");
    expect(fresh.budgetExceeded).toBe(true);
    const result = evaluateEligibility(fresh.input as any);
    expect(result.eligible.map((item) => item.id)).toEqual(["#12"]);
    expect(result.blocked[0]?.reasons[0]?.code).toBe("api-unavailable");
  });
});
