import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PRODUCTION_HOSTS,
  assertStagingEnabled,
  checkDeploymentHealth,
  deployRelease,
  runCli,
  selectReleaseApps,
  stageDeployment,
  verifyLive,
} from "../../../../scripts/release/vercel-release.mjs";
import { EXPECTED_PROJECTS } from "../../../../scripts/verify/vercel-build-controls.mjs";

const sha = "a".repeat(40);
const NO_NETWORK_PRELOAD =
  "data:text/javascript,globalThis.fetch=()=>{throw new Error('network disabled in unit test')}";
const ref = "pnmlrbgjiqzzsthsoikm";
const noSleep = async () => {};
const silent = () => {};

const projectSettings = (app: string, autoAssignCustomDomains = false) => ({
  id: EXPECTED_PROJECTS.find((p) => p.key === app)!.projectId,
  autoAssignCustomDomains,
  link: { productionBranch: "production" },
});

/** A fake Vercel API: every app builds to READY; records what was asked. */
function fakeVercel({ autoAssign = false, finalState = "READY" } = {}) {
  const calls: Array<{ path: string; method: string; body?: unknown }> = [];
  let counter = 0;
  const deployments = new Map<string, Record<string, unknown>>();
  const call = vi.fn(
    async (path: string, method = "GET", body?: Record<string, any>) => {
      calls.push({ path, method, body });
      const project = /\/v9\/projects\/(prj_[A-Za-z0-9]+)/.exec(path)?.[1];
      if (project && method === "GET") {
        const app = EXPECTED_PROJECTS.find((p) => p.projectId === project)!.key;
        return projectSettings(app, autoAssign);
      }
      if (path.startsWith("/v13/deployments?") && method === "POST") {
        const id = `dpl_${++counter}`;
        deployments.set(id, {
          id,
          projectId: body!.project,
          target: body!.target,
          gitSource: {
            type: "github",
            repoId: body!.gitSource.repoId,
            sha: body!.gitSource.sha,
            ref: body!.gitSource.ref,
          },
          readyState: "QUEUED",
          url: `${body!.name}-${counter}.vercel.app`,
        });
        return { id, readyState: "QUEUED" };
      }
      const read = /^\/v13\/deployments\/(dpl_\w+)\?/.exec(path)?.[1];
      if (read) {
        const deployment = deployments.get(read)!;
        deployment.readyState = finalState;
        return deployment;
      }
      if (path.includes("/promote/") || path.includes("/cancel")) return {};
      throw new Error(`unexpected ${method} ${path}`);
    },
  );
  return { call, calls };
}

/** A fake fetch for health routes, keyed by host. */
function fakeHealth(bodies: Record<string, { status: number; body: unknown }>) {
  return vi.fn(async (input: URL | string) => {
    const host = new URL(String(input)).host;
    const answer = bodies[host] ?? bodies["*"];
    return { status: answer.status, json: async () => answer.body } as Response;
  });
}

const healthy = (overrides: Record<string, unknown> = {}) => ({
  status: 200,
  body: {
    status: "ok",
    release: { commit: sha },
    database: { supabaseProjectRef: ref, environment: "disposable" },
    migrations: {},
    ...overrides,
  },
});

describe("release job: Vercel steps", () => {
  it("refuses to deploy while production domains are assigned on deploy", async () => {
    const { call } = fakeVercel({ autoAssign: true });
    await expect(assertStagingEnabled({ call, app: "admin" })).rejects.toThrow(
      /before its health check.*docs\/ops\/release-job\.md, step 3/,
    );
  });

  it("stages a production-target build of the exact SHA on the production branch", async () => {
    const { call, calls } = fakeVercel();
    const staged = await stageDeployment({
      call,
      app: "donor",
      sha,
      sleep: noSleep,
    });
    expect(staged).toMatchObject({ app: "donor", id: "dpl_1" });
    const create = calls.find((c) => c.method === "POST")!;
    expect(create.body).toMatchObject({
      target: "production",
      gitSource: { ref: "production", sha },
      build: { env: { CORE_RELEASE_FORCE_BUILD_SHA: sha } },
    });
    expect(calls.some((c) => c.path.includes("/promote/"))).toBe(false);
  });

  it("stops when a staged build fails, and promotes nothing", async () => {
    const { call, calls } = fakeVercel({ finalState: "ERROR" });
    await expect(
      deployRelease({
        apps: ["admin", "donor"],
        sha,
        projectRef: ref,
        env: {},
        call,
        request: fakeHealth({ "*": healthy() }),
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow(/ended ERROR/);
    expect(calls.some((c) => c.path.includes("/promote/"))).toBe(false);
  });

  it("does not promote any app when one staged deployment's database is behind its build", async () => {
    const { call, calls } = fakeVercel();
    const request = fakeHealth({
      "admin-1.vercel.app": healthy({
        release: { commit: sha, deploymentId: "dpl_1" },
      }),
      "missionary-3.vercel.app": healthy({
        release: { commit: sha, deploymentId: "dpl_3" },
      }),
      "donor-2.vercel.app": {
        status: 503,
        body: {
          status: "behind",
          migrations: { supabase: { state: "behind" } },
        },
      },
    });
    await expect(
      deployRelease({
        apps: ["admin", "donor", "missionary"],
        sha,
        projectRef: ref,
        env: {},
        call,
        request,
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow(/behind this build/);
    expect(calls.filter((c) => c.path.includes("/promote/"))).toHaveLength(0);
  });

  it("promotes every staged deployment only after all pass, then confirms each production domain", async () => {
    const { call, calls } = fakeVercel();
    const request = fakeHealth({
      "admin-1.vercel.app": healthy({
        release: { commit: sha, deploymentId: "dpl_1" },
      }),
      "missionary-2.vercel.app": healthy({
        release: { commit: sha, deploymentId: "dpl_2" },
      }),
      [PRODUCTION_HOSTS.admin]: healthy({
        release: { commit: sha, deploymentId: "dpl_1" },
      }),
      [PRODUCTION_HOSTS.missionary]: healthy({
        release: { commit: sha, deploymentId: "dpl_2" },
      }),
    });
    const staged = await deployRelease({
      apps: ["admin", "missionary"],
      sha,
      projectRef: ref,
      env: { VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET: "bypass" },
      call,
      request,
      sleep: noSleep,
      log: silent,
    });
    expect(staged.map((s) => s.id)).toEqual(["dpl_1", "dpl_2"]);
    const order = calls.map((c) =>
      c.path.includes("/promote/")
        ? "promote"
        : c.method === "POST"
          ? "stage"
          : "read",
    );
    expect(order.lastIndexOf("stage")).toBeLessThan(order.indexOf("promote"));
    expect(calls.filter((c) => c.path.includes("/promote/"))).toHaveLength(2);
    const hosts = request.mock.calls.map(
      ([input]) => new URL(String(input)).host,
    );
    expect(hosts).toContain(PRODUCTION_HOSTS.admin);
    expect(hosts).toContain(PRODUCTION_HOSTS.missionary);
    const adminCheck = request.mock.calls.find(([input]) =>
      String(input).includes("admin-1.vercel.app"),
    )!;
    expect((adminCheck[1] as RequestInit).headers).toEqual({
      "x-vercel-protection-bypass": "bypass",
    });
    // Council round 2, A6f: the route gives its detail only to the bypass
    // header, so the production domain's check sends it too.
    const liveCheck = request.mock.calls.find(([input]) =>
      String(input).includes(PRODUCTION_HOSTS.admin),
    )!;
    expect((liveCheck[1] as RequestInit).headers).toEqual({
      "x-vercel-protection-bypass": "bypass",
    });
  });

  it("stops, and does not promote, when a health route answers without its detail", async () => {
    await expect(
      checkDeploymentHealth({
        url: "https://x.vercel.app",
        bypassSecret: "bypass",
        sha,
        projectRef: ref,
        request: fakeHealth({ "*": { status: 200, body: { status: "ok" } } }),
        sleep: noSleep,
        attempts: 1,
      }),
    ).rejects.toThrow(/without its detail/);
  });

  // Council round 2, A6g: nothing called the single-app steps.
  it.each(["stage", "promote", "verify-live", "anything"])(
    "offers no %s step",
    async (step) => {
      await expect(
        runCli([step, "--app", "admin"], { VERCEL_TOKEN: "token-fixture" }),
      ).rejects.toThrow(
        "Usage: vercel-release.mjs plan|preflight|deploy|check|register-jobs",
      );
    },
  );

  it("rejects a staged deployment that reads another Supabase project or another commit", async () => {
    await expect(
      checkDeploymentHealth({
        url: "https://x.vercel.app",
        sha,
        projectRef: ref,
        request: fakeHealth({
          "*": healthy({
            database: { supabaseProjectRef: "btewedpsxwsjczvmegby" },
          }),
        }),
        sleep: noSleep,
      }),
    ).rejects.toThrow(/reads Supabase project btewedpsxwsjczvmegby/);
    await expect(
      checkDeploymentHealth({
        url: "https://x.vercel.app",
        sha,
        projectRef: ref,
        request: fakeHealth({
          "*": healthy({ release: { commit: "b".repeat(40) } }),
        }),
        sleep: noSleep,
      }),
    ).rejects.toThrow(/different commit/);
  });

  it("retries a cold or erroring health route, then gives up without promoting", async () => {
    const request = fakeHealth({
      "*": {
        status: 503,
        body: { status: "error", error: { code: "PGRST202" } },
      },
    });
    await expect(
      checkDeploymentHealth({
        url: "https://x.vercel.app",
        sha,
        projectRef: ref,
        request,
        sleep: noSleep,
        attempts: 3,
      }),
    ).rejects.toThrow(/PGRST202/);
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("builds only the apps whose files changed since the commit each serves", () => {
    const live = "b".repeat(40);
    const plan = selectReleaseApps({
      liveCommits: { admin: live, donor: live, missionary: null },
      listChangedFiles: () => [
        "apps/admin/app/page.tsx",
        "docs/ops/release-job.md",
      ],
    });
    expect(plan.map((item) => [item.app, item.build])).toEqual([
      ["admin", true],
      ["donor", false],
      ["missionary", true],
    ]);
  });

  it("builds all three apps when buildAll is true regardless of live commits", () => {
    const live = "b".repeat(40);
    const cases: Array<{
      name: string;
      liveCommits: Record<string, string | null | undefined>;
      listChangedFiles: (commit: string) => string[];
    }> = [
      {
        name: "live commits equal to the release commit",
        liveCommits: { admin: sha, donor: sha, missionary: sha },
        listChangedFiles: () => [],
      },
      {
        name: "live commits behind with no app-affecting changes",
        liveCommits: { admin: live, donor: live, missionary: live },
        listChangedFiles: () => ["docs/ops/release-job.md"],
      },
      {
        name: "unknown live commits",
        liveCommits: { admin: null, donor: undefined, missionary: "unknown" },
        listChangedFiles: () => [],
      },
    ];

    for (const testCase of cases) {
      const plan = selectReleaseApps({
        liveCommits: testCase.liveCommits,
        listChangedFiles: testCase.listChangedFiles,
        buildAll: true,
      });
      expect(plan, testCase.name).toEqual([
        {
          app: "admin",
          build: true,
          reason: "release input requested all apps",
        },
        {
          app: "donor",
          build: true,
          reason: "release input requested all apps",
        },
        {
          app: "missionary",
          build: true,
          reason: "release input requested all apps",
        },
      ]);
    }
  });

  it("keeps byte-for-byte existing selectReleaseApps results when buildAll is omitted or false", () => {
    const live = "b".repeat(40);
    const args = {
      liveCommits: { admin: sha, donor: live, missionary: null },
      listChangedFiles: (commit: string) =>
        commit === sha ? [] : ["docs/ops/release-job.md"],
    };
    const withoutFlag = selectReleaseApps(args);
    const withFalse = selectReleaseApps({ ...args, buildAll: false });
    expect(withoutFlag).toEqual([
      { app: "admin", build: false, reason: "already serving this commit" },
      {
        app: "donor",
        build: false,
        reason: "changed files do not affect this Vercel app",
      },
      { app: "missionary", build: true, reason: "live commit unknown" },
    ]);
    expect(withFalse).toEqual(withoutFlag);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("plan CLI reads RELEASE_APPS_MODE=all and writes all three apps to GITHUB_OUTPUT", async () => {
    vi.stubGlobal("fetch", () => {
      throw new Error("network disabled in unit test");
    });
    const dir = mkdtempSync(path.join(os.tmpdir(), "vercel-release-plan-"));
    try {
      const outputFile = path.join(dir, "github-output");
      const logs: string[] = [];
      const request = vi.fn(async () => ({
        status: 200,
        json: async () => ({ observability: { release: { commit: sha } } }),
      }));
      await runCli(
        ["plan"],
        {
          RELEASE_SHA: sha,
          RELEASE_APPS_MODE: "all",
          GITHUB_OUTPUT: outputFile,
        },
        (line: string) => logs.push(line),
        {
          request: request as unknown as typeof fetch,
          listChangedFiles: () => [],
        },
      );
      expect(readFileSync(outputFile, "utf8")).toBe(
        "apps=admin,donor,missionary\n",
      );
      expect(logs).toEqual([
        "admin: build - release input requested all apps",
        "donor: build - release input requested all apps",
        "missionary: build - release input requested all apps",
      ]);

      const subOut = path.join(dir, "sub-output");
      const result = spawnSync(
        process.execPath,
        [
          "--import",
          NO_NETWORK_PRELOAD,
          path.resolve("scripts/release/vercel-release.mjs"),
          "plan",
        ],
        {
          encoding: "utf8",
          env: {
            ...process.env,
            RELEASE_SHA: sha,
            RELEASE_APPS_MODE: "all",
            GITHUB_OUTPUT: subOut,
          },
        },
      );
      expect(result.status).toBe(0);
      expect(readFileSync(subOut, "utf8")).toBe(
        "apps=admin,donor,missionary\n",
      );
      expect(result.stdout).toContain(
        "admin: build - release input requested all apps",
      );
      expect(result.stdout).toContain(
        "donor: build - release input requested all apps",
      );
      expect(result.stdout).toContain(
        "missionary: build - release input requested all apps",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it.each([
    ["absent", undefined],
    ["changed", "changed"],
  ])(
    "plan CLI keeps changed-only behaviour when RELEASE_APPS_MODE is %s",
    async (_label, mode) => {
      vi.stubGlobal("fetch", () => {
        throw new Error("network disabled in unit test");
      });
      const dir = mkdtempSync(path.join(os.tmpdir(), "vercel-release-plan-"));
      try {
        const live = "b".repeat(40);
        const outputFile = path.join(dir, "github-output");
        const logs: string[] = [];
        const liveByHost: Record<string, string> = {
          [PRODUCTION_HOSTS.admin]: live,
          [PRODUCTION_HOSTS.donor]: sha,
          [PRODUCTION_HOSTS.missionary]: live,
        };
        const request = vi.fn(async (input: URL | string) => {
          const host = new URL(String(input)).host;
          return {
            status: 200,
            json: async () => ({
              observability: { release: { commit: liveByHost[host] } },
            }),
          } as Response;
        });
        const env: Record<string, string> = {
          RELEASE_SHA: sha,
          GITHUB_OUTPUT: outputFile,
        };
        if (mode !== undefined) env.RELEASE_APPS_MODE = mode;
        await runCli(["plan"], env, (line: string) => logs.push(line), {
          request: request as unknown as typeof fetch,
          listChangedFiles: (commit: string) =>
            commit === sha
              ? []
              : ["apps/admin/app/page.tsx", "docs/ops/release-job.md"],
        });
        expect(readFileSync(outputFile, "utf8")).toBe("apps=admin\n");
        expect(logs).toEqual([
          "admin: build - changed app file: apps/admin/app/page.tsx",
          "donor: skip - already serving this commit",
          "missionary: skip - changed files do not affect this Vercel app",
        ]);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  it.each(["", " ", "ALL", "admin", "everything"])(
    "plan CLI refuses invalid RELEASE_APPS_MODE %j with exit code 1 and writes no output",
    async (badValue) => {
      vi.stubGlobal("fetch", () => {
        throw new Error("network disabled in unit test");
      });
      const dir = mkdtempSync(path.join(os.tmpdir(), "vercel-release-bad-"));
      try {
        const outputFile = path.join(dir, "github-output");
        const request = vi.fn();
        await expect(
          runCli(
            ["plan"],
            {
              RELEASE_SHA: sha,
              RELEASE_APPS_MODE: badValue,
              GITHUB_OUTPUT: outputFile,
            },
            silent,
            { request: request as unknown as typeof fetch },
          ),
        ).rejects.toThrow(/RELEASE_APPS_MODE/);
        expect(request).not.toHaveBeenCalled();
        expect(existsSync(outputFile)).toBe(false);

        const result = spawnSync(
          process.execPath,
          [
            "--import",
            NO_NETWORK_PRELOAD,
            path.resolve("scripts/release/vercel-release.mjs"),
            "plan",
          ],
          {
            encoding: "utf8",
            env: {
              ...process.env,
              RELEASE_SHA: sha,
              RELEASE_APPS_MODE: badValue,
              GITHUB_OUTPUT: outputFile,
            },
          },
        );
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("RELEASE_APPS_MODE");
        expect(existsSync(outputFile)).toBe(false);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  it("characterises unchanged default selectReleaseApps for non-ancestor commits and shared runtime inputs", () => {
    const live = "b".repeat(40);
    const nonAncestor = selectReleaseApps({
      liveCommits: { admin: live, donor: live, missionary: live },
      listChangedFiles: () => {
        throw new Error("not an ancestor");
      },
    });
    expect(nonAncestor).toEqual([
      { app: "admin", build: true, reason: "live commit is not an ancestor" },
      { app: "donor", build: true, reason: "live commit is not an ancestor" },
      {
        app: "missionary",
        build: true,
        reason: "live commit is not an ancestor",
      },
    ]);

    const sharedInput = selectReleaseApps({
      liveCommits: { admin: live, donor: live, missionary: live },
      listChangedFiles: () => ["packages/api/src/index.ts"],
    });
    expect(sharedInput).toEqual([
      {
        app: "admin",
        build: true,
        reason: "changed shared runtime input: packages/api/src/index.ts",
      },
      {
        app: "donor",
        build: true,
        reason: "changed shared runtime input: packages/api/src/index.ts",
      },
      {
        app: "missionary",
        build: true,
        reason: "changed shared runtime input: packages/api/src/index.ts",
      },
    ]);
  });

  it("verifyLive retries while an old deployment ID answers (even with a different project ref) and succeeds once the new ID answers", async () => {
    let calls = 0;
    const request = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return {
          status: 200,
          json: async () =>
            healthy({
              release: { commit: "b".repeat(40), deploymentId: "dpl_old1" },
              database: {
                supabaseProjectRef: "btewedpsxwsjczvmegby",
                environment: "disposable",
              },
            }).body,
        } as Response;
      }
      if (calls === 2) {
        return {
          status: 200,
          json: async () =>
            healthy({
              release: { commit: sha },
              database: {
                supabaseProjectRef: "btewedpsxwsjczvmegby",
                environment: "disposable",
              },
            }).body,
        } as Response;
      }
      return {
        status: 200,
        json: async () =>
          healthy({
            release: { commit: sha, deploymentId: "dpl_new1" },
          }).body,
      } as Response;
    });

    const body = await verifyLive({
      app: "admin",
      sha,
      projectRef: ref,
      deploymentId: "dpl_new1",
      bypassSecret: "bypass",
      request,
      sleep: noSleep,
      attempts: 5,
    });
    expect(calls).toBe(3);
    expect(body.release.deploymentId).toBe("dpl_new1");
  });

  it("verifyLive fails after the deadline when an old deployment ID keeps answering on the same commit and ref, naming both IDs", async () => {
    const request = fakeHealth({
      "*": healthy({
        release: { commit: sha, deploymentId: "dpl_old1" },
      }),
    });

    await expect(
      verifyLive({
        app: "admin",
        sha,
        projectRef: ref,
        deploymentId: "dpl_new1",
        bypassSecret: "bypass",
        request,
        sleep: noSleep,
        attempts: 3,
      }),
    ).rejects.toThrow(/dpl_new1.*dpl_old1|dpl_old1.*dpl_new1/);
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("verifyLive stops immediately without retrying when the confirmed new deployment ID reads a wrong Supabase project ref", async () => {
    const request = fakeHealth({
      "*": healthy({
        release: { commit: sha, deploymentId: "dpl_new1" },
        database: {
          supabaseProjectRef: "btewedpsxwsjczvmegby",
          environment: "disposable",
        },
      }),
    });

    await expect(
      verifyLive({
        app: "admin",
        sha,
        projectRef: ref,
        deploymentId: "dpl_new1",
        bypassSecret: "bypass",
        request,
        sleep: noSleep,
        attempts: 5,
      }),
    ).rejects.toThrow(/reads Supabase project btewedpsxwsjczvmegby/);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["omitted", undefined],
    ["empty", ""],
    ["whitespace", "   "],
    ["invalid", "not-a-ref"],
  ])(
    "refuses to deploy when RELEASE_SUPABASE_PROJECT_REF is %s",
    async (_label, badRef) => {
      const { call } = fakeVercel();
      await expect(
        deployRelease({
          apps: ["admin"],
          sha,
          projectRef: badRef,
          env: {},
          call,
          request: fakeHealth({ "*": healthy() }),
          sleep: noSleep,
          log: silent,
        }),
      ).rejects.toThrow(/RELEASE_SUPABASE_PROJECT_REF/);
      expect(call).not.toHaveBeenCalled();

      const env: Record<string, string> = {
        RELEASE_APPS: "admin",
        RELEASE_SHA: sha,
        VERCEL_TOKEN: "token-fixture",
      };
      if (badRef !== undefined) env.RELEASE_SUPABASE_PROJECT_REF = badRef;
      await expect(runCli(["deploy"], env, silent)).rejects.toThrow(
        /RELEASE_SUPABASE_PROJECT_REF/,
      );
    },
  );

  it("models forced apps already serving the commit: stages with forceNew and CORE_RELEASE_FORCE_BUILD_SHA, switches production hosts on promote, waits out stale old IDs, and fails if an old ID keeps serving", async () => {
    const plan = selectReleaseApps({
      liveCommits: { admin: sha, donor: sha, missionary: sha },
      listChangedFiles: () => [],
      buildAll: true,
    });
    const apps = plan.filter((item) => item.build).map((item) => item.app);
    expect(apps).toEqual(["admin", "donor", "missionary"]);

    const bypassEnv = {
      VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET: "bypass-admin",
      VERCEL_DONOR_AUTOMATION_BYPASS_SECRET: "bypass-donor",
      VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET: "bypass-missionary",
    };

    // Stateful model: production domains serve old deployment IDs of the same
    // commit until promotion, answer one stale old-ID response during alias
    // propagation, then serve the promoted deployment IDs.
    const { call: baseCall, calls } = fakeVercel();
    const liveIdByHost = new Map<string, string>([
      [PRODUCTION_HOSTS.admin, "dpl_oldAdmin"],
      [PRODUCTION_HOSTS.donor, "dpl_oldDonor"],
      [PRODUCTION_HOSTS.missionary, "dpl_oldMissionary"],
    ]);
    const promotedIdByHost = new Map<string, string>();
    const staleLeftByHost = new Map<string, number>();
    const stagedIdByHost = new Map<string, string>();

    const call = vi.fn(
      async (pathname: string, method = "GET", body?: Record<string, any>) => {
        const res = await baseCall(pathname, method, body);
        if (pathname.startsWith("/v13/deployments?") && method === "POST") {
          const id = (res as { id: string }).id;
          const num = id.slice("dpl_".length);
          stagedIdByHost.set(`${body!.name}-${num}.vercel.app`, id);
        }
        const promoteMatch =
          /^\/v10\/projects\/(prj_[A-Za-z0-9]+)\/promote\/(dpl_\w+)\?/.exec(
            pathname,
          );
        if (promoteMatch && method === "POST") {
          const appKey = EXPECTED_PROJECTS.find(
            (p) => p.projectId === promoteMatch[1],
          )!.key as keyof typeof PRODUCTION_HOSTS;
          const host = PRODUCTION_HOSTS[appKey];
          promotedIdByHost.set(host, promoteMatch[2]!);
          staleLeftByHost.set(host, 1);
        }
        return res;
      },
    );

    const request = vi.fn(async (input: URL | string) => {
      const host = new URL(String(input)).host;
      if (stagedIdByHost.has(host)) {
        return {
          status: 200,
          json: async () =>
            healthy({
              release: { commit: sha, deploymentId: stagedIdByHost.get(host) },
            }).body,
        } as Response;
      }
      const staleLeft = staleLeftByHost.get(host) ?? 0;
      if (staleLeft > 0) {
        staleLeftByHost.set(host, staleLeft - 1);
        return {
          status: 200,
          json: async () =>
            healthy({
              release: { commit: sha, deploymentId: liveIdByHost.get(host) },
              database: {
                supabaseProjectRef: "btewedpsxwsjczvmegby",
                environment: "disposable",
              },
            }).body,
        } as Response;
      }
      const activeId = promotedIdByHost.get(host) ?? liveIdByHost.get(host);
      return {
        status: 200,
        json: async () =>
          healthy({
            release: { commit: sha, deploymentId: activeId },
          }).body,
      } as Response;
    });

    const logs: string[] = [];
    const staged = await deployRelease({
      apps,
      sha,
      projectRef: ref,
      env: bypassEnv,
      call,
      request,
      sleep: noSleep,
      log: (line: string) => logs.push(line),
    });

    expect(staged.map((s) => [s.app, s.id])).toEqual([
      ["admin", "dpl_1"],
      ["donor", "dpl_2"],
      ["missionary", "dpl_3"],
    ]);

    const creates = calls.filter(
      (c) => c.method === "POST" && c.path.startsWith("/v13/deployments?"),
    );
    expect(creates).toHaveLength(3);
    for (const create of creates) {
      expect(create.path).toContain("forceNew=1");
      expect(create.body).toMatchObject({
        target: "production",
        gitSource: { ref: "production", sha },
        build: { env: { CORE_RELEASE_FORCE_BUILD_SHA: sha } },
      });
    }

    const expectedBypassByHost: Record<string, string> = {
      "admin-1.vercel.app": "bypass-admin",
      "donor-2.vercel.app": "bypass-donor",
      "missionary-3.vercel.app": "bypass-missionary",
      [PRODUCTION_HOSTS.admin]: "bypass-admin",
      [PRODUCTION_HOSTS.donor]: "bypass-donor",
      [PRODUCTION_HOSTS.missionary]: "bypass-missionary",
    };
    for (const [host, secret] of Object.entries(expectedBypassByHost)) {
      const checkCall = request.mock.calls.find(
        ([input]) => new URL(String(input)).host === host,
      );
      expect(checkCall, host).toBeDefined();
      expect((checkCall![1] as RequestInit).headers).toEqual({
        "x-vercel-protection-bypass": secret,
      });
    }

    const promotes = calls.filter((c) => c.path.includes("/promote/"));
    expect(promotes.map((c) => c.path)).toEqual([
      expect.stringContaining("/promote/dpl_1?"),
      expect.stringContaining("/promote/dpl_2?"),
      expect.stringContaining("/promote/dpl_3?"),
    ]);

    expect(logs).toContain("admin: staged dpl_1.");
    expect(logs).toContain("donor: staged dpl_2.");
    expect(logs).toContain("missionary: staged dpl_3.");
    expect(logs).toContain("admin: promoted dpl_1 without a rebuild.");
    expect(logs).toContain("donor: promoted dpl_2 without a rebuild.");
    expect(logs).toContain("missionary: promoted dpl_3 without a rebuild.");
    expect(logs).toContain(
      "admin: the production domain serves dpl_1 for this release.",
    );
    expect(logs).toContain(
      "donor: the production domain serves dpl_2 for this release.",
    );
    expect(logs).toContain(
      "missionary: the production domain serves dpl_3 for this release.",
    );

    // If a production host never switches off its old deployment ID (even on the
    // same commit and ref), deployRelease fails instead of reporting success.
    const stuckVercel = fakeVercel();
    const stuckRequest = fakeHealth({
      "admin-1.vercel.app": healthy({
        release: { commit: sha, deploymentId: "dpl_1" },
      }),
      [PRODUCTION_HOSTS.admin]: healthy({
        release: { commit: sha, deploymentId: "dpl_oldAdmin" },
      }),
    });
    await expect(
      deployRelease({
        apps: ["admin"],
        sha,
        projectRef: ref,
        env: bypassEnv,
        call: stuckVercel.call,
        request: stuckRequest,
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow(/dpl_1.*dpl_oldAdmin|dpl_oldAdmin.*dpl_1/);

    // A forced app whose staged deployment reads the wrong Supabase project is not promoted.
    const wrongRefVercel = fakeVercel();
    await expect(
      deployRelease({
        apps,
        sha,
        projectRef: ref,
        env: bypassEnv,
        call: wrongRefVercel.call,
        request: fakeHealth({
          "admin-1.vercel.app": healthy({
            release: { commit: sha, deploymentId: "dpl_1" },
          }),
          "donor-2.vercel.app": healthy({
            release: { commit: sha, deploymentId: "dpl_2" },
            database: { supabaseProjectRef: "btewedpsxwsjczvmegby" },
          }),
          "missionary-3.vercel.app": healthy({
            release: { commit: sha, deploymentId: "dpl_3" },
          }),
        }),
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow(/reads Supabase project btewedpsxwsjczvmegby/);
    expect(
      wrongRefVercel.calls.filter((c) => c.path.includes("/promote/")),
    ).toHaveLength(0);

    // A staged deployment that omits its own deployment ID (e.g. System Environment
    // Variables disabled) is refused before promotion.
    const missingIdVercel = fakeVercel();
    await expect(
      deployRelease({
        apps: ["admin"],
        sha,
        projectRef: ref,
        env: bypassEnv,
        call: missingIdVercel.call,
        request: fakeHealth({
          "admin-1.vercel.app": healthy({
            release: { commit: sha, deploymentId: null },
          }),
        }),
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow(/expected deployment dpl_1, saw unknown/);
    expect(
      missingIdVercel.calls.filter((c) => c.path.includes("/promote/")),
    ).toHaveLength(0);
  });
});
