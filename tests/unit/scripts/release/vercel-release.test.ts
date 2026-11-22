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
} from "../../../../scripts/release/vercel-release.mjs";
import {
  PROJECT_REF as ref,
  RELEASE_SHA as sha,
  fakeHealth,
  fakeVercel,
  healthy,
  noSleep,
  silent,
} from "./support/vercel-release-fixtures";

const NO_NETWORK_PRELOAD =
  "data:text/javascript,globalThis.fetch=()=>{throw new Error('network disabled in unit test')}";

describe("release job: Vercel steps", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
    ).rejects.toThrow(/without its detail.*not promoted/);
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

  it("plan CLI reads RELEASE_APPS_MODE=all and writes all three apps to GITHUB_OUTPUT without reading live commits", async () => {
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
      expect(request).not.toHaveBeenCalled();
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

  it("distinguishes a non-ancestor live commit from an unreadable git diff, building on both", async () => {
    const ancestorLive = "b".repeat(40);
    const divergedLive = "c".repeat(40);

    const plan = selectReleaseApps({
      liveCommits: {
        admin: ancestorLive,
        donor: divergedLive,
        missionary: ancestorLive,
      },
      isAncestor: (commit: string) => commit === ancestorLive,
      listChangedFiles: () => {
        throw new Error("git diff failed: ENOBUFS");
      },
    });

    expect(plan).toEqual([
      {
        app: "admin",
        build: true,
        reason: "could not read git diff from live commit",
      },
      { app: "donor", build: true, reason: "live commit is not an ancestor" },
      {
        app: "missionary",
        build: true,
        reason: "could not read git diff from live commit",
      },
    ]);

    const dir = mkdtempSync(path.join(os.tmpdir(), "vercel-release-diff-err-"));
    try {
      const outputFile = path.join(dir, "github-output");
      const logs: string[] = [];
      const liveByHost: Record<string, string> = {
        [PRODUCTION_HOSTS.admin]: ancestorLive,
        [PRODUCTION_HOSTS.donor]: divergedLive,
        [PRODUCTION_HOSTS.missionary]: ancestorLive,
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
      await runCli(
        ["plan"],
        { RELEASE_SHA: sha, GITHUB_OUTPUT: outputFile },
        (line: string) => logs.push(line),
        {
          request: request as unknown as typeof fetch,
          isAncestor: (commit: string) => commit === ancestorLive,
          listChangedFiles: () => {
            throw new Error("git diff failed");
          },
        },
      );
      expect(readFileSync(outputFile, "utf8")).toBe(
        "apps=admin,donor,missionary\n",
      );
      expect(logs).toEqual([
        "admin: build - could not read git diff from live commit",
        "donor: build - live commit is not an ancestor",
        "missionary: build - could not read git diff from live commit",
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("plan CLI reads git file lists larger than 1 MiB and non-ASCII paths without misreporting ancestry", async () => {
    vi.stubGlobal("fetch", () => {
      throw new Error("network disabled in unit test");
    });
    const dir = mkdtempSync(
      path.join(os.tmpdir(), "vercel-release-large-plan-"),
    );
    const previousCwd = process.cwd();
    try {
      const gitEnv: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined && !key.startsWith("GIT_")) {
          gitEnv[key] = value;
        }
      }
      gitEnv.GIT_CONFIG_NOSYSTEM = "1";
      gitEnv.GIT_CONFIG_GLOBAL = path.join(dir, "gitconfig");

      const git = (args: string[], input?: string) => {
        const result = spawnSync("git", args, {
          cwd: dir,
          env: gitEnv,
          encoding: "utf8",
          input,
          maxBuffer: 16 * 1024 * 1024,
        });
        if (result.error) throw result.error;
        if (result.status !== 0) {
          throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
        }
        return result.stdout.trim();
      };

      const dataBlock = (content: string) =>
        `data ${Buffer.byteLength(content, "utf8")}\n${content}`;

      const longSegment = "segment-".repeat(16);
      const docsPaths = Array.from(
        { length: 8_000 },
        (_, index) =>
          `docs/large-release/${longSegment}/file-${String(index).padStart(5, "0")}.txt`,
      );
      const adminPath = "apps/admin/app/caf\u00e9-page.tsx";
      const expectedDiffBytes = [...docsPaths, adminPath].reduce(
        (total, filePath) => total + Buffer.byteLength(filePath, "utf8") + 1,
        0,
      );
      expect(expectedDiffBytes).toBeGreaterThan(1024 * 1024);

      git(["init", "-q", "-b", "production"]);
      const streamLines = [
        "blob",
        "mark :1",
        dataBlock("fixture-doc\n"),
        "blob",
        "mark :2",
        dataBlock('export const page = "before";\n'),
        "blob",
        "mark :3",
        dataBlock('export const page = "after";\n'),
        "commit refs/heads/production",
        "mark :10",
        "committer Test <test@example.invalid> 1700000000 +0000",
        dataBlock("live baseline\n"),
        `M 100644 :2 ${adminPath}`,
        ...docsPaths.map((filePath) => `M 100644 :1 ${filePath}`),
        "",
        "commit refs/heads/release",
        "mark :11",
        "committer Test <test@example.invalid> 1700000001 +0000",
        dataBlock("release head\n"),
        "from :10",
        "deleteall",
        `M 100644 :3 ${adminPath}`,
        "",
        "commit refs/heads/diverged",
        "mark :12",
        "committer Test <test@example.invalid> 1700000002 +0000",
        dataBlock("diverged branch\n"),
        "M 100644 :1 docs/diverged.md",
        "",
        "done",
        "",
      ];
      git(["fast-import", "--quiet"], streamLines.join("\n"));

      const liveSha = git(["rev-parse", "refs/heads/production"]);
      const releaseHeadSha = git(["rev-parse", "refs/heads/release"]);
      const divergedSha = git(["rev-parse", "refs/heads/diverged"]);

      const outputFile = path.join(dir, "github-output");
      const logs: string[] = [];
      const liveByHost: Record<string, string> = {
        [PRODUCTION_HOSTS.admin]: liveSha,
        [PRODUCTION_HOSTS.donor]: liveSha,
        [PRODUCTION_HOSTS.missionary]: divergedSha,
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

      process.chdir(dir);
      await runCli(
        ["plan"],
        { RELEASE_SHA: releaseHeadSha, GITHUB_OUTPUT: outputFile },
        (line: string) => logs.push(line),
        { request: request as unknown as typeof fetch },
      );

      expect(readFileSync(outputFile, "utf8")).toBe("apps=admin,missionary\n");
      expect(logs).toEqual([
        `admin: build - changed app file: ${adminPath}`,
        "donor: skip - changed files do not affect this Vercel app",
        "missionary: build - live commit is not an ancestor",
      ]);
    } finally {
      process.chdir(previousCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("plan CLI selects an app when a file is moved out of its directory into docs", async () => {
    vi.stubGlobal("fetch", () => {
      throw new Error("network disabled in unit test");
    });
    const dir = mkdtempSync(
      path.join(os.tmpdir(), "vercel-release-rename-plan-"),
    );
    const previousCwd = process.cwd();
    try {
      const gitEnv: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined && !key.startsWith("GIT_")) {
          gitEnv[key] = value;
        }
      }
      gitEnv.GIT_CONFIG_NOSYSTEM = "1";
      gitEnv.GIT_CONFIG_GLOBAL = path.join(dir, "gitconfig");

      const git = (args: string[], input?: string) => {
        const result = spawnSync("git", args, {
          cwd: dir,
          env: gitEnv,
          encoding: "utf8",
          input,
        });
        if (result.error) throw result.error;
        if (result.status !== 0) {
          throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
        }
        return result.stdout.trim();
      };

      const dataBlock = (content: string) =>
        `data ${Buffer.byteLength(content, "utf8")}\n${content}`;

      git(["init", "-q", "-b", "production"]);
      const streamLines = [
        "blob",
        "mark :1",
        dataBlock(
          "export const movedFixture = 'identical content for rename detection';\n",
        ),
        "commit refs/heads/production",
        "mark :10",
        "committer Test <test@example.invalid> 1700000000 +0000",
        dataBlock("live baseline\n"),
        "M 100644 :1 apps/admin/app/moved-note.ts",
        "",
        "commit refs/heads/release",
        "mark :11",
        "committer Test <test@example.invalid> 1700000001 +0000",
        dataBlock("move file out of admin into docs\n"),
        "from :10",
        "deleteall",
        "M 100644 :1 docs/moved-note.ts",
        "",
        "done",
        "",
      ];
      git(["fast-import", "--quiet"], streamLines.join("\n"));

      const liveSha = git(["rev-parse", "refs/heads/production"]);
      const releaseHeadSha = git(["rev-parse", "refs/heads/release"]);

      const outputFile = path.join(dir, "github-output");
      const logs: string[] = [];
      const request = vi.fn(async () => ({
        status: 200,
        json: async () => ({
          observability: { release: { commit: liveSha } },
        }),
      }));

      process.chdir(dir);
      await runCli(
        ["plan"],
        { RELEASE_SHA: releaseHeadSha, GITHUB_OUTPUT: outputFile },
        (line: string) => logs.push(line),
        { request: request as unknown as typeof fetch },
      );

      expect(readFileSync(outputFile, "utf8")).toBe("apps=admin\n");
      expect(logs).toEqual([
        "admin: build - changed app file: apps/admin/app/moved-note.ts",
        "donor: skip - changed files do not affect this Vercel app",
        "missionary: skip - changed files do not affect this Vercel app",
      ]);
    } finally {
      process.chdir(previousCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
