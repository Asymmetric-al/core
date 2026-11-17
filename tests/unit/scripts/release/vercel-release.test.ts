import { describe, expect, it, vi } from "vitest";

import {
  PRODUCTION_HOSTS,
  assertStagingEnabled,
  checkDeploymentHealth,
  deployRelease,
  selectReleaseApps,
  stageDeployment,
} from "../../../../scripts/release/vercel-release.mjs";
import { EXPECTED_PROJECTS } from "../../../../scripts/verify/vercel-build-controls.mjs";

const sha = "a".repeat(40);
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
      /before its health check/,
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
      "*": healthy(),
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
    const request = fakeHealth({ "*": healthy() });
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
  });

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
});
